import { RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>

      <Select
        value={autoRefreshInterval.toString()}
        onValueChange={(value) => onIntervalChange(Number(value))}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Auto-refresh" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Off</SelectItem>
          <SelectItem value="5">5 min</SelectItem>
          <SelectItem value="15">15 min</SelectItem>
          <SelectItem value="60">60 min</SelectItem>
        </SelectContent>
      </Select>

      <div className="text-sm text-muted-foreground hidden lg:flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <div>
          <div>Updated: {lastUpdate.toLocaleTimeString()}</div>
          {autoRefreshInterval > 0 && nextUpdate > 0 && (
            <div className="text-xs">Next: {formatTime(nextUpdate)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
