import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { getCategoryIcon } from "../lib/categoryIcons.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const category = transaction.category;
  const Icon = getCategoryIcon(category?.icon);
  const isIncome = transaction.type === "income";
  const tone = isIncome
    ? "border-emerald-400/40 bg-emerald-500/10"
    : "border-rose-400/40 bg-rose-500/10";
  const amountColor = isIncome ? "text-emerald-200" : "text-rose-200";

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -3 }}
      className={`glass-card flex flex-col gap-4 border ${tone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${category?.color ?? "#94a3b8"}22` }}
          >
            <Icon className="h-5 w-5" style={{ color: category?.color ?? "#94a3b8" }} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              {category?.name ?? "Tanpa Kategori"}
            </h3>
            <p className="whitespace-pre-wrap text-sm text-slate-400">
              {transaction.description}
            </p>
          </div>
        </div>
        <span
          className={`badge ${
            isIncome
              ? "border-emerald-400/40 text-emerald-200"
              : "border-rose-400/40 text-rose-200"
          }`}
        >
          {isIncome ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownLeft className="h-4 w-4" />
          )}
          {isIncome ? "Income" : "Expense"}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-lg font-semibold ${amountColor}`}>
            {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(transaction.transaction_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(transaction)}
            className="btn-secondary"
            type="button"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(transaction)}
            className="btn-ghost border-rose-400/40 text-rose-200 hover:border-rose-400/70 hover:bg-rose-500/10"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
