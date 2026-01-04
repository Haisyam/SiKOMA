import { useEffect, useRef, useState } from "react";
import { ChevronDown, Key, LogOut, Menu, Shapes, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle.jsx";
import { useTheme } from "../lib/theme.jsx";

export default function Navbar({
  userEmail,
  onAddTransaction,
  onAddCategory,
  onLogout,
  onResetPassword,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const closeTimerRef = useRef(null);
  const actionRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
    } else {
      media.addListener(update);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) {
      root.classList.add("sidenav-open");
      root.classList.remove("sidenav-closing");
    } else {
      root.classList.remove("sidenav-open");
      root.classList.add("sidenav-closing");
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        root.classList.remove("sidenav-closing");
        closeTimerRef.current = null;
      }, 360);
    }

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      root.classList.remove("sidenav-open");
      root.classList.remove("sidenav-closing");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!actionRef.current || actionRef.current.contains(event.target)) return;
      setIsActionOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setIsActionOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const reduceMotion = theme === "light" && isMobile;
  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { type: "tween", duration: 0.22, ease: [0.4, 0, 0.2, 1] };


  const handleAddCategory = () => {
    setIsOpen(false);
    onAddCategory?.();
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
  };

  const handleResetPassword = () => {
    setIsOpen(false);
    onResetPassword?.();
  };

  return (
    <header className="nav-blur sticky top-4 z-40 mx-4 rounded-2xl px-4 py-4 shadow-lg shadow-black/20 md:mx-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
            <img src="/logo.svg" alt="SIKOMA" className="h-9 w-9" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">SIKOMA</p>
            <h1 className="text-base font-semibold text-slate-100 sm:text-lg">
              Sistem Informasi Keuangan Mahasiswa
            </h1>
          </div>
        </div>

      <div className="hidden flex-1 flex-col gap-3 sm:flex sm:flex-row sm:items-center sm:justify-end">
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
          {userEmail}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div ref={actionRef} className="relative">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsActionOpen((prev) => !prev)}
              className="btn-secondary btn-compact"
              type="button"
              aria-expanded={isActionOpen}
            >
              <Shapes className="h-4 w-4" />
              Kategori
              <ChevronDown
                className={`h-4 w-4 transition ${isActionOpen ? "rotate-180" : ""}`}
              />
            </motion.button>
            <AnimatePresence>
              {isActionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="glass-panel absolute right-0 mt-3 w-56 rounded-2xl p-2"
                >
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="menu-item"
                  >
                    <Shapes className="h-4 w-4" />
                    Kelola Kategori
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="menu-item"
                  >
                    <Key className="h-4 w-4" />
                    Reset Password
                  </button>
                  <button type="button" onClick={handleLogout} className="menu-item">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="btn-ghost sm:hidden"
          type="button"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="fixed inset-0 z-50 sm:hidden"
          >
            <motion.button
              type="button"
              onClick={() => setIsOpen(false)}
              className="sidenav-backdrop absolute inset-0 bg-black/60"
              aria-label="Tutup menu"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={panelTransition}
              className="sidenav-panel absolute right-0 top-0 flex h-screen w-72 flex-col gap-6 border-l border-cyan-300/20 bg-emerald-950/80 px-5 py-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                    <img src="/logo.svg" alt="SIKOMA" className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      SIKOMA
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      Sistem Informasi Keuangan Mahasiswa
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost h-9 w-9 rounded-full p-0"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
                {userEmail}
              </div>

              <div className="flex flex-col gap-3">
                <ThemeToggle showLabel className="w-full justify-between" />
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAddCategory}
                  className="btn-secondary w-full"
                  type="button"
                >
                  <Shapes className="h-4 w-4" />
                  Kelola Kategori
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleResetPassword}
                  className="btn-secondary w-full"
                  type="button"
                >
                  <Key className="h-4 w-4" />
                  Reset Password
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLogout}
                  className="btn-ghost w-full"
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </motion.button>
              </div>

              <div className="mt-auto text-xs text-slate-400">
                Catat pemasukan & pengeluaran harian dengan cepat.
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
