import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, addMonths, parseISO } from 'date-fns';
import { X, Calendar, User, CreditCard, Money, TextAlignLeft } from '@phosphor-icons/react';

export function TransactionForm({ existingTransaction, onClose }) {
    const { responsibles, paymentMethods, addTransaction, updateTransaction } = useApp();

    const [description, setDescription] = useState('');
    const [rawAmount, setRawAmount] = useState(''); // Stores cents integer (e.g. 1500 for 15.00)
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [type, setType] = useState('expense');
    const [responsibleId, setResponsibleId] = useState('');
    const [paymentMethodId, setPaymentMethodId] = useState('');

    // Advanced features
    const [isRecurring, setIsRecurring] = useState(false);
    const [isInstallment, setIsInstallment] = useState(false);
    const [installmentCount, setInstallmentCount] = useState(2);
    const [deferred, setDeferred] = useState(false);

    // Initial Load
    useEffect(() => {
        if (existingTransaction) {
            setDescription(existingTransaction.description);
            // Convert amount back to raw string (15.00 -> 1500)
            setRawAmount((existingTransaction.amount * 100).toFixed(0));
            setDate(existingTransaction.date);
            setType(existingTransaction.type);
            setResponsibleId(existingTransaction.responsibleId);
            setPaymentMethodId(existingTransaction.paymentMethodId);
            setIsRecurring(existingTransaction.isRecurring || false);
            setIsInstallment(existingTransaction.isInstallment || false);
            setInstallmentCount(existingTransaction.installmentCount || 2);
            setDeferred(existingTransaction.deferred || false);
        } else {
            // Defaults
            if (responsibles.length > 0) setResponsibleId(responsibles[0].id);
            if (paymentMethods.length > 0) setPaymentMethodId(paymentMethods[0].id);
        }
    }, [existingTransaction, responsibles, paymentMethods]);

    // Exclusive Toggles
    useEffect(() => { if (isRecurring) setIsInstallment(false); }, [isRecurring]);
    useEffect(() => { if (isInstallment) setIsRecurring(false); }, [isInstallment]);

    // Currency Mask Logic
    const handleAmountChange = (e) => {
        // Only allow digits
        const val = e.target.value.replace(/\D/g, '');
        setRawAmount(val);
    };

    const getFormattedAmount = () => {
        if (!rawAmount) return '';
        const number = Number(rawAmount) / 100;
        return number.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    };

    const handleSubmit = async () => {
        if (!description || !rawAmount || !responsibleId) return;

        const finalAmount = Number(rawAmount) / 100;
        const groupId = crypto.randomUUID();
        const baseDate = parseISO(date);

        if (isInstallment && !existingTransaction) {
            // Generate N installments
            const amountPerInstallment = finalAmount / installmentCount;

            for (let i = 0; i < installmentCount; i++) {
                const tDate = addMonths(baseDate, i + (deferred ? 1 : 0));

                await addTransaction({
                    description: `${description} (${i + 1}/${installmentCount})`,
                    amount: amountPerInstallment,
                    type,
                    date: format(tDate, 'yyyy-MM-dd'),
                    responsibleId,
                    paymentMethodId,
                    isInstallment: true,
                    installmentCount,
                    installmentNumber: i + 1,
                    groupId,
                    deferred: false
                });
            }
        }
        else if (isRecurring && !existingTransaction) {
            // Generate 12 months (limit for now to avoid spamming DB too much on first go, but user requested 24 logic, kept logic similar but firing calls)
            // Warning: 24 calls might be slow. Optimization: Batch write. 
            // For now, simple loop is fine for MVP persistence.
            const startIdx = deferred ? 1 : 0;
            const endIdx = startIdx + 24;

            for (let i = startIdx; i < endIdx; i++) {
                const tDate = addMonths(baseDate, i);
                await addTransaction({
                    description,
                    amount: finalAmount,
                    type,
                    date: format(tDate, 'yyyy-MM-dd'),
                    responsibleId,
                    paymentMethodId,
                    isRecurring: true,
                    groupId
                });
            }
        }
        else if (existingTransaction) {
            await updateTransaction(existingTransaction.id, {
                description,
                amount: finalAmount,
                date,
                type,
                responsibleId,
                paymentMethodId,
                deferred
            });
            onClose();
            return;
        }
        else {
            // Single Transaction
            await addTransaction({
                description,
                amount: finalAmount,
                type,
                date,
                responsibleId,
                paymentMethodId,
                isRecurring: false,
                deferred
            });
        }

        onClose();
    };

    return (
        <div className="form-content">
            {/* Type Toggle */}
            <div className="toggle-wrapper">
                <button className={`type-btn ${type === 'expense' ? 'active expense' : ''}`} onClick={() => setType('expense')}>Despesa</button>
                <button className={`type-btn ${type === 'income' ? 'active income' : ''}`} onClick={() => setType('income')}>Receita</button>
            </div>

            {/* Value & Date Row */}
            <div className="form-row">
                <div className="input-group">
                    <label>Valor</label>
                    <div className="input-container">
                        <span className="prefix">R$</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="flex-input amount-input"
                            value={getFormattedAmount()}
                            onChange={handleAmountChange}
                            placeholder="0,00"
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>Data</label>
                    <div className="input-container">
                        <Calendar className="icon" size={20} />
                        <input type="date" className="flex-input" value={date} onChange={e => setDate(e.target.value)} />
                        {/* Wrapper for CSS date indicator hack if needed, strictly input is fine */}
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="input-group full-width">
                <label>Descrição</label>
                <div className="input-container">
                    <TextAlignLeft className="icon" size={20} />
                    <input className="flex-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Mercado" />
                </div>
            </div>

            {/* Responsible & Method Row */}
            <div className="form-row">
                <div className="input-group">
                    <label>Responsável</label>
                    <div className="input-container">
                        <User className="icon" size={20} />
                        <select className="flex-input" value={responsibleId} onChange={e => setResponsibleId(e.target.value)}>
                            {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label>Pagamento</label>
                    <div className="input-container">
                        <CreditCard className="icon" size={20} />
                        <select className="flex-input" value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)}>
                            {paymentMethods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Advanced Toggles */}
            <div className="toggles-section">
                <div className="toggle-item">
                    <span className="toggle-label">Recorrente?</span>
                    <label className="switch">
                        <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} disabled={isInstallment} />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="toggle-item">
                    <span className="toggle-label">Parcelada?</span>
                    <label className="switch">
                        <input type="checkbox" checked={isInstallment} onChange={e => setIsInstallment(e.target.checked)} disabled={isRecurring || !!existingTransaction} />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="toggle-item">
                    <span className="toggle-label">Jogar p/ próximo mês?</span>
                    <label className="switch">
                        <input type="checkbox" checked={deferred} onChange={e => setDeferred(e.target.checked)} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {isInstallment && (
                <div className="installment-input">
                    <label>Nº Parcelas</label>
                    <input type="number" className="input-field-simple" value={installmentCount} onChange={e => setInstallmentCount(Number(e.target.value))} min="2" />
                </div>
            )}

            <button className="btn-primary" onClick={handleSubmit}>
                {existingTransaction ? 'Atualizar' : 'Salvar'}
            </button>

            <style>{`
            .form-content { display: flex; flex-direction: column; gap: 20px; }
            
            .toggle-wrapper { display: flex; background: var(--border-color); padding: 4px; border-radius: var(--radius-md); gap: 4px; }
            .type-btn { flex: 1; padding: 10px; border-radius: var(--radius-sm); font-weight: 600; color: var(--text-secondary); transition: all 0.2s; }
            .type-btn.active.expense { background: var(--surface-color); color: var(--danger-color); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .type-btn.active.income { background: var(--surface-color); color: var(--success-color); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

            .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            
            .input-group label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 500; }
            
            /* FLEX CONTAINER INPUT STYLE */
            .input-container {
                display: flex;
                align-items: center;
                gap: 12px;
                background: var(--bg-color);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                padding: 0 12px; /* Horizontal padding for container */
                height: 52px; /* Fixed height for consistency */
                transition: border-color 0.2s;
            }
            .input-container:focus-within { border-color: var(--primary-color); }

            .icon { color: var(--text-secondary); flex-shrink: 0; }
            .prefix { color: var(--text-primary); font-weight: 600; font-size: 18px; flex-shrink: 0; margin-right: -4px; }
            
            .flex-input {
                flex: 1;
                border: none;
                background: transparent;
                height: 100%;
                font-size: 16px;
                color: var(--text-primary);
                font-family: inherit;
                outline: none;
                min-width: 0; /* Fix flex overflow */
            }
            .amount-input { font-weight: 700; font-size: 20px; }

            /* Standard simple input for non-icon fields if any */
            .input-field-simple {
                width: 100%; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-primary); font-size: 16px; outline: none;
            }

            .toggles-section { background: var(--bg-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--border-color); }
            .toggle-item { display: flex; justify-content: space-between; align-items: center; }
            .toggle-label { font-size: 14px; font-weight: 500; }
            
            /* Switch CSS */
            .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-color); transition: .4s; border-radius: 34px; }
            .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
            input:checked + .slider { background-color: var(--primary-color); }
            input:checked + .slider:before { transform: translateX(20px); }
            
            .btn-primary {
                width: 100%;
                padding: 16px;
                border-radius: var(--radius-full);
                background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover));
                color: white;
                font-weight: 700;
                font-size: 16px;
                margin-top: 8px;
                box-shadow: 0 8px 20px rgba(0, 74, 173, 0.25);
            }
            .btn-primary:active { transform: scale(0.98); }
            `}</style>
        </div>
    );
}
