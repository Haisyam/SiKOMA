import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Database,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { swalBase, toast } from "../lib/alerts.js";
import { isAdminEmail } from "../lib/admin.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Admin({ session }) {
  const navigate = useNavigate();
  const userPageSize = 10;
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [filters, setFilters] = useState({
    userId: "all",
    type: "all",
    from: "",
    to: "",
  });
  const [draft, setDraft] = useState(filters);

  const email = session?.user?.email ?? "";

  const fetchAdmin = async (path) => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!baseUrl || !anonKey) {
      throw new Error("Missing Supabase config");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken =
      sessionData?.session?.access_token ?? session?.access_token ?? "";
    if (!accessToken) {
      throw new Error("Sesi tidak ditemukan, silakan login ulang.");
    }

    const response = await fetch(`${baseUrl}/functions/v1/${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonKey,
      },
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Gagal memuat data admin");
    }

    return payload;
  };

  const loadUsers = async (page = userPage) => {
    setLoadingUsers(true);
    try {
      const payload = await fetchAdmin(
        `admin-users?page=${page}&per_page=${userPageSize}`
      );
      setUsers(payload.users ?? []);
      setUserTotal(payload.total ?? payload.users?.length ?? 0);
      setUserPage(page);
    } catch (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal memuat user",
        text: error.message,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadTransactions = async (activeFilters) => {
    setLoadingTransactions(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      if (activeFilters.userId !== "all") params.set("user_id", activeFilters.userId);
      if (activeFilters.type !== "all") params.set("type", activeFilters.type);
      if (activeFilters.from) params.set("from", activeFilters.from);
      if (activeFilters.to) params.set("to", activeFilters.to);
      const payload = await fetchAdmin(`admin-transactions?${params.toString()}`);
      setTransactions(payload.transactions ?? []);
    } catch (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal memuat transaksi",
        text: error.message,
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    if (!isAdminEmail(email)) {
      navigate("/app", { replace: true });
      return;
    }
    loadUsers(1);
    loadTransactions(filters);
  }, [session, email]);

  const emailMap = useMemo(() => {
    const map = new Map();
    users.forEach((user) => map.set(user.id, user.email));
    return map;
  }, [users]);

  const totalUserPages = Math.max(1, Math.ceil(userTotal / userPageSize));

  const handleApplyFilter = () => {
    setFilters(draft);
    loadTransactions(draft);
  };

  const handleResetFilter = () => {
    const reset = { userId: "all", type: "all", from: "", to: "" };
    setDraft(reset);
    setFilters(reset);
    loadTransactions(reset);
  };

  const handleLogout = async () => {
    const result = await swalBase.fire({
      icon: "question",
      title: "Keluar dari akun?",
      text: "Kamu akan kembali ke halaman login.",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal logout",
        text: error.message,
      });
      return;
    }
    toast.fire({ icon: "success", title: "Logout berhasil" });
    navigate("/login", { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen pb-16"
    >
      <header className="nav-blur sticky top-4 z-40 mx-4 rounded-2xl px-4 py-4 shadow-lg shadow-black/20 md:mx-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
              <img src="/logo.svg" alt="SIKOMA" className="h-9 w-9" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">SIKOMA</p>
              <h1 className="text-base font-semibold text-slate-100 sm:text-lg">
                Admin Panel
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              {email}
            </div>
            <Link className="btn-ghost btn-compact" to="/app">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
            <button type="button" onClick={handleLogout} className="btn-ghost btn-compact">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <section className="glass-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-100">
              <Users className="h-4 w-4 text-cyan-300" />
              <h2 className="text-lg font-semibold">Daftar User</h2>
            </div>
            <button
              type="button"
              onClick={() => loadUsers(userPage)}
              className="btn-secondary btn-compact"
              disabled={loadingUsers}
            >
              <RefreshCw className="h-4 w-4" />
              {loadingUsers ? "Memuat..." : "Refresh"}
            </button>
          </div>

          {loadingUsers ? (
            <div className="text-sm text-slate-400">Memuat data user...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-slate-400">Belum ada user terdaftar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Terdaftar</th>
                    <th className="px-4 py-3">Login Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-slate-100">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            user.is_verified
                              ? "border-emerald-400/40 text-emerald-200"
                              : "border-amber-400/40 text-amber-200"
                          }`}
                        >
                          {user.is_verified ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <ShieldX className="h-4 w-4" />
                          )}
                          {user.is_verified ? "Terverifikasi" : "Belum"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <span>
                  Total {userTotal} user · Halaman {userPage} dari {totalUserPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadUsers(userPage - 1)}
                    disabled={userPage <= 1 || loadingUsers}
                    className="btn-ghost btn-compact"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={() => loadUsers(userPage + 1)}
                    disabled={userPage >= totalUserPages || loadingUsers}
                    className="btn-ghost btn-compact"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="glass-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-100">
              <Database className="h-4 w-4 text-cyan-300" />
              <h2 className="text-lg font-semibold">Transaksi Semua User</h2>
            </div>
            <button
              type="button"
              onClick={() => loadTransactions(filters)}
              className="btn-secondary btn-compact"
              disabled={loadingTransactions}
            >
              <RefreshCw className="h-4 w-4" />
              {loadingTransactions ? "Memuat..." : "Refresh"}
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">User</label>
              <select
                className="select-field"
                value={draft.userId}
                onChange={(event) => setDraft((prev) => ({ ...prev, userId: event.target.value }))}
              >
                <option value="all">Semua user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Tipe</label>
              <select
                className="select-field"
                value={draft.type}
                onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value="all">Semua</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Dari</label>
              <input
                type="date"
                className="input-field"
                value={draft.from}
                onChange={(event) => setDraft((prev) => ({ ...prev, from: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Sampai</label>
              <input
                type="date"
                className="input-field"
                value={draft.to}
                onChange={(event) => setDraft((prev) => ({ ...prev, to: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleApplyFilter} className="btn-primary btn-compact">
              <Search className="h-4 w-4" />
              Terapkan
            </button>
            <button type="button" onClick={handleResetFilter} className="btn-ghost btn-compact">
              Reset
            </button>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {transactions.length} transaksi
            </span>
          </div>

          {loadingTransactions ? (
            <div className="text-sm text-slate-400">Memuat transaksi...</div>
          ) : transactions.length === 0 ? (
            <div className="text-sm text-slate-400">Belum ada transaksi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transactions.map((trx) => (
                    <tr key={trx.id}>
                      <td className="px-4 py-3 text-slate-100">{trx.transaction_date}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {emailMap.get(trx.user_id) ?? trx.user_id}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {trx.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {trx.category?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {(trx.description ?? "-").slice(0, 40)}
                      </td>
                      <td className="px-4 py-3 text-slate-100">
                        {formatCurrency(trx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </motion.div>
  );
}
