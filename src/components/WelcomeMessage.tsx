import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export function WelcomeMessage() {
  const { userProfile } = useUserProfile();

  if (!userProfile.preferredName) return null;

  const generationLabels = {
    genAlpha: "Gen Alpha",
    genZ: "Gen Z", 
    genY: "Gen Y (Millennial)",
    genX: "Gen X"
  };
  
  const generationLabel = userProfile.generation 
    ? generationLabels[userProfile.generation]
    : "your generation";

  const getGreeting = () => {
    if (userProfile.generation === "genZ") {
      return `Yo ${userProfile.preferredName}! 👋`;
    } else if (userProfile.generation === "genAlpha") {
      return `Hey ${userProfile.preferredName}! 🎨`;
    } else {
      return `Welcome back, ${userProfile.preferredName}! 👋`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
            Your dashboard has been optimized for {generationLabel} experience
          </p>
        </div>
      </div>
    </motion.div>
  );
}
