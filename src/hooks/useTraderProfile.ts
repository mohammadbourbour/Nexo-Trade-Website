import { useState, useEffect } from "react";

export type TradingStyle = "short" | "mid" | "long";
export type RiskTolerance = "low" | "medium" | "high";

export interface TraderProfile {
  tradingStyle: TradingStyle;
  riskTolerance: RiskTolerance;
  weights: {
    fundamental: number;
    technical: number;
  };
  xp: number;
  coins: number;
  badges: string[];
  rank: number;
}

const DEFAULT_PROFILE: TraderProfile = {
  tradingStyle: "mid",
  riskTolerance: "medium",
  weights: {
    fundamental: 0.6,
    technical: 0.4,
  },
  xp: 0,
  coins: 0,
  badges: [],
  rank: 0,
};

export function useTraderProfile() {
  const [profile, setProfile] = useState<TraderProfile>(() => {
    const stored = localStorage.getItem("trader-profile");
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem("trader-profile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<TraderProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addXP = (amount: number) => {
    setProfile((prev) => ({ ...prev, xp: prev.xp + amount }));
  };

  const addCoins = (amount: number) => {
    setProfile((prev) => ({ ...prev, coins: prev.coins + amount }));
  };

  const addBadge = (badge: string) => {
    setProfile((prev) => ({
      ...prev,
      badges: [...new Set([...prev.badges, badge])],
    }));
  };

  return {
    profile,
    updateProfile,
    addXP,
    addCoins,
    addBadge,
  };
}
