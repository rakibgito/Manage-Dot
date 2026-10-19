import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  CalendarCheck2,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Target,
  BarChart3,
  Calendar,
  Settings,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useFinance } from '../../context/FinanceContext';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
}) => {
  const { metrics } = useFinance();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreItems = [
    { id: 'income', label: 'Income Sources', icon: ArrowUpRight },
    { id: 'expenses', label: 'Expense Categories', icon: ArrowDownRight },
    { id: 'budgets', label: 'Monthly Budgets', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'calendar', label: 'Academic & Bill Calendar', icon: Calendar },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ] as const;

  const handleSelectMoreItem = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Dashboard */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[11px] mt-1">Home</span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => onSelectTab('transactions')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'transactions'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[11px] mt-1">History</span>
          </button>

          {/* Center Quick Add Button */}
          <div className="flex-1 flex justify-center -mt-5">
            <button
              onClick={onOpenQuickAdd}
              aria-label="Add transaction"
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center transition hover:scale-105 active:scale-95"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Recurring Bills */}
          <button
            onClick={() => onSelectTab('bills')}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'bills'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CalendarCheck2 className="w-5 h-5" />
            <span className="text-[11px] mt-1">Bills</span>
            {metrics.overdueBillsCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* More Menu */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              isMoreOpen || ['income', 'expenses', 'budgets', 'goals', 'reports', 'calendar', 'settings'].includes(activeTab)
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[11px] mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Drawer Modal */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 p-5 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                All Features
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMoreItem(item.id as NavTab)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
