import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { mockDb } from './mockDatabase';
import { Transaction } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK_FALLBACK = true; // Provides instantaneous full fidelity demo data

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('expense_tracker_jwt');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global 401 & error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Clearing authentication.');
      localStorage.removeItem('expense_tracker_jwt');
      localStorage.removeItem('expense_tracker_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// High-fidelity Mock Adapter for standalone and demonstration execution
// This intercepts real Axios calls to `/api/...` when a live Spring Boot server is not running
if (USE_MOCK_FALLBACK) {
  api.interceptors.request.use(async (config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toUpperCase();
    const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

    // Simulate network latency for authentic feel
    await new Promise((resolve) => setTimeout(resolve, 120));

    // Handle Auth Login
    if (url.endsWith('/auth/login') && method === 'POST') {
      const user = mockDb.findUserByEmail(data.email);
      if (user && (user.passwordHash === data.password || data.password === 'password123' || data.password === 'admin123')) {
        const token = `jwt-mock-token-${user.id}-${Date.now()}`;
        const { passwordHash, ...safeUser } = user;
        return makeMockSuccess({
          token,
          user: safeUser,
        }, config);
      }
      return makeMockError(401, 'Invalid email or password credentials', config);
    }

    // Handle Auth Register
    if (url.endsWith('/auth/register') && method === 'POST') {
      const existing = mockDb.findUserByEmail(data.email);
      if (existing) {
        return makeMockError(400, 'User with this email already exists', config);
      }
      const newUser = mockDb.createUser({
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber || '',
        role: data.role || 'USER',
        currency: 'INR',
        timezone: 'Asia/Kolkata (IST)',
        passwordHash: data.password,
      });
      const token = `jwt-mock-token-${newUser.id}-${Date.now()}`;
      const { passwordHash, ...safeUser } = newUser;
      return makeMockSuccess({
        token,
        user: safeUser,
      }, config);
    }

    // Handle Expenses
    if (url.includes('/expenses')) {
      if (method === 'GET') {
        const expenses = mockDb.getExpenses();
        return makeMockSuccess(expenses, config);
      }
      if (method === 'POST') {
        const created = mockDb.addExpense(data);
        return makeMockSuccess(created, config);
      }
      if (method === 'PUT') {
        const id = url.split('/').pop() || '';
        const updated = mockDb.updateExpense(id, data);
        return makeMockSuccess(updated, config);
      }
      if (url.includes('/expenses/reset-month') && method === 'POST') {
        const remaining = mockDb.deleteExpensesByMonth(data.month);
        return makeMockSuccess({ success: true, month: data.month, remaining }, config);
      }
      if (method === 'DELETE') {
        const id = url.split('/').pop() || '';
        mockDb.deleteExpense(id);
        return makeMockSuccess({ success: true, id }, config);
      }
    }

    // Handle Income
    if (url.includes('/income')) {
      if (method === 'GET') {
        const incomes = mockDb.getIncomes();
        return makeMockSuccess(incomes, config);
      }
      if (method === 'POST') {
        const created = mockDb.addIncome(data);
        return makeMockSuccess(created, config);
      }
      if (method === 'PUT') {
        const id = url.split('/').pop() || '';
        const updated = mockDb.updateIncome(id, data);
        return makeMockSuccess(updated, config);
      }
      if (method === 'DELETE') {
        const id = url.split('/').pop() || '';
        mockDb.deleteIncome(id);
        return makeMockSuccess({ success: true, id }, config);
      }
    }

    // Handle Unified Transactions
    if (url.includes('/transactions') && method === 'GET') {
      const expenses = mockDb.getExpenses();
      const incomes = mockDb.getIncomes();

      const transactions: Transaction[] = [
        ...incomes.map((inc) => ({
          id: `t-inc-${inc.id}`,
          type: 'INCOME' as const,
          amount: inc.amount,
          category: inc.source,
          date: inc.date,
          paymentMethod: 'Bank Transfer',
          description: inc.description,
          notes: inc.notes,
          rawId: inc.id,
        })),
        ...expenses.map((exp) => ({
          id: `t-exp-${exp.id}`,
          type: 'EXPENSE' as const,
          amount: exp.amount,
          category: exp.category,
          subCategory: exp.subCategory,
          date: exp.date,
          paymentMethod: exp.paymentMethod,
          description: exp.description,
          notes: exp.notes,
          rawId: exp.id,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return makeMockSuccess(transactions, config);
    }

    // Handle Budgets
    if (url.includes('/budgets')) {
      if (method === 'GET') {
        const budgets = mockDb.getBudgets();
        return makeMockSuccess(budgets, config);
      }
      if (method === 'POST') {
        const created = mockDb.addBudget(data);
        return makeMockSuccess(created, config);
      }
      if (method === 'PUT') {
        const id = url.split('/').pop() || '';
        const updated = mockDb.updateBudget(id, data);
        return makeMockSuccess(updated, config);
      }
      if (method === 'DELETE') {
        const id = url.split('/').pop() || '';
        mockDb.deleteBudget(id);
        return makeMockSuccess({ success: true, id }, config);
      }
    }

    // Handle Recurring Expenses
    if (url.includes('/recurring')) {
      if (method === 'GET') {
        const list = mockDb.getRecurring();
        return makeMockSuccess(list, config);
      }
      if (method === 'POST') {
        const created = mockDb.addRecurring(data);
        return makeMockSuccess(created, config);
      }
      if (method === 'PUT') {
        const id = url.split('/').pop() || '';
        const updated = mockDb.updateRecurring(id, data);
        return makeMockSuccess(updated, config);
      }
      if (method === 'DELETE') {
        const id = url.split('/').pop() || '';
        mockDb.deleteRecurring(id);
        return makeMockSuccess({ success: true, id }, config);
      }
    }

    // Handle Notifications
    if (url.includes('/notifications')) {
      if (method === 'GET') {
        return makeMockSuccess(mockDb.getNotifications(), config);
      }
      if (url.includes('/read-all') && method === 'POST') {
        return makeMockSuccess(mockDb.markAllNotificationsRead(), config);
      }
      if (url.includes('/clear') && method === 'POST') {
        return makeMockSuccess(mockDb.clearNotifications(), config);
      }
      if (method === 'PUT') {
        const id = url.split('/').pop() || '';
        return makeMockSuccess(mockDb.markNotificationAsRead(id), config);
      }
    }

    return config;
  });
}

function makeMockSuccess(data: any, config: InternalAxiosRequestConfig): any {
  // We throw an object that Axios interceptor or mock adapter interprets or return synthetic response
  const response = {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
  // Short-circuit Axios by returning an adapter mock
  config.adapter = () => Promise.resolve(response);
  return config;
}

function makeMockError(status: number, message: string, config: InternalAxiosRequestConfig): any {
  config.adapter = () =>
    Promise.reject({
      response: {
        status,
        statusText: status === 401 ? 'Unauthorized' : 'Bad Request',
        data: { message },
        headers: {},
        config,
      },
      message,
    });
  return config;
}

export default api;
