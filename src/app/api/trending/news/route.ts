import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // In a real application, you would fetch news from a news API
    // For now, we'll return mock data
    const mockNews = [
      {
        id: '1',
        title: 'Bitcoin Surges Past $50,000 as Institutional Interest Grows',
        url: 'https://example.com/news/1',
        source: 'CryptoNews',
        published_at: '2024-02-20T10:00:00Z',
        thumbnail: 'https://via.placeholder.com/150',
      },
      {
        id: '2',
        title: 'Ethereum 2.0 Upgrade Shows Promising Results',
        url: 'https://example.com/news/2',
        source: 'BlockchainDaily',
        published_at: '2024-02-20T09:30:00Z',
        thumbnail: 'https://via.placeholder.com/150',
      },
      {
        id: '3',
        title: 'New DeFi Protocol Launches with Record-Breaking TVL',
        url: 'https://example.com/news/3',
        source: 'DeFiInsider',
        published_at: '2024-02-20T09:00:00Z',
        thumbnail: 'https://via.placeholder.com/150',
      },
      {
        id: '4',
        title: 'Major Bank Announces Crypto Custody Services',
        url: 'https://example.com/news/4',
        source: 'FinanceToday',
        published_at: '2024-02-20T08:45:00Z',
        thumbnail: 'https://via.placeholder.com/150',
      },
      {
        id: '5',
        title: 'NFT Market Shows Signs of Recovery After Recent Downturn',
        url: 'https://example.com/news/5',
        source: 'NFTNews',
        published_at: '2024-02-20T08:30:00Z',
        thumbnail: 'https://via.placeholder.com/150',
      },
    ];

    return NextResponse.json(mockNews);
  } catch (error) {
    console.error('Error fetching trending news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending news' },
      { status: 500 }
    );
  }
} 