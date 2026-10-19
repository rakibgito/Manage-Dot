import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Receipt,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Bill, Transaction } from '../../types';
import {
  formatBDT,
  formatDhakaDisplayDate,
  formatDhakaDisplayDateTime,
  getDhakaTodayDateString,
  getDaysUntilDue,
  utcIsoToDhakaDateInput,
} from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface CalendarViewProps {
  onPayBill: (bill: Bill) => void;
  onOpenQuickAdd: (type?: 'expense' | 'income') => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onPayBill,
  onOpenQuickAdd,
}) => {
  const { bills, transactions } = useFinance();

  // Current calendar view year & month (1-indexed month)
  const todayDhakaStr = getDhakaTodayDateString();
  const [currentYear, setCurrentYear] = useState(() => parseInt(todayDhakaStr.split('-')[0], 10));
  const [currentMonth, setCurrentMonth] = useState(() => parseInt(todayDhakaStr.split('-')[1], 10)); // 1 to 12

  // Selected date modal / drawer
  const [selectedDate, setSelectedDate] = useState<string | null>(todayDhakaStr);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayMonth = () => {
    const parts = todayDhakaStr.split('-');
    setCurrentYear(parseInt(parts[0], 10));
    setCurrentMonth(parseInt(parts[1], 10));
    setSelectedDate(todayDhakaStr);
  };

  // Build days grid for the month
  const calendarDays = useMemo(() => {
    // first day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayDate = new Date(currentYear, currentMonth - 1, 1);
    const startingDayOfWeek = firstDayDate.getDay();
    // number of days in current month
    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Map bills to date string 'YYYY-MM-DD'
    const billMap = new Map<string, Bill[]>();
    bills.forEach((b) => {
      const dateKey = utcIsoToDhakaDateInput(b.dueDate);
      const existing = billMap.get(dateKey) || [];
      billMap.set(dateKey, [...existing, b]);
    });

    // Map transactions to date string
    const txMap = new Map<string, Transaction[]>();
    transactions.forEach((tx) => {
      const dateKey = utcIsoToDhakaDateInput(tx.date);
      const existing = txMap.get(dateKey) || [];
      txMap.set(dateKey, [...existing, tx]);
    });

    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dayNumber: null, dateStr: null, bills: [], transactions: [] });
    }

    // Days of current month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayFormatted = String(day).padStart(2, '0');
      const monthFormatted = String(currentMonth).padStart(2, '0');
      const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;

      days.push({
        dayNumber: day,
        dateStr,
        bills: billMap.get(dateStr) || [],
        transactions: txMap.get(dateStr) || [],
      });
    }

    return days;
  }, [currentYear, currentMonth, bills, transactions]);

  // Selected date details
  const selectedDateDetails = useMemo(() => {
    if (!selectedDate) return null;
    const dateBills = bills.filter((b) => utcIsoToDhakaDateInput(b.dueDate) === selectedDate);
    const dateTxs = transactions.filter((t) => utcIsoToDhakaDateInput(t.date) === selectedDate);
    return { bills: dateBills, transactions: dateTxs };
  }, [selectedDate, bills, transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Month Navigator Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {monthNames[currentMonth - 1]} {currentYear}
            </h3>
            <p className="text-xs text-slate-400">Asia/Dhaka Calendar</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleTodayMonth}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Calendar Grid & Day Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on large) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.dayNumber) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[64px] sm:min-h-[82px] rounded-2xl bg-slate-50/40 dark:bg-slate-800/20"
                  />
                );
              }

              const isToday = cell.dateStr === todayDhakaStr;
              const isSelected = cell.dateStr === selectedDate;
              const hasUnpaidBills = cell.bills.some((b) => b.status !== 'paid');
              const hasOverdue = cell.bills.some((b) => {
                if (b.status === 'paid') return false;
                return getDaysUntilDue(b.dueDate) < 0;
              });

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[64px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500'
                      : isToday
                      ? 'border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 font-bold'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800/30 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Small badges */}
                    {hasOverdue ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    ) : hasUnpaidBills ? (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    ) : null}
                  </div>

                  {/* Day Content Badges */}
                  <div className="space-y-1 mt-1">
                    {cell.bills.length > 0 && (
                      <div
                        className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded-md font-semibold truncate ${
                          hasOverdue
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : hasUnpaidBills
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cell.bills[0].title}
                      </div>
                    )}

                    {cell.transactions.length > 0 && (
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {cell.transactions.length} record{cell.transactions.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Day Inspector
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedDate ? formatDhakaDisplayDate(selectedDate) : 'Select a date'}
                </h4>
              </div>
              <button
                onClick={() => onOpenQuickAdd('expense')}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {/* Bills due on this day */}
            <div className="space-y-3 mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Bills Due ({selectedDateDetails?.bills.length || 0})
              </span>

              {(!selectedDateDetails || selectedDateDetails.bills.length === 0) ? (
                <p className="text-xs text-slate-400 italic">
                  No recurring bills scheduled for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDateDetails.bills.map((bill) => {
                    const isPaid = bill.status === 'paid';
                    return (
                      <div
                        key={bill.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                      >
                        <div className="min-w-0 truncate">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {bill.title}
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            {formatBDT(bill.amount)}
                          </span>
                        </div>

                        {!isPaid ? (
                          <button
                            onClick={() => onPayBill(bill)}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                          >
                            Pay
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Transactions on this day */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Transactions on this day ({selectedDateDetails?.transactions.length || 0})
              </span>

              {(!selectedDateDetails || selectedDateDetails.transactions.length === 0) ? (
                <p className="text-xs text-slate-400 italic">
                  No expenses or income logged on this date.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedDateDetails.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 truncate">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {tx.paymentMethod} {tx.note ? `• ${tx.note}` : ''}
                        </span>
                      </div>
                      <span
                        className={`font-black ml-2 ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatBDT(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
