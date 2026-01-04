import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";

export default function RegisterSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-md text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 via-emerald-400/20 to-amber-400/20">
          <MailCheck className="h-6 w-6 text-cyan-200" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-slate-100">
          Pendaftaran Berhasil
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Cek email kamu untuk verifikasi sebelum bisa login.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link className="btn-primary w-full" to="/login">
            Ke Halaman Login
          </Link>
          <Link className="btn-ghost w-full" to="/register">
            Daftar Akun Lain
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
