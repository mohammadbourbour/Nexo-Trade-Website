import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(DEFAULT_PROFILE);
        document.body.classList.remove("theme-genAlpha", "theme-genZ", "theme-genY", "theme-genX");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserProfile(DEFAULT_PROFILE);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const loadedProfile: UserProfile = {
          hasCompletedOnboarding: true,
          age: profile.age,
          gender: null,
          generation: profile.generation as Generation,
          experienceLevel: (profile.skill_level || 'beginner') as ExperienceLevel,
          personality: profile.personality as Personality,
          preferredName: profile.preferred_name,
        };
        
        setUserProfile(loadedProfile);
        
        // Apply generation-specific class to body
        if (loadedProfile.generation) {
          document.body.classList.remove("theme-genAlpha", "theme-genZ", "theme-genY", "theme-genX");
          document.body.classList.add(`theme-${loadedProfile.generation}`);
        }
      } else {
        setUserProfile(DEFAULT_PROFILE);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(DEFAULT_PROFILE);
    } finally {
      setLoading(false);
    }
  };

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
    loading,
  };
}
