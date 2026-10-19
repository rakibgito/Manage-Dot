import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, DollarSign, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { validateAmount, formatBDT } from '../../utils/formatters';

interface GoalDepositWithdrawModalProps {
  goal: SavingsGoal | null;
  mode: 'deposit' | 'withdraw';
  isOpen: boolean;
  onClose: () => void;
}

export const GoalDepositWithdrawModal: React.FC<GoalDepositWithdrawModalProps> = ({
  goal,
  mode,
  isOpen,
  onClose,
}) => {
  const { depositToGoal, withdrawFromGoal } = useFinance();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid amount');
      return;
    }

    if (mode === 'withdraw' && validation.value > goal.currentAmount) {
      setError(`Cannot withdraw more than current balance (${formatBDT(goal.currentAmount)})`);
      return;
    }

    if (mode === 'deposit') {
      depositToGoal(goal.id, validation.value, note.trim() || undefined);
    } else {
      withdrawFromGoal(goal.id, validation.value, note.trim() || undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              mode === 'deposit'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}
          >
            {mode === 'deposit' ? (
              <ArrowDownRight className="w-6 h-6" />
            ) : (
              <ArrowUpRight className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === 'deposit' ? 'Add Money to Goal' : 'Withdraw from Goal'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {goal.title} • Current: {formatBDT(goal.currentAmount)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Amount to {mode === 'deposit' ? 'Add' : 'Withdraw'} (BDT)
            </label>
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-within:ring-2 focus-within:ring-emerald-500">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ৳
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold bg-transparent text-slate-900 dark:text-white outline-hidden"
                autoFocus
              />
            </div>
            {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Note / Source
            </label>
            <input
              type="text"
              placeholder={
                mode === 'deposit'
                  ? 'e.g. Saved from freelancing project'
                  : 'e.g. Tuition fee emergency'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-xs ${
                mode === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              Confirm {mode === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
