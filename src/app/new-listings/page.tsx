"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BellIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface NewListing {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  launchDate: string;
  launchPlatform: string;
  website: string;
  isHot: boolean;
}

export default function NewListingsPage() {
  const [listings, setListings] = useState<NewListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'24h' | '7d' | '30d'>('24h');
  
  // Mock data for new listings
  const mockListings: NewListing[] = [
    {
      id: 'jupiter',
      name: 'Jupiter',
      symbol: 'JUP',
      image: 'https://assets.coingecko.com/coins/images/31243/small/Jupiter_Photography_03.png',
      price: 0.82,
      change: 4.2,
      volume: 34500000,
      marketCap: 985000000,
      launchDate: '2024-01-31',
      launchPlatform: 'Solana',
      website: 'https://jup.ag',
      isHot: true
    },
    {
      id: 'ethena',
      name: 'Ethena',
      symbol: 'ENA',
      image: 'https://assets.coingecko.com/coins/images/32462/small/logo-256.png',
      price: 0.674,
      change: -2.3,
      volume: 18700000,
      marketCap: 421000000,
      launchDate: '2024-04-15',
      launchPlatform: 'Ethereum',
      website: 'https://ethena.fi',
      isHot: true
    },
    {
      id: 'pyth',
      name: 'Pyth Network',
      symbol: 'PYTH',
      image: 'https://assets.coingecko.com/coins/images/28284/small/pyth_logo.jpg',
      price: 0.432,
      change: 8.7,
      volume: 27800000,
      marketCap: 765000000,
      launchDate: '2023-12-05',
      launchPlatform: 'Solana',
      website: 'https://pyth.network',
      isHot: false
    },
    {
      id: 'dymension',
      name: 'Dymension',
      symbol: 'DYM',
      image: 'https://assets.coingecko.com/coins/images/31756/small/logo-symbol.png',
      price: 6.23,
      change: -5.1,
      volume: 42300000,
      marketCap: 574000000,
      launchDate: '2024-02-15',
      launchPlatform: 'Cosmos',
      website: 'https://dymension.xyz',
      isHot: true
    },
    {
      id: 'zeta',
      name: 'Zeta',
      symbol: 'ZETA',
      image: 'https://assets.coingecko.com/coins/images/32076/small/zeta-logo-no-bg.png',
      price: 0.165,
      change: 12.4,
      volume: 8900000,
      marketCap: 128000000,
      launchDate: '2024-03-12',
      launchPlatform: 'Solana',
      website: 'https://zeta.markets',
      isHot: false
    },
    {
      id: 'aevo',
      name: 'Aevo',
      symbol: 'AEVO',
      image: 'https://assets.coingecko.com/coins/images/33742/small/aevo-logo.png',
      price: 3.48,
      change: 1.2,
      volume: 15600000,
      marketCap: 243000000,
      launchDate: '2024-04-22',
      launchPlatform: 'Ethereum',
      website: 'https://aevo.xyz',
      isHot: true
    }
  ];

  useEffect(() => {
    const fetchNewListings = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call
        // that filters data based on the timeFrame
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter listings based on time frame
        const now = new Date();
        const cutoffDate = new Date();
        
        if (timeFrame === '24h') {
          cutoffDate.setDate(now.getDate() - 1);
        } else if (timeFrame === '7d') {
          cutoffDate.setDate(now.getDate() - 7);
        } else {
          cutoffDate.setDate(now.getDate() - 30);
        }
        
        const filtered = mockListings.filter(listing => {
          const launchDate = new Date(listing.launchDate);
          return launchDate >= cutoffDate;
        });
        
        setListings(filtered);
      } catch (err) {
        setError('Failed to load new listings. Please try again later.');
        console.error('Error fetching new listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewListings();
  }, [timeFrame]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 3 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const daysFromLaunch = (dateString: string) => {
    const launch = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - launch.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">New Listings</h1>
        
        <div className="flex items-center mb-6">
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setTimeFrame('24h')}
              className={`px-4 py-2 rounded-md ${
                timeFrame === '24h'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Last 24h
            </button>
            <button
              onClick={() => setTimeFrame('7d')}
              className={`px-4 py-2 rounded-md ${
                timeFrame === '7d'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => setTimeFrame('30d')}
              className={`px-4 py-2 rounded-md ${
                timeFrame === '30d'
                  ? 'bg-white dark:bg-gray-600 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Last 30 days
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-300">No new listings found for this time period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img 
                        src={listing.image} 
                        alt={listing.name} 
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-3">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {listing.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {listing.symbol}
                        </p>
                      </div>
                    </div>
                    {listing.isHot && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold rounded-full flex items-center">
                        <StarIcon className="h-3 w-3 mr-1" />
                        HOT
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
                      <div className={`flex items-center ${
                        listing.change >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {listing.change >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        <span>{Math.abs(listing.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(listing.price)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Volume (24h)</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(listing.volume)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(listing.marketCap)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {formatDate(listing.launchDate)} ({daysFromLaunch(listing.launchDate)} days ago)
                      </span>
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {listing.launchPlatform}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <a 
                      href={listing.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
                    >
                      Visit Website
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                    </a>
                    <button 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
                      onClick={() => alert(`Alert set for ${listing.name}`)}
                    >
                      Set Alert
                      <BellIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 