import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, List, CreditCard, Gear, User } from '@phosphor-icons/react';
import logo from '../assets/logo.png'; // Make sure this exists
import { useApp } from '../context/AppContext';

import { PageTransition } from './PageTransition';

export function Layout({ children }) {
  const location = useLocation();
  const { user } = useApp();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/', icon: <House size={isDesktop ? 24 : 24} weight={location.pathname === '/' ? 'fill' : 'regular'} />, label: 'Visão Geral' },
    { path: '/transactions', icon: <List size={isDesktop ? 24 : 24} weight={location.pathname === '/transactions' ? 'fill' : 'regular'} />, label: 'Extrato' },
    { path: '/settings', icon: <Gear size={isDesktop ? 24 : 24} weight={location.pathname === '/settings' ? 'fill' : 'regular'} />, label: 'Configurações' },
  ];

  if (isDesktop) {
    return (
      <div className="desktop-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Logo" className="logo-small" />
            <span className="brand-name">Minha Carteira</span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="avatar">
                {user?.photoURL ? <img src={user.photoURL} alt="User" /> : <User />}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.displayName || 'Usuário'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        {!location.pathname.startsWith('/settings/') && <GlobalFab />}
        <TransactionModalWrapper />

        <style>{`
                .desktop-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--bg-color);
                    /* Fallback variables if index.css fails */
                    --nav-bg-glass: rgba(0, 0, 0, 0.5);
                    --sidebar-border: rgba(255, 255, 255, 0.12);
                    --sidebar-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
                }
                /* Light mode override for fallback */
                @media (prefers-color-scheme: light) {
                   .desktop-layout {
                        --nav-bg-glass: rgba(255, 255, 255, 0.7);
                        --sidebar-border: rgba(0, 0, 0, 0.12);
                        --sidebar-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
                   }
                }
                [data-theme="light"] .desktop-layout, 
                .desktop-layout[data-theme="light"] {
                    --nav-bg-glass: rgba(255, 255, 255, 0.7);
                    --sidebar-border: rgba(0, 0, 0, 0.12);
                    --sidebar-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
                }
                [data-theme="dark"] .desktop-layout,
                .desktop-layout[data-theme="dark"] {
                     --nav-bg-glass: rgba(0, 0, 0, 0.5);
                     --sidebar-border: rgba(255, 255, 255, 0.12);
                     --sidebar-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
                }
                .sidebar {
                    width: var(--sidebar-width);
                    background-color: var(--nav-bg-glass);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-right: 1px solid var(--sidebar-border);
                    box-shadow: var(--sidebar-shadow);
                    display: flex;
                    flex-direction: column;
                    padding: var(--spacing-lg);
                    position: sticky;
                    top: 0;
                    height: 100vh;
                    z-index: 100;
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 40px;
                }
                .logo-small {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                }
                .brand-name {
                    font-weight: 700;
                    font-size: 18px;
                    color: var(--text-primary);
                }
                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .sidebar-item:hover {
                    background-color: var(--bg-color);
                    color: var(--text-primary);
                }
                .sidebar-item.active {
                    background-color: rgba(0, 74, 173, 0.1); /* Primary with opacity */
                    color: var(--primary-color);
                }
                .sidebar-footer {
                    margin-top: auto;
                    padding-top: 20px;
                    border-top: 1px solid var(--border-color);
                }
                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background-color: var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .avatar img { width: 100%; height: 100%; object-fit: cover; }
                .user-name {
                    font-size: 14px;
                    font-weight: 600;
                }
                .main-content {
                    flex: 1;
                    padding: 0; /* Container handles padding */
                    overflow-y: auto;
                }
              `}</style>
      </div>
    );
  }

  // Mobile Layout
  return (
    // Import PageTransition (Requires import at top, added implicitly by user or helper tool? Must add manually)
    // Assuming helper function added import, but I must add it here in next step or use same step if possible. 
    // Splitting steps to be safe. 

    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, paddingBottom: 'calc(var(--bottom-nav-height) + 20px)' }}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {user && !location.pathname.startsWith('/settings/') && <GlobalFab />}
      {user && <TransactionModalWrapper />}

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Style omitted for brevity as it is unchanged */}
      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--bottom-nav-height);
          background-color: var(--nav-bg-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding-bottom: env(safe-area-inset-bottom);
          z-index: 1000;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.03); /* Lifted feel */
          /* border-top-left-radius: 20px; Removed for glass full width look if preferred, or keep small */
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
        }
        
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          gap: 6px;
          width: 100%;
          height: 100%;
          transition: color 0.2s;
        }
        
        .nav-item.active {
          color: var(--primary-color);
        }
      `}</style>
    </div>
  );
}

// Helper to keep Layout clean
import { Modal } from './Modal';
import { TransactionForm } from './TransactionForm';
import { GlobalFab } from './GlobalFab';

function TransactionModalWrapper() {
  const { isTransactionModalOpen, closeTransactionModal, editingTransaction } = useApp();
  return (
    <Modal isOpen={isTransactionModalOpen} onClose={closeTransactionModal} title={editingTransaction ? "Editar" : "Nova Transação"}>
      <TransactionForm existingTransaction={editingTransaction} onClose={closeTransactionModal} />
    </Modal>
  );
}
