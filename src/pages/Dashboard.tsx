import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CryptoSentimentProDashboard } from "@/components/CryptoSentimentProDashboard";
import { Onboarding } from "@/components/Onboarding";
import mockData from "@/mocks/sample_data.json";
import { Session } from "@supabase/supabase-js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (!session && event === "SIGNED_OUT") {
        navigate("/auth");
      }
      if (session?.user) {
        await checkUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        await checkUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserProfile = async (userId: string) => {
    setCheckingProfile(true);
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      setHasProfile(!!profile);
    } catch (error) {
      setHasProfile(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleOnboardingComplete = () => {
    if (session?.user) {
      checkUserProfile(session.user.id);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!hasProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return <CryptoSentimentProDashboard data={mockData} />;
}
