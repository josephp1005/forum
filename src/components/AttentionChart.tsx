import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface AttentionChartProps {
  market: {
    name: string;
    price: number;
  };
  events: Array<{
    date: string;
    event: string;
    impact: string;
    description: string;
  }>;
}

export function AttentionChart({ market, events }: AttentionChartProps) {
  // Generate attention score data for the past week
  const generateAttentionData = () => {
    const data = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let baseScore = market.price - 100;
    
    days.forEach((day, index) => {
      // Simulate organic growth with some volatility
      const volatility = (Math.random() - 0.5) * 50;
      const trendGrowth = index * 10; // General upward trend
      const score = baseScore + trendGrowth + volatility;
      
      // Add events on specific days
      let hasEvent = false;
      let eventData = null;
      
      if (index === 2) { // Wednesday - Viral TikTok
        hasEvent = true;
        eventData = { name: "Viral TikTok", impact: "+8.7%" };
      } else if (index === 5) { // Saturday - Album announcement
        hasEvent = true;
        eventData = { name: "Album Release", impact: "+15.2%" };
      }
      
      data.push({
        day,
        score: Math.round(score),
        socialMedia: Math.round(score * 0.4),
        searchVolume: Math.round(score * 0.3),
        mediaChatter: Math.round(score * 0.3),
        hasEvent,
        eventData
      });
      
      baseScore = score;
    });
    
    return data;
  };

  const data = generateAttentionData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Attention Score: <span className="font-medium">{data.score || 0}</span>
            </p>
            <p className="text-green-600">
              Social Media: <span className="font-medium">{data.socialMedia || 0}</span>
            </p>
            <p className="text-purple-600">
              Search Volume: <span className="font-medium">{data.searchVolume || 0}</span>
            </p>
            <p className="text-orange-600">
              Media Chatter: <span className="font-medium">{data.mediaChatter || 0}</span>
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
    if (!payload || !payload.hasEvent) return null;
    
    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy - 10} 
          r={6} 
          fill="#ef4444" 
          stroke="#ffffff" 
          strokeWidth={2}
        />
        <text 
          x={cx} 
          y={cy - 25} 
          textAnchor="middle" 
          fontSize={10} 
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
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Total Attention Score"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="socialMedia" 
            stroke="#16a34a" 
            strokeWidth={2}
            name="Social Media"
            strokeDasharray="5 5"
            dot={false}
          />
          
          <Line 
            type="monotone" 
            dataKey="searchVolume" 
            stroke="#9333ea" 
            strokeWidth={2}
            name="Search Volume"
            strokeDasharray="5 5"
            dot={false}
          />
          
          <Line 
            type="monotone" 
            dataKey="mediaChatter" 
            stroke="#ea580c" 
            strokeWidth={2}
            name="Media Chatter"
            strokeDasharray="5 5"
            dot={false}
          />
          
          {/* Event markers - simplified approach */}
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="transparent"
            dot={(props) => <EventDot {...props} />}
            line={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}