import axios from 'axios';
import { prisma } from '@/server/db';

interface MarketData {
  symbol: string;
  price: number;
  rsi: number;
  ema: number;
  timestamp: Date;
}

export class TradingViewService {
  private readonly baseUrl = 'https://scanner.tradingview.com/crypto/scan';

  constructor(private readonly userId: string) {}

  private async getApiKey(): Promise<string> {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: this.userId },
      select: { tradingViewApiKey: true },
    });

    if (!settings?.tradingViewApiKey) {
      throw new Error('TradingView API key not found');
    }

    return settings.tradingViewApiKey;
  }

  async fetchMarketData(symbols: string[]): Promise<MarketData[]> {
    const apiKey = await this.getApiKey();

    const columns = [
      'close', // Current price
      'RSI', // Relative Strength Index
      'EMA20', // 20-period Exponential Moving Average
    ];

    const response = await axios.post(
      this.baseUrl,
      {
        symbols: symbols.map(s => `CRYPTO:${s}`),
        columns,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data.map((item: any) => ({
      symbol: item.s.replace('CRYPTO:', ''),
      price: parseFloat(item.d[0]),
      rsi: parseFloat(item.d[1]),
      ema: parseFloat(item.d[2]),
      timestamp: new Date(),
    }));
  }

  async getIndicators(symbol: string): Promise<{
    rsi: number;
    ema: number;
    price: number;
  }> {
    const data = await this.fetchMarketData([symbol]);
    return {
      rsi: data[0].rsi,
      ema: data[0].ema,
      price: data[0].price,
    };
  }

  async getRSIDivergence(symbol: string): Promise<{
    hasDivergence: boolean;
    type: 'bullish' | 'bearish' | null;
    price: number;
    rsi: number;
  }> {
    const apiKey = await this.getApiKey();

    // Fetch historical data to detect divergence
    const response = await axios.post(
      this.baseUrl,
      {
        symbols: [`CRYPTO:${symbol}`],
        columns: ['close', 'RSI'],
        range: [-14, 0], // Last 14 periods
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const prices = response.data.data.map((d: any) => parseFloat(d.d[0]));
    const rsiValues = response.data.data.map((d: any) => parseFloat(d.d[1]));

    // Check for divergence
    const priceDirection = prices[prices.length - 1] > prices[0] ? 'up' : 'down';
    const rsiDirection = rsiValues[rsiValues.length - 1] > rsiValues[0] ? 'up' : 'down';

    return {
      hasDivergence: priceDirection !== rsiDirection,
      type: priceDirection === 'up' && rsiDirection === 'down' ? 'bearish' :
            priceDirection === 'down' && rsiDirection === 'up' ? 'bullish' : null,
      price: prices[prices.length - 1],
      rsi: rsiValues[rsiValues.length - 1],
    };
  }
} 