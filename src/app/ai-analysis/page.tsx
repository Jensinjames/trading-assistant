"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

interface MarketAnalysis {
  overview: string;
  topCoins: {
    coin: string;
    analysis: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
  }[];
  tradingOpportunities: {
    coin: string;
    type: string;
    description: string;
  }[];
  timestamp: string;
}

export default function AIAnalysisPage() {
  return (
    <SearchParamsWrapper>
      <AIAnalysisContent />
    </SearchParamsWrapper>
  );
}

function AIAnalysisContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an API endpoint
      // that performs AI analysis
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAnalysis: MarketAnalysis = {
        overview: "The cryptocurrency market is showing mixed signals with Bitcoin consolidating above key support levels. Global markets remain cautious due to macroeconomic uncertainties, affecting risk assets including cryptocurrencies. Altcoins are showing varied performance with some layer-1 protocols outperforming the broader market.",
        topCoins: [
          {
            coin: "BTC",
            analysis: "Bitcoin is holding above critical support at $42,000. RSI indicates neutral conditions but volume suggests accumulation. Watch for a potential breakout above $45,000 resistance.",
            sentiment: "neutral"
          },
          {
            coin: "ETH",
            analysis: "Ethereum shows strength relative to Bitcoin with improving fundamentals. Technical indicators point to potential upside if it can maintain support above $2,300.",
            sentiment: "bullish"
          },
          {
            coin: "SOL",
            analysis: "Solana has been outperforming major cryptocurrencies with positive price action and increasing adoption. Technical indicators suggest continued strength.",
            sentiment: "bullish"
          }
        ],
        tradingOpportunities: [
          {
            coin: "ETH",
            type: "Long opportunity",
            description: "Consider entries near $2,300 with stop loss below $2,200 and targets at $2,600 and $2,800."
          },
          {
            coin: "SOL",
            type: "Momentum play",
            description: "Entry on consolidation around $80-85 with stop below $75 and targets at $95 and $105."
          },
          {
            coin: "BTC",
            type: "Range breakout",
            description: "Watch for breakout above $45,000 with confirmation, targeting $48,000 and $52,000."
          }
        ],
        timestamp: new Date().toISOString()
      };
      
      setAnalysis(mockAnalysis);
    } catch (err) {
      setError("Failed to generate market analysis. Please try again later.");
      console.error("Analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 dark:text-green-400';
      case 'bearish': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Market Analysis</h1>
          <button 
            onClick={fetchAnalysis}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <SparklesIcon className="h-12 w-12 text-blue-500 mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-300 text-lg">Generating market analysis...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        ) : analysis ? (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Market Overview</h2>
              <p className="text-gray-700 dark:text-gray-300">{analysis.overview}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Cryptocurrencies</h2>
              <div className="space-y-4">
                {analysis.topCoins.map((coin, index) => (
                  <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: coin.sentiment === 'bullish' ? '#10B981' : coin.sentiment === 'bearish' ? '#EF4444' : '#6B7280' }}>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                      {coin.coin}
                      <span className={`ml-2 text-sm ${getSentimentColor(coin.sentiment)}`}>
                        ({coin.sentiment})
                      </span>
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{coin.analysis}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Trading Opportunities</h2>
              <div className="space-y-4">
                {analysis.tradingOpportunities.map((opportunity, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {opportunity.coin}: {opportunity.type}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{opportunity.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(analysis.timestamp).toLocaleString()}
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
} 