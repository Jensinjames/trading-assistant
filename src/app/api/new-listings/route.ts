import { NextResponse } from 'next/server';
import { TrendingCoin } from '@/hooks/useTrending';

// In a real application, this would be stored in a database
let newListings: TrendingCoin[] = [];

export async function GET() {
  return NextResponse.json({ listings: newListings });
}

export async function POST(request: Request) {
  try {
    const coin: TrendingCoin = await request.json();
    
    // Check if coin already exists in listings
    if (newListings.some(listing => listing.id === coin.id)) {
      return NextResponse.json(
        { error: 'Coin already exists in new listings' },
        { status: 400 }
      );
    }

    // Add coin to listings
    newListings.push(coin);

    return NextResponse.json({ 
      message: 'Coin added to new listings successfully',
      coin 
    });
  } catch (error) {
    console.error('Error adding coin to new listings:', error);
    return NextResponse.json(
      { error: 'Failed to add coin to new listings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    // Remove coin from listings
    newListings = newListings.filter(coin => coin.id !== id);

    return NextResponse.json({ 
      message: 'Coin removed from new listings successfully' 
    });
  } catch (error) {
    console.error('Error removing coin from new listings:', error);
    return NextResponse.json(
      { error: 'Failed to remove coin from new listings' },
      { status: 500 }
    );
  }
} 