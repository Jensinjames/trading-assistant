"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
}

interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
}

export default function MarketAnalysis() {
  const { data: session } = useSession();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators | null>(null);
  const [symbol, setSymbol] = useState<string>('BTC/USD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trading/market-data?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch market data');
      
      const data = await response.json();
      setMarketData(data);
      
      // Fetch technical indicators
      const indicatorsResponse = await fetch(`/api/trading/technical-indicators?symbol=${symbol}`);
      if (!indicatorsResponse.ok) throw new Error('Failed to fetch technical indicators');
      
      const indicatorsData = await indicatorsResponse.json();
      setTechnicalIndicators(indicatorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Set up interval for real-time updates
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [symbol, session]);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Market Analysis</h2>
        <select
          aria-label="Select trading pair"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="BTC/USD">BTC/USD</option>
          <option value="ETH/USD">ETH/USD</option>
          <option value="SOL/USD">SOL/USD</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : marketData && technicalIndicators ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Price Information</h3>
              <div className="space-y-2">
                <p>Current Price: ${marketData.price.toFixed(2)}</p>
                <p className={marketData.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  24h Change: {marketData.change.toFixed(2)}%
                </p>
                <p>Volume: ${marketData.volume.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Technical Indicators</h3>
              <div className="space-y-2">
                <p>RSI: {technicalIndicators.rsi.toFixed(2)}</p>
                <p>MACD: {technicalIndicators.macd.value.toFixed(2)}</p>
                <p>Signal: {technicalIndicators.macd.signal.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Moving Averages</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-medium">SMA 20</p>
                <p>{technicalIndicators.movingAverages.sma20.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-medium">SMA 50</p>
                <p>{technicalIndicators.movingAverages.sma50.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-medium">SMA 200</p>
                <p>{technicalIndicators.movingAverages.sma200.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No data available</div>
      )}
    </div>
  );
} 