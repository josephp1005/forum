export const fetchXData = async (sourceParams: { query: string }): Promise<number> => {
    const tweetCount = await getTweetCount(sourceParams.query);
    return tweetCount;
}

export const fetchXPosts = async (sourceParams: { query: string }, newsFetchInterval: number): Promise<any> => {
    const posts = await getRecentPosts(sourceParams.query, newsFetchInterval);
    return posts;
}

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