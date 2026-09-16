// src/components/LogoutButton.tsx
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { demoAuth } from "@/lib/demo-store";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function LogoutButton() {
  const { resetProfile } = useUserProfile();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      const { error } = await demoAuth.signOut();
      if (error) throw error;

      // clear local profile state
      try {
        resetProfile();
      } catch (e) {
        // don't block logout for reset failures
        console.warn("resetProfile failed:", e);
      }

      toast({
        title: t("auth.logoutSuccess") || "Logged out successfully",
        description: t("auth.logoutDescription") || "See you next time!",
      });

      // navigate to auth (replace so back button doesn't go to protected routes)
      navigate("/auth", { replace: true });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: t("auth.logoutError") || "Logout failed",
        description: error?.message || t("auth.logoutError") || "An error occurred while logging out.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label={t("auth.logout") || "Logout"}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t("auth.logout") || "Logout"}</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("auth.logoutConfirm") || "Are you sure you want to logout?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("auth.logoutMessage") || "You will be redirected to the login page."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" size="sm" disabled={isSigningOut}>
              {t("auth.cancel") || "Cancel"}
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              onClick={handleLogout}
              className="ml-2"
              variant="destructive"
              size="sm"
              disabled={isSigningOut}
              aria-disabled={isSigningOut}
              aria-busy={isSigningOut}
            >
              {isSigningOut ? (t("auth.loggingOut") || "Signing out...") : (t("auth.logout") || "Logout")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
