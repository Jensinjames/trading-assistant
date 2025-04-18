import React, { useState } from 'react';
import { TrendingCoin } from '@/hooks/useTrending';
import { ArrowUpIcon, ArrowDownIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';
import { addToNewListings } from '@/services/newListingsService';

interface TrendingCoinsListProps {
  coins: TrendingCoin[];
}

interface CoinModalProps {
  coin: TrendingCoin;
  onClose: () => void;
  onAddToNewListings: (coin: TrendingCoin) => void;
}

function CoinModal({ coin, onClose, onAddToNewListings }: CoinModalProps) {
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const formatPercentage = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <img 
              src={coin.thumb} 
              alt={coin.name} 
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{coin.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{coin.symbol}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatNumber(coin.market_cap)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatNumber(coin.volume_24h)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Price (BTC)</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {coin.price_btc?.toFixed(8) || 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Change</p>
            <div className="flex items-center">
              {coin.price_change_24h && coin.price_change_24h >= 0 ? (
                <ArrowUpIcon className="h-5 w-5 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-5 w-5 text-red-500 mr-1" />
              )}
              <p className={`text-lg font-semibold ${
                coin.price_change_24h && coin.price_change_24h >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {formatPercentage(coin.price_change_24h)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onAddToNewListings(coin)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add to New Listings
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrendingCoinsList({ coins }: TrendingCoinsListProps) {
  const [selectedCoin, setSelectedCoin] = useState<TrendingCoin | null>(null);

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const formatPercentage = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const handleAddToNewListings = async (coin: TrendingCoin) => {
    try {
      const result = await addToNewListings(coin);
      if (result.success) {
        // TODO: Show success toast/notification
        console.log('Coin added to new listings successfully');
        setSelectedCoin(null);
      } else {
        // TODO: Show error toast/notification
        console.error('Failed to add coin to new listings:', result.error);
      }
    } catch (error) {
      console.error('Error adding coin to new listings:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {coins.map((coin) => (
        <div 
          key={coin.id}
          onClick={() => setSelectedCoin(coin)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img 
                  src={coin.thumb} 
                  alt={coin.name} 
                  className="w-8 h-8 mr-2"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{coin.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{coin.symbol}</p>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Rank #{coin.market_cap_rank}
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Price (BTC)</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {coin.price_btc?.toFixed(8) || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">24h Change</p>
                <div className="flex items-center">
                  {coin.price_change_24h && coin.price_change_24h >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <p className={`text-sm font-medium ${
                    coin.price_change_24h && coin.price_change_24h >= 0 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {formatPercentage(coin.price_change_24h)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatNumber(coin.market_cap)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">24h Volume</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatNumber(coin.volume_24h)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {selectedCoin && (
        <CoinModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
          onAddToNewListings={handleAddToNewListings}
        />
      )}
    </div>
  );
} 