import React, { useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  AlertCircle,
  Clock,
  Sparkles,
  CalendarCheck2,
  Receipt,
  HelpCircle,
  Plus,
  Coffee,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { Bill } from '../../types';
import { formatBDT, formatDhakaDisplayDate, formatDhakaDisplayDateTime, getDaysUntilDue, utcIsoToDhakaDateInput, getDhakaCurrentMonthKey } from '../../utils/formatters';
import { getCategoryIcon, getPaymentMethodBadge } from '../../utils/categoryIcons';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onOpenQuickAdd: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onPayBill: (bill: Bill) => void;
}

const CATEGORY_CHART_COLORS = [
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickAdd,
  onNavigateTab,
  onPayBill,
}) => {
  const { metrics, transactions, bills, profile } = useFinance();
  const currentMonthKey = getDhakaCurrentMonthKey();

  // Urgent Bills: overdue + due within 7 days
  const urgentBills = useMemo(() => {
    return bills
      .filter((b) => b.status !== 'paid')
      .map((b) => ({
        ...b,
        daysLeft: getDaysUntilDue(b.dueDate),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [bills]);

  // Spending by category this month for the pie/donut chart
  const categorySpendingData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      const txMonth = utcIsoToDhakaDateInput(tx.date).slice(0, 7);
      if (txMonth !== currentMonthKey) return;
      map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
    });

    const result = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return result;
  }, [transactions, currentMonthKey]);

  // Recent transactions (last 6)
  const recentTransactions = useMemo(() => {
    return [...transactions].slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-emerald-700/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-100 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Assalamu Alaikum, {profile.name}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5">
            Manage Dot Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            {profile.university} • Keeping your mess rent, daily tong er cha, tuition fees, and savings completely organized.
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="self-stretch sm:self-auto py-2.5 px-5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Record Expense / Income
        </button>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Current Balance */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Balance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              metrics.currentBalance >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatBDT(metrics.currentBalance)}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Total income − Total expenses
          </p>
        </div>

        {/* Monthly Income */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              This Month Income
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatBDT(metrics.thisMonthIncome)}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Allowance &amp; tuition income
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              This Month Spent
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            {formatBDT(metrics.thisMonthExpenses)}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Rent, food &amp; bills spent
          </p>
        </div>

        {/* Remaining Month Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Remaining This Month
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-lg sm:text-2xl font-extrabold tracking-tight ${
              metrics.thisMonthRemaining >= 0
                ? 'text-slate-900 dark:text-white'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatBDT(metrics.thisMonthRemaining)}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Month income − Month spent
          </p>
        </div>

        {/* Total Savings in Goals */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total In Savings
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
            {formatBDT(metrics.totalSavings)}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Locked in savings goals
          </p>
        </div>
      </div>

      {/* Student Daily Spending & Key Questions Answered Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Spending Callout */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-500" />
                Today's Spending
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Dhaka Time
              </span>
            </div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {formatBDT(metrics.todaySpending)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {metrics.todaySpending === 0
                ? "You haven't spent anything yet today! Great discipline."
                : `Recorded from your daily food, tong er cha, and transport today.`}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Quick student entry:</span>
            <button
              onClick={onOpenQuickAdd}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              + Add Today's Expense
            </button>
          </div>
        </div>

        {/* 4 Essential Student Questions Answered Box */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Key Financial Answers at a Glance
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block font-medium">
                  1. How much money do I have now?
                </span>
                <span className="text-lg font-black text-white mt-0.5 block">
                  {formatBDT(metrics.currentBalance)}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block font-medium">
                  2. How much did I spend today?
                </span>
                <span className="text-lg font-black text-rose-400 mt-0.5 block">
                  {formatBDT(metrics.todaySpending)}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block font-medium">
                  3. Which bills are due soon?
                </span>
                <span className="text-lg font-black text-amber-400 mt-0.5 block">
                  {metrics.overdueBillsCount > 0
                    ? `${metrics.overdueBillsCount} Overdue Bill${metrics.overdueBillsCount > 1 ? 's' : ''}!`
                    : metrics.billsDueWithin7DaysCount > 0
                    ? `${metrics.billsDueWithin7DaysCount} Due in 7 Days`
                    : 'All Bills Up to Date!'}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block font-medium">
                  4. How much can I save this month?
                </span>
                <span className="text-lg font-black text-emerald-400 mt-0.5 block">
                  {formatBDT(metrics.estimatedMonthEndSavings)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700/60">
            <span>Calculated from your current month income &amp; pending bills</span>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              View Budgets <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section: Spending Donut Chart & Upcoming/Overdue Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Spending by Category Donut Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spending by Category
              </h3>
              <p className="text-xs text-slate-400">
                This month's expenses breakdown
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Full Analytics
            </button>
          </div>

          {categorySpendingData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Expenses Logged This Month
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                Record your daily expenses to see category breakdowns and donut charts here.
              </p>
              <button
                onClick={onOpenQuickAdd}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition"
              >
                + Add Expense
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
              {/* Pie Chart */}
              <div className="w-full sm:w-1/2 h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categorySpendingData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatBDT(Number(value) || 0), 'Amount']}
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute text-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {formatBDT(metrics.thisMonthExpenses)}
                  </span>
                </div>
              </div>

              {/* Legends with BDT and percentages */}
              <div className="w-full sm:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
                {categorySpendingData.map((cat, idx) => {
                  const pct = Math.round((cat.value / (metrics.thisMonthExpenses || 1)) * 100);
                  const color = CATEGORY_CHART_COLORS[idx % CATEGORY_CHART_COLORS.length];
                  return (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatBDT(cat.value)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming & Overdue Bills Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Upcoming &amp; Due Bills
                {metrics.overdueBillsCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    {metrics.overdueBillsCount} Overdue
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Mess rent, tuition, internet &amp; recurring utilities
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('bills')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              All Bills
            </button>
          </div>

          {urgentBills.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Pending or Overdue Bills
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                You're all caught up! Add recurring rent or tuition to track deadlines.
              </p>
              <button
                onClick={() => onNavigateTab('bills')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition"
              >
                + Add Recurring Bill
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-64 pr-1">
              {urgentBills.map((bill) => {
                const isOverdue = bill.daysLeft < 0;
                const isDueToday = bill.daysLeft === 0;

                return (
                  <div
                    key={bill.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                      isOverdue
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                        : isDueToday
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isOverdue
                            ? 'bg-rose-500 text-white'
                            : isDueToday
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {getCategoryIcon(bill.category, 'w-4 h-4')}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {bill.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                          <span
                            className={`font-semibold ${
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400'
                                : isDueToday
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {isOverdue
                              ? `${Math.abs(bill.daysLeft)} days overdue`
                              : isDueToday
                              ? 'Due Today!'
                              : `Due in ${bill.daysLeft} days`}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-slate-400">
                            {formatDhakaDisplayDate(bill.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        {formatBDT(bill.amount)}
                      </span>
                      <button
                        onClick={() => onPayBill(bill)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List with empty state */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400">
              Latest activity across your accounts
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            View All ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Transactions Recorded Yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Your account is completely clean. Tap the button below to add your first allowance, tuition income, or mess expense!
            </p>
            <button
              onClick={onOpenQuickAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              + Quick Add Transaction
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const badge = getPaymentMethodBadge(tx.paymentMethod);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {getCategoryIcon(tx.category, 'w-4 h-4')}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tx.category}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.note || formatDhakaDisplayDateTime(tx.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-extrabold ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatBDT(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {formatDhakaDisplayDate(tx.date, true)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
