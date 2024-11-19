require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');

// Getting schema from schema file
const { User, Session } = require('./db_schema/Schema.js');

// App and port constants
const app = express();
const PORT = process.env.PORT || 8000;

// Enable cors
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
}));

app.use(cookieParser());

// For parsing json
app.use(express.json());

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

// Registering a new user
app.post('/register', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing name, email, or password'});
  }

  try {
    const hashPass = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashPass });
    res.status(201).json({ message: `User registered: ${email}`});
  } catch (err) {
    console.error('Error registering user', err);
    res.status(400);
  }
});

// Login existing user
app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password'});
  }

  try {
    const user = await User.findOne({ email });

    const passCheck = await bcrypt.compare(password, user.password);
    if (!passCheck) {
      return res.status(400).json({ message: 'Invalid login'});
    }

    res.status(200).json({ message: 'Login complete' });
  } catch (err) {
    console.error('Error logging in user', err);
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