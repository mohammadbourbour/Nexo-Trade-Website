import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Trophy, Award, Coins, Star, TrendingUp, Shield } from "lucide-react";
import { useTraderProfile } from "@/hooks/useTraderProfile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const LEADERBOARD_DATA = [
  { rank: 1, name: "CryptoKing", xp: 15420, accuracy: 94 },
  { rank: 2, name: "TradeWizard", xp: 14850, accuracy: 92 },
  { rank: 3, name: "BlockMaster", xp: 13990, accuracy: 91 },
  { rank: 4, name: "You", xp: 12500, accuracy: 89 },
  { rank: 5, name: "DiamondHands", xp: 11200, accuracy: 87 },
];

const BADGES = [
  { id: "top_analyst", icon: Star, name: "gamification.topAnalyst", color: "text-yellow-400" },
  { id: "risk_master", icon: Shield, name: "gamification.riskMaster", color: "text-blue-400" },
  { id: "accuracy_streak", icon: TrendingUp, name: "gamification.accuracyStreak", color: "text-green-400" },
];

export function GamificationPanel() {
  const { t } = useTranslation();
  const { profile } = useTraderProfile();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="secondary-glow relative">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
          />
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-card border-l border-secondary/30 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl gradient-text">
            <Trophy className="w-6 h-6" />
            {t("gamification.leaderboard")}
          </SheetTitle>
          <SheetDescription>
            Track your progress and compete with other traders
          </SheetDescription>
        </SheetHeader>

        {/* User Stats */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 neon-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("gamification.yourRank")}</p>
              <p className="text-3xl font-bold gradient-text">#{profile.rank || 4}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t("gamification.xp")}</p>
              <p className="text-2xl font-bold text-primary">{profile.xp.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span className="text-primary font-bold">
                {Math.floor((profile.xp % 1000) / 10)}%
              </span>
            </div>
            <Progress value={(profile.xp % 1000) / 10} className="h-2 neon-border" />
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-primary/20">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400">{profile.coins}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" />
              <span className="font-bold text-secondary">{profile.badges.length}</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5" />
            {t("gamification.badges")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map((badge) => {
              const Icon = badge.icon;
              const unlocked = profile.badges.includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-lg text-center transition-all ${
                    unlocked
                      ? "bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/50 neon-glow"
                      : "bg-card/30 border border-border/30 opacity-50"
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${unlocked ? badge.color : "text-muted-foreground"}`} />
                  <p className="text-xs">{t(badge.name)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Traders
          </h3>
          <div className="space-y-2">
            {LEADERBOARD_DATA.map((trader, index) => (
              <motion.div
                key={trader.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg flex items-center justify-between transition-all hover-lift ${
                  trader.name === "You"
                    ? "bg-gradient-to-r from-primary/30 to-secondary/30 border border-primary/50 neon-glow"
                    : "bg-card/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      trader.rank === 1
                        ? "bg-yellow-400/20 text-yellow-400"
                        : trader.rank === 2
                        ? "bg-gray-400/20 text-gray-400"
                        : trader.rank === 3
                        ? "bg-orange-400/20 text-orange-400"
                        : "bg-card"
                    }`}
                  >
                    {trader.rank}
                  </div>
                  <div>
                    <p className="font-medium">{trader.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {trader.accuracy}% accuracy
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{trader.xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
