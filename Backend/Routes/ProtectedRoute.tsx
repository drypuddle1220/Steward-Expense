import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth"; // Ensure you have this package installed
import { Auth } from "firebase/auth"; // Import type for Auth

interface ProtectedRouteProps {
	auth: Auth; // Specify the type for auth prop
}

// This component protects routes by checking the authentication state
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ auth }) => {
	const [user, loading, error] = useAuthState(auth); // Use hook to get user state

	if (loading) {
		return <div>Loading...</div>; // Show loading state while checking auth
	}

	if (error) {
		console.error("Authentication error:", error);
		return <div>Error occurred. Please try again.</div>; // Handle any error
	}

	return user ? <Outlet /> : <Navigate to='/login' />; // Redirect if not authenticated
};

export default ProtectedRoute;
