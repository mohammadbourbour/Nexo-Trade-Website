// src/pages/Dashboard.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CryptoSentimentProDashboard } from "@/components/CryptoSentimentProDashboard";
import mockData from "@/mocks/sample_data.json";
import { Session } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // null = unknown, true = has profile, false = no profile
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // prevent duplicate profile checks for same user
  const lastCheckedUserRef = useRef<string | null>(null);

  // ensure document dir/lang reflect current i18n (defensive; config.ts already sets this)
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
        // some i18n versions use .off, some return unsubscribe; best-effort
      }
    };
  }, [i18n]);

  useEffect(() => {
    // set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s ?? null);

      if (!s && event === "SIGNED_OUT") {
        navigate("/auth");
        return;
      }

      const userId = s?.user?.id;
      if (userId && lastCheckedUserRef.current !== userId) {
        lastCheckedUserRef.current = userId;
        await checkUserProfile(userId);
      }

      setLoading(false);
    });

    // initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session ?? null);

      const userId = session?.user?.id;
      if (!session) {
        navigate("/auth");
      } else {
        if (userId && lastCheckedUserRef.current !== userId) {
          lastCheckedUserRef.current = userId;
          await checkUserProfile(userId);
        }
      }

      setLoading(false);
    }).catch((e) => {
      console.error("getSession error:", e);
      setLoading(false);
      // prefer not to force redirect here if something transient happened,
      // but keep UX safe by sending to auth
      navigate("/auth");
    });

    return () => {
      try { subscription.unsubscribe(); } catch (e) { /* ignore */ }
    };
  }, [navigate]);

  const checkUserProfile = async (userId: string) => {
    setCheckingProfile(true);
    try {
      // use maybeSingle so it doesn't throw on no rows
      const res = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (res.error) {
        console.error("Error checking user profile:", res.error);
        // fallback: assume no profile and send to welcome to complete onboarding
        setHasProfile(false);
        navigate("/welcome");
      } else if (!res.data) {
        // no profile row -> onboarding required
        setHasProfile(false);
        navigate("/welcome");
      } else {
        setHasProfile(true);
        // don't navigate here — dashboard will render
      }
    } catch (error) {
      console.error("Error checking user profile (catch):", error);
      setHasProfile(false);
      navigate("/welcome");
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleOnboardingComplete = () => {
    if (session?.user) {
      // force re-check once onboarding completes
      lastCheckedUserRef.current = null;
      checkUserProfile(session.user.id);
    }
  };

  // while we don't know profile or still loading => show spinner (no onboarding flash)
  if (loading || checkingProfile || hasProfile === null) {
    const isRTL = i18n.language === "fa";
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div role="status" aria-live="polite" aria-label={t("dashboard.loading")}>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
          {/* hidden textual label (accessible) */}
          <span className="sr-only">{t("dashboard.loading")}</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // if we have confirmed the user has a profile -> show dashboard
  if (hasProfile === true) {
    // pass callback for onboarding completion in case other components use it
    return <CryptoSentimentProDashboard data={mockData} />;
  }

  // if hasProfile === false we already navigated to /welcome in checkUserProfile,
  // but keep a null render here to avoid double-rendering anything
  return null;
}
