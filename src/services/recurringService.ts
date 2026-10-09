import api from './api';
import { RecurringExpense, Transaction, AppNotification } from '../types';

export const recurringService = {
  async getRecurring(): Promise<RecurringExpense[]> {
    const response = await api.get<RecurringExpense[]>('/recurring');
    return response.data;
  },

  async addRecurring(item: Omit<RecurringExpense, 'id'>): Promise<RecurringExpense> {
    const response = await api.post<RecurringExpense>('/recurring', item);
    return response.data;
  },

  async updateRecurring(id: string, updates: Partial<RecurringExpense>): Promise<RecurringExpense> {
    const response = await api.put<RecurringExpense>(`/recurring/${id}`, updates);
    return response.data;
  },

  async deleteRecurring(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete<{ success: boolean; id: string }>(`/recurring/${id}`);
    return response.data;
  },
};

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },
};

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    const response = await api.get<AppNotification[]>('/notifications');
    return response.data;
  },

  async markAsRead(id: string): Promise<AppNotification[]> {
    const response = await api.put<AppNotification[]>(`/notifications/${id}`);
    return response.data;
  },

  async markAllAsRead(): Promise<AppNotification[]> {
    const response = await api.post<AppNotification[]>('/notifications/read-all');
    return response.data;
  },

  async clearAll(): Promise<AppNotification[]> {
    const response = await api.post<AppNotification[]>('/notifications/clear');
    return response.data;
  },
};
