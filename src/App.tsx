import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;

