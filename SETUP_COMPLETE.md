# 🚀 Complete Setup Instructions

You now have a complete Twitter API integration with a backend proxy to avoid CORS issues!

## What's Been Created

### Backend Server (`/backend/`)
- Express.js server that proxies Twitter API requests
- Rate limiting (15 minutes between requests)
- CORS handling for your frontend
- Environment variable configuration

### Updated Frontend Code
- TwitterApiService now uses the backend proxy
- No bearer token needed in frontend (handled by backend)
- Preserved all your existing customizations
- Real-time data only for LeBron James market

## Setup Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Twitter Bearer Token
Edit `backend/.env` and replace the placeholder:
```env
TWITTER_BEARER_TOKEN=your_actual_twitter_bearer_token_here
```

Get your token from: https://developer.twitter.com/

### 3. Start the Backend Server
```bash
cd backend
npm run dev
```

The server will start on http://localhost:3002

### 4. Verify Backend is Working
Open http://localhost:3002/health in your browser. You should see:
```json
{
  "status": "ok",
  "canMakeRequest": true,
  "timeUntilNextRequest": 0,
  "lastRequestTime": 0
}
```

### 5. Start Your Frontend
```bash
npm run dev
```

Your frontend should now be running on http://localhost:3001

## How It Works

1. **LeBron James Market**: Uses real Twitter API data
   - Shows "Real-time" badge
   - "Update Now" button (when rate limit allows)
   - Countdown timer for next update
   - Tweet counts displayed as attention scores

2. **All Other Markets**: Continue using simulated data
   - Event markers on charts
   - Fake attention scores

3. **Rate Limiting**: 
   - Only 1 request every 15 minutes
   - Handled on both frontend and backend
   - Clear error messages when exceeded

4. **Data Persistence**:
   - Stored in localStorage
   - Automatic CSV downloads for backup
   - Data merging prevents duplicates

## Testing

1. Navigate to LeBron James market in your app
2. You should see the "Real-time" badge
3. Click "Update Now" to fetch real Twitter data
4. Check browser console for debug logs
5. Data should persist between page refreshes

## Troubleshooting

- **CORS errors**: Make sure backend is running on port 3002
- **Rate limit errors**: Wait 15 minutes between requests
- **No data**: Check that backend has valid Twitter token
- **Connection refused**: Ensure backend server is started first

## Files Created/Modified

### New Backend Files:
- `backend/package.json` - Dependencies
- `backend/server.js` - Express server
- `backend/.env` - Environment variables
- `backend/README.md` - Backend documentation

### Modified Frontend Files:
- `src/services/twitterApi.ts` - Now uses proxy
- `src/hooks/useAttentionData.ts` - Removed bearer token requirement
- `src/components/IndexView.tsx` - Updated integration

Your setup is now complete! 🎉