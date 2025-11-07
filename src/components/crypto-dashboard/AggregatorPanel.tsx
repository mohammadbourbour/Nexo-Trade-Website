// src/components/AggregatorPanel.tsx
import { useState } from "react";
import { Download, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { AggregatedCoinData } from "@/lib/aggregator";
import { useTranslation } from "react-i18next";

// Import coin logos
import btcLogo from "@/assets/coins/btc.png";
import ethLogo from "@/assets/coins/eth.png";
import xrpLogo from "@/assets/coins/xrp.png";
import solLogo from "@/assets/coins/sol.png";
import dogeLogo from "@/assets/coins/doge.png";

interface AggregatorPanelProps {
  aggregatedData: Record<string, AggregatedCoinData>;
  weights: { fundamental: number; technical: number };
  onWeightsChange?: (weights: { fundamental: number; technical: number }) => void;
}

const COINS = ["BTC", "ETH", "XRP", "SOL", "DOGE"];

const COIN_LOGOS: Record<string, string> = {
  BTC: btcLogo,
  ETH: ethLogo,
  XRP: xrpLogo,
  SOL: solLogo,
  DOGE: dogeLogo,
};

export function AggregatorPanel({
  aggregatedData,
  weights,
  onWeightsChange,
}: AggregatorPanelProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const getDecisionColor = (decision?: string) => {
    const d = (decision || "").toUpperCase();
    if (d === "BUY") return "positive";
    if (d === "SELL") return "negative";
    return "neutral";
  };

  const exportData = (format: "csv" | "json") => {
    const data = Object.entries(aggregatedData).map(([coin, coinData]) => ({
      coin,
      final_score: coinData.final_score,
      final_confidence: coinData.final_confidence,
      decision: coinData.decision,
      fundamental_contribution: coinData.fundamental_contribution,
      technical_contribution: coinData.technical_contribution,
    }));

    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `crypto-signals-${new Date().toISOString()}.json`;
      a.click();
    } else {
      const csv = [
        "Coin,Final Score,Confidence,Decision,Fundamental,Technical",
        ...data.map(
          (row) =>
            `${row.coin},${row.final_score},${row.final_confidence},${row.decision},${row.fundamental_contribution},${row.technical_contribution}`
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `crypto-signals-${new Date().toISOString()}.csv`;
      a.click();
    }
  };

  const scoreData = COINS.map((coin) => ({
    coin,
    score: aggregatedData[coin]?.final_score || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("aggregator.title")}</h2>
        <div className="flex items-center gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                {t("aggregator.weights")}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>{t("aggregator.adjustWeights")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <p className="text-sm text-muted-foreground">
                  {t("aggregator.weightsManaged")}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t("aggregator.fundamentalWeight")}</label>
                    <span className="text-sm text-muted-foreground">
                      {(weights.fundamental * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider value={[weights.fundamental * 100]} disabled min={0} max={100} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t("aggregator.technicalWeight")}</label>
                    <span className="text-sm text-muted-foreground">
                      {(weights.technical * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider value={[weights.technical * 100]} disabled min={0} max={100} />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={() => exportData("csv")}>
            <Download className="w-4 h-4 mr-2" />
            {t("aggregator.exportCsv")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData("json")}>
            <Download className="w-4 h-4 mr-2" />
            {t("aggregator.exportJson")}
          </Button>
        </div>
      </div>

      {/* Aggregated Scores Bar Chart */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">{t("aggregator.combinedScores")}</h3>
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
                  const decision = aggregatedData[entry.coin]?.decision;
                  const color =
                    (decision || "").toUpperCase() === "BUY"
                      ? "hsl(var(--positive))"
                      : (decision || "").toUpperCase() === "SELL"
                      ? "hsl(var(--negative))"
                      : "hsl(var(--neutral))";
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* AI Verdict Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COINS.map((coin) => {
          const coinData = aggregatedData[coin];
          if (!coinData) return null;

          const decisionColor = getDecisionColor(coinData.decision);
          const chartData = coinData.history.map((value, index) => ({ index, value }));

          // safety: avoid division by zero / NaN when final_score is 0
          const totalContribution =
            coinData.final_score && coinData.final_score > 0
              ? coinData.final_score
              : Math.max(coinData.fundamental_contribution + coinData.technical_contribution, 1);

          const fundamentalPct = (coinData.fundamental_contribution / totalContribution) * 100;
          const technicalPct = (coinData.technical_contribution / totalContribution) * 100;

          const decisionKey = (coinData.decision || "").toLowerCase();

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
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center p-1.5 bg-card/50 border border-border">
                      <img
                        src={COIN_LOGOS[coin]}
                        alt={`${coin} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-bold">{coin}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      decisionColor === "positive"
                        ? "border-positive text-positive positive-glow"
                        : decisionColor === "negative"
                        ? "border-negative text-negative negative-glow"
                        : "border-neutral text-neutral"
                    }`}
                  >
                    {decisionKey ? t(`signals.${decisionKey}`) : t("signals.neutral")}
                  </Badge>
                </div>

                {/* Scores */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{t("aggregator.finalScore")}</span>
                      <span className="text-xl font-bold">
                        {(coinData.final_score * 100).toFixed(0)}%
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
                        style={{ width: `${coinData.final_score * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{t("aggregator.confidence")}</span>
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
                </div>

                {/* Contribution Breakdown */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t("aggregator.signalBreakdown")}</p>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="bg-primary" style={{ width: `${fundamentalPct}%` }} />
                    <div className="bg-secondary" style={{ width: `${technicalPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {t("profile.fundamental")}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      {t("profile.technical")}
                    </span>
                  </div>
                </div>

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
