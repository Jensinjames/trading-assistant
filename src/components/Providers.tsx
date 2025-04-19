"use client";

import React from 'react';
import { ThemeProvider } from 'next-themes';
import SearchParamsWrapper from './SearchParamsWrapper';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <SearchParamsWrapper>
        {children}
      </SearchParamsWrapper>
    </ThemeProvider>
  );
} 