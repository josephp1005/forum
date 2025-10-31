import { createClient } from '@supabase/supabase-js';
import config from '../config/config.js';
import { fetchYouTubeData } from './sources/youtubeService.js';
import { fetchLastFmData } from './sources/lastFmService.js';
import { fetchSpotifyData } from './sources/spotifyService.js';
import { fetchDeezerData } from './sources/deezerService.js';
import { fetchXData, fetchXPosts, standardizeXPosts } from './sources/xService.js';
import { fetchNewsApiData, standardizeArticles } from './sources/newsApiService.js';
import { fetchRedditData, standardizeRedditPosts } from './sources/redditService.js';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

// New function to fetch index data with timeframe filtering
export const fetchIndexData = async (marketId: number, timeframe: string = '3h') => {
    try {
        // Get the index ID for this market
        const indexId = await getIndexId(marketId);
        
        // Fetch the full index data
        const { data: indexData, error } = await supabase
            .from('indices')
            .select('*')
            .eq('id', indexId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch index data: ${error.message}`);
        }

        // Filter and process the transformed_index data based on timeframe
        const filteredData = filterDataByTimeframe(indexData.transformed_index, timeframe);

        // apply a log scale to the data
        const entries = Object.entries(filteredData) as [string, any][];
        for (const [timestamp, data] of entries) {
            if (data && typeof data.value === 'number') {
                data.value = Math.log(data.value + 1);
            }
        }

        // Calculate metrics for the timeframe
        const metrics = calculateMetrics(filteredData);

        return {
            ...indexData,
            filtered_transformed_index: filteredData,
            metrics,
            timeframe
        };

    } catch (error) {
        console.error('Error fetching index data:', error);
        throw error;
    }
};

// Helper function to filter data by timeframe
const filterDataByTimeframe = (transformedIndex: any, timeframe: string) => {
    if (!transformedIndex) return {};

    const now = new Date();
    let cutoffTime: Date;

    switch (timeframe) {
        case '3h':
            cutoffTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
            break;
        case '24h':
            cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            cutoffTime = new Date(now.getTime() - 3 * 60 * 60 * 1000); // Default to 3h
    }

    const filtered: any = {};
    
    for (const [timestamp, data] of Object.entries(transformedIndex)) {
        const dataTime = new Date(timestamp);
        if (dataTime >= cutoffTime) {
            filtered[timestamp] = data;
        }
    }

    return filtered;
};

// Helper function to calculate metrics from filtered data
const calculateMetrics = (filteredData: any) => {
    const entries = Object.entries(filteredData);
    
    if (entries.length === 0) {
        return {
            current: 0,
            peak: 0,
            change: 0,
            changePercent: 0
        };
    }

    // Sort by timestamp to get chronological order
    entries.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

    const values = entries.map(([, data]: [string, any]) => data.value || 0);
    const current = values[values.length - 1] || 0;
    const peak = Math.max(...values);
    const first = values[0] || 0;
    
    const change = current - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;

    return {
        current,
        peak,
        change,
        changePercent: Number(changePercent.toFixed(2))
    };
};

// New function to fetch narrative data with timeframe filtering
export const fetchNarrativeData = async (marketId: number, timeframe: string = '1d') => {
    try {
        // Get the index ID for this market
        const indexId = await getIndexId(marketId);
        
        // Fetch the index data including raw_news_data and news_query_params
        const { data: indexData, error } = await supabase
            .from('indices')
            .select('raw_news_data, news_query_params')
            .eq('id', indexId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch narrative data: ${error.message}`);
        }

        if (!indexData.raw_news_data || !indexData.news_query_params) {
            return {
                articles: [],
                posts: [],
                timeframe
            };
        }

        // Filter raw news data by timeframe (first level filtering by timestamp)
        const filteredNewsData = filterNewsByTimeframe(indexData.raw_news_data, timeframe);
        
        // Standardize and filter the data from each source
        const standardizedData = await standardizeNarrativeData(
            filteredNewsData,
            indexData.news_query_params,
            timeframe
        );

        return {
            articles: standardizedData.articles,
            posts: standardizedData.posts,
            timeframe
        };

    } catch (error) {
        console.error('Error fetching narrative data:', error);
        throw error;
    }
};

// Helper function to filter news data by timeframe (timestamp-based)
const filterNewsByTimeframe = (rawNewsData: any, timeframe: string) => {
    if (!rawNewsData) return {};

    const now = new Date();
    let cutoffTime: Date;

    // Parse timeframe (supports formats like '1h', '24h', '1d', '7d', '30m', etc.)
    const timeMatch = timeframe.match(/^(\d+)([mhd])$/);
    if (!timeMatch) {
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
    } else {
        const [, amount, unit] = timeMatch;
        const multiplier = parseInt(amount);
        
        switch (unit) {
            case 'm': // minutes
                cutoffTime = new Date(now.getTime() - multiplier * 60 * 1000);
                break;
            case 'h': // hours
                cutoffTime = new Date(now.getTime() - multiplier * 60 * 60 * 1000);
                break;
            case 'd': // days
                cutoffTime = new Date(now.getTime() - multiplier * 24 * 60 * 60 * 1000);
                break;
            default:
                cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }

    const filtered: any = {};
    
    for (const [timestamp, data] of Object.entries(rawNewsData)) {
        const dataTime = new Date(timestamp);
        if (dataTime >= cutoffTime) {
            filtered[timestamp] = data;
        }
    }

    return filtered;
};

// Helper function to standardize narrative data from all sources
const standardizeNarrativeData = async (filteredNewsData: any, newsQueryParams: any, timeframe: string) => {
    const articles: any[] = [];
    const posts: any[] = [];

    // Process each timestamp entry
    for (const [timestamp, timestampData] of Object.entries(filteredNewsData)) {
        for (const [source, sourceData] of Object.entries(timestampData as any)) {
            const sourceParams = newsQueryParams[source];
            if (!sourceParams) continue;

            try {
                // Will update these imports after creating the standardization functions
                let standardizedItems: any[] = [];

                switch (source) {
                    case 'x':
                        standardizedItems = await standardizeXPosts(sourceData, sourceParams, timeframe);
                        break;
                    case 'reddit':
                        standardizedItems = await standardizeRedditPosts(Array.isArray(sourceData) ? sourceData : [], sourceParams, timeframe);
                        break;
                    case 'newsapi':
                        standardizedItems = await standardizeArticles(sourceData, sourceParams, timeframe);
                        break;
                    default:
                        console.warn(`Unknown narrative source: ${source}`);
                        continue;
                }

                // Sort into articles and posts
                for (const item of standardizedItems) {
                    if (item.type === 'article') {
                        if (!articles.find(a => a.id === item.id)) {
                            articles.push(item);
                        }
                    } else if (item.type === 'post') {
                        if (!posts.find(p => p.id === item.id)) {
                            posts.push(item);
                        }
                    }
                }

            } catch (error) {
                console.error(`Error standardizing data from ${source}:`, error);
            }
        }
    }

    // Sort by publication time (most recent first)
    articles.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    posts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return { articles, posts };
};

const refreshAttentionIndex = async (market_id: number) => {
    // fetch the market category and sub-category
    const category = await getMarketCategory(market_id);
    const subCategory = await getMarketSubCategory(market_id);

    // fetch the index info (id, sources, etc.)
    const indexId = await getIndexId(market_id);
    const indexInfo = await getIndexInfo(indexId);
    const sources = indexInfo.attention_sources || [];
    const sourceParams = indexInfo.attention_query_params;

    // fetch data for each source
    const currTimestamp = new Date().toISOString();
    const sourceResults: { [key: string]: any } = {};

    const newsQueryParams = indexInfo.news_query_params;
    const fetchNews = indexInfo.track_news;

    const newsSourceResults: { [key: string]: any } = {};

    for (const source of sources) {
        try {
            console.log(`Fetching data from ${source}...`);
            
            switch (source) {
                case 'youtube':
                    if (sourceParams[source] && timeToFetch(sourceParams[source].last_fetched_at, currTimestamp, sourceParams[source].frequency)) {
                        sourceResults[source] = await fetchYouTubeData(subCategory, sourceParams[source]);

                        sourceParams[source].last_fetched_at = currTimestamp;
                        await updateMetricQueryParams(supabase, indexId, sourceParams);

                        console.log("YouTube metrics:", sourceResults[source]);
                    }

                    break;
                case 'lastfm':
                    if (sourceParams[source] && timeToFetch(sourceParams[source].last_fetched_at, currTimestamp, sourceParams[source].frequency)) {
                        sourceResults[source] = await fetchLastFmData(subCategory, sourceParams[source]);

                        sourceParams[source].last_fetched_at = currTimestamp;
                        await updateMetricQueryParams(supabase, indexId, sourceParams);

                        console.log("Last.fm metrics:", sourceResults[source]);
                    }

                    break;
                case 'spotify':
                    if (sourceParams[source] && timeToFetch(sourceParams[source].last_fetched_at, currTimestamp, sourceParams[source].frequency)) {
                        sourceResults[source] = await fetchSpotifyData(supabase, subCategory, indexId, sourceParams[source]);

                        sourceParams[source].last_fetched_at = currTimestamp;
                        await updateMetricQueryParams(supabase, indexId, sourceParams);

                        console.log("Spotify metrics:", sourceResults[source]);
                    }

                    break;
                case 'deezer':
                    if (sourceParams[source] && timeToFetch(sourceParams[source].last_fetched_at, currTimestamp, sourceParams[source].frequency)) {
                        sourceResults[source] = await fetchDeezerData(sourceParams[source]);

                        sourceParams[source].last_fetched_at = currTimestamp;
                        await updateMetricQueryParams(supabase, indexId, sourceParams);

                        console.log("Deezer metrics:", sourceResults[source]);
                    }

                    break;
                case 'x':
                    if (sourceParams[source] && timeToFetch(sourceParams[source].last_fetched_at, currTimestamp, sourceParams[source].frequency)) {
                        sourceResults[source] = await fetchXData(sourceParams[source]);

                        sourceParams[source].last_fetched_at = currTimestamp;
                        await updateMetricQueryParams(supabase, indexId, sourceParams);

                        console.log("X metrics:", sourceResults[source]);
                    }

                    if (fetchNews && newsQueryParams[source] && timeToFetch(newsQueryParams[source].last_fetched_at, currTimestamp, newsQueryParams[source].frequency)) {
                        newsSourceResults[source] = await fetchXPosts(newsQueryParams[source], newsQueryParams[source].interval);

                        newsQueryParams[source].last_fetched_at = currTimestamp;
                        await updateNewsQueryParams(supabase, indexId, newsQueryParams);
                    }

                    break;
                case 'reddit':
                    if (sourceParams[source] && timeToFetch(sourceParams[source].last_fetched_at, currTimestamp, sourceParams[source].frequency)) {
                        const { metrics, posts } = await fetchRedditData(supabase, indexId, sourceParams[source]);
                        sourceResults[source] = metrics;

                        sourceParams[source].last_fetched_at = currTimestamp;
                        await updateMetricQueryParams(supabase, indexId, sourceParams);

                        if (fetchNews && timeToFetch(newsQueryParams[source].last_fetched_at, currTimestamp, newsQueryParams[source].frequency)) {
                            newsSourceResults[source] = posts;

                            newsQueryParams[source].last_fetched_at = currTimestamp;
                            await updateNewsQueryParams(supabase, indexId, newsQueryParams);
                        }

                        console.log("Reddit metrics:", sourceResults[source]);
                    }

                    break;
                case 'newsapi':
                    if (fetchNews && newsQueryParams[source] && timeToFetch(newsQueryParams[source].last_fetched_at, currTimestamp, newsQueryParams[source].frequency)) {
                        newsSourceResults[source] = await fetchNewsApiData(supabase, indexId, newsQueryParams[source], newsQueryParams[source].interval, currTimestamp);

                        newsQueryParams[source].last_fetched_at = currTimestamp;
                        await updateNewsQueryParams(supabase, indexId, newsQueryParams);
                    }

                    break;
                default:
                    console.warn(`Unknown source: ${source}`);
                    break;
            }
                        
        } catch (error) {
            console.error(`Error fetching data from ${source}:`, error);
        }
    }

    await appendToIndex(indexId, currTimestamp, sourceResults, newsSourceResults);

    await appendToTransformedIndex(indexId, currTimestamp, sourceResults, sourceParams);

};

const appendToTransformedIndex = async (
    indexId: number,
    timestamp: string,
    metricsData: { [key: string]: number },
    sourceParams: any
) => {
    const rebaseSources: string[] = [];
    const updatedParams = JSON.parse(JSON.stringify(sourceParams));

    const baseBySource: Record<string, number> = {};
    const alreadyValidAtStart: Record<string, boolean> = {};

    for (const source of Object.keys(sourceParams)) {
        if (!(source in metricsData)) {
            metricsData[source] = sourceParams[source].prev?.value || null;
        }
    }

    for (const source of Object.keys(metricsData)) {
        const params = updatedParams[source] || {};
        const wasValid = !!params.has_valid_data;
        alreadyValidAtStart[source] = wasValid;

        const type = params.type;
        const value = metricsData[source];

        if (value === null) {
            continue;
        }

        if (type === "raw") {
            baseBySource[source] = value;

            if (!wasValid) {
                rebaseSources.push(source);
                updatedParams[source].has_valid_data = true;
            }
            updatedParams[source].prev = updatedParams[source].prev || {};
            updatedParams[source].prev.value = value;

        } else if (type === "difference_raw" || type === "difference_magnitude") {
            const prev = (params.prev ?? {}) as { value?: number; diff?: number };
            const prevRaw = typeof prev.value === "number" ? prev.value : null;
            const prevDiff = typeof prev.diff === "number" ? prev.diff : null;

            if (prevRaw !== null) {
                const delta =
                    type === "difference_raw" ? value - prevRaw : Math.abs(value - prevRaw);

                if (delta > 0) {
                    baseBySource[source] = delta;

                    if (!wasValid) {
                        rebaseSources.push(source);
                        updatedParams[source].has_valid_data = true;
                    }
                    updatedParams[source].prev = updatedParams[source].prev || {};
                    updatedParams[source].prev.diff = delta;
                    updatedParams[source].prev.value = value;
                } else {
                    if (wasValid && prevDiff !== null) {
                        baseBySource[source] = prevDiff; // carry forward last movement
                    }
                    updatedParams[source].prev = updatedParams[source].prev || {};
                    updatedParams[source].prev.value = value;
                }
            } else {
                // first observation --> record and wait for next tick to form a diff
                updatedParams[source].prev = updatedParams[source].prev || {};
                updatedParams[source].prev.value = value;
            }
        }
    }

    const existingBases: number[] = [];
    for (const [src, x] of Object.entries(baseBySource)) {
        if (alreadyValidAtStart[src]) existingBases.push(x);
    }
    const baselineIndex =
        existingBases.length > 0
            ? existingBases.reduce((a, b) => a + b, 0) / existingBases.length
            : null;

    const usedValues: Record<string, number> = {};
    for (const [src, x] of Object.entries(baseBySource)) {
        updatedParams[src] = updatedParams[src] || {};

        const hadOffset = typeof updatedParams[src].rebase_offset === "number";
        if (rebaseSources.includes(src)) {
            // one-time offset: c = baseline - x (or 0 if no baseline yet)
            const c = baselineIndex === null ? 0 : baselineIndex - x;
            updatedParams[src].rebase_offset = c;
        } else if (!hadOffset) {
            updatedParams[src].rebase_offset = 0;
        }

        const c = updatedParams[src].rebase_offset || 0;
        usedValues[src] = x + c; // this is the value used in the average
    }

    // final index value = average of all per-source used values
    const vals = Object.values(usedValues);
    const indexThisTick =
        vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

    const storageRow: Record<string, number> = { ...baseBySource, value: indexThisTick };

    const { error: updateError } = await supabase
        .from('indices')
        .update({ attention_query_params: updatedParams })
        .eq('id', indexId);

    const { error: currPriceError } = await supabase
        .from('indices')
        .update({ current_price: indexThisTick.toFixed(2) })
        .eq('id', indexId);

    if (updateError) {
        console.error('Error updating transformed index params:', updateError);
        throw updateError;
    }

    if (currPriceError) {
        console.error('Error updating current price:', currPriceError);
        throw currPriceError;
    }

    // append the new data point to the transformed index
    const { error: appendError } = await supabase.rpc(
        'append_transformed_index_data',
        {
            p_index_id: indexId,
            p_metrics_data: {
                [timestamp]: storageRow
            }
        }
    );

    if (appendError) {
        console.error('Error appending transformed index data:', appendError);
        throw appendError;
    }
};

const getIndexId = async (marketId: number) => {
    try {
        const { data, error } = await supabase
            .from('markets')
            .select(`index_id`)
            .eq('id', marketId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch index id for market ${marketId}: ${error.message}`);
        }

        return data?.index_id;

    } catch (error) {
        console.error('Error fetching index id:', error);
        throw error;
    }
};

const getIndexInfo = async (indexId: number) => {
    try {
        const { data, error } = await supabase
            .from('indices')
            .select('attention_sources, attention_query_params, track_news, news_query_params')
            .eq('id', indexId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch index info for index ${indexId}: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error fetching index info:', error);
        throw error;
    }
};

const appendToIndex = async (indexId: number, timestamp: string, metricsData: { [key: string]: number }, newsData: { [key: string]: any } | null) => {
    const metricsPayload = {
        [timestamp]: metricsData
    };

    const hasNewsData = newsData && Object.keys(newsData).length > 0;

    const newsPayload = hasNewsData ? {
        [timestamp]: newsData
    } : null;

    const { error } = await supabase.rpc(
        'append_index_raw_data',
        {
            p_index_id: indexId,
            p_metrics_data: metricsPayload,
            p_news_data: newsPayload,
        }
    );

    if (error) {
        console.error('Error appending index data:', error);
        throw error;
    }
};

const getMarketCategory = async (marketId: number): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('markets')
            .select('category')
            .eq('id', marketId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch category for market ${marketId}: ${error.message}`);
        }

        return data?.category;

    } catch (error) {
        console.error('Error fetching market category:', error);
        throw error;
    }
}

const getMarketSubCategory = async (marketId: number): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('markets')
            .select('sub_category')
            .eq('id', marketId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch sub-category for market ${marketId}: ${error.message}`);
        }

        return data?.sub_category;

    } catch (error) {
        console.error('Error fetching market sub-category:', error);
        throw error;
    }
}

const timeToFetch = (lastFetch: string | null, currTimestamp: string, fetchFrequency: number): boolean => {
    if (!lastFetch) return true;

    const lastFetchTime = new Date(lastFetch).getTime();
    const currTime = new Date(currTimestamp).getTime();

    const frequency = fetchFrequency * 1000;
    return (currTime - lastFetchTime) >= frequency;
}

const updateNewsQueryParams = async (db, indexId: number, newsQueryParams: any): Promise<void> => {
    try {
        const { error: updateError } = await db
            .from('indices')
            .update({ news_query_params: newsQueryParams })
            .eq('id', indexId);

        if (updateError) {
            console.error('Error updating news query params:', updateError);
            throw updateError;
        }

    } catch (error) {
        console.error('Error in updating news query params:', error);
        throw error;
    }
};

const updateMetricQueryParams = async (db, indexId: number, metricQueryParams: any): Promise<void> => {
    try {
        const { error: updateError } = await db
            .from('indices')
            .update({ attention_query_params: metricQueryParams })
            .eq('id', indexId);

        if (updateError) {
            console.error('Error updating attention query params:', updateError);
            throw updateError;
        }

    } catch (error) {
        console.error('Error in updating attention query params:', error);
        throw error;
    }
};

export { refreshAttentionIndex };
