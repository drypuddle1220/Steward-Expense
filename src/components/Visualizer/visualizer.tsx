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
	Area,
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
					<ResponsiveContainer width="100%" height="100%">
						<LineChart 
							data={lineChartData}
							margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
						>
							<defs>
								{/* Gradient for the area under the line */}
								<linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-gradient-1)" stopOpacity={0.3}/>
									<stop offset="95%" stopColor="var(--chart-gradient-1)" stopOpacity={0}/>
								</linearGradient>
								{/* Gradient for the line itself */}
								<linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
									<stop offset="0%" stopColor="var(--chart-gradient-1)" />
									<stop offset="100%" stopColor="var(--chart-gradient-2)" />
								</linearGradient>
							</defs>

							{/* Background Grid */}
							<CartesianGrid 
								stroke="var(--chart-grid)" 
								strokeDasharray="3 3"
								vertical={false}
								opacity={0.3}
							/>

							{/* Axes */}
							<XAxis 
								dataKey='date' 
								axisLine={false}
								tickLine={false}
								style={{ 
									fontSize: '12px',
									fontFamily: 'Inter, sans-serif',
									color: 'var(--text-secondary)'
								}}
								dy={10}
							/>
							<YAxis 
								axisLine={false}
								tickLine={false}
								style={{ 
									fontSize: '12px',
									fontFamily: 'Inter, sans-serif',
									color: 'var(--text-secondary)'
								}}
								dx={-10}
								tickFormatter={(value) => `$${value}`}
							/>

							{/* Enhanced Tooltip */}
							<Tooltip 
								contentStyle={{ 
									backgroundColor: 'var(--bg-white)',
									borderRadius: '12px',
									border: 'none',
									boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
									padding: '12px 16px',
								}}
								labelStyle={{
									color: 'var(--text-secondary)',
									fontSize: '12px',
									fontWeight: 600,
									marginBottom: '4px'
								}}
								itemStyle={{
									color: 'var(--text-primary)',
									fontSize: '14px',
									padding: '4px 0'
								}}
								formatter={(value) => [`$${value}`, 'Amount']}
							/>

							{/* Area under the line */}
							<Area
								type="monotone"
								dataKey="amount"
								stroke="none"
								fill="url(#colorAmount)"
								fillOpacity={1}
							/>

							{/* Main line */}
							<Line
								type="monotone"
								dataKey="amount"
								stroke="url(#lineGradient)"
								strokeWidth={3}
								dot={false}
								activeDot={{
									r: 6,
									fill: 'var(--bg-white)',
									stroke: 'var(--chart-gradient-1)',
									strokeWidth: 3
								}}
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
					<ResponsiveContainer width="100%" height="100%">
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
				<div className={styles.chartHeader}>
					<h3>Expense Categories</h3>
					<div className={styles.chartLegend}>
						<span className={styles.legendItem}>
							<span className={styles.legendDot}></span>
							Monthly Spending
						</span>
					</div>
				</div>
				<div className={styles.chartContainer}>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart 
							data={barChartData}
							margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
							barSize={35}
						>
							<defs>
								{/* Modern gradient for bars */}
								<linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="var(--chart-gradient-1)" stopOpacity={0.9} />
									<stop offset="50%" stopColor="var(--chart-gradient-2)" stopOpacity={0.8} />
									<stop offset="100%" stopColor="var(--chart-gradient-2)" stopOpacity={0.7} />
								</linearGradient>
								{/* Hover effect gradient */}
								<linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="var(--chart-gradient-3)" stopOpacity={0.95} />
									<stop offset="100%" stopColor="var(--chart-gradient-4)" stopOpacity={0.85} />
								</linearGradient>
								{/* Subtle background gradient for chart */}
								<linearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#f8fafc" stopOpacity={0.5} />
									<stop offset="100%" stopColor="#f1f5f9" stopOpacity={0.2} />
								</linearGradient>
							</defs>

							{/* Refined Background */}
							<rect 
								width="100%" 
								height="100%" 
								fill="url(#bgGradient)" 
							/>

							{/* Subtle Grid */}
							<CartesianGrid 
								strokeDasharray="3 3" 
								vertical={false} 
								stroke="var(--chart-grid)"
								opacity={0.2}
							/>

							{/* X Axis - Categories */}
							<XAxis 
								dataKey="category"
								axisLine={false}
								tickLine={false}
								tick={{
										fill: 'var(--text-secondary)',
										fontSize: 12,
										fontFamily: 'Inter, sans-serif',
										fontWeight: 500
								}}
								dy={10}
								tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
							/>

							{/* Y Axis - Amount */}
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{
										fill: 'var(--text-secondary)',
										fontSize: 12,
										fontFamily: 'Inter, sans-serif',
										fontWeight: 500
								}}
								dx={-10}
								tickFormatter={(value) => `$${value.toLocaleString()}`}
							/>

							{/* Enhanced Tooltip */}
							<Tooltip
								cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
								contentStyle={{
										backgroundColor: 'var(--bg-white)',
										borderRadius: '16px',
										border: 'none',
										boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
										padding: '16px',
								}}
								labelStyle={{
										color: 'var(--text-primary)',
										fontSize: '14px',
										fontWeight: 600,
										marginBottom: '8px'
								}}
								itemStyle={{
										color: 'var(--text-secondary)',
										fontSize: '13px',
										padding: '4px 0'
								}}
								formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']}
							/>

							{/* Bars with enhanced styling */}
							<Bar 
								dataKey="amount"
								fill="url(#barGradient)"
								radius={[6, 6, 0, 0]}
								maxBarSize={50}
							>
								{barChartData.map((entry, index) => (
									<Cell 
										key={`cell-${index}`}
										cursor="pointer"
										className={styles.barCell}
									/>
								))}
							</Bar>
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
