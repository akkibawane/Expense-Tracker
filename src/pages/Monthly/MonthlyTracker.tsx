import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Download,
  Plus,
  Flame,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Clock,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart2,
  Eye,
  Trash2,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { openQuickAdd } from '../../redux/slices/uiSlice';
import { resetMonthExpensesThunk, deleteExpenseThunk } from '../../redux/slices/expenseSlice';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../../utils/constants';

type TrackerViewMode = 'MONTH_WISE' | 'YEAR_WISE';

export const MonthlyTracker: React.FC = () => {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const incomes = useAppSelector((state) => state.income.incomes);
  const currency = useAppSelector((state) => state.ui.currency);

  // View Mode: Month-Wise vs Year-Wise
  const [viewMode, setViewMode] = useState<TrackerViewMode>('MONTH_WISE');

  // Month navigation: default is current month (e.g., 2026-10)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 1-indexed (1 = Jan, 10 = Oct)

  // Search & filter within the month
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Month Reset Modal & Toast states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [monthToReset, setMonthToReset] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formatted month keys
  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  // Previous month key for comparison
  const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Year navigation handlers
  const handlePrevYear = () => setCurrentYear((y) => y - 1);
  const handleNextYear = () => setCurrentYear((y) => y + 1);

  // Days in selected month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // -------------------------------------------------------------
  // 1. MONTH-WISE METRICS & AGGREGATIONS
  // -------------------------------------------------------------
  const monthlyExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(monthKey));
  }, [expenses, monthKey]);

  const monthlyIncomes = useMemo(() => {
    return incomes.filter((i) => i.date.startsWith(monthKey));
  }, [incomes, monthKey]);

  const prevMonthlyExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(prevMonthKey));
  }, [expenses, prevMonthKey]);

  const totalExpense = useMemo(() => {
    return monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthlyExpenses]);

  const totalIncome = useMemo(() => {
    return monthlyIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [monthlyIncomes]);

  const prevTotalExpense = useMemo(() => {
    return prevMonthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [prevMonthlyExpenses]);

  const expenseMoMPct = useMemo(() => {
    if (prevTotalExpense === 0) return 0;
    return Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100);
  }, [totalExpense, prevTotalExpense]);

  const avgDailyExpense = Math.round(totalExpense / daysInMonth);
  const netMonthlySavings = Math.max(0, totalIncome - totalExpense);

  // Day-by-day spending distribution (Day 1 to 31)
  const dailySpendData = useMemo(() => {
    const dailyMap: Record<number, number> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dailyMap[day] = 0;
    }

    monthlyExpenses.forEach((exp) => {
      const expDate = new Date(exp.date);
      const dayNum = expDate.getDate();
      if (dailyMap[dayNum] !== undefined) {
        dailyMap[dayNum] += exp.amount;
      }
    });

    let peakDay = 1;
    let peakAmount = 0;

    const list = Object.entries(dailyMap).map(([d, amt]) => {
      const day = Number(d);
      if (amt > peakAmount) {
        peakAmount = amt;
        peakDay = day;
      }
      return { day, amount: amt };
    });

    return { list, peakDay, peakAmount };
  }, [monthlyExpenses, daysInMonth]);

  // Category breakdown for this month
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    monthlyExpenses.forEach((e) => {
      if (!map[e.category]) map[e.category] = { amount: 0, count: 0 };
      map[e.category].amount += e.amount;
      map[e.category].count += 1;
    });

    return Object.entries(map)
      .map(([category, val]) => ({
        category,
        amount: val.amount,
        count: val.count,
        pct: totalExpense > 0 ? Math.round((val.amount / totalExpense) * 100) : 0,
        color: CATEGORY_COLORS[category] || '#64748b',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyExpenses, totalExpense]);

  // Filtered expense transactions within this month
  const filteredList = useMemo(() => {
    return monthlyExpenses
      .filter((e) => {
        const matchesSearch =
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase()) ||
          (e.subCategory && e.subCategory.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyExpenses, search, categoryFilter]);

  // -------------------------------------------------------------
  // 2. YEAR-WISE METRICS & AGGREGATIONS (12-MONTH TRAJECTORY)
  // -------------------------------------------------------------
  const yearlyData = useMemo(() => {
    const yearStr = String(currentYear);
    const yearExpenses = expenses.filter((e) => e.date.startsWith(yearStr));
    const yearIncomes = incomes.filter((i) => i.date.startsWith(yearStr));

    const totalAnnualExpense = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalAnnualIncome = yearIncomes.reduce((sum, i) => sum + i.amount, 0);
    const annualSavings = Math.max(0, totalAnnualIncome - totalAnnualExpense);

    // 12 Months breakdown
    let peakMonth = 'Jan';
    let peakMonthAmt = 0;
    let lowestMonth = 'Jan';
    let lowestMonthAmt = Infinity;

    const monthlyBreakdown = shortMonthNames.map((mName, idx) => {
      const mNum = String(idx + 1).padStart(2, '0');
      const targetMonthKey = `${yearStr}-${mNum}`;

      const mExpenses = yearExpenses.filter((e) => e.date.startsWith(targetMonthKey));
      const mIncomes = yearIncomes.filter((i) => i.date.startsWith(targetMonthKey));

      const expTotal = mExpenses.reduce((sum, e) => sum + e.amount, 0);
      const incTotal = mIncomes.reduce((sum, i) => sum + i.amount, 0);
      const net = Math.max(0, incTotal - expTotal);

      if (expTotal > peakMonthAmt) {
        peakMonthAmt = expTotal;
        peakMonth = monthNames[idx];
      }
      if (expTotal > 0 && expTotal < lowestMonthAmt) {
        lowestMonthAmt = expTotal;
        lowestMonth = monthNames[idx];
      }

      // Top category in this month
      const catMap: Record<string, number> = {};
      mExpenses.forEach((e) => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });
      const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      return {
        monthIndex: idx + 1,
        monthName: monthNames[idx],
        shortName: mName,
        monthKey: targetMonthKey,
        expensesCount: mExpenses.length,
        expenseTotal: expTotal,
        incomeTotal: incTotal,
        netSavings: net,
        topCategory: topCat,
      };
    });

    const activeMonthsCount = monthlyBreakdown.filter((m) => m.expenseTotal > 0 || m.incomeTotal > 0).length || 1;
    const avgMonthlyExpense = Math.round(totalAnnualExpense / activeMonthsCount);

    return {
      yearStr,
      totalAnnualExpense,
      totalAnnualIncome,
      annualSavings,
      avgMonthlyExpense,
      peakMonth: peakMonthAmt > 0 ? `${peakMonth} (${formatCurrency(peakMonthAmt, currency)})` : 'None',
      lowestMonth: lowestMonthAmt !== Infinity ? `${lowestMonth} (${formatCurrency(lowestMonthAmt, currency)})` : 'None',
      monthlyBreakdown,
      maxBarValue: Math.max(...monthlyBreakdown.map((m) => Math.max(m.expenseTotal, m.incomeTotal)), 1000),
    };
  }, [expenses, incomes, currentYear, currency]);

  // -------------------------------------------------------------
  // 3. MONTH RESET ACTION
  // -------------------------------------------------------------
  const handleOpenResetModal = (targetMonth: string) => {
    setMonthToReset(targetMonth);
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    if (!monthToReset) return;
    await dispatch(resetMonthExpensesThunk(monthToReset));
    setIsResetModalOpen(false);

    const [y, m] = monthToReset.split('-');
    const mName = monthNames[parseInt(m, 10) - 1];
    setToastMessage(`All expenses for ${mName} ${y} were successfully reset!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExportMonthCSV = () => {
    const rows = monthlyExpenses.map((e) => ({
      Month: `${monthNames[currentMonth - 1]} ${currentYear}`,
      Date: e.date,
      Description: e.description,
      Category: e.category,
      SubCategory: e.subCategory || '',
      Amount: e.amount,
      PaymentMethod: e.paymentMethod,
      Notes: e.notes || '',
    }));
    exportToCSV(`MoneyMate_Monthly_Expense_${monthNames[currentMonth - 1]}_${currentYear}`, rows);
  };

  const handleExportYearCSV = () => {
    const rows = yearlyData.monthlyBreakdown.map((m) => ({
      Year: currentYear,
      Month: m.monthName,
      TotalExpense: m.expenseTotal,
      TotalIncome: m.incomeTotal,
      NetSavings: m.netSavings,
      TopCategory: m.topCategory,
      TransactionCount: m.expensesCount,
    }));
    exportToCSV(`MoneyMate_Yearly_Expense_Summary_${currentYear}`, rows);
  };

  return (
    <div className="page-container">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            background: 'var(--bg-elevated)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#10b981',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header & Mode Selector */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pill pill-expense" style={{ fontSize: '0.74rem' }}>
              <CalendarDays size={13} /> Multi-Period Expense Intelligence
            </span>
          </div>
          <h1 className="page-title" style={{ marginTop: '4px' }}>
            {viewMode === 'MONTH_WISE' ? 'Monthly Expense Tracker' : 'Year-Wise Expense Tracker'}
          </h1>
          <p className="page-subtitle">
            {viewMode === 'MONTH_WISE'
              ? 'Analyze daily burn rates, peak spending days, and reset expenses month-by-month'
              : `Comprehensive 12-month annual financial audit and trajectory for ${currentYear}`}
          </p>
        </div>

        {/* View Mode Toggle & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('MONTH_WISE')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                background: viewMode === 'MONTH_WISE' ? 'var(--brand-gradient)' : 'transparent',
                color: viewMode === 'MONTH_WISE' ? 'white' : 'var(--text-muted)',
              }}
            >
              <Calendar size={15} /> Month-Wise
            </button>
            <button
              onClick={() => setViewMode('YEAR_WISE')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                background: viewMode === 'YEAR_WISE' ? 'var(--brand-gradient)' : 'transparent',
                color: viewMode === 'YEAR_WISE' ? 'white' : 'var(--text-muted)',
              }}
            >
              <Layers size={15} /> Year-Wise
            </button>
          </div>

          {/* Navigation Controls */}
          {viewMode === 'MONTH_WISE' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '4px',
              }}
            >
              <button
                onClick={handlePrevMonth}
                className="btn-icon"
                style={{ width: '34px', height: '34px' }}
                title="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>

              <div style={{ padding: '0 16px', fontWeight: '800', fontSize: '1rem', minWidth: '150px', textAlign: 'center' }}>
                {monthNames[currentMonth - 1]} {currentYear}
              </div>

              <button
                onClick={handleNextMonth}
                className="btn-icon"
                style={{ width: '34px', height: '34px' }}
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '4px',
              }}
            >
              <button
                onClick={handlePrevYear}
                className="btn-icon"
                style={{ width: '34px', height: '34px' }}
                title="Previous Year"
              >
                <ChevronLeft size={18} />
              </button>

              <div style={{ padding: '0 20px', fontWeight: '800', fontSize: '1.05rem', minWidth: '100px', textAlign: 'center' }}>
                {currentYear}
              </div>

              <button
                onClick={handleNextYear}
                className="btn-icon"
                style={{ width: '34px', height: '34px' }}
                title="Next Year"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Reset Month Button (Available in Month-Wise view) */}
          {viewMode === 'MONTH_WISE' && (
            <button
              onClick={() => handleOpenResetModal(monthKey)}
              disabled={monthlyExpenses.length === 0}
              className="btn btn-secondary"
              style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#f43f5e' }}
              title="Reset and clear all expenses for this month only"
            >
              <RotateCcw size={15} /> Reset Month's Expenses
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={viewMode === 'MONTH_WISE' ? handleExportMonthCSV : handleExportYearCSV}
            className="btn btn-secondary"
          >
            <Download size={16} /> Export CSV
          </button>

          <button
            onClick={() => dispatch(openQuickAdd('expense'))}
            className="btn btn-expense"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: MONTH-WISE EXPENSE TRACKER                        */}
      {/* ========================================================= */}
      {viewMode === 'MONTH_WISE' && (
        <>
          {/* Monthly Summary KPI Banner */}
          <div className="summary-grid" style={{ marginBottom: '24px' }}>
            {/* Total Monthly Spend */}
            <div className="summary-card expense">
              <div className="summary-top">
                <span className="summary-label">Total Monthly Outflow</span>
                <div className="summary-icon" style={{ background: 'var(--expense-subtle)', color: 'var(--expense-color)' }}>
                  <ArrowDownRight size={18} />
                </div>
              </div>
              <div className="summary-amount" style={{ color: 'var(--expense-color)' }}>
                {formatCurrency(totalExpense, currency)}
              </div>
              <div className="summary-bottom">
                {expenseMoMPct !== 0 ? (
                  <span className={`trend-badge ${expenseMoMPct < 0 ? 'positive' : 'negative'}`}>
                    {expenseMoMPct < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {expenseMoMPct > 0 ? `+${expenseMoMPct}%` : `${expenseMoMPct}%`}
                  </span>
                ) : (
                  <span className="trend-badge positive">Stable</span>
                )}
                <span>vs previous month</span>
              </div>
            </div>

            {/* Average Daily Spend */}
            <div className="summary-card">
              <div className="summary-top">
                <span className="summary-label">Average Daily Expense</span>
                <div className="summary-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div className="summary-amount">
                {formatCurrency(avgDailyExpense, currency)}
              </div>
              <div className="summary-bottom">
                <span>Across all {daysInMonth} calendar days</span>
              </div>
            </div>

            {/* Peak Spending Day */}
            <div className="summary-card">
              <div className="summary-top">
                <span className="summary-label">Peak Spending Day</span>
                <div className="summary-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  <Flame size={18} />
                </div>
              </div>
              <div className="summary-amount" style={{ fontSize: '1.5rem' }}>
                {dailySpendData.peakAmount > 0 ? (
                  `Day ${dailySpendData.peakDay} (${formatCurrency(dailySpendData.peakAmount, currency)})`
                ) : (
                  'No spend'
                )}
              </div>
              <div className="summary-bottom">
                <span>Highest single-day expenditure</span>
              </div>
            </div>

            {/* Net Monthly Balance */}
            <div className="summary-card income">
              <div className="summary-top">
                <span className="summary-label">Monthly Net Savings</span>
                <div className="summary-icon" style={{ background: 'var(--income-subtle)', color: 'var(--income-color)' }}>
                  <Wallet size={18} />
                </div>
              </div>
              <div className="summary-amount" style={{ color: netMonthlySavings >= 0 ? '#10b981' : '#f43f5e' }}>
                {formatCurrency(netMonthlySavings, currency)}
              </div>
              <div className="summary-bottom">
                <span>Income: {formatCurrency(totalIncome, currency)}</span>
              </div>
            </div>
          </div>

          {/* Daily Expense Distribution Bar Calendar */}
          <div className="card" style={{ marginBottom: '24px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  Daily Spending Timeline – {monthNames[currentMonth - 1]} {currentYear}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Inspect daily expense spikes and quiet spending days
                </p>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Showing 1-{daysInMonth} Days
              </div>
            </div>

            {/* Daily Bars */}
            <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '10px', overflowX: 'auto' }}>
              {dailySpendData.list.map((item) => {
                const heightPct = dailySpendData.peakAmount > 0
                  ? Math.max(6, (item.amount / dailySpendData.peakAmount) * 100)
                  : 6;
                const isPeak = item.day === dailySpendData.peakDay && item.amount > 0;

                return (
                  <div
                    key={item.day}
                    title={`Day ${item.day}: ${formatCurrency(item.amount, currency)}`}
                    style={{
                      flex: 1,
                      minWidth: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        borderRadius: '4px 4px 0 0',
                        background: isPeak
                          ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'
                          : item.amount > 0
                          ? 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)'
                          : 'var(--border-subtle)',
                        transition: 'all 0.2s',
                      }}
                    />
                    <span style={{ fontSize: '0.68rem', color: isPeak ? '#ef4444' : 'var(--text-dim)', marginTop: '4px', fontWeight: isPeak ? '700' : '500' }}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown & Monthly Expense Table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
            {/* Category Breakdown for this month */}
            <div className="card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
                Category Outflow ({categoryBreakdown.length} Categories)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {categoryBreakdown.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                    No expenses recorded in {monthNames[currentMonth - 1]} {currentYear}.
                  </div>
                ) : (
                  categoryBreakdown.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: cat.color }} />
                          <span style={{ fontWeight: '600' }}>{cat.category}</span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>({cat.count} txns)</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(cat.amount, currency)}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
                            {cat.pct}%
                          </span>
                        </div>
                      </div>

                      <div className="budget-progress-track" style={{ height: '7px', margin: 0 }}>
                        <div
                          className="budget-progress-fill"
                          style={{ width: `${cat.pct}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expenses List for this Month */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  Expenses in {monthNames[currentMonth - 1]} ({filteredList.length})
                </h2>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', width: '130px' }}
                  />

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-select"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  >
                    <option value="ALL">All</option>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {filteredList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    No expenses recorded in {monthNames[currentMonth - 1]} {currentYear}.
                  </div>
                ) : (
                  filteredList.map((exp) => (
                    <div
                      key={exp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          {exp.description}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {exp.category} • {formatDate(exp.date)} • {exp.paymentMethod}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', fontSize: '0.94rem', color: '#f43f5e' }}>
                            - {formatCurrency(exp.amount, currency)}
                          </div>
                          {exp.subCategory && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              {exp.subCategory}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => dispatch(deleteExpenseThunk(exp.id))}
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', color: '#f43f5e' }}
                          title="Delete expense"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: YEAR-WISE EXPENSE TRACKER                         */}
      {/* ========================================================= */}
      {viewMode === 'YEAR_WISE' && (
        <>
          {/* Annual KPI Cards */}
          <div className="summary-grid" style={{ marginBottom: '24px' }}>
            <div className="summary-card expense">
              <div className="summary-top">
                <span className="summary-label">Total Annual Outflow</span>
                <div className="summary-icon" style={{ background: 'var(--expense-subtle)', color: 'var(--expense-color)' }}>
                  <ArrowDownRight size={18} />
                </div>
              </div>
              <div className="summary-amount" style={{ color: 'var(--expense-color)' }}>
                {formatCurrency(yearlyData.totalAnnualExpense, currency)}
              </div>
              <div className="summary-bottom">
                <span>In full year {currentYear}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-top">
                <span className="summary-label">Monthly Average Burn</span>
                <div className="summary-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <BarChart2 size={18} />
                </div>
              </div>
              <div className="summary-amount">
                {formatCurrency(yearlyData.avgMonthlyExpense, currency)}
              </div>
              <div className="summary-bottom">
                <span>Per active calendar month</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-top">
                <span className="summary-label">Peak Spending Month</span>
                <div className="summary-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  <Flame size={18} />
                </div>
              </div>
              <div className="summary-amount" style={{ fontSize: '1.35rem' }}>
                {yearlyData.peakMonth}
              </div>
              <div className="summary-bottom">
                <span>Highest annual outflow</span>
              </div>
            </div>

            <div className="summary-card income">
              <div className="summary-top">
                <span className="summary-label">Annual Net Savings</span>
                <div className="summary-icon" style={{ background: 'var(--income-subtle)', color: 'var(--income-color)' }}>
                  <Wallet size={18} />
                </div>
              </div>
              <div className="summary-amount" style={{ color: yearlyData.annualSavings >= 0 ? '#10b981' : '#f43f5e' }}>
                {formatCurrency(yearlyData.annualSavings, currency)}
              </div>
              <div className="summary-bottom">
                <span>Annual Inflow: {formatCurrency(yearlyData.totalAnnualIncome, currency)}</span>
              </div>
            </div>
          </div>

          {/* 12-Month Annual Bar Chart */}
          <div className="card" style={{ marginBottom: '24px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  12-Month Annual Trajectory – Year {currentYear}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Compare month-by-month expenses (red) vs income (green)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f43f5e' }} />
                  Expense
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} />
                  Income
                </span>
              </div>
            </div>

            <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '10px' }}>
              {yearlyData.monthlyBreakdown.map((m) => {
                const expHeight = (m.expenseTotal / yearlyData.maxBarValue) * 100;
                const incHeight = (m.incomeTotal / yearlyData.maxBarValue) * 100;

                return (
                  <div
                    key={m.shortName}
                    title={`${m.monthName}: Expense ${formatCurrency(m.expenseTotal, currency)} | Income ${formatCurrency(m.incomeTotal, currency)}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setCurrentMonth(m.monthIndex);
                      setViewMode('MONTH_WISE');
                    }}
                  >
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', width: '100%', height: '140px', justifyContent: 'center' }}>
                      {/* Expense bar */}
                      <div
                        style={{
                          width: '45%',
                          maxWidth: '18px',
                          height: `${Math.max(4, expHeight)}%`,
                          background: m.expenseTotal > 0 ? '#f43f5e' : 'var(--border-subtle)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                      {/* Income bar */}
                      <div
                        style={{
                          width: '45%',
                          maxWidth: '18px',
                          height: `${Math.max(4, incHeight)}%`,
                          background: m.incomeTotal > 0 ? '#10b981' : 'var(--border-subtle)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                    </div>

                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '600' }}>
                      {m.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 12-Month Detailed Annual Table */}
          <div className="table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Transactions</th>
                  <th>Top Category</th>
                  <th style={{ textAlign: 'right' }}>Total Expense</th>
                  <th style={{ textAlign: 'right' }}>Total Income</th>
                  <th style={{ textAlign: 'right' }}>Net Savings</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.monthlyBreakdown.map((m) => (
                  <tr key={m.monthKey}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{m.monthName} {currentYear}</div>
                    </td>
                    <td>
                      <span className="pill pill-method">{m.expensesCount} records</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{m.topCategory}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: m.expenseTotal > 0 ? '#f43f5e' : 'var(--text-muted)' }}>
                      - {formatCurrency(m.expenseTotal, currency)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: m.incomeTotal > 0 ? '#10b981' : 'var(--text-muted)' }}>
                      + {formatCurrency(m.incomeTotal, currency)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: m.netSavings >= 0 ? '#10b981' : '#f43f5e' }}>
                      {formatCurrency(m.netSavings, currency)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setCurrentMonth(m.monthIndex);
                            setViewMode('MONTH_WISE');
                          }}
                          className="btn-icon"
                          style={{ width: '30px', height: '30px' }}
                          title="Open month-wise tracker"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleOpenResetModal(m.monthKey)}
                          disabled={m.expenseTotal === 0}
                          className="btn-icon"
                          style={{ width: '30px', height: '30px', color: m.expenseTotal > 0 ? '#f43f5e' : 'var(--text-dim)' }}
                          title="Reset this month's expenses"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* RESET MONTH EXPENSES CONFIRMATION MODAL                   */}
      {/* ========================================================= */}
      {isResetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsResetModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', padding: '24px' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', textAlign: 'center', marginBottom: '8px' }}>
              Reset Month's Expenses?
            </h3>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '18px', lineHeight: 1.45 }}>
              Are you sure you want to reset all expenses for <strong>{monthToReset}</strong>?
              <br />
              This will permanently delete all expense records for this month. <strong>All other months and income will remain untouched.</strong>
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="btn btn-secondary"
                style={{ minWidth: '100px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="btn btn-danger"
                style={{ minWidth: '140px' }}
              >
                Yes, Reset Month
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTracker;
