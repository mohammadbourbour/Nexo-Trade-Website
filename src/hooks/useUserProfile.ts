import { useState, useEffect } from "react";

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

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem("user-profile");
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem("user-profile", JSON.stringify(userProfile));
    
    // Apply generation-specific class to body
    if (userProfile.generation) {
      document.body.classList.remove("theme-genAlpha", "theme-genZ", "theme-genY", "theme-genX");
      document.body.classList.add(`theme-${userProfile.generation}`);
    }
  }, [userProfile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const newProfile = { ...prev, ...updates };
      
      // Auto-detect generation based on age
      if (updates.age !== undefined && updates.age !== null) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - updates.age;
        
        if (birthYear >= 2010) {
          newProfile.generation = "genAlpha";
        } else if (birthYear >= 1997) {
          newProfile.generation = "genZ";
        } else if (birthYear >= 1981) {
          newProfile.generation = "genY";
        } else {
          newProfile.generation = "genX";
        }
      }
      
      return newProfile;
    });
  };

  const completeOnboarding = () => {
    setUserProfile((prev) => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const resetProfile = () => {
    setUserProfile(DEFAULT_PROFILE);
    document.body.classList.remove("theme-genAlpha", "theme-genZ", "theme-genY", "theme-genX");
  };

  return {
    userProfile,
    updateProfile,
    completeOnboarding,
    resetProfile,
  };
}
