import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { ArticleCardProps } from '../types/narrative';

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
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

  const handleClick = () => {
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {article.has_title && article.title && (
              <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
            )}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {article.source}
              </Badge>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTime(article.time)}</span>
              </div>
            </div>
          </div>

          {article.picture && (
            <div className="flex-shrink-0">
              <img
                src={article.picture}
                alt={article.title || 'Article image'}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {article.body && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {article.body}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Article</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
};