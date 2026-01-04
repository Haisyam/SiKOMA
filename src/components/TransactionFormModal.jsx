import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, ClipboardList, Coins, X } from "lucide-react";

const DEFAULT_FORM = {
  type: "expense",
  amount: "",
  category_id: "",
  transaction_date: "",
  description: "",
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
};

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSave,
  saving,
  initialData,
  categories,
  onAddCategory,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  const categoriesByType = useMemo(() => {
    return categories?.filter((category) => category.type === form.type) ?? [];
  }, [categories, form.type]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        type: initialData.type ?? "expense",
        amount: initialData.amount ?? "",
        category_id: initialData.category_id ?? "",
        transaction_date: toDateInputValue(initialData.transaction_date),
        description: initialData.description ?? "",
      });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    setForm({
      ...DEFAULT_FORM,
      transaction_date: today,
    });
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (categoriesByType.length === 0) return;

    const hasCategory = categoriesByType.some(
      (category) => category.id === form.category_id
    );

    if (!hasCategory) {
      setForm((prev) => ({ ...prev, category_id: categoriesByType[0]?.id ?? "" }));
    }
  }, [categoriesByType, form.category_id, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      amount: Number(form.amount),
      transaction_date: form.transaction_date,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
            aria-label="Tutup modal"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="glass-card relative w-full max-w-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {initialData ? "Edit Transaksi" : "Tambah Transaksi"}
                </p>
                <h2 className="text-xl font-semibold text-slate-100">Catat Keuangan</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost h-9 w-9 rounded-full p-0"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Tipe</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Nominal</label>
                  <div className="relative">
                    <Coins className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="input-field pl-10"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      step="100"
                      placeholder="50000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Kategori</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className="select-field flex-1"
                  >
                    {categoriesByType.length === 0 ? (
                      <option value="">Belum ada kategori</option>
                    ) : (
                      categoriesByType.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={onAddCategory}
                    className="btn-secondary"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Tambah
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Tanggal</label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    className="input-field pl-10"
                    name="transaction_date"
                    value={form.transaction_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Deskripsi</label>
                <textarea
                  className="input-field min-h-[96px] resize-none"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Contoh: makan siang di warteg"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onClose}
                  className="btn-ghost"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Transaksi"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
