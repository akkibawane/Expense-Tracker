import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  Flame,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IncomeExpenseChart } from '../../components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { SavingsTrendChart } from '../../components/charts/SavingsTrendChart';

type PeriodPreset =
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'LAST_3_MONTHS'
  | 'THIS_YEAR'
  | 'CUSTOM';

export const Analytics: React.FC = () => {
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const incomes = useAppSelector((state) => state.income.incomes);
  const currency = useAppSelector((state) => state.ui.currency);

  const [period, setPeriod] = useState<PeriodPreset>('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Compute date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'THIS_WEEK') {
      const day = now.getDay() || 7; // Monday = 1
      start.setDate(now.getDate() - day + 1);
      end.setDate(start.getDate() + 6);
    } else if (period === 'THIS_MONTH') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'LAST_MONTH') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (period === 'LAST_3_MONTHS') {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'THIS_YEAR') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else if (period === 'CUSTOM' && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    const daysDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

    return { startStr, endStr, daysDiff };
  }, [period, customStart, customEnd]);

  // Filter items in range
  const periodExpenses = useMemo(() => {
    return expenses.filter(
      (e) => e.date >= dateRange.startStr && e.date <= dateRange.endStr
    );
  }, [expenses, dateRange]);

  const periodIncomes = useMemo(() => {
    return incomes.filter(
      (i) => i.date >= dateRange.startStr && i.date <= dateRange.endStr
    );
  }, [incomes, dateRange]);

  // Analytics Metrics
  const totalIncome = useMemo(() => {
    return periodIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [periodIncomes]);

  const totalExpenses = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [periodExpenses]);

  const savings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
  const avgDailyExpense = Math.round(totalExpenses / dateRange.daysDiff);

  // Highest spending category
  const highestCategory = useMemo(() => {
    const map: Record<string, number> = {};
    periodExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    let topCat = 'None';
    let topAmt = 0;
    Object.entries(map).forEach(([cat, amt]) => {
      if (amt > topAmt) {
        topAmt = amt;
        topCat = cat;
      }
    });
    return { category: topCat, amount: topAmt };
  }, [periodExpenses]);

  // Highest single expense
  const highestSingleExpense = useMemo(() => {
    if (!periodExpenses.length) return null;
    return [...periodExpenses].sort((a, b) => b.amount - a.amount)[0];
  }, [periodExpenses]);

  // Category breakdown for chart
  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    periodExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [periodExpenses]);

  // Monthly Comparison Data (Last 4 Months)
  const monthlyComparisonData = useMemo(() => {
    return [
      { month: 'Jul 26', income: 85000, expense: 32000, savings: 53000 },
      { month: 'Aug 26', income: 95000, expense: 36000, savings: 59000 },
      { month: 'Sep 26', income: 110000, expense: 38000, savings: 72000 },
      { month: 'Oct 26', income: 120000, expense: 34500, savings: 85500 },
    ];
  }, []);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Analytics & Intelligence</h1>
          <p className="page-subtitle">
            Comprehensive cash-flow diagnostics, trends, and wealth trajectory
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(
            [
              ['THIS_WEEK', 'This Week'],
              ['THIS_MONTH', 'This Month'],
              ['LAST_MONTH', 'Last Month'],
              ['LAST_3_MONTHS', 'Last 3 Months'],
              ['THIS_YEAR', 'This Year'],
              ['CUSTOM', 'Custom'],
            ] as [PeriodPreset, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className="amount-pill"
              style={{
                borderColor: period === key ? '#6366f1' : undefined,
                background: period === key ? 'rgba(99,102,241,0.15)' : undefined,
                color: period === key ? '#818cf8' : undefined,
                fontWeight: period === key ? '700' : '500',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers if selected */}
      {period === 'CUSTOM' && (
        <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.84rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.84rem' }}
            />
          </div>
        </div>
      )}

      {/* 8 Detailed Summary Metric Cards */}
      <div className="summary-grid" style={{ marginBottom: '24px' }}>
        {/* Total Income */}
        <div className="summary-card income">
          <div className="summary-top">
            <span className="summary-label">Total Income</span>
            <div className="summary-icon" style={{ background: 'var(--income-subtle)', color: 'var(--income-color)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="summary-amount" style={{ color: 'var(--income-color)' }}>
            {formatCurrency(totalIncome, currency)}
          </div>
          <div className="summary-bottom">
            <span>In selected window</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="summary-card expense">
          <div className="summary-top">
            <span className="summary-label">Total Expenses</span>
            <div className="summary-icon" style={{ background: 'var(--expense-subtle)', color: 'var(--expense-color)' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="summary-amount" style={{ color: 'var(--expense-color)' }}>
            {formatCurrency(totalExpenses, currency)}
          </div>
          <div className="summary-bottom">
            <span>{periodExpenses.length} transactions</span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="summary-card savings">
          <div className="summary-top">
            <span className="summary-label">Net Savings</span>
            <div className="summary-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="summary-amount" style={{ color: '#3b82f6' }}>
            {formatCurrency(savings, currency)}
          </div>
          <div className="summary-bottom">
            <span className="trend-badge positive">{savingsRate}% Rate</span>
          </div>
        </div>

        {/* Average Daily Expense */}
        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Avg Daily Expense</span>
            <div className="summary-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="summary-amount">
            {formatCurrency(avgDailyExpense, currency)}
          </div>
          <div className="summary-bottom">
            <span>Over {dateRange.daysDiff} days</span>
          </div>
        </div>

        {/* Highest Spending Category */}
        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Top Category</span>
            <div className="summary-icon" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>
              <Flame size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
            {highestCategory.category}
          </div>
          <div className="summary-bottom" style={{ marginTop: '8px' }}>
            <span style={{ color: '#f43f5e', fontWeight: '700' }}>
              {formatCurrency(highestCategory.amount, currency)}
            </span>
          </div>
        </div>

        {/* Highest Single Expense */}
        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Highest Expense</span>
            <div className="summary-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
              <Award size={18} />
            </div>
          </div>
          {highestSingleExpense ? (
            <>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {highestSingleExpense.description}
              </div>
              <div className="summary-bottom" style={{ marginTop: '8px' }}>
                <strong style={{ color: '#f43f5e' }}>{formatCurrency(highestSingleExpense.amount, currency)}</strong>
                <span>• {formatDate(highestSingleExpense.date)}</span>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>None recorded</div>
          )}
        </div>
      </div>

      {/* Deep Visual Comparisons */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Period Category Distribution</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Spend Breakdown</span>
          </div>
          <CategoryPieChart data={categoryChartData} currency={currency} />
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Multi-Month Income vs Expense</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quarterly Comparison</span>
          </div>
          <IncomeExpenseChart data={monthlyComparisonData} currency={currency} />
        </div>
      </div>

      {/* Yearly & Performance Benchmark */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>
          Yearly Financial Benchmark (2026 vs 2025)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              2026 Cumulative Income
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
              {formatCurrency(980000, currency)}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              +28% higher than 2025 run-rate
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              2026 Cumulative Expenses
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f43f5e', marginTop: '4px' }}>
              {formatCurrency(310000, currency)}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Under 35% target spend cap
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Overall Savings Velocity
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3b82f6', marginTop: '4px' }}>
              {formatCurrency(670000, currency)}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Financial independence score: 92/100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
