import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Save,
  Download,
  Sparkles,
  PenLine,
  Ruler,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { demoAiChat } from "@/lib/demo-ai";
import { useTranslation } from "react-i18next";

type DrawingTool = "trendline" | "fibonacci" | "support" | "resistance" | "none";
type Indicator = "RSI" | "MACD" | "EMA" | "SMA" | "Bollinger";

interface SavedAnalysis {
  id: string;
  coin: string;
  timestamp: Date;
  drawings: any[];
  indicators: Indicator[];
  notes: string;
}

export function TechnicalAnalysisZone() {
  const { t, i18n } = useTranslation();
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [activeTool, setActiveTool] = useState<DrawingTool>("none");
  const [activeIndicators, setActiveIndicators] = useState<Indicator[]>(["RSI", "MACD"]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const tradingViewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const coins = ["BTC", "ETH", "XRP", "SOL", "DOGE"];
  const indicators: Indicator[] = ["RSI", "MACD", "EMA", "SMA", "Bollinger"];
  const timeframes = ["1h", "4h", "1D", "1W"];

  // TradingView locale mapping: اگر زبان fa باشه 'fa' وگرنه 'en'
  const tradingViewLocale = i18n.language === "fa" ? "fa" : "en";

  // Initialize TradingView widget
  useEffect(() => {
    if (!tradingViewRef.current) return;

    // remove any existing container children to avoid duplicates
    const container = document.getElementById("tradingview_chart");
    if (container) container.innerHTML = "";

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      try {
        if ((window as any).TradingView) {
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: `BINANCE:${selectedCoin}USDT`,
            interval: timeframe,
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: tradingViewLocale,
            toolbar_bg: "#000000",
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: "tradingview_chart",
            studies: activeIndicators.map(ind => ind.toLowerCase()),
            hide_side_toolbar: false,
          });
        }
      } catch (e) {
        console.error("TradingView init error:", e);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // try to cleanup container
      const c = document.getElementById("tradingview_chart");
      if (c) c.innerHTML = "";
    };
  }, [selectedCoin, timeframe, activeIndicators, tradingViewLocale]);

  const handleSaveAnalysis = () => {
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      coin: selectedCoin,
      timestamp: new Date(),
      drawings: [],
      indicators: activeIndicators,
      notes: "",
    };
    setSavedAnalyses([newAnalysis, ...savedAnalyses]);
    toast({
      title: t("technical.analysisSavedTitle"),
      description: t("technical.analysisSavedDesc", { coin: selectedCoin }),
    });
  };

  const handleRequestAIInterpretation = async () => {
    setShowAIDialog(true);
    setIsAnalyzing(true);
    setAiAnalysis("");

    try {
      const analysisPrompt = `Analyze the ${selectedCoin}/USDT chart on ${timeframe} timeframe with the following indicators active: ${activeIndicators.join(", ")}.

Provide a detailed technical analysis including:
1. Current trend direction and strength
2. Key support and resistance levels
3. Indicator analysis (${activeIndicators.join(", ")})
4. Potential entry and exit points
5. Risk management recommendations
6. Short-term and medium-term outlook

Be specific and actionable.`;

      const data = await demoAiChat({
        messages: [{ role: "user", content: analysisPrompt }],
        type: "technical",
      });

      setAiAnalysis(data?.response || t("technical.analysisFallback"));
    } catch (error) {
      console.error('AI Analysis error:', error);
      setAiAnalysis(t("technical.analysisErrorFallback"));
      toast({
        title: t("technical.analysisFailedTitle"),
        description: t("technical.analysisFailedDesc"),
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleIndicator = (indicator: Indicator) => {
    setActiveIndicators(prev =>
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold gradient-text"
        >
          {t("technical.title")}
        </motion.h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedCoin} onValueChange={setSelectedCoin}>
            <SelectTrigger className="w-32 glass-card border-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {coins.map(coin => (
                <SelectItem key={coin} value={coin}>
                  {coin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-28 glass-card border-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map(tf => (
                <SelectItem key={tf} value={tf}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {tf}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Chart Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="glass-card p-6 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
          <div className="space-y-4">
            {/* Drawing Tools */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground mr-2">{t("technical.drawingTools")}</span>
              {[
                { tool: "trendline", icon: PenLine, labelKey: "technical.tools.trendline" },
                { tool: "fibonacci", icon: Ruler, labelKey: "technical.tools.fibonacci" },
                { tool: "support", icon: TrendingUp, labelKey: "technical.tools.support" },
                { tool: "resistance", icon: TrendingDown, labelKey: "technical.tools.resistance" },
              ].map(({ tool, icon: Icon, labelKey }) => (
                <motion.div key={tool} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeTool === tool ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTool(activeTool === tool ? "none" : (tool as DrawingTool))}
                    className={activeTool === tool ? "neon-glow" : "hover:border-primary/50"}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {t(labelKey)}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* TradingView Chart */}
            <div className="relative bg-card/30 rounded-lg overflow-hidden" style={{ height: "600px" }}>
              <div ref={tradingViewRef} id="tradingview_chart" className="w-full h-full" />
            </div>

          {/* Indicators Panel */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground mr-2">{t("technical.indicators")}</span>
            {indicators.map(indicator => (
              <motion.div key={indicator} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={activeIndicators.includes(indicator) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleIndicator(indicator)}
                  className={activeIndicators.includes(indicator) ? "neon-glow" : "hover:border-primary/50"}
                >
                  {indicator}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleSaveAnalysis} className="hover:neon-glow">
                <Save className="w-4 h-4 mr-2" />
                {t("technical.saveAnalysis")}
              </Button>
            </motion.div>
            <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="secondary" 
                    onClick={handleRequestAIInterpretation}
                    className="neon-glow"
                    disabled={isAnalyzing}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isAnalyzing ? t("technical.analyzing") : t("technical.aiInterpretationButton")}
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <motion.div
                      animate={isAnalyzing ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                    </motion.div>
                    {t("technical.aiDialogTitle")}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <div className="p-4 bg-card/50 rounded-lg whitespace-pre-line text-sm">
                    {isAnalyzing ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <span className="ml-2">{t("technical.analyzingPatterns")}</span>
                      </motion.div>
                    ) : (
                      aiAnalysis
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="hover:border-primary/50">
                <Download className="w-4 h-4 mr-2" />
                {t("technical.exportChart")}
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Saved Analyses */}
      {savedAnalyses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card p-6 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 gradient-text">{t("technical.savedAnalysesTitle")}</h3>
            <div className="space-y-3">
              {savedAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center justify-between p-3 bg-card/30 rounded-lg hover:bg-card/50 hover:border-primary/30 border border-transparent transition-all cursor-pointer"
                >
                  <div>
                    <div className="font-medium">{analysis.coin}</div>
                    <div className="text-xs text-muted-foreground">
                      {analysis.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysis.indicators.map(ind => (
                      <Badge key={ind} variant="outline" className="text-xs">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

// Type declaration for TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}
