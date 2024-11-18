require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

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

// For parsing json
app.use(express.json());

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