import { useState, useEffect } from 'react';

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  price_btc: number;
  score: number;
  market_cap: number;
  market_cap_change_24h: number;
  price_change_24h: number;
  volume_24h: number;
}

export function useTrending() {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/trending');
        const data = await response.json();
        
        if (data.error) {
          console.warn('API returned error:', data.error);
        }
        
        setTrendingCoins(data.trendingCoins);
      } catch (err) {
        setError('Failed to load trending coins. Please try again later.');
        console.error('Error fetching trending coins:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingCoins();
    
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(fetchTrendingCoins, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return { trendingCoins, isLoading, error };
} 