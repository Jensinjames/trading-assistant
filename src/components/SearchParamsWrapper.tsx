'use client';

import { Suspense, type ReactNode } from 'react';

interface SearchParamsWrapperProps {
  children: ReactNode;
}

export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
} 