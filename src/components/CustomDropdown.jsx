import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';

export function CustomDropdown({ options, value, onChange, placeholder = "Selecione", icon = null }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

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

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="custom-dropdown" ref={containerRef}>
            <button
                className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon && <span className="dropdown-icon">{icon}</span>}
                    <span className="selected-label">{selectedLabel}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex' }}
                >
                    <CaretDown size={14} weight="bold" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="dropdown-menu"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`dropdown-item ${value === option.value ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-dropdown {
                    position: relative;
                    min-width: 140px;
                    width: 100%;
                }
                .dropdown-trigger {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    width: 100%;
                    background-color: var(--bg-color); /* Match form input bg */
                    border: 1px solid var(--border-color); /* Match form border */
                    padding: 0 12px;
                    height: 52px; /* Match form height */
                    border-radius: var(--radius-md); /* Match form radius */
                    color: var(--text-primary);
                    font-size: 16px; /* Match form font */
                    font-weight: 400;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .dropdown-trigger:hover {
                    border-color: var(--border-color); /* Hover state */
                }
                .dropdown-trigger.open {
                    border-color: var(--primary-color);
                }
                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0; /* Align right to match design usually */
                    width: auto; /* Allow auto width or 100% */
                    min-width: 100%;
                    background-color: var(--surface-color);
                    border-radius: 16px; /* Smooth corners */
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    padding: 8px;
                    z-index: 100;
                    border: 1px solid var(--border-color);
                    white-space: nowrap;
                }
                .dropdown-item {
                    padding: 10px 16px;
                    border-radius: 8px; /* Inner radius */
                    font-size: 14px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .dropdown-item:hover {
                    background-color: var(--bg-color);
                    color: var(--text-primary);
                }
                .dropdown-item.selected {
                    background-color: var(--primary-color);
                    color: white;
                }
                .dropdown-icon {
                    display: flex;
                    align-items: center;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
