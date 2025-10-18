export const fetchXData = async (sourceParams: { query: string}): Promise<number> => {
    const tweetCount = await getTweetCount(sourceParams.query);
    return tweetCount;
}

const getTweetCount = async (query: string): Promise<number> => {
    try {
        const bearerToken = process.env.TWITTER_BEARER_TOKEN;

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - (60 * 60 * 1000));
        const endTimeISO = endTime.toISOString();
        const startTimeISO = startTime.toISOString();

        const baseUrl = 'https://api.twitter.com/2/tweets/counts/recent';
        const url = new URL(baseUrl);
        
        url.searchParams.append('query', query);
        url.searchParams.append('start_time', startTimeISO);
        url.searchParams.append('end_time', endTimeISO);

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
        });

        if (!response.ok) {
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