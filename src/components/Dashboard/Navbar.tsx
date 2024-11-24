import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const Navbar: React.FC = () => {
	const location = useLocation();

	return (
		<nav className={styles.nav}>
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
					<Link
						to='/GoalsTracker'
						className={
							location.pathname === "/GoalsTracker"
								? styles.active
								: ""
						}
					>
						Goals Tracker
					</Link>
				</li>
				<li>
					<Link
						to='/settings'
						className={
							location.pathname === "/settings"
								? styles.active
								: ""
						}
					>
						Settings
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Navbar;
