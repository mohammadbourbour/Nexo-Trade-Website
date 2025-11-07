// src/components/MarketGauge.tsx
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface MarketGaugeProps {
  riskIndex: number;
  summary: string;
  verdict: "bullish" | "bearish" | "neutral";
}

export function MarketGauge({ riskIndex, summary, verdict }: MarketGaugeProps) {
  const { t, i18n } = useTranslation();

  // clamp to [0,1] to avoid visual/logic issues
  const safeRiskIndex = Math.max(0, Math.min(1, Number(riskIndex) || 0));

  const getRiskLevel = () => {
    if (safeRiskIndex < 0.3) return { key: "low", color: "positive" as const };
    if (safeRiskIndex < 0.6) return { key: "moderate", color: "neutral" as const };
    return { key: "high", color: "negative" as const };
  };

  const riskLevel = getRiskLevel();
  const rotation = -90 + safeRiskIndex * 180; // -90deg to 90deg

  // constants for arc dash (visual tuning, keep same UX)
  const ARC_LENGTH = 251.3; // approximate circumference segment used earlier

  // format percent according to locale (no decimals)
  const fmtPercent = (n: number) => (n * 100).toLocaleString(i18n.language, { maximumFractionDigits: 0 });

  // map verdict to localized label (use existing keys in translations)
  const localizedVerdict =
    verdict === "bullish" ? t("market.verdict.bullish") :
    verdict === "bearish" ? t("market.verdict.bearish") :
    t("market.verdict.neutral");

  const localizedRiskLabel = t(`market.riskLevels.${riskLevel.key}`);

  return (
    <Card className="glass-card p-8" role="region" aria-label={t("market.riskIndexLabel")}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("market.riskIndexLabel")}</h3>
          <div className="relative w-48 h-24" aria-hidden>
            {/* Gauge Background */}
            <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet" role="img">
              {/* Background arc */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Left (positive) and right (negative) muted arcs for context */}
              <path
                d="M 20 90 A 80 80 0 0 1 100 10"
                fill="none"
                stroke="hsl(var(--positive))"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.3"
              />
              <path
                d="M 100 10 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="hsl(var(--negative))"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.3"
              />
              {/* Active arc */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke={`hsl(var(--${riskLevel.color}))`}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${safeRiskIndex * ARC_LENGTH} ${ARC_LENGTH}`}
                className="transition-all duration-1000"
              />
            </svg>

            {/* Needle */}
            <div className="absolute inset-0 flex items-end justify-center">
              <div
                className="w-1 h-16 bg-foreground rounded-full origin-bottom transition-transform duration-1000"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="w-3 h-3 bg-foreground rounded-full -ml-1 -mt-1" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="text-3xl font-bold">{fmtPercent(safeRiskIndex)}</div>
            <Badge
              variant="outline"
              className={`mt-2 ${
                riskLevel.color === "positive"
                  ? "border-positive text-positive"
                  : riskLevel.color === "negative"
                  ? "border-negative text-negative"
                  : "border-neutral text-neutral"
              }`}
            >
              <AlertTriangle className="w-3 h-3 mr-1" aria-hidden />
              {/* keep original layout; text localized */}
              {localizedRiskLabel} {t("market.riskSuffix")}
            </Badge>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("market.summaryTitle")}</h3>
            <p className="text-foreground leading-relaxed">{summary}</p>
          </div>

          {/* Overall Verdict */}
          <div className="flex items-center gap-4 pt-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground">{t("market.overallLabel")}</span>
            <Badge
              variant="outline"
              className={`text-base px-4 py-2 ${
                verdict === "bullish"
                  ? "border-positive text-positive positive-glow"
                  : verdict === "bearish"
                  ? "border-negative text-negative negative-glow"
                  : "border-neutral text-neutral"
              }`}
            >
              {verdict === "bullish" ? (
                <TrendingUp className="w-5 h-5 mr-2" />
              ) : verdict === "bearish" ? (
                <TrendingDown className="w-5 h-5 mr-2" />
              ) : (
                <Minus className="w-5 h-5 mr-2" />
              )}
              {localizedVerdict}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
