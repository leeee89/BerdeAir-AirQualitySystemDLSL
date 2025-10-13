import React, { useState } from 'react';
import "../css/Login.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const adminAccounts = [
    { email: 'admin1@dlsl.edu.ph', password: 'admin123' },
    { email: 'admin2@dlsl.edu.ph', password: 'admin456' },
    { email: 'admin3@dlsl.edu.ph', password: 'admin789' },
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    const isAdmin = adminAccounts.some(
      (admin) => admin.email === email && admin.password === password
    );

    if (isAdmin) {
      onLoginSuccess({ role: 'admin', email });
      return;
    }

    if (email.endsWith('@dlsl.edu.ph')) {
      onLoginSuccess({ role: 'student', email });
      return;
    }

    alert('Invalid credentials or unauthorized access.');
  };

  return (
    <div className="login-container">
      <h2 className="login-title">BerdeAir Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="login-input-group">
          <label htmlFor="email" className="login-label">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="login-input-group">
          <label htmlFor="password" className="login-label">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="login-button">Login</button>
      </form>

      <div className="login-note">
        Use a <strong>@dlsl.edu.ph</strong> email to login or one of the admin accounts above.
      </div>
    </div>
  );
};

export default Login;
