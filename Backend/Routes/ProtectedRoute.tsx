import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth"; // Ensure you have this package installed
import { Auth } from "firebase/auth"; // Import type for Auth

interface ProtectedRouteProps {
	auth: Auth; // Specify the type for auth prop
}

/**
 * ProtectedRoute component to restrict access to authenticated users only.
 *
 * This component checks the user's authentication state using Firebase's `auth` object.
 * If the user is not authenticated, they are redirected to the login page.
 *
 * @param {Object} param0 - The component's props.
 * @param {Auth} param0.auth - The Firebase authentication object to track the user's login state.
 * @returns {JSX.Element} - Returns the requested route if the user is authenticated, otherwise redirects to '/login'.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ auth }) => {
	//useAuthState function returns an array of elements. This line extracts those elements
	//and using those variables to determine if anything went wrong.
	/**
	 * The useAuthState hook typically returns an array with three elements:
	user: This is the current user object if the user is authenticated, or null if the user is not logged in. It contains information about the user (like their UID, email, etc.).
	loading: This is a boolean that indicates whether the authentication state is currently being checked. It will be true while Firebase is determining if the user is logged in or not.
	error: This holds any error that might occur during the authentication process. If there’s no error, this will usually be null.
	 */
	const [user, loading, error] = useAuthState(auth); // Use hook to get user state

	if (loading) {
		return <div>Loading...</div>; // Show loading state while checking auth
	}

	if (error) {
		console.error("Authentication error:", error);
		return <div>Error occurred. Please try again.</div>; // Handle any error
	}
	//If user is true (logged in) return <outlet/>:
	/**
	 * <Outlet /> is a special component from React Router that renders the matching
	 * child route's element. It acts as a placeholder in the routing structure where
	 * nested routes can be displayed.
	 *
	 * <Navigate /> is a component from React Router that programmatically navigates
	 * to a specified path—in this case, the login page ('/login').
	 */
	return user ? <Outlet /> : <Navigate to='/login' />; // Redirect if not authenticated
};

export default ProtectedRoute;
