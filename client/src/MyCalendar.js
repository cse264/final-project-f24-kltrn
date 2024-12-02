import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

// Google Calendar Integration
function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Ref to store the tokenClient
  const tokenClientRef = useRef(null);

  const CLIENT_ID = '835824290802-l35n15ukorvso0q9ie4bk342lcb4t8j6.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyDMZl4zNDY457YuPlsguti7hiJpTXo-d4Q';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

  // Function to initialize the Google API client
  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    maybeEnableButtons();
  };

  // Enable the authorize button when both APIs are loaded
  const maybeEnableButtons = () => {
    if (window.gapi.client && tokenClientRef.current) {
      document.getElementById('authorize_button').style.visibility = 'visible';
    }
  };

  // Handle the authentication callback
  const handleAuthCallback = async (resp) => {
    if (resp.error) {
      throw resp;
    }
    setIsLoggedIn(true);
    await listUpcomingEvents();
  };

  // List upcoming events after authentication
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

  // Google OAuth2 Authentication functions
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
      setIsLoggedIn(false); // Update login status when user signs out
    }
  };

  // Load the Google APIs and Identity Services
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

    // Load Google API and Google Identity Services
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
  }, []); // Empty dependency array, runs only once when component mounts

  return (
    <div>
      <h2>My Calendar</h2>

      {!isLoggedIn && (
        <button id="authorize_button" onClick={handleAuthClick}>
          Authorize
        </button>
      )}
      
      {/* Show the FullCalendar only after user is logged in */}
      {isLoggedIn && (
        <div>
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
