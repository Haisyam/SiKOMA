import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../lib/theme.jsx";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card text-xs text-slate-100">
        <p className="text-sm font-semibold">{payload[0].name}</p>
        <p className="text-slate-300">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }

  return null;
};

export default function Charts({ expenseByCategory, dailyExpense }) {
  const { theme } = useTheme();
  const axisColor = theme === "dark" ? "#94a3b8" : "#64748b";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass-card">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Pengeluaran per Kategori
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-100">Ringkasan Kategori</h3>
        <div className="mt-6 h-64">
          {expenseByCategory.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Belum ada data pengeluaran bulan ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {expenseByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-card">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Pengeluaran Harian
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-100">Trend Bulan Ini</h3>
        <div className="mt-6 h-64">
          {dailyExpense.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Belum ada transaksi di bulan ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyExpense} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                <YAxis
                  stroke={axisColor}
                  fontSize={12}
                  tickFormatter={(value) => value / 1000 + "k"}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
