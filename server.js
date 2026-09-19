require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const settings = require('./config/settings');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API routes
app.use('/api', apiRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'YtiDown' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

const PORT = settings.port || 3000;

app.listen(PORT, () => {
  console.log(`YtiDown server running on http://localhost:${PORT}`);
});
