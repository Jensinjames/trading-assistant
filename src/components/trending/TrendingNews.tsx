import React, { useEffect, useState } from 'react';
import { NewspaperIcon } from '@heroicons/react/24/outline';
import { NewsItem, getTrendingNews } from '@/services/newsService';

export default function TrendingNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await getTrendingNews();
        setNews(newsData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch trending news');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-20 w-20 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="p-4 text-gray-500">
        <p>No trending news available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex space-x-4">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="h-20 w-20 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <NewspaperIcon className="h-4 w-4 mr-1" />
                <span>{item.source}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(item.published_at)}</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
} 