import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ChartKind } from "./TradingChart";
import TradingChart from "./TradingChart";
import { OrderBook } from "./OrderBook";
import UTCClock from "./UTCClock";
import { MarketWithCalculatedFields } from "../types/market";

interface TradingViewProps {
  market: MarketWithCalculatedFields;
}

export function TradingView({ market }: TradingViewProps) {
  const [orderType, setOrderType] = useState("market");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  const [chartKind, setChartKind] = useState<ChartKind>("candlestick");
  const [showVolume, setShowVolume] = useState(false);

  const mockTrades = [
    { time: "14:32:45", price: 847.32, amount: 12.5, side: "buy" },
    { time: "14:32:12", price: 846.98, amount: 8.2, side: "sell" },
    { time: "14:31:58", price: 847.15, amount: 15.7, side: "buy" },
    { time: "14:31:34", price: 846.87, amount: 22.1, side: "sell" },
    { time: "14:31:11", price: 847.25, amount: 5.8, side: "buy" },
    { time: "14:33:01", price: 847.41, amount: 9.3, side: "buy" },
    { time: "14:33:15", price: 847.39, amount: 11.0, side: "sell" },
    { time: "14:33:28", price: 847.55, amount: 14.2, side: "buy" },
  ];

  const mockPositions = [
    { side: "Long", size: 125.5, entryPrice: 832.45, markPrice: 847.32, pnl: 1867.35, pnlPercent: 1.78 }
  ];

  return (
    // Main grid container defining the overall layout structure
    <div className="grid grid-cols-12 grid-rows-[1fr_auto] mb-2 gap-1 p-0 min-h-[calc(100vh-80px)]">
      
      {/* 1. Price Chart (Top-Left) */}
      <div className="col-span-6 row-span-1">
        <Card className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">Price Chart</h3>
              <div className="ml-2 flex items-center gap-1 rounded-lg border px-2 py-1">
                {(["candlestick","bar","line","area","baseline"] as ChartKind[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setChartKind(k)}
                    className={`rounded px-2 py-1 text-xs capitalize ${
                      chartKind === k ? "bg-slate-100 font-bold" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <label className="ml-2 flex items-center gap-1 text-xs">
                <input type="checkbox" checked={showVolume} onChange={() => setShowVolume(v => !v)} />
                Volume
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">PERP</Badge>
            </div>
          </div>

          <div className="flex-1">
            <TradingChart
              height={445}
              kind={chartKind}
              showVolume={showVolume}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Button radius="sm" variant="outline" size="sm">6M</Button>
              <Button radius="sm" variant="outline" size="sm">3M</Button>
              <Button radius="sm" variant="outline" size="sm">1M</Button>
              <Button radius="sm" variant="default" size="sm">5D</Button>
              <Button radius="sm" variant="outline" size="sm">1D</Button>
              <Button radius="sm" variant="outline" size="sm">4H</Button>
              <Button variant="outline" size="sm">1H</Button>
            </div>
            <div className="flex items-center gap-1">
              <UTCClock />
              <span className="select-none text-slate-300">|</span>
              <button className="font-medium hover:underline">%</button>
              <button className="font-medium hover:underline">LOG</button>
              <button className="text-blue-600 font-semibold hover:underline">AUTO</button>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Order Book & Trade History (Middle, Scrollable) */}
      <div className="col-span-3 row-span-1">
        <Card className="flex flex-col h-full p-4">
          <Tabs defaultValue="orderbook" className="flex flex-col flex-1">
            <TabsList>
              <TabsTrigger value="orderbook">Order Book</TabsTrigger>
              <TabsTrigger value="trades">Trade History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orderbook" className="flex-1 mt-4 overflow-hidden">
              <div className="h-full max-h-[500px] overflow-y-auto">
                <OrderBook currentPrice={market.last_price || 0} spread={0.12} />
              </div>
            </TabsContent>
            
            <TabsContent value="trades" className="flex-1 mt-4 overflow-hidden">
              <div className="h-full max-h-[300px] overflow-y-auto">
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 border-b pb-2 sticky top-0 bg-white">
                    <span>Time</span>
                    <span>Price</span>
                    <span>Amount</span>
                    <span>Side</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    {mockTrades.map((trade, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 text-sm">
                        <span className="text-gray-600">{trade.time}</span>
                        <span className="font-medium">${trade.price.toFixed(2)}</span>
                        <span>{trade.amount}</span>
                        <span className={trade.side === "buy" ? "text-green-600" : "text-red-600"}>
                          {trade.side.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* 3. Trading Form (Right) */}
      <div className="col-span-3 row-span-1">
        <Card className="p-4 h-full">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant={side === "buy" ? "default" : "outline"}
                onClick={() => setSide("buy")}
                className={side === "buy" ? "flex-1 bg-green-600 hover:bg-green-700" : "flex-1" }
              >
                Buy / Long
              </Button>
              <Button
                variant={side === "sell" ? "default" : "outline"}
                onClick={() => setSide("sell")}
                className={side === "sell" ? "flex-1 bg-red-600 hover:bg-red-700" : "flex-1"}
              >
                Sell / Short
              </Button>
            </div>

            <Tabs value={orderType} onValueChange={setOrderType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="limit">Limit</TabsTrigger>
              </TabsList>

              <TabsContent value="market" className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Amount (USD)</label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <Button className={`w-full ${side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                  {side === "buy" ? "Buy" : "Sell"} {market.name}
                </Button>
              </TabsContent>

              <TabsContent value="limit" className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Price (USD)</label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={(market.last_price || 0).toFixed(2)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Amount (USD)</label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <Button className={`w-full ${side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                  Place {side === "buy" ? "Buy" : "Sell"} Order
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
      
      {/* 4. Positions & Open Orders (Bottom) */}
      <div className="col-span-12">
        <Card className="p-4 h-80">
          <Tabs defaultValue="positions">
            <TabsList>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="orders">Open Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="mt-4">
              {mockPositions.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                    <span>Side</span>
                    <span>Size</span>
                    <span>Entry Price</span>
                    <span>Mark Price</span>
                    <span>PnL</span>
                    <span>PnL%</span>
                  </div>
                  {mockPositions.map((position, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 text-sm">
                      <span className="text-green-600 font-medium">{position.side}</span>
                      <span>{position.size}</span>
                      <span>${position.entryPrice.toFixed(2)}</span>
                      <span>${position.markPrice.toFixed(2)}</span>
                      <span className="text-green-600">+${position.pnl.toFixed(2)}</span>
                      <span className="text-green-600">+{position.pnlPercent.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No open positions</div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <div className="text-center py-8 text-gray-500">No open orders</div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}