import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, ExternalLink, Calendar } from "lucide-react";
import { AttentionChart } from "./AttentionChart";
import { AttentionSources } from "./AttentionSources";

interface IndexViewProps {
  market: {
    id: string;
    name: string;
    category: string;
    price: number;
    change: number;
    changePercent: number;
    spot_price: number
  };
}

export function IndexView({ market }: IndexViewProps) {
  const mockNews = [
    {
      id: 1,
      title: `${market.name} Breaks Internet with Latest Announcement`,
      source: "Entertainment Weekly",
      time: "2 hours ago",
      impact: "high",
      summary: "Major cultural moment drives unprecedented social media engagement"
    },
    {
      id: 2,
      title: `Trending on TikTok: ${market.name} Challenge Goes Viral`,
      source: "Social Media Today",
      time: "4 hours ago",
      impact: "medium",
      summary: "User-generated content spreads across platforms"
    },
    {
      id: 3,
      title: `Google Search Spike: ${market.name} Reaches Peak Interest`,
      source: "Digital Trends",
      time: "6 hours ago",
      impact: "medium",
      summary: "Search volume increases 340% in past 24 hours"
    },
    {
      id: 4,
      title: `${market.name} Merchandise Sales Surge Following Latest Event`,
      source: "Retail Wire",
      time: "8 hours ago",
      impact: "low",
      summary: "Commercial activity indicates sustained attention"
    }
  ];

  const mockEvents = [
    {
      date: "2024-09-25",
      event: "Album Release Announcement",
      impact: "+15.2%",
      description: "Major announcement drives attention spike"
    },
    {
      date: "2024-09-20",
      event: "Viral TikTok Moment",
      impact: "+8.7%",
      description: "Organic social media moment"
    },
    {
      date: "2024-09-15",
      event: "Award Show Performance",
      impact: "+12.4%",
      description: "Prime time television exposure"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-12 grid-rows-[1fr_1fr] mb-2 gap-3 p-1 min-h-[calc(100vh-80px)]">
      
      {/* 1. Attention Over Time Chart (Top-Left) */}
      <div className="col-span-8 row-span-1">
        <Card className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Attention Over Time</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">7D</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">30D</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">90D</button>
            </div>
          </div>
          
          <div className="flex-1">
            <AttentionChart market={market} events={mockEvents} />
          </div>
          
          {/* Stats bar at bottom */}
          <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{market.spot_price.toFixed(0)}</p>
              <p className="text-xs text-gray-500">Current Score</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">1,247</p>
              <p className="text-xs text-gray-500">Peak (30d)</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">+23.4%</p>
              <p className="text-xs text-gray-500">24h</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">#12</p>
              <p className="text-xs text-gray-500">Rank</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Attention Sources (Top-Right, Scrollable) */}
      <div className="col-span-4 row-span-1">
        <Card className="flex flex-col h-full p-4">
          <h3 className="font-semibold mb-4">Attention Sources</h3>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <AttentionSources />
          </div>
        </Card>
      </div>

      {/* 3. Key Events (Bottom-Left, Scrollable) */}
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

      {/* 4. Recent News & Mentions (Bottom-Right, Scrollable) */}
      <div className="col-span-6 row-span-1">
        <Card className="flex flex-col h-full p-4">
          <h3 className="font-semibold mb-4">Recent News & Mentions</h3>
          <div className="flex-1 overflow-y-auto max-h-[420px]">
            <div className="space-y-4">
              {mockNews.map((article) => (
                <div key={article.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getImpactColor(article.impact)}>
                          {article.impact} impact
                        </Badge>
                        <span className="text-sm text-gray-500">{article.time}</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{article.source}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}