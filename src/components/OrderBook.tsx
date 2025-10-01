interface OrderBookProps {
  currentPrice: number;
}

export function OrderBook({ currentPrice }: OrderBookProps) {
  // Generate mock order book data
  const generateOrderBookData = () => {
    const asks = [];
    const bids = [];
    
    // Generate asks (sell orders) - prices above current price
    for (let i = 1; i <= 10; i++) {
      const price = currentPrice + (i * 0.5);
      const size = Math.random() * 50 + 5;
      asks.push({
        price: Number(price.toFixed(2)),
        size: Number(size.toFixed(1)),
        total: 0
      });
    }
    
    // Generate bids (buy orders) - prices below current price
    for (let i = 1; i <= 10; i++) {
      const price = currentPrice - (i * 0.5);
      const size = Math.random() * 50 + 5;
      bids.push({
        price: Number(price.toFixed(2)),
        size: Number(size.toFixed(1)),
        total: 0
      });
    }
    
    // Calculate cumulative totals
    let askTotal = 0;
    asks.forEach(ask => {
      askTotal += ask.size;
      ask.total = Number(askTotal.toFixed(1));
    });
    
    let bidTotal = 0;
    bids.forEach(bid => {
      bidTotal += bid.size;
      bid.total = Number(bidTotal.toFixed(1));
    });
    
    return { asks: asks.reverse(), bids };
  };

  const { asks, bids } = generateOrderBookData();
  const maxTotal = Math.max(
    Math.max(...asks.map(a => a.total)),
    Math.max(...bids.map(b => b.total))
  );

  const OrderRow = ({ order, type, maxTotal }: { order: any, type: 'ask' | 'bid', maxTotal: number }) => {
    const percentage = (order.total / maxTotal) * 100;
    const bgColor = type === 'ask' ? 'bg-red-50' : 'bg-green-50';
    
    return (
      <div className="relative grid grid-cols-3 gap-2 py-1 px-2 text-sm hover:bg-gray-50">
        <div 
          className={`absolute inset-y-0 right-0 ${bgColor} opacity-30`}
          style={{ width: `${percentage}%` }}
        />
        <span className={`relative z-10 ${type === 'ask' ? 'text-red-600' : 'text-green-600'} font-medium`}>
          ${order.price}
        </span>
        <span className="relative z-10 text-right">{order.size}</span>
        <span className="relative z-10 text-right text-gray-500">{order.total}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 px-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      
      {/* Asks (Sell orders) */}
      <div className="space-y-0.5">
        {asks.map((ask, index) => (
          <OrderRow 
            key={`ask-${index}`} 
            order={ask} 
            type="ask" 
            maxTotal={maxTotal}
          />
        ))}
      </div>
      
      {/* Current Price */}
      <div className="flex items-center justify-center py-2 bg-gray-100 rounded">
        <span className="text-lg font-bold text-gray-900">
          ${currentPrice.toFixed(2)}
        </span>
      </div>
      
      {/* Bids (Buy orders) */}
      <div className="space-y-0.5">
        {bids.map((bid, index) => (
          <OrderRow 
            key={`bid-${index}`} 
            order={bid} 
            type="bid" 
            maxTotal={maxTotal}
          />
        ))}
      </div>
    </div>
  );
}