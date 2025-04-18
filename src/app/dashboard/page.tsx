"use client";
import React, { useState, useRef, useEffect } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import html2canvas from 'html2canvas';
import MainLayout from '@/components/layout/MainLayout';

interface ChartData {
  time: string;
  value: number;
}

interface Strategy {
  id: string;
  name: string;
  coins: string[];
}

interface Alert {
  id: string;
  coin: string;
  condition: string;
  threshold: string;
}

export default function DashboardPage() {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);

  useEffect(() => {
    // Mock data for strategies and alerts
    setStrategies([
      { id: '1', name: 'BTC Breakout', coins: ['BTC'] },
      { id: '2', name: 'ETH Accumulation', coins: ['ETH'] },
      { id: '3', name: 'SOL Momentum', coins: ['SOL', 'BTC'] },
    ]);
    
    setAlerts([
      { id: '1', coin: 'BTC', condition: 'Price above', threshold: '$43,000' },
      { id: '2', coin: 'ETH', condition: 'Price below', threshold: '$2,300' },
      { id: '3', coin: 'SOL', condition: 'Volume spike', threshold: '200%' },
    ]);
  }, []);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Add mock data for the chart
      const mockData = generateMockCandlestickData(30);
      candlestickSeries.setData(mockData);

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;

      const resizeObserver = new ResizeObserver(entries => {
        if (entries[0].contentRect) {
          chart.applyOptions({ width: entries[0].contentRect.width });
        }
      });

      resizeObserver.observe(chartContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        chart.remove();
      };
    }
  }, []);

  // Generate mock candlestick data
  const generateMockCandlestickData = (days: number) => {
    const data = [];
    let basePrice = selectedCoin === 'BTC' ? 43000 : selectedCoin === 'ETH' ? 2300 : 80;
    let time = new Date();
    time.setDate(time.getDate() - days);

    for (let i = 0; i < days; i++) {
      const volatility = (Math.random() * 2 - 1) * (basePrice * 0.03);
      const open = basePrice + (Math.random() * 2 - 1) * (basePrice * 0.01);
      const close = open + volatility;
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);

      basePrice = close;
      time.setDate(time.getDate() + 1);

      data.push({
        time: time.toISOString().split('T')[0],
        open,
        high,
        low,
        close
      });
    }
    return data;
  };

  const handleAnalyze = async () => {
    if (!chartContainerRef.current) return;

    setIsAnalyzing(true);
    try {
      const canvas = await html2canvas(chartContainerRef.current);
      const imageData = canvas.toDataURL('image/png');

      // Simulate AI analysis with a delay
      setTimeout(() => {
        const analysisText = `# Technical Analysis for ${selectedCoin}

## Overview
The ${selectedCoin} chart shows a clear ${Math.random() > 0.5 ? 'bullish' : 'bearish'} trend over the recent period.

## Key Patterns
- Identified ${Math.random() > 0.5 ? 'double bottom' : 'head and shoulders'} pattern
- RSI shows ${Math.random() > 0.5 ? 'oversold' : 'overbought'} conditions
- Volume is ${Math.random() > 0.5 ? 'increasing' : 'decreasing'} on ${Math.random() > 0.5 ? 'up' : 'down'} days

## Support & Resistance
- Strong support at $${Math.floor(selectedCoin === 'BTC' ? 41000 : selectedCoin === 'ETH' ? 2100 : 70)}
- Key resistance at $${Math.floor(selectedCoin === 'BTC' ? 45000 : selectedCoin === 'ETH' ? 2500 : 90)}

## Recommendation
${Math.random() > 0.3 ? 'Consider accumulating at current levels with tight stop loss.' : Math.random() > 0.5 ? 'Wait for confirmation of trend reversal before entry.' : 'Take partial profits and maintain position with trailing stop.'}`;
        
        setAnalysis(analysisText);
        setIsAnalyzing(false);
      }, 2000);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('Error analyzing chart. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = async () => {
    // Simulate data refresh
    setStrategies([...strategies]);
    setAlerts([...alerts]);
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(generateMockCandlestickData(30));
    }
  };

  const content = () => (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Active Strategies</h2>
          <p className="text-3xl dark:text-white">{strategies?.length || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Active Alerts</h2>
          <p className="text-3xl dark:text-white">{alerts?.length || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2 dark:text-white">Actions</h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-white">Chart Analysis</h2>
          <select
            aria-label="Select coin"
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="border rounded p-2 dark:bg-gray-700 dark:text-white"
          >
            <option value="BTC">Bitcoin</option>
            <option value="ETH">Ethereum</option>
            <option value="SOL">Solana</option>
          </select>
        </div>
        <div ref={chartContainerRef} className="mb-4" />
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Chart'}
        </button>
        {analysis && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <h3 className="font-bold mb-2 dark:text-white">Analysis Results:</h3>
            <p className="whitespace-pre-wrap dark:text-white">{analysis}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Recent Alerts</h2>
          <div className="space-y-2">
            {alerts?.map((alert) => (
              <div
                key={alert.id}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <p className="font-semibold dark:text-white">{alert.coin}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {alert.condition} ({alert.threshold})
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Saved Strategies</h2>
          <div className="space-y-2">
            {strategies?.map((strategy) => (
              <div
                key={strategy.id}
                className="border-l-4 border-green-500 pl-4 py-2"
              >
                <p className="font-semibold dark:text-white">{strategy.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {strategy.coins.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      {content()}
    </MainLayout>
  );
} 