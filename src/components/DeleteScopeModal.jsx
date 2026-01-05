import React from 'react';
import { Trash, Clock, Stack } from '@phosphor-icons/react';

export function DeleteScopeModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="modal-title">Excluir Repetição?</h3>
                <p className="modal-subtitle">Esta transação faz parte de uma recorrência.</p>

                <div className="scope-options">
                    <button className="scope-btn" onClick={() => onConfirm('single')}>
                        <div className="scope-icon"><Trash size={24} /></div>
                        <div className="scope-text">
                            <strong>Apenas esta</strong>
                            <span>Exclui somente este lançamento</span>
                        </div>
                    </button>

                    <button className="scope-btn" onClick={() => onConfirm('future')}>
                        <div className="scope-icon"><Clock size={24} /></div>
                        <div className="scope-text">
                            <strong>Desta em diante</strong>
                            <span>Exclui esta e as futuras</span>
                        </div>
                    </button>

                    <button className="scope-btn" onClick={() => onConfirm('all')}>
                        <div className="scope-icon"><Stack size={24} /></div>
                        <div className="scope-text">
                            <strong>Todas</strong>
                            <span>Exclui toda a série</span>
                        </div>
                    </button>
                </div>

                <button className="btn-cancel" onClick={onClose}>Cancelar</button>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; z-index: 2000;
                }
                .modal-content {
                    background: var(--surface-color); width: 100%; max-width: 600px;
                    border-top-left-radius: 24px; border-top-right-radius: 24px;
                    padding: 24px; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .modal-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; text-align: center; color: var(--text-primary); }
                .modal-subtitle { text-align: center; color: var(--text-secondary); margin-bottom: 24px; font-size: 14px; }

                .scope-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
                .scope-btn {
                    display: flex; align-items: center; gap: 16px; padding: 16px;
                    background: var(--bg-color); border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg); text-align: left; transition: all 0.2s;
                    cursor: pointer;
                    width: 100%;
                }
                .scope-btn:hover { border-color: var(--primary-color); background: rgba(0, 74, 173, 0.05); }
                .scope-icon { 
                    width: 40px; height: 40px; border-radius: 12px; 
                    background: var(--surface-color); display: flex; align-items: center; justify-content: center;
                    color: var(--primary-color);
                }
                .scope-text strong { display: block; font-size: 15px; margin-bottom: 2px; color: var(--text-primary); }
                .scope-text span { font-size: 12px; color: var(--text-secondary); }

                .btn-cancel { width: 100%; padding: 16px; font-weight: 600; color: var(--text-secondary); background: transparent; border: none; cursor: pointer; }
                .btn-cancel:hover { color: var(--text-primary); }

                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}</style>
        </div>
    );
}
