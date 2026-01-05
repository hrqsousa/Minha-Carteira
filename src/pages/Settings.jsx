import React from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, User, CaretRight, SignOut, Users, CreditCard } from '@phosphor-icons/react';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { theme, toggleTheme, user } = useApp();
    const navigate = useNavigate();

    return (
        <div className="container" style={{ paddingBottom: '120px' }}>
            <h1 className="title-large">Configurações</h1>

            {/* Profile Section */}
            <h2 className="section-title">Perfil</h2>
            <div className="settings-card profile-card">
                <div className="profile-info">
                    <div className="profile-avatar">
                        {user?.photoURL ? <img src={user.photoURL} alt="User" /> : <User size={32} />}
                    </div>
                    <div className="profile-details">
                        <span className="profile-name">{user?.displayName || 'Usuário'}</span>
                        <span className="profile-email">{user?.email}</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={() => auth.signOut()}>
                    <SignOut size={20} />
                    Sair
                </button>
            </div>

            {/* Appearance Section */}
            <h2 className="section-title">Aparência</h2>
            <div className="settings-card hover-card" onClick={toggleTheme}>
                <div className="card-icon-wrapper" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                    {theme === 'dark' ? <Moon size={24} weight="fill" /> : <Sun size={24} weight="fill" />}
                </div>
                <div className="card-content">
                    <h3>Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</h3>
                    <p>Alternar aparência do app</p>
                </div>
                <div className="card-action">
                    <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}>
                        <div className="toggle-thumb" />
                    </div>
                </div>
            </div>

            {/* Management Section */}
            <h2 className="section-title">Gerenciar</h2>

            <div className="settings-group">
                <div className="settings-card hover-card nav-card" onClick={() => navigate('/settings/responsibles')}>
                    <div className="card-icon-wrapper" style={{ background: 'rgba(0, 74, 173, 0.1)', color: 'var(--primary-color)' }}>
                        <Users size={24} weight="fill" />
                    </div>
                    <div className="card-content">
                        <h3>Responsáveis</h3>
                        <p>Gerenciar lista de nomes</p>
                    </div>
                    <CaretRight size={20} className="nav-arrow" />
                </div>

                <div className="separator" />

                <div className="settings-card hover-card nav-card" onClick={() => navigate('/settings/payment-methods')}>
                    <div className="card-icon-wrapper" style={{ background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success-color)' }}>
                        <CreditCard size={24} weight="fill" />
                    </div>
                    <div className="card-content">
                        <h3>Meios de Pagamento</h3>
                        <p>Gerenciar formas de pagamento</p>
                    </div>
                    <CaretRight size={20} className="nav-arrow" />
                </div>
            </div>

            {/* About Section */}
            <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Minha Carteira</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', opacity: 0.7 }}>Versão 2.0.0</p>
            </div>

            <style>{`
                .section-title { font-size: 14px; color: var(--text-secondary); margin: 24px 8px 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                
                .settings-card {
                    background: var(--surface-color);
                    border-radius: 20px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                    border: 1px solid var(--border-color);
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                }
                
                .hover-card:active { transform: scale(0.98); background: var(--bg-hover); }
                
                .profile-card { flex-direction: column; align-items: stretch; gap: 20px; cursor: default; }
                .profile-info { display: flex; align-items: center; gap: 16px; }
                .profile-avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--border-color); display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .profile-details { display: flex; flex-direction: column; gap: 2px; }
                .profile-name { font-size: 18px; font-weight: 700; color: var(--text-primary); }
                .profile-email { font-size: 13px; color: var(--text-secondary); }
                
                .btn-logout {
                    background: rgba(220, 53, 69, 0.1); color: var(--danger-color); border: none; padding: 12px;
                    border-radius: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;
                    cursor: pointer; transition: background 0.2s;
                }
                .btn-logout:hover { background: rgba(220, 53, 69, 0.2); }

                .card-icon-wrapper { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--text-primary); flex-shrink: 0; }
                .card-content { flex: 1; min-width: 0; }
                .card-content h3 { font-size: 16px; font-weight: 600; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .card-content p { font-size: 13px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .toggle-switch { width: 48px; height: 28px; background: var(--border-color); border-radius: 14px; position: relative; transition: background 0.3s; }
                .toggle-switch.active { background: var(--success-color); }
                .toggle-thumb { width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                .toggle-switch.active .toggle-thumb { left: 23px; }

                .settings-group { border-radius: 20px; overflow: hidden; background: var(--surface-color); border: 1px solid var(--border-color); display: flex; flex-direction: column; }
                .nav-card { border-radius: 0; border: none; box-shadow: none; }
                .separator { height: 1px; background: var(--border-color); margin: 0 16px; }
                .nav-arrow { color: var(--text-secondary); opacity: 0.5; }

            `}</style>
        </div>
    );
}
