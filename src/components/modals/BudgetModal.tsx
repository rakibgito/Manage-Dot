import React, { useState, useEffect } from 'react';
import { X, Tag, DollarSign } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { DEFAULT_EXPENSE_CATEGORIES } from '../../utils/constants';
import { validateAmount } from '../../utils/formatters';

interface BudgetModalProps {
  initialCategory?: string;
  initialLimit?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  initialCategory,
  initialLimit,
  isOpen,
  onClose,
}) => {
  const { setCategoryBudget, settings } = useFinance();
  const [category, setCategory] = useState(initialCategory || DEFAULT_EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState(initialLimit ? initialLimit.toString() : '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory || DEFAULT_EXPENSE_CATEGORIES[0]);
      setLimit(initialLimit ? initialLimit.toString() : '');
      setError(null);
    }
  }, [isOpen, initialCategory, initialLimit]);

  if (!isOpen) return null;

  const categories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...(settings.customExpenseCategories || []),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAmount(limit);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid monthly limit');
      return;
    }

    setCategoryBudget(category, validation.value);
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

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {initialLimit ? 'Edit Category Budget' : 'Set Category Budget'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          You will get warnings at 80% (amber) and alerts when exceeded at 100% (red).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!initialCategory}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Monthly Budget Limit (BDT)
            </label>
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-within:ring-2 focus-within:ring-emerald-500">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ৳
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 6000"
                value={limit}
                onChange={(e) => {
                  setLimit(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-9 pr-3 py-2.5 text-lg font-bold bg-transparent text-slate-900 dark:text-white outline-hidden"
                autoFocus
              />
            </div>
            {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
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
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
