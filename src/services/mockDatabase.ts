import { AppNotification, Budget, Expense, Income, RecurringExpense, User } from '../types';

const STORAGE_KEY = 'moneymate_db_v5';

export interface DatabaseState {
  users: (User & { passwordHash: string })[];
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  recurring: RecurringExpense[];
  notifications: AppNotification[];
}

// Default pristine state for first-time app launch: Everything starts at ZERO
const DEFAULT_INCOMES: Income[] = [];
const DEFAULT_EXPENSES: Expense[] = [];
const DEFAULT_BUDGETS: Budget[] = [];
const DEFAULT_RECURRING: RecurringExpense[] = [];
const DEFAULT_NOTIFICATIONS: AppNotification[] = [];

const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-001',
    fullName: 'Akshay Bawane',
    email: 'akshay@fintech.io',
    mobileNumber: '+91 98765 43210',
    role: 'USER',
    currency: 'INR',
    timezone: 'Asia/Kolkata (IST)',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:00:00Z',
    passwordHash: 'password123',
  },
  {
    id: 'admin-001',
    fullName: 'Sarah Vance',
    email: 'admin@fintech.io',
    mobileNumber: '+91 98111 22334',
    role: 'ADMIN',
    currency: 'INR',
    timezone: 'Asia/Kolkata (IST)',
    profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T09:00:00Z',
    passwordHash: 'admin123',
  },
];

const DEMO_INCOMES: Income[] = [
  {
    id: 'inc-01',
    amount: 95000,
    source: 'Salary',
    date: '2026-10-01',
    description: 'Tech Lead Monthly Salary',
    notes: 'Direct bank deposit from RazorTech Systems',
    userId: 'user-001',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'inc-02',
    amount: 25000,
    source: 'Freelancing',
    date: '2026-10-02',
    description: 'Design System & Mobile UI Project',
    notes: 'Payment received via UPI from client Acme Corp',
    userId: 'user-001',
    createdAt: '2026-10-02T11:30:00Z',
  },
  {
    id: 'inc-03',
    amount: 15000,
    source: 'Investment',
    date: '2026-09-25',
    description: 'Quarterly Mutual Fund Dividend',
    notes: 'Nifty 50 Index Fund dividend payout',
    userId: 'user-001',
    createdAt: '2026-09-25T14:00:00Z',
  },
  {
    id: 'inc-04',
    amount: 95000,
    source: 'Salary',
    date: '2026-09-01',
    description: 'Tech Lead Monthly Salary',
    notes: 'September compensation',
    userId: 'user-001',
    createdAt: '2026-09-01T10:00:00Z',
  },
];

const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-01',
    amount: 3800,
    category: 'Food',
    subCategory: 'Dining & Cafes',
    date: '2026-10-02',
    paymentMethod: 'UPI',
    description: 'Fine Dining Weekend Lunch',
    notes: 'Team celebration at Artisan Bistro',
    userId: 'user-001',
    createdAt: '2026-10-02T13:45:00Z',
  },
  {
    id: 'exp-02',
    amount: 7200,
    category: 'Shopping',
    subCategory: 'Apparel',
    date: '2026-10-01',
    paymentMethod: 'Credit Card',
    description: 'Winter Jacket & Formal Shirts',
    notes: 'Sale discount applied (20% off)',
    userId: 'user-001',
    createdAt: '2026-10-01T18:20:00Z',
  },
  {
    id: 'exp-03',
    amount: 2550,
    category: 'Transportation',
    subCategory: 'Cab & Fuel',
    date: '2026-10-02',
    paymentMethod: 'UPI',
    description: 'City Commute & Airport Rides',
    notes: 'Uber business rides',
    userId: 'user-001',
    createdAt: '2026-10-02T08:15:00Z',
  },
  {
    id: 'exp-04',
    amount: 2100,
    category: 'Entertainment',
    subCategory: 'Movies & Events',
    date: '2026-10-02',
    paymentMethod: 'Debit Card',
    description: 'IMAX Cinema Tickets & Snacks',
    notes: 'Weekend movie with family',
    userId: 'user-001',
    createdAt: '2026-10-02T20:10:00Z',
  },
  {
    id: 'exp-05',
    amount: 12000,
    category: 'Rent',
    subCategory: 'Apartment Lease',
    date: '2026-10-01',
    paymentMethod: 'Net Banking',
    description: 'Monthly 2BHK Apartment Rent',
    notes: 'Paid to landlord via IMPS',
    userId: 'user-001',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'exp-06',
    amount: 2450,
    category: 'Bills',
    subCategory: 'Electricity & Water',
    date: '2026-10-01',
    paymentMethod: 'UPI',
    description: 'Electricity Board Monthly Utility',
    notes: 'Bill ref #EB-99482',
    userId: 'user-001',
    createdAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'exp-07',
    amount: 4400,
    category: 'Groceries',
    subCategory: 'Supermarket',
    date: '2026-10-02',
    paymentMethod: 'Wallet',
    description: 'Monthly Organic Groceries & Supplies',
    notes: 'Fresh vegetables, milk, essentials',
    userId: 'user-001',
    createdAt: '2026-10-02T10:30:00Z',
  },
  {
    id: 'exp-08',
    amount: 15000,
    category: 'Investment',
    subCategory: 'Mutual Funds SIP',
    date: '2026-10-02',
    paymentMethod: 'Net Banking',
    description: 'Nifty 50 Index Fund Monthly SIP',
    notes: 'Automated long-term wealth accumulation',
    userId: 'user-001',
    createdAt: '2026-10-02T09:30:00Z',
  },
  {
    id: 'exp-09',
    amount: 10000,
    category: 'Investment',
    subCategory: 'Stocks / Equity',
    date: '2026-09-15',
    paymentMethod: 'UPI',
    description: 'Bluechip Tech Equity Purchase',
    notes: 'Long-term equity portfolio addition',
    userId: 'user-001',
    createdAt: '2026-09-15T11:20:00Z',
  },
];

const DEMO_BUDGETS: Budget[] = [
  {
    id: 'bud-01',
    category: 'Food',
    monthlyLimit: 5000,
    month: '2026-10',
    userId: 'user-001',
  },
  {
    id: 'bud-02',
    category: 'Shopping',
    monthlyLimit: 10000,
    month: '2026-10',
    userId: 'user-001',
  },
  {
    id: 'bud-03',
    category: 'Transportation',
    monthlyLimit: 3000,
    month: '2026-10',
    userId: 'user-001',
  },
  {
    id: 'bud-04',
    category: 'Entertainment',
    monthlyLimit: 2000,
    month: '2026-10',
    userId: 'user-001',
  },
  {
    id: 'bud-05',
    category: 'Groceries',
    monthlyLimit: 6000,
    month: '2026-10',
    userId: 'user-001',
  },
  {
    id: 'bud-06',
    category: 'Bills',
    monthlyLimit: 4000,
    month: '2026-10',
    userId: 'user-001',
  },
  {
    id: 'bud-07',
    category: 'Investment',
    monthlyLimit: 25000,
    month: '2026-10',
    userId: 'user-001',
  },
];

const DEMO_RECURRING: RecurringExpense[] = [
  {
    id: 'rec-01',
    title: 'Netflix Premium 4K',
    amount: 649,
    category: 'Entertainment',
    frequency: 'Monthly',
    nextPaymentDate: '2026-10-10',
    paymentMethod: 'Credit Card',
    notes: 'Family 4-screen streaming plan',
    active: true,
    userId: 'user-001',
  },
  {
    id: 'rec-02',
    title: 'Spotify Family Audio',
    amount: 179,
    category: 'Entertainment',
    frequency: 'Monthly',
    nextPaymentDate: '2026-10-05',
    paymentMethod: 'UPI',
    notes: 'Lossless audio subscription',
    active: true,
    userId: 'user-001',
  },
  {
    id: 'rec-03',
    title: 'High-Speed Fiber Broadband',
    amount: 999,
    category: 'Bills',
    frequency: 'Monthly',
    nextPaymentDate: '2026-10-15',
    paymentMethod: 'Net Banking',
    notes: '300 Mbps unlimited optical plan',
    active: true,
    userId: 'user-001',
  },
  {
    id: 'rec-04',
    title: 'Gym & Fitness Membership',
    amount: 1500,
    category: 'Healthcare',
    frequency: 'Monthly',
    nextPaymentDate: '2026-10-20',
    paymentMethod: 'UPI',
    notes: 'Gold Gym Monthly Access',
    active: true,
    userId: 'user-001',
  },
  {
    id: 'rec-05',
    title: 'Amazon Prime Annual',
    amount: 1499,
    category: 'Shopping',
    frequency: 'Yearly',
    nextPaymentDate: '2026-11-28',
    paymentMethod: 'Credit Card',
    notes: 'Free deliveries and Prime Video',
    active: true,
    userId: 'user-001',
  },
  {
    id: 'rec-06',
    title: 'Mutual Funds SIP (Index & Flexi)',
    amount: 15000,
    category: 'Investment',
    frequency: 'Monthly',
    nextPaymentDate: '2026-10-05',
    paymentMethod: 'Net Banking',
    notes: 'Wealth accumulation automatic SIP',
    active: true,
    userId: 'user-001',
  },
];

const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    type: 'BUDGET_EXCEEDED',
    title: 'Budget Exceeded: Entertainment',
    message: 'You have spent ₹2,100 out of ₹2,000 budget (105%). Tap to review expenses.',
    date: '2026-10-02T20:11:00Z',
    read: false,
    link: '/budget',
  },
  {
    id: 'notif-02',
    type: 'BUDGET_WARNING',
    title: 'Budget Alert: Transportation at 85%',
    message: 'Transportation has reached ₹2,550 of ₹3,000 threshold. Watch your travel spending.',
    date: '2026-10-02T08:20:00Z',
    read: false,
    link: '/budget',
  },
  {
    id: 'notif-03',
    type: 'RECURRING_DUE',
    title: 'Upcoming Bill: Spotify Family',
    message: 'Payment of ₹179 will be deducted via UPI on 05 Oct 2026.',
    date: '2026-10-02T09:00:00Z',
    read: false,
    link: '/recurring',
  },
  {
    id: 'notif-04',
    type: 'MONTHLY_SUMMARY',
    title: 'October Financial Health Score: 92/100',
    message: 'Excellent savings rate! Your total balance is healthy at ₹85,500.',
    date: '2026-10-02T07:30:00Z',
    read: true,
    link: '/analytics',
  },
];

class MockDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users) {
          parsed.users = parsed.users.map((u: any) =>
            u.id === 'user-001' || u.fullName === 'Alex Johnson'
              ? { ...u, fullName: 'Akshay Bawane', email: 'akshay@fintech.io' }
              : u
          );
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Unable to load state from localStorage', e);
    }
    // Pristine zero initial state for first-time launch
    const initialState: DatabaseState = {
      users: DEFAULT_USERS,
      expenses: [],
      incomes: [],
      budgets: [],
      recurring: [],
      notifications: [],
    };
    this.saveState(initialState);
    return initialState;
  }

  private saveState(state: DatabaseState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      this.state = state;
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  public resetAllToZero(): DatabaseState {
    const initialState: DatabaseState = {
      users: this.state.users && this.state.users.length > 0 ? this.state.users : DEFAULT_USERS,
      expenses: [],
      incomes: [],
      budgets: [],
      recurring: [],
      notifications: [],
    };
    this.saveState(initialState);
    return initialState;
  }

  public resetToDefaults(): DatabaseState {
    return this.resetAllToZero();
  }

  public loadDemoData(): DatabaseState {
    const demoState: DatabaseState = {
      users: this.state.users && this.state.users.length > 0 ? this.state.users : DEFAULT_USERS,
      expenses: [...DEMO_EXPENSES],
      incomes: [...DEMO_INCOMES],
      budgets: [...DEMO_BUDGETS],
      recurring: [...DEMO_RECURRING],
      notifications: [...DEMO_NOTIFICATIONS],
    };
    this.saveState(demoState);
    return demoState;
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // --- Auth methods ---
  public findUserByEmail(email: string) {
    return this.state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }) {
    const newUser: User & { passwordHash: string } = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.saveState({
      ...this.state,
      users: [...this.state.users, newUser],
    });
    return newUser;
  }

  public updateUser(userId: string, updates: Partial<User>) {
    const updatedUsers = this.state.users.map((u) =>
      u.id === userId ? { ...u, ...updates } : u
    );
    this.saveState({ ...this.state, users: updatedUsers });
    return updatedUsers.find((u) => u.id === userId);
  }

  public updateUserProfile(userId: string, updates: Partial<User>) {
    return this.updateUser(userId, updates);
  }

  // --- Expenses ---
  public getExpenses(userId?: string) {
    if (!userId) return this.state.expenses;
    return this.state.expenses.filter((e) => e.userId === userId);
  }

  public addExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
    const newExpense: Expense = {
      ...expense,
      amount: Math.max(0, expense.amount || 0),
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextExpenses = [newExpense, ...this.state.expenses];
    this.saveState({ ...this.state, expenses: nextExpenses });
    this.checkBudgetTriggers(newExpense);
    return newExpense;
  }

  public updateExpense(id: string, updates: Partial<Expense>) {
    const nextExpenses = this.state.expenses.map((e) =>
      e.id === id
        ? {
            ...e,
            ...updates,
            amount: updates.amount !== undefined ? Math.max(0, updates.amount || 0) : e.amount,
          }
        : e
    );
    this.saveState({ ...this.state, expenses: nextExpenses });
    const updated = nextExpenses.find((e) => e.id === id);
    if (updated) this.checkBudgetTriggers(updated);
    return updated;
  }

  public deleteExpense(id: string) {
    const nextExpenses = this.state.expenses.filter((e) => e.id !== id);
    this.saveState({ ...this.state, expenses: nextExpenses });
    return true;
  }

  public deleteExpensesByMonth(month: string, userId?: string) {
    const nextExpenses = this.state.expenses.filter((e) => {
      const matchMonth = e.date.startsWith(month);
      const matchUser = !userId || e.userId === userId;
      return !(matchMonth && matchUser);
    });
    this.saveState({ ...this.state, expenses: nextExpenses });
    return nextExpenses;
  }

  // --- Income ---
  public getIncomes(userId?: string) {
    if (!userId) return this.state.incomes;
    return this.state.incomes.filter((i) => i.userId === userId);
  }

  public addIncome(income: Omit<Income, 'id' | 'createdAt'>) {
    const newIncome: Income = {
      ...income,
      amount: Math.max(0, income.amount || 0),
      id: `inc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.saveState({ ...this.state, incomes: [newIncome, ...this.state.incomes] });
    return newIncome;
  }

  public updateIncome(id: string, updates: Partial<Income>) {
    const nextIncomes = this.state.incomes.map((i) =>
      i.id === id
        ? {
            ...i,
            ...updates,
            amount: updates.amount !== undefined ? Math.max(0, updates.amount || 0) : i.amount,
          }
        : i
    );
    this.saveState({ ...this.state, incomes: nextIncomes });
    return nextIncomes.find((i) => i.id === id);
  }

  public deleteIncome(id: string) {
    const nextIncomes = this.state.incomes.filter((i) => i.id !== id);
    this.saveState({ ...this.state, incomes: nextIncomes });
    return true;
  }

  // --- Budgets ---
  public getBudgets(userId?: string) {
    if (!userId) return this.state.budgets;
    return this.state.budgets.filter((b) => b.userId === userId);
  }

  public addBudget(budget: Omit<Budget, 'id'>) {
    const newBudget: Budget = {
      ...budget,
      monthlyLimit: Math.max(0, budget.monthlyLimit || 0),
      id: `bud-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.saveState({ ...this.state, budgets: [...this.state.budgets, newBudget] });
    return newBudget;
  }

  public updateBudget(id: string, updates: Partial<Budget>) {
    const nextBudgets = this.state.budgets.map((b) =>
      b.id === id
        ? {
            ...b,
            ...updates,
            monthlyLimit: updates.monthlyLimit !== undefined ? Math.max(0, updates.monthlyLimit || 0) : b.monthlyLimit,
          }
        : b
    );
    this.saveState({ ...this.state, budgets: nextBudgets });
    return nextBudgets.find((b) => b.id === id);
  }

  public deleteBudget(id: string) {
    const nextBudgets = this.state.budgets.filter((b) => b.id !== id);
    this.saveState({ ...this.state, budgets: nextBudgets });
    return true;
  }

  // --- Recurring ---
  public getRecurring(userId?: string) {
    if (!userId) return this.state.recurring;
    return this.state.recurring.filter((r) => r.userId === userId);
  }

  public addRecurring(item: Omit<RecurringExpense, 'id'>) {
    const newItem: RecurringExpense = {
      ...item,
      amount: Math.max(0, item.amount || 0),
      id: `rec-${Date.now()}`,
    };
    this.saveState({ ...this.state, recurring: [newItem, ...this.state.recurring] });
    return newItem;
  }

  public updateRecurring(id: string, updates: Partial<RecurringExpense>) {
    const next = this.state.recurring.map((r) =>
      r.id === id
        ? {
            ...r,
            ...updates,
            amount: updates.amount !== undefined ? Math.max(0, updates.amount || 0) : r.amount,
          }
        : r
    );
    this.saveState({ ...this.state, recurring: next });
    return next.find((r) => r.id === id);
  }

  public deleteRecurring(id: string) {
    const next = this.state.recurring.filter((r) => r.id !== id);
    this.saveState({ ...this.state, recurring: next });
    return true;
  }

  // --- Notifications ---
  public getNotifications() {
    return this.state.notifications;
  }

  public markNotificationAsRead(id: string) {
    const next = this.state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveState({ ...this.state, notifications: next });
    return next;
  }

  public markAllNotificationsRead() {
    const next = this.state.notifications.map((n) => ({ ...n, read: true }));
    this.saveState({ ...this.state, notifications: next });
    return next;
  }

  public clearNotifications() {
    this.saveState({ ...this.state, notifications: [] });
    return [];
  }

  public addNotification(notification: Omit<AppNotification, 'id' | 'date'>) {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString(),
    };
    this.saveState({
      ...this.state,
      notifications: [newNotif, ...this.state.notifications],
    });
    return newNotif;
  }

  // Check budget automated alerts (80% and 100%)
  private checkBudgetTriggers(expense: Expense) {
    const currentMonth = expense.date.substring(0, 7); // '2026-10'
    const budget = this.state.budgets.find(
      (b) => b.category === expense.category && b.month === currentMonth && b.userId === expense.userId
    );
    if (!budget) return;

    // Calculate total for this category this month
    const totalSpent = this.state.expenses
      .filter((e) => e.userId === expense.userId && e.category === expense.category && e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0);

    const ratio = totalSpent / budget.monthlyLimit;

    if (ratio >= 1.0) {
      this.addNotification({
        type: 'BUDGET_EXCEEDED',
        title: `Budget Exceeded: ${expense.category}`,
        message: `You've spent ₹${totalSpent.toLocaleString()} of your ₹${budget.monthlyLimit.toLocaleString()} limit (${Math.round(ratio * 100)}%).`,
        read: false,
        link: '/budget',
      });
    } else if (ratio >= 0.8) {
      this.addNotification({
        type: 'BUDGET_WARNING',
        title: `Budget Warning: ${expense.category} at ${Math.round(ratio * 100)}%`,
        message: `You've spent ₹${totalSpent.toLocaleString()} of your ₹${budget.monthlyLimit.toLocaleString()} limit. Keep track!`,
        read: false,
        link: '/budget',
      });
    }
  }
}

export const mockDb = new MockDatabase();
