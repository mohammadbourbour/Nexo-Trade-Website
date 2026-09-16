import { useState, useEffect } from "react";
import { demoAuth, demoDb } from "@/lib/demo-store";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

interface SkillProfile {
  skillLevel: SkillLevel;
  skillScore: number;
}

function levelFromScore(score: number): SkillLevel {
  if (score >= 8) return "expert";
  if (score >= 6) return "advanced";
  if (score >= 4) return "intermediate";
  return "beginner";
}

export function useSkillScoring() {
  const [skillProfile, setSkillProfile] = useState<SkillProfile>({
    skillLevel: "beginner",
    skillScore: 1,
  });

  useEffect(() => {
    loadSkillProfile();
  }, []);

  const loadSkillProfile = async () => {
    try {
      const { data: { user } } = await demoAuth.getUser();
      if (!user) return;

      const data = demoDb.getProfile(user.id);
      if (data) {
        setSkillProfile({
          skillLevel: (data.skill_level as SkillLevel) || "beginner",
          skillScore: data.skill_score || 1,
        });
      }
    } catch (error) {
      console.error("Error loading skill profile:", error);
    }
  };

  const calculateSkillScore = async () => {
    try {
      const { data: { user } } = await demoAuth.getUser();
      if (!user) return;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      const interactions = demoDb.getInteractions(user.id, since);
      const tutorials = demoDb.getCompletedTutorials(user.id);
      const conversations = demoDb.getConversations(user.id, since);

      let score = 1;
      const uniqueInteractionTypes = new Set(interactions.map((item) => item.interaction_type));
      score += Math.min(uniqueInteractionTypes.size * 0.5, 3);
      score += Math.min(tutorials.length * 0.4, 2);
      const questionComplexity = conversations.length > 5 ? 2 : conversations.length * 0.4;
      score += Math.min(questionComplexity, 2);
      const chartInteractions = interactions.filter(
        (item) => item.interaction_type === "zoom" || item.interaction_type === "pan",
      ).length;
      score += Math.min(chartInteractions * 0.1, 1);
      const totalDuration = interactions.reduce((sum, item) => sum + (item.duration_seconds || 0), 0);
      score += Math.min((totalDuration / 3600) * 0.2, 2);
      score = Math.max(1, Math.min(10, Math.round(score)));

      const level = levelFromScore(score);
      demoDb.updateProfile(user.id, { skill_score: score, skill_level: level });
      setSkillProfile({ skillLevel: level, skillScore: score });
      return { skillLevel: level, skillScore: score };
    } catch (error) {
      console.error("Error calculating skill score:", error);
      return null;
    }
  };

  const updateSkillScore = async (newScore: number) => {
    try {
      const { data: { user } } = await demoAuth.getUser();
      if (!user) return;

      const score = Math.max(1, Math.min(10, newScore));
      const level = levelFromScore(score);
      demoDb.updateProfile(user.id, { skill_score: score, skill_level: level });
      setSkillProfile({ skillLevel: level, skillScore: score });
    } catch (error) {
      console.error("Error updating skill score:", error);
    }
  };

  return {
    skillProfile,
    calculateSkillScore,
    updateSkillScore,
    loadSkillProfile,
  };
}
