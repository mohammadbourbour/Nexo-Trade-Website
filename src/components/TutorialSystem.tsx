import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdaptiveContent } from '@/hooks/useAdaptiveContent';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  targetSection: string;
  triggerConditions: {
    minIdleTime?: number;
    hesitationCount?: number;
    firstVisit?: boolean;
  };
}

interface TutorialStep {
  title: string;
  content: string;
  element?: string; // CSS selector for element to highlight
  action?: string;
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'dashboard-basics',
    title: 'Dashboard Overview',
    description: 'Learn the basics of navigating your crypto dashboard',
    targetSection: 'dashboard',
    triggerConditions: { firstVisit: true },
    steps: [
      {
        title: 'Welcome!',
        content: 'This dashboard shows you AI-driven crypto sentiment analysis. Let me show you around!',
      },
      {
        title: 'Market Gauge',
        content: 'This gauge shows overall market risk. Green means bullish, red means bearish.',
        element: '.market-gauge',
      },
      {
        title: 'Coin Cards',
        content: 'Each card shows sentiment analysis for a specific cryptocurrency.',
        element: '.coin-card',
      },
      {
        title: 'AI Assistant',
        content: 'Need help? Click the AI assistant button anytime to ask questions!',
        element: '.ai-assistant-button',
      },
    ],
  },
  {
    id: 'chart-basics',
    title: 'Understanding Charts',
    description: 'Learn how to read and interact with charts',
    targetSection: 'technical',
    triggerConditions: { minIdleTime: 30 },
    steps: [
      {
        title: 'Chart Basics',
        content: 'Charts show price trends over time. You can zoom and pan to explore.',
        element: '.chart-container',
      },
      {
        title: 'Indicators',
        content: 'Different colors and lines represent various technical indicators.',
      },
      {
        title: 'Interaction',
        content: 'Try hovering over the chart to see detailed values!',
        action: 'hover-chart',
      },
    ],
  },
  {
    id: 'signals-explained',
    title: 'Understanding Signals',
    description: 'Learn what buy/sell signals mean',
    targetSection: 'combined',
    triggerConditions: { hesitationCount: 3 },
    steps: [
      {
        title: 'Signal Aggregator',
        content: 'This combines fundamental and technical analysis to give you clear signals.',
      },
      {
        title: 'Buy Signals',
        content: 'Green signals suggest favorable buying conditions based on our AI analysis.',
      },
      {
        title: 'Sell Signals',
        content: 'Red signals suggest it might be time to consider selling or holding off.',
      },
      {
        title: 'Confidence',
        content: 'The confidence score shows how certain our AI is about the recommendation.',
      },
    ],
  },
];

interface TutorialSystemProps {
  currentSection: string;
}

export function TutorialSystem({ currentSection }: TutorialSystemProps) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const { shouldShowTutorials } = useAdaptiveContent();
  const { trackTutorialView } = useBehaviorTracking();
  const { toast } = useToast();

  useEffect(() => {
    loadCompletedTutorials();
  }, []);

  useEffect(() => {
    if (shouldShowTutorials && !activeTutorial) {
      checkTriggerConditions();
    }
  }, [currentSection, shouldShowTutorials]);

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

      setCompletedTutorials(new Set(data.map(t => t.tutorial_id)));
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
    trackTutorialView(tutorial.id, currentSection);
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
        title: 'Tutorial Complete! 🎉',
        description: 'Great job! You earned +20 XP',
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
                <h3 className="font-bold gradient-text">{activeTutorial.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {activeTutorial.steps.length}
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
            <h4 className="font-semibold mb-2">{currentStepData.title}</h4>
            <p className="text-muted-foreground text-sm">{currentStepData.content}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={closeTutorial}>
              Skip Tutorial
            </Button>
            <Button onClick={nextStep} className="gap-2 neon-glow">
              {currentStep === activeTutorial.steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Feedback (last step) */}
          {currentStep === activeTutorial.steps.length - 1 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Was this helpful?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="flex-1"
                >
                  Yes 👍
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="flex-1"
                >
                  No 👎
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
