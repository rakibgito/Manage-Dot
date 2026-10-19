import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  CalendarCheck2,
  PieChart,
  Target,
  BarChart3,
  Calendar,
  Settings,
  Plus,
  Moon,
  Sun,
  GraduationCap,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatBDT } from '../../utils/formatters';

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'income'
  | 'expenses'
  | 'bills'
  | 'budgets'
  | 'goals'
  | 'reports'
  | 'calendar'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

interface SidebarNavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAdd,
}) => {
  const { profile, settings, toggleTheme, metrics } = useFinance();

  const navItems: SidebarNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'income', label: 'Income', icon: ArrowUpRight },
    { id: 'expenses', label: 'Expenses', icon: ArrowDownRight },
    {
      id: 'bills',
      label: 'Recurring Bills',
      icon: CalendarCheck2,
      badge: metrics.overdueBillsCount > 0 ? metrics.overdueBillsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 p-5 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-1 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/20">
          ৳
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            Manage Dot
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              BD
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Student Finance Hub
          </p>
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={onOpenQuickAdd}
        className="w-full mb-6 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Quick Add (৳)
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Student Profile Card & Theme Toggle in Sidebar Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-3">
        {/* Balance Mini View */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Balance</span>
          <span
            className={`text-sm font-bold ${
              metrics.currentBalance >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatBDT(metrics.currentBalance)}
          </span>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {profile.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {profile.university || 'University Student'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
