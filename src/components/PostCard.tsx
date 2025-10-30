import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Calendar, User, Heart, MessageCircle, Repeat2, Quote, Bookmark, Eye, ArrowUp } from 'lucide-react';
import { PostCardProps, TwitterMetrics, RedditMetrics } from '../types/narrative';

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleClick = () => {
    if (post.url) {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  };

  const isTwitterPost = post.source === 'X';
  const isRedditPost = post.source === 'Reddit';

  const renderTwitterMetrics = (metrics: TwitterMetrics) => (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Heart className="w-3 h-3" />
        <span>{formatNumber(metrics.likes)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Repeat2 className="w-3 h-3" />
        <span>{formatNumber(metrics.retweets)}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageCircle className="w-3 h-3" />
        <span>{formatNumber(metrics.replies)}</span>
      </div>
      {metrics.impressions > 0 && (
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{formatNumber(metrics.impressions)}</span>
        </div>
      )}
    </div>
  );

  const renderRedditMetrics = (metrics: RedditMetrics) => (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <ArrowUp className="w-3 h-3" />
        <span>{formatNumber(metrics.score)}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageCircle className="w-3 h-3" />
        <span>{formatNumber(metrics.comments)}</span>
      </div>
    </div>
  );

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {post.has_title && post.title && (
              <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
            )}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {post.source}
              </Badge>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTime(post.time)}</span>
              </div>
            </div>
          </div>

          {post.picture && (
            <div className="flex-shrink-0">
              <img
                src={post.picture}
                alt={`${post.source} logo`}
                className="w-8 h-8 rounded object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {post.body && (
          <p className="text-sm text-foreground line-clamp-4 mb-3">
            {post.body}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {post.metrics && isTwitterPost && (
              renderTwitterMetrics(post.metrics as TwitterMetrics)
            )}
            {post.metrics && isRedditPost && (
              renderRedditMetrics(post.metrics as RedditMetrics)
            )}
            {!post.metrics && (
              <span className="text-xs text-muted-foreground">Post</span>
            )}
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
        </div>
      </CardContent>
    </Card>
  );
};