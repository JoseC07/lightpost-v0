import React, { useState } from 'react';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/register', { // Adjust URL if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      // Try to parse JSON regardless of response.ok to get error messages
      let data = {};
      try {
          data = await response.json();
      } catch (jsonError) {
          // If JSON parsing fails on an error response, maybe it's just text
          if (!response.ok) {
              try {
                  data.message = await response.text(); // Get raw text response
              } catch (textError) {
                 // Ignore if we can't even get text
              }
          }
          // If response was ok but JSON failed, that's unexpected
          console.error("Failed to parse server response:", jsonError);
      }


      if (response.ok) {
        setMessage('Registration successful! You can now log in.');
        setMessageType('success');
        setEmail('');
        setUsername('');
        setPassword('');
      } else {
        // Handle specific known errors more gracefully
        const serverMessage = data.message || 'Unknown error';
        if (serverMessage.includes('Email already exists')) {
            setMessage('Registration failed: This email address is already registered.');
        } else if (serverMessage.includes('Username already exists')) {
            setMessage('Registration failed: This username is already taken.');
        } else {
            // Generic message for other errors
            setMessage(`Registration failed: ${serverMessage}`);
        }
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed: Could not connect to the server. Please try again later.');
      setMessageType('error');
    } finally {
      setIsLoading(false); // Ensure loading is stopped even if errors occur
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reg-email">Email:</label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading} // Disable input during loading
          />
        </div>
        <div>
          <label htmlFor="reg-username">Username:</label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading} // Disable input during loading
          />
        </div>
        <div>
          <label htmlFor="reg-password">Password:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading} // Disable input during loading
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {/* Apply conditional class based on messageType */}
      {message && <p className={`message ${messageType}`}>{message}</p>}
      {/* Add basic styling or link to login */}
    </div>
  );
}

export default Register; 