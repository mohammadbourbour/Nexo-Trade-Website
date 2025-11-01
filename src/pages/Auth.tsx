// src/pages/Auth.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { z } from "zod";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const [passwordStrength, setPasswordStrength] = useState(0);

  // Prevent concurrent redirects / debounce
  const isRedirectingRef = useRef(false);

  // helper: wrap a promise with timeout
  const withTimeout = async <T,>(p: Promise<T>, ms = 2000): Promise<T | { timeout: true }> =>
    Promise.race([
      p,
      new Promise<{ timeout: true }>((res) => setTimeout(() => res({ timeout: true }), ms)),
    ]);

  // helper: convert supabase builder / thenable to Promise
  const exec = <T,>(builderLike: any): Promise<T> =>
    new Promise((resolve, reject) => {
      try {
        if (builderLike && typeof builderLike.then === "function") {
          builderLike.then((r: any) => resolve(r)).catch((e: any) => reject(e));
        } else {
          resolve(builderLike as T);
        }
      } catch (err) {
        reject(err);
      }
    });

  // helper: decide where to go after we have a valid session
  const redirectAfterAuth = async (session: any | null) => {
    if (isRedirectingRef.current) {
      console.log("[Auth] redirect already in progress — skipping");
      return;
    }
    isRedirectingRef.current = true;
    console.log("[Auth] redirectAfterAuth start", { session });

    try {
      if (!session?.user) {
        console.log("[Auth] no session.user -> stay on /auth");
        return;
      }

      const userId = session.user.id;

      // race between DB call and timeout (2s)
      const dbCall = supabase.from("user_profiles").select("id").eq("user_id", userId).maybeSingle();
      const wrapped = exec<any>(dbCall);
      const res: any = await withTimeout(wrapped, 2000);

      // timeout case: DO NOT redirect automatically — backend might be down
      if (res && (res as any).timeout) {
        console.warn("[Auth] profile fetch timed out (backend might be offline). Staying on /auth and notifying user.");
        toast({
          title: "Network issue",
          description: "Unable to verify account status right now — please try again shortly.",
          variant: "destructive",
        });
        return;
      }

      // otherwise res should be { data, error }
      const { data, error } = res ?? {};

      console.log("[Auth] profile check result", { data, error });

      if (error) {
        // unexpected profile error: log and fall back to dashboard (offline-safe) OR stay
        console.error("[Auth] unexpected profile error:", error);
        // We choose to stay on auth and notify, instead of immediate dashboard redirect,
        // because redirecting to dashboard when DB errors occur caused UX issues.
        toast({
          title: "Server error",
          description: "Couldn't verify profile. Try again or contact support.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        navigate("/dashboard");
      } else {
        // no profile -> show welcome onboarding
        navigate("/welcome");
      }
    } catch (err) {
      console.error("[Auth] redirectAfterAuth threw:", err);
      // fallback: stay on auth and notify
      toast({
        title: "Unexpected error",
        description: "Something went wrong during login flow. Please try again.",
        variant: "destructive",
      });
    } finally {
      // small delay before allowing another redirect (prevents rapid repeats)
      setTimeout(() => {
        isRedirectingRef.current = false;
        console.log("[Auth] redirectAfterAuth end");
      }, 300);
    }
  };

  useEffect(() => {
    // initial session check
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        console.log("[Auth] getSession ->", session);
        if (session) {
          redirectAfterAuth(session);
        }
      })
      .catch((e) => {
        console.error("[Auth] getSession error:", e);
      });

    // auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Auth] onAuthStateChange", { event, session });
      if (event === "SIGNED_IN") {
        if (session) redirectAfterAuth(session);
      } else if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (e) {
        // ignore unsubscribe errors
      }
    };
  }, [navigate]); // eslint-disable-line

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (signupPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(signupPassword)) strength += 25;
    if (/[0-9]/.test(signupPassword)) strength += 25;
    if (/[^A-Za-z0-9]/.test(signupPassword)) strength += 25;
    setPasswordStrength(strength);
  }, [signupPassword]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = loginSchema.parse({ email: loginEmail, password: loginPassword });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) throw error;

      // If signIn returns a session, immediately decide destination.
      if (data?.session) {
        toast({
          title: t("auth.loginSuccess"),
          description: t("auth.welcomeBack"),
        });
        // Try to redirect, but redirectAfterAuth now won't navigate on backend timeouts.
        await redirectAfterAuth(data.session);
      }
      // Otherwise onAuthStateChange listener will handle redirection when session appears.
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: t("auth.validationError"),
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.loginError"),
          description: error.message || t("auth.invalidCredentials"),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signupSchema.parse({
        email: signupEmail,
        password: signupPassword,
        confirmPassword,
        name,
      });

      const redirectUrl = `${window.location.origin}/welcome`;

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: validated.name,
          },
        },
      });

      if (error) throw error;

      toast({
        title: t("auth.signupSuccess"),
        description: t("auth.checkEmail"),
      });

      // After signUp with email confirmation there is usually no session yet,
      // so we don't redirect immediately — user will confirm email and then sign in.
      setSignupEmail("");
      setSignupPassword("");
      setConfirmPassword("");
      setName("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: t("auth.validationError"),
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.signupError"),
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      toast({
        title: t("auth.enterEmail"),
        description: t("auth.enterEmailFirst"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: t("auth.resetEmailSent"),
        description: t("auth.checkEmailReset"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.resetError"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isRTL = i18n.language === "fa";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("dashboard.title")}
            </h1>
          </motion.div>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t("auth.welcome")}</CardTitle>
            <CardDescription className="text-center">{t("auth.welcomeDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.passwordPlaceholder")}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label htmlFor="remember" className="text-sm cursor-pointer">
                        {t("auth.rememberMe")}
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm"
                      onClick={handleForgotPassword}
                    >
                      {t("auth.forgotPassword")}
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth.loggingIn") : t("auth.login")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t("auth.name")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={t("auth.namePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("auth.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.passwordPlaceholder")}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signupPassword && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                passwordStrength > i * 25
                                  ? passwordStrength <= 50
                                    ? "bg-red-500"
                                    : passwordStrength <= 75
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {passwordStrength <= 50
                            ? t("auth.passwordWeak")
                            : passwordStrength <= 75
                            ? t("auth.passwordMedium")
                            : t("auth.passwordStrong")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.confirmPasswordPlaceholder")}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth.signingUp") : t("auth.signup")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
