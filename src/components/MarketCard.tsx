import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAttentionData } from "../hooks/useAttentionData";

interface MarketCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  image: string;
  trending?: boolean;
  funding_rate: string;
  onClick?: (id: string) => void;
}

export function MarketCard({ 
  id,
  name, 
  category, 
  price, 
  change, 
  changePercent, 
  volume, 
  image,
  trending = false,
  onClick 
}: MarketCardProps) {
  const isPositive = change >= 0;

  // Check if this is LeBron James market for real-time data
  const isLeBronJames = id === 'lebron-james';
  
  // Use real-time data hook for LeBron James
  const {
    data: attentionData,
    loading,
    error,
    lastUpdated,
    nextUpdateIn,
    canUpdate,
    forceUpdate
  } = useAttentionData({
    marketId: id,
    marketName: name,
    isRealTimeMode: isLeBronJames
  });
  
  return (
    <Card 
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-gray-200"
      onClick={() => onClick?.(id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ImageWithFallback 
            src={image}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{category}</p>
          </div>
        </div>
        {/*{trending && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Trending
          </Badge>
        )}*/}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${isLeBronJames && attentionData.length > 0 ? attentionData[attentionData.length - 1]?.attention_score + 0.34 || 0 : price.toFixed(2)}
          </span>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>24h Volume</span>
          <span>{volume}</span>
        </div>
        
        <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${change.toFixed(2)} today
        </div>
      </div>
    </Card>
  );
}