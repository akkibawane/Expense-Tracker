import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { closeQuickAdd } from '../../redux/slices/uiSlice';
import { addExpenseThunk } from '../../redux/slices/expenseSlice';
import { addIncomeThunk } from '../../redux/slices/incomeSlice';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from '../../utils/constants';
import { ExpenseCategory, IncomeSource, PaymentMethod } from '../../types';

export const QuickAddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isQuickAddOpen);
  const initialType = useAppSelector((state) => state.ui.quickAddType);
  const user = useAppSelector((state) => state.auth.user);
  const currency = useAppSelector((state) => state.ui.currency);

  const [txType, setTxType] = useState<'expense' | 'income'>(initialType || 'expense');
  const [amount, setAmount] = useState<string>('0');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [source, setSource] = useState<IncomeSource>('Salary');
  const [subCategory, setSubCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [100, 500, 1000, 2500, 5000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Math.max(0, parseFloat(amount) || 0);
    if (numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      if (txType === 'expense') {
        await dispatch(
          addExpenseThunk({
            amount: numAmount,
            category,
            subCategory: subCategory.trim() || undefined,
            date,
            paymentMethod,
            description: description.trim() || `${category} Expense`,
            notes: notes.trim() || undefined,
            userId: user?.id || 'user-001',
          })
        ).unwrap();
      } else {
        await dispatch(
          addIncomeThunk({
            amount: numAmount,
            source,
            date,
            description: description.trim() || `${source} Income`,
            notes: notes.trim() || undefined,
            userId: user?.id || 'user-001',
          })
        ).unwrap();

        // Celebration confetti on adding income
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      setSuccessMsg(`${txType === 'expense' ? 'Expense' : 'Income'} recorded successfully!`);
      setTimeout(() => {
        setSuccessMsg('');
        dispatch(closeQuickAdd());
        setAmount('0');
        setDescription('');
        setNotes('');
        setSubCategory('');
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeQuickAdd())}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setTxType('expense')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                background: txType === 'expense' ? '#f43f5e' : 'transparent',
                color: txType === 'expense' ? 'white' : 'var(--text-muted)',
              }}
            >
              <ArrowDownCircle size={15} /> Expense
            </button>
            <button
              type="button"
              onClick={() => setTxType('income')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                background: txType === 'income' ? '#10b981' : 'transparent',
                color: txType === 'income' ? 'white' : 'var(--text-muted)',
              }}
            >
              <ArrowUpCircle size={15} /> Income
            </button>
          </div>
          <button onClick={() => dispatch(closeQuickAdd())} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="modal-body" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {successMsg ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={28} />
                </div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{successMsg}</div>
              </div>
            ) : (
              <>
                {/* Big Amount Input */}
                <div className="form-group">
                  <label className="form-label">Amount ({currency})</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="0"
                      value={amount}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === '+') {
                          e.preventDefault();
                        }
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0') setAmount('');
                      }}
                      onBlur={(e) => {
                        if (e.target.value.trim() === '' || parseFloat(e.target.value) < 0) {
                          setAmount('0');
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setAmount('');
                          return;
                        }
                        const num = parseFloat(val);
                        if (!isNaN(num) && num < 0) {
                          setAmount('0');
                        } else {
                          setAmount(val);
                        }
                      }}
                      className="form-input"
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        padding: '12px 16px',
                        letterSpacing: '-0.02em',
                        textAlign: 'left',
                        color: txType === 'expense' ? '#f43f5e' : '#10b981',
                      }}
                      autoFocus
                    />
                  </div>

                  {/* Quick Preset Pills */}
                  <div className="quick-amount-pills">
                    {quickAmounts.map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setAmount(String(Math.max(0, (parseFloat(amount) || 0) + val)))}
                        className="amount-pill"
                      >
                        +{val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount('0')}
                      className="amount-pill"
                      style={{ color: '#f43f5e' }}
                    >
                      Reset (0)
                    </button>
                  </div>
                </div>

                {/* Category / Source */}
                {txType === 'expense' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
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
                        placeholder={category === 'Investment' ? 'e.g. Mutual Funds, SIP, Stocks, Gold' : 'e.g. Dinner, Fuel'}
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="form-input"
                      />
                      {category === 'Investment' && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {['Mutual Funds SIP', 'Stocks / Equity', 'Fixed Deposit', 'Gold / SGB', 'PPF', 'Crypto'].map((sub) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setSubCategory(sub)}
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
                ) : (
                  <div className="form-group">
                    <label className="form-label">Income Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as IncomeSource)}
                      className="form-select"
                    >
                      {INCOME_SOURCES.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date & Payment Method */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {txType === 'expense' ? (
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="form-select"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Deposit Account</label>
                      <input
                        type="text"
                        readOnly
                        value="Primary Bank Account"
                        className="form-input"
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    placeholder={txType === 'expense' ? 'What was this expense for?' : 'e.g. October monthly salary'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Add tags, bill numbers, remarks..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </>
            )}
          </div>

          {!successMsg && (
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => dispatch(closeQuickAdd())}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className={`btn ${txType === 'expense' ? 'btn-expense' : 'btn-income'}`}
                style={{ minWidth: '130px' }}
              >
                {isSubmitting ? 'Saving...' : `Save ${txType === 'expense' ? 'Expense' : 'Income'}`}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;
