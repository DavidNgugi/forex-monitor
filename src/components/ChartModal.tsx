import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ChartModalProps {
  pair: {
    id: string;
    baseCurrency: string;
    targetCurrency: string;
  };
  onClose: () => void;
}

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y';

interface ChartPoint {
  date: Date;
  rate: number;
  x: number;
  y: number;
}

const ChartModal: React.FC<ChartModalProps> = ({ pair, onClose }) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1M');
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [externalHistoricalData, setExternalHistoricalData] = useState<Array<{date: string, rate: number}>>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  // Get real exchange rate data
  const exchangeRates = useQuery(api.forex.getExchangeRates, {
    baseCurrency: pair.baseCurrency
  });

  // Get historical data for 1D timeframe (from stored data)
  const historicalRates = useQuery(api.forex.getHistoricalRates, {
    baseCurrency: pair.baseCurrency,
    targetCurrency: pair.targetCurrency,
    hours: selectedTimeFrame === '1D' ? 24 : 
           selectedTimeFrame === '1W' ? 168 : 
           selectedTimeFrame === '1M' ? 720 : 
           selectedTimeFrame === '3M' ? 2160 : 8760, // 1Y = 8760 hours
  });

  // Action to fetch external historical data
  const fetchHistoricalDailyRates = useAction(api.forex.fetchHistoricalDailyRates);

  const currentRate = exchangeRates?.rates?.[pair.targetCurrency];

  // Fetch external historical data for longer timeframes
  useEffect(() => {
    if (selectedTimeFrame === '1D') {
      setExternalHistoricalData([]);
      return;
    }

    const fetchExternalData = async () => {
      setIsLoadingExternal(true);
      try {
        const endDate = new Date().toISOString().split('T')[0];
        let startDate: string;
        
        switch (selectedTimeFrame) {
          case '1W':
            startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case '1M':
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case '3M':
            startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case '1Y':
            startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          default:
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }

        const data = await fetchHistoricalDailyRates({
          baseCurrency: pair.baseCurrency,
          targetCurrency: pair.targetCurrency,
          startDate,
          endDate,
        });

        setExternalHistoricalData(data);
      } catch (error) {
        console.error('Failed to fetch external historical data:', error);
        setExternalHistoricalData([]);
      } finally {
        setIsLoadingExternal(false);
      }
    };

    void fetchExternalData();
  }, [selectedTimeFrame, pair.baseCurrency, pair.targetCurrency, fetchHistoricalDailyRates]);

  // Process historical data for chart
  const chartData = useMemo(() => {
    if (selectedTimeFrame === '1D') {
      // Use stored data for 1D
      if (!historicalRates || historicalRates.length === 0) {
        return [];
      }

      // Sort by timestamp and group by time intervals
      const sortedRates = [...historicalRates].sort((a, b) => a.timestamp - b.timestamp);
      
      // Group data points by hourly intervals
      const groupedData: { [key: number]: number[] } = {};
      const interval = 60 * 60 * 1000; // 1 hour
      
      sortedRates.forEach(rate => {
        const intervalKey = Math.floor(rate.timestamp / interval) * interval;
        if (!groupedData[intervalKey]) {
          groupedData[intervalKey] = [];
        }
        groupedData[intervalKey].push(rate.rate);
      });

      // Calculate average for each interval and create chart data
      return Object.entries(groupedData).map(([timestamp, rates]) => ({
        date: new Date(parseInt(timestamp)),
        rate: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
      }));
    } else {
      // Use external data for longer timeframes
      if (externalHistoricalData.length === 0) {
        return [];
      }

      return externalHistoricalData.map(item => ({
        date: new Date(item.date),
        rate: item.rate,
      }));
    }
  }, [historicalRates, externalHistoricalData, selectedTimeFrame]);

  const minRate = chartData.length > 0 ? Math.min(...chartData.map(d => d.rate)) : 0;
  const maxRate = chartData.length > 0 ? Math.max(...chartData.map(d => d.rate)) : 0;
  const range = maxRate - minRate;

  // Calculate chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 60;

  // Generate chart points
  const chartPoints: ChartPoint[] = useMemo(() => {
    if (chartData.length === 0) return [];
    
    return chartData.map((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
      const y = padding + (1 - (point.rate - minRate) / range) * (chartHeight - 2 * padding);
      return { ...point, x, y };
    });
  }, [chartData, minRate, maxRate, range]);

  // Create polyline points string
  const linePoints = useMemo(() => {
    return chartPoints.map(point => `${point.x},${point.y}`).join(' ');
  }, [chartPoints]);

  // Create area polygon points
  const areaPoints = useMemo(() => {
    if (chartPoints.length === 0) return '';
    
    return [
      `${padding},${chartHeight - padding}`,
      ...chartPoints.map(point => `${point.x},${point.y}`),
      `${chartWidth - padding},${chartHeight - padding}`
    ].join(' ');
  }, [chartPoints]);

  // Optimized mouse move handler
  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    // Find closest point with throttling
    let closestPoint: ChartPoint | null = null;
    let minDistance = Infinity;
    
    chartPoints.forEach(point => {
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      if (distance < minDistance && distance < 30) { // Increased threshold
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    setHoveredPoint(closestPoint);
  }, [chartPoints]);

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
    setMousePosition(null);
  }, []);

  // Format date based on time frame
  const formatDate = useCallback((date: Date, timeFrame: TimeFrame) => {
    switch (timeFrame) {
      case '1D':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1W':
        return date.toLocaleDateString([], { weekday: 'short' });
      case '1M':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case '3M':
      case '1Y':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  }, []);

  // Calculate change percentage
  const changePercent = useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstRate = chartData[0].rate;
    const lastRate = chartData[chartData.length - 1].rate;
    return ((lastRate - firstRate) / firstRate) * 100;
  }, [chartData]);

  // Debug logging
  useEffect(() => {
    console.log('ChartModal rendered with data:', {
      pair,
      timeFrame: selectedTimeFrame,
      currentRate,
      dataPoints: chartPoints.length,
      historicalRatesCount: historicalRates?.length,
      minRate,
      maxRate,
      range
    });
  }, [pair, selectedTimeFrame, currentRate, chartPoints.length, historicalRates?.length, minRate, maxRate, range]);

  if (!currentRate || (selectedTimeFrame !== '1D' && isLoadingExternal)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {pair.baseCurrency}/{pair.targetCurrency} Chart
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="text-gray-500">
              {!currentRate ? "Loading exchange rate data..." : "Loading historical data..."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {pair.baseCurrency}/{pair.targetCurrency} Chart
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {currentRate.toFixed(4)}
                </div>
                <div className="text-sm text-gray-500">Current Rate</div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-500">{selectedTimeFrame} change</div>
              </div>
            </div>
          </div>

          {/* Chart controls */}
          <div className="flex space-x-2 mb-4">
            {(['1D', '1W', '1M', '3M', '1Y'] as TimeFrame[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeFrame(period)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  period === selectedTimeFrame 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Enhanced SVG Chart */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 relative">
            <div className="text-sm text-gray-500 mb-2">
              {selectedTimeFrame} Chart: {chartPoints.length} points, Range: {minRate.toFixed(4)} - {maxRate.toFixed(4)}
            </div>
            
            {/* Tooltip */}
            {hoveredPoint && mousePosition && (
              <div 
                className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10"
                style={{
                  left: Math.min(mousePosition.x + 10, chartWidth - 150),
                  top: Math.max(mousePosition.y - 60, 10),
                  pointerEvents: 'none'
                }}
              >
                <div className="text-sm font-semibold">
                  {formatDate(hoveredPoint.date, selectedTimeFrame)}
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {hoveredPoint.rate.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500">
                  {pair.baseCurrency}/{pair.targetCurrency}
                </div>
              </div>
            )}
            
            <svg 
              width="100%" 
              height="300" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto border border-gray-200"
              style={{ minHeight: '300px' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Background */}
              <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="#F9FAFB" />
              
              {/* Grid lines and labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = padding + (i / 4) * (chartHeight - 2 * padding);
                const rate = maxRate - (i / 4) * range;
                return (
                  <g key={`grid-${i}`}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                    <text
                      x={padding - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill="#6B7280"
                    >
                      {rate.toFixed(4)}
                    </text>
                  </g>
                );
              })}
              
              {/* Chart area */}
              {areaPoints && (
                <polygon
                  fill="url(#chartGradient)"
                  points={areaPoints}
                />
              )}
              
              {/* Chart line */}
              {linePoints && (
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  points={linePoints}
                />
              )}
              
              {/* Data points */}
              {chartPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#3B82F6"
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-6 transition-all"
                />
              ))}
              
              {/* Hover indicator line */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={padding}
                  x2={hoveredPoint.x}
                  y2={chartHeight - padding}
                  stroke="#EF4444"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              )}
            </svg>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{maxRate.toFixed(4)}</div>
              <div className="text-sm text-gray-500">{selectedTimeFrame} High</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{minRate.toFixed(4)}</div>
              <div className="text-sm text-gray-500">{selectedTimeFrame} Low</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{((maxRate + minRate) / 2).toFixed(4)}</div>
              <div className="text-sm text-gray-500">{selectedTimeFrame} Avg</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{(range * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500">Volatility</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
