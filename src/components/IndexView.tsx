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
    <div className="space-y-6">
      {/* Attention Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Attention Score</p>
              <p className="text-3xl font-bold text-gray-900">{market.spot_price.toFixed(0)}</p>
            </div>
            <div className={`${market.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {market.change >= 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
            </div>
          </div>
          <p className={`text-sm mt-2 ${market.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {market.change >= 0 ? '+' : ''}{market.changePercent.toFixed(1)}% from yesterday
          </p>
        </Card>
        
        <Card className="p-6">
          <div>
            <p className="text-sm text-gray-500">Peak Score (30d)</p>
            <p className="text-2xl font-bold text-gray-900">1,247</p>
          </div>
          <p className="text-sm text-blue-600 mt-2">Reached 5 days ago</p>
        </Card>
        
        <Card className="p-6">
          <div>
            <p className="text-sm text-gray-500">Attention Velocity</p>
            <p className="text-2xl font-bold text-gray-900">+23.4%</p>
          </div>
          <p className="text-sm text-green-600 mt-2">Accelerating</p>
        </Card>
        
        <Card className="p-6">
          <div>
            <p className="text-sm text-gray-500">Cultural Rank</p>
            <p className="text-2xl font-bold text-gray-900">#12</p>
          </div>
          <p className="text-sm text-orange-600 mt-2">in {market.category}</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attention Score Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Attention Over Time</h3>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">7D</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">30D</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">90D</button>
              </div>
            </div>
            <AttentionChart market={market} events={mockEvents} />
          </Card>
        </div>

        {/* Attention Sources */}
        <div>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Attention Sources</h3>
            <AttentionSources />
          </Card>
        </div>
      </div>

      {/* Key Events & News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Events */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Key Events (Last 30 Days)</h3>
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
        </Card>

        {/* Recent News */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent News & Mentions</h3>
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
        </Card>
      </div>
    </div>
  );
}