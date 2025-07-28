import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTheme } from '../lib/ThemeContext';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}

interface NewsPanelProps {
  selectedCountry?: string;
  onRefresh?: () => void;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ selectedCountry = 'US', onRefresh }) => {
  const { colors } = useTheme();
  const user = useQuery(api.auth.loggedInUser);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRSSFeed = useAction(api.forex.fetchRSSFeed);
  const updateUserNewsCountry = useMutation(api.forex.updateUserNewsCountry);

  const loadNews = async (countryCode: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newsData = await fetchRSSFeed({ countryCode });
      setNews(newsData);
      
      // Save user's country preference
      await updateUserNewsCountry({
        userId: user._id,
        countryCode,
      });
    } catch (error) {
      console.error('Error loading news:', error);
      // News will be empty if API fails
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Load news when country changes
  useEffect(() => {
    if (selectedCountry) {
      void loadNews(selectedCountry);
    }
  }, [selectedCountry]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadNews(selectedCountry).finally(() => setRefreshing(false));
    onRefresh?.();
  };

  // Listen for refresh events from parent
  useEffect(() => {
    const handleRefreshEvent = () => {
      handleRefresh();
    };
    
    window.addEventListener('refreshNews', handleRefreshEvent);
    return () => window.removeEventListener('refreshNews', handleRefreshEvent);
  }, [selectedCountry]);



  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleNewsItemClick = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* News content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${colors.status.info}`}></div>
          </div>
        ) : (
          <div className="space-y-1">
            {news.length > 0 ? (
              news.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-2 hover:${colors.background.tertiary} ${colors.border.primary} border-b cursor-pointer transition-colors`}
                  onClick={() => handleNewsItemClick(item.url)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-xs font-medium line-clamp-2 flex-1 pr-2 ${colors.text.primary}`}>
                      {item.title}
                    </h4>
                    <ExternalLink className={`w-3 h-3 ${colors.text.muted} flex-shrink-0`} />
                  </div>
                  <p className={`text-xs ${colors.text.secondary} line-clamp-2 mb-1`}>
                    {item.summary}
                  </p>
                  <div className={`flex justify-between items-center text-xs ${colors.text.tertiary}`}>
                    <span>{item.source}</span>
                    <span>{formatTimeAgo(item.publishedAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={`flex justify-center items-center h-24 ${colors.text.tertiary}`}>
                <div className="text-center">
                  <Newspaper className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                  <p className="text-xs">No news available</p>
                  <p className="text-xs">Try refreshing or switching countries</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default NewsPanel;
