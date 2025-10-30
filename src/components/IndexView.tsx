import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { AttentionChart } from "./AttentionChart";
import { AttentionSources } from "./AttentionSources";
import { NarrativeSection } from "./NarrativeSection";
import { MarketWithCalculatedFields, IndexData } from "../types/market";
import { NarrativeTimeframe } from "../types/narrative";
import { api } from "../services/api";

interface IndexViewProps {
  market: MarketWithCalculatedFields;
}

export function IndexView({ market }: IndexViewProps) {
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState('3h');
  const [narrativeTimeframe, setNarrativeTimeframe] = useState<NarrativeTimeframe>('1d');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch index data when component mounts or timeframe changes
  useEffect(() => {
    fetchIndexData();
  }, [market.id, currentTimeframe]);

  const fetchIndexData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.fetchIndexData(market.id, currentTimeframe);
      setIndexData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch index data');
      console.error('Error fetching index data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeframeChange = (timeframe: string) => {
    setCurrentTimeframe(timeframe);
  };

  const handleNarrativeTimeframeChange = (timeframe: NarrativeTimeframe) => {
    setNarrativeTimeframe(timeframe);
  };

  const handleRefreshIndex = async () => {
    try {
      setIsLoading(true);
      //await api.refreshIndex(market.id);
      // Fetch fresh data after refresh
      await fetchIndexData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh index');
      console.error('Error refreshing index:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 mb-2 gap-3 p-1 min-h-[calc(100vh-80px)]">
      
      {/* 1. Attention Over Time Chart (Top-Left) */}
      <div className="col-span-8 h-[600px]">
        <Card className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">
                Attention Over Time
              </h3>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshIndex}
                disabled={isLoading}
                className="h-8 px-3"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <AttentionChart 
              indexData={indexData || undefined}
              onTimeframeChange={handleTimeframeChange}
              currentTimeframe={currentTimeframe}
              isLoading={isLoading}
            />
          </div>
          
          {/* Stats bar at bottom */}
          <div className="mt-0 grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {indexData?.metrics.current.toFixed(0) || market.index_price.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Current Score</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {indexData?.metrics.peak.toFixed(0) || '--'}
              </p>
              <p className="text-xs text-gray-500">Peak</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${(indexData?.metrics.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {indexData?.metrics.changePercent !== undefined 
                  ? `${indexData.metrics.changePercent >= 0 ? '+' : ''}${indexData.metrics.changePercent.toFixed(1)}%`
                  : '--'
                }
              </p>
              <p className="text-xs text-gray-500">Change</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Attention Sources (Top-Right, Scrollable) */}
      <div className="col-span-4 h-[600px]">
        <Card className="flex flex-col h-full p-4">
          <h3 className="font-semibold mb-1">Attention Sources</h3>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <AttentionSources 
              indexData={indexData || undefined}
              isLoading={isLoading}
            />
          </div>
        </Card>
      </div>

      {/* 3. Key Events (Bottom-Left, Scrollable)
      <div className="col-span-6 row-span-1">
        <Card className="flex flex-col h-full p-4">
          <h3 className="font-semibold mb-4">Key Events (Last 30 Days)</h3>
          <div className="flex-1 overflow-y-auto max-h-[300px]">
            <div className="space-y-4">
              {mockEvents.map((event, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{event.date}</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {event.impact}
                    </Badge>
                  </div>
                  <h4 className="font-medium mt-1">{event.event}</h4>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      */}

      {/* 4. Recent News & Mentions (Bottom-Right, Scrollable) */}
      <div className="col-span-12 row-span-1">
        <NarrativeSection
          marketId={market.id.toString()}
          timeframe={narrativeTimeframe}
          onTimeframeChange={handleNarrativeTimeframeChange}
        />
      </div>
    </div>
  );
}