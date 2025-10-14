import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { TechnicalData } from "../CryptoSentimentProDashboard";

interface TechnicalPanelProps {
  data: TechnicalData;
}

const COINS = ["BTC", "ETH", "XRP", "SOL", "DOGE"];

export function TechnicalPanel({ data }: TechnicalPanelProps) {
  const getRSIStatus = (rsi: number) => {
    if (rsi >= 70) return { label: "Overbought", color: "negative" };
    if (rsi <= 30) return { label: "Oversold", color: "positive" };
    return { label: "Neutral", color: "neutral" };
  };

  const getMACDStatus = (signal: string) => {
    return signal.toLowerCase() === "bullish"
      ? { label: "Bullish", color: "positive" }
      : { label: "Bearish", color: "negative" };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Technical Analysis</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {COINS.map((coin) => {
          const coinData = data.coins[coin];
          if (!coinData) return null;

          const rsiStatus = getRSIStatus(coinData.rsi);
          const macdStatus = getMACDStatus(coinData.macd_signal);
          const chartData = coinData.history.map((value, index) => ({ index, value }));

          return (
            <Card key={coin} className="glass-card p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Coin Info and Metrics */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{coin}</h3>
                    <Badge variant="outline" className="text-sm">
                      TA Score: {(coinData.ta_score * 100).toFixed(0)}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* RSI */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">RSI</span>
                        <Badge
                          variant="outline"
                          className={`${
                            rsiStatus.color === "positive"
                              ? "border-positive text-positive"
                              : rsiStatus.color === "negative"
                              ? "border-negative text-negative"
                              : "border-neutral text-neutral"
                          }`}
                        >
                          {rsiStatus.label}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">{coinData.rsi.toFixed(1)}</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            rsiStatus.color === "positive"
                              ? "bg-positive"
                              : rsiStatus.color === "negative"
                              ? "bg-negative"
                              : "bg-neutral"
                          }`}
                          style={{ width: `${coinData.rsi}%` }}
                        />
                      </div>
                    </div>

                    {/* MACD */}
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">MACD Signal</span>
                      <div className="flex items-center gap-2">
                        {macdStatus.color === "positive" ? (
                          <TrendingUp className="w-6 h-6 text-positive" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-negative" />
                        )}
                        <span
                          className={`text-lg font-semibold ${
                            macdStatus.color === "positive" ? "text-positive" : "text-negative"
                          }`}
                        >
                          {macdStatus.label}
                        </span>
                      </div>
                    </div>

                    {/* Volatility */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Volatility</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {(coinData.volatility * 100).toFixed(1)}%
                      </div>
                    </div>

                    {/* Moving Averages */}
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Moving Averages</span>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Short MA:</span>
                          <span className="font-medium">${coinData.ma_short.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Long MA:</span>
                          <span className="font-medium">${coinData.ma_long.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support/Resistance */}
                  <div className="p-4 bg-card/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Key Levels</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Support:</span>
                        <span className="font-medium text-positive">
                          ${coinData.ma_long.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resistance:</span>
                        <span className="font-medium text-negative">
                          ${coinData.ma_short.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Historical Chart */}
                <div className="lg:w-80">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">
                    TA Score History
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
