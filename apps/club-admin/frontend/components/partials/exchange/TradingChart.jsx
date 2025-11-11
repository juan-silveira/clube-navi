"use client";
import React, { useEffect, useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import api from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

const TradingChart = ({ symbol, exchangeContract }) => {
    const { t } = useTranslation('exchange');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [interval, setInterval] = useState('15m');
    const [chartType, setChartType] = useState('candlestick');
    const [stats, setStats] = useState({
        lastPrice: 0,
        change24h: 0,
        changePct24h: 0,
        high24h: 0,
        low24h: 0,
        volume24h: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasData, setHasData] = useState(false);

    // Helper function to invert symbol display (e.g., cBRL/PCN → PCN/cBRL)
    const getInvertedSymbol = () => {
        if (!symbol || typeof symbol !== 'string') return symbol || 'CST/cBRL';
        const tokens = symbol.split('/');
        if (tokens.length === 2) {
            return `${tokens[1]}/${tokens[0]}`;
        }
        return symbol;
    };

    // Load Chart.js library (simplified - only Chart.js core with time scale)
    const loadChartJs = async () => {
        // console.log('📊 TradingChart: Loading Chart.js...');

        // Check if Chart.js is already loaded
        if (window.Chart) {
            // console.log('📊 TradingChart: Chart.js already loaded');
            return true;
        }

        return new Promise((resolve) => {
            // Load Chart.js core
            const chartScript = document.createElement('script');
            chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            chartScript.onload = () => {
                // console.log('📊 TradingChart: Chart.js core loaded');

                // Load date-fns adapter for time scale
                const adapterScript = document.createElement('script');
                adapterScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js';
                adapterScript.onload = () => {
                    // console.log('📊 TradingChart: Time adapter loaded');
                    resolve(true);
                };
                adapterScript.onerror = () => {
                    // console.warn('📊 TradingChart: Time adapter failed to load, continuing without time scale');
                    resolve(true);
                };
                document.head.appendChild(adapterScript);
            };
            chartScript.onerror = () => {
                console.error('📊 TradingChart: Failed to load Chart.js');
                resolve(false);
            };
            document.head.appendChild(chartScript);
        });
    };

    // Fetch chart data from API
    const fetchChartData = async () => {
        // console.log('📊 TradingChart: fetchChartData called');
        // console.log('📊 Symbol:', symbol, 'Contract:', exchangeContract, 'Interval:', interval);

        if (!symbol || !exchangeContract) {
            // console.warn('📊 TradingChart: fetchChartData called but missing symbol or contract');
            return null;
        }

        try {
            setError(null);

            // console.log('📊 TradingChart: Fetching candles data...');
            // Fetch candles data (using v3 endpoint)
            const candlesResponse = await api.get(`/api/exchange/v3/candles/${exchangeContract}?interval=${interval}&limit=100`);

            // console.log('📊 TradingChart: Fetching ticker data...');
            // Fetch 24h stats (using v3 endpoint)
            const statsResponse = await api.get(`/api/exchange/v3/ticker/${exchangeContract}`);

            // console.log('📊 TradingChart: Candles response:', candlesResponse.data);
            // console.log('📊 TradingChart: Stats response:', statsResponse.data);

            let chartData = [];

            if (candlesResponse.data.success) {
                const candles = candlesResponse.data.data || [];
                // console.log('📊 TradingChart: Processing', candles.length, 'candles');

                if (candles.length > 0) {
                    chartData = candles.map(candle => ({
                        x: new Date(candle.timestamp),
                        o: parseFloat(candle.open),
                        h: parseFloat(candle.high),
                        l: parseFloat(candle.low),
                        c: parseFloat(candle.close),
                        v: parseFloat(candle.volume)
                    }));
                    setHasData(true);
                } else {
                    // No real data available - use empty array
                    chartData = [];
                    setHasData(false);
                }
            } else {
                // API call failed - use empty array
                chartData = [];
                setHasData(false);
            }

            // Update 24h stats
            if (statsResponse.data.success) {
                const statsData = statsResponse.data.data;
                setStats({
                    lastPrice: parseFloat(statsData.lastPrice) || 0,
                    change24h: parseFloat(statsData.change24h) || 0,
                    changePct24h: parseFloat(statsData.changePercent24h) || 0,
                    high24h: parseFloat(statsData.high24h) || 0,
                    low24h: parseFloat(statsData.low24h) || 0,
                    volume24h: parseFloat(statsData.volume24h) || 0
                });
            }

            return chartData;

        } catch (error) {
            console.error('Error fetching chart data:', error);
            setError(t('chart.errorLoadingData'));
            setHasData(false);
            return [];
        }
    };

    // Generate sample data for testing
    const generateSampleData = () => {
        // console.log('📊 TradingChart: Generating sample data');
        const basePrice = 0.5;
        const data = [];
        const now = new Date();

        for (let i = 99; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000); // 15 minutes intervals
            const open = basePrice + (Math.random() - 0.5) * 0.1;
            const close = open + (Math.random() - 0.5) * 0.05;
            const high = Math.max(open, close) + Math.random() * 0.02;
            const low = Math.min(open, close) - Math.random() * 0.02;

            data.push({
                x: timestamp,
                o: parseFloat(open.toFixed(4)),
                h: parseFloat(high.toFixed(4)),
                l: parseFloat(low.toFixed(4)),
                c: parseFloat(close.toFixed(4)),
                v: Math.random() * 1000
            });
        }

        return data;
    };

    // Initialize chart (simplified line chart)
    const initChart = async (data) => {
        // console.log('📊 TradingChart: Initializing chart...');
        // console.log('📊 TradingChart: Chart data:', data);

        if (!chartRef.current) {
            console.error('📊 TradingChart: Chart ref not available');
            setLoading(false);
            return;
        }

        // Don't create chart if no data
        if (!data || data.length === 0) {
            setLoading(false);
            return;
        }

        if (!window.Chart) {
            console.error('📊 TradingChart: Chart.js not loaded');
            return;
        }

        // Destroy existing chart
        if (chartInstance.current) {
            // console.log('📊 TradingChart: Destroying existing chart');
            chartInstance.current.destroy();
        }

        try {
            const ctx = chartRef.current.getContext('2d');

            // Convert data to simple line chart format
            const lineData = data.map(item => ({
                x: item.x,
                y: item.c || item.y || 0 // Use close price or y value
            }));

            // console.log('📊 TradingChart: Line data sample:', lineData.slice(0, 3));

            const chartConfig = {
                type: 'line',
                data: {
                    datasets: [{
                        label: getInvertedSymbol(),
                        data: lineData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 2,
                        pointHoverRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear', // Start with linear instead of time
                            position: 'bottom',
                            title: {
                                display: true,
                                text: t('chart.timeAxis')
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: t('chart.priceAxis')
                            },
                            beginAtZero: false
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            };

            // Try to use time scale if adapter is loaded
            if (window.Chart._adapters && window.Chart._adapters._date) {
                // console.log('📊 TradingChart: Time adapter available, using time scale');
                chartConfig.options.scales.x.type = 'time';
                chartConfig.options.scales.x.time = {
                    unit: 'minute',
                    displayFormats: {
                        minute: 'HH:mm'
                    }
                };
            } else {
                // console.log('📊 TradingChart: Using linear scale (time adapter not available)');
                // Convert dates to timestamps for linear scale
                chartConfig.data.datasets[0].data = lineData.map((item, index) => ({
                    x: index,
                    y: item.y
                }));
            }

            // console.log('📊 TradingChart: Creating chart with config:', chartConfig);
            chartInstance.current = new window.Chart(ctx, chartConfig);

            // console.log('📊 TradingChart: Chart created successfully');
            setLoading(false);

        } catch (error) {
            console.error('Error creating chart:', error);
            setError(t('chart.errorCreatingChart', { message: error.message }));
            setLoading(false);
        }
    };

    // Main initialization effect
    useEffect(() => {
        // console.log('📊 TradingChart: Component mounted with symbol:', symbol, 'contract:', exchangeContract);

        if (!symbol || !exchangeContract) {
            // console.log('📊 TradingChart: Missing symbol or contract, stopping');
            setLoading(false);
            return;
        }

        const initializeChart = async () => {
            try {
                setLoading(true);
                setError(null);

                // console.log('📊 TradingChart: Loading Chart.js library...');
                const libraryLoaded = await loadChartJs();

                if (!libraryLoaded) {
                    setError(t('chart.errorLoadingLibrary'));
                    setLoading(false);
                    return;
                }

                // console.log('📊 TradingChart: Fetching chart data...');
                const data = await fetchChartData();

                if (!data || data.length === 0) {
                    // No error, just no data available
                    setLoading(false);
                    return;
                }

                // console.log('📊 TradingChart: Initializing chart with data...');
                await initChart(data);

            } catch (error) {
                console.error('Error initializing chart:', error);
                setError(t('chart.errorInitializing'));
                setLoading(false);
            }
        };

        // Small delay to ensure DOM is ready
        setTimeout(() => {
            initializeChart();
        }, 100);

        // Cleanup
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [symbol, exchangeContract, interval]);

    // Handle interval change
    const handleIntervalChange = async (newInterval) => {
        setInterval(newInterval);
        if (!loading) {
            setLoading(true);
            const data = await fetchChartData();
            if (data && data.length > 0) {
                await initChart(data);
            } else {
                setLoading(false);
            }
        }
    };

    return (
        <Card title={`${t('chart.title')} - ${getInvertedSymbol()}`} noborder>
            <div className="p-2 md:p-4">
                {/* Stats Header */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 text-xs">
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">{t('chart.lastPrice')}</div>
                        <div className="font-semibold text-lg">{stats.lastPrice.toFixed(4)}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">{t('chart.change24h')}</div>
                        <div className={`font-semibold ${stats.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.change24h >= 0 ? '+' : ''}{stats.change24h.toFixed(4)} ({stats.changePct24h.toFixed(2)}%)
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">{t('chart.high24h')}</div>
                        <div className="font-semibold">{stats.high24h.toFixed(4)}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">{t('chart.low24h')}</div>
                        <div className="font-semibold">{stats.low24h.toFixed(4)}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">{t('chart.volume24h')}</div>
                        <div className="font-semibold">{stats.volume24h.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">{t('chart.interval')}</div>
                        <select
                            value={interval}
                            onChange={(e) => handleIntervalChange(e.target.value)}
                            className="text-xs px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600"
                        >
                            <option value="1m">1m</option>
                            <option value="5m">5m</option>
                            <option value="15m">15m</option>
                            <option value="1h">1h</option>
                            <option value="4h">4h</option>
                            <option value="1d">1d</option>
                        </select>
                    </div>
                </div>

                {/* Chart Container */}
                <div className="relative">
                    {/* Canvas - sempre presente para que funcione */}
                    <canvas ref={chartRef} className="w-full" style={{ height: '400px' }} />

                    {/* Loading overlay */}
                    {loading && (
                        <div className="absolute inset-0 flex justify-center items-center bg-gray-50 dark:bg-slate-800 rounded">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <span className="text-gray-500">{t('chart.loading')}</span>
                            </div>
                        </div>
                    )}

                    {/* Error overlay */}
                    {error && (
                        <div className="absolute inset-0 flex justify-center items-center bg-gray-50 dark:bg-slate-800 rounded">
                            <div className="text-center">
                                <div className="text-red-500 mb-2">{error}</div>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        setLoading(true);
                                        fetchChartData().then(data => {
                                            if (data) initChart(data);
                                        });
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    {t('chart.tryAgain')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No data overlay */}
                    {!loading && !error && !hasData && (
                        <div className="absolute inset-0 flex justify-center items-center bg-gray-50 dark:bg-slate-800 rounded">
                            <div className="text-center">
                                <div className="text-gray-500 mb-2">{t('chart.noData')}</div>
                                <div className="text-xs text-gray-400">
                                    {t('chart.noDataHint', { symbol: getInvertedSymbol() })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default TradingChart;