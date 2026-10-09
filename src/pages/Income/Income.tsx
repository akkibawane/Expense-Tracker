import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Eye,
  X,
  TrendingUp,
  Building2,
  Briefcase,
  Laptop,
  Award,
  Coins,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  addIncomeThunk,
  updateIncomeThunk,
  deleteIncomeThunk,
} from '../../redux/slices/incomeSlice';
import { Income, IncomeSource } from '../../types';
import { INCOME_SOURCES } from '../../utils/constants';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';

export const IncomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const incomes = useAppSelector((state) => state.income.incomes);
  const currency = useAppSelector((state) => state.ui.currency);
  const user = useAppSelector((state) => state.auth.user);

  // Filter and Search states
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [viewingIncome, setViewingIncome] = useState<Income | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formAmount, setFormAmount] = useState('0');
  const [formSource, setFormSource] = useState<IncomeSource>('Salary');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingIncome(null);
    setFormAmount('0');
    setFormSource('Salary');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inc: Income) => {
    setEditingIncome(inc);
    setFormAmount(String(inc.amount));
    setFormSource(inc.source);
    setFormDate(inc.date);
    setFormDescription(inc.description);
    setFormNotes(inc.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.max(0, parseFloat(formAmount) || 0);
    if (!amountNum || amountNum <= 0) return;

    if (editingIncome) {
      await dispatch(
        updateIncomeThunk({
          id: editingIncome.id,
          updates: {
            amount: amountNum,
            source: formSource,
            date: formDate,
            description: formDescription.trim() || `${formSource} Income`,
            notes: formNotes.trim() || undefined,
          },
        })
      );
    } else {
      await dispatch(
        addIncomeThunk({
          amount: amountNum,
          source: formSource,
          date: formDate,
          description: formDescription.trim() || `${formSource} Income`,
          notes: formNotes.trim() || undefined,
          userId: user?.id || 'user-001',
        })
      );
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteIncomeThunk(id));
    setDeletingId(null);
    if (viewingIncome?.id === id) setViewingIncome(null);
  };

  const filteredIncomes = useMemo(() => {
    return incomes
      .filter((inc) => {
        const matchesSearch =
          inc.description.toLowerCase().includes(search.toLowerCase()) ||
          inc.source.toLowerCase().includes(search.toLowerCase()) ||
          (inc.notes && inc.notes.toLowerCase().includes(search.toLowerCase()));

        const matchesSource = selectedSource === 'ALL' || inc.source === selectedSource;
        const matchesStartDate = !startDate || inc.date >= startDate;
        const matchesEndDate = !endDate || inc.date <= endDate;

        return matchesSearch && matchesSource && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [incomes, search, selectedSource, startDate, endDate, sortBy]);

  const totalFilteredIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [filteredIncomes]);

  const handleExportCSV = () => {
    const rows = filteredIncomes.map((i) => ({
      ID: i.id,
      Date: i.date,
      Description: i.description,
      Source: i.source,
      Amount: i.amount,
      Notes: i.notes || '',
    }));
    exportToCSV(`MoneyMate_Income_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Income Management</h1>
          <p className="page-subtitle">
            Record revenue streams, client retainers, salaries, and investment returns
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handleOpenAdd} className="btn btn-income">
            <Plus size={16} /> Add Income
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
              placeholder="Search income..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%', fontSize: '0.86rem' }}
            />
          </div>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.86rem' }}
          >
            <option value="ALL">All Sources</option>
            {INCOME_SOURCES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
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

        {/* Summary Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            Showing <strong>{filteredIncomes.length}</strong> items • Total:{' '}
            <strong style={{ color: '#10b981' }}>{formatCurrency(totalFilteredIncome, currency)}</strong>
          </div>
          {(search || selectedSource !== 'ALL' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedSource('ALL');
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

      {/* Income Table */}
      <div className="table-container">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Source</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncomes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No income entries found.
                </td>
              </tr>
            ) : (
              filteredIncomes.map((inc) => (
                <tr key={inc.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: '600' }}>{formatDate(inc.date)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{inc.description}</div>
                    {inc.notes && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inc.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="pill pill-income">{inc.source}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: '#10b981' }}>
                    + {formatCurrency(inc.amount, currency)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => setViewingIncome(inc)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(inc)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title="Edit income"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingId(inc.id)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px', color: '#f43f5e' }}
                        title="Delete income"
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

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingIncome ? 'Edit Income' : 'Record New Income'}
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
                    style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value as IncomeSource)}
                      className="form-select"
                    >
                      {INCOME_SOURCES.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly salary, UI/UX client milestone"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Payment references, client name, remarks..."
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
                <button type="submit" className="btn btn-income">
                  {editingIncome ? 'Save Changes' : 'Record Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewingIncome && (
        <div className="modal-overlay" onClick={() => setViewingIncome(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Income Details</h3>
              <button onClick={() => setViewingIncome(null)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {viewingIncome.source}
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
                  + {formatCurrency(viewingIncome.amount, currency)}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginTop: '4px' }}>
                  {viewingIncome.description}
                </div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                  <strong>{formatDate(viewingIncome.date)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Source:</span>
                  <strong>{viewingIncome.source}</strong>
                </div>
                {viewingIncome.notes && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Notes:</span>
                    <p style={{ marginTop: '4px', color: 'var(--text-main)' }}>{viewingIncome.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setViewingIncome(null)} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Delete Income Entry?</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Are you sure you want to permanently delete this income record?
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

export default IncomePage;
