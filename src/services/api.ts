import { MarketSummary, Market, IndexData } from '../types/market';
import { NarrativeResponse } from '../types/narrative';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiError(
        `API Error: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

export const api = {
  // Markets API - returns lightweight market data for home page
  async fetchMarkets() {
    return apiRequest<MarketSummary[]>('/markets');
  },

  // Full market data for individual market pages
  async fetchFullMarket(marketId: number) {
    return apiRequest<Market>(`/markets/${marketId}/full`);
  },

  // Index API with timeframe filtering
  async fetchIndexData(marketId: number, timeframe: string = '3h') {
    return apiRequest<IndexData>(`/index/${marketId}?timeframe=${timeframe}`);
  },

  // Narrative API with timeframe filtering
  async fetchNarrativeData(marketId: number, timeframe: string = '1d') {
    return apiRequest<NarrativeResponse>(`/index/${marketId}/narrative?timeframe=${timeframe}`);
  },

  async refreshIndex(marketId: number) {
    return apiRequest<any>(`/index/${marketId}/refresh`, {
      method: 'POST',
    });
  },
};

export default api;