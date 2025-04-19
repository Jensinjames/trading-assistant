"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

export default function HomePage() {
  return (
    <SearchParamsWrapper>
      <HomeContent />
    </SearchParamsWrapper>
  );
}

function HomeContent() {
  const marketOverview = [
    {
      title: 'Total Market Cap',
      value: '$1.23T',
      change: '+2.34%',
      isPositive: true,
      icon: CurrencyDollarIcon
    },
    {
      title: '24h Volume',
      value: '$79.3B',
      change: '-1.23%',
      isPositive: false,
      icon: ChartBarIcon
    },
    {
      title: 'BTC Dominance',
      value: '46.0%',
      change: '+0.5%',
      isPositive: true,
      icon: ArrowTrendingUpIcon
    },
    {
      title: 'Active Cryptocurrencies',
      value: '2,345',
      change: '+12',
      isPositive: true,
      icon: ArrowTrendingUpIcon
    }
  ];

  const topCryptos = [
    {
      rank: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      price: '$43,567.89',
      change24h: '+2.34%',
      marketCap: '$845.6B',
      volume24h: '$28.9B',
      isPositive: true
    },
    {
      rank: 2,
      name: 'Ethereum',
      symbol: 'ETH',
      price: '$2,345.67',
      change24h: '-1.23%',
      marketCap: '$285.4B',
      volume24h: '$15.2B',
      isPositive: false
    },
    // Add more cryptocurrencies as needed
  ];

  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
    </div>
  );
}
