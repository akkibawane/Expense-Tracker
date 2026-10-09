import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, Role, CurrencyCode } from '../../types';
import { authService, LoginPayload, RegisterPayload } from '../../services/authService';

const storedToken = localStorage.getItem('expense_tracker_jwt');
const storedUserRaw = localStorage.getItem('expense_tracker_user');
let parsedUser: User | null = null;
try {
  if (storedUserRaw) {
    parsedUser = JSON.parse(storedUserRaw);
    if (parsedUser && (parsedUser.fullName === 'Alex Johnson' || parsedUser.id === 'user-001')) {
      parsedUser.fullName = 'Akshay Bawane';
      parsedUser.email = 'akshay@fintech.io';
      localStorage.setItem('expense_tracker_user', JSON.stringify(parsedUser));
    }
  }
} catch (e) {
  parsedUser = null;
}

const initialState: AuthState = {
  user: parsedUser || {
    id: 'user-001',
    fullName: 'Akshay Bawane',
    email: 'akshay@fintech.io',
    mobileNumber: '+91 98765 43210',
    role: 'USER',
    currency: 'INR',
    timezone: 'Asia/Kolkata (IST)',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:00:00Z',
  },
  token: storedToken || 'mock-initial-jwt-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  rememberMe: true,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authService.login(payload);
      if (payload.rememberMe) {
        localStorage.setItem('expense_tracker_jwt', response.token);
        localStorage.setItem('expense_tracker_user', JSON.stringify(response.user));
      } else {
        sessionStorage.setItem('expense_tracker_jwt', response.token);
      }
      return { ...response, rememberMe: !!payload.rememberMe };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to login');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authService.register(payload);
      localStorage.setItem('expense_tracker_jwt', response.token);
      localStorage.setItem('expense_tracker_user', JSON.stringify(response.user));
      return { ...response, rememberMe: true };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register account');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.logout();
      sessionStorage.removeItem('expense_tracker_jwt');
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('expense_tracker_user', JSON.stringify(state.user));
      }
    },
    switchRole: (state, action: PayloadAction<Role>) => {
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem('expense_tracker_user', JSON.stringify(state.user));
      }
    },
    setUserCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      if (state.user) {
        state.user.currency = action.payload;
        localStorage.setItem('expense_tracker_user', JSON.stringify(state.user));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthSession: (state, action: PayloadAction<{ user: User; token: string; rememberMe?: boolean }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.rememberMe = action.payload.rememberMe ?? true;
      state.error = null;
      if (action.payload.rememberMe !== false) {
        localStorage.setItem('expense_tracker_jwt', action.payload.token);
        localStorage.setItem('expense_tracker_user', JSON.stringify(action.payload.user));
      } else {
        sessionStorage.setItem('expense_tracker_jwt', action.payload.token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.rememberMe = action.payload.rememberMe;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, updateProfile, switchRole, setUserCurrency, clearError, setAuthSession } = authSlice.actions;
export default authSlice.reducer;
