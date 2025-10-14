import type { DashboardData } from "@/components/CryptoSentimentProDashboard";

export interface AggregatedCoinData {
  final_score: number;
  final_confidence: number;
  decision: "BUY" | "SELL" | "HOLD";
  fundamental_contribution: number;
  technical_contribution: number;
  history: number[];
}

export function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

export function aggregateSignals(
  data: DashboardData,
  weights: { fundamental: number; technical: number }
): Record<string, AggregatedCoinData> {
  const result: Record<string, AggregatedCoinData> = {};

  const coins = Object.keys(data.fundamental.coins);

  for (const coin of coins) {
    const fundamental = data.fundamental.coins[coin];
    const technical = data.technical.coins[coin];

    if (!fundamental || !technical) continue;

    const fundamentalScore = fundamental.score;
    const technicalScore = technical.ta_score;

    // Calculate final score
    const final_score = clamp(
      0,
      1,
      weights.fundamental * fundamentalScore + weights.technical * technicalScore
    );

    // Calculate final confidence with evidence adjustment
    const evidenceAdjustment = Math.min(1, fundamental.evidence_count / 5);
    const fundamentalConfidence = fundamental.confidence * evidenceAdjustment;
    const technicalConfidence = 0.85; // Technical analysis has consistent confidence

    const final_confidence = clamp(
      0,
      1,
      weights.fundamental * fundamentalConfidence + weights.technical * technicalConfidence
    );

    // Determine decision
    let decision: "BUY" | "SELL" | "HOLD";
    if (final_score >= 0.65 && final_confidence >= 0.7) {
      decision = "BUY";
    } else if (final_score <= 0.35 && final_confidence >= 0.7) {
      decision = "SELL";
    } else {
      decision = "HOLD";
    }

    // Calculate historical combined scores
    const history: number[] = [];
    const historyLength = Math.min(fundamental.history.length, technical.history.length);
    for (let i = 0; i < historyLength; i++) {
      const combinedScore =
        weights.fundamental * fundamental.history[i] + weights.technical * technical.history[i];
      history.push(clamp(0, 1, combinedScore));
    }

    result[coin] = {
      final_score,
      final_confidence,
      decision,
      fundamental_contribution: weights.fundamental * fundamentalScore,
      technical_contribution: weights.technical * technicalScore,
      history,
    };
  }

  return result;
}

export function calculateMarketRisk(data: DashboardData): number {
  const coins = Object.keys(data.fundamental.coins);
  
  // Calculate average volatility
  let totalVolatility = 0;
  let volatilityCount = 0;
  
  for (const coin of coins) {
    const technical = data.technical.coins[coin];
    if (technical?.volatility !== undefined) {
      totalVolatility += technical.volatility;
      volatilityCount++;
    }
  }
  
  const avgVolatility = volatilityCount > 0 ? totalVolatility / volatilityCount : 0;
  
  // Calculate average sentiment score
  let totalScore = 0;
  let scoreCount = 0;
  
  for (const coin of coins) {
    const fundamental = data.fundamental.coins[coin];
    if (fundamental?.score !== undefined) {
      totalScore += fundamental.score;
      scoreCount++;
    }
  }
  
  const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0.5;
  
  // Risk index: high volatility + negative sentiment = high risk
  // Scale: 0 (low risk) to 1 (high risk)
  const volatilityComponent = avgVolatility * 2; // Normalize typical 0-0.5 range to 0-1
  const sentimentComponent = 1 - avgScore; // Invert score: low score = high risk
  
  const riskIndex = clamp(0, 1, (volatilityComponent + sentimentComponent) / 2);
  
  return riskIndex;
}
