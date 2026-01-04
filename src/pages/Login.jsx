import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { swalBase, toast } from "../lib/alerts.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Login gagal",
        text: "Email atau password salah. Jika belum punya akun, silakan daftar dulu.",
      });
      return;
    }

    toast.fire({ icon: "success", title: "Selamat datang kembali!" });
    navigate("/app");
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
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Masuk</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">
          SIKOMA — Sistem Informasi Keuangan Mahasiswa
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Catat pemasukan & pengeluaran harian dengan cepat, simpel, dan visual.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              className="input-field"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <div className="relative">
              <input
                className="input-field pr-12"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Memproses..." : "Masuk"}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link className="text-sm link-accent" to="/forgot-password">
            Lupa password?
          </Link>
        </div>

        <p className="mt-4 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link className="link-accent" to="/register">
            Daftar sekarang
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
