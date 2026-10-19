import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  Plus,
  Tag,
  CreditCard,
  Edit2,
  Trash2,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { formatBDT, formatDhakaDisplayDate, formatDhakaDisplayDateTime, getDhakaCurrentMonthKey, utcIsoToDhakaDateInput } from '../../utils/formatters';
import { getCategoryIcon, getPaymentMethodBadge } from '../../utils/categoryIcons';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ExpensesViewProps {
  onOpenQuickAdd: (type: 'expense') => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenQuickAdd,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction, metrics, settings, updateSettings } = useFinance();
  const currentMonth = getDhakaCurrentMonthKey();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Custom category input
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense');
  }, [transactions]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenseTransactions.map((t) => t.category))).sort();
  }, [expenseTransactions]);

  const uniquePayments = useMemo(() => {
    return Array.from(new Set(expenseTransactions.map((t) => t.paymentMethod))).sort();
  }, [expenseTransactions]);

  const filteredExpenses = useMemo(() => {
    return expenseTransactions.filter((t) => {
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;
      return true;
    });
  }, [expenseTransactions, categoryFilter, paymentFilter]);

  // Top Category Spending breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    expenseTransactions.forEach((t) => {
      const prev = map.get(t.category) || { total: 0, count: 0 };
      map.set(t.category, { total: prev.total + t.amount, count: prev.count + 1 });
    });
    return Array.from(map.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [expenseTransactions]);

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const existing = settings.customExpenseCategories || [];
    if (!existing.includes(trimmed)) {
      updateSettings({
        customExpenseCategories: [...existing, trimmed],
      });
    }
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Expense Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* This Month Spending */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            This Month Total Spent
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatBDT(metrics.thisMonthExpenses)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Today's spending: <strong className="text-slate-700 dark:text-slate-200">{formatBDT(metrics.todaySpending)}</strong>
          </p>
        </div>

        {/* All-Time Spending */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            All-Time Total Expenses
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatBDT(metrics.totalExpenses)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Across {expenseTransactions.length} recorded expenses
          </p>
        </div>

        {/* Add Expense Action Card */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base">Bought Something?</h3>
            <p className="text-xs text-rose-100 mt-1">
              Food, tong er cha, rickshaw fare, or mobile recharge?
            </p>
          </div>
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="mt-3 py-2 px-4 rounded-xl bg-white text-rose-800 font-bold text-xs shadow-xs hover:bg-rose-50 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Record Expense
          </button>
        </div>
      </div>

      {/* Category Spending Summary Cards */}
      {categoryStats.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Category Breakdown
            </h3>
            {!isAddingCategory ? (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                + Add Custom Category
              </button>
            ) : (
              <form onSubmit={handleSaveCustomCategory} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New category..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryStats.slice(0, 8).map((cat) => {
              const pct = Math.round((cat.total / (metrics.totalExpenses || 1)) * 100);
              return (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      {getCategoryIcon(cat.category, 'w-3.5 h-3.5')}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {cat.category}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatBDT(cat.total)}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                      <span>{cat.count} items</span>
                      <span className="font-semibold text-rose-600">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Expenses History
            </h3>
            <p className="text-xs text-slate-400">
              Detailed list of all outflows
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {uniqueCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium outline-hidden"
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
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium outline-hidden"
              >
                <option value="all">All Payment Methods</option>
                {uniquePayments.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs ml-auto sm:ml-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Expense
            </button>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Expenses Found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              You haven't logged any expenses under these filters yet.
            </p>
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              + Record Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredExpenses.map((tx) => {
              const badge = getPaymentMethodBadge(tx.paymentMethod);
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 rounded-xl transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      {getCategoryIcon(tx.category, 'w-5 h-5')}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tx.category}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        {tx.billId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                            Bill Paid
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                        <span>{formatDhakaDisplayDateTime(tx.date)}</span>
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-600 dark:text-slate-300 truncate">
                              "{tx.note}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                        -{formatBDT(tx.amount)}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {formatDhakaDisplayDate(tx.date, true)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense entry? Your remaining balance will be restored."
        confirmText="Delete Expense"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
