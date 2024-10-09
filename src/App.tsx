import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login"; // Import your Login component
import Dashboard from "./components/Dashboard";
const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route
					path='/login'
					element={<Login showForm={true} onClose={() => {}} />}
				/>{" "}
				<Route path='/dashboard' element={<Dashboard />} />
				{/* Adjust as needed */}
			</Routes>
		</Router>
	);
};

export default App;
