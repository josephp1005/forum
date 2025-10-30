import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { CategorySection } from "./components/CategorySection";
import { MarketCard } from "./components/MarketCard";
import { MarketDetail } from "./components/MarketDetail";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { TrendingUp, TrendingDown, Activity, Plus } from "lucide-react";
import { api } from "./services/api";
import { 
  MarketSummary, 
  MarketSummaryWithCalculatedFields, 
  Market,
  MarketWithCalculatedFields,
  enrichMarketSummaryData,
  enrichMarketData,
  MarketSubCategory 
} from "./types/market";

const mockMarkets = {
  trending: {
    "Top Movers": [
      {
        id: "presidential-debate",
        name: "Donald Trump",
        category: "Politics",
        price: 1567.89,
        change: 89.45,
        changePercent: 6.05,
        volume: "$5.7M",
        image: "https://images.unsplash.com/photo-1742252306330-453455bd7526?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljYWwlMjBkZWJhdGV8ZW58MXx8fHwxNzU5MjQ4MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        trending: true,
        funding_rate: "0.009%/hr",
        spot_price: 1568.23
      },
      {
        id: "minecraft",
        name: "Minecraft",
        category: "Gaming",
        price: 1245.67,
        change: 45.89,
        changePercent: 3.82,
        volume: "$3.2M",
        image: "https://images.unsplash.com/photo-1656639969815-1194ca7273bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5lY3JhZnQlMjBnYW1lfGVufDF8fHx8MTc1OTI0NjE3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        trending: true,
        funding_rate: "0.004%/hr",
        spot_price: 1244.14
      },
      {
        id: "taylor-swift",
        name: "Taylor Swift",
        category: "Music",
        price: 847.32,
        change: 23.45,
        changePercent: 2.85,
        volume: "$2.1M",
        image: "https://images.unsplash.com/photo-1692796226663-dd49d738f43c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXlsb3IlMjBzd2lmdCUyMGNvbmNlcnR8ZW58MXx8fHwxNzU5MjQ4MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        trending: true,
        funding_rate: "0.005%/hr",
        spot_price: 849.21
      }
    ],
    "High Volume": [
      {
        id: "lebron-james",
        name: "LeBron James",
        category: "NBA",
        price: 150.34,
        change: 15.67,
        changePercent: 1.79,
        volume: "$2.3M",
        image: "https://images.unsplash.com/photo-1585071258252-369a36d89e30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwcGxheWVyfGVufDF8fHx8MTc1OTI0ODI4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        trending: true,
        funding_rate: "0.001%/hr",
        spot_price: 893.11
      },
      {
        id: "dune-part-two",
        name: "Dune: Part Two",
        category: "Movie",
        price: 789.45,
        change: 34.67,
        changePercent: 4.59,
        volume: "$1.5M",
        image: "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHByZW1pZXJlfGVufDF8fHx8MTc1OTE5OTUwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        trending: true,
        funding_rate: "0.003%/hr",
        spot_price: 790.12
      }
    ]
  },
  entertainment: {
    "Movies": [
      {
        id: "dune-part-two",
        name: "Dune: Part Two",
        category: "Movie",
        price: 789.45,
        change: 34.67,
        changePercent: 4.59,
        volume: "$1.5M",
        image: "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHByZW1pZXJlfGVufDF8fHx8MTc1OTE5OTUwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        funding_rate: "0.003%/hr",
        spot_price: 788.16
      }
    ],
    "TV Shows": [
      {
        id: "stranger-things",
        name: "Stranger Things",
        category: "TV Show",
        price: 412.88,
        change: -5.23,
        changePercent: -1.25,
        volume: "$743K",
        image: "https://images.unsplash.com/photo-1632637780406-9183c0664545?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXRmbGl4JTIwdHYlMjBzaG93fGVufDF8fHx8MTc1OTE1MjgxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        funding_rate: "0.004%/hr",
        spot_price: 412.22
      }
    ],
    "Actors": [
      {
        id: "leo-dicaprio",
        name: "Leonardo DiCaprio",
        category: "Actor",
        price: 534.21,
        change: 8.92,
        changePercent: 1.70,
        volume: "$892K",
        image: "https://images.unsplash.com/photo-1745979425672-b8c53b567b16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW9uYXJkbyUyMGRpY2FwcmlvfGVufDF8fHx8MTc1OTI0ODI2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        funding_rate: "0.009%/hr",
        spot_price: 534.30
      }
    ]
  },
  politics: {
    "Presidential": [
      {
        id: "presidential-debate",
        name: "Donald Trump",
        category: "Politics",
        price: 1567.89,
        change: 89.45,
        changePercent: 6.05,
        volume: "$5.7M",
        image: "https://images.unsplash.com/photo-1742252306330-453455bd7526?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljYWwlMjBkZWJhdGV8ZW58MXx8fHwxNzU5MjQ4MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        funding_rate: "0.009%/hr",
        spot_price: 1568.33
      }
    ]
  },
  gaming: {
    "Video Games": [
      {
        id: "minecraft",
        name: "Minecraft",
        category: "Gaming",
        price: 1245.67,
        change: 45.89,
        changePercent: 3.82,
        volume: "$3.2M",
        image: "https://images.unsplash.com/photo-1656639969815-1194ca7273bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5lY3JhZnQlMjBnYW1lfGVufDF8fHx8MTc1OTI0NjE3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        funding_rate: "0.004%/hr",
        spot_price: 1246.78
      }
    ]
  },
  music: {
    "Artists": [
      {
        id: "taylor-swift",
        name: "Taylor Swift",
        category: "Music",
        price: 847.32,
        change: 23.45,
        changePercent: 2.85,
        volume: "$2.1M",
        image: "https://images.unsplash.com/photo-1692796226663-dd49d738f43c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXlsb3IlMjBzd2lmdCUyMGNvbmNlcnR8ZW58MXx8fHwxNzU5MjQ4MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        funding_rate: "0.005%/hr",
        spot_price: 847.22
      }
    ]
  },
  sports: {
    "NBA": [
      {
        id: "lebron-james",
        name: "LeBron James",
        category: "NBA",
        price: 150.34,
        change: 15.67,
        changePercent: 1.79,
        volume: "$2.3M",
        image: "https://images.unsplash.com/photo-1585071258252-369a36d89e30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwcGxheWVyfGVufDF8fHx8MTc1OTI0ODI4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        funding_rate: "0.001%/hr",
        spot_price: 893.22
      }
    ],
    "NFL": [
      {
        id: "mahomes",
        name: "Patrick Mahomes",
        category: "NFL",
        price: 623.18,
        change: -12.67,
        changePercent: -1.99,
        volume: "$1.8M",
        image: "https://images.unsplash.com/photo-1640135076167-4958fbae2bfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZmwlMjBmb290YmFsbCUyMHBsYXllcnxlbnwxfHx8fDE3NTkyNDgyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        funding_rate: "0.008%/hr",
        spot_price: 622.27
      }
    ]
  }
};

function App() {
  const [selectedMarket, setSelectedMarket] = useState<MarketWithCalculatedFields | null>(null);
  const [activeCategory, setActiveCategory] = useState("music");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");
  const [markets, setMarkets] = useState<MarketSummaryWithCalculatedFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch markets on component mount
  useEffect(() => {
    fetchMarkets();
  }, []);
  
  // Reset subcategory when main category changes
  useEffect(() => {
    setActiveSubcategory("");
  }, [activeCategory]);
  
  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedMarkets = await api.fetchMarkets();
      const enrichedMarkets = fetchedMarkets.map(enrichMarketSummaryData);
      setMarkets(enrichedMarkets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter markets by category and subcategory
  const getFilteredMarkets = () => {
    let filtered = markets;
    
    // Filter by category (for now, all are music)
    if (activeCategory !== "music") {
      return [];
    }
    
    // Filter by subcategory if selected
    if (activeSubcategory) {
      filtered = filtered.filter(market => market.sub_category === activeSubcategory);
    }
    
    return filtered;
  };
  
  const handleMarketClick = async (marketId: number) => {
    try {
      setError(null);
      
      // Fetch full market data with complete index information
      const fullMarket = await api.fetchFullMarket(marketId);
      const enrichedMarket = enrichMarketData(fullMarket);
      setSelectedMarket(enrichedMarket);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market details');
      console.error('Error fetching market details:', err);
    }
  };
  
  const handleBackToHome = () => {
    setSelectedMarket(null);
  };
  
  if (selectedMarket) {
    return (
      <MarketDetail 
        market={selectedMarket}
        onBack={handleBackToHome}
      />
    );
  }
  
  const renderCategoryContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading markets...</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-red-500 mb-4">Error loading markets: {error}</div>
          <Button onClick={fetchMarkets} variant="outline">
            Retry
          </Button>
        </div>
      );
    }
    
    const filteredMarkets = getFilteredMarkets();
    
    if (filteredMarkets.length === 0) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">No markets found</div>
        </div>
      );
    }
    
    // Group markets by subcategory
    const groupedMarkets: { [key: string]: MarketSummaryWithCalculatedFields[] } = {
      "All Markets": filteredMarkets
    };
    
    if (!activeSubcategory) {
      // Group by subcategory when showing all
      const bySubcategory = filteredMarkets.reduce((acc, market) => {
        const key = market.sub_category.charAt(0).toUpperCase() + market.sub_category.slice(1);
        if (!acc[key]) acc[key] = [];
        acc[key].push(market);
        return acc;
      }, {} as { [key: string]: MarketSummaryWithCalculatedFields[] });
      
      Object.assign(groupedMarkets, bySubcategory);
    }
    
    // Get subcategories for navigation
    const subcategories = ["All", MarketSubCategory.ARTISTS, MarketSubCategory.ALBUMS, MarketSubCategory.SONGS];
    const currentSubcategory = activeSubcategory || "All";
    const displayMarkets = activeSubcategory ? 
      filteredMarkets.filter(m => m.sub_category === activeSubcategory) : 
      filteredMarkets;
    
    return (
      <div>
        {/* Subcategory Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            {subcategories.map((subcategory) => (
              <Button
                key={subcategory}
                variant={currentSubcategory === subcategory ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveSubcategory(subcategory === "All" ? "" : subcategory)}
                className={`rounded-full px-4 py-2 ${
                  currentSubcategory === subcategory 
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Market Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onClick={() => handleMarketClick(market.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Top Gainer</p>
                  <p className="text-2xl font-bold text-gray-900">+5.6%</p>
                </div>
                <div className="text-green-600">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">SOS</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Top Loser</p>
                  <p className="text-2xl font-bold text-gray-900">-1.7%</p>
                </div>
                <div className="text-red-600">
                  <TrendingDown className="w-8 h-8" />
                </div>
              </div>
              <p className="text-sm text-red-600 mt-2">All The Stars</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">24h Volume</p>
                  <p className="text-2xl font-bold text-gray-900">$8.9M</p>
                </div>
                <div className="text-blue-600">
                  <Activity className="w-8 h-8" />
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">1,247 active markets</p>
            </Card>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {/* Main Category Navigation */}
            <div className="flex items-center gap-8">
              {['trending', 'entertainment', 'politics', 'gaming', 'music', 'sports'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-[1.05rem] capitalize transition-all duration-200 ${
                    activeCategory === category 
                      ? 'font-bold text-gray-900' 
                      : 'font-normal text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Create Market Button */}
            <Button variant="outline" className="flex items-center gap-2 ml-8">
              <Plus className="w-4 h-4" />
              Create Market
            </Button>
          </div>

          {/* Category Content */}
          <div className="space-y-8">
            {renderCategoryContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;