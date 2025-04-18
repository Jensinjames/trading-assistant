import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '@/server/db';
import { TwitterApi } from 'twitter-api-v2';

interface ScrapedData {
  source: string;
  data: any;
}

export class ExternalDataScraper {
  private twitterClient: TwitterApi | null = null;

  constructor() {
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (twitterBearerToken) {
      this.twitterClient = new TwitterApi(twitterBearerToken);
    }
  }

  async updateAll(): Promise<void> {
    await Promise.all([
      this.scrapeDexscreener(),
      this.scrapeBirdeye(),
      this.scrapeTwitter(),
    ]);
  }

  private async saveData(data: ScrapedData): Promise<void> {
    await prisma.externalData.create({
      data: {
        source: data.source,
        data: data.data,
      },
    });
  }

  private async scrapeDexscreener(): Promise<void> {
    try {
      const response = await axios.get('https://dexscreener.com/solana');
      const $ = cheerio.load(response.data);
      
      const pairs: any[] = [];
      
      // Extract trending pairs
      $('.pair-list tr').each((i, elem) => {
        const pair = {
          name: $(elem).find('.pair-name').text().trim(),
          price: $(elem).find('.price').text().trim(),
          volume24h: $(elem).find('.volume').text().trim(),
          liquidity: $(elem).find('.liquidity').text().trim(),
        };
        pairs.push(pair);
      });

      await this.saveData({
        source: 'dexscreener',
        data: {
          timestamp: new Date(),
          pairs,
        },
      });
    } catch (error) {
      console.error('Error scraping Dexscreener:', error);
    }
  }

  private async scrapeBirdeye(): Promise<void> {
    try {
      const response = await axios.get('https://api.birdeye.so/v1/tokens/list', {
        headers: {
          'X-API-KEY': process.env.BIRDEYE_API_KEY,
        },
      });

      await this.saveData({
        source: 'birdeye',
        data: {
          timestamp: new Date(),
          tokens: response.data.data,
        },
      });
    } catch (error) {
      console.error('Error scraping Birdeye:', error);
    }
  }

  private async scrapeTwitter(): Promise<void> {
    if (!this.twitterClient) {
      console.warn('Twitter client not initialized');
      return;
    }

    try {
      // Search for crypto-related tweets
      const tweets = await this.twitterClient.v2.search(
        'crypto OR bitcoin OR ethereum OR solana -is:retweet',
        {
          'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
          max_results: 100,
          sort_order: 'relevancy',
        }
      );

      await this.saveData({
        source: 'twitter',
        data: {
          timestamp: new Date(),
          tweets: tweets.data.data,
        },
      });
    } catch (error) {
      console.error('Error scraping Twitter:', error);
    }
  }

  async getLatestData(source: string): Promise<any> {
    const data = await prisma.externalData.findFirst({
      where: { source },
      orderBy: { createdAt: 'desc' },
    });
    return data?.data;
  }
} 