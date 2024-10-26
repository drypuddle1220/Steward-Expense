import React, { useState } from 'react';
import styles from './InputButton.module.css';
import IncomeCard from './IncomeCard';
import ExpenseCard from './ExpenseCard';

export default function InputButton() {
    const [showOptions, setShowOptions] = useState(false);
    const [IncomePage, setIncomePage] = useState(false); 
    const [ExpensePage, setExpensePage] = useState(false);
  

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const toggleOptions_input = () => {
        setIncomePage(!IncomePage);
    };
    const toggleOptions_input_expense = () => {
        setExpensePage(!ExpensePage);
    };


    

    return (
        <div className={styles.container}>
            <div className={styles.myButton} onClick={toggleOptions}>
            <img
						src='src\components\InputExpense\button.png'
                        className={styles.stewardlogo}
					/>
            </div>
            {showOptions && (
                <div className={styles.options}>
                    <button className={styles.optionButton} onClick = {toggleOptions_input} >
                        Input Income
                    </button>
                    <button className={styles.optionButton} onClick = {toggleOptions_input_expense}>Input Expense</button>
                </div>
            )}

            <IncomeCard isVisible = {IncomePage} /> 
            <ExpenseCard isVisible = {ExpensePage} />
        </div>
    );
}
