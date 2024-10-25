import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login"; // Import your Login component

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route
					path='/login'
					element={<Login showForm={true} onClose={() => {}} />}
<<<<<<< Updated upstream
				/>{" "}
				{/* Adjust as needed */}
=======
				/>

				{/** we want to use protected routes to protect the parts of the website that displayes personal info
				 * Logic: The app checks whether a user is authenticated (logged in) before allowing them to access a protected page.
				 * Redirecting: If the user is not authenticated, they are typically redirected to a login page or another public route.
				 */}
				<Route element={<ProtectedRoute auth={auth} />}>
					<Route path='/dashboard' element={<Dashboard />} />
					{/* Add more protected routes here */}
				</Route>
>>>>>>> Stashed changes
			</Routes>
		</Router>
	);
};

export default App;
