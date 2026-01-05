import React, { useState, useMemo, useEffect } from 'react';
import { format, isToday, isYesterday, parseISO, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { TrendUp, TrendDown, Pencil, Trash, MagnifyingGlass, Funnel, Infinity, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { ConfirmModal } from './ConfirmModal';
import { DeleteScopeModal } from './DeleteScopeModal';
import { useLocation } from 'react-router-dom';

export function TransactionList({ onEdit, onDelete }) {
    const { transactions, deleteTransaction, responsibles, paymentMethods, currentDate, setCurrentDate } = useApp();
    const location = useLocation();

    // Local Filters
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [respFilter, setRespFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Initial Filter from Navigation
    useEffect(() => {
        if (location.state?.paymentMethodId) {
            setMethodFilter(location.state.paymentMethodId);
            setShowFilters(true);
        }
    }, [location.state]);

    // Delete Modal State
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [simpleDeleteId, setSimpleDeleteId] = useState(null);

    // Month Nav
    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Date Filter (Global Month)
            let tDate = parseISO(t.date);
            if (t.deferred) tDate = addMonths(tDate, 1);
            if (!isSameMonth(tDate, currentDate)) return false;

            // Type Filter
            if (typeFilter !== 'all' && t.type !== typeFilter) return false;

            // Responsible Filter
            if (respFilter !== 'all' && t.responsibleId !== respFilter) return false;

            // Method Filter
            if (methodFilter !== 'all' && t.paymentMethodId !== methodFilter) return false;

            // Search
            if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;

            return true;
        });
    }, [transactions, currentDate, typeFilter, respFilter, methodFilter, search]);

    const groupedTransactions = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        .reduce((groups, transaction) => {
            const date = transaction.date;
            if (!groups[date]) groups[date] = [];
            groups[date].push(transaction);
            return groups;
        }, {});

    const getResponsibleName = (id) => responsibles.find(r => r.id === id)?.name || 'N/A';
    const getPaymentMethodName = (id) => paymentMethods.find(p => p.id === id)?.name || 'N/A';

    const formatDateHeader = (dateStr) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return 'Hoje';
        if (isYesterday(date)) return 'Ontem';
        return format(date, "dd 'de' MMMM", { locale: ptBR });
    };

    const handleDeleteClick = (e, t) => {
        e.stopPropagation();
        if (t.groupId) {
            setTransactionToDelete(t);
        } else {
            setSimpleDeleteId(t.id);
        }
    };

    const handleConfirmSimpleDelete = async () => {
        if (simpleDeleteId) {
            await deleteTransaction(simpleDeleteId);
            setSimpleDeleteId(null);
        }
    };

    const handleConfirmDeleteScope = async (scope) => {
        if (!transactionToDelete) return;

        const t = transactionToDelete;

        if (scope === 'single') {
            await deleteTransaction(t.id);
        } else if (scope === 'future') {
            // Delete same GroupID AND Date >= Selected Date
            // Note: This logic is tricky with just client-side filtering + individual delete calls.
            // Ideal: Backend batch delete.
            // MVP: Filter locally and fire deletes.
            const toDelete = transactions.filter(tr => {
                if (tr.groupId !== t.groupId) return false;
                return new Date(tr.date) >= new Date(t.date); // Fix logic to include current and future
            });

            for (const tr of toDelete) {
                await deleteTransaction(tr.id);
            }

        } else if (scope === 'all') {
            const toDelete = transactions.filter(tr => tr.groupId === t.groupId);
            for (const tr of toDelete) {
                await deleteTransaction(tr.id);
            }
        }

        setTransactionToDelete(null);
    };

    return (
        <div className="transaction-list-wrapper">

            {/* Month Nav for List */}
            <div className="month-nav-pill">
                <button onClick={handlePrevMonth} className="icon-btn"><CaretLeft size={20} /></button>
                <span className="month-label">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
                <button onClick={handleNextMonth} className="icon-btn"><CaretRight size={20} /></button>
            </div>

            {/* Filters Bar */}
            <div className="filter-bar">
                <div className="search-box">
                    <MagnifyingGlass size={18} className="search-icon" />
                    <input
                        placeholder="Buscar..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className={`filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                    <Funnel size={18} />
                </button>
            </div>

            {showFilters && (
                <div className="filters-row-col">
                    <div className="filters-row">
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="all">Todos Tipos</option>
                            <option value="income">Receitas</option>
                            <option value="expense">Despesas</option>
                        </select>
                        <select value={respFilter} onChange={e => setRespFilter(e.target.value)}>
                            <option value="all">Todos Responsáveis</option>
                            {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="filters-row">
                        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} style={{ width: '100%' }}>
                            <option value="all">Todos Meios</option>
                            {paymentMethods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {Object.keys(groupedTransactions).length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum lançamento neste mês.</p>
                </div>
            ) : (
                Object.keys(groupedTransactions).map(date => (
                    <div key={date} className="date-group">
                        <h3 className="date-header">{formatDateHeader(date)}</h3>
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {groupedTransactions[date].map((t, index) => (
                                <div key={t.id} className="transaction-item" style={{
                                    borderBottom: index === groupedTransactions[date].length - 1 ? 'none' : '1px solid var(--border-color)'
                                }} onClick={() => onEdit(t)}>
                                    <div className="item-left">
                                        <div className="item-icon" style={{
                                            backgroundColor: t.type === 'income' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                            color: t.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)'
                                        }}>
                                            {t.type === 'income' ? <TrendUp size={20} weight="bold" /> : <TrendDown size={20} weight="bold" />}
                                        </div>
                                        <div className="item-info">
                                            <div className="item-desc">
                                                {t.description}
                                                {t.installmentCount > 1 && <span className="badge">{t.installmentNumber}/{t.installmentCount}</span>}
                                                {t.isRecurring && <span className="badge badge-blue"><Infinity size={12} weight="bold" /></span>}
                                            </div>
                                            <div className="item-meta">
                                                {getResponsibleName(t.responsibleId)} • {getPaymentMethodName(t.paymentMethodId)}
                                                {t.deferred && <span className="badge deferred">Próx. Mês</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="item-right">
                                        <div className={`item-amount ${t.type}`}>
                                            {t.type === 'expense' ? '-' : '+'} {Number(t.amount).toFixed(2)}
                                        </div>
                                        <div className="item-actions">
                                            <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(t); }}>
                                                <Pencil size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={(e) => handleDeleteClick(e, t)}>
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            <ConfirmModal
                isOpen={!!simpleDeleteId}
                onClose={() => setSimpleDeleteId(null)}
                onConfirm={handleConfirmSimpleDelete}
                title="Excluir Transação"
                message="Tem certeza que deseja apagar este registro?"
            />

            <DeleteScopeModal
                isOpen={!!transactionToDelete}
                onClose={() => setTransactionToDelete(null)}
                onConfirm={handleConfirmDeleteScope}
            />

            <style>{`
        .month-nav-pill {
            display: flex; align-items: center; justify-content: center; gap: 16px;
            background-color: var(--surface-color);
            padding: 8px 24px;
            border-radius: var(--radius-full);
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
            margin: 0 auto 24px;
            width: fit-content;
        }
        .month-label { font-weight: 600; text-transform: capitalize; color: var(--text-primary); font-size: 14px; min-width: 120px; text-align: center; }
        .icon-btn { background: none; border: none; color: var(--text-secondary); display: flex; padding: 4px; border-radius: 50%; cursor: pointer; transition: background 0.2s; }
        .icon-btn:hover { background: var(--bg-hover); color: var(--primary-color); }
        
        .list-month-nav { display: none; } /* Legacy cleanup if needed or just replace */
        
        .filter-bar { display: flex; gap: 12px; margin-bottom: 12px; }
        .search-box { flex: 1; background: var(--surface-color); border-radius: var(--radius-full); padding: 8px 16px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .search-box input { border: none; background: transparent; outline: none; width: 100%; color: var(--text-primary); }
        .filter-toggle { width: 40px; height: 40px; border-radius: 50%; background: var(--surface-color); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .filter-toggle.active { background: var(--primary-color); color: white; }
        
        .filters-row-col { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; animation: slideDown 0.2s; }
        .filters-row { display: flex; gap: 12px; }
        .filters-row select { flex: 1; padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--surface-color); color: var(--text-primary); }
        
        .date-header { font-size: 13px; color: var(--text-secondary); margin: 16px 8px 8px; text-transform: capitalize; font-weight: 600; }
        .transaction-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; cursor: pointer; transition: background 0.2s; }
        .transaction-item:hover { background-color: rgba(0,0,0,0.01); }
        
        .item-left { display: flex; align-items: center; gap: 12px; }
        .item-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .item-info { display: flex; flex-direction: column; gap: 4px; }
        .item-desc { font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 6px; }
        .item-meta { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }
        
        .badge { font-size: 10px; background: var(--border-color); padding: 2px 6px; border-radius: 6px; font-weight: 600; opacity: 0.8; display: flex; align-items: center; }
        .badge.deferred { background: var(--warning-color); color: black; }
        .badge-blue { background-color: rgba(0, 74, 173, 0.1); color: var(--primary-color); }
        
        .item-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .item-amount { font-weight: 700; font-size: 15px; }
        .item-amount.income { color: var(--success-color); }
        .item-amount.expense { color: var(--text-primary); }
        
        .item-actions { display: flex; gap: 8px; margin-top: 4px; opacity: 0.5; transition: opacity 0.2s; }
        .transaction-item:hover .item-actions { opacity: 1; }
        .action-btn { padding: 6px; border-radius: 6px; background: var(--border-color); color: var(--text-secondary); display: flex; }
        .action-btn:hover { background: var(--bg-color); color: var(--text-primary); }
        .action-btn.delete:hover { color: var(--danger-color); }

        .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); font-style: italic; }
        
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
        </div>
    );
}
