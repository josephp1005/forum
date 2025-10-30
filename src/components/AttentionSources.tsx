import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";
import { IndexData, TransformedIndexEntry } from "../types/market";

interface AttentionSourcesProps {
  indexData?: IndexData;
  isLoading?: boolean;
}

interface SourceMetric {
  platform: string;
  value: number;
  metric: string;
  picture?: string;
  icon: string;
  color: string;
}

export function AttentionSources({ indexData, isLoading }: AttentionSourcesProps) {
  
  // Get the latest entry from transformed_index for current values
  const getLatestSourceMetrics = (): SourceMetric[] => {
    if (!indexData?.filtered_transformed_index) return [];

    const entries = Object.entries(indexData.filtered_transformed_index);
    if (entries.length === 0) return [];

    // Get the latest entry (last timestamp)
    const latestEntry = entries[entries.length - 1][1] as TransformedIndexEntry;
    const attentionParams = indexData.attention_query_params || {};

    const sourceMetrics: SourceMetric[] = [];

    // Map sources to display info
    const sourceDisplayMap: { [key: string]: { icon: string; color: string; displayName: string } } = {
      youtube: { icon: "📺", color: "bg-red-500", displayName: "YouTube" },
      reddit: { icon: "😏", color: "bg-orange-500", displayName: "Reddit" },
      x: { icon: "🐦", color: "bg-black", displayName: "X (Twitter)" },
      spotify: { icon: "🎵", color: "bg-green-500", displayName: "Spotify" },
      lastfm: { icon: "🎶", color: "bg-red-600", displayName: "Last.fm" },
      deezer: { icon: "🎧", color: "bg-purple-500", displayName: "Deezer" },
      newsapi: { icon: "�", color: "bg-blue-500", displayName: "News" }
    };

    Object.keys(latestEntry).forEach(sourceKey => {
      if (sourceKey === 'value') return; // Skip the aggregated value

      const displayInfo = sourceDisplayMap[sourceKey];
      if (!displayInfo) return;

      const sourceParams = attentionParams[sourceKey];
      const metricName = sourceParams?.metric || 'Activity';
      const value = latestEntry[sourceKey] || 0;

      sourceMetrics.push({
        platform: displayInfo.displayName,
        value: Number(value),
        metric: metricName,
        picture: sourceParams?.picture,
        icon: displayInfo.icon,
        color: displayInfo.color
      });
    });

    // Sort by value descending
    return sourceMetrics.sort((a, b) => b.value - a.value);
  };

  const sourceMetrics = getLatestSourceMetrics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium mb-4">Loading source metrics...</div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sourceMetrics.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium mb-4">Source Metrics</div>
        <div className="text-center text-gray-500 py-8">
          No source data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium mb-4">Source Metrics</div>
      
      {sourceMetrics.map((source, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={source.picture} 
                alt={source.platform || 'source image'} 
                className="w-6 h-6 rounded-full object-cover" 
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{source.platform}</span>
                <span className="text-xs text-gray-500">{source.metric}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {source.value >= 1000 
                  ? `${(source.value / 1000).toFixed(1)}k` 
                  : source.value.toFixed(0)
                }
              </span>
            </div>
          </div>
          
          {/* Optional: Add a visual indicator bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${source.color.replace('bg-', 'bg-opacity-75 bg-')}`}
              style={{ 
                width: `${Math.min(100, (source.value / Math.max(...sourceMetrics.map(s => s.value))) * 100)}%` 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}