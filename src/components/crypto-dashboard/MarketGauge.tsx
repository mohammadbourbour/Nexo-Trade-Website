import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MarketGaugeProps {
  riskIndex: number;
  summary: string;
  verdict: "bullish" | "bearish" | "neutral";
}

export function MarketGauge({ riskIndex, summary, verdict }: MarketGaugeProps) {
  const getRiskLevel = () => {
    if (riskIndex < 0.3) return { label: "Low", color: "positive" };
    if (riskIndex < 0.6) return { label: "Moderate", color: "neutral" };
    return { label: "High", color: "negative" };
  };

  const riskLevel = getRiskLevel();
  const rotation = -90 + riskIndex * 180; // -90deg to 90deg

  return (
    <Card className="glass-card p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Market Risk Index</h3>
          <div className="relative w-48 h-24">
            {/* Gauge Background */}
            <svg className="w-full h-full" viewBox="0 0 200 100">
              {/* Background arc */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Colored sections */}
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
                strokeDasharray={`${riskIndex * 251.3} 251.3`}
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
            <div className="text-3xl font-bold">{(riskIndex * 100).toFixed(0)}</div>
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
              <AlertTriangle className="w-3 h-3 mr-1" />
              {riskLevel.label} Risk
            </Badge>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Market Summary</h3>
            <p className="text-foreground leading-relaxed">{summary}</p>
          </div>

          {/* Overall Verdict */}
          <div className="flex items-center gap-4 pt-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Overall Market:</span>
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
              {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
