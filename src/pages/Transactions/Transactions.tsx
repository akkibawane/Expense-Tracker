import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';

export const Transactions: React.FC = () => {
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const incomes = useAppSelector((state) => state.income.incomes);
  const currency = useAppSelector((state) => state.ui.currency);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Combine Income & Expenses into Unified Transaction Array
  const allTransactions = useMemo(() => {
    const list = [
      ...incomes.map((i) => ({
        id: `inc-${i.id}`,
        type: 'INCOME' as const,
        category: i.source,
        description: i.description,
        paymentMethod: 'Bank Transfer',
        amount: i.amount,
        date: i.date,
        notes: i.notes,
      })),
      ...expenses.map((e) => ({
        id: `exp-${e.id}`,
        type: 'EXPENSE' as const,
        category: e.category,
        description: e.description,
        paymentMethod: e.paymentMethod,
        amount: e.amount,
        date: e.date,
        notes: e.notes,
      })),
    ];
    return list;
  }, [incomes, expenses]);

  // Extract distinct categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    allTransactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [allTransactions]);

  // Filtered & Sorted
  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        // Search
        const matchesSearch =
          tx.description.toLowerCase().includes(search.toLowerCase()) ||
          tx.category.toLowerCase().includes(search.toLowerCase()) ||
          tx.paymentMethod.toLowerCase().includes(search.toLowerCase());

        // Type
        const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

        // Category
        const matchesCategory = categoryFilter === 'ALL' || tx.category === categoryFilter;

        // Date range
        const matchesStart = !startDate || tx.date >= startDate;
        const matchesEnd = !endDate || tx.date <= endDate;

        return matchesSearch && matchesType && matchesCategory && matchesStart && matchesEnd;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [allTransactions, search, typeFilter, categoryFilter, startDate, endDate, sortBy]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleExportCSV = () => {
    const rows = filteredTransactions.map((t) => ({
      ID: t.id,
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      PaymentMethod: t.paymentMethod,
      Amount: t.type === 'INCOME' ? `+${t.amount}` : `-${t.amount}`,
      Notes: t.notes || '',
    }));
    exportToCSV(`MoneyMate_Statement_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Unified Transactions</h1>
          <p className="page-subtitle">
            Consolidated statement of all incoming cash and expense outflows
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-secondary">
          <Download size={16} /> Export Statement (CSV)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '22px', padding: '18px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search description, tag..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%', fontSize: '0.86rem' }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ fontSize: '0.86rem' }}
          >
            <option value="ALL">All Types (Income & Expenses)</option>
            <option value="INCOME">Income Only (+)</option>
            <option value="EXPENSE">Expense Only (-)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ fontSize: '0.86rem' }}
          >
            <option value="ALL">All Categories / Sources</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input"
            style={{ fontSize: '0.86rem' }}
          />

          <input
            type="date"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
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

        {/* Reset Filter Button */}
        {(search || typeFilter !== 'ALL' || categoryFilter !== 'ALL' || startDate || endDate) && (
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('ALL');
                setCategoryFilter('ALL');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              style={{ color: '#818cf8', fontSize: '0.82rem', fontWeight: '600' }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Unified Table */}
      <div className="table-container">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Payment</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: '600' }}>{formatDate(tx.date)}</div>
                  </td>
                  <td>
                    <span className={`pill ${tx.type === 'INCOME' ? 'pill-income' : 'pill-expense'}`}>
                      {tx.type === 'INCOME' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                      {tx.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600' }}>{tx.category}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{tx.description}</div>
                    {tx.notes && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{tx.notes}</div>
                    )}
                  </td>
                  <td>
                    <span className="pill pill-method">{tx.paymentMethod}</span>
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: '800',
                      fontSize: '0.94rem',
                      color: tx.type === 'INCOME' ? 'var(--income-color)' : 'var(--expense-color)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '18px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Showing{' '}
          <strong>
            {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredTransactions.length)}
          </strong>{' '}
          of <strong>{filteredTransactions.length}</strong> transactions
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ padding: '4px 8px', fontSize: '0.84rem' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.84rem', fontWeight: '700' }}>
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
