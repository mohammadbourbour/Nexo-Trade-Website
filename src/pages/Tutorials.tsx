import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { demoAuth, type DemoSession } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Video, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { motion } from "framer-motion";

const tutorialsByGeneration = {
  genAlpha: [
    {
      id: "gen-alpha-1",
      title: "🚀 Quick Start Guide",
      description: "Let's get started with the basics! Super easy!",
      duration: "5 min",
      type: "video",
      completed: false,
    },
    {
      id: "gen-alpha-2",
      title: "📊 Reading Charts for Beginners",
      description: "Learn to read charts like a pro! 🎯",
      duration: "10 min",
      type: "interactive",
      completed: false,
    },
    {
      id: "gen-alpha-3",
      title: "💰 Understanding Signals",
      description: "What do BUY, SELL, and HOLD mean? Let's find out!",
      duration: "8 min",
      type: "video",
      completed: false,
    },
  ],
  genZ: [
    {
      id: "gen-z-1",
      title: "📈 Technical Analysis Basics",
      description: "Master the fundamentals of technical analysis",
      duration: "15 min",
      type: "video",
      completed: false,
    },
    {
      id: "gen-z-2",
      title: "🎯 Signal Interpretation",
      description: "How to read and act on trading signals",
      duration: "12 min",
      type: "interactive",
      completed: false,
    },
    {
      id: "gen-z-3",
      title: "💡 Risk Management 101",
      description: "Protect your portfolio with smart strategies",
      duration: "20 min",
      type: "text",
      completed: false,
    },
  ],
  genY: [
    {
      id: "gen-y-1",
      title: "Advanced Technical Indicators",
      description: "Deep dive into RSI, MACD, and moving averages",
      duration: "25 min",
      type: "text",
      completed: false,
    },
    {
      id: "gen-y-2",
      title: "Fundamental Analysis Framework",
      description: "Evaluate assets using fundamental metrics",
      duration: "30 min",
      type: "video",
      completed: false,
    },
    {
      id: "gen-y-3",
      title: "Portfolio Optimization Strategies",
      description: "Build and maintain a balanced trading portfolio",
      duration: "35 min",
      type: "interactive",
      completed: false,
    },
  ],
  genX: [
    {
      id: "gen-x-1",
      title: "Comprehensive Market Analysis",
      description: "Multi-timeframe analysis and market structure",
      duration: "40 min",
      type: "text",
      completed: false,
    },
    {
      id: "gen-x-2",
      title: "Advanced Risk Management",
      description: "Position sizing, leverage, and risk-reward ratios",
      duration: "45 min",
      type: "text",
      completed: false,
    },
    {
      id: "gen-x-3",
      title: "Algorithmic Trading Concepts",
      description: "Understanding automated trading systems and backtesting",
      duration: "50 min",
      type: "text",
      completed: false,
    },
  ],
};

export default function Tutorials() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [loading, setLoading] = useState(true);

  const generation = userProfile.generation || "genZ";
  const tutorials = tutorialsByGeneration[generation] || tutorialsByGeneration.genZ;
  const isRTL = i18n.language === "fa";

  useEffect(() => {
    const { data: { subscription } } = demoAuth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        navigate("/auth");
      }
      setLoading(false);
    });

    demoAuth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      if (!current) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "interactive":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "interactive":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("tutorials.backToDashboard")}
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2">{t("tutorials.title")}</h1>
            <p className="text-muted-foreground text-lg">
              {t("tutorials.subtitle")} - {t(`tutorials.${generation}`)}
            </p>
          </motion.div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all">{t("tutorials.all")}</TabsTrigger>
            <TabsTrigger value="video">{t("tutorials.videos")}</TabsTrigger>
            <TabsTrigger value="interactive">{t("tutorials.interactive")}</TabsTrigger>
            <TabsTrigger value="text">{t("tutorials.reading")}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{tutorial.title}</CardTitle>
                        <CardDescription>{tutorial.description}</CardDescription>
                      </div>
                      {tutorial.completed && (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={getTypeColor(tutorial.type)}>
                          {getTypeIcon(tutorial.type)}
                          <span className="ml-1">{t(`tutorials.type.${tutorial.type}`)}</span>
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {tutorial.duration}
                        </div>
                      </div>
                      <Button>
                        {tutorial.completed ? t("tutorials.review") : t("tutorials.start")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {["video", "interactive", "text"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {tutorials
                .filter((t) => t.type === type)
                .map((tutorial, index) => (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{tutorial.title}</CardTitle>
                            <CardDescription>{tutorial.description}</CardDescription>
                          </div>
                          {tutorial.completed && (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className={getTypeColor(tutorial.type)}>
                              {getTypeIcon(tutorial.type)}
                              <span className="ml-1">{t(`tutorials.type.${tutorial.type}`)}</span>
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-1" />
                              {tutorial.duration}
                            </div>
                          </div>
                          <Button>
                            {tutorial.completed ? t("tutorials.review") : t("tutorials.start")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
