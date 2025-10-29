import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MarketWithCalculatedFields } from "../types/market";

interface MarketCardProps {
  market: MarketWithCalculatedFields;
  onClick?: (marketId: number) => void;
}

export function MarketCard({ 
  market,
  onClick 
}: MarketCardProps) {
  const isPositive = market.twenty_four_hour_change >= 0;
  
  // Format volume in a readable way
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };

  // Generate placeholder image based on market name
  const getMarketImage = (name: string) => {
    // For now, use a placeholder - later you can add real images
    return `https://via.placeholder.com/48x48/6366f1/ffffff?text=${name.charAt(0)}`;
  };
  
  return (
    <Card 
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-gray-200"
      onClick={() => onClick?.(market.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ImageWithFallback 
            src={getMarketImage(market.name)}
            alt={market.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{market.name}</h3>
            <p className="text-sm text-gray-500 capitalize">
              {market.category} • {market.sub_category}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${market.last_price?.toFixed(2) || '0.00'}
          </span>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}{market.twenty_four_hour_change?.toFixed(1) || '0.0'}%
            </span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>24h Volume</span>
          <span>{formatVolume(market.twenty_four_hour_vol || 0)}</span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>Index Price</span>
          <span>${market.index_price?.toFixed(2) || '0.00'}</span>
        </div>
        
        <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          Funding: {market.funding_rate?.toFixed(3) || '0.000'}%
        </div>
      </div>
    </Card>
  );
}