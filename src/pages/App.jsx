import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Filter,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { swalBase, toast } from "../lib/alerts.js";
import Navbar from "../components/Navbar.jsx";
import Stats from "../components/Stats.jsx";
import Charts from "../components/Charts.jsx";
import TransactionFormModal from "../components/TransactionFormModal.jsx";
import TransactionItem from "../components/TransactionItem.jsx";
import CategoryModal from "../components/CategoryModal.jsx";
import DashboardSkeleton from "../components/DashboardSkeleton.jsx";
import TransactionSkeleton from "../components/TransactionSkeleton.jsx";

const DEFAULT_CATEGORIES = [
  { name: "Ngopi", type: "expense", color: "#facc15", icon: "Coffee" },
  { name: "Belanja", type: "expense", color: "#fb7185", icon: "ShoppingBag" },
  { name: "Ngopi", type: "income", color: "#facc15", icon: "Coffee" },
  { name: "Belanja", type: "income", color: "#fb7185", icon: "ShoppingBag" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getMonthKey = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

const seedPromises = new Map();
const getCategoryKey = (category) => `${category.name.toLowerCase()}::${category.type}`;

export default function AppPage({ session }) {
  const user = session?.user;
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    date: "month",
    search: "",
    customStart: "",
    customEnd: "",
  });

  const monthKey = getMonthKey(new Date());

  const fetchCategories = async (userId) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal memuat kategori",
        text: error.message,
      });
      return [];
    }

    return data ?? [];
  };

  const fetchTransactions = async (userId) => {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id, user_id, type, amount, description, transaction_date, created_at, category_id, category:categories(id, name, color, icon, type)"
      )
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal memuat transaksi",
        text: error.message,
      });
      return [];
    }

    return data ?? [];
  };

  const ensureDefaultCategories = async (userId) => {
    if (!userId) return;
    if (seedPromises.has(userId)) return seedPromises.get(userId);

    const seedPromise = (async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, type")
        .eq("user_id", userId);

      if (error) {
        seedPromises.delete(userId);
        return;
      }

      const existingKeys = new Set((data ?? []).map(getCategoryKey));
      const missing = DEFAULT_CATEGORIES.filter(
        (category) => !existingKeys.has(getCategoryKey(category))
      );

      if (missing.length > 0) {
        const payload = missing.map((category) => ({
          ...category,
          user_id: userId,
        }));
        const { error: insertError } = await supabase.from("categories").insert(payload);
        if (insertError) {
          seedPromises.delete(userId);
        }
      }
    })();

    seedPromises.set(userId, seedPromise);
    return seedPromise;
  };

  useEffect(() => {
    if (!user) return undefined;
    let active = true;

    const bootstrap = async () => {
      setLoading(true);
      await ensureDefaultCategories(user.id);
      const [categoryData, transactionData] = await Promise.all([
        fetchCategories(user.id),
        fetchTransactions(user.id),
      ]);
      if (!active) return;
      setCategories(categoryData);
      setTransactions(transactionData);
      setLoading(false);
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const monthlyTransactions = transactions.filter((item) =>
      item.transaction_date?.startsWith(monthKey)
    );

    const incomeMonth = monthlyTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenseMonth = monthlyTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      balance: totalIncome - totalExpense,
      incomeMonth,
      expenseMonth,
      remainingMonth: incomeMonth - expenseMonth,
    };
  }, [transactions, monthKey]);

  const estimateLabel = useMemo(() => {
    if (stats.expenseMonth <= 0 || stats.remainingMonth <= 0) return null;
    const today = new Date();
    const daysPassed = today.getDate();
    const averageDaily = stats.expenseMonth / daysPassed;
    if (!averageDaily) return null;
    const daysLeft = Math.max(0, Math.floor(stats.remainingMonth / averageDaily));
    const estimate = new Date(today);
    estimate.setDate(today.getDate() + daysLeft);
    return estimate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [stats.expenseMonth, stats.remainingMonth]);

  const filteredTransactions = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const todayKey = new Date().toISOString().slice(0, 10);

    return transactions.filter((transaction) => {
      if (filters.type !== "all" && transaction.type !== filters.type) return false;
      if (filters.category !== "all" && transaction.category_id !== filters.category) {
        return false;
      }

      if (filters.date === "today" && transaction.transaction_date !== todayKey) {
        return false;
      }

      if (filters.date === "month" && !transaction.transaction_date?.startsWith(monthKey)) {
        return false;
      }

      if (filters.date === "custom") {
        const start = filters.customStart || "0000-00-00";
        const end = filters.customEnd || "9999-12-31";
        if (transaction.transaction_date < start || transaction.transaction_date > end) {
          return false;
        }
      }

      if (!query) return true;
      const categoryName = transaction.category?.name?.toLowerCase() ?? "";
      const description = transaction.description?.toLowerCase() ?? "";
      return categoryName.includes(query) || description.includes(query);
    });
  }, [transactions, filters, monthKey]);

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          transaction.transaction_date?.startsWith(monthKey)
      )
      .forEach((transaction) => {
        const key = transaction.category?.name ?? "Lainnya";
        const entry = map.get(key) || {
          name: key,
          value: 0,
          color: transaction.category?.color ?? "#94a3b8",
        };
        entry.value += Number(transaction.amount || 0);
        map.set(key, entry);
      });

    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [transactions, monthKey]);

  const dailyExpense = useMemo(() => {
    const map = new Map();
    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          transaction.transaction_date?.startsWith(monthKey)
      )
      .forEach((transaction) => {
        const label = transaction.transaction_date?.slice(8, 10) ?? "";
        const value = map.get(label) || 0;
        map.set(label, value + Number(transaction.amount || 0));
      });

    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => Number(a.label) - Number(b.label));
  }, [transactions, monthKey]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCategory = async (form) => {
    if (!user) return;
    setSavingCategory(true);
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...form, user_id: user.id })
      .select("*")
      .single();
    setSavingCategory(false);

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal menambah kategori",
        text: error.message,
      });
      return;
    }

    setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setIsCategoryOpen(false);
    toast.fire({ icon: "success", title: "Kategori baru ditambahkan" });
  };

  const handleSaveTransaction = async (payload) => {
    if (!user) return;
    if (!payload.category_id) {
      await swalBase.fire({
        icon: "warning",
        title: "Kategori belum dipilih",
        text: "Tambahkan atau pilih kategori terlebih dahulu.",
      });
      return;
    }

    setSavingTransaction(true);
    if (editing) {
      const { data, error } = await supabase
        .from("transactions")
        .update({
          type: payload.type,
          amount: payload.amount,
          category_id: payload.category_id,
          description: payload.description,
          transaction_date: payload.transaction_date,
        })
        .eq("id", editing.id)
        .select(
          "id, user_id, type, amount, description, transaction_date, created_at, category_id, category:categories(id, name, color, icon, type)"
        )
        .single();

      setSavingTransaction(false);

      if (error) {
        await swalBase.fire({
          icon: "error",
          title: "Gagal memperbarui transaksi",
          text: error.message,
        });
        return;
      }

      setTransactions((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );
      toast.fire({ icon: "success", title: "Transaksi diperbarui" });
    } else {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: payload.type,
          amount: payload.amount,
          category_id: payload.category_id,
          description: payload.description,
          transaction_date: payload.transaction_date,
        })
        .select(
          "id, user_id, type, amount, description, transaction_date, created_at, category_id, category:categories(id, name, color, icon, type)"
        )
        .single();

      setSavingTransaction(false);

      if (error) {
        await swalBase.fire({
          icon: "error",
          title: "Gagal menambah transaksi",
          text: error.message,
        });
        return;
      }

      setTransactions((prev) => [data, ...prev]);
      toast.fire({ icon: "success", title: "Transaksi berhasil ditambahkan" });
    }

    setIsTransactionOpen(false);
    setEditing(null);
  };

  const handleDelete = async (transaction) => {
    const result = await swalBase.fire({
      icon: "warning",
      title: "Hapus transaksi ini?",
      text: "Data yang dihapus tidak bisa dikembalikan.",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("transactions").delete().eq("id", transaction.id);

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: error.message,
      });
      return;
    }

    setTransactions((prev) => prev.filter((item) => item.id !== transaction.id));
    toast.fire({ icon: "success", title: "Transaksi berhasil dihapus" });
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    const result = await swalBase.fire({
      icon: "question",
      title: "Reset password?",
      text: `Link reset akan dikirim ke ${user.email}.`,
      showCancelButton: true,
      confirmButtonText: "Kirim link",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      await swalBase.fire({
        icon: "error",
        title: "Gagal mengirim reset",
        text: error.message,
      });
      return;
    }

    toast.fire({ icon: "success", title: "Link reset dikirim ke email" });
  };

  const handleLogout = async () => {
    const result = await swalBase.fire({
      icon: "question",
      title: "Keluar dari akun?",
      text: "Kamu bisa login lagi kapan saja.",
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
    setTimeout(() => {
      window.location.assign("/login");
    }, 400);
  };

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen pb-16"
    >
      <Navbar
        userEmail={user?.email}
        onAddTransaction={() => {
          setEditing(null);
          setIsTransactionOpen(true);
        }}
        onAddCategory={() => setIsCategoryOpen(true)}
        onLogout={handleLogout}
        onResetPassword={handleResetPassword}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Ringkasan Bulan Ini
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                Dashboard Keuangan
              </h2>
            </div>
            <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300">
              <CalendarClock className="h-4 w-4 text-cyan-300" />
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {loading ? <DashboardSkeleton /> : <Stats stats={stats} />}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="glass-card flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Estimasi Uang Habis
                </p>
                <h3 className="text-lg font-semibold text-slate-100">Prediksi</h3>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              {estimateLabel
                ? `Perkiraan saldo bulan ini akan habis sekitar ${estimateLabel}.`
                : "Data belum cukup untuk menghitung estimasi. Tambahkan transaksi rutin ya."}
            </p>
          </div>

          <div className="glass-card flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-200">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Saldo Bulanan
                </p>
                <h3 className="text-lg font-semibold text-slate-100">Sisa Saat Ini</h3>
              </div>
            </div>
            <p className="text-2xl font-semibold text-rose-200">
              {formatCurrency(stats.remainingMonth)}
            </p>
            <p className="text-sm text-slate-400">
              Pemasukan {formatCurrency(stats.incomeMonth)} · Pengeluaran{" "}
              {formatCurrency(stats.expenseMonth)}
            </p>
          </div>
        </section>

        <section className="glass-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-100">
              <Filter className="h-4 w-4 text-cyan-300" />
              <h3 className="text-lg font-semibold">Filter & Pencarian</h3>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {filteredTransactions.length} transaksi
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Tipe</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="select-field"
              >
                <option value="all">Semua</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Kategori</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="select-field"
              >
                <option value="all">Semua kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {`${category.name} - ${
                      category.type === "income" ? "Pemasukan" : "Pengeluaran"
                    }`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Tanggal</label>
              <select
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="select-field"
              >
                <option value="today">Hari ini</option>
                <option value="month">Bulan ini</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input-field pl-10"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Cari deskripsi..."
                />
              </div>
            </div>
          </div>

          {filters.date === "custom" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Dari</label>
                <input
                  type="date"
                  name="customStart"
                  value={filters.customStart}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Sampai</label>
                <input
                  type="date"
                  name="customEnd"
                  value={filters.customEnd}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>
            </div>
          )}
        </section>

        <section>{loading ? <Charts expenseByCategory={[]} dailyExpense={[]} /> : <Charts expenseByCategory={expenseByCategory} dailyExpense={dailyExpense} />}</section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Riwayat
              </p>
              <h3 className="text-lg font-semibold text-slate-100">Transaksi Terbaru</h3>
            </div>
          </div>

          {loading ? (
            <TransactionSkeleton />
          ) : filteredTransactions.length === 0 ? (
            <div className="glass-card flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-6 w-6 text-cyan-200" />
              </div>
              <h4 className="text-lg font-semibold text-slate-100">Belum ada transaksi</h4>
              <p className="text-sm text-slate-400">
                Mulai catat pemasukan & pengeluaran pertama kamu hari ini.
              </p>
            </div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4 md:grid-cols-2"
            >
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={(item) => {
                    setEditing(item);
                    setIsTransactionOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          )}
        </section>
      </main>

      <TransactionFormModal
        isOpen={isTransactionOpen}
        onClose={() => {
          setIsTransactionOpen(false);
          setEditing(null);
        }}
        onSave={handleSaveTransaction}
        saving={savingTransaction}
        initialData={editing}
        categories={categories}
        onAddCategory={() => setIsCategoryOpen(true)}
      />

      <CategoryModal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onSave={handleSaveCategory}
        saving={savingCategory}
      />
    </motion.div>
  );
}
