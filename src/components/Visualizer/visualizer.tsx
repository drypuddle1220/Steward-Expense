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
} from "recharts";

import data from "./budgetData.json";
import styles from "./visualizer.module.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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

	// Static Sub-component for LineChart
	static LineChartComponent = () => {
		const lineChartData = Visualizer.prepareLineChartData();

		return (
			<div className={styles.card}>
				<h3>Income vs. Expenses</h3>
				<div className={styles.chartContainer}>
					<LineChart width={600} height={350} data={lineChartData}>
						<XAxis dataKey='date' />
						<YAxis />
						<Tooltip />
						<CartesianGrid stroke='##F9AB5C' strokeDasharray='0' />
						<Line
							type='monotone'
							dataKey='amount'
							stroke='#5caaf9'
							strokeWidth={2}
						/>
					</LineChart>
				</div>
			</div>
		);
	};

	// Static Sub-component for PieChart
	// Static Sub-component for PieChart
	static PieChartComponent = () => {
		const pieChartData = Visualizer.preparePieChartData();

		return (
			<div className={styles.card}>
				<h3>Expense Breakdown</h3>
				<div className={styles.chartContainer}>
					<PieChart width={300} height={350}>
						<Pie
							data={pieChartData}
							dataKey='amount'
							nameKey='category'
							cx='50%'
							cy='50%'
							outerRadius='100%'
							fill='#5caaf9'
							label
						>
							{pieChartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip />
						<Legend
							layout='vertical'
							verticalAlign='top'
							align='right'
							margin={{ top: 20, left: 50, right: 0, bottom: 0 }}
							// Adjust margin as needed
						/>
					</PieChart>
				</div>
			</div>
		);
	};

	// Static Sub-component for BarChart
	static BarChartComponent = () => {
		const barChartData = Visualizer.prepareBarChartData();

		return (
			<div className={styles.card}>
				<h3>Top Expenses</h3>
				<br />
				<div className={styles.chartContainer}>
					<BarChart
						width={1000}
						height={400}
						data={barChartData}
						barCategoryGap={10} // Space between bars
					>
						<XAxis dataKey='category' />
						<YAxis />
						<Tooltip />
						<CartesianGrid stroke='#e0dfdf' strokeDasharray='0' />
						<Bar
							dataKey='amount'
							fill='#5caaf9'
							barSize={50} // Thinner bars
						/>
					</BarChart>
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
