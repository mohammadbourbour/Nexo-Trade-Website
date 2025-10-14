import { useMemo } from 'react';
import { useUserProfile } from './useUserProfile';
import { useSkillScoring } from './useSkillScoring';

export type ContentComplexity = 'simple' | 'moderate' | 'detailed' | 'expert';

export function useAdaptiveContent() {
  const { userProfile } = useUserProfile();
  const { skillProfile } = useSkillScoring();

  const complexity = useMemo((): ContentComplexity => {
    const score = skillProfile.skillScore;
    if (score >= 8) return 'expert';
    if (score >= 6) return 'detailed';
    if (score >= 4) return 'moderate';
    return 'simple';
  }, [skillProfile.skillScore]);

  const getMaxIndicators = useMemo(() => {
    switch (complexity) {
      case 'expert': return 7;
      case 'detailed': return 5;
      case 'moderate': return 3;
      case 'simple': return 2;
      default: return 2;
    }
  }, [complexity]);

  const shouldShowAdvancedFeatures = useMemo(() => {
    return skillProfile.skillScore >= 6;
  }, [skillProfile.skillScore]);

  const shouldShowTutorials = useMemo(() => {
    return skillProfile.skillScore < 5;
  }, [skillProfile.skillScore]);

  const getTextComplexity = useMemo(() => {
    switch (complexity) {
      case 'expert':
        return {
          wordLimit: null, // No limit
          useTechnicalTerms: true,
          showDetailedExplanations: true,
        };
      case 'detailed':
        return {
          wordLimit: 150,
          useTechnicalTerms: true,
          showDetailedExplanations: true,
        };
      case 'moderate':
        return {
          wordLimit: 100,
          useTechnicalTerms: false,
          showDetailedExplanations: false,
        };
      case 'simple':
        return {
          wordLimit: 50,
          useTechnicalTerms: false,
          showDetailedExplanations: false,
        };
    }
  }, [complexity]);

  const getChartType = useMemo(() => {
    switch (complexity) {
      case 'expert':
      case 'detailed':
        return 'candlestick';
      case 'moderate':
        return 'line';
      case 'simple':
        return 'bar';
    }
  }, [complexity]);

  const getAnimationIntensity = useMemo(() => {
    const generation = userProfile.generation;
    const score = skillProfile.skillScore;

    if (generation === 'genAlpha' && score < 5) return 'high';
    if (generation === 'genZ' && score < 7) return 'medium';
    if (generation === 'genY') return 'low';
    if (generation === 'genX') return 'minimal';
    return 'medium';
  }, [userProfile.generation, skillProfile.skillScore]);

  const getAITone = useMemo(() => {
    const generation = userProfile.generation;
    const personality = userProfile.personality;

    if (generation === 'genAlpha' || generation === 'genZ') {
      return 'casual'; // Emoji-rich, playful
    }
    if (personality === 'casual') {
      return 'friendly';
    }
    return 'professional'; // Formal, concise
  }, [userProfile.generation, userProfile.personality]);

  const simplifyText = (text: string, maxWords?: number): string => {
    if (!maxWords) return text;
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  return {
    complexity,
    skillProfile,
    getMaxIndicators,
    shouldShowAdvancedFeatures,
    shouldShowTutorials,
    getTextComplexity,
    getChartType,
    getAnimationIntensity,
    getAITone,
    simplifyText,
  };
}
