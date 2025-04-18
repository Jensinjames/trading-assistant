interface NewsApiConfig {
  apiKey: string;
  baseUrl: string;
  defaultLanguage: string;
  defaultCountry: string;
}

interface EnvConfig {
  newsApi: NewsApiConfig;
}

export const envConfig: EnvConfig = {
  newsApi: {
    apiKey: process.env.NEWS_API_KEY || '',
    baseUrl: 'https://newsapi.org/v2',
    defaultLanguage: 'en',
    defaultCountry: 'us',
  },
};

// Validate required environment variables
const validateEnvConfig = () => {
  if (!envConfig.newsApi.apiKey) {
    throw new Error('NEWS_API_KEY environment variable is required');
  }
};

// Call validation on module import
validateEnvConfig();

export default envConfig; 