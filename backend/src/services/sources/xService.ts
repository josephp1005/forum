export const fetchXData = async (sourceParams: { query: string}): Promise<number> => {
    const tweetCount = await getTweetCount(sourceParams.query);
    return tweetCount;
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