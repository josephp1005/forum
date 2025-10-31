import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "./ui/button";
import { IndexData, TransformedIndex } from "../types/market";
import { RefreshCw } from "lucide-react";

interface ChartDataPoint {
  timestamp: string;
  time: string;
  score: number;
  date: Date;
}

interface AttentionChartProps {
  indexData?: IndexData;
  onTimeframeChange?: (timeframe: string) => void;
  currentTimeframe?: string;
  isLoading?: boolean;
}

const TIMEFRAMES = [
  { key: '3h', label: '3H' },
  { key: '24h', label: '24H' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' }
];

export function AttentionChart({ 
  indexData, 
  onTimeframeChange,
  currentTimeframe = '3h',
  isLoading = false
}: AttentionChartProps) {
  
  const processChartData = (transformedIndex: TransformedIndex): ChartDataPoint[] => {
    const entries = Object.entries(transformedIndex);
    
    return entries
      .map(([timestamp, data]) => {
        const date = new Date(timestamp);
        
        let timeFormat: string;
        if (currentTimeframe === '3h' || currentTimeframe === '24h') {
          timeFormat = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        } else {
          timeFormat = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }
        
        return {
          timestamp,
          time: timeFormat,
          score: data.value || 0,
          date
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const chartData = indexData?.filtered_transformed_index 
    ? processChartData(indexData.filtered_transformed_index)
    : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`Score: ${payload[0].value.toFixed(2)}`}</p>
          <p className="text-xs text-gray-500">{data.timestamp}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center mt-10">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-muted-foreground" />
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-70 w-100 mr-7">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" aspect={2}>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickMargin={25}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                allowDecimals={true}
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 20) / 20,
                  (dataMax: number) => Math.ceil(dataMax * 20) / 20,
                ]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-500">No data available for this timeframe</div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2 mt-5">
        {TIMEFRAMES.map((timeframe) => (
          <Button
            key={timeframe.key}
            variant={currentTimeframe === timeframe.key ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeframeChange?.(timeframe.key)}
            className="h-8 px-3"
          >
            {timeframe.label}
          </Button>
        ))}
      </div>
    </div>
  );
}