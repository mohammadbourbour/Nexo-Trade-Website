import { useState, useEffect } from "react";
import { demoAuth, demoDb } from "@/lib/demo-store";

export type Generation = "genAlpha" | "genZ" | "genY" | "genX" | null;
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type Personality = "analyst" | "casual" | "expert" | "learner" | null;

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  age: number | null;
  gender: string | null;
  generation: Generation;
  experienceLevel: ExperienceLevel;
  personality: Personality;
  preferredName: string | null;
}

const DEFAULT_PROFILE: UserProfile = {
  hasCompletedOnboarding: false,
  age: null,
  gender: null,
  generation: null,
  experienceLevel: "beginner",
  personality: null,
  preferredName: null,
};

const THEME_CLASSES = ["theme-genAlpha", "theme-genZ", "theme-genY", "theme-genX"];

export function generationFromAge(age: number): Generation {
  const birthYear = new Date().getFullYear() - age;
  if (birthYear >= 2010) return "genAlpha";
  if (birthYear >= 1997) return "genZ";
  if (birthYear >= 1981) return "genY";
  return "genX";
}

export function applyGenerationTheme(generation: Generation | null) {
  document.body.classList.remove(...THEME_CLASSES);
  if (generation) {
    document.body.classList.add(`theme-${generation}`);
  }
}

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();

    const { data: { subscription } } = demoAuth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        loadUserProfile();
      } else if (event === "SIGNED_OUT") {
        setUserProfile(DEFAULT_PROFILE);
        applyGenerationTheme(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await demoAuth.getUser();

      if (!user) {
        setUserProfile(DEFAULT_PROFILE);
        applyGenerationTheme(null);
        setLoading(false);
        return;
      }

      const profile = demoDb.getProfile(user.id);

      if (profile) {
        const loadedProfile: UserProfile = {
          hasCompletedOnboarding: true,
          age: profile.age,
          gender: null,
          generation: profile.generation as Generation,
          experienceLevel: (profile.skill_level || "beginner") as ExperienceLevel,
          personality: profile.personality as Personality,
          preferredName: profile.preferred_name,
        };

        setUserProfile(loadedProfile);
        applyGenerationTheme(loadedProfile.generation);
      } else {
        setUserProfile(DEFAULT_PROFILE);
        applyGenerationTheme(null);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserProfile(DEFAULT_PROFILE);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const newProfile = { ...prev, ...updates };

      if (updates.age !== undefined && updates.age !== null) {
        newProfile.generation = generationFromAge(updates.age);
      }

      applyGenerationTheme(newProfile.generation);
      return newProfile;
    });
  };

  const completeOnboarding = () => {
    setUserProfile((prev) => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const resetProfile = () => {
    setUserProfile(DEFAULT_PROFILE);
    applyGenerationTheme(null);
  };

  return {
    userProfile,
    updateProfile,
    completeOnboarding,
    resetProfile,
    loading,
  };
}
