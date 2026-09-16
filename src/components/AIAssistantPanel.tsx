import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserProfile } from "@/hooks/useUserProfile";
import { demoAiChat } from "@/lib/demo-ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SAMPLE_RESPONSES = [
  "Based on current market indicators, the combined fundamental and technical signals suggest a moderate buy opportunity for BTC. The sentiment score is trending upward with increasing confidence.",
  "Risk management tip: With current market volatility at 12%, consider adjusting your position sizes to maintain your target risk level. Your risk tolerance is set to medium.",
  "The RSI indicator shows BTC is approaching overbought territory at 68. This, combined with positive fundamental sentiment, suggests potential for a short-term consolidation before the next move.",
  "Your trading style is set to mid-term. Based on this, the weighted signals prioritize fundamental analysis (60%) over technical indicators (40%), which aligns well with holding periods of 1-4 weeks.",
];

export function AIAssistantPanel() {
  const { t } = useTranslation();
  const { userProfile } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>(() => {
    const welcomeKey = userProfile.generation === "genZ" ? "ai.genZWelcome" : "ai.genXWelcome";
    return [
      {
        id: "1",
        role: "assistant",
        content: t(welcomeKey),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const data = await demoAiChat({
        messages: messages
          .concat(userMessage)
          .map((m) => ({ role: m.role, content: m.content })),
        type: "general",
      });

      const aiContent = data?.response || t("ai.errorProcessing");
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("ai.errorConnection"),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="neon-glow relative">
          <Bot className="w-5 h-5 text-primary" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary"
          />
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-card border-l border-primary/30 w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl gradient-text">
            <Bot className="w-6 h-6" />
            {t("ai.assistant")}
          </SheetTitle>
          <SheetDescription>
            {t("ai.assistantDescription")}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea ref={scrollRef} className="flex-1 pr-4 mt-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "bg-card/50 border border-primary/20"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card/50 border border-primary/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                    <span className="text-sm text-muted-foreground">
                      {t("ai.thinking")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("ai.askQuestion")}
            className="flex-1 glass-card border-primary/30"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="bg-primary hover:bg-primary/90 neon-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
