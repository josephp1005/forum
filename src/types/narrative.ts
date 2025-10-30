export interface NarrativeItem {
    type: 'article' | 'post';
    time: string; // ISO date string
    author: string;
    source: string; // platform/publication name
    has_title: boolean;
    title: string | null;
    body: string;
    url: string;
    metrics: TwitterMetrics | RedditMetrics | null;
    picture: string | null; // Supabase public URL or article image URL
}

export interface NarrativeResponse {
    articles: NarrativeItem[];
    posts: NarrativeItem[];
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

// Helper type for timeframe selection
export type NarrativeTimeframe = string; // e.g., '30m', '1h', '24h', '1d', '7d'

// Props interfaces for components
export interface NarrativeSectionProps {
    marketId: string;
    timeframe: NarrativeTimeframe;
    onTimeframeChange: (timeframe: NarrativeTimeframe) => void;
}

export interface ArticleCardProps {
    article: NarrativeItem;
}

export interface PostCardProps {
    post: NarrativeItem;
}

export interface TimeframeSelectorProps {
    selectedTimeframe: NarrativeTimeframe;
    onTimeframeChange: (timeframe: NarrativeTimeframe) => void;
}