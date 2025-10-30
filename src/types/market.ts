export enum MarketCategory {
  MUSIC = 'music'
}

export enum MarketSubCategory {
  ARTISTS = 'artists',
  ALBUMS = 'albums', 
  SONGS = 'songs'
}

// Lightweight index data for home page listings
export interface IndexSummary {
  current_price: number;
  last_update: string;
  update_frequency: number;
}

// Full index data structure
export interface Index {
  id: number;
  created_at: string;
  raw_data: any;
  attention_sources: string[];
  attention_query_params: AttentionQueryParams;
  update_frequency: number;
  track_news: boolean;
  raw_news_data: any;
  news_query_params: any;
  transformed_index: TransformedIndex;
  current_price: number;
  last_update: string;
}

// Structure for individual entries in transformed_index
export interface TransformedIndexEntry {
  value: number;
  [source: string]: number; // Dynamic source metrics (youtube, reddit, x, etc.)
}

// Structure for the entire transformed_index object
export interface TransformedIndex {
  [timestamp: string]: TransformedIndexEntry;
}

// Attention query parameters with source metadata
export interface AttentionQueryParams {
  [source: string]: {
    metric: string;
    picture: string;
    // Note: Additional fields depend on the source - keeping flexible for now
    [key: string]: any;
  };
}

// Index metrics calculated for a specific timeframe
export interface IndexMetrics {
  current: number;
  peak: number;
  change: number;
  changePercent: number;
}

// Complete index data with timeframe filtering and metrics
export interface IndexData extends Index {
  filtered_transformed_index: TransformedIndex;
  metrics: IndexMetrics;
  timeframe: string;
}

// Lightweight market data for home page listings
export interface MarketSummary {
  id: number;
  created_at: string;
  category: MarketCategory;
  sub_category: MarketSubCategory;
  index_id: number;
  last_price: number;
  funding_rate: number;
  twenty_four_hour_change: number;
  twenty_four_hour_vol: number;
  next_funding: number;
  open_interest: number;
  expiry: string | null;
  contract_size: number;
  twenty_four_hour_high: number;
  twenty_four_hour_low: number;
  name: string;
  picture: string;
  // Lightweight index data
  index: IndexSummary;
}

// Full market data structure
export interface Market {
  id: number;
  created_at: string;
  category: MarketCategory;
  sub_category: MarketSubCategory;
  index_id: number;
  last_price: number;
  funding_rate: number;
  twenty_four_hour_change: number;
  twenty_four_hour_vol: number;
  next_funding: number; // in seconds
  open_interest: number;
  expiry: string | null;
  contract_size: number;
  twenty_four_hour_high: number;
  twenty_four_hour_low: number;
  name: string;
  picture: string;
  // Full index data joined from indices table
  index: Index;
}

export interface MarketWithCalculatedFields extends Market {
  // Calculated fields
  index_price: number; // from index.current_price
  next_index_update: number; // calculated from index.update_frequency and index.last_update
  time_until_next_update: number; // seconds until next update
}

// Market summary with calculated fields for home page
export interface MarketSummaryWithCalculatedFields extends MarketSummary {
  index_price: number;
  next_index_update: number;
  time_until_next_update: number;
}

// Helper function to calculate time until next update
export function calculateTimeUntilNextUpdate(
  lastUpdate: string,
  updateFrequency: number
): number {
  const lastUpdateTime = new Date(lastUpdate).getTime();
  const now = Date.now();
  const nextUpdateTime = lastUpdateTime + (updateFrequency * 1000);
  const timeUntilNext = Math.max(0, nextUpdateTime - now);
  return Math.floor(timeUntilNext / 1000); // return in seconds
}

// Helper function to add calculated fields to full market data
export function enrichMarketData(market: Market): MarketWithCalculatedFields {
  return {
    ...market,
    index_price: market.index.current_price,
    next_index_update: new Date(market.index.last_update).getTime() + (market.index.update_frequency * 1000),
    time_until_next_update: calculateTimeUntilNextUpdate(
      market.index.last_update,
      market.index.update_frequency
    )
  };
}

// Helper function to add calculated fields to market summary data
export function enrichMarketSummaryData(market: MarketSummary): MarketSummaryWithCalculatedFields {
  return {
    ...market,
    index_price: market.index.current_price,
    next_index_update: new Date(market.index.last_update).getTime() + (market.index.update_frequency * 1000),
    time_until_next_update: calculateTimeUntilNextUpdate(
      market.index.last_update,
      market.index.update_frequency
    )
  };
}