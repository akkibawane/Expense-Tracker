import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  PieChart,
  BarChart3,
  Repeat,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  IndianRupee,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { useTranslation } from '../../hooks/useTranslation';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const navItems = [
    { label: t('nav_dashboard'), path: '/', icon: LayoutDashboard },
    { label: t('nav_monthly'), path: '/monthly', icon: CalendarDays },
    { label: t('nav_expenses'), path: '/expenses', icon: ArrowDownCircle },
    { label: t('nav_income'), path: '/income', icon: ArrowUpCircle },
    { label: t('nav_transactions'), path: '/transactions', icon: Receipt },
    { label: t('nav_budget'), path: '/budget', icon: PieChart },
    { label: t('nav_analytics'), path: '/analytics', icon: BarChart3 },
    { label: t('nav_recurring'), path: '/recurring', icon: Repeat },
    { label: t('nav_settings'), path: '/settings', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: t('nav_admin'), path: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon-wrap" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}>
            <IndianRupee size={21} strokeWidth={2.6} />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MoneyMate
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.01em', marginTop: '1px', whiteSpace: 'nowrap' }}>
                {t('tagline')}
              </span>
            </div>
          )}
        </div>
        <button
          className="btn-icon"
          onClick={() => dispatch(toggleSidebar())}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ width: '32px', height: '32px' }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.fullName || 'User'}
              className="user-avatar"
            />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.fullName || 'Akshay Bawane'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {user?.role || 'USER'} Account
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
