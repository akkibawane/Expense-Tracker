import React, { useState, useMemo } from 'react';
import {
  Plus,
  Repeat,
  Calendar,
  CreditCard,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  addRecurringThunk,
  updateRecurringThunk,
  deleteRecurringThunk,
  addExpenseThunk,
} from '../../redux/slices/expenseSlice';
import { RecurringExpense, ExpenseCategory, RecurringFrequency, PaymentMethod } from '../../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency, formatDate, getDaysRemaining } from '../../utils/formatters';

export const Recurring: React.FC = () => {
  const dispatch = useAppDispatch();
  const recurring = useAppSelector((state) => state.expenses.recurringExpenses);
  const currency = useAppSelector((state) => state.ui.currency);
  const user = useAppSelector((state) => state.auth.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringExpense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [paidToast, setPaidToast] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('0');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Entertainment');
  const [formFrequency, setFormFrequency] = useState<RecurringFrequency>('Monthly');
  const [formNextDate, setFormNextDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [formNotes, setFormNotes] = useState('');

  const frequencies: RecurringFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormAmount('0');
    setFormCategory('Entertainment');
    setFormFrequency('Monthly');
    setFormNextDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('Credit Card');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RecurringExpense) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormAmount(String(item.amount));
    setFormCategory(item.category);
    setFormFrequency(item.frequency);
    setFormNextDate(item.nextPaymentDate);
    setFormPaymentMethod(item.paymentMethod);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.max(0, parseFloat(formAmount) || 0);
    if (!amountNum || amountNum <= 0) return;

    if (editingItem) {
      await dispatch(
        updateRecurringThunk({
          id: editingItem.id,
          updates: {
            title: formTitle.trim(),
            amount: amountNum,
            category: formCategory,
            frequency: formFrequency,
            nextPaymentDate: formNextDate,
            paymentMethod: formPaymentMethod,
            notes: formNotes.trim() || undefined,
          },
        })
      );
    } else {
      await dispatch(
        addRecurringThunk({
          title: formTitle.trim(),
          amount: amountNum,
          category: formCategory,
          frequency: formFrequency,
          nextPaymentDate: formNextDate,
          paymentMethod: formPaymentMethod,
          notes: formNotes.trim() || undefined,
          active: true,
          userId: user?.id || 'user-001',
        })
      );
    }
    setIsModalOpen(false);
  };

  // Immediate "Record as Paid" Action
  const handleRecordPaid = async (item: RecurringExpense) => {
    await dispatch(
      addExpenseThunk({
        amount: item.amount,
        category: item.category,
        subCategory: item.title,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: item.paymentMethod,
        description: `Recurring: ${item.title}`,
        notes: `Auto-recorded bill for ${item.frequency} subscription`,
        userId: user?.id || 'user-001',
      })
    );

    // Compute next payment date based on frequency
    const next = new Date(item.nextPaymentDate);
    if (item.frequency === 'Monthly') next.setMonth(next.getMonth() + 1);
    else if (item.frequency === 'Yearly') next.setFullYear(next.getFullYear() + 1);
    else if (item.frequency === 'Weekly') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);

    await dispatch(
      updateRecurringThunk({
        id: item.id,
        updates: {
          nextPaymentDate: next.toISOString().split('T')[0],
        },
      })
    );

    setPaidToast(`Paid & recorded ${item.title} to expenses!`);
    setTimeout(() => setPaidToast(null), 3500);
  };

  const handleToggleActive = async (item: RecurringExpense) => {
    await dispatch(
      updateRecurringThunk({
        id: item.id,
        updates: { active: !item.active },
      })
    );
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteRecurringThunk(id));
    setDeletingId(null);
  };

  // Total recurring monthly run-rate
  const monthlyRunRate = useMemo(() => {
    return recurring
      .filter((r) => r.active)
      .reduce((sum, r) => {
        let monthly = r.amount;
        if (r.frequency === 'Yearly') monthly = r.amount / 12;
        if (r.frequency === 'Weekly') monthly = r.amount * 4.33;
        if (r.frequency === 'Daily') monthly = r.amount * 30;
        return sum + monthly;
      }, 0);
  }, [recurring]);

  return (
    <div className="page-container">
      {/* Toast Feedback */}
      {paidToast && (
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
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{paidToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Recurring Expenses & Subscriptions</h1>
          <p className="page-subtitle">
            Manage auto-renewals, monthly bills, SaaS subs, and never miss a payment
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> New Recurring Bill
        </button>
      </div>

      {/* Metric Banner */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Monthly Subscription Run-Rate
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
            {formatCurrency(monthlyRunRate, currency)} / month
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Subs</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>
              {recurring.filter((r) => r.active).length}
            </div>
          </div>
        </div>
      </div>

      {/* Recurring Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
        {recurring.map((item) => {
          const daysLeft = getDaysRemaining(item.nextPaymentDate);
          const isUrgent = daysLeft <= 3 && daysLeft >= 0;
          const isPastDue = daysLeft < 0;

          return (
            <div
              key={item.id}
              className="card"
              style={{
                opacity: item.active ? 1 : 0.6,
                borderColor: isUrgent ? 'rgba(245, 158, 11, 0.4)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(99,102,241,0.15)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Repeat size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{item.title}</h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {item.category} • {item.frequency}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px' }}
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px', color: '#f43f5e' }}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Amount & Schedule */}
              <div style={{ margin: '14px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {formatCurrency(item.amount, currency)}{' '}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    /{item.frequency.toLowerCase()}
                  </span>
                </div>

                <div>
                  {isPastDue ? (
                    <span className="pill pill-expense">Overdue</span>
                  ) : isUrgent ? (
                    <span className="pill" style={{ background: 'var(--warning-subtle)', color: 'var(--warning-color)' }}>
                      Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="pill pill-method">
                      {daysLeft} days left
                    </span>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Next billing: <strong>{formatDate(item.nextPaymentDate)}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} /> Auto-deduct via: <strong>{item.paymentMethod}</strong>
                </div>
                {item.notes && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {item.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button
                  onClick={() => handleRecordPaid(item)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '0.8rem' }}
                >
                  <CheckCircle2 size={14} color="#10b981" /> Record Paid
                </button>

                <button
                  onClick={() => handleToggleActive(item)}
                  className="btn-icon"
                  style={{ width: '32px', height: '32px', fontSize: '0.74rem' }}
                  title={item.active ? 'Pause subscription' : 'Resume subscription'}
                >
                  {item.active ? '⏸' : '▶'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Recurring Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem ? 'Edit Recurring Bill' : 'New Recurring Bill'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subscription / Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netflix, Spotify, Gym, Rent"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                      style={{ fontWeight: '700' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select
                      value={formFrequency}
                      onChange={(e) => setFormFrequency(e.target.value as RecurringFrequency)}
                      className="form-select"
                    >
                      {frequencies.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                      className="form-select"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
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
                  <label className="form-label">Next Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={formNextDate}
                    onChange={(e) => setFormNextDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Account number, renewal terms, cancel link..."
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
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Recurring Item'}
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Remove Recurring Item?</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Are you sure you want to stop tracking this recurring expense?
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

export default Recurring;
