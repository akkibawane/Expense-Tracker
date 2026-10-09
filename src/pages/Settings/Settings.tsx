import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Laptop,
  Globe,
  Bell,
  Lock,
  LogOut,
  Shield,
  RotateCcw,
  Check,
  AlertCircle,
  Mail,
  KeyRound,
  CheckCircle2,
  Send,
  Copy,
  Type,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setTheme, setCurrency, setLanguage, setFontSize, ThemeMode, FontSize } from '../../redux/slices/uiSlice';
import { logout, switchRole, setUserCurrency, updateProfile } from '../../redux/slices/authSlice';
import { mockDb } from '../../services/mockDatabase';
import { fetchExpenses, fetchRecurringThunk } from '../../redux/slices/expenseSlice';
import { fetchIncomes } from '../../redux/slices/incomeSlice';
import { fetchBudgets } from '../../redux/slices/budgetSlice';
import { fetchNotifications } from '../../redux/slices/notificationSlice';
import { CurrencyCode, Role } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { LANGUAGES, LanguageCode } from '../../utils/i18n';
import { emailAuthService } from '../../services/emailAuthService';

export const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const theme = useAppSelector((state) => state.ui.theme);
  const currency = useAppSelector((state) => state.ui.currency);
  const fontSize = useAppSelector((state) => state.ui.fontSize);
  const user = useAppSelector((state) => state.auth.user);

  const { t, language } = useTranslation();

  // Notification toggles
  const [notify80, setNotify80] = useState(true);
  const [notify100, setNotify100] = useState(true);
  const [notifyRecurring, setNotifyRecurring] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(false);

  // Email & 2FA Security state
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled ?? false);
  const [simulatedEmailCode, setSimulatedEmailCode] = useState<string | null>(null);
  const [emailVerifyInput, setEmailVerifyInput] = useState('');
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleThemeChange = (newTheme: ThemeMode) => {
    dispatch(setTheme(newTheme));
  };

  const handleCurrencyChange = (newCurr: CurrencyCode) => {
    dispatch(setCurrency(newCurr));
    dispatch(setUserCurrency(newCurr));
  };

  const handleSendTestEmailOtp = async () => {
    const targetEmail = user?.email || 'akshay@fintech.io';
    const res = await emailAuthService.sendEmailOtp(targetEmail, 'VERIFY_EMAIL');
    setSimulatedEmailCode(res.code);
    setEmailStatusMsg({ type: 'success', text: `Test OTP sent to ${targetEmail}!` });
  };

  const handleVerifyEmailCode = async () => {
    const targetEmail = user?.email || 'akshay@fintech.io';
    const res = await emailAuthService.verifyOtp(targetEmail, emailVerifyInput, 'VERIFY_EMAIL');
    if (res.valid) {
      setEmailStatusMsg({ type: 'success', text: 'Email verified successfully!' });
      dispatch(updateProfile({ isEmailVerified: true }));
      setSimulatedEmailCode(null);
      setEmailVerifyInput('');
    } else {
      setEmailStatusMsg({ type: 'error', text: res.message || 'Invalid verification code.' });
    }
    setTimeout(() => setEmailStatusMsg(null), 3500);
  };

  const handleToggle2FA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setTwoFactor(checked);
    dispatch(updateProfile({ twoFactorEnabled: checked }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setPwdMsg({ type: 'error', text: 'Please enter your current password' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPwdMsg({ type: 'success', text: 'Password successfully updated!' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwdMsg(null), 3500);
  };

  const handleRoleToggle = (newRole: Role) => {
    dispatch(switchRole(newRole));
  };

  const handleResetToZero = () => {
    mockDb.resetAllToZero();
    dispatch(fetchExpenses());
    dispatch(fetchIncomes());
    dispatch(fetchBudgets());
    dispatch(fetchRecurringThunk());
    dispatch(fetchNotifications());
    setResetSuccess('All transactions, budgets, and balances reset to clean ₹0 state!');
    setTimeout(() => setResetSuccess(null), 3500);
  };

  const handleLoadDemoData = () => {
    mockDb.loadDemoData();
    dispatch(fetchExpenses());
    dispatch(fetchIncomes());
    dispatch(fetchBudgets());
    dispatch(fetchRecurringThunk());
    dispatch(fetchNotifications());
    setResetSuccess('Sample demo transactions, budgets, and subscriptions loaded!');
    setTimeout(() => setResetSuccess(null), 3500);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Application Settings</h1>
          <p className="page-subtitle">
            Configure appearance, currencies, security policies, and notification triggers
          </p>
        </div>
      </div>

      {resetSuccess && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10b981',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <Check size={18} /> {resetSuccess}
        </div>
      )}

      {/* 1. Theme Mode Preference */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '6px' }}>Theme Appearance</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Select how MoneyMate looks to you across all your devices
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className="amount-pill"
            style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              borderColor: theme === 'dark' ? '#6366f1' : undefined,
              background: theme === 'dark' ? 'rgba(99,102,241,0.15)' : undefined,
              color: theme === 'dark' ? 'var(--text-main)' : undefined,
            }}
          >
            <Moon size={20} />
            <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>Dark Mode</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className="amount-pill"
            style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              borderColor: theme === 'light' ? '#6366f1' : undefined,
              background: theme === 'light' ? 'rgba(99,102,241,0.15)' : undefined,
              color: theme === 'light' ? 'var(--text-main)' : undefined,
            }}
          >
            <Sun size={20} />
            <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className="amount-pill"
            style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              borderColor: theme === 'system' ? '#6366f1' : undefined,
              background: theme === 'system' ? 'rgba(99,102,241,0.15)' : undefined,
              color: theme === 'system' ? 'var(--text-main)' : undefined,
            }}
          >
            <Laptop size={20} />
            <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>System Match</span>
          </button>
        </div>

        {/* Text Size & Scaling Option */}
        <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Type size={18} style={{ color: '#6366f1' }} />
              <h4 style={{ fontSize: '0.96rem', fontWeight: '700' }}>Text Size & Display Scaling</h4>
            </div>
            <span
              className="pill"
              style={{
                fontSize: '0.72rem',
                textTransform: 'capitalize',
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#818cf8',
                fontWeight: '700',
                padding: '3px 10px',
              }}
            >
              Active: {fontSize}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Choose preferred typography size across all metrics, transaction lists, budgets, and navigation
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <button
              type="button"
              onClick={() => dispatch(setFontSize('small'))}
              className="amount-pill"
              style={{
                padding: '14px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                borderColor: fontSize === 'small' ? '#6366f1' : undefined,
                background: fontSize === 'small' ? 'rgba(99,102,241,0.15)' : undefined,
                color: fontSize === 'small' ? 'var(--text-main)' : undefined,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>Aa</span>
              <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>Small</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Compact view</span>
            </button>

            <button
              type="button"
              onClick={() => dispatch(setFontSize('medium'))}
              className="amount-pill"
              style={{
                padding: '14px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                borderColor: fontSize === 'medium' ? '#6366f1' : undefined,
                background: fontSize === 'medium' ? 'rgba(99,102,241,0.15)' : undefined,
                color: fontSize === 'medium' ? 'var(--text-main)' : undefined,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: '800' }}>Aa</span>
              <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>Medium</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Default standard</span>
            </button>

            <button
              type="button"
              onClick={() => dispatch(setFontSize('large'))}
              className="amount-pill"
              style={{
                padding: '14px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                borderColor: fontSize === 'large' ? '#6366f1' : undefined,
                background: fontSize === 'large' ? 'rgba(99,102,241,0.15)' : undefined,
                color: fontSize === 'large' ? 'var(--text-main)' : undefined,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>Aa</span>
              <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>Large</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Large text</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global Currency */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '6px' }}>Base Currency</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          All balance calculations and charts will format dynamically in your chosen currency
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {[
            { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
            { code: 'USD', symbol: '$', name: 'US Dollar' },
            { code: 'EUR', symbol: '€', name: 'Euro' },
            { code: 'GBP', symbol: '£', name: 'British Pound' },
          ].map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCurrencyChange(c.code as CurrencyCode)}
              className="amount-pill"
              style={{
                padding: '12px',
                textAlign: 'left',
                borderColor: currency === c.code ? '#6366f1' : undefined,
                background: currency === c.code ? 'rgba(99,102,241,0.15)' : undefined,
                color: currency === c.code ? 'var(--text-main)' : undefined,
              }}
            >
              <div style={{ fontSize: '1.15rem', fontWeight: '800' }}>{c.symbol} {c.code}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Language Preferences Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Globe size={18} color="#818cf8" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{t('language_preference')}</h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {t('select_language')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => dispatch(setLanguage(lang.code))}
                className="amount-pill"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  borderColor: isSelected ? '#6366f1' : undefined,
                  background: isSelected ? 'rgba(99,102,241,0.16)' : undefined,
                  color: isSelected ? 'var(--text-main)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{lang.flag}</span>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.86rem' }}>{lang.nativeName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lang.name}</div>
                  </div>
                </div>
                {isSelected && <Check size={16} color="#6366f1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Notification Preferences */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '6px' }}>Notification Triggers</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Customize what events generate alerts on your notification drawer
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Budget 80% Threshold Warning</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Alert when category spending crosses 80%</div>
            </div>
            <input
              type="checkbox"
              checked={notify80}
              onChange={(e) => setNotify80(e.target.checked)}
              style={{ accentColor: '#6366f1', width: '18px', height: '18px' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Budget 100% Exceeded Urgent Alert</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Urgent alert when category budget is broken</div>
            </div>
            <input
              type="checkbox"
              checked={notify100}
              onChange={(e) => setNotify100(e.target.checked)}
              style={{ accentColor: '#6366f1', width: '18px', height: '18px' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Recurring Bill Due Reminders</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Notify 3 days before upcoming subscription charge</div>
            </div>
            <input
              type="checkbox"
              checked={notifyRecurring}
              onChange={(e) => setNotifyRecurring(e.target.checked)}
              style={{ accentColor: '#6366f1', width: '18px', height: '18px' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Weekly & Monthly Digest</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Periodic savings performance review</div>
            </div>
            <input
              type="checkbox"
              checked={notifyWeekly}
              onChange={(e) => setNotifyWeekly(e.target.checked)}
              style={{ accentColor: '#6366f1', width: '18px', height: '18px' }}
            />
          </label>
        </div>
      </div>

      {/* 4. Role Testing Switcher */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '6px' }}>Role-Based Access Control (RBAC)</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Current Role: <strong style={{ color: user?.role === 'ADMIN' ? '#8b5cf6' : '#10b981' }}>{user?.role}</strong>.
          Switch between roles to test the protected Admin Panel routes.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleRoleToggle('USER')}
            className={`btn ${user?.role === 'USER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.84rem' }}
          >
            USER View
          </button>
          <button
            onClick={() => handleRoleToggle('ADMIN')}
            className={`btn ${user?.role === 'ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.84rem' }}
          >
            ADMIN View (Unlocks Admin Console)
          </button>
        </div>
      </div>

      {/* 5. Email Authentication & 2FA Security */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} style={{ color: '#6366f1' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Email Authentication & 2FA</h3>
          </div>
          <span
            className="pill"
            style={{
              background: user?.isEmailVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: user?.isEmailVerified ? '#10b981' : '#f59e0b',
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '4px 10px',
            }}
          >
            {user?.isEmailVerified ? '✓ Email Verified' : '⚠ Verification Pending'}
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Secure your account using passwordless email OTP verification and two-factor authentication
        </p>

        {emailStatusMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: emailStatusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: emailStatusMsg.type === 'success' ? '#10b981' : '#f43f5e',
              fontSize: '0.84rem',
              marginBottom: '14px',
            }}
          >
            {emailStatusMsg.text}
          </div>
        )}

        {simulatedEmailCode && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: '#818cf8', fontWeight: '600' }}>
                Simulated Email Inbox • New Message Received
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '2px' }}>
                Your MoneyMate One-Time Code: <span style={{ letterSpacing: '2px', color: '#6366f1' }}>{simulatedEmailCode}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEmailVerifyInput(simulatedEmailCode)}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Auto-Fill
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-elevated)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Registered Email Address</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {user?.email || 'akshay@fintech.io'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendTestEmailOtp}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              <Send size={13} /> Send Test OTP
            </button>
          </div>

          {simulatedEmailCode && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                maxLength={6}
                value={emailVerifyInput}
                onChange={(e) => setEmailVerifyInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="form-input"
                style={{ maxWidth: '180px', letterSpacing: '3px', fontWeight: '700', textAlign: 'center' }}
              />
              <button
                type="button"
                onClick={handleVerifyEmailCode}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '6px 16px' }}
              >
                Verify Code
              </button>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-elevated)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>Two-Factor Email Verification (2FA)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Require an email OTP code whenever signing into your MoneyMate account
              </div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={twoFactor} onChange={handleToggle2FA} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>

      {/* 6. Change Password Form */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '6px' }}>Change Password</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Keep your credentials secure with modern hashed protection
        </p>

        {pwdMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: pwdMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: pwdMsg.type === 'success' ? '#10b981' : '#f43f5e',
              fontSize: '0.84rem',
              marginBottom: '14px',
            }}
          >
            {pwdMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Lock size={15} /> Update Password
          </button>
        </form>
      </div>

      {/* 7. Data Controls & Zero-State Reset */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Data & Environment Controls</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Reset everything to pristine ₹0 zero state or reload sample transactions for testing
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleResetToZero}
            className="btn btn-secondary"
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
          >
            <RotateCcw size={15} /> Reset All to Zero (₹0)
          </button>
          <button
            type="button"
            onClick={handleLoadDemoData}
            className="btn btn-secondary"
          >
            <CheckCircle2 size={15} /> Load Sample Demo Data
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-danger"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
