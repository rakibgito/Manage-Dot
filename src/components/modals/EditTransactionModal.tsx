import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CreditCard, Tag, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, PaymentMethod } from '../../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_SOURCES,
  DEFAULT_PAYMENT_METHODS,
} from '../../utils/constants';
import {
  validateAmount,
  utcIsoToDhakaDateInput,
  utcIsoToDhakaTimeInput,
  dhakaDateTimeToUtcIso,
} from '../../utils/formatters';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { updateTransaction, settings } = useFinance();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction && isOpen) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setPaymentMethod(transaction.paymentMethod);
      setDate(utcIsoToDhakaDateInput(transaction.date));
      setTime(utcIsoToDhakaTimeInput(transaction.date));
      setNote(transaction.note || '');
      setError(null);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const categories = transaction.type === 'expense'
    ? [...DEFAULT_EXPENSE_CATEGORIES, ...(settings.customExpenseCategories || [])]
    : [...DEFAULT_INCOME_SOURCES, ...(settings.customIncomeSources || [])];

  if (!categories.includes(category)) {
    categories.push(category);
  }

  const paymentMethods = [
    ...DEFAULT_PAYMENT_METHODS,
    ...(settings.customPaymentMethods || []),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid amount');
      return;
    }

    const utcIso = dhakaDateTimeToUtcIso(date, time);

    updateTransaction(transaction.id, {
      amount: validation.value,
      category,
      paymentMethod,
      date: utcIso,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Edit {transaction.type === 'expense' ? 'Expense' : 'Income'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Amount (BDT)
            </label>
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-within:ring-2 focus-within:ring-emerald-500">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ৳
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold bg-transparent text-slate-900 dark:text-white outline-hidden"
                autoFocus
              />
            </div>
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

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
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Payment Method
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-xs rounded-xl font-medium border text-center transition ${
                    paymentMethod === method
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date
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

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Note
            </label>
            <input
              type="text"
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
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
