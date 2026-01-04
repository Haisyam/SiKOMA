import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Paintbrush, Shapes, Tag, X } from "lucide-react";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "../lib/categoryIcons.js";

const DEFAULT_FORM = {
  name: "",
  type: "expense",
  color: "#22d3ee",
  icon: "Sparkles",
};

export default function CategoryModal({ isOpen, onClose, onSave, saving }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(DEFAULT_FORM);
    }
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(form);
  };

  const SelectedIcon = getCategoryIcon(form.icon);

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
                  Kategori
                </p>
                <h2 className="text-xl font-semibold text-slate-100">
                  Tambah Kategori Baru
                </h2>
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
              <div>
                <label className="mb-2 block text-sm text-slate-300">Nama kategori</label>
                <input
                  className="input-field"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Laundry"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Tipe</label>
                  <div className="relative">
                    <Shapes className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="select-field pl-10"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Warna</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Paintbrush className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="color"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Icon</label>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${form.color}22`, color: form.color }}
                  >
                    <SelectedIcon className="h-5 w-5" />
                  </div>
                  <div className="relative w-full">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      name="icon"
                      value={form.icon}
                      onChange={handleChange}
                      className="select-field pl-10"
                    >
                      {CATEGORY_ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
                  {saving ? "Menyimpan..." : "Simpan Kategori"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
