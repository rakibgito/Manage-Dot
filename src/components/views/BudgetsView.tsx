import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';
import { formatBDT, getDhakaCurrentMonthKey } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface BudgetsViewProps {
  onOpenBudgetModal: (category?: string, limit?: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ onOpenBudgetModal }) => {
  const { budgets, deleteBudget, getSpentForCategoryThisMonth } = useFinance();
  const currentMonth = getDhakaCurrentMonthKey();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Computed summary
  const summary = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let warningCount = 0;
    let alertCount = 0;

    budgets.forEach((b) => {
      totalBudget += b.monthlyLimit;
      const spent = getSpentForCategoryThisMonth(b.category);
      totalSpent += spent;
      const pct = (spent / (b.monthlyLimit || 1)) * 100;
      if (pct >= 100) {
        alertCount++;
      } else if (pct >= 80) {
        warningCount++;
      }
    });

    const totalRemaining = Math.max(0, totalBudget - totalSpent);
    const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return { totalBudget, totalSpent, totalRemaining, warningCount, alertCount, overallPct };
  }, [budgets, getSpentForCategoryThisMonth]);

  const confirmDelete = () => {
    if (deleteId) {
      deleteBudget(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Budget Health Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budgeted */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Monthly Budget
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatBDT(summary.totalBudget)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Target limit across {budgets.length} categories
          </p>
        </div>

        {/* Total Spent vs Budget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Budget Consumed
          </span>
          <div
            className={`text-2xl font-black ${
              summary.overallPct >= 100
                ? 'text-rose-600 dark:text-rose-400'
                : summary.overallPct >= 80
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {summary.overallPct}% ({formatBDT(summary.totalSpent)})
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Remaining buffer: <strong>{formatBDT(summary.totalRemaining)}</strong>
          </p>
        </div>

        {/* Health status */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Budget Health &amp; Alerts
            </span>
            <div className="flex items-center gap-2 mt-2">
              {summary.alertCount > 0 ? (
                <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {summary.alertCount} Over Limit!
                </span>
              ) : summary.warningCount > 0 ? (
                <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {summary.warningCount} Near 80% Limit
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Within Budget
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onOpenBudgetModal()}
            className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start"
          >
            + Set Category Budget
          </button>
        </div>
      </div>

      {/* Warning Alert Banner if any threshold crossed */}
      {(summary.alertCount > 0 || summary.warningCount > 0) && (
        <div
          className={`rounded-3xl p-4 sm:p-5 border flex items-center gap-3.5 ${
            summary.alertCount > 0
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              summary.alertCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            {summary.alertCount > 0 ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold">
              {summary.alertCount > 0
                ? `${summary.alertCount} Category Budgets Exceeded 100%!`
                : `${summary.warningCount} Category Budgets Reached Warning Threshold (≥80%)`}
            </h4>
            <p className="text-xs opacity-90 mt-0.5">
              Review your spending progress bars below to stay on track for the remainder of this month.
            </p>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Spending Limits
            </h3>
            <p className="text-xs text-slate-400">
              Yellow alert at 80%, red alert when 100% exceeded
            </p>
          </div>

          <button
            onClick={() => onOpenBudgetModal()}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            + New Budget
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const spent = getSpentForCategoryThisMonth(b.category);
            const limit = b.monthlyLimit || 1;
            const pct = Math.round((spent / limit) * 100);
            const remaining = Math.max(0, limit - spent);
            const isAlert = pct >= 100;
            const isWarning = pct >= 80 && pct < 100;

            let barColor = 'bg-emerald-500';
            if (isAlert) barColor = 'bg-rose-500';
            else if (isWarning) barColor = 'bg-amber-500';

            return (
              <div
                key={b.id}
                className={`p-4 sm:p-5 rounded-2xl border transition ${
                  isAlert
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                    : isWarning
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Header: Title + actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isAlert
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {getCategoryIcon(b.category, 'w-4 h-4')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {b.category}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Monthly limit: {formatBDT(b.monthlyLimit)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenBudgetModal(b.category, b.monthlyLimit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Edit budget limit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Remove budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Spent: {formatBDT(spent)}
                    </span>
                    <span
                      className={`font-black ${
                        isAlert
                          ? 'text-rose-600 dark:text-rose-400'
                          : isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {pct}%
                    </span>
                    <span className="text-slate-400">
                      Remaining: {formatBDT(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Remove Category Budget"
        message="Are you sure you want to remove this budget limit?"
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
