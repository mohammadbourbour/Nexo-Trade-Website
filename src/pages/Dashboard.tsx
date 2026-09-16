import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CryptoSentimentProDashboard } from "@/components/CryptoSentimentProDashboard";
import mockData from "@/mocks/sample_data.json";
import { demoAuth, demoDb, type DemoSession } from "@/lib/demo-store";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [session, setSession] = useState<DemoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const lastCheckedUserRef = useRef<string | null>(null);

  useEffect(() => {
    const applyDir = (lng: string) => {
      document.documentElement.dir = lng === "fa" ? "rtl" : "ltr";
      document.documentElement.lang = lng;
    };
    applyDir(i18n.language || "en");
    const off = i18n.on("languageChanged", applyDir);
    return () => {
      try {
        i18n.off("languageChanged", applyDir);
      } catch {
        /* ignore */
      }
    };
  }, [i18n]);

  useEffect(() => {
    const { data: { subscription } } = demoAuth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);

      if (!nextSession && event === "SIGNED_OUT") {
        navigate("/auth");
        return;
      }

      const userId = nextSession?.user?.id;
      if (userId && lastCheckedUserRef.current !== userId) {
        lastCheckedUserRef.current = userId;
        await checkUserProfile(userId);
      }

      setLoading(false);
    });

    demoAuth.getSession().then(async ({ data: { session: current } }) => {
      setSession(current);

      const userId = current?.user?.id;
      if (!current) {
        navigate("/auth");
      } else if (userId && lastCheckedUserRef.current !== userId) {
        lastCheckedUserRef.current = userId;
        await checkUserProfile(userId);
      }

      setLoading(false);
    }).catch((error) => {
      console.error("getSession error:", error);
      setLoading(false);
      navigate("/auth");
    });

    return () => {
      try { subscription.unsubscribe(); } catch { /* ignore */ }
    };
  }, [navigate]);

  const checkUserProfile = async (userId: string) => {
    setCheckingProfile(true);
    try {
      const profile = demoDb.getProfile(userId);
      if (!profile) {
        setHasProfile(false);
        navigate("/welcome");
      } else {
        setHasProfile(true);
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      setHasProfile(false);
      navigate("/welcome");
    } finally {
      setCheckingProfile(false);
    }
  };

  if (loading || checkingProfile || hasProfile === null) {
    const isRTL = i18n.language === "fa";
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div role="status" aria-live="polite" aria-label={t("dashboard.loading")}>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
          <span className="sr-only">{t("dashboard.loading")}</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (hasProfile === true) {
    return <CryptoSentimentProDashboard data={mockData} />;
  }

  return null;
}
