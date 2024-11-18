require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const { User, Session } = require('./db_schema/Schema.js');

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API testing!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});