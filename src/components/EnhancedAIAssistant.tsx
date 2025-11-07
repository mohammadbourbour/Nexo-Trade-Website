// src/components/EnhancedAIAssistant.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdaptiveContent } from '@/hooks/useAdaptiveContent';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  conversationId?: string;
}

interface EnhancedAIAssistantProps {
  currentSection?: string;
  contextData?: Record<string, any>;
}

/**
 * Helper: resolve a value that might be a plain value or a function returning that value.
 * This keeps typing explicit and avoids TS errors when a value can be () => T | T
 */
function resolveMaybeFn<T>(maybeFn: T | (() => T)): T {
  return typeof maybeFn === 'function' ? (maybeFn as () => T)() : (maybeFn as T);
}

export function EnhancedAIAssistant({ currentSection = 'dashboard', contextData = {} }: EnhancedAIAssistantProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getAITone, complexity, skillProfile } = useAdaptiveContent();
  const { trackQuestion } = useBehaviorTracking();
  const { toast } = useToast();

  // support getAITone either as value or function (safe, typed)
  const resolvedTone = resolveMaybeFn<string | undefined>(getAITone) ?? undefined;

  const getGreeting = () => {
    if (resolvedTone === 'casual') {
      return t('ai.enhanced.greeting.casual');
    }
    if (resolvedTone === 'friendly') {
      return t('ai.enhanced.greeting.friendly');
    }
    return t('ai.enhanced.greeting.default');
  };

  useEffect(() => {
    // auto-scroll when messages change
    const el = scrollRef.current;
    if (!el) return;
    // slight delay to let layout settle
    const id = window.setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
    return () => window.clearTimeout(id);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Track the question (optional chaining in case hook returns undefined)
      trackQuestion?.(currentSection, input);

      // Prepare context for AI
      const context = {
        section: currentSection,
        skillLevel: skillProfile?.skillLevel,
        skillScore: skillProfile?.skillScore,
        complexity,
        tone: resolvedTone,
        data: contextData,
      };

      // Call AI assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: input,
          context,
          history: messages.slice(-5), // Last 5 messages for context
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response ?? t('ai.enhanced.fallbackResponse'),
        conversationId: data?.conversationId,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      toast?.({
        title: t('common.error') ?? 'Error',
        description: t('ai.enhanced.failedToRespond') ?? 'Failed to get response from AI assistant',
        variant: 'destructive',
      });

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: t('ai.enhanced.offlineMessage'),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (conversationId: string | undefined, helpful: boolean) => {
    if (!conversationId) return;
    try {
      await supabase
        .from('ai_conversations')
        .update({ was_helpful: helpful })
        .eq('id', conversationId);

      toast?.({
        title: helpful ? t('feedback.thanksHelpful') : t('feedback.thanksNotHelpful'),
        description: helpful ? t('feedback.thanksHelpfulDesc') : t('feedback.thanksNotHelpfulDesc'),
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getButtonAnimation = () => {
    if (resolvedTone === 'casual') {
      return {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      };
    }
    return { scale: [1, 1.05, 1] };
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <motion.button
              whileHover={getButtonAnimation()}
              onClick={() => setIsOpen(true)}
              aria-label={t('ai.openAssistant')}
              className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg neon-glow"
            >
              <MessageCircle className="w-8 h-8 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/30"
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed bottom-8 right-8 w-96 h-[600px] z-50 glass-card rounded-2xl border border-primary/30 shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('ai.assistant')}
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold gradient-text">{t('ai.assistant')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('ai.skillLevel', { level: skillProfile?.skillLevel ?? '—' })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-destructive/10"
                  aria-label={t('common.close')}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">{getGreeting()}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] p-3 rounded-lg',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && message.conversationId && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.conversationId, true)}
                            className="h-6 px-2"
                            aria-label={t('feedback.helpful')}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.conversationId, false)}
                            className="h-6 px-2"
                            aria-label={t('feedback.notHelpful')}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground mt-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('ai.thinking')}</span>
                </motion.div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('ai.askQuestion')}
                  disabled={isLoading}
                  className="flex-1"
                  aria-label={t('ai.askQuestion')}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="neon-glow"
                  aria-label={t('ai.send')}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
