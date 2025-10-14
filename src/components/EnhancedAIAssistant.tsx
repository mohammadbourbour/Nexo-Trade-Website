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

export function EnhancedAIAssistant({ currentSection = 'dashboard', contextData = {} }: EnhancedAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getAITone, complexity, skillProfile } = useAdaptiveContent();
  const { trackQuestion } = useBehaviorTracking();
  const { toast } = useToast();

  const getGreeting = () => {
    const tone = getAITone;
    if (tone === 'casual') {
      return "Hey! 👋 Got questions? I'm here to help! Ask me anything! 🚀";
    }
    if (tone === 'friendly') {
      return "Hello! 👋 Do you have any questions? Feel free to ask!";
    }
    return "Hello. How may I assist you today?";
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
      // Track the question
      trackQuestion(currentSection, input);

      // Prepare context for AI
      const context = {
        section: currentSection,
        skillLevel: skillProfile.skillLevel,
        skillScore: skillProfile.skillScore,
        complexity,
        tone: getAITone,
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
        content: data.response,
        conversationId: data.conversationId,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI assistant',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (conversationId: string, helpful: boolean) => {
    try {
      await supabase
        .from('ai_conversations')
        .update({ was_helpful: helpful })
        .eq('id', conversationId);

      toast({
        title: helpful ? 'Thanks for your feedback! 👍' : 'Thanks for letting us know',
        description: helpful ? 'Glad I could help!' : "I'll try to improve",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getButtonAnimation = () => {
    if (getAITone === 'casual') {
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
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold gradient-text">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">
                      {skillProfile.skillLevel} level
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-destructive/10"
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
                    transition={{ delay: idx * 0.1 }}
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
                            onClick={() => handleFeedback(message.conversationId!, true)}
                            className="h-6 px-2"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.conversationId!, false)}
                            className="h-6 px-2"
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
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
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
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="neon-glow"
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
