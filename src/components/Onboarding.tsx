import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Brain, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserProfile, ExperienceLevel, Personality } from "@/hooks/useUserProfile";
import { Card } from "@/components/ui/card";

const steps = [
  {
    id: "welcome",
    title: "Welcome to the Future of Trading",
    subtitle: "AI-powered insights tailored to your style",
  },
  {
    id: "profile",
    title: "Let's personalize your experience",
    subtitle: "We'll adapt everything to match your needs",
  },
];

export function Onboarding() {
  const { updateProfile, completeOnboarding } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    preferredName: "",
    age: "",
    gender: "",
    experienceLevel: "beginner" as ExperienceLevel,
    personality: "casual" as Personality,
  });
  const [errors, setErrors] = useState({
    preferredName: "",
    age: "",
  });

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else {
      // Validate required fields
      const newErrors = {
        preferredName: "",
        age: "",
      };

      if (!formData.preferredName.trim()) {
        newErrors.preferredName = "Please enter your name";
      }

      if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
        newErrors.age = "Please enter a valid age";
      }

      if (newErrors.preferredName || newErrors.age) {
        setErrors(newErrors);
        return;
      }
      
      // Clear errors
      setErrors({ preferredName: "", age: "" });
      
      // Submit and complete onboarding with loading transition
      updateProfile({
        preferredName: formData.preferredName.trim(),
        age: parseInt(formData.age),
        gender: formData.gender || null,
        experienceLevel: formData.experienceLevel,
        personality: formData.personality,
      });
      
      // Small delay for smooth transition
      setTimeout(() => {
        completeOnboarding();
      }, 300);
    }
  };

  const canProceed = currentStep === 0 || (formData.preferredName && formData.age);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 50%, hsl(186 100% 44% / 0.3), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <Card className="glass-card p-8 md:p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />

            {currentStep === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4"
                >
                  <Brain className="w-10 h-10 text-primary" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold gradient-text"
                >
                  {steps[0].title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-muted-foreground max-w-md mx-auto"
                >
                  {steps[0].subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8"
                >
                  {[
                    { icon: Brain, label: "AI-Driven Analytics", color: "primary" },
                    { icon: TrendingUp, label: "Real-time Signals", color: "positive" },
                    { icon: Zap, label: "Adaptive Experience", color: "secondary" },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="glass-card p-4 text-center hover-lift"
                    >
                      <feature.icon className={`w-8 h-8 mx-auto mb-2 text-${feature.color}`} />
                      <p className="text-sm font-medium">{feature.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-4"
                  >
                    <Sparkles className="w-8 h-8 text-secondary" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">{steps[1].title}</h2>
                  <p className="text-muted-foreground">{steps[1].subtitle}</p>
                </div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="name" className="text-base mb-2 block">
                      What should we call you? ✨
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your preferred name"
                      value={formData.preferredName}
                      onChange={(e) => {
                        setFormData({ ...formData, preferredName: e.target.value });
                        setErrors({ ...errors, preferredName: "" });
                      }}
                      className={`glass-card text-lg ${errors.preferredName ? "border-destructive" : ""}`}
                    />
                    {errors.preferredName && (
                      <p className="text-sm text-destructive mt-1">{errors.preferredName}</p>
                    )}
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="age" className="text-base mb-2 block">
                        Your age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => {
                          setFormData({ ...formData, age: e.target.value });
                          setErrors({ ...errors, age: "" });
                        }}
                        className={`glass-card ${errors.age ? "border-destructive" : ""}`}
                      />
                      {errors.age && (
                        <p className="text-sm text-destructive mt-1">{errors.age}</p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="gender" className="text-base mb-2 block">
                        Gender (optional)
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger className="glass-card">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Label htmlFor="experience" className="text-base mb-2 block">
                      Trading experience
                    </Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value: ExperienceLevel) =>
                        setFormData({ ...formData, experienceLevel: value })
                      }
                    >
                      <SelectTrigger className="glass-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">🌱 Just starting out</SelectItem>
                        <SelectItem value="intermediate">📈 Some experience</SelectItem>
                        <SelectItem value="advanced">🚀 Experienced trader</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Label htmlFor="personality" className="text-base mb-2 block">
                      Your interaction style
                    </Label>
                    <Select
                      value={formData.personality || "casual"}
                      onValueChange={(value: Personality) =>
                        setFormData({ ...formData, personality: value })
                      }
                    >
                      <SelectTrigger className="glass-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="analyst">🔍 Analytical - Dense data & details</SelectItem>
                        <SelectItem value="casual">✨ Casual - Simple & clear</SelectItem>
                        <SelectItem value="expert">⚡ Expert - Raw control & advanced</SelectItem>
                        <SelectItem value="learner">📚 Learner - Guided & educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center mt-8"
            >
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 neon-glow group"
              >
                {currentStep === 0 ? "Get Started" : "Launch Dashboard"}
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1 rounded-full ${
                    i === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                  }`}
                  animate={{ scale: i === currentStep ? 1 : 0.8 }}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
