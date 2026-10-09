import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import QuickAddModal from '../forms/QuickAddModal';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchNotifications } from '../../redux/slices/notificationSlice';
import { applyThemeToDOM } from '../../redux/slices/uiSlice';

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    applyThemeToDOM(theme);
    dispatch(fetchNotifications());
  }, [dispatch, theme]);

  return (
    <div className="app-container">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar />

      {/* Main App Content Viewport */}
      <div className="main-wrapper">
        <Header />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Quick Add Bottom Sheet / Modal */}
      <QuickAddModal />
    </div>
  );
};

export default AppLayout;
