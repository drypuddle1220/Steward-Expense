import React, { useEffect, useState } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Transaction as TransactionType } from '../../types';
import { FirestoreService } from '../../../Backend/config/firestoreService';
import { auth } from '../../../Backend/config/firebaseConfig';
import styles from './PieChart.module.css';
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer } from 'recharts';

const COLORS = [
    '#4158D0',  // Deep Blue
    '#C850C0',  // Purple
    '#3B2667',  // Dark Purple
    '#6B48FF',  // Violet
    '#4B6EFF',  // Royal Blue
    '#61DAFB',  // Light Blue
    '#764ABC',  // Medium Purple
    '#9B6BFF'   // Lavender
];
const firestoreService = new FirestoreService();

//This is the component for the transactions page.
//It displays all the transactions of the user, and allows the user to filter and search through the transactions.

const PieChart: React.FC = () => {

	//The following useState hooks manage the state of the transactions, user data, and loading.
	const [transactions, setTransactions] = useState<TransactionType[]>([]);
	const [loading, setLoading] = useState(true); //This is the loading state, which is true by default.
	const [userData, setUserData] = useState<any>(null); //This is the user data, which is null by default.
	const [filter, setFilter] = useState('all'); //This is the default filter, which is all transactions.
	const [searchTerm, setSearchTerm] = useState(''); //This is the search term, which is the search input in the search bar.
	const navigate = useNavigate();

useEffect(() => {
    const loadData = async () => {
        if (auth.currentUser) {
            try {
                // Load user data from Firestore
                const userDataResult = await FirestoreService.getUserData(auth.currentUser.uid);
                if (userDataResult) {
                    setUserData(userDataResult);
                }

                // Load transactions
                const transactions = await FirestoreService.getTransactions(auth.currentUser.uid);
                setTransactions(transactions.map(t => ({
                    ...t,
                    userId: auth.currentUser!.uid,
                    currency: t.currency || 'USD',
                    status: t.status || 'completed',
                    date: t.date.toDate() // Convert Firestore Timestamp to Date
                })) as TransactionType[]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    loadData();
}, []);
//This is the function that filters the transactions based on the filter and search term

// Prepare pie chart data by aggregating transactions by category
const preparePieChartData = () => {
    // Filter for expense transactions only since we want to show expense breakdown
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Aggregate amounts by category
    const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
        const { category, amount } = transaction;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += amount;
        return acc;
    }, {} as Record<string, number>);

    // Convert to array format needed for Recharts
    const pieData = Object.entries(categoryTotals).map(([category, value]) => ({
        name: category,
        value: value
    }));

    return pieData;
};

const pieData = preparePieChartData();

console.log(pieData);

return (
    <div className={styles.card}>
        <h3>Expense Breakdown</h3>
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie 
                        data={pieData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={5}
                        label={({percent}) => `${(percent * 100).toFixed(0)}%`}
                    >
                        {pieData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                        contentStyle={{ 
                            backgroundColor: 'var(--chart-tooltip-bg)',
                            borderRadius: 'var(--card-radius)',
                            border: 'none',
                            boxShadow: `0 4px 12px var(--chart-tooltip-shadow)`
                        }}
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                        wrapperStyle={{
                            fontSize: '12px',
                            paddingLeft: '20px'
                        }}
                    />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

}; 

export default PieChart;