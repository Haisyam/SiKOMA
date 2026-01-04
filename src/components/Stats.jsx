import { BadgeDollarSign, CreditCard, PiggyBank, Wallet } from "lucide-react";

const STATS_CONFIG = [
  {
    key: "balance",
    label: "Saldo Saat Ini",
    icon: Wallet,
    accent: "from-cyan-400/30 to-emerald-400/20",
  },
  {
    key: "incomeMonth",
    label: "Pemasukan Bulan Ini",
    icon: BadgeDollarSign,
    accent: "from-emerald-400/30 to-amber-400/20",
  },
  {
    key: "expenseMonth",
    label: "Pengeluaran Bulan Ini",
    icon: CreditCard,
    accent: "from-rose-400/30 to-orange-400/20",
  },
  {
    key: "remainingMonth",
    label: "Sisa Uang Bulan Ini",
    icon: PiggyBank,
    accent: "from-teal-400/30 to-sky-400/20",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Stats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STATS_CONFIG.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="glass-card flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent}`}
            >
              <Icon className="h-5 w-5 text-slate-100" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {item.label}
              </p>
              <p className="text-xl font-semibold text-slate-100">
                {formatCurrency(stats[item.key])}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
