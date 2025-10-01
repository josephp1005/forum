import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

export function AttentionSources() {
  const sources = [
    {
      platform: "TikTok",
      percentage: 35,
      change: +12.5,
      color: "bg-pink-500",
      icon: "🎵"
    },
    {
      platform: "Google Trends",
      percentage: 28,
      change: +8.2,
      color: "bg-blue-500",
      icon: "🔍"
    },
    {
      platform: "Twitter/X",
      percentage: 18,
      change: -3.1,
      color: "bg-black",
      icon: "🐦"
    },
    {
      platform: "Instagram",
      percentage: 12,
      change: +5.7,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: "📸"
    },
    {
      platform: "YouTube",
      percentage: 7,
      change: +2.1,
      color: "bg-red-500",
      icon: "📺"
    }
  ];

  const totalAttention = sources.reduce((sum, source) => sum + source.percentage, 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-4">
        Attention distribution across platforms
      </div>
      
      {sources.map((source, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{source.icon}</span>
              <span className="font-medium text-sm">{source.platform}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{source.percentage}%</span>
              <div className={`flex items-center gap-1 text-xs ${source.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {source.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{source.change >= 0 ? '+' : ''}{source.change.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Progress 
              value={source.percentage} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full ${source.color}`}
              style={{ width: `${source.percentage}%` }}
            />
          </div>
        </div>
      ))}
      
      {/* Real-time updates */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-sm mb-3">Live Activity</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">🔥 TikTok mentions</span>
            <span className="font-medium text-green-600">+2.3K/hr</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">📈 Search spike</span>
            <span className="font-medium text-blue-600">+340%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">📰 News articles</span>
            <span className="font-medium text-orange-600">12 new</span>
          </div>
        </div>
      </div>
      
      {/* Trending hashtags */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-sm mb-3">Trending Hashtags</h4>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">#trending</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">#viral</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">#culture</span>
          <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">#moment</span>
        </div>
      </div>
    </div>
  );
}