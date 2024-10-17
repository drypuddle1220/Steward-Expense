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
	BarProps,
	Bar,
} from "recharts";

import data from "../budgetData.json"; // Assuming the JSON file is in the same directory
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
	prepareLineChartData() {
		// Cast the imported data as the BudgetData type
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

	preparePieChartData() {
		const budgetData = data as BudgetData;

		// Initialize totals for each category
		let incomeTotal = 0;
		let expenseTotal = 0;
		let savingsTotal = 0;
		let total_ovr = 0;

		// Step 1: Calculate total income
		incomeTotal = budgetData.income.reduce(
			(acc, income) => acc + income.amount,
			0
		);

		// Step 2: Calculate total expenses and total savings
		budgetData.expenses.forEach((expense) => {
			if (expense.category === "Savings") {
				savingsTotal += expense.amount;
			} else {
				expenseTotal += expense.amount;
			}
			total_ovr += expense.amount;
		});

		total_ovr += incomeTotal;

		// Step 3: Return the aggregated data in the format for the pie chart
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

	prepareBarChartData() {
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

		// Step 2: Sort categories by total amount spent in descending order
		const sortedExpenses = expenseTotals.sort(
			(a, b) => b.amount - a.amount
		);

		// Step 3: Select the top 5 categories
		const top5Expenses = sortedExpenses.slice(0, 5);

		// Step 4: Return the prepared data for the bar chart
		return top5Expenses;
	}

	render() {
		const lineChartData = this.prepareLineChartData();
		const pieChartData = this.preparePieChartData();
		const barChartData = this.prepareBarChartData();

		return (
			<div className={styles.container}>
				{" "}
				{/* Dashboard container */}
				<div className={styles.card}>
					{" "}
					{/* Card for Line Chart */}
					<h3>Income vs. Expenses</h3>
					<div className={styles.chartContainer}>
						<LineChart
							width={600}
							height={300}
							data={lineChartData}
						>
							<XAxis dataKey='date' />
							<YAxis />
							<Tooltip />
							<CartesianGrid
								stroke='#e0dfdf'
								strokeDasharray='5 5'
							/>
							<Line
								type='monotone'
								dataKey='amount'
								stroke='#8884d8'
								strokeWidth={2}
							/>
						</LineChart>
					</div>
				</div>
				<div className={styles.card}>
					{" "}
					{/* Card for Pie Chart */}
					<h3>Expense Breakdown (By percentage)</h3>
					<div className={styles.chartContainer}>
						<PieChart width={400} height={400}>
							<Pie
								data={pieChartData}
								dataKey='amount'
								nameKey='category'
								cx='50%'
								cy='50%'
								outerRadius={150}
								fill='#8884d8'
								label
							>
								{pieChartData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Legend />
							<Tooltip />
						</PieChart>
					</div>
				</div>
				<div className={styles.card}>
					<h4>Top Expenses Paid</h4>
					<div className={styles.chartContainer}>
						<BarChart width={600} height={300} data={barChartData}>
							<XAxis dataKey='category' />
							<YAxis />
							<Tooltip />
							<CartesianGrid
								stroke='#e0dfdf'
								strokeDasharray='5 5'
							/>
							<Bar dataKey='amount' fill='#8884d8' />
						</BarChart>
					</div>
				</div>
			</div>
		);
	}
}
