import { CurrencyCode, CurrencyConfig, ExpenseCategory, IncomeSource, PaymentMethod } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateAgainstINR: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstINR: 0.012 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstINR: 0.011 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstINR: 0.0094 },
};

export const EXPENSE_CATEGORIES: { name: ExpenseCategory; color: string; icon: string }[] = [
  { name: 'Food', color: '#f97316', icon: 'Utensils' },
  { name: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' },
  { name: 'Transportation', color: '#06b6d4', icon: 'Car' },
  { name: 'Rent', color: '#8b5cf6', icon: 'Home' },
  { name: 'Bills', color: '#eab308', icon: 'Receipt' },
  { name: 'Entertainment', color: '#a855f7', icon: 'Tv' },
  { name: 'Healthcare', color: '#ef4444', icon: 'HeartPulse' },
  { name: 'Education', color: '#3b82f6', icon: 'GraduationCap' },
  { name: 'Travel', color: '#14b8a6', icon: 'Plane' },
  { name: 'Groceries', color: '#10b981', icon: 'ShoppingCart' },
  { name: 'Investment', color: '#6366f1', icon: 'TrendingUp' },
  { name: 'Other', color: '#64748b', icon: 'MoreHorizontal' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Wallet',
];

export const INCOME_SOURCES: { name: IncomeSource; color: string; icon: string }[] = [
  { name: 'Salary', color: '#10b981', icon: 'Briefcase' },
  { name: 'Freelancing', color: '#06b6d4', icon: 'Laptop' },
  { name: 'Business', color: '#3b82f6', icon: 'Building2' },
  { name: 'Investment', color: '#8b5cf6', icon: 'TrendingUp' },
  { name: 'Bonus', color: '#f59e0b', icon: 'Award' },
  { name: 'Other', color: '#64748b', icon: 'Coins' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Shopping: '#ec4899',
  Transportation: '#06b6d4',
  Rent: '#8b5cf6',
  Bills: '#eab308',
  Entertainment: '#a855f7',
  Healthcare: '#ef4444',
  Education: '#3b82f6',
  Travel: '#14b8a6',
  Groceries: '#10b981',
  Other: '#64748b',
  Salary: '#10b981',
  Freelancing: '#06b6d4',
  Business: '#3b82f6',
  Investment: '#6366f1',
  Bonus: '#f59e0b',
};
