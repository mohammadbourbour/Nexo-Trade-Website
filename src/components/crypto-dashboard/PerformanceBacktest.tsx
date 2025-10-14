import { motion } from "framer-motion";
import { TrendingUp, Award, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export const PerformanceBacktest = () => {
  const { t } = useTranslation();

  const metrics = [
    {
      icon: Award,
      label: t("performance.accuracy"),
      value: "82%",
      subtitle: t("performance.last30Days"),
      color: "text-green-400"
    },
    {
      icon: DollarSign,
      label: t("performance.avgProfit"),
      value: "+2.4%",
      subtitle: t("performance.perSignal"),
      color: "text-blue-400"
    },
    {
      icon: BarChart3,
      label: t("performance.totalSignals"),
      value: "143",
      subtitle: t("performance.lastMonth"),
      color: "text-purple-400"
    },
    {
      icon: TrendingUp,
      label: t("performance.winRate"),
      value: "78%",
      subtitle: t("performance.successful"),
      color: "text-yellow-400"
    }
  ];

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <TrendingUp className="w-5 h-5" />
          {t("performance.title")}
        </CardTitle>
        <CardDescription>{t("performance.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 border border-primary/10 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${metric.color} neon-glow`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground text-center p-3 glass-card border border-yellow-500/20 bg-yellow-500/5"
        >
          ⚠️ {t("performance.disclaimer")}
        </motion.div>
      </CardContent>
    </Card>
  );
};
