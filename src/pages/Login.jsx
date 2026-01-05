import React from 'react';
import { GoogleLogo, Wallet } from '@phosphor-icons/react';
import { loginWithGoogle } from '../services/firebase';
import { useApp } from '../context/AppContext';
import logo from '../assets/logo.png';

export default function Login() {
  const { user } = useApp();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      alert("Erro ao fazer login. Verifique a configuração do Firebase.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="logo-section">
          <img src={logo} alt="Minha Carteira" className="app-logo" />
        </div>

        <div className="text-section">
          <h1 className="app-title">Minha Carteira</h1>
          <p className="app-subtitle">Controle financeiro inteligente e pessoal.</p>
        </div>

        <div className="action-section">
          <button className="btn-google" onClick={handleLogin}>
            <GoogleLogo size={24} weight="bold" />
            <span>Continuar com Google</span>
          </button>
        </div>

        <div className="footer-section">
          <p>Versão 2.0.0 • OneUI Design</p>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-color);
          background-image: radial-gradient(circle at 10% 20%, rgba(0, 74, 173, 0.1) 0%, transparent 20%),
                            radial-gradient(circle at 90% 80%, rgba(0, 74, 173, 0.1) 0%, transparent 20%);
          padding: 20px;
        }

        .login-card {
           background-color: var(--surface-color);
           padding: 48px;
           border-radius: 40px; /* Super rounded */
           box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
           text-align: center;
           width: 100%;
           max-width: 420px;
           display: flex;
           flex-direction: column;
           gap: 32px;
           transition: transform 0.3s ease;
        }
        
        .logo-section {
            display: flex;
            justify-content: center;
        }

        .app-logo {
            width: 100px;
            height: 100px;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0, 74, 173, 0.2);
        }

        .app-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .app-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background-color: var(--text-primary);
          color: var(--bg-color);
          padding: 18px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s, opacity 0.2s;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          width: 100%; /* Ensure full width for centering */
        }
        
        .btn-google:hover {
            transform: translateY(-2px);
            opacity: 0.95;
        }
        
        .btn-google:active {
            transform: scale(0.98);
        }

        .footer-section {
            margin-top: auto;
            font-size: 12px;
            color: var(--text-secondary);
            opacity: 0.6;
        }
        
        @media (max-width: 480px) {
            .login-card {
                padding: 32px 24px;
                border-radius: 32px;
            }
        }
      `}</style>
    </div>
  );
}
