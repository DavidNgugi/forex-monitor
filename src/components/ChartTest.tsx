import React from 'react';

const ChartTest: React.FC = () => {
  // Simple test data
  const testData = [
    { rate: 1.2 }, { rate: 1.25 }, { rate: 1.22 }, { rate: 1.28 }, { rate: 1.26 },
    { rate: 1.24 }, { rate: 1.29 }, { rate: 1.27 }, { rate: 1.23 }, { rate: 1.21 }
  ];

  const minRate = Math.min(...testData.map(d => d.rate));
  const maxRate = Math.max(...testData.map(d => d.rate));
  const range = maxRate - minRate;

  const chartWidth = 400;
  const chartHeight = 200;
  const padding = 20;

  const chartPoints = testData.map((point, index) => {
    const x = padding + (index / (testData.length - 1)) * (chartWidth - 2 * padding);
    const y = padding + (1 - (point.rate - minRate) / range) * (chartHeight - 2 * padding);
    return { x, y, rate: point.rate };
  });

  const linePoints = chartPoints.map(point => `${point.x},${point.y}`).join(' ');

  return (
    <div className="p-4 bg-white border rounded">
      <h3 className="text-lg font-semibold mb-4">Chart Test</h3>
      <div className="bg-gray-50 p-4 rounded">
        <svg 
          width="400" 
          height="200" 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="border border-gray-300"
        >
          {/* Background */}
          <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="#F9FAFB" />
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            points={linePoints}
          />
          
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
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Data points: {chartPoints.length}, Range: {minRate.toFixed(3)} - {maxRate.toFixed(3)}
      </div>
    </div>
  );
};

export default ChartTest; 