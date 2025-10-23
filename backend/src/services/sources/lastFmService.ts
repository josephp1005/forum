export const fetchLastFmData = async (subCategory, sourceParams: { artist: string, track?: string }): Promise<number> => {
    let listenerCount = 0;
    if (subCategory === 'songs') {
        if (!sourceParams.track) {
            throw new Error('Track name is required for songs sub-category');
        }
        
        listenerCount = await getTrackListenerCount(sourceParams.artist, sourceParams.track);
    }

    if (subCategory === 'artists') {
        listenerCount = await getArtistListenerCount(sourceParams.artist);
    }

    return listenerCount;
}

const getTrackListenerCount = async (artist: string, track: string): Promise<number> => {
    try {
        const apiKey = process.env.LASTFM_API_KEY;

        const baseUrl = 'http://ws.audioscrobbler.com/2.0/';
        const url = `${baseUrl}?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.track || !data.track.listeners) {
            throw new Error('Track or listener count not available');
        }

        return parseInt(data.track.listeners, 10);
    } catch (error) {
        console.error('Error fetching listener count from Last.fm:', error);
        throw error;
    }
}

const getArtistListenerCount = async (artist: string): Promise<number> => {
    try {
        const apiKey = process.env.LASTFM_API_KEY;

        const baseUrl = 'http://ws.audioscrobbler.com/2.0/';
        const url = `${baseUrl}?method=artist.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&format=json`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.artist || !data.artist.stats || !data.artist.stats.listeners) {
            throw new Error('Artist or listener count not available');
        }

        return parseInt(data.artist.stats.listeners, 10);
    } catch (error) {
        console.error('Error fetching listener count from Last.fm:', error);
        throw error;
    }
}