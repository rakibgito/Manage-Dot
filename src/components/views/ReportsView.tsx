import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Sparkles,
  PieChart as PieIcon,
  Tag,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FIXED_EXPENSE_CATEGORIES } from '../../utils/constants';
import {
  formatBDT,
  formatDhakaDisplayDate,
  getDhakaCurrentMonthKey,
  getDhakaTodayDateString,
  utcIsoToDhakaDateInput,
} from '../../utils/formatters';
import { getPaymentMethodBadge } from '../../utils/categoryIcons';

const CHART_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#64748B', // Slate
  '#14B8A6', // Teal
  '#E11D48', // Rose
];

export const ReportsView: React.FC = () => {
  const { transactions } = useFinance();

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (selectedPayment !== 'all' && t.paymentMethod !== selectedPayment) return false;
      return true;
    });
  }, [transactions, selectedCategory, selectedPayment]);

  // Aggregated Bar chart data based on selected timeframe
  const barChartData = useMemo(() => {
    const map = new Map<string, { label: string; income: number; expense: number }>();

    filteredTransactions.forEach((tx) => {
      const dhakaDate = utcIsoToDhakaDateInput(tx.date); // 'YYYY-MM-DD'
      let key = '';
      let label = '';

      if (timeframe === 'daily') {
        key = dhakaDate;
        label = dhakaDate.slice(5); // 'MM-DD'
      } else if (timeframe === 'weekly') {
        // approximate week grouping by dividing day into 4 weekly buckets
        const parts = dhakaDate.split('-');
        const day = parseInt(parts[2], 10);
        const weekNum = Math.min(4, Math.ceil(day / 7));
        key = `${parts[0]}-${parts[1]}-W${weekNum}`;
        label = `${parts[1]}/W${weekNum}`;
      } else if (timeframe === 'monthly') {
        key = dhakaDate.slice(0, 7); // 'YYYY-MM'
        label = dhakaDate.slice(0, 7);
      } else {
        key = dhakaDate.slice(0, 4); // 'YYYY'
        label = dhakaDate.slice(0, 4);
      }

      const existing = map.get(key) || { label, income: 0, expense: 0 };
      if (tx.type === 'income') {
        existing.income += tx.amount;
      } else {
        existing.expense += tx.amount;
      }
      map.set(key, existing);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Show last 12 buckets
      .map(([_, v]) => v);
  }, [filteredTransactions, timeframe]);

  // Category breakdown for PieChart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Fixed vs Variable expenses calculation
  const fixedVsVariable = useMemo(() => {
    let fixed = 0;
    let variable = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      const isFixed = FIXED_EXPENSE_CATEGORIES.some((c) =>
        tx.category.toLowerCase().includes(c.toLowerCase())
      );
      if (isFixed) fixed += tx.amount;
      else variable += tx.amount;
    });

    const total = fixed + variable;
    return {
      fixed,
      variable,
      total,
      fixedPct: total > 0 ? Math.round((fixed / total) * 100) : 0,
      variablePct: total > 0 ? Math.round((variable / total) * 100) : 0,
    };
  }, [filteredTransactions]);

  // Payment method distribution
  const paymentMethodData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      map.set(tx.paymentMethod, (map.get(tx.paymentMethod) || 0) + tx.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category))).sort();
  }, [transactions]);

  const uniquePayments = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.paymentMethod))).sort();
  }, [transactions]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Timeframe & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Timeframe Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimeframe(mode)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition ${
                timeframe === mode
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {uniqueCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium outline-hidden"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {uniquePayments.length > 0 && (
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium outline-hidden"
            >
              <option value="all">All Payment Methods</option>
              {uniquePayments.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Bar Chart: Income vs Expenses */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Income vs Expenses Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated by {timeframe} periods in Asia/Dhaka
            </p>
          </div>
        </div>

        {barChartData.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No transaction data available for this timeframe. Add transactions to see graphs.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(val) => `৳${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any) => [formatBDT(Number(val) || 0)]}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Middle Grid: Fixed vs Variable & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Fixed vs Variable Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Fixed vs. Variable Student Expenses
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Fixed (Mess rent, tuition, internet) vs Variable (Tong er cha, snacks, shopping)
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-blue-600 dark:text-blue-400">
                  Fixed Expenses ({fixedVsVariable.fixedPct}%)
                </span>
                <span className="text-slate-900 dark:text-white">
                  {formatBDT(fixedVsVariable.fixed)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${fixedVsVariable.fixedPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-600 dark:text-amber-400">
                  Variable &amp; Discretionary ({fixedVsVariable.variablePct}%)
                </span>
                <span className="text-slate-900 dark:text-white">
                  {formatBDT(fixedVsVariable.variable)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${fixedVsVariable.variablePct}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              💡 <strong>Student Pro-Tip:</strong> To save more money each month, target trimming down your variable snacks and dining out, as rent and tuition fees are compulsory fixed obligations.
            </div>
          </div>
        </div>

        {/* Payment Methods (bKash / Nagad / Rocket / Cash / Bank) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Payment Channel Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            How you spend across bKash, Cash, Nagad, and Bank
          </p>

          {paymentMethodData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethodData.map((item) => {
                const badge = getPaymentMethodBadge(item.name);
                const totalExp = fixedVsVariable.total || 1;
                const pct = Math.round((item.value / totalExp) * 100);

                return (
                  <div
                    key={item.name}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${badge.dot}`} />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {pct}% of all spending
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatBDT(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Spending Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Top Spending Categories
        </h3>
        {categoryData.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No expenses logged yet.
          </div>
        ) : (
          <div className="space-y-2">
            {categoryData.slice(0, 6).map((cat, idx) => {
              const maxVal = categoryData[0]?.value || 1;
              const barPct = Math.round((cat.value / maxVal) * 100);

              return (
                <div
                  key={cat.name}
                  className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3 w-1/3 truncate">
                    <span className="text-xs font-bold text-slate-400 w-4">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex-1 max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>

                  <span className="text-xs font-black text-slate-900 dark:text-white text-right">
                    {formatBDT(cat.value)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
