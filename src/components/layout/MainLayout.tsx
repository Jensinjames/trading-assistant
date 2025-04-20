'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  HomeIcon, 
  ChartBarSquareIcon as TrendingUpIcon, 
  ChartBarIcon, 
  PlusCircleIcon, 
  Cog6ToothIcon as CogIcon, 
  SparklesIcon,
  MagnifyingGlassIcon as SearchIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  ArrowRightStartOnRectangleIcon as ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLiveUpdates, setIsLiveUpdates] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode class to document
    document.documentElement.classList.toggle('dark');
  };

  const toggleLiveUpdates = () => {
    setIsLiveUpdates(!isLiveUpdates);
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Trending', href: '/trending', icon: TrendingUpIcon },
    { name: 'Market', href: '/market', icon: ChartBarIcon },
    { name: 'Exchanges', href: '/exchanges', icon: BuildingOfficeIcon },
    { name: 'New Listings', href: '/new-listings', icon: PlusCircleIcon },
    { name: 'AI Assistant', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'AI Analysis', href: '/ai-analysis', icon: SparklesIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  const marketStats = [
    { label: 'Market Cap', value: '$1.23T' },
    { label: '24h Volume', value: '$79.3B' },
    { label: 'BTC Dominance', value: '46.0%' },
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 dark:bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Trading Assistant</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300">Portfolio Summary</h3>
            <p className="text-2xl font-bold text-white mt-1">$24,567.89</p>
            <p className="text-xs text-green-400 mt-1">+5.67% (24h)</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search coins, exchanges, NFTs..."
                  className="pl-10 pr-4 py-2 w-64 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {marketStats.map((stat) => (
                  <div key={stat.label} className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{stat.label}: </span>
                    <span className="font-medium text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              <button 
                onClick={toggleLiveUpdates}
                className={`p-2 rounded-full ${
                  isLiveUpdates 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
                aria-label={isLiveUpdates ? "Disable live updates" : "Enable live updates"}
              >
                <BellIcon className="h-5 w-5" />
              </button>

              <button 
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
              <Link 
                href="/market" 
                className={`px-3 py-1 text-sm font-medium ${
                  pathname === '/market' 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Cryptocurrencies
              </Link>
              <Link 
                href="/exchanges" 
                className={`px-3 py-1 text-sm font-medium ${
                  pathname === '/exchanges' 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Exchanges
              </Link>
              <Link 
                href="/nft" 
                className={`px-3 py-1 text-sm font-medium ${
                  pathname === '/nft' 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                NFT
              </Link>
              <Link 
                href="/portfolio" 
                className={`px-3 py-1 text-sm font-medium ${
                  pathname === '/portfolio' 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Portfolio
              </Link>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 