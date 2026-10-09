import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Plus, PieChart, User, ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useRedux';
import { openQuickAdd } from '../../redux/slices/uiSlice';

export const MobileBottomNav: React.FC = () => {
  const dispatch = useAppDispatch();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/transactions" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Receipt size={20} />
          <span>History</span>
        </NavLink>

        {/* Center Floating Plus Action */}
        <button
          className="fab-plus-btn"
          onClick={() => setSheetOpen(true)}
          aria-label="Add transaction"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>

        <NavLink to="/budget" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <PieChart size={20} />
          <span>Budget</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Quick Action Sheet Modal */}
      {sheetOpen && (
        <div className="modal-overlay" onClick={() => setSheetOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px 20px', maxWidth: '380px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontWeight: '800', fontSize: '1.15rem' }}>Create Transaction</div>
              <button onClick={() => setSheetOpen(false)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <button
                className="btn btn-expense"
                style={{ padding: '16px', flexDirection: 'column', gap: '8px', borderRadius: '14px' }}
                onClick={() => {
                  setSheetOpen(false);
                  dispatch(openQuickAdd('expense'));
                }}
              >
                <ArrowDownCircle size={28} />
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Add Expense</span>
              </button>

              <button
                className="btn btn-income"
                style={{ padding: '16px', flexDirection: 'column', gap: '8px', borderRadius: '14px' }}
                onClick={() => {
                  setSheetOpen(false);
                  dispatch(openQuickAdd('income'));
                }}
              >
                <ArrowUpCircle size={28} />
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Add Income</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
