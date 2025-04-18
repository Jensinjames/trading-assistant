"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  MagnifyingGlassIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface NFTCollection {
  id: string;
  name: string;
  image: string;
  floorPrice: number;
  currency: string;
  volume24h: number;
  volumeChange: number;
  isHot: boolean;
  items: number;
  owners: number;
}

export default function NFTPage() {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<NFTCollection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'top' | 'trending' | 'new'>('top');

  // Mock data for NFT collections
  const mockCollections: NFTCollection[] = [
    {
      id: 'bored-ape-yacht-club',
      name: 'Bored Ape Yacht Club',
      image: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&w=128',
      floorPrice: 18.78,
      currency: 'ETH',
      volume24h: 147.83,
      volumeChange: 12.5,
      isHot: true,
      items: 10000,
      owners: 5963
    },
    {
      id: 'azuki',
      name: 'Azuki',
      image: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&w=128',
      floorPrice: 6.25,
      currency: 'ETH',
      volume24h: 98.42,
      volumeChange: -4.3,
      isHot: true,
      items: 10000,
      owners: 4741
    },
    {
      id: 'cryptopunks',
      name: 'CryptoPunks',
      image: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&w=128',
      floorPrice: 38.5,
      currency: 'ETH',
      volume24h: 243.18,
      volumeChange: 8.7,
      isHot: false,
      items: 10000,
      owners: 3634
    },
    {
      id: 'doodles',
      name: 'Doodles',
      image: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?auto=format&w=128',
      floorPrice: 2.83,
      currency: 'ETH',
      volume24h: 38.24,
      volumeChange: -12.1,
      isHot: false,
      items: 10000,
      owners: 5192
    },
    {
      id: 'mutant-ape-yacht-club',
      name: 'Mutant Ape Yacht Club',
      image: 'https://i.seadn.io/gae/lHexKRMpw-aoSyB1WdFBff5yfANLReFxHzt1DOj_sg7mS14yARpuvYcUtsyyx-Nkpk6WTcUPFoG53VnLJezYi8hAs0OxNZwlw6Y-dmI?auto=format&w=128',
      floorPrice: 4.2,
      currency: 'ETH',
      volume24h: 89.45,
      volumeChange: 5.3,
      isHot: true,
      items: 19422,
      owners: 12227
    },
    {
      id: 'world-of-women',
      name: 'World of Women',
      image: 'https://i.seadn.io/gae/EFAQpIktMBU5SU0TqSdPWZ4byHr3hFirL_mATsR8KwhA9Mz1EXJOlR7kTRtrnYTX6mLhce4cUk89zDYvEbYzSJD_AiOFwEK-KLGW?auto=format&w=128',
      floorPrice: 1.08,
      currency: 'ETH',
      volume24h: 12.37,
      volumeChange: -2.8,
      isHot: false,
      items: 10000,
      owners: 6241
    },
    {
      id: 'pudgy-penguins',
      name: 'Pudgy Penguins',
      image: 'https://i.seadn.io/gae/yNi-XdGxsgQCPpqSio4o31ygAV6wURdIdInWRcFIl46UjUQ1eV7BEndGe8L661OoG-clRi7EgInLX4LPu9Jfw4fq0bnVYHqIDgOX?auto=format&w=128',
      floorPrice: 5.39,
      currency: 'ETH',
      volume24h: 47.81,
      volumeChange: 15.2,
      isHot: true,
      items: 8888,
      owners: 4639
    },
    {
      id: 'clonex',
      name: 'CloneX',
      image: 'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofFx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?auto=format&w=128',
      floorPrice: 3.98,
      currency: 'ETH',
      volume24h: 76.24,
      volumeChange: -8.4,
      isHot: false,
      items: 20000,
      owners: 9824
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch NFT collections
    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCollections(mockCollections);
        setFilteredCollections(mockCollections);
      } catch (err) {
        setError('Failed to load NFT collections. Please try again later.');
        console.error('Error fetching NFT collections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    // Apply search filter
    let filtered = collections.filter(collection => 
      collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Apply tab filter
    if (activeTab === 'trending') {
      filtered = filtered.filter(collection => Math.abs(collection.volumeChange) > 5);
      filtered.sort((a, b) => Math.abs(b.volumeChange) - Math.abs(a.volumeChange));
    } else if (activeTab === 'new') {
      filtered = filtered.filter(collection => collection.isHot);
    } else {
      // Default 'top' tab, sort by volume
      filtered.sort((a, b) => b.volume24h - a.volume24h);
    }
    
    setFilteredCollections(filtered);
  }, [collections, searchTerm, activeTab]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">NFT Collections</h1>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('top')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'top'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Top Collections
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'trending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Hot Collections
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="relative">
                  <img 
                    src={collection.image} 
                    alt={collection.name} 
                    className="w-full h-48 object-cover"
                  />
                  {collection.isHot && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                      <FireIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{collection.name}</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Floor Price</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatNumber(collection.floorPrice)} {collection.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatNumber(collection.volume24h)} {collection.currency}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Items</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatNumber(collection.items)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Owners</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatNumber(collection.owners)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">24h Change:</p>
                    <div className={`flex items-center ${
                      collection.volumeChange >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {collection.volumeChange >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      <span>{Math.abs(collection.volumeChange)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredCollections.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">No collections found matching your criteria.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 