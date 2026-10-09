import api from './api';
import { Budget } from '../types';

export const budgetService = {
  async getBudgets(): Promise<Budget[]> {
    const response = await api.get<Budget[]>('/budgets');
    return response.data;
  },

  async addBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const response = await api.post<Budget>('/budgets', budget);
    return response.data;
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const response = await api.put<Budget>(`/budgets/${id}`, updates);
    return response.data;
  },

  async deleteBudget(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete<{ success: boolean; id: string }>(`/budgets/${id}`);
    return response.data;
  },
};

export default budgetService;
