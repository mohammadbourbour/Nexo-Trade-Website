import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTraderProfile, TradingStyle, RiskTolerance } from "@/hooks/useTraderProfile";
import { useToast } from "@/hooks/use-toast";

export function TraderProfilePanel() {
  const { t } = useTranslation();
  const { profile, updateProfile } = useTraderProfile();
  const { toast } = useToast();
  const [tempWeights, setTempWeights] = useState(profile.weights);

  const handleSave = () => {
    updateProfile({ weights: tempWeights });
    toast({
      title: "Preferences Saved",
      description: "Your trading preferences have been updated",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="neon-glow">
          <User className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-card border-l border-primary/30 w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl gradient-text">
            <Settings className="w-6 h-6" />
            {t("profile.title")}
          </SheetTitle>
          <SheetDescription>
            Customize your trading experience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Trading Style */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {t("profile.tradingStyle")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["short", "mid", "long"] as TradingStyle[]).map((style) => (
                <motion.button
                  key={style}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateProfile({ tradingStyle: style })}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    profile.tradingStyle === style
                      ? "bg-primary text-primary-foreground neon-glow"
                      : "bg-card/50 text-muted-foreground hover:bg-card"
                  }`}
                >
                  {t(`tradingStyle.${style}`)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Risk Tolerance */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {t("profile.riskTolerance")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as RiskTolerance[]).map((risk) => (
                <motion.button
                  key={risk}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateProfile({ riskTolerance: risk })}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    profile.riskTolerance === risk
                      ? "bg-secondary text-secondary-foreground secondary-glow"
                      : "bg-card/50 text-muted-foreground hover:bg-card"
                  }`}
                >
                  {t(`profile.${risk}`)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Indicator Weights */}
          <div>
            <label className="text-sm font-medium mb-4 block">
              {t("profile.weights")}
            </label>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">{t("profile.fundamental")}</span>
                  <span className="text-sm font-bold text-primary">
                    {Math.round(tempWeights.fundamental * 100)}%
                  </span>
                </div>
                <Slider
                  value={[tempWeights.fundamental * 100]}
                  onValueChange={([value]) => {
                    const fundamental = value / 100;
                    setTempWeights({
                      fundamental,
                      technical: 1 - fundamental,
                    });
                  }}
                  max={100}
                  step={5}
                  className="neon-border"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">{t("profile.technical")}</span>
                  <span className="text-sm font-bold text-secondary">
                    {Math.round(tempWeights.technical * 100)}%
                  </span>
                </div>
                <Slider
                  value={[tempWeights.technical * 100]}
                  disabled
                  max={100}
                  className="opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 neon-glow"
          >
            <Save className="w-4 h-4 mr-2" />
            {t("profile.savePreferences")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
