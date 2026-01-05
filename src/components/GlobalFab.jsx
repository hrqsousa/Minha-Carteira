import React from 'react';
import { Plus } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export function GlobalFab() {
    const { openTransactionModal } = useApp();

    return (
        <>
            <button className="fab" onClick={() => openTransactionModal()}>
                <Plus size={24} color="white" weight="bold" />
            </button>

            <style>{`
        .fab {
            position: fixed;
            bottom: calc(var(--bottom-nav-height) + 20px);
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 100;
            transition: transform 0.2s;
            border: none;
            outline: none;
        }
        .fab:active {
            transform: scale(0.95);
        }
        
        @media (min-width: 768px) {
            .fab {
                bottom: 40px;
                right: 40px;
            }
        }
      `}</style>
        </>
    );
}
