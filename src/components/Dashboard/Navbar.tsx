import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const Navbar: React.FC = () => {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	return (
		<>
			<button className={styles.menuButton} onClick={toggleMenu}>
				{isOpen ? <CloseIcon /> : <MenuIcon />}
			</button>

			<nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
				<ul>
					<li>
						<Link
							to='/dashboard'
							className={
								location.pathname === "/dashboard"
									? styles.active
									: ""
							}
							onClick={() => setIsOpen(false)}
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
							onClick={() => setIsOpen(false)}
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
							onClick={() => setIsOpen(false)}
						>
							Goals Tracker
						</Link>
					</li>
				</ul>
			</nav>
		</>
	);
};

export default Navbar;
