// src/components/CryptoSentimentProDashboard.tsx
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, TrendingUp, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TraderProfilePanel } from "./TraderProfilePanel";
import { GamificationPanel } from "./GamificationPanel";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { NotificationCenter } from "./NotificationCenter";
import { AchievementPopup } from "./AchievementPopup";
import { useTraderProfile } from "@/hooks/useTraderProfile";
import { CoinCard } from "./crypto-dashboard/CoinCard";
import { MarketGauge } from "./crypto-dashboard/MarketGauge";
import { TechnicalPanel } from "./crypto-dashboard/TechnicalPanel";
import { AggregatorPanel } from "./crypto-dashboard/AggregatorPanel";
import { EnhancedAggregatorPanel } from "./crypto-dashboard/EnhancedAggregatorPanel";
import { TechnicalAnalysisZone } from "./crypto-dashboard/TechnicalAnalysisZone";
import { NewsAnalysisSection } from "./crypto-dashboard/NewsAnalysisSection";
import { ReportsTab } from "./crypto-dashboard/ReportsTab";
import { RefreshControl } from "./crypto-dashboard/RefreshControl";
import { PerformanceBacktest } from "./crypto-dashboard/PerformanceBacktest";
import { CategorySection } from "./CategorySection";
// Onboarding removed intentionally
import { useUserProfile } from "@/hooks/useUserProfile";
import { NavigationDropdown } from "./NavigationDropdown";
import { WelcomeMessage } from "./WelcomeMessage";
import { LogoutButton } from "./LogoutButton";
import { EnhancedAIAssistant } from "./EnhancedAIAssistant";
import { TutorialSystem } from "./TutorialSystem";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { useSkillScoring } from "@/hooks/useSkillScoring";
import { useAdaptiveContent } from "@/hooks/useAdaptiveContent";
import { aggregateSignals, calculateMarketRisk } from "@/lib/aggregator";
import { useToast } from "@/hooks/use-toast";

export interface CoinData {
  sentiment: string;
  score: number;
  confidence: number;
  reason: string;
  evidence_count: number;
  top_examples: Array<{ i: number; headline: string; url: string }>;
  history: number[];
}

export interface FundamentalData {
  metrics: {
    total_articles: number;
    articles_considered: number;
    timestamp: string;
  };
  summary: string;
  coins: Record<string, CoinData>;
}

export interface TechnicalData {
  timestamp: string;
  coins: Record<
    string,
    {
      rsi: number;
      macd_signal: string;
      ma_short: number;
      ma_long: number;
      volatility: number;
      ta_score: number;
      history: number[];
    }
  >;
}

export interface DashboardData {
  fundamental: FundamentalData;
  technical: TechnicalData;
}

type ViewMode =
  | "fundamental"
  | "technical"
  | "combined"
  | "reports"
  | "user-technical"
  | "news-analysis"
  | "signal-aggregator";

interface CryptoSentimentProDashboardProps {
  data?: DashboardData;
  apiEndpoint?: string;
}

const COINS = ["BTC", "ETH", "XRP", "SOL", "DOGE"];

export function CryptoSentimentProDashboard({
  data: propData,
  apiEndpoint = "/api/dashboard/latest",
}: CryptoSentimentProDashboardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, addXP, addCoins } = useTraderProfile();
  const { userProfile, loading: profileLoading, error: profileError } = useUserProfile() as any;
  const [data, setData] = useState<DashboardData | null>(propData || null);
  const [viewMode, setViewMode] = useState<ViewMode>("combined");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [nextUpdate, setNextUpdate] = useState<number>(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState({ title: "", description: "" });
  const { toast } = useToast();

  const { trackSectionView, trackClick } = useBehaviorTracking();
  const { calculateSkillScore } = useSkillScoring();
  const { shouldShowTutorials } = useAdaptiveContent();

  // prevent multiple redirects from different components (Auth + Dashboard)
  const redirectToWelcomeRef = useRef(false);

  // Ensure document <html> dir/lang are in sync with i18n and translations.
  // We prefer i18n.language but also fallback/check the translation key global.isRTL if present.
  useEffect(() => {
    const setDirection = () => {
      const lang = i18n.language || (typeof window !== "undefined" && (document.documentElement.lang || "en"));
      const isRTLFlag = (() => {
        try {
          // t('global.isRTL') returns string "true"/"false" in your files — keep that behavior
          return t("global.isRTL") === "true";
        } catch {
          return false;
        }
      })();
      const dir = lang === "fa" || isRTLFlag ? "rtl" : "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    };

    setDirection();
    // run when language or translations change
  }, [i18n.language, t]);

  // If backend is offline (profileError) we avoid redirecting to welcome to prevent flash/loop.
  useEffect(() => {
    if (profileLoading) return; // still loading profile - wait

    try {
      // If we have a concrete userProfile and onboarding not completed -> redirect once
      if (userProfile && userProfile.hasCompletedOnboarding === false) {
        if (!redirectToWelcomeRef.current && location.pathname !== "/welcome") {
          redirectToWelcomeRef.current = true;
          // small delay so other listeners (Auth) can finish without race
          setTimeout(() => {
            navigate("/welcome", { replace: true });
          }, 50);
        }
        return;
      }

      // If there was an explicit error fetching profile (backend offline),
      // we DO NOT redirect to /welcome — allow dashboard to show cached/mock data.
      if (profileError) {
        console.warn("userProfile fetch error (backend might be offline):", profileError);
        toast?.({
          title: t("dashboard.backendUnreachable.title"),
          description: t("dashboard.backendUnreachable.description"),
          variant: "destructive",
        });
        return;
      }

      // If profile finished loading and no profile at all (userProfile === null),
      // we redirect to /welcome but still guard with ref and check location to avoid duplicate navigations.
      if (userProfile === null && !profileLoading) {
        if (!redirectToWelcomeRef.current && location.pathname !== "/welcome") {
          redirectToWelcomeRef.current = true;
          setTimeout(() => {
            navigate("/welcome", { replace: true });
          }, 50);
        }
      }
    } catch (e) {
      console.error("Error in onboarding redirect logic:", e);
    }
    // we intentionally depend only on these keys
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, profileLoading, profileError, navigate, location.pathname]);

  // fetch data on mount if not provided via props
  useEffect(() => {
    if (!propData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const id = setInterval(fetchData, autoRefreshInterval * 60 * 1000);
      return () => clearInterval(id);
    }
  }, [autoRefreshInterval]);

  // nextUpdate countdown
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      const remaining = autoRefreshInterval * 60 - elapsed;
      setNextUpdate(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [autoRefreshInterval, lastUpdate]);

  // gamification side-effects when data arrives
  useEffect(() => {
    if (data && !isRefreshing) {
      try {
        addXP?.(10);
        addCoins?.(5);
        calculateSkillScore?.();
        if (profile?.xp > 0 && profile?.xp % 1000 === 10) {
          setAchievementData({
            title: t("achievement.levelUp.title"),
            description: t("achievement.levelUp.description", { level: Math.floor(profile.xp / 1000) }),
          });
          setShowAchievement(true);
          setTimeout(() => setShowAchievement(false), 5000);
        }
      } catch (e) {
        console.warn("Gamification hook issue:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isRefreshing]);

  useEffect(() => {
    trackSectionView?.(viewMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
      localStorage.setItem("dashboard-cache", JSON.stringify(json));
      toast?.({ title: t("dashboard.dataRefreshed.title"), description: t("dashboard.dataRefreshed.description") });
    } catch (err) {
      console.error("fetchData error:", err);
      const cached = localStorage.getItem("dashboard-cache");
      if (cached) {
        setData(JSON.parse(cached));
        toast?.({
          title: t("dashboard.cachedData.title"),
          description: t("dashboard.cachedData.description"),
          variant: "destructive",
        });
      } else {
        // if no cache, we keep data null so loading UI shows
        toast?.({
          title: t("dashboard.errorLoading.title"),
          description: t("dashboard.errorLoading.description"),
          variant: "destructive",
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // If we're actively redirecting, don't render the dashboard to avoid flashes
  if (redirectToWelcomeRef.current) {
    return null;
  }

  // If no data available yet, show loading (this prevents white/blank screen)
  if (!data) {
    // root <div> below will have dir set too via effect, but ensure loading respects RTL immediately.
    const loadingDir = i18n.language === "fa" || t("global.isRTL") === "true" ? "rtl" : "ltr";
    return (
      <div className="flex items-center justify-center min-h-screen" dir={loadingDir}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  const marketRisk = calculateMarketRisk(data);
  const aggregatedData = aggregateSignals(data, profile?.weights ?? { fundamental: 0.6, technical: 0.4 });
  const avgScore =
    Object.values(aggregatedData).reduce((sum, coin) => sum + coin.final_score, 0) / COINS.length;
  const marketVerdict = avgScore >= 0.65 ? "bullish" : avgScore <= 0.35 ? "bearish" : "neutral";

  // Root container also sets dir explicitly (keeps UI consistent even before effect runs)
  const rootDir = i18n.language === "fa" || t("global.isRTL") === "true" ? "rtl" : "ltr";

  return (
    <div className="min-h-screen bg-background particle-bg" dir={rootDir}>
      <AchievementPopup
        show={showAchievement}
        title={achievementData.title}
        description={achievementData.description}
        onClose={() => setShowAchievement(false)}
      />

      <EnhancedAIAssistant currentSection={viewMode} contextData={{ data, marketRisk, aggregatedData }} />
      <TutorialSystem currentSection={viewMode} />

      <header className="glass-card border-b sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px hsl(186 100% 44% / 0.4)",
                    "0 0 40px hsl(250 83% 66% / 0.6)",
                    "0 0 20px hsl(186 100% 44% / 0.4)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">{t("dashboard.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <LogoutButton />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    trackClick?.("header", { action: "navigate_tutorials" });
                    navigate("/tutorials");
                  }}
                  className="gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("tutorials.title")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    trackClick?.("header", { action: "navigate_partners" });
                    navigate("/partners");
                  }}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("partners.short")}</span>
                </Button>
                <NotificationCenter />
                <AIAssistantPanel />
                <GamificationPanel />
                <TraderProfilePanel />
                <LanguageSwitcher />
              </div>

              <RefreshControl
                isRefreshing={isRefreshing}
                onRefresh={fetchData}
                autoRefreshInterval={autoRefreshInterval}
                onIntervalChange={setAutoRefreshInterval}
                lastUpdate={lastUpdate}
                nextUpdate={nextUpdate}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <WelcomeMessage />
        <div className="mb-8 flex justify-center">
          <NavigationDropdown viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="mb-8">
              <PerformanceBacktest />
            </section>
            <section className="mb-8">
              <MarketGauge riskIndex={marketRisk} summary={data.fundamental.summary} verdict={marketVerdict} />
            </section>

            {(viewMode === "combined" || viewMode === "fundamental" || viewMode === "technical") && (
              <CategorySection type="ai-driven">
                {viewMode === "fundamental" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COINS.map((coin) => (
                      <CoinCard key={coin} coin={coin} data={data.fundamental.coins[coin]} mode="fundamental" />
                    ))}
                  </div>
                )}

                {viewMode === "technical" && <TechnicalPanel data={data.technical} />}

                {viewMode === "combined" && (
                  <AggregatorPanel
                    aggregatedData={aggregatedData}
                    weights={profile?.weights ?? { fundamental: 0.6, technical: 0.4 }}
                  />
                )}
              </CategorySection>
            )}

            {(viewMode === "user-technical" || viewMode === "news-analysis" || viewMode === "signal-aggregator") && (
              <CategorySection type="user-adaptive">
                {viewMode === "user-technical" && <TechnicalAnalysisZone />}
                {viewMode === "news-analysis" && <NewsAnalysisSection />}
                {viewMode === "signal-aggregator" && (
                  <EnhancedAggregatorPanel
                    aggregatedData={aggregatedData}
                    weights={profile?.weights ?? { fundamental: 0.6, technical: 0.4 }}
                  />
                )}
              </CategorySection>
            )}

            {viewMode === "reports" && (
              <section>
                <ReportsTab data={data} />
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
