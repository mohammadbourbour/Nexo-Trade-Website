import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
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
import { Onboarding } from "./Onboarding";
import { useUserProfile } from "@/hooks/useUserProfile";
import { NavigationDropdown } from "./NavigationDropdown";
import { WelcomeMessage } from "./WelcomeMessage";
import { LogoutButton } from "./LogoutButton";
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

type TradingStyle = "short" | "mid" | "long";
type ViewMode = "fundamental" | "technical" | "combined" | "reports" | "user-technical" | "news-analysis" | "signal-aggregator";

interface CryptoSentimentProDashboardProps {
  data?: DashboardData;
  apiEndpoint?: string;
}

const COINS = ["BTC", "ETH", "XRP", "SOL", "DOGE"];

export function CryptoSentimentProDashboard({
  data: propData,
  apiEndpoint = "/api/dashboard/latest",
}: CryptoSentimentProDashboardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, addXP, addCoins, addBadge } = useTraderProfile();
  const { userProfile } = useUserProfile();
  const [data, setData] = useState<DashboardData | null>(propData || null);
  const [viewMode, setViewMode] = useState<ViewMode>("combined");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [nextUpdate, setNextUpdate] = useState<number>(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState({ title: "", description: "" });
  const { toast } = useToast();

  // Use profile weights instead of local state
  const weights = profile.weights;
  const tradingStyle = profile.tradingStyle;

  // Fetch data on mount if no prop data provided
  useEffect(() => {
    if (!propData) {
      fetchData();
    }
  }, []);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, autoRefreshInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval]);

  // Countdown for next update
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
        const remaining = autoRefreshInterval * 60 - elapsed;
        setNextUpdate(remaining > 0 ? remaining : 0);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, lastUpdate]);

  // Gamification: Award XP on refresh
  useEffect(() => {
    if (data && !isRefreshing) {
      addXP(10);
      addCoins(5);
      
      // Check for badge achievements
      if (profile.xp > 0 && profile.xp % 1000 === 10) {
        setAchievementData({
          title: "Level Up!",
          description: `You've reached ${Math.floor(profile.xp / 1000)} level!`,
        });
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 5000);
      }
    }
  }, [data, isRefreshing]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Try to fetch from API
      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const fetchedData = await response.json();
        setData(fetchedData);
        setLastUpdate(new Date());
        
        // Cache in localStorage
        localStorage.setItem("dashboard-cache", JSON.stringify(fetchedData));
        
        toast({
          title: "Data refreshed",
          description: "Latest market data loaded successfully",
        });
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      
      // Try to load from cache
      const cached = localStorage.getItem("dashboard-cache");
      if (cached) {
        setData(JSON.parse(cached));
        toast({
          title: "Using cached data",
          description: "Could not fetch live data, showing cached version",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading data",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const marketRisk = calculateMarketRisk(data);
  const aggregatedData = aggregateSignals(data, weights);
  const avgScore = Object.values(aggregatedData).reduce((sum, coin) => sum + coin.final_score, 0) / COINS.length;
  const marketVerdict = avgScore >= 0.65 ? "bullish" : avgScore <= 0.35 ? "bearish" : "neutral";

  // Show onboarding if not completed
  if (!userProfile.hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-background particle-bg">
      <AchievementPopup
        show={showAchievement}
        title={achievementData.title}
        description={achievementData.description}
        onClose={() => setShowAchievement(false)}
      />

      {/* Top Bar */}
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
                <h1 className="text-2xl font-bold gradient-text">
                  {t("dashboard.title")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                <LogoutButton />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/partners")}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Partners</span>
                </Button>
                <NotificationCenter />
                <AIAssistantPanel />
                <GamificationPanel />
                <TraderProfilePanel />
                <LanguageSwitcher />
              </div>

              {/* Refresh Controls */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <WelcomeMessage />

        {/* Navigation Dropdown */}
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
            {/* Performance Backtest */}
            <section className="mb-8">
              <PerformanceBacktest />
            </section>

            {/* Market Overview */}
            <section className="mb-8">
              <MarketGauge
                riskIndex={marketRisk}
                summary={data.fundamental.summary}
                verdict={marketVerdict}
              />
            </section>

            {/* AI-Driven Analytics */}
            {(viewMode === "combined" || viewMode === "fundamental" || viewMode === "technical") && (
              <CategorySection type="ai-driven">
                {viewMode === "fundamental" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COINS.map((coin) => (
                      <CoinCard
                        key={coin}
                        coin={coin}
                        data={data.fundamental.coins[coin]}
                        mode="fundamental"
                      />
                    ))}
                  </div>
                )}

                {viewMode === "technical" && <TechnicalPanel data={data.technical} />}

                {viewMode === "combined" && (
                  <AggregatorPanel aggregatedData={aggregatedData} weights={weights} />
                )}
              </CategorySection>
            )}

            {/* User-Adaptive Analytics */}
            {(viewMode === "user-technical" || viewMode === "news-analysis" || viewMode === "signal-aggregator") && (
              <CategorySection type="user-adaptive">
                {viewMode === "user-technical" && <TechnicalAnalysisZone />}
                {viewMode === "news-analysis" && <NewsAnalysisSection />}
                {viewMode === "signal-aggregator" && (
                  <EnhancedAggregatorPanel aggregatedData={aggregatedData} weights={weights} />
                )}
              </CategorySection>
            )}

            {/* Reports */}
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
