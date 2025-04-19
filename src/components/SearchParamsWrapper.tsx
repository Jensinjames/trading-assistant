'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchParamsWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SearchParamsWrapper({ children, fallback }: SearchParamsWrapperProps) {
  const searchParams = useSearchParams();

  const defaultFallback = (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
} 