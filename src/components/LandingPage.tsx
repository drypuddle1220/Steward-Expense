import React from "react";
import "../LandingPage.css"; // Importing the CSS file for styling
const LandingPage: React.FC = () => {
	return (
		<div className='landing-page'>
			{/* Navbar */}
			<nav className='navbar'>
				<div className='logo'>Steward</div>
				<div>
					<button className='log-in-btn'>Log In</button>
					<button className='sign-in-btn'>Sign In</button>
				</div>
			</nav>

			{/* Hero Section */}
			<header className='hero-section'>
				<h1>Take Control of Your Finances</h1>
				<p>
					Track, manage, and organize your expenses effortlessly. Stay
					on top of your spending with ease.
				</p>
			</header>

			{/* Features Section */}
			<section className='features-section'>
				<div className='feature'>
					<h3>Easy to Use</h3>
					<p>
						Add, edit, and categorize expenses quickly and
						intuitively.
					</p>
				</div>
				<div className='feature'>
					<h3>Track Spending</h3>
					<p>
						View a detailed breakdown of your expenses by category
						and date.
					</p>
				</div>
				<div className='feature'>
					<h3>Stay Organized</h3>
					<p>
						Export data and keep everything organized in one place.
					</p>
				</div>
			</section>

			{/* Footer */}
			<footer className='footer'>
				<div className='footer-links'>
					<a href='#'>About Us</a>
					<a href='#'>Contact</a>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
