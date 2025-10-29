import { Market } from '../types/market';

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
  // Markets API
  async fetchMarkets() {
    return apiRequest<Market[]>('/markets');
  },

  // Index API  
  async fetchIndex(marketId: number) {
    return apiRequest<any>(`/index/markets/${marketId}`);
  },

  async refreshIndex(marketId: number) {
    return apiRequest<any>(`/index/markets/${marketId}/refresh`, {
      method: 'PUT',
    });
  },
};

export default api;