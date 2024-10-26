import React from "react";
import { Link, useLocation } from "react-router-dom";
import InputButton from "../InputExpense/InputButton";
import styles from "./Navbar.module.css";

const Navbar: React.FC = () => {
	const location = useLocation(); //Get current route, basically the path in url

	/** Here we use <Link> as it is part of the react-router-dom, which enables client
	 * side navigation wihtout page reloads. Ensures smooth transition between different routes
	 * on the page. EX: Dashboard -> Transaction page.
	 *
	 * THIS IS ALSO CALLED SINGLE PAGED APPLICATIONS (SAPs);
	 */
	return (
		<nav>
			<ul>
				<li>
					<Link
						to='/dashboard'
						className={
							location.pathname === "/dashboard"
								? styles.active
								: ""
						}
					>
						Dashboard
					</Link>
				</li>
				<li>
					<Link
						to='/transaction'
						className={
							location.pathname === "/transaction"
								? styles.active
								: ""
						}
					>
						Transactions
					</Link>
				</li>
				<li>
					<Link to='/budgets'>Budgets</Link>
				</li>
				<li>
					<Link to='/savings-goals'>Savings Goals</Link>
				</li>
				
			</ul>
		</nav>
	);
};

export default Navbar;
