import api from './api';
import { Expense } from '../types';

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    const response = await api.get<Expense[]>('/expenses');
    return response.data;
  },

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const response = await api.post<Expense>('/expenses', expense);
    return response.data;
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const response = await api.put<Expense>(`/expenses/${id}`, updates);
    return response.data;
  },

  async deleteExpense(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete<{ success: boolean; id: string }>(`/expenses/${id}`);
    return response.data;
  },

  async resetMonthExpenses(month: string): Promise<{ success: boolean; month: string }> {
    const response = await api.post<{ success: boolean; month: string }>('/expenses/reset-month', { month });
    return response.data;
  },
};

export default expenseService;
