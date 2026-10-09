import React, { useState, useMemo } from 'react';
import {
  Plus,
  PieChart,
  AlertTriangle,
  CheckCircle,
  X,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  addBudgetThunk,
  updateBudgetThunk,
  deleteBudgetThunk,
} from '../../redux/slices/budgetSlice';
import { Budget, ExpenseCategory } from '../../types';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export const BudgetPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const currency = useAppSelector((state) => state.ui.currency);
  const user = useAppSelector((state) => state.auth.user);

  // Month selector (defaults to current month)
  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Food');
  const [formLimit, setFormLimit] = useState('0');

  // Calculate spent per category for the selected month
  const categorySpentMap = useMemo(() => {
    const map: Record<string, number> = {};
    expenses
      .filter((e) => e.date.startsWith(selectedMonth))
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    return map;
  }, [expenses, selectedMonth]);

  // Aggregate stats
  const totalBudgeted = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  }, [budgets]);

  const totalSpentInBudgeted = useMemo(() => {
    return budgets.reduce((sum, b) => {
      const spent = categorySpentMap[b.category] || 0;
      return sum + spent;
    }, 0);
  }, [budgets, categorySpentMap]);

  const overallPct = totalBudgeted > 0 ? Math.round((totalSpentInBudgeted / totalBudgeted) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setFormCategory('Food');
    setFormLimit('0');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormCategory(b.category);
    setFormLimit(String(b.monthlyLimit));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = Math.max(0, parseFloat(formLimit) || 0);
    if (!limitNum || limitNum <= 0) return;

    if (editingBudget) {
      await dispatch(
        updateBudgetThunk({
          id: editingBudget.id,
          updates: {
            category: formCategory,
            monthlyLimit: limitNum,
          },
        })
      );
    } else {
      await dispatch(
        addBudgetThunk({
          category: formCategory,
          monthlyLimit: limitNum,
          month: selectedMonth,
          userId: user?.id || 'user-001',
        })
      );
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteBudgetThunk(id));
    setDeletingId(null);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Management</h1>
          <p className="page-subtitle">
            Set smart spending targets, monitor threshold warnings (80%), and avoid overspending
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.86rem' }}
          />

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Create Budget
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="summary-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Total Budgeted
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px' }}>
            {formatCurrency(totalBudgeted, currency)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Allocated across {budgets.length} categories
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Total Spent
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: totalSpentInBudgeted > totalBudgeted ? '#ef4444' : 'var(--text-main)' }}>
            {formatCurrency(totalSpentInBudgeted, currency)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {overallPct}% of monthly allowance
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Remaining Buffer
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: totalBudgeted - totalSpentInBudgeted >= 0 ? '#10b981' : '#f43f5e' }}>
            {formatCurrency(Math.max(0, totalBudgeted - totalSpentInBudgeted), currency)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalBudgeted - totalSpentInBudgeted >= 0 ? 'Within budget goal' : 'Over budget by ' + formatCurrency(Math.abs(totalBudgeted - totalSpentInBudgeted), currency)}
          </div>
        </div>
      </div>

      {/* Budgets List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
        {budgets.map((b) => {
          const spent = categorySpentMap[b.category] || 0;
          const ratio = b.monthlyLimit > 0 ? spent / b.monthlyLimit : 0;
          const pct = Math.round(ratio * 100);
          const isWarning = pct >= 80 && pct < 100;
          const isExceeded = pct >= 100;

          return (
            <div
              key={b.id}
              className="card"
              style={{
                borderColor: isExceeded
                  ? 'rgba(239, 68, 68, 0.45)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.45)'
                  : undefined,
                boxShadow: isExceeded ? '0 0 20px rgba(239, 68, 68, 0.15)' : undefined,
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>{b.category}</span>
                  {isExceeded && (
                    <span className="pill pill-expense" style={{ fontSize: '0.7rem' }}>
                      <AlertTriangle size={12} /> Exceeded ({pct}%)
                    </span>
                  )}
                  {isWarning && (
                    <span className="pill" style={{ fontSize: '0.7rem', background: 'var(--warning-subtle)', color: 'var(--warning-color)', border: '1px solid var(--warning-border)' }}>
                      <AlertTriangle size={12} /> 80% Warning
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px' }}
                    title="Edit budget"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeletingId(b.id)}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px', color: '#f43f5e' }}
                    title="Delete budget"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Amount Progress */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                  {formatCurrency(spent, currency)}{' '}
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    / {formatCurrency(b.monthlyLimit, currency)}
                  </span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: isExceeded ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981' }}>
                  {pct}%
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="budget-progress-track">
                <div
                  className={`budget-progress-fill ${isExceeded ? 'exceeded' : isWarning ? 'warning' : 'safe'}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              {/* Status Note */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <span>
                  {b.monthlyLimit - spent >= 0
                    ? `${formatCurrency(b.monthlyLimit - spent, currency)} left to spend`
                    : `Exceeded by ${formatCurrency(spent - b.monthlyLimit, currency)}`}
                </span>
                <span>{selectedMonth}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingBudget ? 'Edit Budget Limit' : 'Set Category Budget'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="form-select"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Limit ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="0"
                    value={formLimit}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+') {
                        e.preventDefault();
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') setFormLimit('');
                    }}
                    onBlur={(e) => {
                      if (e.target.value.trim() === '' || parseFloat(e.target.value) < 0) {
                        setFormLimit('0');
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormLimit('');
                        return;
                      }
                      const num = parseFloat(val);
                      if (!isNaN(num) && num < 0) {
                        setFormLimit('0');
                      } else {
                        setFormLimit(val);
                      }
                    }}
                    className="form-input"
                    style={{ fontSize: '1.4rem', fontWeight: '800' }}
                    autoFocus
                  />
                  <div className="quick-amount-pills">
                    {[2000, 3000, 5000, 10000, 20000].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormLimit(String(val))}
                        className="amount-pill"
                      >
                        {formatCurrency(val, currency)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '10px', borderRadius: '8px' }}>
                  💡 An alert will automatically fire when spending reaches <strong>80%</strong>, and an urgent alert when reaching <strong>100%</strong>.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBudget ? 'Update Limit' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Delete Budget?</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Are you sure you want to remove this category budget cap?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleDelete(deletingId)} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
