import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = useCallback(async (lng: string) => {
    try {
      // changeLanguage may be async — wait for it to finish
      await i18n.changeLanguage(lng);

      // SSR-safe DOM updates
      if (typeof window !== "undefined" && document?.documentElement) {
        document.documentElement.dir = lng === "fa" ? "rtl" : "ltr";
        document.documentElement.lang = lng;
      }

      // persist choice (i18next may already do this, but keep explicit)
      try {
        localStorage.setItem("preferredLanguage", lng);
      } catch {
        /* ignore storage errors */
      }
    } catch (err) {
      // optional: console.warn or send to telemetry
      console.warn("Failed to change language:", err);
    }
  }, [i18n]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="neon-glow"
          aria-label={t("languageSwitcher.toggle", "Change language")}
        >
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          <span className="mr-2">🇬🇧</span> {t("languageSwitcher.english", "English")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("fa")}>
          <span className="mr-2">🇮🇷</span> {t("languageSwitcher.persian", "فارسی")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
