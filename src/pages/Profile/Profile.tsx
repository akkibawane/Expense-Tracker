import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Clock,
  Camera,
  Check,
  Shield,
  Save,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { updateProfile, setUserCurrency } from '../../redux/slices/authSlice';
import { setCurrency } from '../../redux/slices/uiSlice';
import { CurrencyCode } from '../../types';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const currentCurrency = useAppSelector((state) => state.ui.currency);

  const [fullName, setFullName] = useState(user?.fullName || 'Akshay Bawane');
  const [email, setEmail] = useState(user?.email || 'akshay@fintech.io');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '+91 98765 43210');
  const [currencyVal, setCurrencyVal] = useState<CurrencyCode>(user?.currency || currentCurrency);
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata (IST)');
  const [profilePhoto, setProfilePhoto] = useState(
    user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      updateProfile({
        fullName,
        email,
        mobileNumber,
        currency: currencyVal,
        timezone,
        profilePhoto,
      })
    );
    dispatch(setCurrency(currencyVal));
    dispatch(setUserCurrency(currencyVal));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Profile</h1>
          <p className="page-subtitle">
            Manage your account credentials, regional preferences, and avatar
          </p>
        </div>
      </div>

      {savedSuccess && (
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
          <Check size={18} /> Profile details saved successfully!
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Avatar Section */}
        <div className="card" style={{ marginBottom: '20px', textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
            <img
              src={profilePhoto}
              alt="Avatar"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #6366f1',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: '#6366f1',
                color: 'white',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Camera size={15} />
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Choose an avatar preset:
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {avatarPresets.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="preset"
                onClick={() => setProfilePhoto(url)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: profilePhoto === url ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
                  transform: profilePhoto === url ? 'scale(1.15)' : 'none',
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>

          <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-elevated)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Shield size={14} color="#818cf8" />
            Verified MoneyMate {user?.role || 'USER'} Account
          </div>
        </div>

        {/* Fields */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Legal Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
                <UserIcon
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
                <Phone
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Default Currency</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={currencyVal}
                  onChange={(e) => setCurrencyVal(e.target.value as CurrencyCode)}
                  className="form-select"
                  style={{ paddingLeft: '38px', width: '100%' }}
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                </select>
                <Globe
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Timezone</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="form-select"
                  style={{ paddingLeft: '38px', width: '100%' }}
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST +5:30)</option>
                  <option value="America/New_York (EST)">America/New_York (EST -5:00)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT +0:00)</option>
                  <option value="Asia/Dubai (GST)">Asia/Dubai (GST +4:00)</option>
                  <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT +8:00)</option>
                </select>
                <Clock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
