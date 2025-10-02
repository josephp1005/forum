const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'] // Support both common React ports
}));

app.use(express.json());

// Rate limiting tracking (15 minutes)
let lastTwitterRequestTime = 0;
const RATE_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

function canMakeTwitterRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastTwitterRequestTime;
  return timeSinceLastRequest >= RATE_LIMIT_MS;
}

function getTimeUntilNextRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastTwitterRequestTime;
  const timeRemaining = RATE_LIMIT_MS - timeSinceLastRequest;
  return Math.max(0, timeRemaining);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    canMakeRequest: canMakeTwitterRequest(),
    timeUntilNextRequest: getTimeUntilNextRequest(),
    lastRequestTime: lastTwitterRequestTime
  });
});

// Proxy endpoint for Twitter API
app.get('/api/twitter/counts', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!process.env.TWITTER_BEARER_TOKEN) {
      return res.status(500).json({ error: 'Twitter Bearer Token not configured' });
    }

    // Check rate limiting
    if (!canMakeTwitterRequest()) {
      const timeUntilNext = Math.ceil(getTimeUntilNextRequest() / 60000);
      return res.status(429).json({ 
        error: `Rate limit exceeded. Next request allowed in ${timeUntilNext} minutes.`,
        timeUntilNextRequest: getTimeUntilNextRequest()
      });
    }

    console.log(`Fetching Twitter data for query: ${query}`);

    const url = new URL('https://api.x.com/2/tweets/counts/recent');
    url.searchParams.append('query', query);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter API error:', response.status, errorText);
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Update last request time on successful request
    lastTwitterRequestTime = Date.now();
    
    console.log(`Successfully fetched Twitter data. Data points: ${data.data?.length || 0}`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Twitter data',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Twitter Proxy Server running on http://localhost:${PORT}`);
  console.log(`🔑 Twitter Bearer Token: ${process.env.TWITTER_BEARER_TOKEN ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});