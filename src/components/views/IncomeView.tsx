import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  Plus,
  Briefcase,
  GraduationCap,
  Calendar,
  Trash2,
  Edit2,
  Receipt,
  PiggyBank,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { formatBDT, formatDhakaDisplayDate, formatDhakaDisplayDateTime, getDhakaCurrentMonthKey, utcIsoToDhakaDateInput } from '../../utils/formatters';
import { getPaymentMethodBadge } from '../../utils/categoryIcons';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface IncomeViewProps {
  onOpenQuickAdd: (type: 'income') => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  onOpenQuickAdd,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction, metrics, profile } = useFinance();
  const currentMonth = getDhakaCurrentMonthKey();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState('all');

  const incomeTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'income');
  }, [transactions]);

  const uniqueSources = useMemo(() => {
    return Array.from(new Set(incomeTransactions.map((t) => t.category))).sort();
  }, [incomeTransactions]);

  const filteredIncome = useMemo(() => {
    if (sourceFilter === 'all') return incomeTransactions;
    return incomeTransactions.filter((t) => t.category === sourceFilter);
  }, [incomeTransactions, sourceFilter]);

  // Source breakdown
  const sourceBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    incomeTransactions.forEach((t) => {
      const prev = map.get(t.category) || { total: 0, count: 0 };
      map.set(t.category, { total: prev.total + t.amount, count: prev.count + 1 });
    });
    return Array.from(map.entries())
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [incomeTransactions]);

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Monthly Income */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            This Month Income
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatBDT(metrics.thisMonthIncome)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Target: {formatBDT(profile.monthlyAllowanceTarget || 18000)}</span>
            <span className="font-semibold text-emerald-600">
              {Math.min(100, Math.round((metrics.thisMonthIncome / (profile.monthlyAllowanceTarget || 1)) * 100))}% reached
            </span>
          </div>
        </div>

        {/* All-time Income */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total All-time Income
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatBDT(metrics.totalIncome)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Across {incomeTransactions.length} recorded payments
          </p>
        </div>

        {/* Action card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base">Earned Money?</h3>
            <p className="text-xs text-emerald-100 mt-1">
              Family allowance, private tuition batch, or freelancing payment?
            </p>
          </div>
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="mt-3 py-2 px-4 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-xs hover:bg-emerald-50 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Record Income
          </button>
        </div>
      </div>

      {/* Income Stream Cards Breakdown */}
      {sourceBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
            Income Streams by Source
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {sourceBreakdown.map((s) => {
              const pct = Math.round((s.total / (metrics.totalIncome || 1)) * 100);
              return (
                <div
                  key={s.source}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {s.source}
                    </span>
                    <span className="font-bold text-emerald-600">{pct}%</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatBDT(s.total)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {s.count} deposit{s.count > 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Income Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Income History
            </h3>
            <p className="text-xs text-slate-400">
              Detailed log of received funds
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {uniqueSources.length > 0 && (
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium outline-hidden"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onOpenQuickAdd('income')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs ml-auto sm:ml-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Income
            </button>
          </div>
        </div>

        {filteredIncome.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Income Recorded Yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Add your family allowance from home, private tuition payment, or freelancing income to start tracking.
            </p>
            <button
              onClick={() => onOpenQuickAdd('income')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              + Add Income
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredIncome.map((tx) => {
              const badge = getPaymentMethodBadge(tx.paymentMethod);
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 rounded-xl transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
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
                      <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        +{formatBDT(tx.amount)}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {formatDhakaDisplayDate(tx.date, true)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit income"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete income"
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
        title="Delete Income Record"
        message="Are you sure you want to delete this income entry? Your total balance will be reduced."
        confirmText="Delete Income"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
