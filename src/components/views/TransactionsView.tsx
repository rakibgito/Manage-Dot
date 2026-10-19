import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Receipt,
  Download,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { formatBDT, formatDhakaDisplayDate, formatDhakaDisplayDateTime } from '../../utils/formatters';
import { getCategoryIcon, getPaymentMethodBadge } from '../../utils/categoryIcons';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TransactionsViewProps {
  onOpenQuickAdd: (type?: 'income' | 'expense') => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenQuickAdd,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction, exportTransactionsCSV } = useFinance();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Deletion confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Available categories & payment methods in current transactions
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category))).sort();
  }, [transactions]);

  const uniquePaymentMethods = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.paymentMethod))).sort();
  }, [transactions]);

  // Filter & sort
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const inCategory = (t.category || '').toLowerCase().includes(query);
        const inNote = (t.note || '').toLowerCase().includes(query);
        const inMethod = (t.paymentMethod || '').toLowerCase().includes(query);
        const inAmount = t.amount.toString().includes(query);
        if (!inCategory && !inNote && !inMethod && !inAmount) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [transactions, typeFilter, categoryFilter, paymentFilter, search, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [filteredTransactions]);

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by category, note, payment method, amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action buttons: Export CSV + Quick Add */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportTransactionsCSV}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Export filtered transactions as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Filter Chips & Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Type Segment */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                typeFilter === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown */}
          {uniqueCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium outline-hidden"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Payment Method Dropdown */}
          {uniquePaymentMethods.length > 0 && (
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium outline-hidden"
            >
              <option value="all">All Payment Methods</option>
              {uniquePaymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium outline-hidden"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Count and Net Sum */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-500">
        <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
        <span>
          Net in view:{' '}
          <strong
            className={`font-extrabold ${
              totalFilteredAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatBDT(totalFilteredAmount)}
          </strong>
        </span>
      </div>

      {/* Transaction List Cards */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Transactions Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {transactions.length === 0
              ? 'Your transaction history is completely empty. Add your first expense or income now.'
              : 'No transactions match your current search or filter criteria. Try resetting filters.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {transactions.length > 0 && (
              <button
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setPaymentFilter('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              + Quick Add
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const badge = getPaymentMethodBadge(tx.paymentMethod);

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                >
                  {/* Left: Category Icon & Details */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {getCategoryIcon(tx.category, 'w-5 h-5')}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          {tx.category}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        {tx.billId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                            Bill Paid
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                        <span>{formatDhakaDisplayDateTime(tx.date)}</span>
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="italic truncate text-slate-600 dark:text-slate-300">
                              "{tx.note}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-base sm:text-lg font-extrabold tracking-tight ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatBDT(tx.amount)}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {formatDhakaDisplayDate(tx.date, true)}
                      </span>
                    </div>

                    {/* Action buttons (hover or tap) */}
                    <div className="flex items-center gap-1 sm:opacity-75 sm:group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Dialog before delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This will permanently update your balance."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
