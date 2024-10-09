// Dashboard.tsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { auth } from "../../Backend/config/firebaseConfig"; // Adjust import path
import Visualizer from "./visualizer";

const Dashboard: React.FC = () => {
	const [userData, setUserData] = useState<any>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const user = auth.currentUser;
		if (user) {
			// Fetch user-specific data
			const database = getDatabase();
			const userRef = ref(database, "users/" + user.uid);

			onValue(userRef, (snapshot) => {
				const data = snapshot.val();
				setUserData(data);
			});
		} else {
			// Redirect to login if no user is signed in
			navigate("/login");
		}
	}, [navigate]);

	if (!userData) return <p>Loading...</p>;

	return (
		<div>
			<h1>Welcome, {userData.firstName}!</h1>
			{/* Render user-specific expense data */}
			<p>Email: {userData.email}</p>
			<Visualizer /> 
			
			{/* Add more personalized content here */}

		</div>
	);
};

export default Dashboard;
