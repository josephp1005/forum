export const fetchXData = async (sourceParams: { query: string }): Promise<number> => {
    const tweetCount = await getTweetCount(sourceParams.query);
    return tweetCount;
}

export const fetchXPosts = async (sourceParams: { query: string }, newsFetchInterval: number): Promise<any> => {
    const posts = await getRecentPosts(sourceParams.query, newsFetchInterval);
    return posts;
}

export const standardizeXPosts = async (xData: any, sourceParams: any, timeframe: string): Promise<any[]> => {
    const standardizedPosts: any[] = [];
    
    if (!xData || !xData.data || !Array.isArray(xData.data)) {
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

    // Get user info map for author lookup
    const userMap: { [key: string]: any } = {};
    if (xData.includes && xData.includes.users) {
        for (const user of xData.includes.users) {
            userMap[user.id] = user;
        }
    }

    for (const tweet of xData.data) {
        try {
            // Filter by publication time
            const tweetTime = new Date(tweet.created_at);
            if (tweetTime < cutoffTime) {
                continue;
            }

            // Get author information
            const author = userMap[tweet.author_id];
            const authorName = author ? `@${author.username}` : 'Unknown';

            // Construct Twitter URL
            const tweetUrl = `https://twitter.com/i/status/${tweet.id}`;

            // Prepare metrics
            const metrics = tweet.public_metrics ? {
                likes: tweet.public_metrics.like_count || 0,
                retweets: tweet.public_metrics.retweet_count || 0,
                replies: tweet.public_metrics.reply_count || 0,
                quotes: tweet.public_metrics.quote_count || 0,
                bookmarks: tweet.public_metrics.bookmark_count || 0,
                impressions: tweet.public_metrics.impression_count || 0
            } : null;

            standardizedPosts.push({
                type: 'post',
                time: tweet.created_at,
                author: authorName,
                source: 'X',
                has_title: false,
                title: null,
                body: tweet.text || '',
                url: tweetUrl,
                metrics: metrics,
                picture: sourceParams.picture || null,
                id: 'x-' + tweet.id
            });

        } catch (error) {
            console.error('Error standardizing X post:', error);
            continue;
        }
    }

    return standardizedPosts;
};

const getTweetCount = async (query: string): Promise<number> => {
    try {
        const bearerToken = process.env.TWITTER_BEARER_TOKEN;

        const now = new Date();
        const endTime = new Date(now.getTime() - (10 * 1000));
        const startTime = new Date(now.getTime() - (60 * 60 * 1000) - (10 * 1000));
        const endTimeISO = endTime.toISOString();
        const startTimeISO = startTime.toISOString();

        const url = `https://api.x.com/2/tweets/counts/recent?granularity=hour&query=${encodeURIComponent(query)}&start_time=${encodeURIComponent(startTimeISO)}&end_time=${encodeURIComponent(endTimeISO)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Twitter API error response:', errorBody);
            throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.meta || data.meta.total_tweet_count == null) {
            throw new Error('Tweet count data not available');
        }

        return data.meta.total_tweet_count;

    } catch (error) {
        console.error('Error fetching tweet count:', error);
        throw error;
    }
}

const getRecentPosts = async (query: string, newsFetchInterval: number): Promise<any> => {
    try {
        const bearerToken = process.env.TWITTER_BEARER_TOKEN;

        const now = new Date();
        const toDate = new Date(now.getTime() - (10 * 1000));
        const fromDate = new Date(toDate.getTime() - newsFetchInterval * 1000);
        const fromDateISO = fromDate.toISOString();
        const toDateISO = toDate.toISOString();

        const url = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&start_time=${encodeURIComponent(fromDateISO)}&end_time=${encodeURIComponent(toDateISO)}&max_results=10&sort_order=relevancy&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Twitter API error response:', errorBody);
            throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching recent posts:', error);
        throw error;
    }
}