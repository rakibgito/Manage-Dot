import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FinanceProvider } from './context/FinanceContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { IncomeView } from './components/views/IncomeView';
import { ExpensesView } from './components/views/ExpensesView';
import { BillsView } from './components/views/BillsView';
import { BudgetsView } from './components/views/BudgetsView';
import { GoalsView } from './components/views/GoalsView';
import { ReportsView } from './components/views/ReportsView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';

import { QuickAddModal } from './components/modals/QuickAddModal';
import { EditTransactionModal } from './components/modals/EditTransactionModal';
import { BillModal } from './components/modals/BillModal';
import { PayBillModal } from './components/modals/PayBillModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { GoalModal } from './components/modals/GoalModal';
import { GoalDepositWithdrawModal } from './components/modals/GoalDepositWithdrawModal';
import { Transaction, Bill, SavingsGoal } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modal states
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'income' | 'expense'>('expense');

  const [editTxModalOpen, setEditTxModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const [billModalOpen, setBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const [payBillModalOpen, setPayBillModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<Bill | null>(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState<string | undefined>();
  const [budgetLimit, setBudgetLimit] = useState<number | undefined>();

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const [goalDepWithModalOpen, setGoalDepWithModalOpen] = useState(false);
  const [goalDepWithMode, setGoalDepWithMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [goalForAction, setGoalForAction] = useState<SavingsGoal | null>(null);

  // Global hotkey: press "+" or "n" when not inside an input to trigger Quick Add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      if (!isInput && (e.key === '+' || e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setQuickAddType('expense');
        setQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenQuickAdd = (type: 'income' | 'expense' = 'expense') => {
    setQuickAddType(type);
    setQuickAddOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditTxModalOpen(true);
  };

  const handleOpenAddBill = () => {
    setSelectedBill(null);
    setBillModalOpen(true);
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setBillModalOpen(true);
  };

  const handlePayBill = (bill: Bill) => {
    setBillToPay(bill);
    setPayBillModalOpen(true);
  };

  const handleOpenBudgetModal = (category?: string, limit?: number) => {
    setBudgetCategory(category);
    setBudgetLimit(limit);
    setBudgetModalOpen(true);
  };

  const handleOpenAddGoal = () => {
    setSelectedGoal(null);
    setGoalModalOpen(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setGoalModalOpen(true);
  };

  const handleGoalDepositWithdraw = (goal: SavingsGoal, mode: 'deposit' | 'withdraw') => {
    setGoalForAction(goal);
    setGoalDepWithMode(mode);
    setGoalDepWithModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {/* Global Header */}
        <Header
          activeTab={activeTab}
          onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
              onNavigateTab={setActiveTab}
              onPayBill={handlePayBill}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenQuickAdd={handleOpenQuickAdd}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              onOpenQuickAdd={handleOpenQuickAdd}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              onOpenQuickAdd={handleOpenQuickAdd}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {activeTab === 'bills' && (
            <BillsView
              onOpenAddBill={handleOpenAddBill}
              onEditBill={handleEditBill}
              onPayBill={handlePayBill}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView onOpenBudgetModal={handleOpenBudgetModal} />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              onOpenAddGoal={handleOpenAddGoal}
              onEditGoal={handleEditGoal}
              onDepositWithdraw={handleGoalDepositWithdraw}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'calendar' && (
            <CalendarView
              onPayBill={handlePayBill}
              onOpenQuickAdd={handleOpenQuickAdd}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
      />

      {/* Floating Action Button (available on every page, desktop & mobile) */}
      <button
        onClick={() => handleOpenQuickAdd('expense')}
        aria-label="Quick Add (৳)"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer group"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
        <span className="sr-only">Quick Add (৳)</span>
        <div className="absolute right-16 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap hidden sm:block shadow-md">
          Quick Add (৳)
        </div>
      </button>

      {/* Modals */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultType={quickAddType}
      />

      <EditTransactionModal
        isOpen={editTxModalOpen}
        transaction={selectedTx}
        onClose={() => {
          setEditTxModalOpen(false);
          setSelectedTx(null);
        }}
      />

      <BillModal
        isOpen={billModalOpen}
        bill={selectedBill}
        onClose={() => {
          setBillModalOpen(false);
          setSelectedBill(null);
        }}
      />

      <PayBillModal
        isOpen={payBillModalOpen}
        bill={billToPay}
        onClose={() => {
          setPayBillModalOpen(false);
          setBillToPay(null);
        }}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        initialCategory={budgetCategory}
        initialLimit={budgetLimit}
        onClose={() => {
          setBudgetModalOpen(false);
          setBudgetCategory(undefined);
          setBudgetLimit(undefined);
        }}
      />

      <GoalModal
        isOpen={goalModalOpen}
        goal={selectedGoal}
        onClose={() => {
          setGoalModalOpen(false);
          setSelectedGoal(null);
        }}
      />

      <GoalDepositWithdrawModal
        isOpen={goalDepWithModalOpen}
        goal={goalForAction}
        mode={goalDepWithMode}
        onClose={() => {
          setGoalDepWithModalOpen(false);
          setGoalForAction(null);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
