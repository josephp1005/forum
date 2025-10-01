import React, { useEffect, useMemo, useRef } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  LineData,
  AreaData,
  BaselineData,
  SeriesOptionsCommon,
  AreaSeries,
  BarSeries,
  LineSeries,
  BaselineSeries,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts';

export type ChartKind = 'candlestick' | 'bar' | 'line' | 'area' | 'baseline';

type TradingChartProps = {
  height?: number;
  dark?: boolean;
  showVolume?: boolean;
  kind?: ChartKind;
};

function genMockCandles(n = 240, startMs = Date.UTC(2024, 0, 1)) {
  const data: CandlestickData[] = [];
  let lastClose = 100;
  for (let i = 0; i < n; i++) {
    const time = Math.floor((startMs + i * 60 * 60 * 1000) / 1000); // hourly
    const drift = (Math.random() - 0.5) * 2.2;
    const open = lastClose;
    const close = Math.max(1, open + drift);
    const high = Math.max(open, close) + Math.random() * 1.6;
    const low = Math.min(open, close) - Math.random() * 1.6;
    lastClose = close;
    data.push({ time, open, high, low, close });
  }
  return data;
}

function candlesToLine(c: CandlestickData[]): LineData[] {
  return c.map((k) => ({ time: k.time, value: k.close }));
}
function candlesToArea(c: CandlestickData[]): AreaData[] {
  return c.map((k) => ({ time: k.time, value: k.close }));
}
function candlesToBaseline(c: CandlestickData[], base = 100): BaselineData[] {
  return c.map((k) => ({ time: k.time, value: k.close }));
}
function genMockVolume(c: CandlestickData[]): HistogramData[] {
  return c.map((k) => ({
    time: k.time,
    value: Math.round(200 + Math.random() * 700),
    color: k.close >= k.open ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)',
  }));
}

const TradingChart: React.FC<TradingChartProps> = ({
  height = 420,
  dark = false,
  showVolume = true,
  kind = 'candlestick',
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // single source of truth: candles; other series derive from it
  const candles = useMemo(() => genMockCandles(), []);
  const volumes = useMemo(() => genMockVolume(candles), [candles]);

  // create / recreate chart if theme or height changes
  useEffect(() => {
    if (!hostRef.current) return;

    const chart = createChart(hostRef.current, {
      height,
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: dark ? '#0b1220' : '#ffffff' },
        textColor: dark ? '#cbd5e1' : '#111827',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: dark ? 'rgba(148,163,184,0.16)' : 'rgba(17,24,39,0.08)' },
        horzLines: { color: dark ? 'rgba(148,163,184,0.16)' : 'rgba(17,24,39,0.08)' },
      },
      crosshair: { mode: CrosshairMode.Magnet },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
    });

    chartRef.current = chart;

    const ro = new ResizeObserver(() => chart.timeScale().fitContent());
    ro.observe(hostRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeRef.current = null;
    };
  }, [dark, height]);

  // helper to (re)build the main price series when kind changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // remove old series if present
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    if (volumeRef.current) {
      chart.removeSeries(volumeRef.current);
      volumeRef.current = null;
    }

    // create correct series
    let s: ISeriesApi<any>;
    switch (kind) {
      case 'bar':
        s = chart.addSeries(BarSeries, {
          upColor: '#10b981',
          downColor: '#ef4444',
        });
        s.setData(candles);
        break;
      case 'line':
        s = chart.addSeries(LineSeries, {
          lineWidth: 2,
        });
        s.setData(candlesToLine(candles));
        break;
      case 'area':
        s = chart.addSeries(AreaSeries,{
          lineWidth: 2,
          topColor: 'rgba(59,130,246,0.25)',
          bottomColor: 'rgba(59,130,246,0.04)',
        });
        s.setData(candlesToArea(candles));
        break;
      case 'baseline':
        s = chart.addSeries(BaselineSeries,{
          baseValue: { type: 'price', price: 100 },
          topLineColor: '#10b981',
          topFillColor1: 'rgba(16,185,129,0.25)',
          topFillColor2: 'rgba(16,185,129,0.03)',
          bottomLineColor: '#ef4444',
          bottomFillColor1: 'rgba(239,68,68,0.25)',
          bottomFillColor2: 'rgba(239,68,68,0.03)',
          lineWidth: 2,
        });
        s.setData(candlesToBaseline(candles));
        break;
      default:
        // 'candlestick'
        s = chart.addSeries(CandlestickSeries, {
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
        s.setData(candles);
        break;
    }

    seriesRef.current = s;

    // optional volume overlay (works for any kind)
    if (showVolume) {
      const vol = chart.addSeries(HistogramSeries, {
        priceScaleId: '',
        priceLineVisible: false,
      });
      vol.setData(volumes);
      volumeRef.current = vol;
    }

    chart.timeScale().fitContent();
  }, [kind, showVolume, candles, volumes]);

  return (
    <div className="w-full" style={{ height }}>
      <div ref={hostRef} className="h-full w-full" />
    </div>
  );
};

export default TradingChart;