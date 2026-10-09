import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Repeat,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchExpenses, fetchRecurringThunk } from '../../redux/slices/expenseSlice';
import { fetchIncomes } from '../../redux/slices/incomeSlice';
import { fetchBudgets } from '../../redux/slices/budgetSlice';
import { openQuickAdd } from '../../redux/slices/uiSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IncomeExpenseChart } from '../../components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { WeeklyTrendChart } from '../../components/charts/WeeklyTrendChart';
import { SavingsTrendChart } from '../../components/charts/SavingsTrendChart';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const incomes = useAppSelector((state) => state.income.incomes);
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const recurring = useAppSelector((state) => state.expenses.recurringExpenses);
  const currency = useAppSelector((state) => state.ui.currency);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchIncomes());
    dispatch(fetchBudgets());
    dispatch(fetchRecurringThunk());
  }, [dispatch]);

  // Current month key: e.g. "2026-10"
  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalIncome = Math.max(0, incomes.reduce((sum, item) => sum + (item.amount || 0), 0));
    const totalExpense = Math.max(0, expenses.reduce((sum, item) => sum + (item.amount || 0), 0));
    const totalBalance = Math.max(0, totalIncome - totalExpense);
    const savings = Math.max(0, totalBalance);

    const currentMonthExpenses = Math.max(
      0,
      expenses
        .filter((e) => e.date.startsWith(currentMonthKey))
        .reduce((sum, e) => sum + (e.amount || 0), 0)
    );

    const currentMonthIncomes = Math.max(
      0,
      incomes
        .filter((i) => i.date.startsWith(currentMonthKey))
        .reduce((sum, i) => sum + (i.amount || 0), 0)
    );

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      currentMonthExpenses,
      currentMonthIncomes,
      savings,
    };
  }, [expenses, incomes, currentMonthKey]);

  // Aggregate monthly data for Income vs Expense & Savings Trend
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { income: number; expense: number; month: string }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Collect distinct months from transactions
    [...incomes, ...expenses].forEach((item) => {
      const d = new Date(item.date);
      if (isNaN(d.getTime())) return;
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      if (!monthsMap[key]) {
        monthsMap[key] = { month: key, income: 0, expense: 0 };
      }
    });

    incomes.forEach((inc) => {
      const d = new Date(inc.date);
      if (isNaN(d.getTime())) return;
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      if (monthsMap[key]) monthsMap[key].income += inc.amount;
    });

    expenses.forEach((exp) => {
      const d = new Date(exp.date);
      if (isNaN(d.getTime())) return;
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      if (monthsMap[key]) monthsMap[key].expense += exp.amount;
    });

    // If no transactions exist, return current/past 4 months with 0 values
    if (Object.keys(monthsMap).length === 0) {
      const now = new Date();
      const list = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
        list.push({ month: key, income: 0, expense: 0, savings: 0 });
      }
      return list;
    }

    return Object.values(monthsMap).map((m) => ({
      ...m,
      savings: Math.max(0, m.income - m.expense),
    }));
  }, [incomes, expenses]);

  // Aggregate Category Breakdown for Donut Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [expenses]);

  // Weekly Trend: 7 Days of current week (computed from actual expenses)
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const map: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (d >= oneWeekAgo && d <= now) {
        const dayIndex = (d.getDay() + 6) % 7; // Monday = 0
        const dayName = days[dayIndex];
        map[dayName] = (map[dayName] || 0) + e.amount;
      }
    });

    return days.map((day) => ({ day, amount: map[day] }));
  }, [expenses]);

  // Recent 5 Unified Transactions
  const recentTransactions = useMemo(() => {
    const combined = [
      ...incomes.map((i) => ({
        id: `inc-${i.id}`,
        type: 'INCOME' as const,
        title: i.description,
        category: i.source,
        amount: i.amount,
        date: i.date,
        method: 'Direct Deposit',
      })),
      ...expenses.map((e) => ({
        id: `exp-${e.id}`,
        type: 'EXPENSE' as const,
        title: e.description,
        category: e.category,
        amount: e.amount,
        date: e.date,
        method: e.paymentMethod,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return combined.slice(0, 5);
  }, [incomes, expenses]);

  // Upcoming recurring payment in next 7 days
  const upcomingRecurring = useMemo(() => {
    return recurring.find((r) => r.active);
  }, [recurring]);

  return (
    <div className="page-container">
      {/* Top Welcome & Quick Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Overview</h1>
          <p className="page-subtitle">
            Welcome back, {user?.fullName || 'Akshay'} • Track your money in real time
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => dispatch(openQuickAdd('income'))}
            className="btn btn-income"
          >
            <Plus size={16} /> Add Income
          </button>
          <button
            onClick={() => dispatch(openQuickAdd('expense'))}
            className="btn btn-expense"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Upcoming Recurring Banner if any */}
      {upcomingRecurring && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06))',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(99,102,241,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Repeat size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>
                Upcoming Recurring Bill: {upcomingRecurring.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {formatCurrency(upcomingRecurring.amount, currency)} due on{' '}
                {formatDate(upcomingRecurring.nextPaymentDate)} via {upcomingRecurring.paymentMethod}
              </div>
            </div>
          </div>

          <Link
            to="/recurring"
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            View Subscriptions <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="summary-grid">
        {/* Total Balance */}
        <div className="summary-card balance">
          <div className="summary-top">
            <span className="summary-label">Total Balance</span>
            <div className="summary-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className="summary-amount">{formatCurrency(metrics.totalBalance, currency)}</div>
          <div className="summary-bottom">
            <span className="trend-badge positive">
              <TrendingUp size={12} /> {metrics.totalBalance === 0 ? '₹0 Starting' : '+0%'}
            </span>
            <span>{metrics.totalBalance === 0 ? 'Starting balance' : 'Live balance'}</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="summary-card income">
          <div className="summary-top">
            <span className="summary-label">Total Income</span>
            <div className="summary-icon" style={{ background: 'var(--income-subtle)', color: 'var(--income-color)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="summary-amount" style={{ color: 'var(--income-color)' }}>
            {formatCurrency(metrics.totalIncome, currency)}
          </div>
          <div className="summary-bottom">
            <span style={{ color: 'var(--text-muted)' }}>
              {incomes.length > 0 ? `${incomes.length} Inflow transactions` : '0 Inflow transactions'}
            </span>
          </div>
        </div>

        {/* Total Expense */}
        <div className="summary-card expense">
          <div className="summary-top">
            <span className="summary-label">Total Expense</span>
            <div className="summary-icon" style={{ background: 'var(--expense-subtle)', color: 'var(--expense-color)' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="summary-amount" style={{ color: 'var(--expense-color)' }}>
            {formatCurrency(metrics.totalExpense, currency)}
          </div>
          <div className="summary-bottom">
            <span style={{ color: 'var(--text-muted)' }}>
              {expenses.length > 0 ? `${expenses.length} Outflow transactions` : '0 Outflow transactions'}
            </span>
          </div>
        </div>

        {/* Current Month Expense */}
        <Link to="/monthly" className="summary-card month-expense" style={{ textDecoration: 'none' }}>
          <div className="summary-top">
            <span className="summary-label">Month Expense</span>
            <div className="summary-icon" style={{ background: 'var(--warning-subtle)', color: 'var(--warning-color)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="summary-amount">
            {formatCurrency(metrics.currentMonthExpenses, currency)}
          </div>
          <div className="summary-bottom" style={{ justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>This Month</span>
            <span style={{ color: '#818cf8', fontWeight: '700', fontSize: '0.78rem' }}>
              Track Month →
            </span>
          </div>
        </Link>

        {/* Savings */}
        <div className="summary-card savings">
          <div className="summary-top">
            <span className="summary-label">Net Savings</span>
            <div className="summary-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="summary-amount" style={{ color: '#3b82f6' }}>
            {formatCurrency(metrics.savings, currency)}
          </div>
          <div className="summary-bottom">
            <span className="trend-badge positive">
              {metrics.totalIncome > 0 ? `${Math.round((metrics.savings / metrics.totalIncome) * 100)}% Savings Rate` : '0% Savings Rate'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Interactive Charts Grid */}
      <div className="charts-grid">
        {/* Chart 1: Monthly Income vs Expense */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Income vs Expense</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monthly Comparison</span>
          </div>
          <IncomeExpenseChart data={monthlyData} currency={currency} />
        </div>

        {/* Chart 2: Expense by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Expense by Category</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Distribution</span>
          </div>
          <CategoryPieChart data={categoryData} currency={currency} />
        </div>

        {/* Chart 3: Weekly Expense Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Weekly Expense Trend</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Daily Outflow</span>
          </div>
          <WeeklyTrendChart data={weeklyData} currency={currency} />
        </div>

        {/* Chart 4: Savings Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Savings Trajectory</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cumulative Growth</span>
          </div>
          <SavingsTrendChart data={monthlyData} currency={currency} />
        </div>
      </div>

      {/* Recent Transactions & Budget Overview Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Recent Transactions Table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Recent Transactions</h3>
            <Link to="/transactions" style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: '600' }}>
              View All →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: 'var(--bg-elevated)',
                borderRadius: '12px',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Plus size={22} />
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>
                No Transactions Yet
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Start tracking by adding your first income or expense entry
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => dispatch(openQuickAdd('income'))}
                  className="btn btn-income"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  + Add Income
                </button>
                <button
                  onClick={() => dispatch(openQuickAdd('expense'))}
                  className="btn btn-expense"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  + Add Expense
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: tx.type === 'INCOME' ? 'var(--income-subtle)' : 'var(--expense-subtle)',
                        color: tx.type === 'INCOME' ? 'var(--income-color)' : 'var(--expense-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                      }}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{tx.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {tx.category} • {formatDate(tx.date)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: '800',
                        fontSize: '0.92rem',
                        color: tx.type === 'INCOME' ? 'var(--income-color)' : 'var(--expense-color)',
                      }}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{tx.method}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Health Preview */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Budget Utilization</h3>
            <Link to="/budget" style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: '600' }}>
              Manage Budgets →
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: 'var(--bg-elevated)',
                borderRadius: '12px',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>
                No Budgets Configured
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Set category limits to monitor spending targets and avoid overspending
              </p>
              <Link
                to="/budget"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'inline-flex' }}
              >
                Create First Budget
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {budgets.slice(0, 4).map((b) => {
                const spent = expenses
                  .filter((e) => e.category === b.category && e.date.startsWith(currentMonthKey))
                  .reduce((sum, e) => sum + e.amount, 0);
                const pct = Math.round((spent / b.monthlyLimit) * 100);
                const isWarning = pct >= 80 && pct < 100;
                const isExceeded = pct >= 100;

                return (
                  <div key={b.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{b.category}</span>
                        {isExceeded && (
                          <span className="pill pill-expense" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                            Exceeded!
                          </span>
                        )}
                        {isWarning && (
                          <span className="pill" style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'var(--warning-subtle)', color: 'var(--warning-color)' }}>
                            80% Alert
                          </span>
                        )}
                      </div>
                      <span>
                        {formatCurrency(spent, currency)} / {formatCurrency(b.monthlyLimit, currency)} ({pct}%)
                      </span>
                    </div>

                    <div className="budget-progress-track">
                      <div
                        className={`budget-progress-fill ${isExceeded ? 'exceeded' : isWarning ? 'warning' : 'safe'}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
