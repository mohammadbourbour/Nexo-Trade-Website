import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Notification {
  id: string;
  type: "analysis" | "signal";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "signal",
    title: "BTC Signal Change",
    message: "BTC signal changed from HOLD to BUY with 89% confidence",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "analysis",
    title: "New Market Analysis",
    message: "Updated fundamental analysis available for ETH",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "signal",
    title: "Risk Alert",
    message: "Market volatility increased to 15% - Review your positions",
    time: "1 hour ago",
    read: true,
  },
];

export function NotificationCenter() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const clearAll = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="neon-glow relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-negative rounded-full text-xs font-bold flex items-center justify-center text-negative-foreground"
            >
              {unreadCount}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-card border-l border-primary/30 w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-2xl gradient-text">
              <Bell className="w-6 h-6" />
              {t("notifications.title")}
            </span>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("notifications.clear")}
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {t("notifications.sheetDescription")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">{t("notifications.noNotifications")}</p>
              </motion.div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 rounded-lg border transition-all hover-lift ${
                    notification.read
                      ? "bg-card/30 border-border/30"
                      : "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 neon-glow"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {notification.type === "signal" ? (
                          <TrendingUp className="w-4 h-4 text-primary" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-secondary" />
                        )}
                        <h4 className="font-medium">{notification.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNotification(notification.id)}
                      className="h-6 w-6 hover:bg-destructive/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
