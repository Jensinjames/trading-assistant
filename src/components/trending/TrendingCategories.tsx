import React from 'react';
import { FireIcon, RocketLaunchIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
}

interface TrendingCategoriesProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string;
}

export default function TrendingCategories({ onSelectCategory, selectedCategory }: TrendingCategoriesProps) {
  const categories: Category[] = [
    { id: 'all', name: 'All Trending', icon: FireIcon, count: 0 },
    { id: 'gainers', name: 'Top Gainers', icon: RocketLaunchIcon, count: 0 },
    { id: 'losers', name: 'Top Losers', icon: ChartBarIcon, count: 0 },
    { id: 'volume', name: 'High Volume', icon: CurrencyDollarIcon, count: 0 },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <category.icon className="h-4 w-4 mr-2" />
          {category.name}
          {category.count > 0 && (
            <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
              {category.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
} 