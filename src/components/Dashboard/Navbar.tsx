import React from "react";
import { Link } from "react-router-dom";
import InputButton from "../InputExpense/InputButton";
import "./Navbar.module.css"; // Import your CSS file

const Navbar: React.FC = () => {
	return (
		<nav>
			<ul>
				<li>
					<Link to='/dashboard'>Dashboard</Link>
				</li>
				<li>
					<Link to='/transactions'>Transactions</Link>
				</li>
				<li>
					<Link to='/budgets'>Budgets</Link>
				</li>
				<li>
					<Link to='/savings-goals'>Savings Goals</Link>
				</li>
				<li>
					<InputButton />
				</li>
			</ul>
		</nav>
	);
};

export default Navbar;
