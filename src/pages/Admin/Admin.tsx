import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Database,
  Download,
  AlertTriangle,
  Server,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import { mockDb } from '../../services/mockDatabase';
import { exportToJSON } from '../../utils/formatters';

export const Admin: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dbState = mockDb.getState();

  const [activeTab, setActiveTab] = useState<'users' | 'system'>('users');

  if (user?.role !== 'ADMIN') {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <AlertTriangle size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Admin Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '420px', margin: '6px auto 16px auto' }}>
          Your current account role is <strong>{user?.role || 'USER'}</strong>. Go to Settings and toggle to ADMIN role to test this screen.
        </p>
      </div>
    );
  }

  const handleExportSystemBackup = () => {
    exportToJSON(`MoneyMate_Full_System_Backup_${new Date().toISOString().split('T')[0]}`, dbState);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pill pill-income" style={{ fontSize: '0.74rem' }}>
              <ShieldCheck size={14} /> Admin Privileges Active
            </span>
          </div>
          <h1 className="page-title" style={{ marginTop: '4px' }}>
            System Administration Console
          </h1>
          <p className="page-subtitle">
            Manage user identity directories, platform storage quotas, and security audit logs
          </p>
        </div>

        <button onClick={handleExportSystemBackup} className="btn btn-secondary">
          <Download size={16} /> Export Complete DB State
        </button>
      </div>

      {/* Admin Metric Cards */}
      <div className="summary-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
            <span>Total Accounts</span>
            <Users size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px' }}>
            {dbState.users.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '4px' }}>
            100% active & verified
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
            <span>Total Records</span>
            <Database size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px' }}>
            {dbState.expenses.length + dbState.incomes.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all tenant partitions
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
            <span>API Gateway Latency</span>
            <Activity size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '6px', color: '#10b981' }}>
            24ms
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Spring Boot REST simulation healthy
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>
          Registered Tenant Users
        </h3>

        <div className="table-container">
          <table className="fin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Default Currency</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {dbState.users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={u.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={u.fullName}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: '700' }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.mobileNumber}</td>
                  <td>
                    <span className={`pill ${u.role === 'ADMIN' ? 'pill-income' : 'pill-method'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.currency}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
