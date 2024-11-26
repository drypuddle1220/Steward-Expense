import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../../Backend/config/firebaseConfig";
import { FirestoreService } from "../../Backend/config/firestoreService";

type Theme = "light" | "dark" | "Sunset" | "Ocean" | "Olivia";
type ThemeContextType = {
	theme: Theme;
	setTheme: (newTheme: Theme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [theme, setThemeState] = useState<Theme>("light");

	// Load theme when component mounts
	useEffect(() => {
		const loadTheme = async () => {
			// First check if user is logged in
			const user = auth.currentUser;
			if (user) {
				try {
					// Try to get theme from Firestore
					const userDoc = await FirestoreService.getUserSettings(
						user.uid
					);
					if (userDoc?.theme) {
						setThemeState(userDoc.theme as Theme);
					} else {
						// If no theme in Firestore, check localStorage
						const localTheme = localStorage.getItem(
							"theme"
						) as Theme;
						if (localTheme) {
							setThemeState(localTheme);
							// Save to Firestore for future
							await FirestoreService.updateUserSettings(
								user.uid,
								{
									theme: localTheme,
								}
							);
						}
					}
				} catch (error) {
					console.error("Error loading theme:", error);
				}
			} else {
				// If not logged in, just use localStorage
				const localTheme = localStorage.getItem("theme") as Theme;
				if (localTheme) {
					setThemeState(localTheme);
				}
			}
		};

		loadTheme();
	}, []);

	// Update theme function
	const setTheme = async (newTheme: Theme) => {
		try {
			// Update state
			setThemeState(newTheme);

			// Save to localStorage
			localStorage.setItem("theme", newTheme);

			// If user is logged in, save to Firestore
			const user = auth.currentUser;
			if (user) {
				await FirestoreService.updateUserSettings(user.uid, {
					theme: newTheme,
				});
			}
		} catch (error) {
			console.error("Error saving theme:", error);
		}
	};

	// Update document root when theme changes
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

export type ThemeType = Theme;
