import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionList } from '../components/TransactionList';

export default function TransactionsPage() {
    const { openTransactionModal } = useApp();

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div className="flex-between">
                <h1 className="title-large">Extrato</h1>
            </div>

            <TransactionList onEdit={(t) => openTransactionModal(t)} />
        </div>
    );
}
