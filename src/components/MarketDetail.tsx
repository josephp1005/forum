import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { TradingView } from "./TradingView";
import { IndexView } from "./IndexView";

interface MarketDetailProps {
  market: {
    id: string;
    name: string;
    category: string;
    price: number;
    change: number;
    changePercent: number;
    volume: string;
    image: string;
    funding_rate: string;
    spot_price: number
  };
  onBack: () => void;
}

export function MarketDetail({ market, onBack }: MarketDetailProps) {
  const [activeTab, setActiveTab] = useState("trade");
  const isPositive = market.change >= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-3">
                <img 
                  src={market.image}
                  alt={market.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{market.name}</h1>
                  <p className="text-sm text-gray-500">{market.category}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 ml-8">
                <div>
                  <p className="text-2xl font-bold text-gray-900">${market.price.toFixed(2)}</p>
                  <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}% (24h)
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Funding Rate</p>
                  <p className="font-medium text-gray-900">{market.funding_rate}</p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>24h Volume</p>
                  <p className="font-medium text-gray-900">{market.volume}</p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Next funding (est.)</p>
                  <p className="font-medium text-gray-900">22 min</p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Index Price</p>
                  <p className="font-medium text-gray-900">${market.spot_price.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Watch
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-48 grid-cols-2 mt-4">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="index">Index</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade" className="mt-6">
            <TradingView market={market} />
          </TabsContent>
          
          <TabsContent value="index" className="mt-6">
            <IndexView market={market} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}