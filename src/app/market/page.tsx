"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  MagnifyingGlassIcon, 
  StarIcon as StarOutline,
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BellIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  ath: number;
  is_favorite?: boolean;
}

export default function MarketPage() {
  return (
    <SearchParamsWrapper>
      <MarketContent />
    </SearchParamsWrapper>
  );
}

function MarketContent() {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Cryptocurrency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'all' | 'dexscreener' | 'birdeye'>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Cryptocurrency;
    direction: 'ascending' | 'descending';
  }>({ key: 'market_cap_rank', direction: 'ascending' });

  // Mock cryptocurrency data
  const mockCryptos: Cryptocurrency[] = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      current_price: 43567.89,
      market_cap: 845600000000,
      market_cap_rank: 1,
      total_volume: 28900000000,
      price_change_percentage_24h: 2.34,
      circulating_supply: 19000000,
      ath: 69000,
      is_favorite: true
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      current_price: 2345.67,
      market_cap: 285400000000,
      market_cap_rank: 2,
      total_volume: 15200000000,
      price_change_percentage_24h: -1.23,
      circulating_supply: 120000000,
      ath: 4860,
      is_favorite: true
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      current_price: 124.56,
      market_cap: 53700000000,
      market_cap_rank: 5,
      total_volume: 3200000000,
      price_change_percentage_24h: 5.67,
      circulating_supply: 430000000,
      ath: 260,
      is_favorite: false
    },
    {
      id: 'cardano',
      symbol: 'ada',
      name: 'Cardano',
      image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
      current_price: 0.58,
      market_cap: 20400000000,
      market_cap_rank: 9,
      total_volume: 890000000,
      price_change_percentage_24h: -0.42,
      circulating_supply: 35200000000,
      ath: 3.10,
      is_favorite: false
    },
    {
      id: 'polkadot',
      symbol: 'dot',
      name: 'Polkadot',
      image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
      current_price: 7.82,
      market_cap: 9800000000,
      market_cap_rank: 12,
      total_volume: 520000000,
      price_change_percentage_24h: 3.21,
      circulating_supply: 1250000000,
      ath: 55,
      is_favorite: false
    },
    {
      id: 'chainlink',
      symbol: 'link',
      name: 'Chainlink',
      image: 'https://assets.coingecko.com/coins/images/877/small/chainlink.png',
      current_price: 16.74,
      market_cap: 9500000000,
      market_cap_rank: 13,
      total_volume: 780000000,
      price_change_percentage_24h: 1.89,
      circulating_supply: 568000000,
      ath: 52.88,
      is_favorite: false
    },
    {
      id: 'avalanche',
      symbol: 'avax',
      name: 'Avalanche',
      image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
      current_price: 35.42,
      market_cap: 12700000000,
      market_cap_rank: 10,
      total_volume: 950000000,
      price_change_percentage_24h: 7.85,
      circulating_supply: 358000000,
      ath: 146.22,
      is_favorite: false
    },
    {
      id: 'cosmos',
      symbol: 'atom',
      name: 'Cosmos',
      image: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
      current_price: 9.17,
      market_cap: 3500000000,
      market_cap_rank: 23,
      total_volume: 250000000,
      price_change_percentage_24h: -2.54,
      circulating_supply: 382000000,
      ath: 44.70,
      is_favorite: false
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch cryptocurrencies
    const fetchCryptocurrencies = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call integrating with our scraper
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (dataSource === 'dexscreener') {
          // Simulate DEXScreener data
          const dexData = mockCryptos.slice(0, 4); // Use a subset for demonstration
          setCryptocurrencies(dexData);
        } else if (dataSource === 'birdeye') {
          // Simulate Birdeye data
          const birdeyeData = mockCryptos.slice(4); // Use a different subset
          setCryptocurrencies(birdeyeData);
        } else {
          // All data
          setCryptocurrencies(mockCryptos);
        }
      } catch (err) {
        setError('Failed to load market data. Please try again later.');
        console.error('Error fetching cryptocurrencies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptocurrencies();
  }, [dataSource]);

  useEffect(() => {
    // Apply search filter
    const filtered = cryptocurrencies.filter(crypto => 
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? 0;
      const bValue = b[sortConfig.key] ?? 0;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredCryptos(sorted);
  }, [cryptocurrencies, searchTerm, sortConfig]);

  const handleSort = (key: keyof Cryptocurrency) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  };

  const toggleFavorite = (id: string) => {
    setCryptocurrencies(prevCryptos => 
      prevCryptos.map(crypto => 
        crypto.id === id 
          ? { ...crypto, is_favorite: !crypto.is_favorite } 
          : crypto
      )
    );
  };

  const setAlert = (id: string) => {
    alert(`Alert set for ${cryptocurrencies.find(c => c.id === id)?.name}`);
  };

  const formatNumber = (num: number, compact = false) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 2,
      notation: compact ? 'compact' : 'standard'
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: num < 1 ? 6 : 2
    }).format(num);
  };

  const getSortIndicator = (key: keyof Cryptocurrency) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Market Overview</h1>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search coins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">Data Source:</label>
              <select 
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value as any)}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select data source"
              >
                <option value="all">All Sources</option>
                <option value="dexscreener">DEXScreener</option>
                <option value="birdeye">Birdeye</option>
              </select>
            </div>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Filter
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
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Favorite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('market_cap_rank')}>
                    #Rank{getSortIndicator('market_cap_rank')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                    Coin{getSortIndicator('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('current_price')}>
                    Price{getSortIndicator('current_price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price_change_percentage_24h')}>
                    24h{getSortIndicator('price_change_percentage_24h')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('market_cap')}>
                    Market Cap{getSortIndicator('market_cap')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('total_volume')}>
                    Volume (24h){getSortIndicator('total_volume')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('circulating_supply')}>
                    Supply{getSortIndicator('circulating_supply')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCryptos.map((crypto) => (
                  <tr key={crypto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleFavorite(crypto.id)}
                        className="text-gray-400 hover:text-yellow-500"
                        aria-label={crypto.is_favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {crypto.is_favorite ? (
                          <StarSolid className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <StarOutline className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {crypto.market_cap_rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-8 w-8 rounded-full" src={crypto.image} alt={crypto.name} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {crypto.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {crypto.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(crypto.current_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${
                        crypto.price_change_percentage_24h >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        <span>{Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(crypto.market_cap)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(crypto.total_volume)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatNumber(crypto.circulating_supply)} {crypto.symbol.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setAlert(crypto.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label={`Set alert for ${crypto.name}`}
                      >
                        <BellIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredCryptos.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">No cryptocurrencies found matching your criteria.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 