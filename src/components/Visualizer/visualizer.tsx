import React from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	PieChart,
	Pie,
	Legend,
	Cell,
	BarChart,
	Bar,
	ResponsiveContainer,
} from "recharts";

import data from "./budgetData.json";
import styles from "./visualizer.module.css";

const COLORS = [
	'var(--chart-gradient-1)',
	'var(--chart-gradient-2)',
	'var(--chart-gradient-3)',
	'var(--chart-gradient-4)'
];

type IncomeData = {
	source: string;
	amount: number;
	date: string;
};

type ExpenseData = {
	category: string;
	amount: number;
	date: string;
	type: string;
};
interface BudgetData {
	income: IncomeData[];
	expenses: ExpenseData[];
}
export default class Visualizer extends React.Component {
	// Make data preparation methods static
	static COLORS = ['#61DAFB', '#764ABC', '#2ECC71', '#E74C3C'];

	static prepareLineChartData() {
		const budgetData = data as BudgetData;

		const incomeData = budgetData.income.map((item) => ({
			date: item.date,
			amount: item.amount,
			type: "Income",
		}));

		const expenseData = budgetData.expenses.map((item) => ({
			date: item.date,
			amount: -item.amount, // Negative to show expenses on the same axis as income
			type: "Expense",
		}));

		return [...incomeData, ...expenseData].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);
	}

	static preparePieChartData() {
		const budgetData = data as BudgetData;
		let incomeTotal = 0;
		let expenseTotal = 0;
		let savingsTotal = 0;
		let total_ovr = 0;

		incomeTotal = budgetData.income.reduce(
			(acc, income) => acc + income.amount,
			0
		);

		budgetData.expenses.forEach((expense) => {
			if (expense.category === "Savings") {
				savingsTotal += expense.amount;
			} else {
				expenseTotal += expense.amount;
			}
			total_ovr += expense.amount;
		});

		total_ovr += incomeTotal;

		return [
			{
				category: "Income",
				amount: Math.round((incomeTotal / total_ovr) * 100),
			},
			{
				category: "Expenses",
				amount: Math.round((expenseTotal / total_ovr) * 100),
			},
			{
				category: "Savings",
				amount: Math.round((savingsTotal / total_ovr) * 100),
			},
		];
	}

	static prepareBarChartData() {
		const budgetData = data as BudgetData;

		const expenseTotals = budgetData.expenses.reduce((acc, expense) => {
			const existingCategory = acc.find(
				(item) => item.category === expense.category
			);
			if (existingCategory) {
				existingCategory.amount += expense.amount;
			} else {
				acc.push({
					category: expense.category,
					amount: expense.amount,
				});
			}
			return acc;
		}, [] as { category: string; amount: number }[]);

		const sortedExpenses = expenseTotals.sort(
			(a, b) => b.amount - a.amount
		);

		const top5Expenses = sortedExpenses.slice(0, 5);
		return top5Expenses;
	}

	static LineChartComponent = () => {
		const lineChartData = Visualizer.prepareLineChartData();

		return (
			<div className={styles.card}>
				<h3>Income vs. Expenses</h3>
				<div className={styles.chartContainer}>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={lineChartData}>
							<defs>
								<linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#61DAFB" stopOpacity={0.8}/>
									<stop offset="95%" stopColor="#61DAFB" stopOpacity={0}/>
								</linearGradient>
							</defs>
							<XAxis 
								dataKey='date' 
								axisLine={false}
								tickLine={false}
								style={{ fontSize: '12px' }}
							/>
							<YAxis 
								axisLine={false}
								tickLine={false}
								style={{ fontSize: '12px' }}
							/>
							<Tooltip 
								contentStyle={{ 
									backgroundColor: 'var(--chart-tooltip-bg)',
									borderRadius: 'var(--card-radius)',
									border: 'none',
									boxShadow: `0 4px 12px var(--chart-tooltip-shadow)`
								}}
							/>
							<CartesianGrid 
								stroke="var(--chart-grid)" 
								strokeDasharray="5 5"
								vertical={false}
							/>
							<Line
								type='monotone'
								dataKey='amount'
								stroke="#61DAFB"
								strokeWidth={3}
								dot={false}
								fill="url(#colorAmount)"
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		);
	};

	static PieChartComponent = () => {
		const pieChartData = Visualizer.preparePieChartData();

		return (
			<div className={styles.card}>
				<h3>Expense Breakdown</h3>
				<div className={styles.chartContainer}>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={pieChartData}
								dataKey='amount'
								nameKey='category'
								cx='50%'
								cy='50%'
								innerRadius='60%'
								outerRadius='80%'
								paddingAngle={5}
								label={({
									cx,
									cy,
									midAngle,
									innerRadius,
									outerRadius,
									value,
									index
								}) => {
									const RADIAN = Math.PI / 180;
									const radius = 25 + innerRadius + (outerRadius - innerRadius);
									const x = cx + radius * Math.cos(-midAngle * RADIAN);
									const y = cy + radius * Math.sin(-midAngle * RADIAN);
									return (
										<text
											x={x}
											y={y}
											fill={COLORS[index % COLORS.length]}
											textAnchor={x > cx ? 'start' : 'end'}
											dominantBaseline="central"
										>
											{`${value}%`}
										</text>
									);
								}}
							>
								{pieChartData.map((entry, index) => (
									<Cell 
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
										stroke="none"
									/>
								))}
							</Pie>
							<Tooltip 
								contentStyle={{ 
									backgroundColor: 'var(--chart-tooltip-bg)',
									borderRadius: 'var(--card-radius)',
									border: 'none',
									boxShadow: `0 4px 12px var(--chart-tooltip-shadow)`
								}}
							/>
							<Legend 
								layout='vertical'
								verticalAlign='middle'
								align='right'
								wrapperStyle={{
									fontSize: '12px',
									paddingLeft: '20px'
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>
		);
	};

	static BarChartComponent = () => {
		const barChartData = Visualizer.prepareBarChartData();

		return (
			<div className={styles.card}>
				<h3>Top Expenses</h3>
				<div className={styles.chartContainer}>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={barChartData} barCategoryGap={15}>
							<defs>
								<linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#764ABC" stopOpacity={0.8}/>
									<stop offset="100%" stopColor="#764ABC" stopOpacity={0.3}/>
								</linearGradient>
							</defs>
							<XAxis 
								dataKey='category' 
								axisLine={false}
								tickLine={false}
								style={{ fontSize: '12px' }}
							/>
							<YAxis 
								axisLine={false}
								tickLine={false}
								style={{ fontSize: '12px' }}
							/>
							<Tooltip 
								cursor={{ fill: 'rgba(0,0,0,0.05)' }}
								contentStyle={{ 
									backgroundColor: 'var(--chart-tooltip-bg)',
									borderRadius: 'var(--card-radius)',
									border: 'none',
									boxShadow: `0 4px 12px var(--chart-tooltip-shadow)`
								}}
							/>
							<CartesianGrid 
								stroke="var(--chart-grid)" 
								strokeDasharray="5 5"
								vertical={false}
							/>
							<Bar
								dataKey='amount'
								fill="url(#colorBar)"
								radius={[8, 8, 0, 0]}
								barSize={55}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		);
	};

	render() {
		return (
			<div className={styles.container}>
				<Visualizer.LineChartComponent />
				<Visualizer.PieChartComponent />
				<Visualizer.BarChartComponent />
			</div>
		);
	}
}
