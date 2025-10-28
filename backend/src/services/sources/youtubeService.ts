import { google } from 'googleapis';

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
});

export const fetchYouTubeData = async (subCategory: string, sourceParams: { id: string, query?: string }): Promise<any> => {

    if (subCategory === 'songs') {
        const viewCount = await getVideoViewCount(sourceParams.id);
        return viewCount;
    }

    if (subCategory === 'artists') {
        //const viewCount = await getChannelViewCount(sourceParams.id);
        const numNewVideos = sourceParams.query ? await getNumNewVideos(sourceParams.query) : 0;
        return numNewVideos;
    }

}

const getVideoViewCount = async (videoId: string): Promise<number> => {
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

const getChannelViewCount = async (channelId: string): Promise<number> => {
    try {
        const response = await youtube.channels.list({
            part: ['statistics'],
            id: [channelId],
        });

        if (!response.data.items || response.data.items.length === 0) {
            throw new Error('Channel not found');
        }

        const channel = response.data.items[0];
        if (!channel.statistics || channel.statistics.viewCount == null) {
            throw new Error('Channel statistics or view count not found');
        }
        return parseInt(channel.statistics.viewCount, 10);
    } catch (error) {
        console.error('Error fetching YouTube channel view count:', error);
        throw error;
    }
}

const getNumNewVideos = async (query: string): Promise<number> => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        let totalVideoCount = 0;
        let nextPageToken: string | undefined = undefined;

        const response = await youtube.search.list({
            part: ['id'],
            q: query,
            publishedAfter: oneHourAgo,
            type: ['video'],
            maxResults: 50,
            pageToken: nextPageToken,
        });

        return response.data.pageInfo?.totalResults || 0;

    } catch (error) {
        console.error('Error fetching number of new YouTube videos:', error);
        throw error;
    }
}