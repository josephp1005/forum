export const fetchNewsApiData = async (db, indexId: number, sourceParams: { query: string }, newsFetchInterval: number, currTimestamp: string): Promise<any> => {
    return await getNewsArticles(db, indexId, sourceParams.query, newsFetchInterval, currTimestamp);
}

export const standardizeArticles = async (newsApiData: any, sourceParams: any, timeframe: string): Promise<any[]> => {
    const standardizedArticles: any[] = [];
    
    if (!newsApiData || !newsApiData.articles || !Array.isArray(newsApiData.articles)) {
        return standardizedArticles;
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

    for (const article of newsApiData.articles) {
        try {
            // Filter by publication time
            const articleTime = new Date(article.publishedAt);
            if (articleTime < cutoffTime) {
                continue;
            }

            // Get source name
            const sourceName = article.source?.name || 'Unknown';

            standardizedArticles.push({
                type: 'article',
                time: article.publishedAt,
                author: article.author || 'Unknown',
                source: sourceName,
                has_title: true,
                title: article.title || '',
                body: article.description || '',
                url: article.url || '',
                metrics: null, // Articles don't have engagement metrics
                picture: article.urlToImage || null,// Use article's image, not platform image,
                id: 'newsapi-' + article.url
            });

        } catch (error) {
            console.error('Error standardizing NewsAPI article:', error);
            continue;
        }
    }

    return standardizedArticles;
};

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