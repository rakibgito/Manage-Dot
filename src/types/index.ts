export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Upay' | string;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // positive number, max 2 decimals
  category: string;
  paymentMethod: PaymentMethod;
  date: string; // ISO 8601 UTC string (e.g. 2026-10-19T12:00:00.000Z)
  note?: string;
  billId?: string; // If created from paying a recurring bill
  createdAt: string; // ISO 8601 UTC string
  updatedAt: string; // ISO 8601 UTC string
}

export type BillFrequency = 'monthly' | 'quarterly' | 'yearly' | 'one-time';
export type BillStatus = 'paid' | 'pending' | 'overdue';

export interface Bill {
  id: string;
  title: string;
  category: string;
  amount: number;
  dueDate: string; // ISO 8601 UTC string or YYYY-MM-DD
  frequency: BillFrequency;
  status: BillStatus;
  paidAt?: string; // ISO 8601 UTC string
  paymentMethod?: PaymentMethod;
  note?: string;
  recurringTemplateId?: string; // links generated instances
  monthKey: string; // e.g. '2026-10' to prevent duplicate generations
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number; // in BDT
  monthKey: string; // e.g. '2026-10'
  updatedAt: string;
}

export interface GoalTransaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  date: string; // ISO 8601 UTC
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  notes?: string;
  history: GoalTransaction[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  university: string;
  department: string;
  studentId?: string;
  email: string;
  monthlyAllowanceTarget?: number;
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  theme: 'light' | 'dark' | 'system';
  customExpenseCategories: string[];
  customIncomeSources: string[];
  customPaymentMethods: string[];
  enableBillReminders: boolean;
  warningThreshold: number; // default 80%
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  thisMonthRemaining: number;
  todaySpending: number;
  totalSavings: number;
  estimatedMonthEndSavings: number;
  billsDueWithin7DaysCount: number;
  overdueBillsCount: number;
}
