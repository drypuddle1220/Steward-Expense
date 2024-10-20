import React, { useState } from 'react';
import styles from './InputButton.module.css';
import InputCard from './InputCard';

export default function InputButton() {
    const [showOptions, setShowOptions] = useState(false);
    const [IncomePage, setIncomePage] = useState(false); 
  

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const toggleOptions_input = () => {
        setIncomePage(!IncomePage);
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
                    <button className={styles.optionButton}>Input Expense</button>
                </div>
            )}

            {IncomePage && (
                <div className = {styles.inputcard}>
                    <InputCard/>
                </div>
            )}
        </div>
    );
}
