export const fetchDeezerData = async (sourceParams: { id: string}): Promise<number> => {
    const rank = await getRank(sourceParams.id);
    return rank;
}

const getRank = async (id: string): Promise<number> => {
    try {
        const url = `https://api.deezer.com/track/${id}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Deezer API error: ${response.status} ${response.statusText}`);
        }

        const trackData = await response.json();

        if (!trackData.rank && trackData.rank !== 0) {
            throw new Error('Rank data not available for this track');
        }

        return trackData.rank;

    } catch (error) {
        console.error('Error fetching track rank:', error);
        throw error;
    }
}