import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrackInteractionParams {
  type: 'click' | 'hover' | 'scroll' | 'zoom' | 'pan' | 'view' | 'question' | 'tutorial_view';
  section: string;
  details?: Record<string, any>;
}

export function useBehaviorTracking() {
  const { toast } = useToast();
  const startTimeRef = useRef<number>(Date.now());
  const currentSectionRef = useRef<string>('');

  const trackInteraction = async ({ type, section, details }: TrackInteractionParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      await supabase.from('user_interactions').insert({
        user_id: user.id,
        interaction_type: type,
        section,
        details: details || {},
        duration_seconds: duration,
      });

      // Reset timer for next interaction
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const trackSectionView = (section: string) => {
    if (currentSectionRef.current !== section) {
      trackInteraction({ type: 'view', section });
      currentSectionRef.current = section;
    }
  };

  const trackClick = (section: string, details?: Record<string, any>) => {
    trackInteraction({ type: 'click', section, details });
  };

  const trackHover = (section: string, element: string) => {
    trackInteraction({ type: 'hover', section, details: { element } });
  };

  const trackScroll = (section: string, scrollDepth: number) => {
    trackInteraction({ type: 'scroll', section, details: { scrollDepth } });
  };

  const trackChartInteraction = (section: string, action: 'zoom' | 'pan', details?: Record<string, any>) => {
    trackInteraction({ type: action, section, details });
  };

  const trackQuestion = (section: string, question: string) => {
    trackInteraction({ type: 'question', section, details: { question } });
  };

  const trackTutorialView = (tutorialId: string, section: string) => {
    trackInteraction({ type: 'tutorial_view', section, details: { tutorialId } });
  };

  return {
    trackSectionView,
    trackClick,
    trackHover,
    trackScroll,
    trackChartInteraction,
    trackQuestion,
    trackTutorialView,
  };
}
