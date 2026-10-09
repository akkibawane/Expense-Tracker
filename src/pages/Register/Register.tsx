import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  UserPlus,
  IndianRupee,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { registerUser } from '../../redux/slices/authSlice';
import { emailAuthService } from '../../services/emailAuthService';
import { Role } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

export const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [validationError, setValidationError] = useState('');

  // Email Verification Step State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedEmailCode, setSimulatedEmailCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setOtpError(null);

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    // Trigger Email OTP Verification
    setVerifyLoading(true);
    try {
      const res = await emailAuthService.sendEmailOtp(email, 'REGISTER');
      setSimulatedEmailCode(res.code);
      setVerifyModalOpen(true);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to send email verification code');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyAndCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit code sent to your email');
      return;
    }

    setVerifyLoading(true);
    try {
      const verification = await emailAuthService.verifyOtp(email, otpCode.trim(), 'REGISTER');
      if (!verification.valid) {
        setOtpError(verification.message || 'Invalid verification code');
        setVerifyLoading(false);
        return;
      }

      await dispatch(
        registerUser({
          fullName,
          email,
          mobileNumber,
          password,
          role,
        })
      ).unwrap();

      navigate('/');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to complete registration');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setOtpCode(code);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'radial-gradient(circle at 50% 10%, rgba(99,102,241,0.18) 0%, rgba(8,12,20,1) 80%)',
      }}
    >
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '36px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="logo-icon-wrap"
            style={{ width: '50px', height: '50px', margin: '0 auto 12px auto', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)' }}
          >
            <IndianRupee size={28} strokeWidth={2.6} />
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
            Join thousands tracking their wealth with MoneyMate – {t('tagline')}
          </p>
        </div>

        {(validationError || error) && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#f43f5e',
              fontSize: '0.84rem',
              marginBottom: '18px',
            }}
          >
            {validationError || error}
          </div>
        )}

        <form onSubmit={handleInitialSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Akshay Bawane"
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%' }}
              />
              <User
                size={16}
                style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address (Requires Verification)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%' }}
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%' }}
              />
              <Phone
                size={16}
                style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
            </div>
          </div>

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '100%' }}
                />
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '100%' }}
                />
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label">Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('USER')}
                className="amount-pill"
                style={{
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderColor: role === 'USER' ? '#6366f1' : undefined,
                  background: role === 'USER' ? 'rgba(99,102,241,0.15)' : undefined,
                  color: role === 'USER' ? 'var(--text-main)' : undefined,
                }}
              >
                <User size={16} /> Individual (User)
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className="amount-pill"
                style={{
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderColor: role === 'ADMIN' ? '#8b5cf6' : undefined,
                  background: role === 'ADMIN' ? 'rgba(139,92,246,0.15)' : undefined,
                  color: role === 'ADMIN' ? '#8b5cf6' : undefined,
                }}
              >
                <ShieldCheck size={16} /> Admin Privileges
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || verifyLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {verifyLoading ? 'Sending Verification Code...' : (
              <>
                <Send size={16} /> Verify Email & Register
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: '700' }}>
            Sign in here
          </Link>
        </div>
      </div>

      {/* Email Verification OTP Modal */}
      {verifyModalOpen && (
        <div className="modal-overlay" onClick={() => setVerifyModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '6px' }}>
              Verify Your Email Address
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              We sent a 6-digit confirmation code to <strong>{email}</strong>. Please enter it below to activate your account.
            </p>

            {simulatedEmailCode && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(16,185,129,0.14) 100%)',
                  border: '1px solid rgba(99,102,241,0.35)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Inbox Verification Code:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '0.2em', color: '#10b981' }}>
                      {simulatedEmailCode}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(simulatedEmailCode)}
                  className="amount-pill"
                  style={{ padding: '6px 12px', fontSize: '0.76rem', gap: '4px' }}
                >
                  {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copiedCode ? 'Filled!' : 'Auto-Fill'}
                </button>
              </div>
            )}

            {otpError && (
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
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyAndCompleteRegister}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit Code</label>
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

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button type="button" onClick={() => setVerifyModalOpen(false)} className="btn btn-secondary">
                  Back
                </button>
                <button type="submit" disabled={verifyLoading || otpCode.length !== 6} className="btn btn-primary">
                  {verifyLoading ? 'Activating...' : (
                    <>
                      <CheckCircle2 size={16} /> Confirm & Activate Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
