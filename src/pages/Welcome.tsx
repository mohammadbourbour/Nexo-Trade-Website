// src/pages/Welcome.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { useUserProfile, ExperienceLevel, Personality, generationFromAge, applyGenerationTheme } from "@/hooks/useUserProfile";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { demoAuth, demoDb } from "@/lib/demo-store";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * Welcome.tsx (i18n-ified + LanguageSwitcher)
 * - All user-facing static strings replaced with t(...) keys
 * - LanguageSwitcher copied from Auth and placed top-right
 * - No UI/UX removal; behavior retained
 */

type FormData = {
  preferredName: string;
  age: string;
  gender: string;
  experienceLevel: ExperienceLevel;
  personality: Personality;
};

export default function Welcome() {
  const navigate = useNavigate();
  const { updateProfile, completeOnboarding } = useUserProfile();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const mountedRef = useRef(true);
  const isSubmittingRef = useRef(false);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    preferredName: "",
    age: "",
    gender: "",
    experienceLevel: "beginner",
    personality: "casual",
  });
  const [errors, setErrors] = useState({ preferredName: "", age: "" });

  // steps built from translations so they update with language
  const steps = [
    {
      id: "welcome",
      title: t("welcome.steps.welcome.title"),
      subtitle: t("welcome.steps.welcome.subtitle"),
    },
    {
      id: "profile",
      title: t("welcome.steps.profile.title"),
      subtitle: t("welcome.steps.profile.subtitle"),
    },
  ];

  useEffect(() => {
    mountedRef.current = true;

    const checkSessionAndProfile = async () => {
      try {
        const { data: { session } } = await demoAuth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const profile = demoDb.getProfile(session.user.id);
        if (profile && mountedRef.current) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("[Welcome] error checking session/profile:", err);
        if (mountedRef.current) navigate("/auth");
      }
    };

    checkSessionAndProfile();

    return () => {
      mountedRef.current = false;
    };
  }, [navigate]);

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // validate
    const newErrors = { preferredName: "", age: "" };
    if (!formData.preferredName.trim()) newErrors.preferredName = t("welcome.validation.nameRequired");
    const ageNum = parseInt(formData.age || "0", 10);
    if (!formData.age || Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120)
      newErrors.age = t("welcome.validation.invalidAge");

    if (newErrors.preferredName || newErrors.age) {
      setErrors(newErrors);
      isSubmittingRef.current = false;
      return;
    }

    // optimistic local update
    updateProfile({
      preferredName: formData.preferredName.trim(),
      age: ageNum,
      gender: formData.gender || null,
      experienceLevel: formData.experienceLevel,
      personality: formData.personality,
    });

    setErrors({ preferredName: "", age: "" });

    try {
      const { data: { user } } = await demoAuth.getUser();
      if (!user) {
        toast({
          title: t("welcome.toast.authIssueTitle"),
          description: t("welcome.toast.authIssueDesc"),
          variant: "destructive",
        });
        if (mountedRef.current) navigate("/auth");
        return;
      }

      const generation = generationFromAge(ageNum);
      const skill_level =
        formData.experienceLevel === "intermediate"
          ? "intermediate"
          : formData.experienceLevel === "advanced"
          ? "advanced"
          : "beginner";
      const skill_score = formData.experienceLevel === "intermediate" ? 5 : formData.experienceLevel === "advanced" ? 8 : 2;

      demoDb.upsertProfile({
        user_id: user.id,
        preferred_name: formData.preferredName.trim(),
        age: ageNum,
        generation,
        skill_level,
        skill_score,
        personality: formData.personality,
      });

      demoDb.upsertPrefs({
        user_id: user.id,
        chart_indicators: [],
        layout_config: {},
        favorite_sections: [],
      });

      applyGenerationTheme(generation);
      toast({ title: t("welcome.toast.profileCreatedTitle"), description: t("welcome.toast.profileCreatedDesc") });
      completeOnboarding();
      if (mountedRef.current) setTimeout(() => navigate("/dashboard"), 300);
    } catch (err) {
      console.error("[Welcome] unexpected error during handleNext:", err);
      toast({ title: t("welcome.toast.errorTitle"), description: t("welcome.toast.errorDesc"), variant: "destructive" });
      completeOnboarding();
      if (mountedRef.current) setTimeout(() => navigate("/dashboard"), 300);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const canProceed = currentStep === 0 || (formData.preferredName.trim().length > 0 && formData.age.trim().length > 0);
  const isRTL = i18n.language === "fa";

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Language switcher in top-right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 50% 50%, hsl(186 100% 44% / 0.3), transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
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
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {currentStep === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
                  <Brain className="w-10 h-10 text-primary" />
                </motion.div>

                <motion.h1
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="text-4xl md:text-5xl font-bold gradient-text pb-8 md:pb-8">
                 {steps[0].title}
                     </motion.h1>


                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl text-muted-foreground max-w-md mx-auto">
                  {steps[0].subtitle}
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                  {[
                    { icon: Brain, labelKey: "welcome.features.ai", color: "primary" },
                    { icon: TrendingUp, labelKey: "welcome.features.realtime", color: "positive" },
                    { icon: Zap, labelKey: "welcome.features.adaptive", color: "secondary" },
                  ].map((feature, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }} className="glass-card p-4 text-center hover-lift">
                      <feature.icon className={`w-8 h-8 mx-auto mb-2 text-${feature.color}`} />
                      <p className="text-sm font-medium">{t(feature.labelKey)}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="text-center mb-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", delay: 0.2 }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-4">
                    <Sparkles className="w-8 h-8 text-secondary" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">{steps[1].title}</h2>
                  <p className="text-muted-foreground">{steps[1].subtitle}</p>
                </div>

                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Label htmlFor="name" className="text-base mb-2 block">{t("welcome.form.nameLabel")}</Label>
                    <Input id="name" placeholder={t("welcome.form.namePlaceholder")} value={formData.preferredName} onChange={(e) => { setFormData({ ...formData, preferredName: e.target.value }); setErrors({ ...errors, preferredName: "" }); }} className={`glass-card text-lg ${errors.preferredName ? "border-destructive" : ""}`} />
                    {errors.preferredName && <p className="text-sm text-destructive mt-1">{errors.preferredName}</p>}
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <Label htmlFor="age" className="text-base mb-2 block">{t("welcome.form.ageLabel")}</Label>
                      <Input id="age" type="number" placeholder={t("welcome.form.agePlaceholder")} value={formData.age} onChange={(e) => { setFormData({ ...formData, age: e.target.value }); setErrors({ ...errors, age: "" }); }} className={`glass-card ${errors.age ? "border-destructive" : ""}`} />
                      {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                      <Label htmlFor="gender" className="text-base mb-2 block">{t("welcome.form.genderLabel")}</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger className="glass-card"><SelectValue placeholder={t("welcome.form.selectPlaceholder")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t("welcome.form.genderOptions.male")}</SelectItem>
                          <SelectItem value="female">{t("welcome.form.genderOptions.female")}</SelectItem>
                          <SelectItem value="other">{t("welcome.form.genderOptions.other")}</SelectItem>
                          <SelectItem value="prefer-not-to-say">{t("welcome.form.genderOptions.preferNot")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Label htmlFor="experience" className="text-base mb-2 block">{t("welcome.form.tradingExperienceLabel")}</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value: ExperienceLevel) => setFormData({ ...formData, experienceLevel: value })}>
                      <SelectTrigger className="glass-card"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{t("welcome.form.experience.beginner")}</SelectItem>
                        <SelectItem value="intermediate">{t("welcome.form.experience.intermediate")}</SelectItem>
                        <SelectItem value="advanced">{t("welcome.form.experience.advanced")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Label htmlFor="personality" className="text-base mb-2 block">{t("welcome.form.personalityLabel")}</Label>
                    <Select value={formData.personality || "casual"} onValueChange={(value: Personality) => setFormData({ ...formData, personality: value })}>
                      <SelectTrigger className="glass-card"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="analyst">{t("welcome.form.personality.analyst")}</SelectItem>
                        <SelectItem value="casual">{t("welcome.form.personality.casual")}</SelectItem>
                        <SelectItem value="expert">{t("welcome.form.personality.expert")}</SelectItem>
                        <SelectItem value="learner">{t("welcome.form.personality.learner")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex justify-center mt-8">
              <Button size="lg" onClick={handleNext} disabled={!canProceed} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 neon-glow group">
                {currentStep === 0 ? t("welcome.actions.getStarted") : t("welcome.actions.launchDashboard")}
                <motion.div className="ml-2" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>

            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, i) => (
                <motion.div key={i} className={`h-1 rounded-full ${i === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"}`} animate={{ scale: i === currentStep ? 1 : 0.8 }} />
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
