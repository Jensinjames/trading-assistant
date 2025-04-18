"use client";

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Settings, OpenAIModel, OpenAITestResult } from '@/types/settings';
import { useAuth } from '@/context/AuthContext';

const defaultSettings: Settings = {
  openaiApiKey: '',
  tradingViewApiKey: '',
  telegramBotToken: '',
  openaiModel: 'gpt-3.5-turbo',
  openaiOrganization: '',
  openaiProjectId: '',
};

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [models, setModels] = useState<OpenAIModel[]>([]);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
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
    } finally {
      setIsSaving(false);
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
      setModels(data.models);
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              Settings
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  API Keys
                </h2>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    name="openaiApiKey"
                    value={settings.openaiApiKey}
                    onChange={handleChange}
                    className="w-full p-3 border-2 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                             dark:focus:border-blue-400 transition-colors"
                    placeholder="sk-..."
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                    Required for AI-powered trading suggestions
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    TradingView API Key
                  </label>
                  <input
                    type="password"
                    name="tradingViewApiKey"
                    value={settings.tradingViewApiKey}
                    onChange={handleChange}
                    className="w-full p-3 border-2 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                             dark:focus:border-blue-400 transition-colors"
                    placeholder="Enter your TradingView API key"
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                    Required for market data and charts
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    Telegram Bot Token
                  </label>
                  <input
                    type="password"
                    name="telegramBotToken"
                    value={settings.telegramBotToken}
                    onChange={handleChange}
                    className="w-full p-3 border-2 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                             dark:focus:border-blue-400 transition-colors"
                    placeholder="123456:ABC-DEF..."
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                    Required for Telegram notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    OpenAI Model
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={settings.openaiModel}
                      onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                      className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      aria-label="Select OpenAI Model"
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={fetchModels}
                      disabled={isLoading || !settings.openaiApiKey}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Load Models
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    OpenAI Organization ID
                  </label>
                  <input
                    type="text"
                    name="openaiOrganization"
                    value={settings.openaiOrganization}
                    onChange={handleChange}
                    className="w-full p-3 border-2 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                             dark:focus:border-blue-400 transition-colors"
                    placeholder="org-..."
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                    Your OpenAI organization ID
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                    OpenAI Project ID
                  </label>
                  <input
                    type="text"
                    name="openaiProjectId"
                    value={settings.openaiProjectId}
                    onChange={handleChange}
                    className="w-full p-3 border-2 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 
                             dark:focus:border-blue-400 transition-colors"
                    placeholder="proj-..."
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                    Your OpenAI project ID
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg transition-all
                    ${isSaving 
                      ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed opacity-70'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl'
                    }`}
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-lg text-white font-medium text-lg transition-all
                  bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-lg hover:shadow-xl"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
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