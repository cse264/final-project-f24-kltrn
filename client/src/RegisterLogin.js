import React, { useRef, useState, useEffect } from 'react';
import pic from './calendar.png'; // Import the image here
import './App.css'; // Add styles for the login container if needed

const CLIENT_ID = '835824290802-l35n15ukorvso0q9ie4bk342lcb4t8j6.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDMZl4zNDY457YuPlsguti7hiJpTXo-d4Q';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

function RegisterLogin({ setShowRoles, setUserGoogleInfo, setIsLoggedIn, setEvents }) {
  const [email, setEmail] = useState(null);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [showRoles, setShowRolesState] = useState(false); // Local state for role selection
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

      const userInfoResponse = await window.gapi.client.request({
        path: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });

      const { name, email } = userInfoResponse.result;
      setUserGoogleInfo({ name, email });
      setEmail(email);
      setLoggedIn(true);

      const response = await fetch('http://localhost:8000/user-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.exists) {
        setShowRoles(true);
        setShowRolesState(true); // Show the role selection screen
      } else {
        setShowRoles(false);
        setIsLoggedIn(true);
        await listUpcomingEvents();
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const listUpcomingEvents = async () => {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      });

      const events = response.result.items;
      setEvents(events.map(event => ({
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      })));
    } catch (error) {
      console.error('Error fetching events', error);
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
    if (!role || !email) {
      return;
    }

    // Store the selected role and hide the role selection screen
    // setShowRoles(false);
    // setShowRolesState(false); // Hide the role selection screen
    setIsLoggedIn(true);
    // setUserGoogleInfo({ ...setUserGoogleInfo, role }); // Update user role
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
      {!isLoggedIn && (
        <div>
          <img src={pic} alt="calendar" className="image"></img>
          <h2>Log in to PlanPal!</h2>
          <button id="authorize_button" onClick={handleAuthClick}>
            Log In with Google
          </button>
        </div>
      )}
      </div>

      {isLoggedIn && showRoles && (
        <div className="role-select-container">
          <div className="role-select-box">
            <h3>Please select your role: </h3>
            <button onClick={() => handleRoleSubmit('Event Organizer')}>Event Organizer</button>
            <button onClick={() => handleRoleSubmit('Invitee')}>Invitee</button>
          </div>
        </div>
      )}

      {/* {isLoggedIn && !showRoles && (
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
          />
          <button id="signout_button" onClick={handleSignoutClick}>
            Sign Out
          </button>
        </div>
      )} */}
    </div>
  );
}

export default RegisterLogin;
