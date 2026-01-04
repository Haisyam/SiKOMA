import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { swalBase, toast } from "../lib/alerts.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal mengirim link",
        text: error.message,
      });
      return;
    }

    toast.fire({ icon: "success", title: "Link reset dikirim ke email kamu" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-md"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lupa Password</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Masukkan email akun kamu, lalu cek inbox untuk link reset.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-10"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                required
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link className="text-sm text-cyan-300 hover:text-cyan-200" to="/login">
            Kembali ke Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
