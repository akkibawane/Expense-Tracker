import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import MonthlyTracker from '../pages/Monthly/MonthlyTracker';
import Expenses from '../pages/Expenses/Expenses';
import IncomePage from '../pages/Income/Income';
import Transactions from '../pages/Transactions/Transactions';
import BudgetPage from '../pages/Budget/Budget';
import Analytics from '../pages/Analytics/Analytics';
import Recurring from '../pages/Recurring/Recurring';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';
import Admin from '../pages/Admin/Admin';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="monthly" element={<MonthlyTracker />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="income" element={<IncomePage />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="recurring" element={<Recurring />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
