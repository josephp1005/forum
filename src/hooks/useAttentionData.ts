import { useState, useEffect, useCallback } from 'react';
import { TwitterApiService, AttentionDataPoint } from '../services/twitterApi';
import { AttentionDataStorage } from '../services/dataStorage';

interface UseAttentionDataOptions {
  marketId: string;
  marketName: string;
  isRealTimeMode: boolean;
}

interface UseAttentionDataReturn {
  data: AttentionDataPoint[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  nextUpdateIn: number;
  canUpdate: boolean;
  forceUpdate: () => Promise<void>;
}

export const useAttentionData = ({ 
  marketId, 
  marketName, 
  isRealTimeMode
}: UseAttentionDataOptions): UseAttentionDataReturn => {
  const [data, setData] = useState<AttentionDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = useState(0);
  const [twitterApi, setTwitterApi] = useState<TwitterApiService | null>(null);

  // Initialize Twitter API service for real-time mode
  useEffect(() => {
    if (isRealTimeMode) {
      setTwitterApi(new TwitterApiService()); // No bearer token needed, handled by backend
    }
  }, [isRealTimeMode]);

  // Load existing data from storage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      if (!isRealTimeMode) return;
      
      try {
        const storedData = await AttentionDataStorage.getMarketData(marketId);
        if (storedData && storedData.dataPoints.length > 0) {
          setData(storedData.dataPoints);
          setLastUpdated(storedData.lastUpdated);
        }
      } catch (err) {
        console.error('Error loading stored data:', err);
      }
    };

    loadStoredData();
  }, [marketId, isRealTimeMode]);

  // Update countdown timer
  useEffect(() => {
    if (!isRealTimeMode || !twitterApi) return;

    const updateTimer = () => {
      const timeUntilNext = twitterApi.getTimeUntilNextRequest();
      setNextUpdateIn(Math.ceil(timeUntilNext / 1000)); // Convert to seconds
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isRealTimeMode, twitterApi, lastUpdated]);

  // Check if we can make a new request
  const canUpdate = isRealTimeMode && twitterApi?.canMakeRequest() === true;
  // Fetch new data from Twitter API
  const fetchNewData = useCallback(async (): Promise<void> => {
    if (!isRealTimeMode || !twitterApi || !marketName) {
      return;
    }

    if (!twitterApi.canMakeRequest()) {
      const timeUntilNext = Math.ceil(twitterApi.getTimeUntilNextRequest() / 60000);
      setError(`Rate limit exceeded. Next request allowed in ${timeUntilNext} minutes.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newData = await twitterApi.getAttentionData(marketName);
      
      if (newData.length > 0) {
        // Merge with existing data
        await AttentionDataStorage.appendMarketData(marketId, newData);
        
        // Reload all data to get the merged result
        const updatedStoredData = await AttentionDataStorage.getMarketData(marketId);
        if (updatedStoredData) {
          setData(updatedStoredData.dataPoints);
          setLastUpdated(updatedStoredData.lastUpdated);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attention data';
      setError(errorMessage);
      console.error('Error fetching attention data:', err);
    } finally {
      setLoading(false);
    }
  }, [isRealTimeMode, twitterApi, marketName, marketId]);

  // Auto-fetch data when conditions are met
  useEffect(() => {
    if (!isRealTimeMode || !twitterApi || !canUpdate) return;

    // Only auto-fetch if we don't have recent data (older than 14 minutes)
    const shouldAutoFetch = () => {
      if (!lastUpdated) return true;
      
      const lastUpdateTime = new Date(lastUpdated).getTime();
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime;
      
      // Auto-fetch if last update was more than 14 minutes ago
      return timeSinceLastUpdate > (14 * 60 * 1000);
    };

    if (shouldAutoFetch()) {
      fetchNewData();
    }
  }, [canUpdate, lastUpdated, fetchNewData, isRealTimeMode, twitterApi]);

  // Force update function for manual refresh
  const forceUpdate = useCallback(async (): Promise<void> => {
    await fetchNewData();
  }, [fetchNewData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    nextUpdateIn,
    canUpdate,
    forceUpdate
  };
};

// Helper hook for formatting time remaining
export const useFormattedTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};