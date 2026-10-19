import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Bill,
  Budget,
  SavingsGoal,
  UserProfile,
  UserSettings,
  FinancialMetrics,
  PaymentMethod,
  BillStatus,
} from '../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_SOURCES,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_CATEGORY_BUDGETS,
} from '../utils/constants';
import {
  getDhakaTodayDateString,
  getDhakaCurrentMonthKey,
  utcIsoToDhakaDateInput,
  getDaysUntilDue,
  dhakaDateTimeToUtcIso,
} from '../utils/formatters';

interface FinanceContextType {
  // Data
  transactions: Transaction[];
  bills: Bill[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
  settings: UserSettings;
  metrics: FinancialMetrics;

  // Transaction Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTransaction: (id: string) => void;

  // Bill Actions
  addBill: (data: Omit<Bill, 'id' | 'createdAt' | 'status'> & { status?: BillStatus }) => Bill;
  updateBill: (id: string, data: Partial<Omit<Bill, 'id' | 'createdAt'>>) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (id: string, paymentMethod: PaymentMethod, note?: string) => void;
  generateMonthlyBillsForCurrentMonth: () => void;

  // Budget Actions
  setCategoryBudget: (category: string, monthlyLimit: number) => void;
  deleteBudget: (id: string) => void;
  getBudgetForCategory: (category: string) => Budget | undefined;
  getSpentForCategoryThisMonth: (category: string) => number;

  // Goal Actions
  addGoal: (data: Omit<SavingsGoal, 'id' | 'currentAmount' | 'history' | 'createdAt'>, initialAmount?: number) => SavingsGoal;
  updateGoal: (id: string, data: Partial<Omit<SavingsGoal, 'id' | 'history' | 'createdAt'>>) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (id: string, amount: number, note?: string) => void;
  withdrawFromGoal: (id: string, amount: number, note?: string) => void;

  // Profile & Settings Actions
  updateProfile: (data: Partial<UserProfile>) => void;
  updateSettings: (data: Partial<UserSettings>) => void;
  toggleTheme: () => void;

  // Import / Export / Maintenance
  exportTransactionsCSV: () => void;
  exportBillsCSV: () => void;
  exportGoalsCSV: () => void;
  backupDatabaseJSON: () => void;
  restoreDatabaseJSON: (jsonString: string) => { success: boolean; error?: string };
  resetAllData: () => void;
  loadSampleStudentData: () => void;
}

const STORAGE_KEY_PREFIX = 'taka_tracker_';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading profile', e);
    }
    return {
      name: 'Rahim Chowdhury',
      university: 'University of Dhaka',
      department: 'Computer Science & Engineering',
      studentId: 'DU-CS-2023',
      email: 'rahim.du@edu.bd',
      monthlyAllowanceTarget: 18000,
    };
  });

  // 2. Settings State
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return {
      currency: 'BDT',
      currencySymbol: '৳',
      theme: 'light',
      customExpenseCategories: [],
      customIncomeSources: [],
      customPaymentMethods: [],
      enableBillReminders: true,
      warningThreshold: 80,
    };
  });

  // 3. Transactions State (default empty array per requirements: NO fake or demo transactions in real account)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading transactions', e);
    }
    return [];
  });

  // 4. Bills State
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}bills`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading bills', e);
    }
    return [];
  });

  // 5. Budgets State
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}budgets`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading budgets', e);
    }
    const currentMonth = getDhakaCurrentMonthKey();
    return DEFAULT_CATEGORY_BUDGETS.map((b) => ({
      id: `budget-${b.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      monthKey: currentMonth,
      updatedAt: new Date().toISOString(),
    }));
  });

  // 6. Savings Goals State
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}goals`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading goals', e);
    }
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
    // Apply theme class to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}bills`, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}budgets`, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}goals`, JSON.stringify(goals));
  }, [goals]);

  // Update bill statuses automatically (e.g. detect overdue bills in Dhaka time)
  useEffect(() => {
    setBills((prevBills) => {
      let changed = false;
      const updated = prevBills.map((bill) => {
        if (bill.status === 'paid') return bill;
        const days = getDaysUntilDue(bill.dueDate);
        const resolvedStatus: BillStatus = days < 0 ? 'overdue' : 'pending';
        if (bill.status !== resolvedStatus) {
          changed = true;
          return { ...bill, status: resolvedStatus };
        }
        return bill;
      });
      return changed ? updated : prevBills;
    });
  }, []);

  // Generate monthly bill instances automatically without duplicates
  const generateMonthlyBillsForCurrentMonth = useCallback(() => {
    const currentMonth = getDhakaCurrentMonthKey();
    setBills((prevBills) => {
      const templates = prevBills.filter((b) => b.frequency === 'monthly');
      const newBills: Bill[] = [];

      templates.forEach((template) => {
        const rootId = template.recurringTemplateId || template.id;
        const existsForMonth = prevBills.some(
          (b) => (b.recurringTemplateId === rootId || b.id === rootId) && b.monthKey === currentMonth
        );

        if (!existsForMonth) {
          // Extract day of month from original dueDate
          const originalDay = template.dueDate.includes('T')
            ? utcIsoToDhakaDateInput(template.dueDate).split('-')[2]
            : (template.dueDate.split('-')[2] || '05');

          const newDueDateStr = `${currentMonth}-${originalDay}`;
          const newDueDateIso = dhakaDateTimeToUtcIso(newDueDateStr, '23:59');

          const days = getDaysUntilDue(newDueDateIso);
          const status: BillStatus = days < 0 ? 'overdue' : 'pending';

          newBills.push({
            id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            title: template.title,
            category: template.category,
            amount: template.amount,
            dueDate: newDueDateIso,
            frequency: 'monthly',
            status,
            recurringTemplateId: rootId,
            monthKey: currentMonth,
            note: template.note,
            createdAt: new Date().toISOString(),
          });
        }
      });

      if (newBills.length > 0) {
        return [...prevBills, ...newBills];
      }
      return prevBills;
    });
  }, []);

  // Run bill recurrence check once on boot
  useEffect(() => {
    generateMonthlyBillsForCurrentMonth();
  }, [generateMonthlyBillsForCurrentMonth]);

  // Transaction Operations
  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      amount: Math.round(Number(data.amount) * 100) / 100,
      createdAt: now,
      updatedAt: now,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const now = new Date().toISOString();
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id) return tx;
        return {
          ...tx,
          ...data,
          amount: data.amount !== undefined ? Math.round(Number(data.amount) * 100) / 100 : tx.amount,
          updatedAt: now,
        };
      })
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  // Bill Operations
  const addBill = useCallback((data: Omit<Bill, 'id' | 'createdAt' | 'status'> & { status?: BillStatus }): Bill => {
    const now = new Date().toISOString();
    const currentMonth = getDhakaCurrentMonthKey();
    const days = getDaysUntilDue(data.dueDate);
    const initialStatus: BillStatus = data.status || (days < 0 ? 'overdue' : 'pending');

    const newBill: Bill = {
      ...data,
      id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      amount: Math.round(Number(data.amount) * 100) / 100,
      status: initialStatus,
      monthKey: data.monthKey || currentMonth,
      createdAt: now,
    };
    setBills((prev) => [newBill, ...prev]);
    return newBill;
  }, []);

  const updateBill = useCallback((id: string, data: Partial<Omit<Bill, 'id' | 'createdAt'>>) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== id) return bill;
        const updated = {
          ...bill,
          ...data,
          amount: data.amount !== undefined ? Math.round(Number(data.amount) * 100) / 100 : bill.amount,
        };
        if (updated.status !== 'paid') {
          const days = getDaysUntilDue(updated.dueDate);
          updated.status = days < 0 ? 'overdue' : 'pending';
        }
        return updated;
      })
    );
  }, []);

  const deleteBill = useCallback((id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const markBillAsPaid = useCallback((id: string, paymentMethod: PaymentMethod, note?: string) => {
    const now = new Date().toISOString();
    let paidBill: Bill | null = null;

    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== id) return bill;
        paidBill = {
          ...bill,
          status: 'paid',
          paidAt: now,
          paymentMethod,
          note: note ? (bill.note ? `${bill.note} | ${note}` : note) : bill.note,
        };
        return paidBill;
      })
    );

    // Requirement: Marking a bill paid creates a matching expense transaction!
    if (paidBill) {
      const b: Bill = paidBill;
      addTransaction({
        type: 'expense',
        amount: b.amount,
        category: b.category,
        paymentMethod,
        date: now,
        note: `Paid recurring bill: ${b.title}${note ? ` (${note})` : ''}`,
        billId: b.id,
      });
    }
  }, [addTransaction]);

  // Budget Operations
  const setCategoryBudget = useCallback((category: string, monthlyLimit: number) => {
    const currentMonth = getDhakaCurrentMonthKey();
    const now = new Date().toISOString();
    setBudgets((prev) => {
      const existingIndex = prev.findIndex((b) => b.category === category);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          monthlyLimit: Math.round(Number(monthlyLimit) * 100) / 100,
          updatedAt: now,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          category,
          monthlyLimit: Math.round(Number(monthlyLimit) * 100) / 100,
          monthKey: currentMonth,
          updatedAt: now,
        },
      ];
    });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const getBudgetForCategory = useCallback((category: string): Budget | undefined => {
    return budgets.find((b) => b.category.toLowerCase() === category.toLowerCase());
  }, [budgets]);

  const getSpentForCategoryThisMonth = useCallback((category: string): number => {
    const currentMonth = getDhakaCurrentMonthKey();
    return transactions
      .filter((tx) => {
        if (tx.type !== 'expense') return false;
        if (tx.category.toLowerCase() !== category.toLowerCase()) return false;
        const txMonth = utcIsoToDhakaDateInput(tx.date).slice(0, 7);
        return txMonth === currentMonth;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  // Goal Operations
  const addGoal = useCallback((data: Omit<SavingsGoal, 'id' | 'currentAmount' | 'history' | 'createdAt'>, initialAmount = 0): SavingsGoal => {
    const now = new Date().toISOString();
    const validatedInitial = Math.max(0, Math.round(Number(initialAmount) * 100) / 100);
    const initialHistory = validatedInitial > 0
      ? [{
          id: `gh-${Date.now()}`,
          amount: validatedInitial,
          type: 'deposit' as const,
          date: now,
          note: 'Initial deposit',
        }]
      : [];

    const newGoal: SavingsGoal = {
      ...data,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      targetAmount: Math.round(Number(data.targetAmount) * 100) / 100,
      currentAmount: validatedInitial,
      history: initialHistory,
      createdAt: now,
    };

    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, data: Partial<Omit<SavingsGoal, 'id' | 'history' | 'createdAt'>>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          ...data,
          targetAmount: data.targetAmount !== undefined ? Math.round(Number(data.targetAmount) * 100) / 100 : g.targetAmount,
        };
      })
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const depositToGoal = useCallback((id: string, amount: number, note?: string) => {
    const validAmount = Math.round(Number(amount) * 100) / 100;
    if (validAmount <= 0) return;
    const now = new Date().toISOString();

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newTotal = g.currentAmount + validAmount;
        const historyItem = {
          id: `gh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          amount: validAmount,
          type: 'deposit' as const,
          date: now,
          note: note || 'Savings deposit',
        };
        return {
          ...g,
          currentAmount: newTotal,
          history: [historyItem, ...g.history],
        };
      })
    );
  }, []);

  const withdrawFromGoal = useCallback((id: string, amount: number, note?: string) => {
    const validAmount = Math.round(Number(amount) * 100) / 100;
    if (validAmount <= 0) return;
    const now = new Date().toISOString();

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newTotal = Math.max(0, g.currentAmount - validAmount);
        const historyItem = {
          id: `gh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          amount: validAmount,
          type: 'withdraw' as const,
          date: now,
          note: note || 'Savings withdrawal',
        };
        return {
          ...g,
          currentAmount: newTotal,
          history: [historyItem, ...g.history],
        };
      })
    );
  }, []);

  // Profile & Settings
  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  }, []);

  const updateSettings = useCallback((data: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  // Metrics computation
  const metrics = useMemo<FinancialMetrics>(() => {
    const todayDhaka = getDhakaTodayDateString();
    const currentMonthDhaka = getDhakaCurrentMonthKey();

    let totalIncome = 0;
    let totalExpenses = 0;
    let thisMonthIncome = 0;
    let thisMonthExpenses = 0;
    let todaySpending = 0;

    transactions.forEach((tx) => {
      const txDhakaDate = utcIsoToDhakaDateInput(tx.date);
      const txDhakaMonth = txDhakaDate.slice(0, 7);

      if (tx.type === 'income') {
        totalIncome += tx.amount;
        if (txDhakaMonth === currentMonthDhaka) {
          thisMonthIncome += tx.amount;
        }
      } else {
        totalExpenses += tx.amount;
        if (txDhakaMonth === currentMonthDhaka) {
          thisMonthExpenses += tx.amount;
        }
        if (txDhakaDate === todayDhaka) {
          todaySpending += tx.amount;
        }
      }
    });

    const currentBalance = totalIncome - totalExpenses;
    const thisMonthRemaining = thisMonthIncome - thisMonthExpenses;

    // Total savings in goals
    const totalSavings = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);

    // Bills due metrics
    let overdueBillsCount = 0;
    let billsDueWithin7DaysCount = 0;

    bills.forEach((bill) => {
      if (bill.status === 'paid') return;
      const days = getDaysUntilDue(bill.dueDate);
      if (days < 0) {
        overdueBillsCount++;
      } else if (days <= 7) {
        billsDueWithin7DaysCount++;
      }
    });

    // Estimated month end savings
    const estimatedMonthEndSavings = Math.max(0, thisMonthRemaining);

    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      thisMonthIncome,
      thisMonthExpenses,
      thisMonthRemaining,
      todaySpending,
      totalSavings,
      estimatedMonthEndSavings,
      billsDueWithin7DaysCount,
      overdueBillsCount,
    };
  }, [transactions, goals, bills]);

  // Export CSV functions
  const exportTransactionsCSV = useCallback(() => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
    const headers = ['ID', 'Type', 'Amount (BDT)', 'Category', 'Payment Method', 'Date (Dhaka)', 'Note', 'Bill ID'];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.amount,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      utcIsoToDhakaDateInput(t.date),
      `"${(t.note || '').replace(/"/g, '""')}"`,
      t.billId || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `managedot_transactions_${getDhakaTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [transactions]);

  const exportBillsCSV = useCallback(() => {
    if (bills.length === 0) {
      alert('No recurring bills to export.');
      return;
    }
    const headers = ['ID', 'Title', 'Category', 'Amount (BDT)', 'Due Date (Dhaka)', 'Frequency', 'Status', 'Paid At', 'Payment Method', 'Note'];
    const rows = bills.map((b) => [
      b.id,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.category || '').replace(/"/g, '""')}"`,
      b.amount,
      utcIsoToDhakaDateInput(b.dueDate),
      b.frequency,
      b.status,
      b.paidAt ? utcIsoToDhakaDateInput(b.paidAt) : '',
      `"${(b.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(b.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `managedot_bills_${getDhakaTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [bills]);

  const exportGoalsCSV = useCallback(() => {
    if (goals.length === 0) {
      alert('No savings goals to export.');
      return;
    }
    const headers = ['ID', 'Title', 'Category', 'Target Amount (BDT)', 'Current Saved (BDT)', 'Progress (%)', 'Deadline'];
    const rows = goals.map((g) => [
      g.id,
      `"${(g.title || '').replace(/"/g, '""')}"`,
      `"${(g.category || '').replace(/"/g, '""')}"`,
      g.targetAmount,
      g.currentAmount,
      Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100)),
      g.deadline ? utcIsoToDhakaDateInput(g.deadline) : '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `managedot_goals_${getDhakaTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [goals]);

  // Full Database Backup JSON
  const backupDatabaseJSON = useCallback(() => {
    const backupData = {
      version: 1,
      appName: 'Manage Dot',
      exportDateUtc: new Date().toISOString(),
      exportDateDhaka: getDhakaTodayDateString(),
      profile,
      settings,
      transactions,
      bills,
      budgets,
      goals,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `managedot_backup_${getDhakaTodayDateString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [profile, settings, transactions, bills, budgets, goals]);

  // Restore Database JSON
  const restoreDatabaseJSON = useCallback((jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid JSON format' };
      }
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.bills)) setBills(data.bills);
      if (Array.isArray(data.budgets)) setBudgets(data.budgets);
      if (Array.isArray(data.goals)) setGoals(data.goals);
      if (data.profile && typeof data.profile === 'object') setProfile(data.profile);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to parse JSON file' };
    }
  }, []);

  // Reset all data
  const resetAllData = useCallback(() => {
    setTransactions([]);
    setBills([]);
    setGoals([]);
    setBudgets(
      DEFAULT_CATEGORY_BUDGETS.map((b) => ({
        id: `budget-${b.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        monthKey: getDhakaCurrentMonthKey(),
        updatedAt: new Date().toISOString(),
      }))
    );
  }, []);

  // Load sample student demo data (optional helper inside Settings if user wants to test)
  const loadSampleStudentData = useCallback(() => {
    const todayStr = getDhakaTodayDateString();
    const currentMonth = getDhakaCurrentMonthKey();

    const sampleTransactions: Transaction[] = [
      {
        id: 'tx-sample-1',
        type: 'income',
        amount: 15000,
        category: 'Family allowance',
        paymentMethod: 'bKash',
        date: dhakaDateTimeToUtcIso(`${currentMonth}-01`, '10:00'),
        note: 'Monthly mess allowance from Abbu',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx-sample-2',
        type: 'income',
        amount: 8000,
        category: 'Tuition (Private Teaching)',
        paymentMethod: 'Cash',
        date: dhakaDateTimeToUtcIso(`${currentMonth}-05`, '17:30'),
        note: 'Class 10 Physics student tuition payment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx-sample-3',
        type: 'expense',
        amount: 8000,
        category: 'Rent (Mess/Hall)',
        paymentMethod: 'Bank',
        date: dhakaDateTimeToUtcIso(`${currentMonth}-03`, '11:00'),
        note: 'Mess seat rent + maid bill for October',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx-sample-4',
        type: 'expense',
        amount: 80,
        category: 'Tea/Coffee/Snacks',
        paymentMethod: 'Cash',
        date: dhakaDateTimeToUtcIso(todayStr, '16:15'),
        note: 'Tong er cha and 2 shingara with batchmates',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx-sample-5',
        type: 'expense',
        amount: 45,
        category: 'Transportation',
        paymentMethod: 'Cash',
        date: dhakaDateTimeToUtcIso(todayStr, '09:00'),
        note: 'Rickshaw from Nilkhet to Curzon Hall',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx-sample-6',
        type: 'expense',
        amount: 250,
        category: 'Food & Groceries',
        paymentMethod: 'Cash',
        date: dhakaDateTimeToUtcIso(todayStr, '13:30'),
        note: 'Hall canteen lunch & yogurt',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx-sample-7',
        type: 'expense',
        amount: 399,
        category: 'Mobile Recharge & Internet',
        paymentMethod: 'bKash',
        date: dhakaDateTimeToUtcIso(`${currentMonth}-07`, '14:20'),
        note: 'Grameenphone 30GB monthly student data pack',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const sampleBills: Bill[] = [
      {
        id: 'bill-sample-1',
        title: 'Mess Seat Rent & Utilities',
        category: 'Rent (Mess/Hall)',
        amount: 8000,
        dueDate: dhakaDateTimeToUtcIso(`${currentMonth}-05`, '23:59'),
        frequency: 'monthly',
        status: 'paid',
        paidAt: dhakaDateTimeToUtcIso(`${currentMonth}-03`, '11:00'),
        paymentMethod: 'Bank',
        note: 'Nilkhet mess rent',
        monthKey: currentMonth,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bill-sample-2',
        title: 'Mess Wi-Fi Shared Bill',
        category: 'Wi-Fi / Internet',
        amount: 250,
        dueDate: dhakaDateTimeToUtcIso(`${currentMonth}-25`, '23:59'),
        frequency: 'monthly',
        status: 'pending',
        note: 'Broadband connection for mess 4th floor',
        monthKey: currentMonth,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bill-sample-3',
        title: 'Mid-term Semester Exam Fee',
        category: 'Semester/Exam Fee',
        amount: 3500,
        dueDate: dhakaDateTimeToUtcIso(`${currentMonth}-28`, '16:00'),
        frequency: 'quarterly',
        status: 'pending',
        note: 'Submit bank challan to registrar office',
        monthKey: currentMonth,
        createdAt: new Date().toISOString(),
      },
    ];

    const sampleGoals: SavingsGoal[] = [
      {
        id: 'goal-sample-1',
        title: 'Emergency Medical & Travel Fund',
        category: 'Emergency fund',
        targetAmount: 15000,
        currentAmount: 6500,
        notes: 'Backup cash in bKash for urgent hospital or home trip',
        history: [
          {
            id: 'gh-s1',
            amount: 6500,
            type: 'deposit',
            date: dhakaDateTimeToUtcIso(`${currentMonth}-02`, '12:00'),
            note: 'Saved from freelancing gig',
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'goal-sample-2',
        title: 'New Coding Laptop (M-Series / ThinkPad)',
        category: 'Laptop/Phone',
        targetAmount: 65000,
        currentAmount: 22000,
        deadline: dhakaDateTimeToUtcIso('2027-02-01', '12:00'),
        notes: 'Targeting next semester project work',
        history: [
          {
            id: 'gh-s2',
            amount: 22000,
            type: 'deposit',
            date: dhakaDateTimeToUtcIso(`${currentMonth}-05`, '12:00'),
            note: 'Accumulated savings',
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    setTransactions(sampleTransactions);
    setBills(sampleBills);
    setGoals(sampleGoals);
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        bills,
        budgets,
        goals,
        profile,
        settings,
        metrics,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBill,
        updateBill,
        deleteBill,
        markBillAsPaid,
        generateMonthlyBillsForCurrentMonth,
        setCategoryBudget,
        deleteBudget,
        getBudgetForCategory,
        getSpentForCategoryThisMonth,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        withdrawFromGoal,
        updateProfile,
        updateSettings,
        toggleTheme,
        exportTransactionsCSV,
        exportBillsCSV,
        exportGoalsCSV,
        backupDatabaseJSON,
        restoreDatabaseJSON,
        resetAllData,
        loadSampleStudentData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
