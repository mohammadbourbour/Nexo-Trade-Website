// src/components/NavigationDropdown.tsx
import { useState, useRef, useEffect } from "react";
import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain, User } from "lucide-react";
import { useTranslation } from "react-i18next";

type ViewMode =
  | "fundamental"
  | "technical"
  | "combined"
  | "reports"
  | "user-technical"
  | "news-analysis"
  | "signal-aggregator";

interface NavigationDropdownProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const CATEGORIES: {
  [key: string]: {
    icon: ComponentType<any>;
    labelKey: string;
    shortLabelKey: string;
    modes: ViewMode[];
  };
} = {
  "ai-driven": {
    icon: Brain,
    labelKey: "navigation.categories.ai",
    shortLabelKey: "navigation.categories.ai_short",
    modes: ["combined", "fundamental", "technical"],
  },
  "user-adaptive": {
    icon: User,
    labelKey: "navigation.categories.user",
    shortLabelKey: "navigation.categories.user_short",
    modes: ["user-technical", "news-analysis", "signal-aggregator", "reports"],
  },
};

export function NavigationDropdown({ viewMode, onViewModeChange }: NavigationDropdownProps) {
  const { t, i18n } = useTranslation();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentCategory = () => {
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      if (cat.modes.includes(viewMode)) return key;
    }
    return null;
  };

  const currentCategory = getCurrentCategory();
  const isRtl = i18n.dir() === "rtl";
  const menuSideClass = isRtl ? "right-0" : "left-0";

  return (
    <div ref={dropdownRef} className="flex items-center gap-3 flex-wrap">
      {Object.entries(CATEGORIES).map(([key, category]) => {
        const Icon = category.icon;
        const isActive = currentCategory === key;
        const isOpen = openCategory === key;

        // border side for active item (rtl-aware)
        const activeBorderClass = isRtl ? "border-r-2" : "border-l-2";

        return (
          <div key={key} className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpenCategory(isOpen ? null : key)}
              aria-expanded={isOpen}
              aria-controls={`nav-cat-${key}`}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? `bg-gradient-to-r from-primary to-secondary text-primary-foreground neon-glow ${activeBorderClass}`
                  : "glass-card text-muted-foreground hover:text-foreground hover-lift"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t(category.labelKey)}</span>
              <span className="sm:hidden">{t(category.shortLabelKey)}</span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id={`nav-cat-${key}`}
                  role="menu"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-full mt-2 min-w-[240px] ${menuSideClass} glass-card rounded-lg border border-border/50 shadow-xl z-50 overflow-hidden backdrop-blur-xl`}
                >
                  {category.modes.map((mode, index) => (
                    <motion.button
                      key={mode}
                      role="menuitem"
                      initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "hsl(var(--muted))", x: isRtl ? -4 : 4 }}
                      onClick={() => {
                        onViewModeChange(mode);
                        setOpenCategory(null);
                      }}
                      className={`w-full px-4 py-3 text-left transition-all ${
                        viewMode === mode
                          ? `bg-muted text-primary font-medium ${activeBorderClass}`
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {t(`tabs.${mode}`)}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
