import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { DEFAULT_SAVINGS_GOAL_PRESETS } from '../../utils/constants';
import {
  validateAmount,
  utcIsoToDhakaDateInput,
  dhakaDateTimeToUtcIso,
} from '../../utils/formatters';

interface GoalModalProps {
  goal?: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
}

const GOAL_CATEGORIES = [
  'Emergency fund',
  'University expenses',
  'Laptop/Phone',
  'Personal savings',
  'Business investment',
  'Custom',
];

export const GoalModal: React.FC<GoalModalProps> = ({
  goal,
  isOpen,
  onClose,
}) => {
  const { addGoal, updateGoal } = useFinance();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setTitle(goal.title);
        setCategory(goal.category);
        setTargetAmount(goal.targetAmount.toString());
        setInitialAmount('');
        setDeadline(goal.deadline ? utcIsoToDhakaDateInput(goal.deadline) : '');
        setNotes(goal.notes || '');
      } else {
        setTitle('');
        setCategory(GOAL_CATEGORIES[0]);
        setTargetAmount('');
        setInitialAmount('');
        setDeadline('');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof DEFAULT_SAVINGS_GOAL_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setTargetAmount(preset.target.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal title');
      return;
    }

    const targetVal = validateAmount(targetAmount);
    if (!targetVal.isValid) {
      setError(targetVal.error || 'Please enter a valid target amount');
      return;
    }

    let initialVal = 0;
    if (!goal && initialAmount) {
      const initValRes = validateAmount(initialAmount);
      if (!initValRes.isValid) {
        setError(initValRes.error || 'Please enter a valid initial amount');
        return;
      }
      initialVal = initValRes.value;
    }

    const deadlineIso = deadline ? dhakaDateTimeToUtcIso(deadline, '23:59') : undefined;

    if (goal) {
      updateGoal(goal.id, {
        title: title.trim(),
        category,
        targetAmount: targetVal.value,
        deadline: deadlineIso,
        notes: notes.trim() || undefined,
      });
    } else {
      addGoal(
        {
          title: title.trim(),
          category,
          targetAmount: targetVal.value,
          deadline: deadlineIso,
          notes: notes.trim() || undefined,
        },
        initialVal
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {goal ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Preset Buttons if new goal */}
          {!goal && (
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick University Student Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SAVINGS_GOAL_PRESETS.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition"
                  >
                    {p.title} (৳{p.target.toLocaleString()})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g. Next Semester Tuition Fund, Laptop upgrade"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Target Amount (BDT)
              </label>
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ৳
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => {
                    setTargetAmount(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold bg-transparent text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>
          </div>

          {!goal && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Initial Saved Amount (Optional)
              </label>
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ৳
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold bg-transparent text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Target Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Notes / Motivation
            </label>
            <input
              type="text"
              placeholder="e.g. Save ৳3,000 every month from private tuition"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

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
              {goal ? 'Save Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
