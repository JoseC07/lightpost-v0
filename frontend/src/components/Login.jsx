import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  // We'll need a way to signal successful login to the App component
  // const { onLoginSuccess } = props; // Example: Pass a callback prop

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/login', { // Adjust URL if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // IMPORTANT: Send credentials to allow cookies to be set
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful!');
        // Clear form
        setEmail('');
        setPassword('');
        // Call onLoginSuccess with the user data from the response
        if (onLoginSuccess) {
          onLoginSuccess(data.user); // Assuming backend sends { user: { ... } } 
        }
        console.log('Login success, user:', data.user); // Assuming backend sends user data
        // The accessToken should now be set as an HttpOnly cookie by the server
      } else {
        setMessage(`Login failed: ${data.message || 'Invalid credentials'}`);
      }
    } catch (error) { 
      console.error('Login error:', error);
      setMessage('Login failed: Could not connect to server.');
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email">Email:</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="login-password">Password:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
      {/* Add basic styling or link to register */}
    </div>
  );
}

export default Login; 