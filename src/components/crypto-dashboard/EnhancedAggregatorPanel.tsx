import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus, Activity, Newspaper, LineChart as LineChartIcon } from "lucide-react";
import type { AggregatedCoinData } from "@/lib/aggregator";

interface EnhancedAggregatorPanelProps {
  aggregatedData: Record<string, AggregatedCoinData>;
  weights: { fundamental: number; technical: number };
}

type SignalMode = "combined" | "technical" | "news";

const COINS = ["BTC", "ETH", "XRP", "SOL", "DOGE"];

export function EnhancedAggregatorPanel({
  aggregatedData,
  weights,
}: EnhancedAggregatorPanelProps) {
  const [signalMode, setSignalMode] = useState<SignalMode>("combined");

  const getDecisionColor = (decision: string) => {
    if (decision === "BUY") return "positive";
    if (decision === "SELL") return "negative";
    return "neutral";
  };

  const getSignalIcon = (decision: string) => {
    if (decision === "BUY") return <TrendingUp className="w-5 h-5" />;
    if (decision === "SELL") return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  // Calculate mode-specific scores
  const getModeScore = (coin: string) => {
    const data = aggregatedData[coin];
    if (!data) return 0;

    switch (signalMode) {
      case "technical":
        return data.technical_contribution;
      case "news":
        return data.fundamental_contribution;
      default:
        return data.final_score;
    }
  };

  const getModeDecision = (coin: string) => {
    const score = getModeScore(coin);
    if (score >= 0.65) return "BUY";
    if (score <= 0.35) return "SELL";
    return "HOLD";
  };

  const scoreData = COINS.map((coin) => ({
    coin,
    score: getModeScore(coin),
  }));

  const averageScore = scoreData.reduce((sum, item) => sum + item.score, 0) / COINS.length;
  const overallDecision = averageScore >= 0.65 ? "BUY" : averageScore <= 0.35 ? "SELL" : "HOLD";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Signal Aggregator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Combining technical analysis and market sentiment
          </p>
        </div>
        
        <ToggleGroup
          type="single"
          value={signalMode}
          onValueChange={(value) => value && setSignalMode(value as SignalMode)}
          className="glass-card p-1"
        >
          <ToggleGroupItem value="technical" className="gap-2">
            <LineChartIcon className="w-4 h-4" />
            Technical
          </ToggleGroupItem>
          <ToggleGroupItem value="news" className="gap-2">
            <Newspaper className="w-4 h-4" />
            News
          </ToggleGroupItem>
          <ToggleGroupItem value="combined" className="gap-2">
            <Activity className="w-4 h-4" />
            Combined
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Overall Market Signal */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Overall Market Signal</h3>
            <p className="text-sm text-muted-foreground">
              {signalMode === "combined" && "Based on technical + news analysis"}
              {signalMode === "technical" && "Based on technical indicators only"}
              {signalMode === "news" && "Based on news sentiment only"}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-3 mb-2">
              {getSignalIcon(overallDecision)}
              <Badge
                variant="outline"
                className={`text-2xl px-6 py-3 ${
                  getDecisionColor(overallDecision) === "positive"
                    ? "border-positive text-positive positive-glow"
                    : getDecisionColor(overallDecision) === "negative"
                    ? "border-negative text-negative negative-glow"
                    : "border-neutral text-neutral"
                }`}
              >
                {overallDecision}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Confidence: {(averageScore * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </Card>

      {/* Signal Comparison Chart */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">
          {signalMode === "combined" && "Combined Signal Strength"}
          {signalMode === "technical" && "Technical Signal Strength"}
          {signalMode === "news" && "News Sentiment Strength"}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData}>
              <XAxis dataKey="coin" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {scoreData.map((entry, index) => {
                  const decision = getModeDecision(entry.coin);
                  const color =
                    decision === "BUY"
                      ? "hsl(var(--positive))"
                      : decision === "SELL"
                      ? "hsl(var(--negative))"
                      : "hsl(var(--neutral))";
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Individual Coin Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COINS.map((coin) => {
          const coinData = aggregatedData[coin];
          if (!coinData) return null;

          const modeScore = getModeScore(coin);
          const modeDecision = getModeDecision(coin);
          const decisionColor = getDecisionColor(modeDecision);
          const chartData = coinData.history.map((value, index) => ({ index, value }));

          return (
            <Card
              key={coin}
              className={`glass-card p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                decisionColor === "positive"
                  ? "hover:border-positive hover:shadow-[0_0_20px_hsl(var(--positive)/0.3)]"
                  : decisionColor === "negative"
                  ? "hover:border-negative hover:shadow-[0_0_20px_hsl(var(--negative)/0.3)]"
                  : "hover:border-neutral hover:shadow-[0_0_20px_hsl(var(--neutral)/0.3)]"
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{coin}</h3>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-2 ${
                      decisionColor === "positive"
                        ? "border-positive text-positive positive-glow"
                        : decisionColor === "negative"
                        ? "border-negative text-negative negative-glow"
                        : "border-neutral text-neutral"
                    }`}
                  >
                    {getSignalIcon(modeDecision)}
                    {modeDecision}
                  </Badge>
                </div>

                {/* Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Signal Strength</span>
                    <span className="text-xl font-bold">
                      {(modeScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        decisionColor === "positive"
                          ? "bg-positive"
                          : decisionColor === "negative"
                          ? "bg-negative"
                          : "bg-neutral"
                      }`}
                      style={{ width: `${modeScore * 100}%` }}
                    />
                  </div>
                </div>

                {/* Confidence */}
                {signalMode === "combined" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="text-lg font-semibold">
                        {(coinData.final_confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${coinData.final_confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Signal Source Breakdown (Combined mode only) */}
                {signalMode === "combined" && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Signal Sources</p>
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-primary"
                        style={{
                          width: `${(coinData.fundamental_contribution / coinData.final_score) * 100}%`,
                        }}
                        title={`News: ${((coinData.fundamental_contribution / coinData.final_score) * 100).toFixed(0)}%`}
                      />
                      <div
                        className="bg-secondary"
                        style={{
                          width: `${(coinData.technical_contribution / coinData.final_score) * 100}%`,
                        }}
                        title={`Technical: ${((coinData.technical_contribution / coinData.final_score) * 100).toFixed(0)}%`}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        News
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        Technical
                      </span>
                    </div>
                  </div>
                )}

                {/* Mini Timeline */}
                {chartData.length > 0 && (
                  <div className="h-16 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={
                            decisionColor === "positive"
                              ? "hsl(var(--positive))"
                              : decisionColor === "negative"
                              ? "hsl(var(--negative))"
                              : "hsl(var(--neutral))"
                          }
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
