import React, { useState } from 'react';
import './login.css';

interface LoginProps {
  showForm: boolean;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ showForm, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email:', email, 'Password:', password);
  };

  return (
    <div>
      {showForm && (
        <div className="login-modal">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit">Sign In</button>
          </form>

          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Login;
