import { TrendingCoin } from '@/hooks/useTrending';

export async function getNewListings(): Promise<TrendingCoin[]> {
  try {
    const response = await fetch('/api/new-listings');
    const data = await response.json();
    return data.listings;
  } catch (error) {
    console.error('Error fetching new listings:', error);
    return [];
  }
}

export async function addToNewListings(coin: TrendingCoin): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/new-listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coin),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding coin to new listings:', error);
    return { success: false, error: 'Failed to add coin to new listings' };
  }
}

export async function removeFromNewListings(coinId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/new-listings', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: coinId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing coin from new listings:', error);
    return { success: false, error: 'Failed to remove coin from new listings' };
  }
} 