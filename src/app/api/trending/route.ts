import { NextResponse } from 'next/server';
import axios from 'axios';

// This endpoint will fetch trending data from CoinGecko API
export async function GET(request: Request) {
  try {
    // In a production environment, you would use your own API key
    // const apiKey = process.env.COINGECKO_API_KEY;
    // const response = await axios.get(`https://api.coingecko.com/api/v3/search/trending?x_cg_demo_api_key=${apiKey}`);
    
    // For development, we'll use the free tier which has rate limits
    const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');
    
    // Transform the data to match our interface
    const trendingCoins = response.data.coins.map((coin: any) => ({
      id: coin.item.id,
      name: coin.item.name,
      symbol: coin.item.symbol.toUpperCase(),
      market_cap_rank: coin.item.market_cap_rank,
      thumb: coin.item.thumb,
      small: coin.item.small,
      large: coin.item.large,
      price_btc: coin.item.price_btc,
      score: coin.item.score,
      market_cap: coin.item.market_cap,
      market_cap_change_24h: coin.item.market_cap_change_24h,
      price_change_24h: coin.item.price_change_24h,
      volume_24h: coin.item.volume_24h,
    }));
    
    return NextResponse.json({ trendingCoins });
  } catch (error: any) {
    console.error('Error fetching trending data:', error);
    
    // If the API call fails, return mock data as fallback
    const mockTrendingCoins = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        market_cap_rank: 1,
        thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
        small: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        price_btc: 1,
        score: 0,
        market_cap: 1200000000000,
        market_cap_change_24h: 2.5,
        price_change_24h: 1.8,
        volume_24h: 45000000000,
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        market_cap_rank: 2,
        thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
        small: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        large: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        price_btc: 0.065,
        score: 0,
        market_cap: 350000000000,
        market_cap_change_24h: 3.2,
        price_change_24h: 2.5,
        volume_24h: 18000000000,
      },
      {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        market_cap_rank: 5,
        thumb: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
        small: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        large: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        price_btc: 0.0025,
        score: 0,
        market_cap: 45000000000,
        market_cap_change_24h: 5.8,
        price_change_24h: 4.2,
        volume_24h: 3500000000,
      },
      {
        id: 'cardano',
        name: 'Cardano',
        symbol: 'ADA',
        market_cap_rank: 7,
        thumb: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png',
        small: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
        large: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        price_btc: 0.000012,
        score: 0,
        market_cap: 15000000000,
        market_cap_change_24h: 1.5,
        price_change_24h: 0.8,
        volume_24h: 1200000000,
      },
      {
        id: 'polkadot',
        name: 'Polkadot',
        symbol: 'DOT',
        market_cap_rank: 10,
        thumb: 'https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png',
        small: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
        large: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
        price_btc: 0.00045,
        score: 0,
        market_cap: 8000000000,
        market_cap_change_24h: 2.1,
        price_change_24h: 1.5,
        volume_24h: 800000000,
      },
      {
        id: 'dogecoin',
        name: 'Dogecoin',
        symbol: 'DOGE',
        market_cap_rank: 8,
        thumb: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png',
        small: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
        large: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
        price_btc: 0.0000032,
        score: 0,
        market_cap: 12000000000,
        market_cap_change_24h: 4.5,
        price_change_24h: 3.8,
        volume_24h: 1500000000,
      },
      {
        id: 'avalanche-2',
        name: 'Avalanche',
        symbol: 'AVAX',
        market_cap_rank: 9,
        thumb: 'https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png',
        small: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
        large: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
        price_btc: 0.00085,
        score: 0,
        market_cap: 9000000000,
        market_cap_change_24h: 3.8,
        price_change_24h: 2.9,
        volume_24h: 950000000,
      },
      {
        id: 'chainlink',
        name: 'Chainlink',
        symbol: 'LINK',
        market_cap_rank: 12,
        thumb: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png',
        small: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
        large: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
        price_btc: 0.00032,
        score: 0,
        market_cap: 6000000000,
        market_cap_change_24h: 2.8,
        price_change_24h: 1.9,
        volume_24h: 750000000,
      },
    ];
    
    return NextResponse.json({ 
      trendingCoins: mockTrendingCoins,
      error: 'Using fallback data due to API error'
    });
  }
} 