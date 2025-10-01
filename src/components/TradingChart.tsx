import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

interface TradingChartProps {
  market: {
    name: string;
    price: number;
  };
}

export function TradingChart({ market }: TradingChartProps) {
  // Mock candlestick data
  const generateCandlestickData = () => {
    const data = [];
    let price = market.price - 50;
    
    for (let i = 0; i < 50; i++) {
      const open = price;
      const close = price + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      const volume = Math.random() * 1000000 + 100000;
      
      data.push({
        time: new Date(Date.now() - (49 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(volume),
        isGreen: close > open
      });
      
      price = close;
    }
    
    return data;
  };

  const data = generateCandlestickData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Open: <span className="font-medium">${data.open || 0}</span></p>
            <p>High: <span className="font-medium text-green-600">${data.high || 0}</span></p>
            <p>Low: <span className="font-medium text-red-600">${data.low || 0}</span></p>
            <p>Close: <span className="font-medium">${data.close || 0}</span></p>
            <p>Volume: <span className="font-medium">{(data.volume || 0).toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CandlestickBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;
    
    const { open, high, low, close, isGreen } = payload;
    const color = isGreen ? "#16a34a" : "#dc2626";
    const bodyHeight = Math.abs(close - open) * (height / (payload.high - payload.low));
    const bodyY = y + (Math.max(high - Math.max(open, close), 0) * (height / (payload.high - payload.low)));
    
    return (
      <g>
        {/* Wick line */}
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + height}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body rectangle */}
        <rect
          x={x + width * 0.2}
          y={bodyY}
          width={width * 0.6}
          height={Math.max(bodyHeight, 1)}
          fill={color}
        />
      </g>
    );
  };

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            domain={['dataMin - 5', 'dataMax + 5']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={market.price} 
            stroke="#3b82f6" 
            strokeDasharray="2 2" 
            label={{ value: "Current Price", position: "topRight" }}
          />
          <Bar 
            dataKey="high" 
            shape={<CandlestickBar />}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}