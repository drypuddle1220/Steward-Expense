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
} from "recharts";
import data from "./budgetData.json"; // Assuming the JSON file is in the same directory
import "./visualizer.css";

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

		return budgetData.expenses.reduce((acc, expense) => {
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
	}

	render() {
		const lineChartData = this.prepareLineChartData();
		const pieChartData = this.preparePieChartData();

		return (
			<div className='dashboard'>
				{" "}
				{/* Dashboard container */}
				<div className='card'>
					{" "}
					{/* Card for Line Chart */}
					<h3>Income vs. Expenses</h3>
					<div className='chart-container'>
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
				<div className='card'>
					{" "}
					{/* Card for Pie Chart */}
					<h3>Expense Breakdown</h3>
					<div className='chart-container'>
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
			</div>
		);
	}
}
