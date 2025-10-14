import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementPopupProps {
  show: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export function AchievementPopup({ show, title, description, onClose }: AchievementPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="glass-card p-4 border-2 border-primary/50 neon-glow">
            <div className="flex items-start gap-3">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="flex-shrink-0"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center neon-glow">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg gradient-text mb-1">
                  Achievement Unlocked!
                </h3>
                <p className="font-medium mb-1">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
