export const fetchNewsApiData = async (db, indexId: number, sourceParams: { query: string }, newsFetchInterval: number, currTimestamp: string): Promise<any> => {
    return await getNewsArticles(db, indexId, sourceParams.query, newsFetchInterval, currTimestamp);
}

const getNewsArticles = async (db, indexId: number, query: string, newsFetchInterval: number, currTimestamp: string): Promise<any> => {
    try {
        const apiKey = process.env.NEWSAPI_API_KEY;
        const toDate = new Date(currTimestamp);
        const fromDate = new Date(toDate.getTime() - newsFetchInterval * 1000);
        const fromDateISO = fromDate.toISOString();
        const toDateISO = toDate.toISOString();

        console.log("Fetching news articles from", fromDateISO, "to", toDateISO, "for query:", query);

        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${encodeURIComponent(fromDateISO)}&to=${encodeURIComponent(toDateISO)}&language=en&sortBy=popularity&pageSize=5&apiKey=${apiKey}`);

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