import React, { useState } from 'react';
import styles from './InputButton.module.css';
import IncomeCard from './IncomeCard';
import ExpenseCard from './ExpenseCard';

export default function InputButton() {
    const [showOptions, setShowOptions] = useState(false);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);

    const handleAddTransaction = (type: 'income' | 'expense') => {
        setShowOptions(false);
        if (type === 'income') {
            setShowIncomeForm(true);
        } else {
            setShowExpenseForm(true);
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.addButton} onClick={() => setShowOptions(!showOptions)}>
                <span>+</span> Add Transaction
            </button>
            
            {showOptions && (
                <div className={styles.optionsMenu}>
                    <button onClick={() => handleAddTransaction('income')}>
                        Add Income
                    </button>
                    <button onClick={() => handleAddTransaction('expense')}>
                        Add Expense
                    </button>
                </div>
            )}

            <IncomeCard 
                isVisible={showIncomeForm} 
                onClose={() => setShowIncomeForm(false)}
            />
            <ExpenseCard 
                isVisible={showExpenseForm} 
                onClose={() => setShowExpenseForm(false)}
            />
        </div>
    );
}
