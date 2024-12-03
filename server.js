require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const { google } = require('googleapis');

// Getting schema from schema file
const { User } = require('./db_schema/Schema.js');

// App and port constants
const app = express();
const PORT = process.env.PORT || 8000;

// Enable cors
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(cookieParser());

// For parsing json
app.use(express.json());

// For event routes
const eventRoutes = require('./events.js');
app.use('/events', eventRoutes);

// For connecting to google api
const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:8000/auth/google/callback'
);

// Define scopes
const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar'];

// Starts google auth
app.get('/auth/google', (req, res) => {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authorizeUrl);
});

// Handle the OAuth2 callback
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Save token in a cookie so future requests don't need to log in again
    res.cookie('google_access_token', tokens.access_token, { httpOnly: true });

    res.redirect('http://localhost:3000/home');
  } catch (error) {
    console.error('Error during OAuth2 callback:', error);
    res.status(500).send('Authentication failed');
  }
});

// This connects to the database using .env MONGO_URI constant
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));


// Login user via google
app.post('/google-login', async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Missing name, email or role'});
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, role });
      console.log('User added to database: ', email);
    }

    res.status(200).json({ message: 'Google login via backend complete' });
  } catch (err) {
    console.error('Error logging in user', err);
    res.status(400);
  }
});

// Check if user exists
app.post('/user-exists', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is missing' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ exists: false });
    }

    res.status(200).json({ exists: true });
  } catch (err) {
    console.error('Error checking if user exists:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Gets list of events from the user's google calendar
// Returns up to 50 future events, ordered by start time
app.get('/google-events', async (req, res) => {
  const accessToken = req.cookies.google_access_token;

  if (!accessToken) {
    return res.status(401).json({ message: 'User not signed in/authenticated. '});
  }

  try {
    const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
    oAuth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(), // include events starting from today
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.status(200).json(data.items);
  } catch (err) {
    console.error('Error getting events from users google calendar: ', err);
    res.status(400);
  }

});


// Testing endpoints
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API testing!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});