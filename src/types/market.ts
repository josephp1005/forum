export enum MarketCategory {
  MUSIC = 'music'
}

export enum MarketSubCategory {
  ARTISTS = 'artists',
  ALBUMS = 'albums', 
  SONGS = 'songs'
}

export interface Index {
  id: number;
  created_at: string;
  raw_data: any;
  attention_sources: string[];
  attention_query_params: any;
  update_frequency: number;
  track_news: boolean;
  raw_news_data: any;
  news_query_params: any;
  transformed_index: any;
  current_price: number;
  last_update: string;
}

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
  // Index data joined from indices table
  index: Index;
}

export interface MarketWithCalculatedFields extends Market {
  // Calculated fields
  index_price: number; // from index.current_price
  next_index_update: number; // calculated from index.update_frequency and index.last_update
  time_until_next_update: number; // seconds until next update
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

// Helper function to add calculated fields to market
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