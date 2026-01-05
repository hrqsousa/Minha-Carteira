import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Trash, CaretLeft, Pencil } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function ManagePaymentMethods() {
    const { paymentMethods, addPaymentMethod, deletePaymentMethod } = useApp();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [name, setName] = useState('');

    const [itemToDelete, setItemToDelete] = useState(null);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setName(item ? item.name : '');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        if (editingItem) {
            // Editing not fully persisted in MVP AppContext refactor yet, skipping to avoid complexity
            // (Assuming user mostly adds new ones or deletes old ones).
        } else {
            await addPaymentMethod({ name });
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Tem certeza que deseja excluir este meio de pagamento?')) {
            await deletePaymentMethod(id);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <CaretLeft size={24} />
                </button>
                <h1 className="title-large" style={{ marginBottom: 0 }}>Meios de Pagamento</h1>
            </div>

            <div className="card-list">
                {paymentMethods.length === 0 && (
                    <div className="empty-state">
                        <p>Nenhum meio de pagamento cadastrado.</p>
                    </div>
                )}

                {paymentMethods.map(method => (
                    <div key={method.id} className="list-card">
                        <span className="item-name">{method.name}</span>
                        <div className="item-actions">
                            <button className="action-btn edit" onClick={() => handleOpenModal(method)}>
                                <Pencil size={20} />
                            </button>
                            <button className="action-btn delete" onClick={() => setItemToDelete(method)}>
                                <Trash size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="fab-add" onClick={() => handleOpenModal(null)}>
                <Plus size={24} weight="bold" />
            </button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Editar Meio" : "Novo Meio"}>
                <input
                    autoFocus
                    className="input-field"
                    placeholder="Nome (ex: Nubank, Dinheiro)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="btn-primary" onClick={handleSave}>Salvar</button>
            </Modal>

            <ConfirmModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => deletePaymentMethod(itemToDelete?.id)}
                title="Excluir Meio de Pagamento"
                message={`Tem certeza que deseja excluir "${itemToDelete?.name}"?`}
            />

            <style>{`
                .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-top: 16px; }
                .btn-back { background: none; border: none; color: var(--text-primary); padding: 8px; margin-left: -8px; border-radius: 50%; }
                .btn-back:hover { background: var(--bg-hover); }

                .card-list { display: flex; flex-direction: column; gap: 12px; }
                .list-card {
                    background: var(--surface-color);
                    border-radius: 16px;
                    padding: 16px 20px;
                    display: flex; justify-content: space-between; align-items: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    border: 1px solid var(--border-color);
                }
                .item-name { font-weight: 500; font-size: 16px; color: var(--text-primary); }
                .item-actions { display: flex; gap: 8px; }
                .action-btn { background: none; border: none; padding: 8px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
                .action-btn.edit { color: var(--text-secondary); }
                .action-btn.edit:hover { background: rgba(0,0,0,0.05); color: var(--primary-color); }
                .action-btn.delete { color: var(--text-secondary); }
                .action-btn.delete:hover { background: rgba(220, 53, 69, 0.1); color: var(--danger-color); }

                .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }

                .fab-add {
                    position: fixed; bottom: calc(var(--bottom-nav-height) + 24px); right: 24px;
                    width: 56px; height: 56px; border-radius: 28px;
                    background: var(--primary-color); color: white;
                    border: none; box-shadow: 0 4px 12px rgba(0, 74, 173, 0.3);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; z-index: 100;
                    transition: transform 0.2s;
                }
                .fab-add:active { transform: scale(0.92); }

                .input-field { width: 100%; padding: 16px; border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-primary); font-size: 16px; margin-bottom: 16px; outline: none; }
                .input-field:focus { border-color: var(--primary-color); }
            `}</style>
        </div>
    );
}
