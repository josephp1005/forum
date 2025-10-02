# Twitter Proxy Backend

This backend server acts as a proxy for the Twitter API to avoid CORS issues in the frontend.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   - Copy your Twitter Bearer Token to `.env` file
   - Replace `your_twitter_bearer_token_here` with your actual token

3. **Start the server:**
   ```bash
   npm run dev  # for development with auto-restart
   # or
   npm start    # for production
   ```

4. **Verify it's working:**
   - Open http://localhost:3002/health in your browser
   - Should show rate limiting status and server health

## API Endpoints

### GET /health
Health check endpoint showing server status and rate limiting info.

### GET /api/twitter/counts?query=LeBron%20James
Proxy endpoint for Twitter's tweet counts API. Returns the same data format as the Twitter API.

## Rate Limiting

The server enforces the same 15-minute rate limiting as specified in your requirements:
- Only one request per 15 minutes is allowed
- Returns 429 status code if rate limit is exceeded
- Includes time until next request is allowed

## Usage with Frontend

Your frontend will now make requests to:
```
http://localhost:3002/api/twitter/counts?query=LeBron+James
```

Instead of directly to Twitter's API.