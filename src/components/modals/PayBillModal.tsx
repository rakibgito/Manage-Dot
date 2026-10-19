import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Bill, PaymentMethod } from '../../types';
import { DEFAULT_PAYMENT_METHODS } from '../../utils/constants';
import { formatBDT } from '../../utils/formatters';

interface PayBillModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayBillModal: React.FC<PayBillModalProps> = ({
  bill,
  isOpen,
  onClose,
}) => {
  const { markBillAsPaid, settings } = useFinance();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [note, setNote] = useState('');

  if (!isOpen || !bill) return null;

  const paymentMethods = [
    ...DEFAULT_PAYMENT_METHODS,
    ...(settings.customPaymentMethods || []),
  ];

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    markBillAsPaid(bill.id, paymentMethod, note.trim() || undefined);
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
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mark Bill as Paid
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will create a matching expense in your transactions
            </p>
          </div>
        </div>

        {/* Bill summary card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {bill.category}
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {bill.title}
            </h4>
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatBDT(bill.amount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleConfirmPay} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Paid via
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-2 text-xs rounded-xl font-medium border text-center transition ${
                    paymentMethod === m
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Payment Note / TrxID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. bKash TrxID: 9X7A21 or paid to mess manager"
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
              Confirm Paid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
