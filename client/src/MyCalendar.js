import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useAuth } from './Authentication';
import './App.css';
import pic from './calendar.png';

// Google Calendar Integration
function MyCalendar() {
  const [events, setEvents] = useState([]);
  const { isLoggedIn, setIsLoggedIn, login, token } = useAuth(); // Use context values
  const [ userGoogleInfo, setUserGoogleInfo] = useState(null);
  const [ showRoles, setShowRoles ] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userEmail, setUserEmail] = useState(null); 

  //store the tokenClient
  const tokenClientRef = useRef(null);

  const CLIENT_ID = '835824290802-l35n15ukorvso0q9ie4bk342lcb4t8j6.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyDMZl4zNDY457YuPlsguti7hiJpTXo-d4Q';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

  //initialize the Google API client
  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    maybeEnableButtons();
  };

  //Enable the authorize button when both APIs are loaded
  const maybeEnableButtons = () => {
    const authorizeButton = document.getElementById('authorize_button');
    if (window.gapi.client && tokenClientRef.current && authorizeButton) {
      authorizeButton.style.visibility = 'visible';
    }
  };

  //authentication callback
  const handleAuthCallback = async (resp) => {
    if (resp.error) {
      throw resp;
    }

    try {
      const newToken = window.gapi.client.getToken().access_token;
      login(newToken); 

      const userInfoResponse = await window.gapi.client.request({
        path: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });

      const { name, email } = userInfoResponse.result;
      setUserGoogleInfo({ name, email });

      const response = await fetch('http://localhost:8000/user-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.exists) {
        setShowRoles(true);
      }
      else {
        setShowRoles(false);
        setIsLoggedIn(true);
        await listUpcomingEvents();
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const handleRoleSubmit = async (role) => {
    if (!role || !userGoogleInfo) {
      return;
    }

    try {
      await fetch('http://localhost:8000/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userGoogleInfo, role }),
        credentials: 'include',
      });

      setShowRoles(false);
      setIsLoggedIn(true);
      await listUpcomingEvents();
    } catch (error) {
      console.error('Error submitting role:', error);
    }
  }

  //show upcoming events after authentication
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

  //Google OAuth2 Authentication functions
  const handleAuthClick = async () => {
    if (!window.gapi.client.getToken()) {
      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClientRef.current.requestAccessToken({ prompt: '' });
    }
  };

  const handleSignoutClick = () => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      setIsLoggedIn(false); //update login status when user signs out
    }
  };

  //load the Google APIs
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
            <h3>Welcome {userGoogleInfo.name}!</h3>
            <h3>Please select your role: </h3>
            <button onClick={() => handleRoleSubmit('Event Organizer')}>Event Organizer</button>
            <button onClick={() => handleRoleSubmit('Invitee')}>Invitee</button>
          </div>
        </div>
      )}

      {isLoggedIn && !showRoles && (
        <div className="calendar-container">
          {/* <p>Email: {userEmail}</p>  */}
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
          />
          <button id="signout_button" onClick={handleSignoutClick}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default MyCalendar;
