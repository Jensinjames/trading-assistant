'use client';

import { Suspense, type ReactNode } from 'react';
import SearchParamsContent from './SearchParamsContent';

interface SearchParamsWrapperProps {
  children: ReactNode;
}

export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center w-full h-full min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
    </div>}>
      <SearchParamsContent>
        {children}
      </SearchParamsContent>
    </Suspense>
  );
}