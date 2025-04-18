"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  value: number;
  change24h: number;
  allocation: number;
}

export default function PortfolioPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock portfolio data
  const mockAssets: Asset[] = [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0.75,
      price: 43587.20,
      value: 32690.40,
      change24h: 2.34,
      allocation: 45.8
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 8.5,
      price: 2347.89,
      value: 19957.07,
      change24h: -1.23,
      allocation: 28.0
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      amount: 85.0,
      price: 123.45,
      value: 10493.25,
      change24h: 5.67,
      allocation: 14.7
    },
    {
      id: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      amount: 5000.0,
      price: 0.58,
      value: 2900.0,
      change24h: -0.42,
      allocation: 4.1
    },
    {
      id: 'polkadot',
      symbol: 'DOT',
      name: 'Polkadot',
      amount: 250.0,
      price: 7.82,
      value: 1955.0,
      change24h: 3.21,
      allocation: 2.7
    },
    {
      id: 'chainlink',
      symbol: 'LINK',
      name: 'Chainlink',
      amount: 200.0,
      price: 16.74,
      value: 3348.0,
      change24h: 1.89,
      allocation: 4.7
    }
  ];

  useEffect(() => {
    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAssets(mockAssets);
        const total = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
        setTotalValue(total);
      } catch (err) {
        setError('Failed to load portfolio data');
        console.error('Error fetching portfolio:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Calculate portfolio performance
  const portfolioChange = assets.reduce((change, asset) => {
    return change + (asset.value * asset.change24h / 100);
  }, 0);
  
  const portfolioChangePercent = totalValue > 0 
    ? (portfolioChange / totalValue) * 100 
    : 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Portfolio</h1>
          <button className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Asset
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">Total Value</h2>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">24h Change</h2>
                <div className="flex items-center">
                  <p className={`text-3xl font-bold ${
                    portfolioChangePercent >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(portfolioChange)}
                  </p>
                  <div className={`ml-2 flex items-center ${
                    portfolioChangePercent >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {portfolioChangePercent >= 0 ? (
                      <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                    )}
                    <span>{Math.abs(portfolioChangePercent).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">Assets</h2>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{assets.length}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Asset Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Holdings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">24h</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Allocation</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {asset.name}
                            </div>
                            <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              {asset.symbol}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {asset.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(asset.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(asset.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${
                            asset.change24h >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {asset.change24h >= 0 ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                            )}
                            <span>{Math.abs(asset.change24h).toFixed(2)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${asset.allocation}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {asset.allocation.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete asset"
                            aria-label="Delete asset"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
} 