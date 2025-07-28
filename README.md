# Forex Exchange Monitor Application

A real-time forex exchange rate monitoring application built with Convex, React, and TypeScript.

## Features

- Real-time exchange rate monitoring
- Historical data charts with multiple timeframes (1D, 1W, 1M, 3M, 1Y)
- Currency pair management
- Price alerts
- News integration
- YouTube stream integration
- Responsive design

## Hybrid Data Approach

This application uses a hybrid approach for historical data:

### Short-term Data (1D charts)
- Uses stored real-time data from the current exchange rate API
- Provides hourly/minute granularity for intraday analysis
- Data is automatically collected and stored in the database

### Long-term Data (1W, 1M, 3M, 1Y charts)
- Uses the Exchange Rate API's historical endpoint
- Provides daily granularity for trend analysis
- Fetched on-demand to avoid storage costs

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Exchange Rate API (for historical data)
CONVEX_EXCHANGERATE_API_KEY=your_exchange_rate_api_key_here

# NewsData.io API (for news features)
CONVEX_NEWSDATA_API_KEY=your_newsdata_api_key_here
```

### API Keys Required

1. **Exchange Rate API**: Get your free API key from [exchangerate-api.com](https://www.exchangerate-api.com/)
   - Used for historical daily data
   - Free tier includes 1,500 requests per month

2. **NewsData.io API**: Get your API key from [newsdata.io](https://newsdata.io/)
   - Used for forex-related news
   - Free tier includes 200 requests per day

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Deployment

```bash
npx convex deploy
```

## Data Sources

- **Real-time rates**: [exchangerate-api.com](https://www.exchangerate-api.com/)
- **Historical data**: [exchangerate-api.com](https://www.exchangerate-api.com/) (historical endpoint)
- **News**: [newsdata.io](https://newsdata.io/)

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Convex (serverless database and functions)
- **Real-time**: Convex subscriptions
- **Charts**: Custom SVG implementation
- **State Management**: Convex queries and mutations

## Chart Timeframes

- **1D**: Uses stored hourly data for intraday analysis
- **1W**: Uses external API daily data
- **1M**: Uses external API daily data
- **3M**: Uses external API daily data
- **1Y**: Uses external API daily data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
