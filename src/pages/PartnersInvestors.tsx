import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lightbulb, LineChart, DollarSign, Rocket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function PartnersInvestors() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sections = [
    {
      icon: AlertCircle,
      title: t("partners.problem.title"),
      content: t("partners.problem.content"),
      gradient: "from-red-500/20 to-orange-500/20"
    },
    {
      icon: Lightbulb,
      title: t("partners.solution.title"),
      content: t("partners.solution.content"),
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: LineChart,
      title: t("partners.outputs.title"),
      content: t("partners.outputs.content"),
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: DollarSign,
      title: t("partners.business.title"),
      content: t("partners.business.content"),
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Rocket,
      title: t("partners.roadmap.title"),
      content: t("partners.roadmap.content"),
      gradient: "from-yellow-500/20 to-orange-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-b border-primary/20 sticky top-0 z-50 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2 neon-glow"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("partners.backToDashboard")}
          </Button>
          <LanguageSwitcher />
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
          {t("partners.hero.title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t("partners.hero.subtitle")}
        </p>
      </motion.div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 pb-16 space-y-8">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-card border-primary/20 bg-gradient-to-br ${section.gradient} hover:scale-[1.02] transition-transform`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="neon-glow">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed whitespace-pre-line">
                    {section.content}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 pb-16"
      >
        <Card className="glass-card border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/10">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              {t("partners.cta.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground mb-6">
              {t("partners.cta.subtitle")}
            </p>
            <Button size="lg" className="neon-glow">
              {t("partners.cta.button")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
