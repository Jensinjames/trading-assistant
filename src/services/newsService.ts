import axios from 'axios';
import { envConfig } from '@/config/env.config';

export interface NewsSource {
  id: string | null;
  name: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  published_at: string;
  source: string;
  content: string;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsItem[];
}

export async function getTrendingNews(): Promise<NewsItem[]> {
  try {
    const { apiKey, baseUrl, defaultLanguage, defaultCountry } = envConfig.newsApi;
    
    const response = await axios.get<NewsApiResponse>(`${baseUrl}/top-headlines`, {
      params: {
        apiKey,
        language: defaultLanguage,
        country: defaultCountry,
        category: 'business',
      },
    });

    if (response.data.status !== 'ok') {
      throw new Error('News API returned an error status');
    }

    return response.data.articles;
  } catch (error) {
    console.error('Error fetching trending news:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', error.response?.data);
    }
    return [];
  }
} 