import React from 'react';
import styles from './ExpenseCard.module.css';

type InputCardProps = {
	isVisible: boolean;
}

export default function ExpenseCard({isVisible}: InputCardProps) {
  return (
    <div>
			<div className= {`${styles.cardform} ${isVisible ? styles.visible : styles.hidden}`}>
			<div >
							Income:
							<input type="text" />
							
							External Revenue 1:
							<input type="text" />
							
							External Revenue 2:
							<input type="text" />
							
							External Revenue 3:
							<input type="text" />
							External Revenue 4:
							<input type="text" />
							
			</div>
			</div>

			
		</div>
		
  )
}
