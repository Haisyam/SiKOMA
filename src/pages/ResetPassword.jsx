import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { swalBase, toast } from "../lib/alerts.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function ResetPassword() {
  const [status, setStatus] = useState("checking");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus(data.session ? "ready" : "invalid");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, current) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
      if (event === "SIGNED_OUT" && !completedRef.current) {
        setStatus("invalid");
      }
      if (!current && event === "USER_DELETED") {
        setStatus("invalid");
      }
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

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
    const { error } = await supabase.auth.updateUser({ password: form.password });
    setLoading(false);

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal reset password",
        text: error.message,
      });
      return;
    }

    completedRef.current = true;
    setStatus("success");
    toast.fire({ icon: "success", title: "Password berhasil diperbarui" });
    await supabase.auth.signOut();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      {status === "ready" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.4 }}
          className="glass-card w-full max-w-md"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Reset Password</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-100">
            Buat Password Baru
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Masukkan password baru untuk akun kamu.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password baru</label>
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
              <label className="mb-2 block text-sm text-slate-300">
                Konfirmasi password baru
              </label>
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
              {loading ? "Memproses..." : "Simpan Password"}
            </motion.button>
          </form>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.4 }}
          className="glass-card w-full max-w-md text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-100">Reset Berhasil</h1>
          <p className="mt-3 text-sm text-slate-400">
            Password kamu sudah diperbarui. Silakan login ulang.
          </p>
          <Link className="btn-primary mt-6 w-full" to="/login">
            Kembali ke Login
          </Link>
        </motion.div>
      )}

      {status === "invalid" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.4 }}
          className="glass-card w-full max-w-md text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-200">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-100">
            Link Tidak Valid
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Link reset password sudah kadaluarsa atau tidak valid.
          </p>
          <Link className="btn-secondary mt-6 w-full" to="/forgot-password">
            Minta Link Baru
          </Link>
          <Link className="btn-ghost mt-3 w-full" to="/login">
            Kembali ke Login
          </Link>
        </motion.div>
      )}

      {status === "checking" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-md text-center"
        >
          <p className="text-sm text-slate-400">Memverifikasi link reset...</p>
        </motion.div>
      )}
    </div>
  );
}
