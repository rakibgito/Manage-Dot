import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, Clock, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Bill, BillFrequency } from '../../types';
import { DEFAULT_BILL_CATEGORIES } from '../../utils/constants';
import {
  validateAmount,
  getDhakaTodayDateString,
  utcIsoToDhakaDateInput,
  dhakaDateTimeToUtcIso,
} from '../../utils/formatters';

interface BillModalProps {
  bill?: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BillModal: React.FC<BillModalProps> = ({
  bill,
  isOpen,
  onClose,
}) => {
  const { addBill, updateBill } = useFinance();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_BILL_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (bill) {
        setTitle(bill.title);
        setCategory(bill.category);
        setAmount(bill.amount.toString());
        setDueDate(utcIsoToDhakaDateInput(bill.dueDate));
        setFrequency(bill.frequency);
        setNote(bill.note || '');
      } else {
        setTitle('');
        setCategory(DEFAULT_BILL_CATEGORIES[0]);
        setAmount('');
        // Default due date: 5 days from today
        const d = new Date();
        d.setDate(d.getDate() + 5);
        setDueDate(utcIsoToDhakaDateInput(d.toISOString()));
        setFrequency('monthly');
        setNote('');
      }
      setError(null);
    }
  }, [isOpen, bill]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a bill title');
      return;
    }

    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid amount');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    const dueDateIso = dhakaDateTimeToUtcIso(dueDate, '23:59');

    if (bill) {
      updateBill(bill.id, {
        title: title.trim(),
        category,
        amount: validation.value,
        dueDate: dueDateIso,
        frequency,
        note: note.trim() || undefined,
      });
    } else {
      addBill({
        title: title.trim(),
        category,
        amount: validation.value,
        dueDate: dueDateIso,
        frequency,
        note: note.trim() || undefined,
        monthKey: dueDate.slice(0, 7),
      });
    }

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
            {bill ? 'Edit Recurring Bill' : 'Add Recurring Bill'}
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
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Bill Title
            </label>
            <input
              type="text"
              placeholder="e.g. Mess Seat Rent, Wi-Fi Bill, Semester Fee"
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
                {DEFAULT_BILL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Amount (BDT)
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
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold bg-transparent text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Pay via bKash to mess manager by 5th"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              {bill ? 'Save Bill' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
