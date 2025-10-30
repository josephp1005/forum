interface RedditTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface RedditSearchResponse {
    data: {
        children: Array<{
            data: {
                score: number;
                num_comments: number;
                title: string;
                author: string;
                created_utc: number;
                permalink: string; 
                selftext: string;
            };
        }>;
        after?: string;
        before?: string;
    };
}

export const fetchRedditData = async (db, indexId: number, sourceParams: { query: string, access_token: string, access_token_expires_at: string }): Promise<{ metrics: any, posts: any[] }> => {
    const engagementScore = await getRedditEngagement(db, indexId, sourceParams.query, sourceParams.access_token, sourceParams.access_token_expires_at);
    return engagementScore;
}

export const standardizeRedditPosts = async (redditData: any[], sourceParams: any, timeframe: string): Promise<any[]> => {
    const standardizedPosts: any[] = [];
    
    if (!Array.isArray(redditData)) {
        return standardizedPosts;
    }

    // Calculate timeframe cutoff for precise filtering
    const now = new Date();
    let cutoffTime: Date;
    
    const timeMatch = timeframe.match(/^(\d+)([mhd])$/);
    if (!timeMatch) {
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
    } else {
        const [, amount, unit] = timeMatch;
        const multiplier = parseInt(amount);
        
        switch (unit) {
            case 'm':
                cutoffTime = new Date(now.getTime() - multiplier * 60 * 1000);
                break;
            case 'h':
                cutoffTime = new Date(now.getTime() - multiplier * 60 * 60 * 1000);
                break;
            case 'd':
                cutoffTime = new Date(now.getTime() - multiplier * 24 * 60 * 60 * 1000);
                break;
            default:
                cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }

    for (const post of redditData) {
        try {
            // Filter by publication time (convert Unix timestamp to Date)
            const postTime = new Date(post.created_utc * 1000);
            if (postTime < cutoffTime) {
                continue;
            }

            // Prepare metrics
            const metrics = {
                score: post.score || 0,
                comments: post.comments || 0
            };

            standardizedPosts.push({
                type: 'post',
                time: postTime.toISOString(),
                author: post.author || 'Unknown',
                source: 'Reddit',
                has_title: true,
                title: post.title || '',
                body: post.body || '',
                url: post.url || '',
                metrics: metrics,
                picture: sourceParams.picture || null,
                id: 'reddit-' + post.url
            });

        } catch (error) {
            console.error('Error standardizing Reddit post:', error);
            continue;
        }
    }

    return standardizedPosts;
};

const getRedditEngagement = async (db, indexId: number, query: string, access_token: string, access_token_expires_at: string): Promise<{ metrics: any, posts: any[]}> => {
    try {
        let currentToken = access_token;
        const tokenExpiresAt = access_token_expires_at ? new Date(access_token_expires_at) : null;
        const now = new Date();

        if (!currentToken || !tokenExpiresAt || tokenExpiresAt < now) {
            console.log('Reddit access token expired or missing, fetching new one...');
            currentToken = await getNewRedditAccessToken(db, indexId);
        }

        let totalPostCount = 0;
        let totalCommentCount = 0;

        const response = await fetch(`https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=hot&limit=100&t=hour`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'User-Agent': process.env.REDDIT_USER_AGENT || 'Forum-Backend/1.0'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Reddit access token is invalid or expired');
            }
            throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as RedditSearchResponse;

        const postsContent = data.data.children.slice(0, 10).map(post => ({ 
            title: post.data.title,
            url: `https://reddit.com${post.data.permalink}`,
            score: post.data.score,
            comments: post.data.num_comments,
            created_utc: post.data.created_utc,
            author: post.data.author,
            body: post.data.selftext.substring(0, 250)
        }));

        let after = data.data.after;

        data.data.children.forEach(post => {
            totalPostCount += 1;
            totalCommentCount += post.data.num_comments;
        });

        // Paginate through results if more are available
        while (after) {
            const paginatedResponse = await fetch(`https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=hot&limit=100&t=hour&after=${after}`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`,
                    'User-Agent': process.env.REDDIT_USER_AGENT || 'Forum-Backend/1.0'
                }
            });

            if (!paginatedResponse.ok) {
                throw new Error(`Reddit API error during pagination: ${paginatedResponse.status} ${paginatedResponse.statusText}`);
            }

            const paginatedData = await paginatedResponse.json() as RedditSearchResponse;

            paginatedData.data.children.forEach(post => {
                totalPostCount += 1;
                totalCommentCount += post.data.num_comments;
            });

            after = paginatedData.data.after;
        }

        return { metrics: totalPostCount, posts: postsContent };
        
    } catch (error) {
        console.error('Error fetching Reddit engagement:', error);
        throw error;
    }
}

const getNewRedditAccessToken = async (db, indexId: number): Promise<string> => {
    try {
        const clientId = process.env.REDDIT_CLIENT_ID;
        const clientSecret = process.env.REDDIT_CLIENT_SECRET;
        const username = process.env.REDDIT_USERNAME;
        const password = process.env.REDDIT_PASSWORD;

        if (!clientId || !clientSecret || !username || !password) {
            throw new Error('Reddit credentials not configured');
        }

        // Request new access token using password grant type
        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'User-Agent': process.env.REDDIT_USER_AGENT || 'Forum-Backend/1.0'
            },
            body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Reddit token request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const tokenData = await response.json() as RedditTokenResponse;
        const newToken = tokenData.access_token;
        const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

        // Update the database with new token
        await updateTokenInDatabase(db, indexId, newToken, expiresAt);

        return newToken;

    } catch (error) {
        console.error('Error getting new Reddit access token:', error);
        throw error;
    }
};

const updateTokenInDatabase = async (db, indexId: number, accessToken: string, expiresAt: string): Promise<void> => {
    try {
        // First, get the current attention_query_params
        const { data: currentIndex, error: fetchError } = await db
            .from('indices')
            .select('attention_query_params')
            .eq('id', indexId)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch current index: ${fetchError.message}`);
        }

        // Update the reddit section with new token
        const updatedParams = {
            ...currentIndex.attention_query_params,
            reddit: {
                ...currentIndex.attention_query_params.reddit,
                access_token: accessToken,
                access_token_expires_at: expiresAt
            }
        };

        // Save back to database
        const { error: updateError } = await db
            .from('indices')
            .update({ attention_query_params: updatedParams })
            .eq('id', indexId);

        if (updateError) {
            throw new Error(`Failed to update token in database: ${updateError.message}`);
        }

        console.log('Successfully updated Reddit access token in database');

    } catch (error) {
        console.error('Error updating token in database:', error);
        throw error;
    }
};