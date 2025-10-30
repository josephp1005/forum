import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RefreshCw, Clock, Newspaper, MessageSquare } from 'lucide-react';
import { ArticleCard } from './ArticleCard';
import { PostCard } from './PostCard';
import { NarrativeSectionProps, NarrativeResponse, NarrativeTimeframe } from '../types/narrative';
import api from '../services/api';

export const NarrativeSection: React.FC<NarrativeSectionProps> = ({
  marketId,
  timeframe,
  onTimeframeChange
}) => {
  const [narrativeData, setNarrativeData] = useState<NarrativeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeframeOptions = [
    { value: '30m', label: '30 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '3h', label: '3 hours' },
    { value: '6h', label: '6 hours' },
    { value: '12h', label: '12 hours' },
    { value: '1d', label: '1 day' },
    { value: '2d', label: '2 days' },
    { value: '7d', label: '7 days' }
  ];

  const fetchNarrativeData = async () => {
    if (!marketId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.fetchNarrativeData(parseInt(marketId), timeframe);
      setNarrativeData(response);
    } catch (error) {
      console.error('Error fetching narrative data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch narrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNarrativeData();
  }, [marketId, timeframe]);

  const handleRefresh = () => {
    fetchNarrativeData();
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    onTimeframeChange(newTimeframe as NarrativeTimeframe);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Recent News & Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Error loading narrative data</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Recent News & Posts
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-[150px]">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading narrative data...</p>
          </div>
        ) : narrativeData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Articles Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-4 h-4" />
                <h3 className="font-semibold text-sm">
                  Articles ({narrativeData.articles.length})
                </h3>
              </div>
              
              {narrativeData.articles.length > 0 ? (
                <div className="space-y-3">
                  {narrativeData.articles.slice(0, 50).map((article, index) => (
                    <ArticleCard key={`${article.url}-${index}`} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No articles found for this timeframe</p>
                </div>
              )}
            </div>

            {/* Posts Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4" />
                <h3 className="font-semibold text-sm">
                  Posts ({narrativeData.posts.length})
                </h3>
              </div>
              
              {narrativeData.posts.length > 0 ? (
                <div className="space-y-3">
                  {narrativeData.posts.slice(0, 50).map((post, index) => (
                    <PostCard key={`${post.url}-${index}`} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No posts found for this timeframe</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No narrative data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};