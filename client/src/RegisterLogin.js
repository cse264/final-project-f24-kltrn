import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './RegisterLogin.css';
import pic from './calendar.png';

const RegisterLogin = () => {
  const [userGoogleInfo, setUserGoogleInfo] = useState(null);
  const [showRoles, setShowRoles] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const nav = useNavigate();

  // Google OAuth setup
  const CLIENT_ID = '835824290802-l35n15ukorvso0q9ie4bk342lcb4t8j6.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyDMZl4zNDY457YuPlsguti7hiJpTXo-d4Q';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
  
  const tokenClientRef = useRef(null);

  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    maybeEnableButtons();
  };

  const maybeEnableButtons = () => {
    const authorizeButton = document.getElementById('authorize_button');
    if (window.gapi.client && tokenClientRef.current && authorizeButton) {
      authorizeButton.style.visibility = 'visible';
    }
  };

  const handleAuthCallback = async (resp) => {
    if (resp.error) {
      throw resp;
    }

    try {
      const newToken = window.gapi.client.getToken().access_token;
      // setIsLoggedIn(true); // Set the logged-in state to true

      const userInfoResponse = await window.gapi.client.request({
        path: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });

      const { name, email } = userInfoResponse.result;
      setUserGoogleInfo({ name, email }); // Set user info

      // Proceed to role selection
      setShowRoles(true);
    } catch (error) {
     console.log('Error during sign-in:', error);
    }
  };

  const handleAuthClick = async () => {
    if (!window.gapi.client.getToken()) {
      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClientRef.current.requestAccessToken({ prompt: '' });
    }
  };

  const handleRoleSubmit = async (role) => {
    if (!role || !userGoogleInfo) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userGoogleInfo, role }),
        credentials: 'include',
      });

      const data = await response.json();
      if (data.userId && data.userEmail) {
        setUser({ userId: data.userId, userEmail: data.userEmail, role: role });
      }

      setShowRoles(false); // Hide role selection
      // setIsLoggedIn(true); // Set user as logged in
      nav('/calendar'); // Navigate to calendar or another page after role selection
    } catch (error) {
      console.error('Error submitting role:', error);
    }
  };

  useEffect(() => {
    const gapiLoaded = () => {
      window.gapi.load('client', initializeGapiClient);
    };

    const gisLoaded = () => {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleAuthCallback,
      });
      maybeEnableButtons();
    };

    const loadScripts = () => {
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = gapiLoaded;
      document.body.appendChild(gapiScript);

      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = gisLoaded;
      document.body.appendChild(gisScript);
    };

    loadScripts();
  }, []);

  return (
    <div>
      <div className="login-container">
        {!userGoogleInfo && (
          <div>
            <img src={pic} alt="calendar" className="image" />
            <h2>Log in to PlanPal!</h2>
            <button id="authorize_button" onClick={handleAuthClick}>
              Log In with Google
            </button>
          </div>
        )}
      </div>

      {showRoles && (
        <div className="role-select-container">
          <div className="role-select-box">
            <h3>Welcome {userGoogleInfo?.name}!</h3>
            <h3>Please select your role:</h3>
            <button onClick={() => handleRoleSubmit('Event Organizer')}>Event Organizer</button>
            <button onClick={() => handleRoleSubmit('Invitee')}>Invitee</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterLogin;
