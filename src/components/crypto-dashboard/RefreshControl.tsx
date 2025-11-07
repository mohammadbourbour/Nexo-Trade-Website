// src/components/RefreshControl.tsx
import { RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface RefreshControlProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  autoRefreshInterval: number;
  onIntervalChange: (interval: number) => void;
  lastUpdate: Date;
  nextUpdate: number;
}

export function RefreshControl({
  isRefreshing,
  onRefresh,
  autoRefreshInterval,
  onIntervalChange,
  lastUpdate,
  nextUpdate,
}: RefreshControlProps) {
  const { t, i18n } = useTranslation();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // localize numbers
    const nf = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });
    return `${nf.format(mins)}:${nf.format(secs)}`;
  };

  const formattedLast = lastUpdate
    ? lastUpdate.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })
    : "-";

  return (
    <div className="flex items-center gap-3" dir={i18n.dir()}>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-2"
        aria-label={t("refresh.buttonAria")}
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        {t("refresh.button")}
      </Button>

      <Select
        value={autoRefreshInterval.toString()}
        onValueChange={(value) => onIntervalChange(Number(value))}
      >
        <SelectTrigger className="w-32" aria-label={t("refresh.selectAria")}>
          <SelectValue placeholder={t("refresh.selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">{t("refresh.options.off")}</SelectItem>
          <SelectItem value="5">{t("refresh.options.5")}</SelectItem>
          <SelectItem value="15">{t("refresh.options.15")}</SelectItem>
          <SelectItem value="60">{t("refresh.options.60")}</SelectItem>
        </SelectContent>
      </Select>

      <div className="text-sm text-muted-foreground hidden lg:flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <div>
          <div>{t("refresh.updated", { time: formattedLast })}</div>
          {autoRefreshInterval > 0 && nextUpdate > 0 && (
            <div className="text-xs">{t("refresh.next", { time: formatTime(nextUpdate) })}</div>
          )}
        </div>
      </div>
    </div>
  );
}
