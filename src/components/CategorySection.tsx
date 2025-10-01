import { MarketCard } from "./MarketCard";

interface Market {
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
}

interface CategorySectionProps {
  title: string;
  markets: Market[];
  onMarketClick?: (id: string) => void;
}

export function CategorySection({ title, markets, onMarketClick }: CategorySectionProps) {
  return (
    <div className="mb-8">
      {title && <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {markets.map((market) => (
          <MarketCard
            key={market.id}
            id={market.id}
            name={market.name}
            category={market.category}
            price={market.price}
            change={market.change}
            changePercent={market.changePercent}
            volume={market.volume}
            image={market.image}
            trending={market.trending}
            onClick={onMarketClick}
          />
        ))}
      </div>
    </div>
  );
}