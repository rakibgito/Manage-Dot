import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  Download,
  Trash2,
  Edit2,
  RotateCw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Bill } from '../../types';
import { formatBDT, formatDhakaDisplayDate, getDaysUntilDue, utcIsoToDhakaDateInput } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface BillsViewProps {
  onOpenAddBill: () => void;
  onEditBill: (bill: Bill) => void;
  onPayBill: (bill: Bill) => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  onOpenAddBill,
  onEditBill,
  onPayBill,
}) => {
  const { bills, deleteBill, generateMonthlyBillsForCurrentMonth, exportBillsCSV } = useFinance();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  // Categorize bills
  const billMetrics = useMemo(() => {
    let overdueCount = 0;
    let dueSoonCount = 0;
    let pendingTotal = 0;
    let overdueTotal = 0;

    bills.forEach((b) => {
      if (b.status === 'paid') return;
      const days = getDaysUntilDue(b.dueDate);
      if (days < 0) {
        overdueCount++;
        overdueTotal += b.amount;
      } else {
        pendingTotal += b.amount;
        if (days <= 7) dueSoonCount++;
      }
    });

    return { overdueCount, dueSoonCount, pendingTotal, overdueTotal };
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const days = getDaysUntilDue(b.dueDate);
      const isOverdue = b.status !== 'paid' && days < 0;

      if (filterStatus === 'paid') return b.status === 'paid';
      if (filterStatus === 'overdue') return isOverdue;
      if (filterStatus === 'pending') return b.status !== 'paid' && !isOverdue;
      return true;
    }).sort((a, b) => {
      // Unpaid & overdue first
      if (a.status === 'paid' && b.status !== 'paid') return 1;
      if (a.status !== 'paid' && b.status === 'paid') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [bills, filterStatus]);

  const confirmDelete = () => {
    if (deleteId) {
      deleteBill(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Overdue Total */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Overdue Amount
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatBDT(billMetrics.overdueTotal)}
          </div>
          <p className="text-xs text-rose-500 mt-1 font-semibold">
            {billMetrics.overdueCount} bill{billMetrics.overdueCount === 1 ? '' : 's'} past due date!
          </p>
        </div>

        {/* Due Soon within 7 Days */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Due Within 7 Days
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {billMetrics.dueSoonCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upcoming mess rent or tuition
          </p>
        </div>

        {/* Total Pending Bills */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pending Outflow
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatBDT(billMetrics.pendingTotal)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Expected out of student wallet
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base">New Academic Bill?</h3>
            <p className="text-xs text-emerald-100 mt-1">
              Add mess rent, Wi-Fi, semester fees, or gym.
            </p>
          </div>
          <button
            onClick={onOpenAddBill}
            className="mt-3 py-2 px-4 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-xs hover:bg-emerald-50 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Add Bill
          </button>
        </div>
      </div>

      {/* Bill Reminders Banner if any overdue or due soon */}
      {(billMetrics.overdueCount > 0 || billMetrics.dueSoonCount > 0) && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                Student Bill Reminders (Next 7 Days)
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                You have {billMetrics.overdueCount > 0 ? `${billMetrics.overdueCount} overdue` : ''}
                {billMetrics.overdueCount > 0 && billMetrics.dueSoonCount > 0 ? ' and ' : ''}
                {billMetrics.dueSoonCount > 0 ? `${billMetrics.dueSoonCount} bill(s) due within 7 days` : ''}.
                Mark them paid to automatically record matching expenses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setFilterStatus('overdue')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 hover:bg-amber-300"
            >
              Show Due Bills
            </button>
          </div>
        </div>
      )}

      {/* Bills Header Bar & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recurring Bills &amp; Deadlines
            </h3>
            <p className="text-xs text-slate-400">
              Auto-recurrence checks avoid duplicate charges each month
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Segments */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                All ({bills.length})
              </button>
              <button
                onClick={() => setFilterStatus('overdue')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterStatus === 'overdue'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Overdue
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterStatus === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterStatus === 'paid'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Paid
              </button>
            </div>

            <button
              onClick={exportBillsCSV}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
              title="Export bills as CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={generateMonthlyBillsForCurrentMonth}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
              title="Sync current month bill instances"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync Month</span>
            </button>

            <button
              onClick={onOpenAddBill}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Bill
            </button>
          </div>
        </div>

        {/* Bills list */}
        {filteredBills.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Recurring Bills Found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              {bills.length === 0
                ? 'Keep track of your hostel/mess seat rent, Wi-Fi bill, or university semester fee deadlines without missing payments.'
                : 'No bills match the selected status filter.'}
            </p>
            <button
              onClick={onOpenAddBill}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              + Create Bill
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBills.map((bill) => {
              const daysLeft = getDaysUntilDue(bill.dueDate);
              const isPaid = bill.status === 'paid';
              const isOverdue = !isPaid && daysLeft < 0;
              const isDueToday = !isPaid && daysLeft === 0;
              const isDueSoon = !isPaid && daysLeft > 0 && daysLeft <= 7;

              return (
                <div
                  key={bill.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPaid
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80'
                      : isOverdue
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                      : isDueToday
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isOverdue
                          ? 'bg-rose-500 text-white'
                          : isDueToday || isDueSoon
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {getCategoryIcon(bill.category, 'w-5 h-5')}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {bill.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {bill.frequency}
                        </span>
                        {isPaid && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white animate-pulse">
                            Overdue ({Math.abs(daysLeft)}d)
                          </span>
                        )}
                        {isDueToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                            Due Today!
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {bill.category}
                        </span>
                        <span>•</span>
                        <span>Due: {formatDhakaDisplayDate(bill.dueDate)}</span>
                        {bill.note && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400">"{bill.note}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {formatBDT(bill.amount)}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isPaid ? (
                        <button
                          onClick={() => onPayBill(bill)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          {bill.paidAt ? `Paid ${formatDhakaDisplayDate(bill.paidAt)}` : 'Completed'}
                        </span>
                      )}

                      <button
                        onClick={() => onEditBill(bill)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit bill"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteId(bill.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete bill"
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
        title="Delete Recurring Bill"
        message="Are you sure you want to remove this recurring bill? Unpaid instances will be deleted."
        confirmText="Delete Bill"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
