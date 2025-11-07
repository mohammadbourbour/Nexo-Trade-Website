// src/components/CoinCard.tsx
import { useState } from "react";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { CoinData } from "../CryptoSentimentProDashboard";
import { useTranslation } from "react-i18next";

// Import coin logos
import btcLogo from "@/assets/coins/btc.png";
import ethLogo from "@/assets/coins/eth.png";
import xrpLogo from "@/assets/coins/xrp.png";
import solLogo from "@/assets/coins/sol.png";
import dogeLogo from "@/assets/coins/doge.png";

interface CoinCardProps {
  coin: string;
  data: CoinData;
  mode: "fundamental" | "combined";
}

const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  XRP: "#23292F",
  SOL: "#14F195",
  DOGE: "#C2A633",
};

const COIN_LOGOS: Record<string, string> = {
  BTC: btcLogo,
  ETH: ethLogo,
  XRP: xrpLogo,
  SOL: solLogo,
  DOGE: dogeLogo,
};

export function CoinCard({ coin, data, mode }: CoinCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const sentimentKey = (data.sentiment || "neutral").toString().toLowerCase();

  const getSentimentColor = () => {
    const d = sentimentKey;
    if (d === "positive") return "positive";
    if (d === "negative") return "negative";
    return "neutral";
  };

  const getSentimentIcon = () => {
    const d = sentimentKey;
    if (d === "positive") return <TrendingUp className="w-4 h-4" />;
    if (d === "negative") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const chartData = (data.history || []).map((value, index) => ({ index, value }));

  // helpers for formatting numbers according to active language
  const fmtPercent = (n: number, digits = 0) =>
    (n * 100).toLocaleString(i18n.language, { maximumFractionDigits: digits });

  const coinFullName = t(`coin.names.${coin}`, coin);

  return (
    <>
      <Card
        className={`glass-card p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer ${
          getSentimentColor() === "positive"
            ? "hover:border-positive hover:shadow-[0_0_20px_hsl(var(--positive)/0.3)]"
            : getSentimentColor() === "negative"
            ? "hover:border-negative hover:shadow-[0_0_20px_hsl(var(--negative)/0.3)]"
            : "hover:border-neutral hover:shadow-[0_0_20px_hsl(var(--neutral)/0.3)]"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center p-2"
              style={{
                background: `linear-gradient(135deg, ${COIN_COLORS[coin]}40, ${COIN_COLORS[coin]}20)`,
                border: `2px solid ${COIN_COLORS[coin]}60`,
              }}
            >
              <img
                src={COIN_LOGOS[coin]}
                alt={t("coin.logoAlt", { coin: coinFullName })}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold">{coin}</h3>
              <p className="text-xs text-muted-foreground">{coinFullName}</p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${
              getSentimentColor() === "positive"
                ? "border-positive text-positive"
                : getSentimentColor() === "negative"
                ? "border-negative text-negative"
                : "border-neutral text-neutral"
            }`}
          >
            {getSentimentIcon()}
            {t(`coin.sentiment.${sentimentKey}`)}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t("aggregator.finalScoreShort", "Score")}</span>
              <span className="text-2xl font-bold">{Number(data.score).toFixed(2)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  getSentimentColor() === "positive"
                    ? "bg-positive"
                    : getSentimentColor() === "negative"
                    ? "bg-negative"
                    : "bg-neutral"
                }`}
                style={{ width: `${(data.score || 0) * 100}%` }}
              />
            </div>
          </div>

          {/* Confidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t("aggregator.confidence")}</span>
              <span className="text-lg font-semibold">{fmtPercent(data.confidence, 0)}%</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-primary transition-all duration-500"
                style={{ width: `${(data.confidence || 0) * 100}%` }}
              />
            </div>
          </div>

          {/* Reason */}
          <p className="text-sm text-muted-foreground line-clamp-2">{data.reason}</p>

          {/* Evidence */}
          {data.evidence_count > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-primary/10 rounded">
                {t("coin.labels.evidenceSourcesCount", { count: data.evidence_count })}
              </span>
            </div>
          )}

          {/* Mini Sparkline */}
          {chartData.length > 0 && (
            <div className="h-16 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={
                      getSentimentColor() === "positive"
                        ? "hsl(var(--positive))"
                        : getSentimentColor() === "negative"
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

          {/* View Details Button */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" size="sm">
                {t("coin.viewDetails")}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center p-1.5"
                    style={{
                      background: `linear-gradient(135deg, ${COIN_COLORS[coin]}40, ${COIN_COLORS[coin]}20)`,
                      border: `2px solid ${COIN_COLORS[coin]}60`,
                    }}
                  >
                    <img src={COIN_LOGOS[coin]} alt={t("coin.logoAlt", { coin: coinFullName })} className="w-full h-full object-contain" />
                  </div>
                  {t("coin.detailsTitle", { coin })}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-semibold mb-2">{t("coin.labels.analysis")}</h4>
                  <p className="text-muted-foreground">{data.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("aggregator.finalScoreShort", "Score")}</p>
                    <p className="text-2xl font-bold">{Number(data.score).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("aggregator.confidence")}</p>
                    <p className="text-2xl font-bold">{fmtPercent(data.confidence, 0)}%</p>
                  </div>
                </div>

                {data.top_examples && data.top_examples.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("coin.topSources")}</h4>
                    <div className="space-y-2">
                      {data.top_examples.map((example) => (
                        <a
                          key={example.i}
                          href={example.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-3 bg-card/50 rounded-lg hover:bg-card transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 mt-1 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          <span className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {example.headline}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {data.history.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">{t("coin.historicalTrend")}</h4>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
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
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </>
  );
}
