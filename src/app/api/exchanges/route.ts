import { NextResponse } from 'next/server';
import axios from 'axios';

// This endpoint will fetch exchange data from CoinGecko API
export async function GET(request: Request) {
  try {
    // In a production environment, you would use your own API key
    // const apiKey = process.env.COINGECKO_API_KEY;
    // const response = await axios.get(`https://api.coingecko.com/api/v3/exchanges?per_page=100&page=1&x_cg_demo_api_key=${apiKey}`);
    
    // For development, we'll use the free tier which has rate limits
    const response = await axios.get('https://api.coingecko.com/api/v3/exchanges?per_page=100&page=1');
    
    // Transform the data to match our interface
    const exchanges = response.data.map((exchange: any) => ({
      id: exchange.id,
      name: exchange.name,
      logo: exchange.image,
      country: exchange.country || 'Unknown',
      year_established: exchange.year_established || 0,
      url: exchange.url,
      trust_score: exchange.trust_score || 0,
      trade_volume_24h_btc: exchange.trade_volume_24h_btc || 0,
      has_trading_incentive: exchange.has_trading_incentive || false
    }));
    
    return NextResponse.json({ exchanges });
  } catch (error: any) {
    console.error('Error fetching exchange data:', error);
    
    // If the API call fails, return mock data as fallback
    const mockExchanges = [
      {
        id: 'binance',
        name: 'Binance',
        logo: 'https://assets.coingecko.com/markets/images/52/small/binance.jpg',
        country: 'Cayman Islands',
        year_established: 2017,
        url: 'https://www.binance.com',
        trust_score: 10,
        trade_volume_24h_btc: 462831.72,
        has_trading_incentive: false
      },
      {
        id: 'coinbase',
        name: 'Coinbase Exchange',
        logo: 'https://assets.coingecko.com/markets/images/23/small/Coinbase_Coin_Primary.png',
        country: 'United States',
        year_established: 2012,
        url: 'https://www.coinbase.com',
        trust_score: 10,
        trade_volume_24h_btc: 29154.9,
        has_trading_incentive: false
      },
      {
        id: 'kraken',
        name: 'Kraken',
        logo: 'https://assets.coingecko.com/markets/images/29/small/kraken.jpg',
        country: 'United States',
        year_established: 2011,
        url: 'https://www.kraken.com',
        trust_score: 10,
        trade_volume_24h_btc: 20791.12,
        has_trading_incentive: false
      },
      {
        id: 'kucoin',
        name: 'KuCoin',
        logo: 'https://assets.coingecko.com/markets/images/61/small/kucoin.png',
        country: 'Seychelles',
        year_established: 2017,
        url: 'https://www.kucoin.com',
        trust_score: 10,
        trade_volume_24h_btc: 11364.72,
        has_trading_incentive: false
      },
      {
        id: 'bybit_spot',
        name: 'Bybit',
        logo: 'https://assets.coingecko.com/markets/images/698/small/bybit_spot.png',
        country: 'British Virgin Islands',
        year_established: 2018,
        url: 'https://www.bybit.com',
        trust_score: 9,
        trade_volume_24h_btc: 21872.32,
        has_trading_incentive: true
      },
      {
        id: 'okx',
        name: 'OKX',
        logo: 'https://assets.coingecko.com/markets/images/96/small/wei_dai_2.png',
        country: 'Seychelles',
        year_established: 2013,
        url: 'https://www.okx.com',
        trust_score: 10,
        trade_volume_24h_btc: 38743.5,
        has_trading_incentive: false
      },
      {
        id: 'gate',
        name: 'Gate.io',
        logo: 'https://assets.coingecko.com/markets/images/60/small/gate_io_logo1.png',
        country: 'Cayman Islands',
        year_established: 2013,
        url: 'https://gate.io',
        trust_score: 9,
        trade_volume_24h_btc: 6432.18,
        has_trading_incentive: false
      },
      {
        id: 'gemini',
        name: 'Gemini',
        logo: 'https://assets.coingecko.com/markets/images/50/small/gemini.png',
        country: 'United States',
        year_established: 2015,
        url: 'https://www.gemini.com',
        trust_score: 9,
        trade_volume_24h_btc: 1294.37,
        has_trading_incentive: false
      },
    ];
    
    return NextResponse.json({ 
      exchanges: mockExchanges,
      error: 'Using fallback data due to API error'
    });
  }
} 