import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';

export function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} color="var(--text-secondary)" />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-end; /* Bottom sheet style */
          justify-content: center;
          z-index: 2000;
          animation: fade-in 0.2s ease-out;
        }

        .modal-content {
          background-color: var(--surface-color);
          width: 100%;
          max-width: 600px; /* Tablet constraint */
          border-top-left-radius: var(--radius-lg);
          border-top-right-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          padding-bottom: calc(var(--spacing-lg) + env(safe-area-inset-bottom));
          max-height: 90vh; /* Don't cover entire screen */
          overflow-y: auto;
          position: relative;
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-md);
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
        }

        .close-button {
          background: none;
          padding: 8px;
          border-radius: 50%;
        }
        
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Desktop adjustment: Center modal instead of bottom sheet if desired, 
           but OneUI usually keeps bottom sheet or centered card. 
           Let's keep bottom sheet for mobile consistency. */
        @media (min-width: 768px) {
           .modal-overlay {
             align-items: center;
           }
           .modal-content {
             border-radius: var(--radius-lg);
             max-height: 80vh;
           }
        }
      `}</style>
        </div>
    );
}
