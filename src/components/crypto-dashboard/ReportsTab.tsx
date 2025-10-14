import { Copy, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { DashboardData } from "../CryptoSentimentProDashboard";

interface ReportsTabProps {
  data: DashboardData;
}

export function ReportsTab({ data }: ReportsTabProps) {
  const { toast } = useToast();

  const copyReport = () => {
    const report = generateTextReport();
    navigator.clipboard.writeText(report);
    toast({
      title: "Copied to clipboard",
      description: "Full report copied successfully",
    });
  };

  const downloadReport = () => {
    const report = generateTextReport();
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crypto-sentiment-report-${new Date().toISOString()}.txt`;
    a.click();
  };

  const generateTextReport = () => {
    const lines: string[] = [];
    
    lines.push("=".repeat(80));
    lines.push("CRYPTO SENTIMENT PRO - AI ANALYSIS REPORT");
    lines.push("=".repeat(80));
    lines.push("");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Articles Analyzed: ${data.fundamental.metrics.articles_considered}`);
    lines.push("");
    
    lines.push("-".repeat(80));
    lines.push("MARKET SUMMARY");
    lines.push("-".repeat(80));
    lines.push(data.fundamental.summary);
    lines.push("");
    
    lines.push("-".repeat(80));
    lines.push("INDIVIDUAL COIN ANALYSIS");
    lines.push("-".repeat(80));
    lines.push("");
    
    Object.entries(data.fundamental.coins).forEach(([coin, coinData]) => {
      lines.push(`${coin}:`);
      lines.push(`  Sentiment: ${coinData.sentiment}`);
      lines.push(`  Score: ${(coinData.score * 100).toFixed(1)}%`);
      lines.push(`  Confidence: ${(coinData.confidence * 100).toFixed(1)}%`);
      lines.push(`  Evidence Sources: ${coinData.evidence_count}`);
      lines.push(`  Analysis: ${coinData.reason}`);
      lines.push("");
      
      if (coinData.top_examples && coinData.top_examples.length > 0) {
        lines.push("  Key Sources:");
        coinData.top_examples.forEach((example, idx) => {
          lines.push(`    ${idx + 1}. ${example.headline}`);
          lines.push(`       ${example.url}`);
        });
        lines.push("");
      }
    });
    
    lines.push("-".repeat(80));
    lines.push("TECHNICAL INDICATORS");
    lines.push("-".repeat(80));
    lines.push("");
    
    Object.entries(data.technical.coins).forEach(([coin, techData]) => {
      lines.push(`${coin}:`);
      lines.push(`  RSI: ${techData.rsi.toFixed(1)}`);
      lines.push(`  MACD Signal: ${techData.macd_signal}`);
      lines.push(`  Short MA: $${techData.ma_short.toLocaleString()}`);
      lines.push(`  Long MA: $${techData.ma_long.toLocaleString()}`);
      lines.push(`  Volatility: ${(techData.volatility * 100).toFixed(1)}%`);
      lines.push(`  Technical Score: ${(techData.ta_score * 100).toFixed(1)}%`);
      lines.push("");
    });
    
    lines.push("=".repeat(80));
    lines.push("END OF REPORT");
    lines.push("=".repeat(80));
    
    return lines.join("\n");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Analysis Reports</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyReport}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="glass-card p-6">
        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Report Date</p>
              <p className="text-lg font-semibold">
                {new Date(data.fundamental.metrics.timestamp).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Articles Analyzed</p>
              <p className="text-lg font-semibold">
                {data.fundamental.metrics.articles_considered}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coins Tracked</p>
              <p className="text-lg font-semibold">
                {Object.keys(data.fundamental.coins).length}
              </p>
            </div>
          </div>

          {/* Market Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Market Summary</h3>
            <div className="p-4 bg-card/50 rounded-lg">
              <p className="leading-relaxed">{data.fundamental.summary}</p>
            </div>
          </div>

          {/* Detailed Coin Reports */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
            <div className="space-y-4">
              {Object.entries(data.fundamental.coins).map(([coin, coinData]) => (
                <Card key={coin} className="bg-card/50 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold">{coin}</h4>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-2xl font-bold">
                          {(coinData.score * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sentiment</p>
                        <p className="font-medium">{coinData.sentiment}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-medium">
                          {(coinData.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Evidence Sources</p>
                        <p className="font-medium">{coinData.evidence_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Technical Score</p>
                        <p className="font-medium">
                          {(data.technical.coins[coin]?.ta_score * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Analysis</p>
                      <p className="leading-relaxed">{coinData.reason}</p>
                    </div>

                    {coinData.top_examples && coinData.top_examples.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Key Sources</p>
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
