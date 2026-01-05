import React from 'react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="modal-title">{title}</h3>
                <p className="modal-subtitle">{message}</p>

                <div className="flex-row">
                    <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button className="btn-confirm" onClick={() => { onConfirm(); onClose(); }}>Confirmar</button>
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2100;
                    padding: 20px;
                }
                .modal-content {
                    background: var(--surface-color); width: 100%; max-width: 320px;
                    border-radius: 24px; padding: 24px; text-align: center;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
                .modal-subtitle { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.4; }

                .flex-row { display: flex; gap: 12px; }
                .btn-cancel, .btn-confirm { flex: 1; padding: 12px; border-radius: var(--radius-full); font-weight: 600; font-size: 14px; transition: transform 0.1s; }
                
                .btn-cancel { background: var(--bg-color); color: var(--text-primary); }
                .btn-confirm { background: var(--danger-color); color: white; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3); }
                .btn-confirm:active, .btn-cancel:active { transform: scale(0.96); }

                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}
