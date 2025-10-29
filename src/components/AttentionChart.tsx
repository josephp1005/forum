import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface AttentionDataPoint {
  timestamp: string;
  tweet_count: number;
  score: number;
}

interface ChartDataPoint {
  day: string;
  score: number;
  tweet_count?: number;
  timestamp?: string;
  hasEvent: boolean;
  eventData: { name: string; impact: string } | null;
}

interface AttentionChartProps {
  market: {
    id?: string | number;
    name: string;
    last_price?: number;
    index_price?: number;
  };
  events?: Array<{
    date: string;
    event: string;
    impact: string;
    description: string;
  }>;
  realTimeData?: AttentionDataPoint[];
  isRealTimeMode?: boolean;
}

export function AttentionChart({ market, events = [], realTimeData = [], isRealTimeMode = false }: AttentionChartProps) {
  // Generate fake attention score data for non-real-time markets
  const generateFakeAttentionData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let baseScore = (market.last_price || market.index_price || 100) - 100;
    
    days.forEach((day, index) => {
      // Simulate organic growth with some volatility
      const volatility = (Math.random() - 0.5) * 50;
      const trendGrowth = index * 10; // General upward trend
      const score = baseScore + trendGrowth + volatility;
      
      // Add events on specific days for fake data only
      let hasEvent = false;
      let eventData = null;
      
      if (!isRealTimeMode) {
        if (index === 2) { // Wednesday - Viral TikTok
          hasEvent = true;
          eventData = { name: "Viral TikTok", impact: "+8.7%" };
        } else if (index === 5) { // Saturday - Album announcement
          hasEvent = true;
          eventData = { name: "Album Release", impact: "+15.2%" };
        }
      }
      
      data.push({
        day,
        score: Math.round(score),
        hasEvent,
        eventData
      });
      
      baseScore = score;
    });
    
    return data;
  };

  // Transform real-time Twitter data to chart format
  const transformRealTimeData = (data: AttentionDataPoint[]): ChartDataPoint[] => {
    return data.map((point) => {
      const date = new Date(point.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const timeLabel = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      return {
        day: `${dayName} ${timeLabel}`,
        score: point.score,
        tweet_count: point.tweet_count,
        timestamp: point.timestamp,
        hasEvent: false, // No events for real-time data
        eventData: null
      };
    });
  };

  // Use real-time data if available and in real-time mode, otherwise use fake data
  const chartData = isRealTimeMode && realTimeData.length > 0 
    ? transformRealTimeData(realTimeData)
    : generateFakeAttentionData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              <span className="font-medium">{data.score || 0}</span>
            </p>
            {data.hasEvent && data.eventData && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="font-medium text-red-600">{data.eventData.name}</p>
                <p className="text-green-600">{data.eventData.impact}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const EventDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.hasEvent || isRealTimeMode) return null; // No event dots for real-time data
    
    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy} 
          r={6} 
          fill="#ef4444" 
          stroke="#ffffff" 
          strokeWidth={2}
        />
        <text 
          x={cx} 
          y={cy - 25} 
          textAnchor="middle" 
          fontSize={12} 
          fill="#ef4444"
          fontWeight="bold"
        >
          Event
        </text>
      </g>
    );
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Total Attention Score"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          
          {/* Event markers - only for fake data */}
          {!isRealTimeMode && (
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="transparent"
              dot={(props) => <EventDot {...props} />}
              activeDot={false}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}