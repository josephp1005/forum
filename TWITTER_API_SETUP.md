# Twitter API Configuration

To enable real-time attention data for LeBron James market, you need to:

1. **Get Twitter Bearer Token**:
   - Sign up for Twitter API access at https://developer.twitter.com/
   - Create a new app and get your Bearer Token

2. **Set Environment Variable**:
   Create a `.env.local` file in your project root with:
   ```
   REACT_APP_TWITTER_BEARER_TOKEN=your_bearer_token_here
   ```

3. **Usage**:
   - Only LeBron James market (id: 'lebron-james') will use real Twitter data
   - All other markets continue to use simulated data
   - API calls are rate-limited to once every 15 minutes
   - Data is automatically saved to localStorage and downloadable as CSV

4. **Manual Testing**:
   - The "Update Now" button will appear for LeBron James market
   - A countdown timer shows when the next update is allowed
   - Error messages will display if rate limits are exceeded

5. **Data Storage**:
   - Attention data is stored in localStorage for persistence
   - CSV files are automatically downloaded for backup
   - Previous data is merged with new data to build historical charts

## API Endpoint Details

**Endpoint**: `https://api.x.com/2/tweets/counts/recent`
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**: `query=LeBron James`

**Response**: Returns tweet counts for the last 7 days, grouped by hour.