"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useTrending, TrendingCoin } from '@/hooks/useTrending';
import TrendingCoinsList from '@/components/trending/TrendingCoinsList';
import TrendingCategories from '@/components/trending/TrendingCategories';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

export default function TrendingPage() {
  return (
    <SearchParamsWrapper>
      <TrendingContent />
    </SearchParamsWrapper>
  );
}

function TrendingContent() {
  const { trendingCoins, isLoading, error } = useTrending();
  const [filteredCoins, setFilteredCoins] = useState<TrendingCoin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter coins based on search term and selected category
  useEffect(() => {
    let filtered = [...trendingCoins];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'gainers':
          filtered = filtered.filter(coin => coin.price_change_24h > 0);
          break;
        case 'losers':
          filtered = filtered.filter(coin => coin.price_change_24h < 0);
          break;
        case 'volume':
          // Sort by volume (highest first)
          filtered.sort((a, b) => b.volume_24h - a.volume_24h);
          break;
        default:
          break;
      }
    }
    
    setFilteredCoins(filtered);
  }, [trendingCoins, searchTerm, selectedCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Trending Cryptocurrencies</h1>
        
        <div className="mb-6">
          <TrendingCategories 
            onSelectCategory={handleCategorySelect} 
            selectedCategory={selectedCategory} 
          />
        </div>
        
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or symbol..."
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
        ) : filteredCoins.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No trending coins found matching your criteria.</p>
          </div>
        ) : (
          <TrendingCoinsList coins={filteredCoins} />
        )}
      </div>
    </MainLayout>
  );
} 