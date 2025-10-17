import { google } from 'googleapis';

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
});

export const fetchYouTubeData = async (sourceParams: { id: string }): Promise<number> => {
    const viewCount = await getViewCount(sourceParams.id);
    return viewCount;
}

const getViewCount = async (videoId: string): Promise<number> => {
    try {
        const response = await youtube.videos.list({
            part: ['statistics'],
            id: [videoId],
        });

        if (!response.data.items || response.data.items.length === 0) {
            throw new Error('Video not found');
        }

        const video = response.data.items[0];
        if (!video.statistics || video.statistics.viewCount == null) {
            throw new Error('Video statistics or view count not found');
        }
        return parseInt(video.statistics.viewCount, 10);
    } catch (error) {
        console.error('Error fetching YouTube video view count:', error);
        throw error;
    }
};