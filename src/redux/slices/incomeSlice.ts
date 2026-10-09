import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Income, IncomeSource } from '../../types';
import incomeService from '../../services/incomeService';

interface IncomeState {
  incomes: Income[];
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    source: IncomeSource | 'ALL';
    startDate: string;
    endDate: string;
    sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
  };
}

const initialState: IncomeState = {
  incomes: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    source: 'ALL',
    startDate: '',
    endDate: '',
    sortBy: 'date_desc',
  },
};

export const fetchIncomes = createAsyncThunk('income/fetch', async () => {
  return await incomeService.getIncomes();
});

export const addIncomeThunk = createAsyncThunk(
  'income/add',
  async (payload: Omit<Income, 'id' | 'createdAt'>) => {
    return await incomeService.addIncome(payload);
  }
);

export const updateIncomeThunk = createAsyncThunk(
  'income/update',
  async ({ id, updates }: { id: string; updates: Partial<Income> }) => {
    return await incomeService.updateIncome(id, updates);
  }
);

export const deleteIncomeThunk = createAsyncThunk(
  'income/delete',
  async (id: string) => {
    await incomeService.deleteIncome(id);
    return id;
  }
);

export const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setIncomeFilters: (state, action: PayloadAction<Partial<IncomeState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetIncomeFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Income
      .addCase(fetchIncomes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incomes = action.payload;
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch income';
      })
      // Add Income
      .addCase(addIncomeThunk.fulfilled, (state, action) => {
        state.incomes.unshift(action.payload);
      })
      // Update Income
      .addCase(updateIncomeThunk.fulfilled, (state, action) => {
        const index = state.incomes.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.incomes[index] = action.payload;
        }
      })
      // Delete Income
      .addCase(deleteIncomeThunk.fulfilled, (state, action) => {
        state.incomes = state.incomes.filter((i) => i.id !== action.payload);
      });
  },
});

export const { setIncomeFilters, resetIncomeFilters } = incomeSlice.actions;
export default incomeSlice.reducer;
