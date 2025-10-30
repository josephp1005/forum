export interface StandardizedNarrativeItem {
    type: 'article' | 'post';
    time: string; // ISO date string
    author: string;
    source: string; // platform/publication name
    has_title: boolean;
    title: string | null;
    body: string;
    url: string;
    metrics: any | null; // platform-specific metrics
    picture: string | null; // Supabase public URL or article image URL
}

export interface NarrativeResponse {
    articles: StandardizedNarrativeItem[];
    posts: StandardizedNarrativeItem[];
    timeframe: string;
}

export interface TwitterMetrics {
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
    bookmarks: number;
    impressions: number;
}

export interface RedditMetrics {
    score: number;
    comments: number;
}

// Types for source data structures
export interface TwitterPostData {
    id: string;
    text: string;
    author_id: string;
    created_at: string;
    public_metrics: {
        like_count: number;
        quote_count: number;
        reply_count: number;
        retweet_count: number;
        bookmark_count: number;
        impression_count: number;
    };
    edit_history_tweet_ids: string[];
}

export interface RedditPostData {
    title: string;
    url: string;
    score: number;
    comments: number;
    created_utc: number;
    author: string;
    body: string;
}

export interface NewsApiArticleData {
    url: string;
    title: string;
    author: string;
    source: {
        id: string | null;
        name: string;
    };
    content: string;
    urlToImage: string;
    description: string;
    publishedAt: string;
}