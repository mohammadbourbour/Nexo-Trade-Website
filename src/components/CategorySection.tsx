import { motion } from "framer-motion";
import { Brain, User, Sparkles } from "lucide-react";
import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTranslation } from "react-i18next";

interface CategorySectionProps {
  type: "ai-driven" | "user-adaptive";
  children: React.ReactNode;
}

export function CategorySection({ type, children }: CategorySectionProps) {
  const { t } = useTranslation();
  const { userProfile } = useUserProfile();
  const isGenZ = userProfile.generation === "genZ";

  const config: Record<
    "ai-driven" | "user-adaptive",
    {
      icon: ComponentType<any>;
      titleKey: string;
      subtitleKey: string;
      gradient: string;
      iconColor: string;
      borderColor: string;
    }
  > = {
    "ai-driven": {
      icon: Brain,
      titleKey: "category.ai.title",
      subtitleKey: "category.ai.subtitle",
      gradient: "from-primary/20 via-secondary/10 to-transparent",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
    "user-adaptive": {
      icon: User,
      titleKey: "category.user.title",
      subtitleKey: "category.user.subtitle",
      gradient: "from-secondary/20 via-accent/10 to-transparent",
      iconColor: "text-secondary",
      borderColor: "border-secondary/30",
    },
  };

  const { icon: Icon, titleKey, subtitleKey, gradient, iconColor, borderColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className={`glass-card border-2 ${borderColor} overflow-hidden relative`}>
        {/* Animated background gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: isGenZ ? 3 : 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Decorative particles for Gen Z */}
        {isGenZ && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/40 rounded-full"
                style={{
                  left: `${(i * 12.5)}%`,
                  top: "50%",
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className={`p-3 rounded-xl bg-card/50 ${borderColor} border`}
              whileHover={{ scale: 1.1, rotate: isGenZ ? 360 : 0 }}
              transition={{ duration: isGenZ ? 0.6 : 0.3 }}
            >
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {t(titleKey)}
                {type === "ai-driven" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t(subtitleKey)}</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
