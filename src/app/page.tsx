"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

export default function HomePage() {
  return (
    <SearchParamsWrapper>
      <HomeContent />
    </SearchParamsWrapper>
  );
}

function HomeContent() {
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
