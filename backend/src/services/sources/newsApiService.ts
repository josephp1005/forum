export const fetchNewsApiData = async (sourceParams: { query: string }, newsFetchFrequency: number, currTimestamp: string): Promise<any> => {
    return await getNewsArticles(sourceParams.query, newsFetchFrequency, currTimestamp);
}

const getNewsArticles = async (query: string, newsFetchFrequency: number, currTimestamp: string): Promise<any> => {
    try {
        const apiKey = process.env.NEWSAPI_API_KEY;
        const toDate = new Date(currTimestamp);
        const fromDate = new Date(toDate.getTime() - newsFetchFrequency * 1000);
        const fromDateISO = fromDate.toISOString();
        const toDateISO = toDate.toISOString();

        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDateISO}&to=${toDateISO}&apiKey=${apiKey}`);

        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching news articles:', error);
        throw error;
    }
}