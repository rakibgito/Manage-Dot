import React from 'react';
import { Plus, Moon, Sun, Clock, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavTab } from './Sidebar';
import { formatBDT, formatDhakaDisplayDate } from '../../utils/formatters';

interface HeaderProps {
  activeTab: NavTab;
  onOpenQuickAdd: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Financial Overview',
    subtitle: 'Daily spending & university budget tracker',
  },
  transactions: {
    title: 'Transaction History',
    subtitle: 'All your income and expenses in one place',
  },
  income: {
    title: 'Income Streams',
    subtitle: 'Family allowance, tuitions, freelance & jobs',
  },
  expenses: {
    title: 'Expenses Breakdown',
    subtitle: 'Food, transport, tong er cha, rent & personal care',
  },
  bills: {
    title: 'Recurring Bills',
    subtitle: 'Mess rent, tuition deadlines, Wi-Fi & utility bills',
  },
  budgets: {
    title: 'Monthly Budgets',
    subtitle: 'Track spending against student limits',
  },
  goals: {
    title: 'Savings Goals',
    subtitle: 'Tuition reserve, emergency cash & gadget savings',
  },
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Visual spending patterns and monthly trends',
  },
  calendar: {
    title: 'Academic & Bill Calendar',
    subtitle: 'Monthly deadlines and due dates in Asia/Dhaka',
  },
  settings: {
    title: 'Profile & Settings',
    subtitle: 'Data backup, custom categories & student preferences',
  },
};

export const Header: React.FC<HeaderProps> = ({ activeTab, onOpenQuickAdd }) => {
  const { metrics, settings, toggleTheme } = useFinance();
  const currentTabMeta = TAB_TITLES[activeTab] || {
    title: 'Manage Dot',
    subtitle: 'Student Finance Hub',
  };

  const todayDhakaStr = formatDhakaDisplayDate(new Date().toISOString());

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 sm:py-4 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Tab Title & Date */}
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentTabMeta.title}
          </h2>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">{currentTabMeta.subtitle}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
              <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {todayDhakaStr} (UTC+6)
            </span>
          </div>
        </div>

        {/* Right: Balance Pill & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Current Balance Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                Current Balance
              </span>
              <span
                className={`text-xs font-extrabold ${
                  metrics.currentBalance >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatBDT(metrics.currentBalance)}
              </span>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Quick Add</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
