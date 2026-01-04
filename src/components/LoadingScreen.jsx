import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card flex flex-col items-center gap-4 px-8 py-10"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <div className="text-sm text-slate-300">Menyiapkan dashboard keuangan...</div>
      </motion.div>
    </div>
  );
}
