import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Eye,
  ArrowUpDown,
  X,
  CreditCard,
  Calendar,
  Tag,
  FileText,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  addExpenseThunk,
  updateExpenseThunk,
  deleteExpenseThunk,
} from '../../redux/slices/expenseSlice';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency, formatDate, exportToCSV, exportToJSON } from '../../utils/formatters';

export const Expenses: React.FC = () => {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const currency = useAppSelector((state) => state.ui.currency);
  const user = useAppSelector((state) => state.auth.user);

  // Search, filter, and sort states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formAmount, setFormAmount] = useState('0');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Food');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('UPI');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormAmount('0');
    setFormCategory('Food');
    setFormSubCategory('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMethod('UPI');
    setFormDescription('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setFormAmount(String(exp.amount));
    setFormCategory(exp.category);
    setFormSubCategory(exp.subCategory || '');
    setFormDate(exp.date);
    setFormMethod(exp.paymentMethod);
    setFormDescription(exp.description);
    setFormNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.max(0, parseFloat(formAmount) || 0);
    if (!amountNum || amountNum <= 0) return;

    if (editingExpense) {
      await dispatch(
        updateExpenseThunk({
          id: editingExpense.id,
          updates: {
            amount: amountNum,
            category: formCategory,
            subCategory: formSubCategory.trim() || undefined,
            date: formDate,
            paymentMethod: formMethod,
            description: formDescription.trim() || `${formCategory} Expense`,
            notes: formNotes.trim() || undefined,
          },
        })
      );
    } else {
      await dispatch(
        addExpenseThunk({
          amount: amountNum,
          category: formCategory,
          subCategory: formSubCategory.trim() || undefined,
          date: formDate,
          paymentMethod: formMethod,
          description: formDescription.trim() || `${formCategory} Expense`,
          notes: formNotes.trim() || undefined,
          userId: user?.id || 'user-001',
        })
      );
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteExpenseThunk(id));
    setDeletingId(null);
    if (viewingExpense?.id === id) setViewingExpense(null);
  };

  // Filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Search
        const matchesSearch =
          exp.description.toLowerCase().includes(search.toLowerCase()) ||
          exp.category.toLowerCase().includes(search.toLowerCase()) ||
          (exp.subCategory && exp.subCategory.toLowerCase().includes(search.toLowerCase())) ||
          (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()));

        // Category
        const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;

        // Payment Method
        const matchesMethod = selectedMethod === 'ALL' || exp.paymentMethod === selectedMethod;

        // Date range
        const matchesStartDate = !startDate || exp.date >= startDate;
        const matchesEndDate = !endDate || exp.date <= endDate;

        return matchesSearch && matchesCategory && matchesMethod && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, search, selectedCategory, selectedMethod, startDate, endDate, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleExportCSV = () => {
    const rows = filteredExpenses.map((e) => ({
      ID: e.id,
      Date: e.date,
      Description: e.description,
      Category: e.category,
      SubCategory: e.subCategory || '',
      Amount: e.amount,
      PaymentMethod: e.paymentMethod,
      Notes: e.notes || '',
    }));
    exportToCSV(`MoneyMate_Expenses_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">
            Track, filter, categorize, and control your daily expenditures
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handleOpenAdd} className="btn btn-expense">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '22px', padding: '18px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%', fontSize: '0.86rem' }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.86rem' }}
          >
            <option value="ALL">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.86rem' }}
          >
            <option value="ALL">All Payment Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <input
            type="date"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.86rem' }}
          />

          {/* End Date */}
          <input
            type="date"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.86rem' }}
          />

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="form-select"
            style={{ fontSize: '0.86rem' }}
          >
            <option value="date_desc">Date (Newest First)</option>
            <option value="date_asc">Date (Oldest First)</option>
            <option value="amount_desc">Amount (Highest First)</option>
            <option value="amount_asc">Amount (Lowest First)</option>
          </select>
        </div>

        {/* Filter Summary & Reset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            Showing <strong>{filteredExpenses.length}</strong> expenses • Total:{' '}
            <strong style={{ color: '#f43f5e' }}>{formatCurrency(totalFilteredAmount, currency)}</strong>
          </div>
          {(search || selectedCategory !== 'ALL' || selectedMethod !== 'ALL' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
                setSelectedMethod('ALL');
                setStartDate('');
                setEndDate('');
              }}
              style={{ color: '#818cf8', fontWeight: '600' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Sub-Category</th>
              <th>Payment Method</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No expenses match your filters.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: '600' }}>{formatDate(exp.date)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{exp.description}</div>
                    {exp.notes && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {exp.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="pill pill-expense">{exp.category}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {exp.subCategory || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="pill pill-method">{exp.paymentMethod}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#f43f5e' }}>
                    - {formatCurrency(exp.amount, currency)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => setViewingExpense(exp)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title="Edit expense"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingId(exp.id)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px', color: '#f43f5e' }}
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div className="form-group">
                  <label className="form-label">Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="0"
                    value={formAmount}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+') {
                        e.preventDefault();
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') setFormAmount('');
                    }}
                    onBlur={(e) => {
                      if (e.target.value.trim() === '' || parseFloat(e.target.value) < 0) {
                        setFormAmount('0');
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormAmount('');
                        return;
                      }
                      const num = parseFloat(val);
                      if (!isNaN(num) && num < 0) {
                        setFormAmount('0');
                      } else {
                        setFormAmount(val);
                      }
                    }}
                    className="form-input"
                    style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f43f5e' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                    <label className="form-label">Sub-Category</label>
                    <input
                      type="text"
                      placeholder={formCategory === 'Investment' ? 'e.g. Mutual Funds, SIP, Stocks, Gold' : 'e.g. Cinema, Fuel'}
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      className="form-input"
                    />
                    {formCategory === 'Investment' && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {['Mutual Funds SIP', 'Stocks / Equity', 'Fixed Deposit', 'Gold / SGB', 'PPF', 'Crypto'].map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setFormSubCategory(sub)}
                            className="amount-pill"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: '6px' }}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      value={formMethod}
                      onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                      className="form-select"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="What did you spend on?"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes & Remarks (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Invoice ID, store location, additional details..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-expense">
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Detail Modal */}
      {viewingExpense && (
        <div className="modal-overlay" onClick={() => setViewingExpense(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Expense Details</h3>
              <button onClick={() => setViewingExpense(null)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {viewingExpense.category}
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#f43f5e', marginTop: '4px' }}>
                  - {formatCurrency(viewingExpense.amount, currency)}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginTop: '4px' }}>
                  {viewingExpense.description}
                </div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                  <strong>{formatDate(viewingExpense.date)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <strong>{viewingExpense.paymentMethod}</strong>
                </div>
                {viewingExpense.subCategory && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sub-Category:</span>
                    <strong>{viewingExpense.subCategory}</strong>
                  </div>
                )}
                {viewingExpense.notes && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Notes:</span>
                    <p style={{ marginTop: '4px', color: 'var(--text-main)' }}>{viewingExpense.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  const exp = viewingExpense;
                  setViewingExpense(null);
                  handleOpenEdit(exp);
                }}
                className="btn btn-secondary"
              >
                <Edit2 size={15} /> Edit
              </button>
              <button onClick={() => setViewingExpense(null)} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Delete Expense?</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Are you sure you want to permanently remove this expense record?
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

export default Expenses;
