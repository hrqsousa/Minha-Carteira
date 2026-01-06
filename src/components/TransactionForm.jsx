import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, addMonths, parseISO } from 'date-fns';
import { X, Calendar, User, CreditCard, Money, TextAlignLeft } from '@phosphor-icons/react';
import { CustomDropdown } from './CustomDropdown';
import { CustomDatePicker } from './CustomDatePicker';
import { ActionScopeModal } from './ActionScopeModal';

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

    const [showScopeModal, setShowScopeModal] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState(null);
    const { transactions } = useApp(); // Access transactions for finding group members

    const handleSubmit = async () => {
        if (!description || !rawAmount || !responsibleId) return;

        const finalAmount = Number(rawAmount) / 100;

        // If it's an update to a recurring/installment item
        if (existingTransaction && existingTransaction.groupId) {
            setPendingUpdate({
                description,
                amount: finalAmount,
                date,
                type,
                responsibleId,
                paymentMethodId,
                deferred
            });
            setShowScopeModal(true);
            return;
        }

        // Standard Create/Update Logic (No Scope)
        await processSubmit();
    };

    const processSubmit = async (scope = 'single', updateData = null) => {
        const dataToUse = updateData || {
            description,
            amount: Number(rawAmount) / 100,
            date,
            type,
            responsibleId,
            paymentMethodId,
            deferred
        };

        const groupId = existingTransaction?.groupId || crypto.randomUUID();
        const baseDate = parseISO(dataToUse.date);

        if (existingTransaction) {
            // *** UPDATE LOGIC ***
            if (scope === 'single') {
                await updateTransaction(existingTransaction.id, dataToUse);
            }
            else {
                // Batch Update
                // 1. Find targets
                const targets = transactions.filter(t => t.groupId === existingTransaction.groupId);

                // 2. Filter by scope
                const isFuture = scope === 'future';
                const currentBaseDate = parseISO(existingTransaction.date);

                const transactionsToUpdate = targets.filter(t => {
                    if (scope === 'all') return true;
                    // Future: Date >= current OR (same date and ID check - naive date check is usually enough for daily granularity)
                    // Better: Compare ISO strings
                    return t.date >= existingTransaction.date;
                });

                // 3. Calculate Date Shift (Delta)
                // We use time difference to shift everything equally
                const oldDateObj = parseISO(existingTransaction.date);
                const newDateObj = parseISO(dataToUse.date);
                const timeDiff = newDateObj.getTime() - oldDateObj.getTime();

                // 4. Apply Updates
                for (const t of transactionsToUpdate) {
                    const tOldDate = parseISO(t.date);
                    const tNewDate = new Date(tOldDate.getTime() + timeDiff);
                    const tNewDateStr = format(tNewDate, 'yyyy-MM-dd');

                    // Description logic: Preserve (X/Y) if it exists, but update the text part
                    let newDesc = dataToUse.description;
                    if (t.isInstallment && t.installmentNumber) {
                        // If the user changed the description, we want to use the new text but keep the OLD numbering
                        // Extract base description from NEW input (remove any potential X/Y user might have typed? No, user types base)
                        // Assumption: User input in form IS the new base (without X/Y because we strip it on load? No we don't strip it on load yet in this file, let's check)
                        // In useEffect load: setDescription(existingTransaction.description). This INCLUDES (1/5).
                        // We should probably strip it when editing so user just edits "Mercado" not "Mercado (1/5)".
                        // BUT for now, let's assume simple replace of the base part if we can detect it.

                        // Regex to split "Name (1/5)"
                        const matchOld = t.description.match(/(.*)\s\((\d+)\/(\d+)\)$/);
                        const matchInput = dataToUse.description.match(/(.*)\s\((\d+)\/(\d+)\)$/); // In case user left it in

                        const baseDesc = matchInput ? matchInput[1] : dataToUse.description;

                        // Re-attach THIS transaction's numbering
                        if (matchOld) {
                            newDesc = `${baseDesc} (${matchOld[2]}/${matchOld[3]})`;
                        } else {
                            // Fallback if regex fails (maybe user deleted suffix), just add current info
                            newDesc = `${baseDesc} (${t.installmentNumber}/${t.installmentCount})`;
                        }
                    }

                    await updateTransaction(t.id, {
                        ...dataToUse, // Apply all new fields (amount, type, etc)
                        date: tNewDateStr, // Shifted date
                        description: newDesc,
                        originalDate: t.isInstallment && t.installmentNumber === 1 ? tNewDateStr : t.originalDate // Update original date if we moved the first one? complex. Let's just update date.
                    });
                }
            }
        }
        else {
            // *** CREATE LOGIC (Unchanged mostly) ***
            if (isInstallment) {
                // ... (Existing Create Installment Logic)
                const finalAmount = dataToUse.amount;
                const count = installmentCount; // state

                for (let i = 0; i < count; i++) {
                    const tDate = addMonths(baseDate, i + (dataToUse.deferred ? 1 : 0));
                    await addTransaction({
                        description: `${dataToUse.description} (${i + 1}/${count})`,
                        amount: finalAmount / count,
                        type,
                        date: format(tDate, 'yyyy-MM-dd'),
                        responsibleId,
                        paymentMethodId,
                        isInstallment: true,
                        installmentCount: count,
                        installmentNumber: i + 1,
                        groupId,
                        deferred: false,
                        originalDate: dataToUse.date
                    });
                }
            }
            else if (isRecurring) {
                // ... (Existing Create Recurring Logic)
                const startIdx = dataToUse.deferred ? 1 : 0;
                const endIdx = startIdx + 24;
                for (let i = startIdx; i < endIdx; i++) {
                    const tDate = addMonths(baseDate, i);
                    await addTransaction({
                        description: dataToUse.description,
                        amount: dataToUse.amount,
                        type,
                        date: format(tDate, 'yyyy-MM-dd'),
                        responsibleId,
                        paymentMethodId,
                        isRecurring: true,
                        groupId
                    });
                }
            } else {
                await addTransaction({
                    ...dataToUse,
                    isRecurring: false,
                    isInstallment: false,
                    groupId: null // Single no group
                });
            }
        }

        onClose();
    };

    const handleConfirmScope = (scope) => {
        setShowScopeModal(false);
        if (pendingUpdate) {
            processSubmit(scope, pendingUpdate);
        }
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
                    <CustomDatePicker
                        value={date}
                        onChange={setDate}
                    />
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
                    <CustomDropdown
                        options={responsibles.map(r => ({ value: r.id, label: r.name }))}
                        value={responsibleId}
                        onChange={setResponsibleId}
                        icon={<User size={20} />}
                        placeholder="Selecione..."
                    />
                </div>

                <div className="input-group">
                    <label>Pagamento</label>
                    <CustomDropdown
                        options={paymentMethods.map(p => ({ value: p.id, label: p.name }))}
                        value={paymentMethodId}
                        onChange={setPaymentMethodId}
                        icon={<CreditCard size={20} />}
                        placeholder="Selecione..."
                    />
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
            /* ... (keep existing styles, just closing tag anchor) */
            /* Shortening for brevity in tool call, standard replacement works */
            
            .toggle-wrapper { display: flex; background: var(--border-color); padding: 4px; border-radius: var(--radius-md); gap: 4px; }
            .type-btn { flex: 1; padding: 10px; border-radius: var(--radius-sm); font-weight: 600; color: var(--text-secondary); transition: all 0.2s; }
            .type-btn.active.expense { background: var(--danger-color); color: white; box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3); }
            .type-btn.active.income { background: var(--success-color); color: white; box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3); }

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

            <ActionScopeModal
                isOpen={showScopeModal}
                onClose={() => setShowScopeModal(false)}
                onConfirm={handleConfirmScope}
            />
        </div>
    );
}
