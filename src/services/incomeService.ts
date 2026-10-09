import api from './api';
import { Income } from '../types';

export const incomeService = {
  async getIncomes(): Promise<Income[]> {
    const response = await api.get<Income[]>('/income');
    return response.data;
  },

  async addIncome(income: Omit<Income, 'id' | 'createdAt'>): Promise<Income> {
    const response = await api.post<Income>('/income', income);
    return response.data;
  },

  async updateIncome(id: string, updates: Partial<Income>): Promise<Income> {
    const response = await api.put<Income>(`/income/${id}`, updates);
    return response.data;
  },

  async deleteIncome(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete<{ success: boolean; id: string }>(`/income/${id}`);
    return response.data;
  },
};

export default incomeService;
