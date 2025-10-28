export const fetchSpotifyData = async (db, subCategory: string, indexId: number, sourceParams: { id: string, access_token: string, access_token_created_at: string }): Promise<any> => {
    if (subCategory === 'songs') {
        const popularity = await getPopularity(db, indexId, sourceParams.id, sourceParams.access_token, sourceParams.access_token_created_at);
        return popularity;
    }

    if (subCategory === 'artists') {
        const metrics = await fetchArtistMetrics(db, indexId, sourceParams.id, sourceParams.access_token, sourceParams.access_token_created_at);
        return metrics;
    }
}

const getPopularity = async (db, indexId: number, id: string, access_token: string, access_token_created_at: string): Promise<number> => {
    try {
        let currentToken = access_token;
        const tokenCreatedAt = access_token_created_at ? new Date(access_token_created_at) : null;
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (!currentToken || !tokenCreatedAt || tokenCreatedAt < oneHourAgo) {
            console.log('Access token expired or missing, fetching new one...');
            currentToken = await getNewAccessToken(db, indexId);
        }

        const popularity = await fetchTrackPopularity(id, currentToken);
        
        return popularity;

    } catch (error) {
        console.error('Error getting Spotify popularity:', error);
        throw error;
    }
};

const fetchTrackPopularity = async (trackId: string, accessToken: string): Promise<number> => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Spotify access token is invalid or expired');
            }
            throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
        }

        const trackData = await response.json();
        
        if (!trackData.popularity && trackData.popularity !== 0) {
            throw new Error('Popularity data not available for this track');
        }

        return trackData.popularity;

    } catch (error) {
        console.error('Error fetching track popularity:', error);
        throw error;
    }
};

const fetchArtistMetrics = async (db, indexId: number, artistId: string, access_token: string, access_token_created_at: string): Promise<number> => {
    try {
        let currentToken = access_token;
        const tokenCreatedAt = access_token_created_at ? new Date(access_token_created_at) : null;
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (!currentToken || !tokenCreatedAt || tokenCreatedAt < oneHourAgo) {
            console.log('Access token expired or missing, fetching new one...');
            currentToken = await getNewAccessToken(db, indexId);
        }
        
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Spotify access token is invalid or expired');
            }
            throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
        }

        const artistData = await response.json();
        
        if (!artistData.popularity && artistData.popularity !== 0) {
            throw new Error('Popularity data not available for this artist');
        }

        if (!artistData.followers || artistData.followers.total == null) {
            throw new Error('Followers data not available for this artist');
        }

        //return { popularity: artistData.popularity, followers: artistData.followers.total };
        return artistData.followers.total;

    } catch (error) {
        console.error('Error fetching artist metrics:', error);
        throw error;
    }
};

const getNewAccessToken = async (db, indexId: number): Promise<string> => {
    try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Spotify client credentials not configured');
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error(`Spotify token request failed: ${response.status} ${response.statusText}`);
        }

        const tokenData = await response.json();
        const newToken = tokenData.access_token;
        const createdAt = new Date().toISOString();

        await updateTokenInDatabase(db, indexId, newToken, createdAt);

        return newToken;

    } catch (error) {
        console.error('Error getting new Spotify access token:', error);
        throw error;
    }
};

const updateTokenInDatabase = async (db, indexId: number, accessToken: string, createdAt: string): Promise<void> => {
    try {
        const { data: currentIndex, error: fetchError } = await db
            .from('indices')
            .select('attention_query_params')
            .eq('id', indexId)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch current attention query params: ${fetchError.message}`);
        }

        const updatedParams = {
            ...currentIndex.attention_query_params,
            spotify: {
                ...currentIndex.attention_query_params.spotify,
                access_token: accessToken,
                access_token_created_at: createdAt
            }
        };

        const { error: updateError } = await db
            .from('indices')
            .update({ attention_query_params: updatedParams })
            .eq('id', indexId);

        if (updateError) {
            throw new Error(`Failed to update token in database: ${updateError.message}`);
        }

        console.log('Successfully updated Spotify access token in database');

    } catch (error) {
        console.error('Error updating token in database:', error);
        throw error;
    }
};