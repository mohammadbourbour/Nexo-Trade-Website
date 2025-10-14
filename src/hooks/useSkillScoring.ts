import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface SkillProfile {
  skillLevel: SkillLevel;
  skillScore: number; // 1-10
}

export function useSkillScoring() {
  const [skillProfile, setSkillProfile] = useState<SkillProfile>({
    skillLevel: 'beginner',
    skillScore: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSkillProfile();
  }, []);

  const loadSkillProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('skill_level, skill_score')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSkillProfile({
          skillLevel: data.skill_level as SkillLevel,
          skillScore: data.skill_score || 1,
        });
      }
    } catch (error) {
      console.error('Error loading skill profile:', error);
    }
  };

  const calculateSkillScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user interactions from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: interactions, error: interactionsError } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (interactionsError) throw interactionsError;

      const { data: tutorials, error: tutorialsError } = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (tutorialsError) throw tutorialsError;

      const { data: conversations, error: conversationsError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (conversationsError) throw conversationsError;

      // Calculate score based on multiple factors
      let score = 1;

      // Factor 1: Interaction diversity (max +3)
      const uniqueInteractionTypes = new Set(interactions?.map(i => i.interaction_type) || []);
      score += Math.min(uniqueInteractionTypes.size * 0.5, 3);

      // Factor 2: Tutorial completion (max +2)
      score += Math.min((tutorials?.length || 0) * 0.4, 2);

      // Factor 3: Questions asked quality (max +2)
      const questionComplexity = (conversations?.length || 0) > 5 ? 2 : (conversations?.length || 0) * 0.4;
      score += Math.min(questionComplexity, 2);

      // Factor 4: Chart interactions (max +1)
      const chartInteractions = interactions?.filter(i => 
        i.interaction_type === 'zoom' || i.interaction_type === 'pan'
      ).length || 0;
      score += Math.min(chartInteractions * 0.1, 1);

      // Factor 5: Time spent (max +2)
      const totalDuration = interactions?.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) || 0;
      const hours = totalDuration / 3600;
      score += Math.min(hours * 0.2, 2);

      // Round to nearest integer, ensure 1-10 range
      score = Math.max(1, Math.min(10, Math.round(score)));

      // Determine skill level based on score
      let level: SkillLevel = 'beginner';
      if (score >= 8) level = 'expert';
      else if (score >= 6) level = 'advanced';
      else if (score >= 4) level = 'intermediate';

      // Update database
      await supabase
        .from('user_profiles')
        .update({
          skill_score: score,
          skill_level: level,
        })
        .eq('user_id', user.id);

      setSkillProfile({ skillLevel: level, skillScore: score });

      return { skillLevel: level, skillScore: score };
    } catch (error) {
      console.error('Error calculating skill score:', error);
      return null;
    }
  };

  const updateSkillScore = async (newScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const score = Math.max(1, Math.min(10, newScore));
      let level: SkillLevel = 'beginner';
      if (score >= 8) level = 'expert';
      else if (score >= 6) level = 'advanced';
      else if (score >= 4) level = 'intermediate';

      await supabase
        .from('user_profiles')
        .update({
          skill_score: score,
          skill_level: level,
        })
        .eq('user_id', user.id);

      setSkillProfile({ skillLevel: level, skillScore: score });
    } catch (error) {
      console.error('Error updating skill score:', error);
    }
  };

  return {
    skillProfile,
    calculateSkillScore,
    updateSkillScore,
    loadSkillProfile,
  };
}
