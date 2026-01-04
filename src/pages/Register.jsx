import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { swalBase } from "../lib/alerts.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password.length < 6) {
      await swalBase.fire({
        icon: "error",
        title: "Password terlalu pendek",
        text: "Minimal 6 karakter ya.",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      await swalBase.fire({
        icon: "error",
        title: "Password tidak cocok",
        text: "Pastikan konfirmasi password sama.",
      });
      return;
    }

    setLoading(true);
    const redirectTo = `${window.location.origin}/login`;
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    setLoading(false);

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Registrasi gagal",
        text: error.message,
      });
      return;
    }

    navigate(`/registered?email=${encodeURIComponent(form.email)}`);
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
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Daftar</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">
          Buat Akun SIKOMA
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Catat pemasukan & pengeluaran harian biar keuangan mahasiswa terkontrol.
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
          <div>
            <label className="mb-2 block text-sm text-slate-300">Konfirmasi password</label>
            <div className="relative">
              <input
                className="input-field pr-12"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-label="Toggle password"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Mendaftarkan..." : "Daftar"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Sudah punya akun?{" "}
          <Link className="text-cyan-300 hover:text-cyan-200" to="/login">
            Login di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
