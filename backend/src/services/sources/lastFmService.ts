export const fetchLastFmData = async (sourceParams: { artist: string, track: string }): Promise<number> => {
    const playCount = await getPlayCount(sourceParams.artist, sourceParams.track);
    return playCount;
}

const getPlayCount = async (artist: string, track: string): Promise<number> => {
    try {
        const apiKey = process.env.LASTFM_API_KEY;

        const baseUrl = 'http://ws.audioscrobbler.com/2.0/';
        const url = `${baseUrl}?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.track || !data.track.playcount) {
            throw new Error('Track or playcount not available');
        }

        return parseInt(data.track.playcount, 10);
    } catch (error) {
        console.error('Error fetching play count from Last.fm:', error);
        throw error;
    }
}