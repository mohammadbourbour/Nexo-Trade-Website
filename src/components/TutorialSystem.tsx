import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdaptiveContent } from '@/hooks/useAdaptiveContent';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface Tutorial {
  id: string;
  titleKey: string;
  descriptionKey: string;
  steps: TutorialStep[];
  targetSection: string;
  triggerConditions: {
    minIdleTime?: number;
    hesitationCount?: number;
    firstVisit?: boolean;
  };
}

interface TutorialStep {
  titleKey: string;
  contentKey: string;
  element?: string; // CSS selector for element to highlight
  action?: string;
}

/**
 * NOTE:
 * - Text content moved to translation keys (tutorials.system.* and tutorials.ui.*)
 * - Logic and UI unchanged
 */

const TUTORIALS: Tutorial[] = [
  {
    id: 'dashboard-basics',
    titleKey: 'tutorials.system.dashboard_basics.title',
    descriptionKey: 'tutorials.system.dashboard_basics.description',
    targetSection: 'dashboard',
    triggerConditions: { firstVisit: true },
    steps: [
      {
        titleKey: 'tutorials.system.dashboard_basics.steps.welcome.title',
        contentKey: 'tutorials.system.dashboard_basics.steps.welcome.content',
      },
      {
        titleKey: 'tutorials.system.dashboard_basics.steps.market_gauge.title',
        contentKey: 'tutorials.system.dashboard_basics.steps.market_gauge.content',
        element: '.market-gauge',
      },
      {
        titleKey: 'tutorials.system.dashboard_basics.steps.coin_cards.title',
        contentKey: 'tutorials.system.dashboard_basics.steps.coin_cards.content',
        element: '.coin-card',
      },
      {
        titleKey: 'tutorials.system.dashboard_basics.steps.ai_assistant.title',
        contentKey: 'tutorials.system.dashboard_basics.steps.ai_assistant.content',
        element: '.ai-assistant-button',
      },
    ],
  },
  {
    id: 'chart-basics',
    titleKey: 'tutorials.system.chart_basics.title',
    descriptionKey: 'tutorials.system.chart_basics.description',
    targetSection: 'technical',
    triggerConditions: { minIdleTime: 30 },
    steps: [
      {
        titleKey: 'tutorials.system.chart_basics.steps.chart.title',
        contentKey: 'tutorials.system.chart_basics.steps.chart.content',
        element: '.chart-container',
      },
      {
        titleKey: 'tutorials.system.chart_basics.steps.indicators.title',
        contentKey: 'tutorials.system.chart_basics.steps.indicators.content',
      },
      {
        titleKey: 'tutorials.system.chart_basics.steps.interaction.title',
        contentKey: 'tutorials.system.chart_basics.steps.interaction.content',
        action: 'hover-chart',
      },
    ],
  },
  {
    id: 'signals-explained',
    titleKey: 'tutorials.system.signals_explained.title',
    descriptionKey: 'tutorials.system.signals_explained.description',
    targetSection: 'combined',
    triggerConditions: { hesitationCount: 3 },
    steps: [
      {
        titleKey: 'tutorials.system.signals_explained.steps.aggregator.title',
        contentKey: 'tutorials.system.signals_explained.steps.aggregator.content',
      },
      {
        titleKey: 'tutorials.system.signals_explained.steps.buy.title',
        contentKey: 'tutorials.system.signals_explained.steps.buy.content',
      },
      {
        titleKey: 'tutorials.system.signals_explained.steps.sell.title',
        contentKey: 'tutorials.system.signals_explained.steps.sell.content',
      },
      {
        titleKey: 'tutorials.system.signals_explained.steps.confidence.title',
        contentKey: 'tutorials.system.signals_explained.steps.confidence.content',
      },
    ],
  },
];

interface TutorialSystemProps {
  currentSection: string;
}

export function TutorialSystem({ currentSection }: TutorialSystemProps) {
  const { t } = useTranslation();
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const { shouldShowTutorials } = useAdaptiveContent();
  const { trackTutorialView } = useBehaviorTracking();
  const { toast } = useToast();

  useEffect(() => {
    loadCompletedTutorials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (shouldShowTutorials && !activeTutorial) {
      checkTriggerConditions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, shouldShowTutorials, completedTutorials]);

  const loadCompletedTutorials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('tutorial_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) throw error;

      setCompletedTutorials(new Set((data || []).map((t: any) => t.tutorial_id)));
    } catch (error) {
      console.error('Error loading tutorial progress:', error);
    }
  };

  const checkTriggerConditions = () => {
    const tutorial = TUTORIALS.find(t => {
      if (t.targetSection !== currentSection) return false;
      if (completedTutorials.has(t.id)) return false;

      const { firstVisit, minIdleTime } = t.triggerConditions;

      if (firstVisit && completedTutorials.size === 0) return true;
      if (minIdleTime && Date.now() - startTime > minIdleTime * 1000) return true;

      return false;
    });

    if (tutorial) {
      startTutorial(tutorial);
    }
  };

  const startTutorial = (tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    setCurrentStep(0);
    setStartTime(Date.now());
    try {
      trackTutorialView?.(tutorial.id, currentSection);
    } catch (e) {
      // ignore tracking issues
    }
  };

  const nextStep = () => {
    if (!activeTutorial) return;

    if (currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const completeTutorial = async () => {
    if (!activeTutorial) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const duration = Math.floor((Date.now() - startTime) / 1000);

      await supabase.from('tutorial_progress').upsert({
        user_id: user.id,
        tutorial_id: activeTutorial.id,
        completed: true,
        completion_time_seconds: duration,
      });

      setCompletedTutorials(prev => new Set([...prev, activeTutorial.id]));

      toast({
        title: t('tutorials.ui.completeTitle'),
        description: t('tutorials.ui.completeDesc'),
      });
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }

    closeTutorial();
  };

  const closeTutorial = () => {
    setActiveTutorial(null);
    setCurrentStep(0);
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!activeTutorial) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('tutorial_progress')
        .update({ was_helpful: helpful })
        .eq('user_id', user.id)
        .eq('tutorial_id', activeTutorial.id);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (!activeTutorial || !shouldShowTutorials) return null;

  const currentStepData = activeTutorial.steps[currentStep];
  const progress = ((currentStep + 1) / activeTutorial.steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={closeTutorial}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card rounded-2xl p-6 max-w-md w-full border border-primary/30"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold gradient-text">{t(activeTutorial.titleKey)}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('tutorials.ui.stepCounter', { current: currentStep + 1, total: activeTutorial.steps.length })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={closeTutorial}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">{t(currentStepData.titleKey)}</h4>
            <p className="text-muted-foreground text-sm">{t(currentStepData.contentKey)}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={closeTutorial}>
              {t('tutorials.ui.skip')}
            </Button>
            <Button onClick={nextStep} className="gap-2 neon-glow">
              {currentStep === activeTutorial.steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t('tutorials.ui.complete')}
                </>
              ) : (
                <>
                  {t('tutorials.ui.next')}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Feedback (last step) */}
          {currentStep === activeTutorial.steps.length - 1 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">{t('tutorials.ui.wasHelpful')}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="flex-1"
                >
                  {t('tutorials.ui.yes')} 👍
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="flex-1"
                >
                  {t('tutorials.ui.no')} 👎
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
