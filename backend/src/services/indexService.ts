import { createClient } from '@supabase/supabase-js';
import config from '../config/config.js';
import { fetchYouTubeData } from './sources/youtubeService.js';
import { fetchLastFmData } from './sources/lastFmService.js';
import { fetchSpotifyData } from './sources/spotifyService.js';
import { fetchDeezerData } from './sources/deezerService.js';
import { fetchXData, fetchXPosts } from './sources/xService.js';
import { fetchNewsApiData } from './sources/newsApiService.js';
import { fetchRedditData } from './sources/redditService.js';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

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
    const lastNewsFetch = indexInfo.last_news_fetch;
    const newsFetchFrequency = indexInfo.news_fetch_frequency;
    const newsFetchInterval = indexInfo.news_fetch_interval;
    const fetchNews = indexInfo.track_news && shouldFetchNews(lastNewsFetch, currTimestamp, newsFetchFrequency);

    if (fetchNews) {
        await updateLastNewsFetch(supabase, indexId, currTimestamp);
    }

    const newsSourceResults: { [key: string]: any } = {};

    for (const source of sources) {
        try {
            console.log(`Fetching data from ${source}...`);
            
            switch (source) {
                case 'youtube':
                    sourceResults[source] = await fetchYouTubeData(subCategory, sourceParams[source]);

                    console.log("YouTube metrics:", sourceResults[source]);
                    break;
                case 'lastfm':
                    sourceResults[source] = await fetchLastFmData(subCategory, sourceParams[source]);

                    console.log("Last.fm metrics:", sourceResults[source]);
                    break;
                case 'spotify':
                    sourceResults[source] = await fetchSpotifyData(supabase, subCategory, indexId, sourceParams[source]);

                    console.log("Spotify metrics:", sourceResults[source]);
                    break;
                case 'deezer':
                    sourceResults[source] = await fetchDeezerData(sourceParams[source]);

                    console.log("Deezer metrics:", sourceResults[source]);
                    break;
                case 'x':
                    sourceResults[source] = await fetchXData(sourceParams[source]);

                    if (fetchNews && newsQueryParams[source]) {
                        newsSourceResults[source] = await fetchXPosts(newsQueryParams[source], newsFetchInterval);
                    }

                    console.log("X metrics:", sourceResults[source]);
                    break;
                case 'reddit':
                    const { metrics, posts } = await fetchRedditData(supabase, indexId, sourceParams[source]);
                    sourceResults[source] = metrics;
                    
                    if (fetchNews) {
                        newsSourceResults[source] = posts;
                    }

                    console.log("Reddit metrics:", sourceResults[source]);
                    break;
                case 'newsapi':
                    if (fetchNews && newsQueryParams[source]) {
                        newsSourceResults[source] = await fetchNewsApiData(supabase, indexId, newsQueryParams[source], newsFetchInterval, currTimestamp);
                    }

                    break;
                default:
                    console.warn(`Unknown source: ${source}`);
                    break;
            }
            
            console.log("Successfully fetched data for ", source);
            
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

    for (const source of Object.keys(metricsData)) {
        const params = updatedParams[source] || {};
        const wasValid = !!params.has_valid_data;
        alreadyValidAtStart[source] = wasValid;

        const type = params.type;
        const value = metricsData[source];

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

    if (updateError) {
        console.error('Error updating transformed index params:', updateError);
        throw updateError;
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
            .select('attention_sources, attention_query_params, track_news, last_news_fetch, news_fetch_frequency, news_fetch_interval, news_query_params')
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

const shouldFetchNews = (lastFetch: string | null, currTimestamp: string, newsFetchFrequency: number): boolean => {
    if (!lastFetch) return true;

    const lastFetchTime = new Date(lastFetch).getTime();
    const currTime = new Date(currTimestamp).getTime();

    const frequency = newsFetchFrequency * 1000;
    return (currTime - lastFetchTime) >= frequency;
}

const updateLastNewsFetch = async (db, indexId: number, timestamp: string): Promise<void> => {
    try {
        const { error: updateError } = await db
            .from('indices')
            .update({ last_news_fetch: timestamp })
            .eq('id', indexId);

        if (updateError) {
            console.error('Error updating last news fetch timestamp:', updateError);
            throw updateError;
        }

    } catch (error) {
        console.error('Error in updating last news fetch timestamp:', error);
        throw error;
    }
};

export { refreshAttentionIndex };
