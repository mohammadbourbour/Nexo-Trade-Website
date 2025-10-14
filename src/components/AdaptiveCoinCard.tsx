import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAdaptiveContent } from "@/hooks/useAdaptiveContent";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import type { CoinData } from "./CryptoSentimentProDashboard";

interface AdaptiveCoinCardProps {
  coin: string;
  data: CoinData;
  mode: 'fundamental' | 'technical';
}

export function AdaptiveCoinCard({ coin, data, mode }: AdaptiveCoinCardProps) {
  const { complexity, simplifyText, getTextComplexity, getAnimationIntensity } = useAdaptiveContent();
  const { trackClick, trackHover } = useBehaviorTracking();
  const textConfig = getTextComplexity;
  const animationIntensity = getAnimationIntensity;

  const getSentimentColor = () => {
    if (data.sentiment === "bullish") return "text-positive";
    if (data.sentiment === "bearish") return "text-negative";
    return "text-neutral";
  };

  const getSentimentGlow = () => {
    if (data.sentiment === "bullish") return "positive-glow";
    if (data.sentiment === "bearish") return "negative-glow";
    return "";
  };

  const getSentimentIcon = () => {
    if (data.sentiment === "bullish") return <TrendingUp className="w-5 h-5" />;
    if (data.sentiment === "bearish") return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  const getAnimationConfig = () => {
    switch (animationIntensity) {
      case 'high':
        return {
          hover: { scale: 1.08, y: -8 },
          tap: { scale: 0.95 },
        };
      case 'medium':
        return {
          hover: { scale: 1.05, y: -4 },
          tap: { scale: 0.98 },
        };
      case 'low':
        return {
          hover: { scale: 1.02, y: -2 },
          tap: { scale: 0.99 },
        };
      case 'minimal':
        return {
          hover: { scale: 1.01 },
          tap: { scale: 1 },
        };
      default:
        return {
          hover: { scale: 1.05, y: -4 },
          tap: { scale: 0.98 },
        };
    }
  };

  const displayReason = simplifyText(data.reason, textConfig.wordLimit || undefined);
  const showDetailedInfo = complexity !== 'simple';
  const showExtraMetrics = complexity === 'expert' || complexity === 'detailed';

  return (
    <motion.div
      whileHover={getAnimationConfig().hover}
      whileTap={getAnimationConfig().tap}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => trackClick('coin-card', { coin, mode })}
      onMouseEnter={() => trackHover('coin-card', coin)}
    >
      <Card className={`glass-card hover-lift ${getSentimentGlow()} cursor-pointer`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
              {coin}
              {getSentimentIcon()}
            </CardTitle>
            <Badge
              variant="outline"
              className={`${getSentimentColor()} border-current uppercase font-bold`}
            >
              {data.sentiment}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {textConfig.useTechnicalTerms ? 'Sentiment Score' : 'Score'}
              </span>
              <span className={`text-lg font-bold ${getSentimentColor()}`}>
                {(data.score * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={data.score * 100} className="h-2" />
          </div>

          {/* Confidence (shown for intermediate+) */}
          {showDetailedInfo && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Confidence</span>
                <span className="text-sm font-semibold">
                  {(data.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={data.confidence * 100} className="h-2" />
            </div>
          )}

          {/* Reason */}
          <div>
            <p className="text-sm font-medium mb-1">
              {textConfig.useTechnicalTerms ? 'Analysis' : 'Why?'}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {displayReason}
            </p>
          </div>

          {/* Evidence count (expert only) */}
          {showExtraMetrics && (
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Evidence Sources</span>
              <span className="text-xs font-semibold">{data.evidence_count}</span>
            </div>
          )}

          {/* Simplified explanation for beginners */}
          {complexity === 'simple' && (
            <div className="pt-2 border-t border-primary/20">
              <p className="text-xs text-muted-foreground italic">
                💡 {data.sentiment === 'bullish' ? 'Good signs!' : data.sentiment === 'bearish' ? 'Be careful!' : 'Mixed signals'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
