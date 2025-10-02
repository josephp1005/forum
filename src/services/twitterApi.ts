interface TwitterCountData {
  end: string;
  start: string;
  tweet_count: number;
}

interface TwitterApiResponse {
  data: TwitterCountData[];
  errors?: Array<{
    detail: string;
    status: number;
    title: string;
    type: string;
  }>;
  meta: {
    newest_id: string;
    next_token?: string;
    oldest_id: string;
    total_tweet_count: number;
  };
}

export interface AttentionDataPoint {
  timestamp: string;
  tweet_count: number;
  attention_score: number;
}

// Rate limiting: only allow requests every 15 minutes
const RATE_LIMIT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
let lastRequestTime = 0;

export class TwitterApiService {
  private lastRequestTime: number = 0; 
  private proxyUrl: string;

  constructor(proxyUrl: string = 'http://localhost:3002') {
    this.proxyUrl = proxyUrl;
  }

  /**
   * Check if we can make a new API request (15 minute rate limit)
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const canMake = timeSinceLastRequest >= RATE_LIMIT_MS;

    console.log('Rate limit check:', {
      now,
      lastRequestTime: this.lastRequestTime,
      timeSinceLastRequest,
      rateLimitMs: RATE_LIMIT_MS,
      canMakeRequest: canMake
    });
    
    return canMake; // Enable actual rate limiting
  }

  /**
   * Get time until next request is allowed
   */
  getTimeUntilNextRequest(): number {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const timeRemaining = RATE_LIMIT_MS - timeSinceLastRequest;
    return Math.max(0, timeRemaining);
  }

  /**
   * Fetch tweet counts for a search query from the last 7 days
   */
  async fetchTweetCounts(query: string): Promise<TwitterApiResponse> {
    if (!this.canMakeRequest()) {
        throw new Error(`Rate limit exceeded. Next request allowed in ${Math.ceil(this.getTimeUntilNextRequest() / 60000)} minutes.`);
    }

    const url = new URL(`${this.proxyUrl}/api/twitter/counts`);
    url.searchParams.append('query', query);
    
    try {
      console.log(`Making request to proxy: ${url.toString()}`);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Proxy API error: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
      }

      const data: TwitterApiResponse = await response.json();
      
      // Update last request time on successful request
      this.lastRequestTime = Date.now();
      
      console.log('Successfully received data from proxy:', {
        dataPointsCount: data.data?.length || 0,
        totalTweetCount: data.meta?.total_tweet_count || 0
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching Twitter data:', error);
      throw error;
    }
  }

  /**
   * Transform Twitter API response to attention data points
   */
  transformToAttentionData(apiResponse: TwitterApiResponse): AttentionDataPoint[] {
    if (!apiResponse.data || apiResponse.data.length === 0) {
      return [];
    }

    return apiResponse.data.map(dataPoint => ({
      timestamp: dataPoint.end,
      tweet_count: dataPoint.tweet_count,
      attention_score: dataPoint.tweet_count, // Using tweet count as attention score
    }));
  }

  /**
   * Fetch and transform attention data for a market
   */
  async getAttentionData(marketName: string): Promise<AttentionDataPoint[]> {
    try {
      const apiResponse = await this.fetchTweetCounts(marketName);
      return this.transformToAttentionData(apiResponse);
    } catch (error) {
      console.error(`Error getting attention data for ${marketName}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance (you'll need to set the bearer token)
export const twitterApi = new TwitterApiService('AAAAAAAAAAAAAAAAAAAAAJRB4gEAAAAAebW9d3Ouc9BqLWV75nFk1BOBIZs%3D5fsKhBoRTNjj6hcEuxZfCBGkBod5P9sQ8nr5Ae7kr3EpZ9cIDQ'); // Bearer token to be set later