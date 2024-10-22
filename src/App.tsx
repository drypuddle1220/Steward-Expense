import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Backend/config/firebaseConfig";
import LandingPage from "./components/LandingPage/LandingPage";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
// Add more components as needed

const App: React.FC = () => {
	const [user, setUser] = useState<any>(null); // Track user authentication

	useEffect(() => {
		// Listen for changes in user authentication state
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});

		return () => unsubscribe(); // Cleanup the listener on unmount
	}, []);

	return (
		<Router>
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route
					path='/login'
					element={<Login showForm={true} onClose={() => {}} />}
				/>

				{/* Protected Route for Dashboard */}
				<Route
					path='/dashboard'
					element={user ? <Dashboard /> : <Navigate to='/login' />}
				/>

				{/* Protected Route for Transactions */}
				{/* <Route path='/transactions' element={user ? <Transactions /> : <Navigate to="/login" />} /> */}

				{/* Add more protected routes here */}
			</Routes>
		</Router>
	);
};

export default App;
