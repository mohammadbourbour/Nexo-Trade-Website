// src/components/NewsAnalysisSection.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, ExternalLink, TrendingUp, TrendingDown, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { demoAiChat } from "@/lib/demo-ai";

type NewsCategory = "Crypto" | "Gold" | "Stocks" | "Economy";

interface NewsItem {
  id: string;
  title: string;
  category: NewsCategory;
  summary: string;
  url: string;
  timestamp: Date;
  sentiment: "positive" | "negative" | "neutral";
  impact: "high" | "medium" | "low";
}

export function NewsAnalysisSection() {
  const { t, i18n } = useTranslation();
  const [selectedNews, setSelectedNews] = useState<Set<string>>(new Set());
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState("");
  const [activeCategory, setActiveCategory] = useState<NewsCategory>("Crypto");
  const { toast } = useToast();

  // Mock news data
  const newsData: NewsItem[] = [
    {
      id: "1",
      title: "Bitcoin ETF Sees Record Inflows",
      category: "Crypto",
      summary: "Institutional investors pour $500M into Bitcoin ETFs in 24 hours",
      url: "#",
      timestamp: new Date(),
      sentiment: "positive",
      impact: "high",
    },
    {
      id: "2",
      title: "Fed Signals Rate Cut in Q2",
      category: "Economy",
      summary: "Federal Reserve hints at potential rate cuts, boosting risk assets",
      url: "#",
      timestamp: new Date(),
      sentiment: "positive",
      impact: "high",
    },
    {
      id: "3",
      title: "Ethereum Upgrade Delayed",
      category: "Crypto",
      summary: "Technical issues push Ethereum's next upgrade to late 2025",
      url: "#",
      timestamp: new Date(),
      sentiment: "negative",
      impact: "medium",
    },
    {
      id: "4",
      title: "Gold Reaches New All-Time High",
      category: "Gold",
      summary: "Gold prices surge to $2,500/oz amid geopolitical tensions",
      url: "#",
      timestamp: new Date(),
      sentiment: "positive",
      impact: "high",
    },
    {
      id: "5",
      title: "Tech Stocks Rally on AI Optimism",
      category: "Stocks",
      summary: "NASDAQ gains 3% as AI sector shows strong earnings",
      url: "#",
      timestamp: new Date(),
      sentiment: "positive",
      impact: "medium",
    },
    {
      id: "6",
      title: "Inflation Data Surprises to Downside",
      category: "Economy",
      summary: "CPI drops to 2.8%, below expectations of 3.1%",
      url: "#",
      timestamp: new Date(),
      sentiment: "positive",
      impact: "high",
    },
  ];

  const filteredNews = newsData.filter((news) => news.category === activeCategory);

  const toggleNewsSelection = (newsId: string) => {
    const newSelection = new Set(selectedNews);
    if (newSelection.has(newsId)) {
      newSelection.delete(newsId);
    } else {
      newSelection.add(newsId);
    }
    setSelectedNews(newSelection);
  };

  const handleAnalyzeSelected = async () => {
    if (selectedNews.size === 0) {
      toast({
        title: t("news.toasts.noSelected.title"),
        description: t("news.toasts.noSelected.description"),
        variant: "destructive",
      });
      return;
    }

    setShowAIAnalysis(true);
    setAiAnalysisResult("");

    try {
      const selectedItems = newsData.filter((news) => selectedNews.has(news.id));

      const analysisPrompt = `Analyze these ${selectedItems.length} news items together and provide a comprehensive market analysis:

${selectedItems
  .map(
    (item, idx) => `
${idx + 1}. ${item.title}
   Category: ${item.category}
   Summary: ${item.summary}
   Sentiment: ${item.sentiment}
   Impact: ${item.impact}
`
  )
  .join("\n")}

Provide:
1. Overall market sentiment analysis
2. Correlation between news items
3. Combined impact on different markets (Crypto, Stocks, Gold, Forex)
4. Trading opportunities and recommendations
5. Risk assessment and hedging strategies
6. Key levels and timeframes to watch

Be detailed and actionable with specific entry/exit recommendations.`;

      const data = await demoAiChat({
        messages: [{ role: "user", content: analysisPrompt }],
        type: "news",
      });

      setAiAnalysisResult(data.response || t("news.analysisFallback"));
    } catch (error) {
      console.error("Multi-news analysis error:", error);
      setAiAnalysisResult(t("news.analysisError"));
      toast({
        title: t("news.toasts.analysisFailed.title"),
        description: t("news.toasts.analysisFailed.description"),
        variant: "destructive",
      });
    }
  };

  const handleQuickAnalyze = async (newsItem: NewsItem) => {
    setShowAIAnalysis(true);
    setAiAnalysisResult("");

    try {
      const analysisPrompt = `Analyze this ${newsItem.category} news item and provide detailed market impact analysis:

Title: ${newsItem.title}
Summary: ${newsItem.summary}
Sentiment: ${newsItem.sentiment}
Impact Level: ${newsItem.impact}

Provide:
1. Immediate market impact (1-24h)
2. Medium-term implications (1-7d)
3. Affected markets and assets
4. Trading recommendations (long/short/neutral)
5. Key levels to watch
6. Risk factors

Be specific and actionable.`;

      const data = await demoAiChat({
        messages: [{ role: "user", content: analysisPrompt }],
        type: "news",
      });

      setAiAnalysisResult(data.response || t("news.analysisFallback"));
    } catch (error) {
      console.error("News analysis error:", error);
      setAiAnalysisResult(t("news.analysisError"));
      toast({
        title: t("news.toasts.analysisFailed.title"),
        description: t("news.toasts.analysisFailed.description"),
        variant: "destructive",
      });
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === "positive") return <TrendingUp className="w-4 h-4 text-positive" />;
    if (sentiment === "negative") return <TrendingDown className="w-4 h-4 text-negative" />;
    return <Newspaper className="w-4 h-4 text-neutral" />;
  };

  const getImpactClass = (impact: string) => {
    if (impact === "high") return "border-negative text-negative";
    if (impact === "medium") return "border-primary text-primary";
    return "border-muted text-muted-foreground";
  };

  // format time according to i18n.language
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("news.title")}</h2>
        <Button onClick={handleAnalyzeSelected} disabled={selectedNews.size === 0} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {/* keep count visible inside text for parity with original */}
          {t("news.analyzeSelected", { count: selectedNews.size })}
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as NewsCategory)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="Crypto">{t("news.categories.crypto")}</TabsTrigger>
          <TabsTrigger value="Gold">{t("news.categories.gold")}</TabsTrigger>
          <TabsTrigger value="Stocks">{t("news.categories.stocks")}</TabsTrigger>
          <TabsTrigger value="Economy">{t("news.categories.economy")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-4 mt-6">
          {filteredNews.map((news) => (
            <Card key={news.id} className="glass-card p-6 hover:scale-[1.01] transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedNews.has(news.id)}
                  onCheckedChange={() => toggleNewsSelection(news.id)}
                  className="mt-1"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{news.title}</h3>
                      <p className="text-sm text-muted-foreground">{news.summary}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAnalyze(news);
                      }}
                      className="shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      {getSentimentIcon(news.sentiment)}
                      <span className="text-xs capitalize">{t(`news.sentiment.${news.sentiment}`)}</span>
                    </div>

                    <Badge variant="outline" className={getImpactClass(news.impact)}>
                      {t(`news.impactLevels.${news.impact}`)} {t("news.impactSuffix")}
                    </Badge>

                    <Badge variant="outline">{t(`news.categories.${news.category.toLowerCase()}`)}</Badge>

                    <span className="text-xs text-muted-foreground ml-auto">{formatTime(news.timestamp)}</span>

                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("common.readMore")} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
        <DialogContent className="glass-card max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t("news.analysisModalTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="p-4 bg-card/50 rounded-lg whitespace-pre-line text-sm font-mono">
              {aiAnalysisResult || t("news.analysisLoading")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
