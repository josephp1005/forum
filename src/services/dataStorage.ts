import { AttentionDataPoint } from './twitterApi';

export interface StoredAttentionData {
  marketId: string;
  lastUpdated: string;
  dataPoints: AttentionDataPoint[];
}

/**
 * CSV Storage utility for attention data
 * Since we're in the browser, we'll use localStorage as a fallback
 * You can replace this with actual file operations if running in Node.js
 */
export class AttentionDataStorage {
  private static readonly STORAGE_KEY = 'attention_data';
  private static readonly CSV_FILENAME = 'attention_data.csv';

  /**
   * Convert attention data to CSV format
   */
  static toCSV(data: StoredAttentionData[]): string {
    const headers = ['marketId', 'lastUpdated', 'timestamp', 'tweet_count', 'attention_score'];
    const rows = [headers.join(',')];

    data.forEach(market => {
      market.dataPoints.forEach(point => {
        const row = [
          market.marketId,
          market.lastUpdated,
          point.timestamp,
          point.tweet_count.toString(),
          point.attention_score.toString()
        ];
        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  }

  /**
   * Parse CSV data back to structured format
   */
  static fromCSV(csvContent: string): StoredAttentionData[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',');
    const dataMap = new Map<string, StoredAttentionData>();

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length !== headers.length) continue;

      const marketId = values[0];
      const lastUpdated = values[1];
      const timestamp = values[2];
      const tweet_count = parseInt(values[3]);
      const attention_score = parseInt(values[4]);

      if (!dataMap.has(marketId)) {
        dataMap.set(marketId, {
          marketId,
          lastUpdated,
          dataPoints: []
        });
      }

      const market = dataMap.get(marketId)!;
      market.dataPoints.push({
        timestamp,
        tweet_count,
        attention_score
      });
    }

    return Array.from(dataMap.values());
  }

  /**
   * Save attention data to localStorage (simulating CSV file)
   */
  static async save(data: StoredAttentionData[]): Promise<void> {
    try {
      const csvContent = this.toCSV(data);
      localStorage.setItem(this.STORAGE_KEY, csvContent);
      
      // Also create downloadable CSV for backup
      this.downloadCSV(csvContent);
      
      console.log('Attention data saved to localStorage and CSV downloaded');
    } catch (error) {
      console.error('Error saving attention data:', error);
      throw error;
    }
  }

  /**
   * Load attention data from localStorage
   */
  static async load(): Promise<StoredAttentionData[]> {
    try {
      const csvContent = localStorage.getItem(this.STORAGE_KEY);
      if (!csvContent) return [];
      
      return this.fromCSV(csvContent);
    } catch (error) {
      console.error('Error loading attention data:', error);
      return [];
    }
  }

  /**
   * Get attention data for specific market
   */
  static async getMarketData(marketId: string): Promise<StoredAttentionData | null> {
    const allData = await this.load();
    return allData.find(market => market.marketId === marketId) || null;
  }

  /**
   * Update attention data for a specific market
   */
  static async updateMarketData(marketId: string, newDataPoints: AttentionDataPoint[]): Promise<void> {
    const allData = await this.load();
    const existingMarketIndex = allData.findIndex(market => market.marketId === marketId);
    
    const updatedMarket: StoredAttentionData = {
      marketId,
      lastUpdated: new Date().toISOString(),
      dataPoints: newDataPoints
    };

    if (existingMarketIndex >= 0) {
      allData[existingMarketIndex] = updatedMarket;
    } else {
      allData.push(updatedMarket);
    }

    await this.save(allData);
  }

  /**
   * Merge new data points with existing ones (avoid duplicates)
   */
  static mergeDataPoints(existing: AttentionDataPoint[], newPoints: AttentionDataPoint[]): AttentionDataPoint[] {
    const existingTimestamps = new Set(existing.map(point => point.timestamp));
    const uniqueNewPoints = newPoints.filter(point => !existingTimestamps.has(point.timestamp));
    
    return [...existing, ...uniqueNewPoints]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Append new data points to existing market data
   */
  static async appendMarketData(marketId: string, newDataPoints: AttentionDataPoint[]): Promise<void> {
    const existingData = await this.getMarketData(marketId);
    
    if (existingData) {
      const mergedDataPoints = this.mergeDataPoints(existingData.dataPoints, newDataPoints);
      await this.updateMarketData(marketId, mergedDataPoints);
    } else {
      await this.updateMarketData(marketId, newDataPoints);
    }
  }

  /**
   * Download CSV file to local filesystem
   */
  private static downloadCSV(csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', this.CSV_FILENAME);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Clear all stored data
   */
  static async clear(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Create initial empty CSV file structure for reference
export const createInitialCSV = () => {
  const headers = ['marketId', 'lastUpdated', 'timestamp', 'tweet_count', 'attention_score'];
  const sampleData = [
    'lebron-james,2024-10-02T10:00:00Z,2024-10-02T09:00:00Z,150,150',
    'lebron-james,2024-10-02T10:00:00Z,2024-10-02T08:00:00Z,89,89'
  ];
  
  return [headers.join(','), ...sampleData].join('\n');
};