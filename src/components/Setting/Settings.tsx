import styles from "./Settings.module.css";
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../Sidebar/sidebar";
import { auth } from "../../../Backend/config/firebaseConfig";
import { FirestoreService } from "../../../Backend/config/firestoreService";
import { useTheme } from "../../contexts/ThemeContext";
import {
	User,
	Mail,
	Key,
	Palette,
	LifeBuoy,
	AlertCircle,
	Camera,
	ChevronRight,
	Sun,
	Monitor,
	Moon,
} from "lucide-react";

// Update the type for theme options
type ThemeType = "system" | "light" | "dark" | "contrast";

interface ThemeOption {
	id: ThemeType; // Update to use ThemeType
	name: string;
	icon: React.ReactNode;
	description: string;
}

interface UserSettings {
	firstName?: string;
	lastName?: string;
	avatar?: string;
	theme?: ThemeType;
	email?: string;
}

const Settings: React.FC = () => {
	const [userProfile, setUserProfile] = useState<UserSettings>({
		firstName: "",
		lastName: "",
		email: "",
		avatar: "",
	});
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { theme, toggleTheme } = useTheme();
	const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
		theme as ThemeType
	);

	const themeOptions: ThemeOption[] = [
		{
			id: "system",
			name: "System",
			icon: <Monitor size={20} />,
			description: "Match system theme",
		},
		{
			id: "light",
			name: "Light",
			icon: <Sun size={20} />,
			description: "Classic light theme",
		},
		{
			id: "dark",
			name: "Dark",
			icon: <Moon size={20} />,
			description: "Easy on the eyes",
		},
		{
			id: "contrast",
			name: "High Contrast",
			icon: <Palette size={20} />,
			description: "Enhanced visibility",
		},
	];

	// Update the handler to use ThemeType
	const handleThemeChange = (themeId: ThemeType) => {
		setSelectedTheme(themeId);
		toggleTheme();
	};

	useEffect(() => {
		const loadUserProfile = async () => {
			try {
				const currentUser = auth.currentUser;
				if (currentUser) {
					const userData = await FirestoreService.getUserData(
						currentUser.uid
					);
					setUserProfile(userData as UserSettings);
				}
			} catch (error) {
				console.error("Error loading user profile:", error);
			} finally {
				setLoading(false);
			}
		};

		loadUserProfile();
	}, []);

	const handleSaveChanges = async () => {
		setIsSaving(true);
		try {
			// Validate required fields
			if (
				!userProfile.firstName ||
				!userProfile.lastName ||
				!userProfile.email
			) {
				throw new Error("Please fill in all required fields");
			}

			const settingsData: UserSettings = {};

			if (userProfile.firstName)
				settingsData.firstName = userProfile.firstName.trim();
			if (userProfile.lastName)
				settingsData.lastName = userProfile.lastName.trim();
			if (userProfile.email)
				settingsData.email = userProfile.email.trim();
			if (userProfile.avatar) settingsData.avatar = userProfile.avatar;
			if (selectedTheme) settingsData.theme = selectedTheme;

			await FirestoreService.saveUserSetting(
				auth.currentUser?.uid!,
				settingsData
			);
			// Show success message
		} catch (error) {
			console.error("Error saving changes:", error);
			// Show error message
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className={styles.settings}>
			<Sidebar />
			<main className={styles.settingsContent}>
				<h1>Settings</h1>

				<div className={styles.settingsSections}>
					{/* Account Section */}
					<section className={styles.settingsSection}>
						<h2>
							<User className={styles.sectionIcon} /> Account
						</h2>
						<div className={styles.accountForm}>
							{/* Profile Picture */}
							<div className={styles.avatarSection}>
								<div className={styles.avatarWrapper}>
									{userProfile.avatar ? (
										<img
											src={userProfile.avatar}
											alt='Profile'
											className={styles.avatar}
										/>
									) : (
										<div
											className={styles.avatarPlaceholder}
										>
											<User size={40} />
										</div>
									)}
									<button
										className={styles.changeAvatarButton}
										onClick={() =>
											fileInputRef.current?.click()
										}
									>
										<Camera size={20} />
										Change Photo
									</button>
									<input
										type='file'
										ref={fileInputRef}
										className={styles.hiddenInput}
										accept='image/*'
										onChange={(e) => {
											// Handle file upload
										}}
									/>
								</div>
							</div>

							{/* Personal Information */}
							<div className={styles.formGroup}>
								<h3>Personal Information</h3>
								<div className={styles.formRow}>
									<div className={styles.formField}>
										<label>First Name</label>
										<input
											type='text'
											value={userProfile.firstName}
											onChange={(e) =>
												setUserProfile({
													...userProfile,
													firstName: e.target.value,
												})
											}
										/>
									</div>
									<div className={styles.formField}>
										<label>Last Name</label>
										<input
											type='text'
											value={userProfile.lastName}
											onChange={(e) =>
												setUserProfile({
													...userProfile,
													lastName: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</div>

							{/* Email */}
							<div className={styles.formGroup}>
								<h3>Email Address</h3>
								<div className={styles.formField}>
									<input
										type='email'
										value={userProfile.email}
										onChange={(e) =>
											setUserProfile({
												...userProfile,
												email: e.target.value,
											})
										}
									/>
								</div>
							</div>

							{/* Password */}
							<div className={styles.formGroup}>
								<h3>Change Password</h3>
								<div className={styles.formField}>
									<label>New Password</label>
									<input
										type='password'
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										placeholder='Enter new password'
									/>
								</div>
								<div className={styles.formField}>
									<label>Confirm Password</label>
									<input
										type='password'
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										placeholder='Confirm new password'
									/>
								</div>
							</div>

							{/* Save Button */}
							<div className={styles.formActions}>
								<button
									className={styles.saveButton}
									onClick={handleSaveChanges}
									disabled={isSaving}
								>
									{isSaving ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</div>
					</section>

					{/* Appearance Section */}
					<section className={styles.settingsSection}>
						<h2>
							<Palette className={styles.sectionIcon} />{" "}
							Appearance
						</h2>
						<div className={styles.settingCards}>
							<div className={styles.themeSelector}>
								<h3>Theme</h3>
								<p className={styles.themeDescription}>
									Choose how Steward looks to you
								</p>
								<div className={styles.themeOptions}>
									{themeOptions.map((option) => (
										<div
											key={option.id}
											className={`${styles.themeCard} ${
												selectedTheme === option.id
													? styles.selected
													: ""
											}`}
											onClick={() =>
												handleThemeChange(option.id)
											}
										>
											<div
												className={
													styles.themeIconWrapper
												}
											>
												{option.icon}
											</div>
											<div className={styles.themeInfo}>
												<h4>{option.name}</h4>
												<p>{option.description}</p>
											</div>
											<div
												className={styles.themeSelector}
											>
												<div
													className={
														styles.radioOuter
													}
												>
													<div
														className={`${
															styles.radioInner
														} ${
															selectedTheme ===
															option.id
																? styles.radioSelected
																: ""
														}`}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className={styles.colorSchemes}>
								<h3>Color Scheme</h3>
								<p className={styles.themeDescription}>
									Select your preferred accent color
								</p>
								<div className={styles.colorOptions}>
									{[
										"blue",
										"purple",
										"green",
										"orange",
										"red",
									].map((color) => (
										<button
											key={color}
											className={`${styles.colorOption} ${styles[color]}`}
											aria-label={`${color} theme`}
										/>
									))}
								</div>
							</div>
						</div>
					</section>

					{/* Support Section */}
					<section className={styles.settingsSection}>
						<h2>
							<LifeBuoy className={styles.sectionIcon} /> Support
						</h2>
						<div className={styles.settingCards}>
							<div className={styles.settingCard}>
								<div className={styles.settingInfo}>
									<div className={styles.settingIcon}>
										<Mail size={20} />
									</div>
									<div>
										<h3>Contact Support</h3>
										<p>Get help with Steward</p>
									</div>
								</div>
								<ChevronRight className={styles.arrowIcon} />
							</div>

							<div className={styles.settingCard}>
								<div className={styles.settingInfo}>
									<div className={styles.settingIcon}>
										<AlertCircle size={20} />
									</div>
									<div>
										<h3>Report a Problem</h3>
										<p>Let us know about any issues</p>
									</div>
								</div>
								<ChevronRight className={styles.arrowIcon} />
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
};

export default Settings;
