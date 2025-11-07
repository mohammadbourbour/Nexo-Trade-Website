// src/components/ReportsTab.tsx
import { Copy, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { DashboardData } from "../CryptoSentimentProDashboard";

interface ReportsTabProps {
  data: DashboardData;
}

export function ReportsTab({ data }: ReportsTabProps) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const nf = (value: number) => new Intl.NumberFormat(i18n.language).format(value);

  const copyReport = () => {
    const report = generateTextReport();
    navigator.clipboard.writeText(report);
    toast({
      title: t("reports.copySuccessTitle"),
      description: t("reports.copySuccessDesc"),
    });
  };

  const downloadReport = () => {
    const report = generateTextReport();
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t("reports.filenamePrefix")}-${new Date().toISOString()}.txt`;
    a.click();

    toast({
      title: t("reports.downloadSuccessTitle"),
      description: t("reports.downloadSuccessDesc"),
    });
  };

  const generateTextReport = () => {
    const lines: string[] = [];
    const now = new Date();

    lines.push("=".repeat(80));
    lines.push(t("reports.reportTitle"));
    lines.push("=".repeat(80));
    lines.push("");
    lines.push(`${t("reports.generated")}: ${now.toLocaleString(i18n.language)}`);
    lines.push(`${t("reports.articlesAnalyzed")}: ${nf(data.fundamental.metrics.articles_considered)}`);
    lines.push("");
    
    lines.push("-".repeat(80));
    lines.push(t("reports.marketSummaryHeader"));
    lines.push("-".repeat(80));
    lines.push(data.fundamental.summary);
    lines.push("");
    
    lines.push("-".repeat(80));
    lines.push(t("reports.individualCoinHeader"));
    lines.push("-".repeat(80));
    lines.push("");
    
    Object.entries(data.fundamental.coins).forEach(([coin, coinData]) => {
      lines.push(`${coin}:`);
      // sentiment localized if possible
      const sentimentKey = (coinData.sentiment || "").toString().toLowerCase();
      const sentimentLabel = sentimentKey ? t(`coin.sentiment.${sentimentKey}`) : coinData.sentiment;
      lines.push(`  ${t("reports.sentiment")}: ${sentimentLabel}`);
      lines.push(`  ${t("reports.score")}: ${(coinData.score * 100).toFixed(1)}%`);
      lines.push(`  ${t("reports.confidence")}: ${(coinData.confidence * 100).toFixed(1)}%`);
      lines.push(`  ${t("reports.evidenceSources")}: ${nf(coinData.evidence_count)}`);
      lines.push(`  ${t("reports.analysis")}: ${coinData.reason}`);
      lines.push("");
      
      if (coinData.top_examples && coinData.top_examples.length > 0) {
        lines.push(`  ${t("reports.keySources")}:`);
        coinData.top_examples.forEach((example, idx) => {
          lines.push(`    ${idx + 1}. ${example.headline}`);
          lines.push(`       ${example.url}`);
        });
        lines.push("");
      }
    });
    
    lines.push("-".repeat(80));
    lines.push(t("reports.technicalHeader"));
    lines.push("-".repeat(80));
    lines.push("");
    
    Object.entries(data.technical.coins).forEach(([coin, techData]) => {
      lines.push(`${coin}:`);
      lines.push(`  ${t("reports.rsi")}: ${techData.rsi.toFixed(1)}`);
      lines.push(`  ${t("reports.macdSignal")}: ${techData.macd_signal}`);
      lines.push(`  ${t("reports.shortMA")}: ${t("reports.currencyPrefix")}${nf(techData.ma_short)}`);
      lines.push(`  ${t("reports.longMA")}: ${t("reports.currencyPrefix")}${nf(techData.ma_long)}`);
      lines.push(`  ${t("reports.volatility")}: ${(techData.volatility * 100).toFixed(1)}%`);
      lines.push(`  ${t("reports.technicalScore")}: ${(techData.ta_score * 100).toFixed(1)}%`);
      lines.push("");
    });
    
    lines.push("=".repeat(80));
    lines.push(t("reports.endOfReport"));
    lines.push("=".repeat(80));
    
    return lines.join("\n");
  };

  return (
    <div className="space-y-6" dir={i18n.dir()}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("reports.panelTitle")}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyReport} aria-label={t("reports.copyAria")}>
            <Copy className="w-4 h-4 mr-2" />
            {t("reports.copy")}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadReport} aria-label={t("reports.downloadAria")}>
            <Download className="w-4 h-4 mr-2" />
            {t("reports.download")}
          </Button>
        </div>
      </div>

      <Card className="glass-card p-6">
        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("reports.reportDate")}</p>
              <p className="text-lg font-semibold">
                {new Date(data.fundamental.metrics.timestamp).toLocaleDateString(i18n.language)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("reports.articlesAnalyzed")}</p>
              <p className="text-lg font-semibold">
                {nf(data.fundamental.metrics.articles_considered)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("reports.coinsTracked")}</p>
              <p className="text-lg font-semibold">
                {Object.keys(data.fundamental.coins).length}
              </p>
            </div>
          </div>

          {/* Market Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("reports.marketSummary")}</h3>
            <div className="p-4 bg-card/50 rounded-lg">
              <p className="leading-relaxed">{data.fundamental.summary}</p>
            </div>
          </div>

          {/* Detailed Coin Reports */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("reports.detailedAnalysis")}</h3>
            <div className="space-y-4">
              {Object.entries(data.fundamental.coins).map(([coin, coinData]) => (
                <Card key={coin} className="bg-card/50 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold">{coin}</h4>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("reports.score")}</p>
                        <p className="text-2xl font-bold">
                          {(coinData.score * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("reports.sentiment")}</p>
                        <p className="font-medium">{t(`coin.sentiment.${(coinData.sentiment || "").toString().toLowerCase()}`)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("reports.confidence")}</p>
                        <p className="font-medium">
                          {(coinData.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("reports.evidenceSources")}</p>
                        <p className="font-medium">{coinData.evidence_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("reports.technicalScore")}</p>
                        <p className="font-medium">
                          {(data.technical.coins[coin]?.ta_score * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("reports.analysis")}</p>
                      <p className="leading-relaxed">{coinData.reason}</p>
                    </div>

                    {coinData.top_examples && coinData.top_examples.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{t("reports.keySources")}</p>
                        <div className="space-y-2">
                          {coinData.top_examples.slice(0, 3).map((example) => (
                            <a
                              key={example.i}
                              href={example.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm p-2 bg-background/50 rounded hover:bg-background transition-colors"
                            >
                              {example.headline}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
