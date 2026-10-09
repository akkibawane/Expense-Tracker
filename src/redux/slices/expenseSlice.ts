import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, RecurringExpense, ExpenseCategory, PaymentMethod } from '../../types';
import expenseService from '../../services/expenseService';
import { recurringService } from '../../services/recurringService';

interface ExpenseState {
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: ExpenseCategory | 'ALL';
    paymentMethod: PaymentMethod | 'ALL';
    startDate: string;
    endDate: string;
    sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
  };
}

const initialState: ExpenseState = {
  expenses: [],
  recurringExpenses: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    category: 'ALL',
    paymentMethod: 'ALL',
    startDate: '',
    endDate: '',
    sortBy: 'date_desc',
  },
};

export const fetchExpenses = createAsyncThunk('expenses/fetch', async () => {
  return await expenseService.getExpenses();
});

export const addExpenseThunk = createAsyncThunk(
  'expenses/add',
  async (payload: Omit<Expense, 'id' | 'createdAt'>) => {
    return await expenseService.addExpense(payload);
  }
);

export const updateExpenseThunk = createAsyncThunk(
  'expenses/update',
  async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
    return await expenseService.updateExpense(id, updates);
  }
);

export const deleteExpenseThunk = createAsyncThunk(
  'expenses/delete',
  async (id: string) => {
    await expenseService.deleteExpense(id);
    return id;
  }
);

export const resetMonthExpensesThunk = createAsyncThunk(
  'expenses/resetMonth',
  async (month: string) => {
    await expenseService.resetMonthExpenses(month);
    return month;
  }
);

export const fetchRecurringThunk = createAsyncThunk('recurring/fetch', async () => {
  return await recurringService.getRecurring();
});

export const addRecurringThunk = createAsyncThunk(
  'recurring/add',
  async (item: Omit<RecurringExpense, 'id'>) => {
    return await recurringService.addRecurring(item);
  }
);

export const updateRecurringThunk = createAsyncThunk(
  'recurring/update',
  async ({ id, updates }: { id: string; updates: Partial<RecurringExpense> }) => {
    return await recurringService.updateRecurring(id, updates);
  }
);

export const deleteRecurringThunk = createAsyncThunk(
  'recurring/delete',
  async (id: string) => {
    await recurringService.deleteRecurring(id);
    return id;
  }
);

export const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenseFilters: (state, action: PayloadAction<Partial<ExpenseState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetExpenseFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      // Add Expense
      .addCase(addExpenseThunk.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      // Update Expense
      .addCase(updateExpenseThunk.fulfilled, (state, action) => {
        const index = state.expenses.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      // Delete Expense
      .addCase(deleteExpenseThunk.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      })
      // Reset Month Expenses
      .addCase(resetMonthExpensesThunk.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => !e.date.startsWith(action.payload));
      })
      // Fetch Recurring
      .addCase(fetchRecurringThunk.fulfilled, (state, action) => {
        state.recurringExpenses = action.payload;
      })
      // Add Recurring
      .addCase(addRecurringThunk.fulfilled, (state, action) => {
        state.recurringExpenses.unshift(action.payload);
      })
      // Update Recurring
      .addCase(updateRecurringThunk.fulfilled, (state, action) => {
        const index = state.recurringExpenses.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.recurringExpenses[index] = action.payload;
        }
      })
      // Delete Recurring
      .addCase(deleteRecurringThunk.fulfilled, (state, action) => {
        state.recurringExpenses = state.recurringExpenses.filter((r) => r.id !== action.payload);
      });
  },
});

export const { setExpenseFilters, resetExpenseFilters } = expenseSlice.actions;
export default expenseSlice.reducer;
