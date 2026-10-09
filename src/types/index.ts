export type Role = 'USER' | 'ADMIN';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstINR: number; // For live currency conversions
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: Role;
  currency: CurrencyCode;
  timezone: string;
  profilePhoto?: string;
  createdAt: string;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
}

export type ExpenseCategory =
  | 'Food'
  | 'Shopping'
  | 'Transportation'
  | 'Rent'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Travel'
  | 'Groceries'
  | 'Investment'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI'
  | 'Net Banking'
  | 'Wallet';

export type IncomeSource =
  | 'Salary'
  | 'Freelancing'
  | 'Business'
  | 'Investment'
  | 'Bonus'
  | 'Other';

export type RecurringFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  subCategory?: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  description: string;
  notes?: string;
  userId: string;
  createdAt: string;
  receiptUrl?: string;
}

export interface Income {
  id: string;
  amount: number;
  source: IncomeSource;
  date: string; // YYYY-MM-DD
  description: string;
  notes?: string;
  userId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  category: string; // ExpenseCategory or IncomeSource
  subCategory?: string;
  date: string;
  paymentMethod: string;
  description: string;
  notes?: string;
  rawId: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  month: string; // '2026-10'
  userId: string;
  createdAt?: string;
}

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  frequency: RecurringFrequency;
  nextPaymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  active: boolean;
  userId: string;
}

export type NotificationType =
  | 'BUDGET_EXCEEDED'
  | 'BUDGET_WARNING'
  | 'RECURRING_DUE'
  | 'MONTHLY_SUMMARY'
  | 'UNUSUAL_SPENDING'
  | 'INFO';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  averageDailyExpense: number;
  highestSpendingCategory: {
    category: ExpenseCategory | string;
    amount: number;
  };
  highestExpense: {
    description: string;
    amount: number;
    date: string;
  };
  currentMonthExpense: number;
  previousMonthExpense: number;
  expenseGrowthRate: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyTrendItem {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface WeeklyTrendItem {
  day: string;
  amount: number;
}

export interface DateFilterRange {
  startDate?: string;
  endDate?: string;
  preset: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_3_MONTHS' | 'THIS_YEAR' | 'CUSTOM';
}
