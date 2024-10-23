import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "../Backend/config/firebaseConfig"; // Ensure this is Firebase auth instance
import LandingPage from "./components/LandingPage/LandingPage";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import ProtectedRoute from "../Backend/Routes/ProtectedRoute";

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route
					path='/login'
					element={<Login showForm={true} onClose={() => {}} />}
				/>

				{/* Wrap protected routes inside ProtectedRoute */}
				<Route element={<ProtectedRoute auth={auth} />}>
					<Route path='/dashboard' element={<Dashboard />} />
					{/* Add more protected routes here */}
				</Route>
			</Routes>
		</Router>
	);
};

export default App;
