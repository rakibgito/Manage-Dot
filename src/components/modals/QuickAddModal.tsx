import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Plus, Calendar, Clock, Tag, CreditCard, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType, PaymentMethod } from '../../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_SOURCES,
  DEFAULT_PAYMENT_METHODS,
} from '../../utils/constants';
import {
  validateAmount,
  getDhakaTodayDateString,
  utcIsoToDhakaTimeInput,
  dhakaDateTimeToUtcIso,
} from '../../utils/formatters';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const { addTransaction, settings } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Sync default type when opened
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setAmount('');
      setError(null);
      setNote('');
      setIsAddingCustomCategory(false);
      setCustomCategory('');

      // Default date & time in Dhaka timezone
      setDate(getDhakaTodayDateString());
      setTime(utcIsoToDhakaTimeInput(new Date().toISOString()));

      // Default category
      if (defaultType === 'expense') {
        setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
      } else {
        setCategory(DEFAULT_INCOME_SOURCES[0]);
      }

      // Default payment method
      setPaymentMethod('Cash');

      // Autofocus amount input after a tiny tick for modal rendering
      setTimeout(() => {
        amountInputRef.current?.focus();
        amountInputRef.current?.select();
      }, 50);
    }
  }, [isOpen, defaultType]);

  // Update default category when type flips
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setError(null);
    setIsAddingCustomCategory(false);
    if (newType === 'expense') {
      setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(DEFAULT_INCOME_SOURCES[0]);
    }
  };

  const categories = type === 'expense'
    ? [...DEFAULT_EXPENSE_CATEGORIES, ...(settings.customExpenseCategories || [])]
    : [...DEFAULT_INCOME_SOURCES, ...(settings.customIncomeSources || [])];

  const paymentMethods = [
    ...DEFAULT_PAYMENT_METHODS,
    ...(settings.customPaymentMethods || []),
  ];

  // Quick preset shortcuts for fast student tap
  const quickExpenseCategories = [
    'Tea/Coffee/Snacks',
    'Food & Groceries',
    'Transportation',
    'Mobile Recharge & Internet',
    'Books & Stationery',
  ];

  const quickIncomeSources = [
    'Family allowance',
    'Tuition (Private Teaching)',
    'Part-time job',
    'Freelancing',
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid amount');
      amountInputRef.current?.focus();
      return;
    }

    const resolvedCategory = isAddingCustomCategory
      ? customCategory.trim() || 'Other'
      : category;

    if (!resolvedCategory) {
      setError('Please select or enter a category');
      return;
    }

    const utcIso = dhakaDateTimeToUtcIso(date, time);

    addTransaction({
      type,
      amount: validation.value,
      category: resolvedCategory,
      paymentMethod,
      date: utcIso,
      note: note.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Type Toggle */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full max-w-[260px]">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Amount Input with Currency Symbol */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Amount (BDT)
            </label>
            <div className="relative rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-slate-400 dark:text-slate-500">
                ৳
              </span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full pl-12 pr-4 py-3 sm:py-4 text-2xl sm:text-3xl font-extrabold bg-transparent text-slate-900 dark:text-white outline-hidden ${
                  type === 'expense' ? 'focus:text-rose-600 dark:focus:text-rose-400' : 'focus:text-emerald-600 dark:focus:text-emerald-400'
                }`}
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
            )}
          </div>

          {/* Quick Category Chips for instant 1-tap selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Category
              </label>
              {!isAddingCustomCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  + Custom
                </button>
              )}
            </div>

            {/* Quick chips */}
            {!isAddingCustomCategory && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {(type === 'expense' ? quickExpenseCategories : quickIncomeSources).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCategory(chip)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      category === chip
                        ? type === 'expense'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 font-semibold ring-1 ring-rose-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-semibold ring-1 ring-emerald-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {isAddingCustomCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(false)}
                  className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Payment Method
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {paymentMethods.map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 text-xs rounded-xl font-medium border text-center transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time (Dhaka Timezone) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date (Asia/Dhaka)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Tong er cha with batchmates, bus fare..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
