import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

const RegisterLogin = () => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { setUserEmail } = useContext(UserContext);
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
    
      // Make post request to /register
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setUserEmail(email);
        nav('/home');
      } else {
        setMessage(data.message || 'Registration error');
      }
    } catch (error) {
      setMessage('Registration error - ', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Post request to /login
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setUserEmail(email);
        nav('/home');
      } else {
        setMessage(data.message || 'Login error');
      }
    } catch (error) {
      setMessage('Login error');
    }
  };

  // If user selects register, register screen displays
  // If user selects login, login screen displays
  return (
    <div>
      <div>
        <button onClick={() => setIsRegistering(true)}>Register</button>
        <button onClick={() => setIsRegistering(false)}>Login</button>
      </div>
      <div>
        {isRegistering ? (
          <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required/>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required/>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required/>
            <button type="submit">Register</button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required/>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required/>
            <button type="submit">Login</button>
          </form>
        )}
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterLogin;
