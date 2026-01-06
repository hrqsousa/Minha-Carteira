import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, subMonths, isSameMonth, parseISO, addMonths, startOfDay, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CaretLeft, CaretRight, Eye, EyeSlash, Wallet, TrendUp, TrendDown } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';

import { CustomDropdown } from '../components/CustomDropdown';

export default function Dashboard() {
    const { transactions, responsibles, paymentMethods, currentDate, setCurrentDate } = useApp();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [selectedRespId, setSelectedRespId] = useState('all');

    // Prepare options for dropdown
    const responsibleOptions = [
        { value: 'all', label: 'Visão Geral' },
        ...responsibles.map(r => ({ value: r.id, label: r.name }))
    ];

    const [hideValues, setHideValues] = useState(false);

    // Month Navigation
    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            let effectiveDate = parseISO(t.date);
            if (t.deferred) {
                effectiveDate = addMonths(effectiveDate, 1);
            }
            const inMonth = isSameMonth(effectiveDate, currentDate);
            const matchesResp = selectedRespId === 'all' || t.responsibleId === selectedRespId;
            return inMonth && matchesResp;
        });
    }, [transactions, currentDate, selectedRespId]);

    // Payment Methods Data (Pie Chart)
    const methodStats = useMemo(() => {
        const today = startOfDay(new Date());
        const methodTotals = transactions
            .filter(t => {
                let tDate = parseISO(t.date);
                if (t.deferred) tDate = addMonths(tDate, 1);

                // Must be in current view month
                if (!isSameMonth(tDate, currentDate)) return false;

                // Must be expense
                if (t.type !== 'expense') return false;

                // Check future logic
                const isFuture = isAfter(tDate, today);
                if (isFuture && !t.isInstallment && !t.deferred) return false;

                return true;
            })
            .reduce((acc, t) => {
                const id = t.paymentMethodId;
                if (!acc[id]) acc[id] = 0;
                acc[id] += Number(t.amount);
                return acc;
            }, {});

        const sorted = Object.keys(methodTotals)
            .sort((a, b) => methodTotals[b] - methodTotals[a])
            .map(id => ({
                id,
                name: paymentMethods.find(p => p.id === id)?.name || 'Outro',
                value: methodTotals[id]
            }));

        return sorted;
    }, [transactions, currentDate, paymentMethods]);

    const COLORS = ['#004aad', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6610f2'];

    // Totals
    const totals = useMemo(() => {
        let income = 0;
        let expense = 0;
        filteredTransactions.forEach(t => {
            if (t.type === 'income') income += Number(t.amount);
            else expense += Number(t.amount);
        });
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);

    // Chart Data (Last 6 months)
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(currentDate, i);
            let inc = 0;
            let exp = 0;

            transactions.forEach(t => {
                let tDate = parseISO(t.date);
                if (t.deferred) tDate = addMonths(tDate, 1);

                if (isSameMonth(tDate, d) && (selectedRespId === 'all' || t.responsibleId === selectedRespId)) {
                    if (t.type === 'income') inc += Number(t.amount);
                    else exp += Number(t.amount);
                }
            });

            data.push({
                name: format(d, 'MMM', { locale: ptBR }),
                Receitas: inc,
                Despesas: exp
            });
        }
        return data;
    }, [transactions, currentDate, selectedRespId]);

    const handleCardClick = (methodId) => {
        navigate('/transactions', { state: { paymentMethodId: methodId } });
    };

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>

            {/* Header & Filter */}
            <div className="dashboard-header">
                <div className="month-selector">
                    <button onClick={handlePrevMonth} className="icon-btn"><CaretLeft size={20} /></button>
                    <h2 className="month-title">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h2>
                    <button onClick={handleNextMonth} className="icon-btn"><CaretRight size={20} /></button>
                </div>

                <div className="filter-wrapper">
                    <CustomDropdown
                        options={responsibleOptions}
                        value={selectedRespId}
                        onChange={setSelectedRespId}
                    />
                </div>
            </div>

            {/* Hero Balance Card */}
            <div className="hero-card">
                <div className="hero-content">
                    <span className="hero-label">Saldo Atual</span>
                    <div className="hero-value-row">
                        <h1 className="hero-value" style={{ color: totals.balance < 0 ? '#ff8080' : 'white' }}>
                            {hideValues ? '••••••' : `R$ ${totals.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </h1>
                        <button onClick={() => setHideValues(!hideValues)} className="hero-eye">
                            {hideValues ? <EyeSlash size={24} /> : <Eye size={24} />}
                        </button>
                    </div>
                </div>
                <div className="hero-icon">
                    <Wallet weight="duotone" />
                </div>
            </div>

            <div className="dashboard-grid">

                {/* Stats Column */}
                <div className="grid-col-stats">
                    <div className="stat-card income">
                        <div className="stat-icon income"><TrendUp weight="bold" /></div>
                        <div>
                            <span className="stat-label">Receitas</span>
                            <div className="stat-value">{hideValues ? '••••' : `R$ ${totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
                        </div>
                    </div>
                    <div className="stat-card expense">
                        <div className="stat-icon expense"><TrendDown weight="bold" /></div>
                        <div>
                            <span className="stat-label">Despesas</span>
                            <div className="stat-value">{hideValues ? '••••' : `R$ ${totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
                        </div>
                    </div>

                    {/* Payment Methods (Cartões - With Future Logic) */}
                    <div className="card method-card">
                        <h3 className="section-title">Cartões</h3>

                        {/* Donut Chart */}
                        {methodStats.length > 0 && (
                            <div style={{ width: '100%', height: 200, marginBottom: '24px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={methodStats}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {methodStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--surface-color)" strokeWidth={2} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                            contentStyle={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ color: 'var(--text-primary)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        <div className="method-list">
                            {methodStats.length === 0 ? (
                                <p className="empty-msg">Sem dados</p>
                            ) : (
                                methodStats.slice(0, 4).map((item, index) => (
                                    <div key={item.id} className="method-item click-effect" onClick={() => handleCardClick(item.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="method-name">{item.name}</span>
                                        </div>
                                        <span className="method-val">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart Column */}
                <div className="grid-col-chart">
                    <div className="card chart-card">
                        <h3 className="section-title">Evolução Recente</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    contentStyle={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                    cursor={{ fill: 'var(--bg-color)' }}
                                />
                                <Bar dataKey="Receitas" fill="var(--success-color)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="Despesas" fill="var(--danger-color)" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="recent-list">
                        <div className="flex-between">
                            <h3 className="section-title">Últimas</h3>
                            <a href="/transactions" style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: '600' }}>Ver tudo</a>
                        </div>
                        {filteredTransactions
                            .filter(t => !isAfter(parseISO(t.date), startOfDay(new Date())))
                            .slice(0, 4)
                            .map(t => {
                                const respName = responsibles.find(r => r.id === t.responsibleId)?.name || 'N/A';
                                const methodName = paymentMethods.find(p => p.id === t.paymentMethodId)?.name || 'N/A';
                                return (
                                    <div key={t.id} className="recent-item">
                                        <div className="recent-info">
                                            <div className="recent-desc">
                                                {t.description}
                                                <span className="recent-subtitle">{respName} • {methodName}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className={`recent-amount ${t.type}`}>
                                                {t.type === 'expense' ? '-' : '+'} {hideValues ? '•••' : Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </div>
                                            <div className="recent-date">{format(parseISO(t.date), 'dd MMM', { locale: ptBR })}</div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

            </div>

            <style>{`
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        .month-selector {
            display: flex;
            align-items: center;
            gap: 12px;
            background-color: var(--surface-color);
            padding: 8px 16px;
            border-radius: var(--radius-full);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .month-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: capitalize;
            min-width: 100px;
            text-align: center;
        }
        .icon-btn {
            background: none;
            color: var(--text-secondary);
            display: flex;
        }
        .filter-wrapper { position: relative; }
        .filter-select {
            appearance: none;
            -webkit-appearance: none;
            background-color: var(--surface-color);
            border: 1px solid transparent;
            padding: 8px 36px 8px 16px;
            border-radius: var(--radius-full);
            font-size: 14px;
            color: var(--text-primary);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            cursor: pointer;
            font-weight: 500;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 256 256'%3E%3Cpath d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L96,132.69l42.34-42.35a8,8,0,0,1,11.32,11.32Z'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            transition: border-color 0.2s;
        }
        .filter-select:hover { border-color: var(--border-color); }
        .filter-select:focus { outline: none; border-color: var(--primary-color); }

        /* Hero Card */
        .hero-card {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-hover) 100%);
            border-radius: var(--radius-lg);
            padding: 32px;
            color: white;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 74, 173, 0.3);
            margin-bottom: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .hero-label {
            font-size: 14px;
            opacity: 0.8;
            font-weight: 500;
            display: block;
            margin-bottom: 8px;
        }
        .hero-value-row {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .hero-value {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: -1px;
            transition: color 0.3s;
        }
        .hero-eye {
            background: rgba(255,255,255,0.2);
            padding: 8px;
            border-radius: 50%;
            color: white;
            transition: background 0.2s;
        }
        .hero-eye:hover { background: rgba(255,255,255,0.3); }
        .hero-icon {
            font-size: 64px;
            opacity: 0.2;
            transform: rotate(-10deg);
        }
        
        /* Grid Layout */
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
        }
        @media (min-width: 1024px) {
            .dashboard-grid {
                grid-template-columns: 300px 1fr; /* Stats column fixed width, Chart flex */
            }
        }

        .grid-col-stats {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .stat-card {
            background-color: var(--surface-color);
            padding: 24px;
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        .stat-icon.income { background-color: rgba(40, 167, 69, 0.1); color: var(--success-color); }
        .stat-icon.expense { background-color: rgba(220, 53, 69, 0.1); color: var(--danger-color); }
        .stat-label { font-size: 13px; color: var(--text-secondary); }
        .stat-value { font-size: 20px; font-weight: 700; margin-top: 4px; }

        .method-card {
            flex: 1;
        }
        .section-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 20px;
            color: var(--text-primary);
        }
        .method-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .method-item:hover {
                background: rgba(0,0,0,0.02);
                padding-left: 4px; padding-right: 4px; border-radius: 4px;
        }
        .method-name { color: var(--text-secondary); }
        .method-val { font-weight: 600; }
        .empty-msg { font-size: 12px; color: var(--text-secondary); font-style: italic; }

        .chart-card {
            padding: 24px;
        }
        .recent-list {
            background-color: var(--surface-color);
            padding: 24px;
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            margin-top: 24px;
        }
        .recent-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
        }
        .recent-item:last-child { border-bottom: none; }
        .recent-desc { font-weight: 600; font-size: 15px; }
        .recent-subtitle { display: block; font-size: 12px; color: var(--text-secondary); margin-top: 2px; font-weight: 500; }
        .recent-date { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .recent-amount { font-weight: 700; font-size: 15px; }
        .recent-amount.income { color: var(--success-color); }
        .recent-amount.expense { color: var(--text-primary); }
      `}</style>
        </div>
    );
}
