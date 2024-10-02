<<<<<<< Updated upstream
import React, { useState } from 'react';
import Login from './Login'; // Import the Login component

const ListGroup: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false); // State to control Login component visibility

  const handleLoginClick = () => {
    setShowLogin(true); // Show the Login component when button is clicked
  };

  const handleCloseLogin = () => {
    setShowLogin(false); // Close the Login component
  };

  return (
    <>
      <nav className="navbar"> </nav>
      <div className="navbar-container">
        {/* When this button is clicked, show the Login component */}
        <button className="Login" onClick={handleLoginClick}>Login</button>
      </div>

      {/* Conditionally render the Login component when showLogin is true */}
      {showLogin && <Login showForm={showLogin} onClose={handleCloseLogin} />}
    </>
  );
};
=======
// the Input Expense and Login buttons need a helper cmpnt that pops up with parameters.

function ListGroup() {}
>>>>>>> Stashed changes

export default ListGroup;
