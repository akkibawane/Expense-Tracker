import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  AlertTriangle,
  CheckCheck,
  Trash2,
  Calendar,
  Sparkles,
  CreditCard,
  Globe,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setCurrency, setTheme, setGlobalSearch, setLanguage } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import { markAllReadThunk, markReadThunk, clearAllNotificationsThunk } from '../../redux/slices/notificationSlice';
import { CurrencyCode, AppNotification } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';
import { LANGUAGES, LanguageCode } from '../../utils/i18n';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const theme = useAppSelector((state) => state.ui.theme);
  const currency = useAppSelector((state) => state.ui.currency);
  const globalSearch = useAppSelector((state) => state.ui.globalSearch);
  const user = useAppSelector((state) => state.auth.user);
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);

  const { t, language } = useTranslation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setCurrency(e.target.value as CurrencyCode));
  };

  const toggleThemeMode = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'BUDGET_EXCEEDED':
        return <AlertTriangle size={16} color="#ef4444" />;
      case 'BUDGET_WARNING':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'RECURRING_DUE':
        return <CreditCard size={16} color="#3b82f6" />;
      default:
        return <Sparkles size={16} color="#10b981" />;
    }
  };

  return (
    <header className="top-header">
      {/* Global Search */}
      <div className="header-search">
        <Search size={18} />
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={globalSearch}
          onChange={(e) => dispatch(setGlobalSearch(e.target.value))}
        />
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Globe size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={language}
            onChange={(e) => dispatch(setLanguage(e.target.value as LanguageCode))}
            className="currency-select"
            title={t('select_language')}
            style={{ minWidth: '95px' }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Switcher */}
        <select
          value={currency}
          onChange={handleCurrencyChange}
          className="currency-select"
          title="Select display currency"
        >
          <option value="INR">₹ INR</option>
          <option value="USD">$ USD</option>
          <option value="EUR">€ EUR</option>
          <option value="GBP">£ GBP</option>
        </select>

        {/* Theme Toggle */}
        <button
          onClick={toggleThemeMode}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="btn-icon"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </button>

          {/* Notifications Drawer */}
          {isNotifOpen && (
            <div className="notif-popover">
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {t('notifications')} ({unreadCount})
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => dispatch(markAllReadThunk())}
                    className="amount-pill"
                    style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                    title={t('mark_all_read')}
                  >
                    <CheckCheck size={12} /> {t('mark_all_read')}
                  </button>
                  <button
                    onClick={() => dispatch(clearAllNotificationsThunk())}
                    className="amount-pill"
                    style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                    title={t('clear_all')}
                  >
                    <Trash2 size={12} /> {t('clear_all')}
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    {t('no_notifications')}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => {
                        dispatch(markReadThunk(n.id));
                        if (n.link) {
                          navigate(n.link);
                          setIsNotifOpen(false);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ marginTop: '2px' }}>{getNotifIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: n.read ? '500' : '700', color: 'var(--text-main)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.35 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                          {formatDate(n.date)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            className="user-menu-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="User menu"
          >
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.fullName || 'User'}
              className="user-avatar"
            />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }} className="hidden-mobile">
              {user?.fullName?.split(' ')[0] || 'Akshay'}
            </span>
          </button>

          {isProfileOpen && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: '0',
                width: '210px',
                padding: '8px',
                zIndex: 60,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{user?.fullName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.email}
                </div>
              </div>

              <Link
                to="/profile"
                className="nav-item"
                style={{ padding: '8px 12px', fontSize: '0.84rem' }}
                onClick={() => setIsProfileOpen(false)}
              >
                <User size={16} /> Profile
              </Link>
              <Link
                to="/settings"
                className="nav-item"
                style={{ padding: '8px 12px', fontSize: '0.84rem' }}
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings size={16} /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="nav-item"
                style={{ padding: '8px 12px', fontSize: '0.84rem', color: '#f43f5e', width: '100%', textAlign: 'left' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
