import { NextResponse } from 'next/server';
import { ExternalDataScraper } from '@/lib/scraper/externalData';

// This endpoint will fetch market data from multiple sources using our scraper
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    
    const scraper = new ExternalDataScraper();
    
    if (source === 'dexscreener') {
      const data = await scraper.getLatestData('dexscreener');
      return NextResponse.json({ data });
    } 
    else if (source === 'birdeye') {
      const data = await scraper.getLatestData('birdeye');
      return NextResponse.json({ data });
    }
    else if (source === 'twitter') {
      const data = await scraper.getLatestData('twitter');
      return NextResponse.json({ data });
    }
    else {
      // Fetch all data sources
      const dexscreener = await scraper.getLatestData('dexscreener');
      const birdeye = await scraper.getLatestData('birdeye');
      const twitter = await scraper.getLatestData('twitter');
      
      return NextResponse.json({
        dexscreener,
        birdeye,
        twitter
      });
    }
  } catch (error: any) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

// This endpoint will trigger a fresh scrape of external data
export async function POST(request: Request) {
  try {
    const scraper = new ExternalDataScraper();
    await scraper.updateAll();
    
    return NextResponse.json({ success: true, message: 'Market data updated successfully' });
  } catch (error: any) {
    console.error('Error updating market data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update market data' },
      { status: 500 }
    );
  }
} 