import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../lib/theme.jsx";

export default function ThemeToggle({ showLabel = false, className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Mode Terang" : "Mode Gelap";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`btn-ghost ${className}`}
      type="button"
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel && <span>{label}</span>}
    </motion.button>
  );
}
