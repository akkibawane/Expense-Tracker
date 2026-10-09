import api from './api';
import { User, Role } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('expense_tracker_jwt');
    localStorage.removeItem('expense_tracker_user');
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('expense_tracker_user');
    return raw ? JSON.parse(raw) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('expense_tracker_jwt');
  },
};

export default authService;
