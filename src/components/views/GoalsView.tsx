import React, { useState } from 'react';
import {
  Target,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Trash2,
  Edit2,
  Download,
  PiggyBank,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { formatBDT, formatDhakaDisplayDate, formatDhakaDisplayDateTime, getDaysUntilDue } from '../../utils/formatters';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface GoalsViewProps {
  onOpenAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDepositWithdraw: (goal: SavingsGoal, mode: 'deposit' | 'withdraw') => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  onOpenAddGoal,
  onEditGoal,
  onDepositWithdraw,
}) => {
  const { goals, deleteGoal, metrics, exportGoalsCSV } = useFinance();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      deleteGoal(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Saved Across All Goals */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Saved in Goals
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatBDT(metrics.totalSavings)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Protected savings for future student expenses
          </p>
        </div>

        {/* Active Goals Count */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Active Targets
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {goals.length} Goals
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Tuition reserve, laptop, emergency fund
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Build Your Student Safety Net
            </h3>
            <p className="text-xs text-purple-100 mt-1">
              Saving small amounts from each private tuition adds up fast!
            </p>
          </div>
          <button
            onClick={onOpenAddGoal}
            className="mt-3 py-2 px-4 rounded-xl bg-white text-purple-900 font-bold text-xs shadow-xs hover:bg-purple-50 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + New Savings Target
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Your Savings Goals
            </h3>
            <p className="text-xs text-slate-400">
              Track progress rings, deposit funds, or withdraw when needed
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportGoalsCSV}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
              title="Export goals as CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAddGoal}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Goal
            </button>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Savings Goals Set Yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Set targets for semester fees, a new laptop, or an emergency fund to watch your savings grow systematically.
            </p>
            <button
              onClick={onOpenAddGoal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            >
              + Create Savings Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const target = goal.targetAmount || 1;
              const saved = goal.currentAmount || 0;
              const pct = Math.min(100, Math.round((saved / target) * 100));
              const remaining = Math.max(0, target - saved);
              const isCompleted = saved >= target;
              const isExpanded = expandedGoalId === goal.id;

              return (
                <div
                  key={goal.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Header: Title, Category, Actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {goal.title}
                          </h4>
                          {isCompleted && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Reached!
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {goal.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditGoal(goal)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Edit goal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(goal.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Delete goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Numerical Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {formatBDT(saved)}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">
                            / {formatBDT(target)}
                          </span>
                        </div>
                        <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-purple-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                        <span>
                          {isCompleted ? 'Goal Achieved!' : `Remaining: ${formatBDT(remaining)}`}
                        </span>
                        {goal.deadline && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            Target: {formatDhakaDisplayDate(goal.deadline)}
                          </span>
                        )}
                      </div>
                    </div>

                    {goal.notes && (
                      <p className="text-xs text-slate-500 italic mb-4">
                        "{goal.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions: Deposit, Withdraw, Toggle History */}
                  <div className="space-y-3 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDepositWithdraw(goal, 'deposit')}
                        className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Money
                      </button>

                      <button
                        onClick={() => onDepositWithdraw(goal, 'withdraw')}
                        disabled={saved <= 0}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition disabled:opacity-50"
                      >
                        Withdraw
                      </button>

                      {goal.history && goal.history.length > 0 && (
                        <button
                          onClick={() =>
                            setExpandedGoalId(isExpanded ? null : goal.id)
                          }
                          className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl"
                        >
                          {isExpanded ? 'Hide Log' : `Log (${goal.history.length})`}
                        </button>
                      )}
                    </div>

                    {/* Expandable History Drawer */}
                    {isExpanded && goal.history && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-2 max-h-40 overflow-y-auto">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Goal Activity Log
                        </span>
                        {goal.history.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0"
                          >
                            <div>
                              <span
                                className={`font-bold mr-1.5 ${
                                  h.type === 'deposit'
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {h.type === 'deposit' ? '+ Added' : '- Withdrew'}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {h.note || ''}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {formatBDT(h.amount)}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {formatDhakaDisplayDate(h.date)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Savings Goal"
        message="Are you sure you want to remove this savings goal? Its history log will also be removed."
        confirmText="Delete Goal"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
