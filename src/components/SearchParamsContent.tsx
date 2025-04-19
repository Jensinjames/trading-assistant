'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

const SearchParamsContext = createContext<ReturnType<typeof useSearchParams> | null>(null);

export function useSearchParamsContext() {
  const context = useContext(SearchParamsContext);
  if (!context) {
    throw new Error('useSearchParamsContext must be used within a SearchParamsProvider');
  }
  return context;
}

interface SearchParamsContentProps {
  children: ReactNode;
}

export default function SearchParamsContent({ children }: SearchParamsContentProps) {
  const searchParams = useSearchParams();
  
  return (
    <SearchParamsContext.Provider value={searchParams}>
      {children}
    </SearchParamsContext.Provider>
  );
} 