import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, CaretLeft, CaretRight, CaretDown } from '@phosphor-icons/react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    parseISO,
    isValid
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CustomDatePicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Initial date processing
    const dateValue = value ? (typeof value === 'string' ? parseISO(value) : value) : new Date();
    // Safe check if date is valid
    const selectedDate = isValid(dateValue) ? dateValue : new Date();

    // View state for the calendar (which month is currently shown)
    const [viewDate, setViewDate] = useState(selectedDate);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync view date when modal opens to the selected date
    useEffect(() => {
        if (isOpen) {
            setViewDate(selectedDate);
        }
    }, [isOpen]);

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

    const handleDayClick = (day) => {
        onChange(format(day, 'yyyy-MM-dd')); // Parent expects yyyy-MM-dd string usually, specific to TransactionForm logic
        setIsOpen(false);
    };

    // Calendar Grid Gen
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
        <div className="custom-datepicker" ref={containerRef}>
            {/* Trigger Button */}
            <button
                className={`datepicker-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="datepicker-icon"><CalendarIcon size={20} /></span>
                    <span className="selected-date-label">
                        {format(selectedDate, 'dd/MM/yyyy')}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex' }}
                >
                    <CaretDown size={14} weight="bold" />
                </motion.div>
            </button>

            {/* Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="datepicker-popup"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {/* Header */}
                        <div className="calendar-header">
                            <button className="nav-btn" onClick={handlePrevMonth}><CaretLeft size={16} /></button>
                            <span className="current-month-label">
                                {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
                            </span>
                            <button className="nav-btn" onClick={handleNextMonth}><CaretRight size={16} /></button>
                        </div>

                        {/* Week Days */}
                        <div className="calendar-grid-header">
                            {weekDays.map((d, i) => (
                                <div key={i} className="weekday-label">{d}</div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="calendar-grid">
                            {calendarDays.map((day, i) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, viewDate);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <button
                                        key={i}
                                        className={`day-cell ${!isCurrentMonth ? 'faded' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                        onClick={() => handleDayClick(day)}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-datepicker {
                    position: relative;
                    width: 100%;
                }
                .datepicker-trigger {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    width: 100%;
                    background-color: var(--bg-color);
                    border: 1px solid var(--border-color);
                    padding: 0 12px;
                    height: 52px;
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 16px;
                    font-weight: 400;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .datepicker-trigger:hover {
                    border-color: var(--border-color);
                }
                .datepicker-trigger.open {
                    border-color: var(--primary-color);
                }
                .datepicker-icon {
                    display: flex;
                    align-items: center;
                    color: var(--text-secondary);
                }

                .datepicker-popup {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0; /* Align to the right to prevent overflow */
                    background-color: var(--surface-color);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    padding: 16px;
                    z-index: 101;
                    border: 1px solid var(--border-color);
                    width: 280px; /* Fixed width for calendar usually looks better */
                }

                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .current-month-label {
                    font-weight: 600;
                    text-transform: capitalize;
                    font-size: 14px;
                    color: var(--text-primary);
                }
                .nav-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .nav-btn:hover {
                    background-color: var(--bg-color);
                    color: var(--primary-color);
                }

                .calendar-grid-header {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    margin-bottom: 8px;
                    text-align: center;
                }
                .weekday-label {
                    font-size: 12px;
                    color: var(--text-secondary);
                    font-weight: 600;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px; /* Small gap between days */
                }
                .day-cell {
                    aspect-ratio: 1; /* Square cells */
                    border: none;
                    background: none;
                    font-size: 13px;
                    color: var(--text-primary);
                    border-radius: 50%; /* Circle selection */
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .day-cell.faded {
                    opacity: 0.3;
                }
                .day-cell:hover:not(.selected) {
                    background-color: var(--bg-color);
                }
                .day-cell.selected {
                    background-color: var(--primary-color);
                    color: white;
                    font-weight: 700;
                }
                .day-cell.today:not(.selected) {
                    background-color: rgba(0, 74, 173, 0.1);
                    color: var(--primary-color);
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
