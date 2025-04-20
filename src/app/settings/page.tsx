"use client";

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Settings, OpenAITestResult } from '@/types/settings';
import { useAuth } from '@/context/AuthContext';

const defaultSettings: Settings = {
  openaiApiKey: '',
  tradingViewApiKey: '',
  telegramBotToken: '',
  openaiModel: 'gpt-3.5-turbo',
  openaiOrganization: '',
  openaiProjectId: '',
  aiProvider: 'openai',
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [testResult, setTestResult] = useState<OpenAITestResult | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/settings');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load settings');
        }
        
        const data = await response.json();
        setSettings({
          openaiApiKey: data.openaiApiKey || '',
          tradingViewApiKey: data.tradingViewApiKey || '',
          telegramBotToken: data.telegramBotToken || '',
          openaiModel: data.openaiModel || 'gpt-3.5-turbo',
          openaiOrganization: data.openaiOrganization || '',
          openaiProjectId: data.openaiProjectId || '',
          aiProvider: data.aiProvider || 'openai',
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }
      
      toast.success('Settings updated successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings/openai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: settings.openaiApiKey,
          organization: settings.openaiOrganization,
          projectId: settings.openaiProjectId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings/test-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: settings.openaiApiKey,
          organization: settings.openaiOrganization,
          projectId: settings.openaiProjectId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to test connection');
      }
      
      const result = await response.json();
      setTestResult(result);
      
      // Clear test result after 30 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 30000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const content = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="bg-red-50 dark:bg-red-900 border-2 border-red-500 dark:border-red-600 p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-red-700 dark:text-red-200 font-semibold text-lg mb-2">Error Loading Settings</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">OpenAI Configuration</h2>
            
            <div>
              <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <input
                type="password"
                id="openaiApiKey"
                name="openaiApiKey"
                value={settings.openaiApiKey || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="tradingViewApiKey" className="block text-sm font-medium text-gray-700">
                TradingView API Key
              </label>
              <input
                type="password"
                id="tradingViewApiKey"
                name="tradingViewApiKey"
                value={settings.tradingViewApiKey || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="telegramBotToken" className="block text-sm font-medium text-gray-700">
                Telegram Bot Token
              </label>
              <input
                type="password"
                id="telegramBotToken"
                name="telegramBotToken"
                value={settings.telegramBotToken || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="openaiModel" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <select
                id="openaiModel"
                name="openaiModel"
                value={settings.openaiModel || 'gpt-3.5-turbo'}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </div>

            <div>
              <label htmlFor="openaiOrganization" className="block text-sm font-medium text-gray-700">
                Organization ID (optional)
              </label>
              <input
                type="text"
                id="openaiOrganization"
                name="openaiOrganization"
                value={settings.openaiOrganization || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="openaiProjectId" className="block text-sm font-medium text-gray-700">
                Project ID (optional)
              </label>
              <input
                type="text"
                id="openaiProjectId"
                name="openaiProjectId"
                value={settings.openaiProjectId || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Settings
            </button>
            
            <button
              type="button"
              onClick={testConnection}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Test Connection
            </button>
          </div>
        </form>

        {testResult && (
          <div className={`mt-4 p-4 rounded-md ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
              {testResult.response}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
      <MainLayout>
        {content()}
      </MainLayout>
    </>
  );
} 