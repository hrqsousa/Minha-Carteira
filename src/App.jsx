import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';

import Settings from './pages/Settings';
import TransactionsPage from './pages/Transactions';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManageResponsibles from './pages/ManageResponsibles';
import ManagePaymentMethods from './pages/ManagePaymentMethods';

// Auth Guard Component
function AuthGuard({ children }) {
  const { user, authLoading } = useApp();

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;

  if (!user) return <Login />;

  return <Layout>{children}</Layout>; // Only layout if logged in
}

import { AnimatePresence } from 'framer-motion';

function App() {
  console.log('App component rendering');
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}

// Separate component to use hook
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/transactions" element={<AuthGuard><TransactionsPage /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        <Route path="/settings/responsibles" element={<AuthGuard><ManageResponsibles /></AuthGuard>} />
        <Route path="/settings/payment-methods" element={<AuthGuard><ManagePaymentMethods /></AuthGuard>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
