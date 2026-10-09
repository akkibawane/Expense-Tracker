import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrencyCode } from '../../types';
import { LanguageCode } from '../../utils/i18n';

export type ThemeMode = 'dark' | 'light' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

interface UiState {
  theme: ThemeMode;
  currency: CurrencyCode;
  language: LanguageCode;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  isQuickAddOpen: boolean;
  quickAddType: 'expense' | 'income';
  globalSearch: string;
}

const savedTheme = (localStorage.getItem('expense_tracker_theme') as ThemeMode) || 'dark';
const savedCurrency = (localStorage.getItem('expense_tracker_currency') as CurrencyCode) || 'INR';
const savedLanguage = (localStorage.getItem('expense_tracker_language') as LanguageCode) || 'en';
const savedFontSize = (localStorage.getItem('expense_tracker_font_size') as FontSize) || 'medium';

export function applyThemeToDOM(mode: ThemeMode) {
  const root = document.documentElement;
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

export function applyFontSizeToDOM(size: FontSize) {
  const root = document.documentElement;
  root.setAttribute('data-font-size', size);
  if (size === 'small') {
    root.style.fontSize = '13.5px';
  } else if (size === 'large') {
    root.style.fontSize = '16.5px';
  } else {
    root.style.fontSize = '15px'; // medium default
  }
}

// Initial DOM bootstrap
applyThemeToDOM(savedTheme);
applyFontSizeToDOM(savedFontSize);

const initialState: UiState = {
  theme: savedTheme,
  currency: savedCurrency,
  language: savedLanguage,
  fontSize: savedFontSize,
  sidebarCollapsed: false,
  isQuickAddOpen: false,
  quickAddType: 'expense',
  globalSearch: '',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      localStorage.setItem('expense_tracker_theme', action.payload);
      applyThemeToDOM(action.payload);
    },
    setCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.currency = action.payload;
      localStorage.setItem('expense_tracker_currency', action.payload);
    },
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
      localStorage.setItem('expense_tracker_language', action.payload);
      document.documentElement.lang = action.payload;
      document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
    },
    setFontSize: (state, action: PayloadAction<FontSize>) => {
      state.fontSize = action.payload;
      localStorage.setItem('expense_tracker_font_size', action.payload);
      applyFontSizeToDOM(action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    openQuickAdd: (state, action: PayloadAction<'expense' | 'income'>) => {
      state.quickAddType = action.payload;
      state.isQuickAddOpen = true;
    },
    closeQuickAdd: (state) => {
      state.isQuickAddOpen = false;
    },
    setGlobalSearch: (state, action: PayloadAction<string>) => {
      state.globalSearch = action.payload;
    },
  },
});

export const {
  setTheme,
  setCurrency,
  setLanguage,
  setFontSize,
  toggleSidebar,
  setSidebarCollapsed,
  openQuickAdd,
  closeQuickAdd,
  setGlobalSearch,
} = uiSlice.actions;

export default uiSlice.reducer;
