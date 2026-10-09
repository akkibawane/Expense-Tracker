import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  LogIn,
  IndianRupee,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
  Send,
  Timer,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { loginUser, setAuthSession } from '../../redux/slices/authSlice';
import { emailAuthService } from '../../services/emailAuthService';
import { useTranslation } from '../../hooks/useTranslation';

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';
  const { t } = useTranslation();

  const { isLoading, error: reduxError } = useAppSelector((state) => state.auth);

  // Mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Password Login State
  const [email, setEmail] = useState('akshay@fintech.io');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Email OTP Login State
  const [otpEmail, setOtpEmail] = useState('akshay@fintech.io');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [simulatedEmailBanner, setSimulatedEmailBanner] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('akshay@fintech.io');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const [googleLoading, setGoogleLoading] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle standard password login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await dispatch(loginUser({ email, password, rememberMe })).unwrap();
      navigate('/');
    } catch {
      // Handled by redux
    }
  };

  // Send Email OTP for passwordless login
  const handleSendLoginOtp = async () => {
    if (!otpEmail || !otpEmail.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }
    setOtpLoading(true);
    setLocalError(null);
    try {
      const res = await emailAuthService.sendEmailOtp(otpEmail, 'LOGIN');
      setOtpSent(true);
      setResendCountdown(60);
      setSimulatedEmailBanner(res.code);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Email OTP and Sign In
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setLocalError('Please enter the 6-digit verification code');
      return;
    }
    setOtpLoading(true);
    setLocalError(null);
    try {
      const auth = await emailAuthService.loginWithEmailOtp(otpEmail, otpCode.trim());
      dispatch(setAuthSession({ user: auth.user, token: auth.token, rememberMe }));
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || 'Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  // Send OTP for Forgot Password
  const handleSendForgotOtp = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address');
      return;
    }
    setForgotError(null);
    try {
      const res = await emailAuthService.sendEmailOtp(forgotEmail, 'RESET_PASSWORD');
      setForgotOtpSent(true);
      setSimulatedEmailBanner(res.code);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send recovery code');
    }
  };

  // Reset Password with OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotCode || forgotCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit code sent to your email');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    try {
      await emailAuthService.resetPasswordWithOtp(forgotEmail, forgotCode.trim(), newPassword);
      setForgotSuccess(true);
      setTimeout(async () => {
        setForgotModalOpen(false);
        setForgotSuccess(false);
        setEmail(forgotEmail);
        setPassword(newPassword);
        await dispatch(loginUser({ email: forgotEmail, password: newPassword, rememberMe: true })).unwrap();
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password');
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      dispatch(loginUser({ email: 'akshay@fintech.io', password: 'password123', rememberMe: true }));
      navigate('/');
    }, 600);
  };

  const handleQuickFill = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@fintech.io');
      setOtpEmail('admin@fintech.io');
      setPassword('admin123');
    } else {
      setEmail('akshay@fintech.io');
      setOtpEmail('akshay@fintech.io');
      setPassword('password123');
    }
  };

  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    if (authMode === 'otp') {
      setOtpCode(code);
    }
    if (forgotModalOpen) {
      setForgotCode(code);
    }
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 10%, rgba(99,102,241,0.18) 0%, rgba(8,12,20,1) 80%)',
      }}
    >
      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '36px 30px' }}>
        {/* Logo and Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="logo-icon-wrap"
            style={{ width: '52px', height: '52px', margin: '0 auto 12px auto', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)' }}
          >
            <IndianRupee size={30} strokeWidth={2.6} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Welcome to MoneyMate
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
            {t('tagline')} – Next-gen expense tracking & wealth suite
          </p>
        </div>

        {/* Simulated Email Delivery Banner */}
        {simulatedEmailBanner && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(16,185,129,0.14) 100%)',
              border: '1px solid rgba(99,102,241,0.35)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Mail size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Security Code Sent to Inbox:</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '0.2em', color: '#10b981' }}>
                  {simulatedEmailBanner}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyOtp(simulatedEmailBanner)}
              className="amount-pill"
              style={{ padding: '6px 12px', fontSize: '0.76rem', gap: '4px', flexShrink: 0 }}
            >
              {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedCode ? 'Filled!' : 'Auto-Fill'}
            </button>
          </div>
        )}

        {isExpired && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#f43f5e',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <ShieldAlert size={16} />
            Your session has expired. Please log in again.
          </div>
        )}

        {(reduxError || localError) && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#f43f5e',
              fontSize: '0.84rem',
              marginBottom: '16px',
            }}
          >
            {localError || reduxError}
          </div>
        )}

        {/* Authentication Mode Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-elevated)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '18px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setLocalError(null);
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: authMode === 'password' ? '700' : '500',
              background: authMode === 'password' ? 'var(--bg-card)' : 'transparent',
              color: authMode === 'password' ? 'var(--text-main)' : 'var(--text-muted)',
              border: authMode === 'password' ? '1px solid var(--border-subtle)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setLocalError(null);
            }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: authMode === 'otp' ? '700' : '500',
              background: authMode === 'otp' ? 'var(--bg-card)' : 'transparent',
              color: authMode === 'otp' ? 'var(--text-main)' : 'var(--text-muted)',
              border: authMode === 'otp' ? '1px solid var(--border-subtle)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <KeyRound size={14} color="#818cf8" />
            Email OTP Login
          </button>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Demo User:
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('user')}
              className="amount-pill"
              style={{ fontSize: '0.74rem', padding: '3px 8px' }}
            >
              Akshay Bawane
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="amount-pill"
              style={{ fontSize: '0.74rem', padding: '3px 8px', color: '#8b5cf6' }}
            >
              Admin Role
            </button>
          </div>
        </div>

        {/* 1. PASSWORD AUTHENTICATION TAB */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                />
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(true);
                    setForgotEmail(email);
                  }}
                  style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: '600' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                />
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '0.84rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Remember me on this browser
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {isLoading ? 'Authenticating...' : (
                <>
                  <LogIn size={18} /> Sign In with Password
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. EMAIL OTP (PASSWORDLESS) TAB */}
        {authMode === 'otp' && (
          <form onSubmit={handleVerifyOtpLogin}>
            <div className="form-group">
              <label className="form-label">Registered Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  disabled={otpSent}
                />
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendLoginOtp}
                disabled={otpLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              >
                {otpLoading ? 'Dispatching Email...' : (
                  <>
                    <Send size={16} /> Send One-Time Verification Code
                  </>
                )}
              </button>
            ) : (
              <>
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Enter 6-Digit Email Code</label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{ fontSize: '0.76rem', color: '#818cf8' }}
                    >
                      Change Email
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 589214"
                      className="form-input"
                      style={{
                        paddingLeft: '40px',
                        width: '100%',
                        letterSpacing: '0.25em',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                      }}
                    />
                    <KeyRound
                      size={18}
                      style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Timer size={14} />
                    {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Did not receive code?'}
                  </span>
                  <button
                    type="button"
                    disabled={resendCountdown > 0 || otpLoading}
                    onClick={handleSendLoginOtp}
                    style={{
                      fontSize: '0.78rem',
                      color: resendCountdown > 0 ? 'var(--text-dim)' : '#818cf8',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length !== 6}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {otpLoading ? 'Verifying Code...' : (
                    <>
                      <CheckCircle2 size={18} /> Verify Code & Sign In
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Google Login Placeholder */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn-secondary"
          style={{ width: '100%', gap: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          {googleLoading ? 'Connecting...' : 'Sign in with Google'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: '700' }}>
            Register now
          </Link>
        </div>
      </div>

      {/* Forgot Password via Email OTP Modal */}
      {forgotModalOpen && (
        <div className="modal-overlay" onClick={() => setForgotModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '6px' }}>
              Reset Password via Email
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              We will send a 6-digit verification code to your verified email address to reset your credentials.
            </p>

            {forgotError && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#f43f5e',
                  fontSize: '0.82rem',
                  marginBottom: '14px',
                }}
              >
                {forgotError}
              </div>
            )}

            {forgotSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 10px', color: '#10b981' }}>
                <CheckCircle2 size={42} style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ fontWeight: '800', fontSize: '1.1rem' }}>Password Updated!</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Logging you in automatically with your new credentials...
                </p>
              </div>
            ) : !forgotOtpSent ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Your Registered Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" onClick={() => setForgotModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSendForgotOtp} className="btn btn-primary">
                    <Send size={14} /> Send Recovery Code
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label">6-Digit Verification Code</label>
                    <button
                      type="button"
                      onClick={handleSendForgotOtp}
                      style={{ fontSize: '0.74rem', color: '#818cf8' }}
                    >
                      Resend Code
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 849201"
                    className="form-input"
                    style={{ width: '100%', letterSpacing: '0.2em', fontWeight: '700' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotOtpSent(false);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Set New Password & Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
