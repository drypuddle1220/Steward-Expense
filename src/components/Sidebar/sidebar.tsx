import React, { useEffect, useState } from "react";
import nav from "../Dashboard/Navbar.module.css";
import Navbar from "../Dashboard/Navbar";
import styles from "../Transactions/Transaction.module.css";
import { FirestoreService } from "../../../Backend/config/firestoreService";
import { auth } from "../../../Backend/config/firebaseConfig";
import { ThemeType, useTheme } from "../../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react"; // Import icons

const Sidebar: React.FC = () => {
	const [userData, setUserData] = useState<any>(null);
	const [avatar, setAvatar] = useState<string>("");

	const fetchAvatarData = async () => {
		const userSettings = await FirestoreService.getUserSetting(
			auth.currentUser?.uid || ""
		);
		setAvatar(userSettings?.avatar || "");
	};

	fetchAvatarData();

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const currentUser = auth.currentUser;
				if (currentUser) {
					const userDoc = await FirestoreService.getUserData(
						currentUser.uid
					);
					if (userDoc) {
						setUserData(userDoc);
					}
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		fetchUserData();
	}, []);

	return (
		<aside className={nav.sidebar}>
			<div className={nav.logo}>
				<img
					src='src/assets/steward_logo.png'
					alt='Steward Logo'
					className={nav.stewardlogo}
				/>
			</div>
			<nav className={nav.navigation}>
				<Navbar />
			</nav>

			<div className={nav.userInfo}>
				{userData ? (
					<>
						<div className={nav.avatar}>
							<img
								src={avatar}
								alt='profile picture'
								className={nav.stewardlogo}
							/>
						</div>
						<div className={nav.userInfoText}>
							<h5>
								{userData.firstName} {userData.lastName}
							</h5>
							<p>{userData.email}</p>
						</div>
					</>
				) : (
					<>
						<div
							className={`${styles.skeleton} ${nav.avatarSkeleton}`}
						></div>
						<div className={styles.skeleton}></div>
						<div className={styles.skeleton}></div>
					</>
				)}
			</div>
		</aside>
	);
};

export default Sidebar;
