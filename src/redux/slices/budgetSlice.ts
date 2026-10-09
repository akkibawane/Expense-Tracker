import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Budget } from '../../types';
import budgetService from '../../services/budgetService';

interface BudgetState {
  budgets: Budget[];
  selectedMonth: string; // '2026-10'
  isLoading: boolean;
  error: string | null;
}

const currentDate = new Date();
const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

const initialState: BudgetState = {
  budgets: [],
  selectedMonth: defaultMonth,
  isLoading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk('budgets/fetch', async () => {
  return await budgetService.getBudgets();
});

export const addBudgetThunk = createAsyncThunk(
  'budgets/add',
  async (budget: Omit<Budget, 'id'>) => {
    return await budgetService.addBudget(budget);
  }
);

export const updateBudgetThunk = createAsyncThunk(
  'budgets/update',
  async ({ id, updates }: { id: string; updates: Partial<Budget> }) => {
    return await budgetService.updateBudget(id, updates);
  }
);

export const deleteBudgetThunk = createAsyncThunk(
  'budgets/delete',
  async (id: string) => {
    await budgetService.deleteBudget(id);
    return id;
  }
);

export const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch budgets';
      })
      .addCase(addBudgetThunk.fulfilled, (state, action) => {
        state.budgets.push(action.payload);
      })
      .addCase(updateBudgetThunk.fulfilled, (state, action) => {
        const index = state.budgets.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(deleteBudgetThunk.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      });
  },
});

export const { setSelectedMonth } = budgetSlice.actions;
export default budgetSlice.reducer;
