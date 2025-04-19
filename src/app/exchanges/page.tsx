"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { MagnifyingGlassIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

interface Exchange {
  id: string;
  name: string;
  logo: string;
  country: string;
  year_established: number;
  url: string;
  trust_score: number;
  trade_volume_24h_btc: number;
  has_trading_incentive: boolean;
}

export default function ExchangesPage() {
  return (
    <SearchParamsWrapper>
      <ExchangesContent />
    </SearchParamsWrapper>
  );
}

function ExchangesContent() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filteredExchanges, setFilteredExchanges] = useState<Exchange[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Exchange;
    direction: 'ascending' | 'descending';
  }>({ key: 'trust_score', direction: 'descending' });

  useEffect(() => {
    // Fetch exchanges from API
    const fetchExchanges = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/exchanges');
        const data = await response.json();
        
        if (data.error) {
          console.warn('API returned error:', data.error);
        }
        
        setExchanges(data.exchanges);
        setFilteredExchanges(data.exchanges);
      } catch (err) {
        setError('Failed to load exchanges. Please try again later.');
        console.error('Error fetching exchanges:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchanges();
  }, []);

  useEffect(() => {
    // Apply search filter
    const filtered = exchanges.filter(exchange => 
      exchange.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredExchanges(sorted);
  }, [exchanges, searchTerm, sortConfig]);

  const handleSort = (key: keyof Exchange) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(volume);
  };

  const renderTrustScore = (score: number) => {
    const colors = [
      'bg-red-500',
      'bg-red-400',
      'bg-orange-500',
      'bg-orange-400',
      'bg-yellow-500',
      'bg-yellow-400',
      'bg-green-300',
      'bg-green-400',
      'bg-green-500',
      'bg-green-600',
    ];
    
    return (
      <div className="flex items-center">
        <div className={`w-6 h-6 rounded-full ${colors[score-1]} flex items-center justify-center text-white font-medium text-xs`}>
          {score}
        </div>
        <div className="ml-1">/10</div>
      </div>
    );
  };

  const getSortIndicator = (key: keyof Exchange) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Cryptocurrency Exchanges</h1>
        
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search exchanges by name or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-80 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                    Exchange{getSortIndicator('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('country')}>
                    Country{getSortIndicator('country')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('trust_score')}>
                    Trust Score{getSortIndicator('trust_score')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('trade_volume_24h_btc')}>
                    24h Volume (BTC){getSortIndicator('trade_volume_24h_btc')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('year_established')}>
                    Year{getSortIndicator('year_established')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExchanges.map((exchange) => (
                  <tr key={exchange.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={exchange.logo} alt={exchange.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {exchange.name}
                          </div>
                          {exchange.has_trading_incentive && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              Trading Incentives
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{exchange.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderTrustScore(exchange.trust_score)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatVolume(exchange.trade_volume_24h_btc)} BTC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {exchange.year_established}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={exchange.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 