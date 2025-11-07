import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTranslation } from "react-i18next";

export function WelcomeMessage() {
  const { userProfile, loading } = useUserProfile();
  const { t, i18n } = useTranslation();

  // keep existing behavior: don't render if still loading or no name
  if (loading || !userProfile.preferredName) return null;

  // localized generation labels (keys: welcome.generations.genAlpha|genZ|genY|genX)
  const generationLabel = userProfile.generation
    ? t(`welcome.generations.${userProfile.generation}`)
    : t("welcome.generations.unknown");

  const getGreeting = () => {
    const name = userProfile.preferredName;
    if (userProfile.generation === "genZ") {
      return t("welcome.greetings.genZ", { name });
    } else if (userProfile.generation === "genAlpha") {
      return t("welcome.greetings.genAlpha", { name });
    } else {
      return t("welcome.greetings.default", { name });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // set direction so alignment inside follows language
      dir={i18n.dir()}
      className="mb-6 glass-card rounded-2xl p-6 border border-primary/20"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <Sparkles className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold gradient-text">
            {getGreeting()}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("welcome.description", { generation: generationLabel })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
