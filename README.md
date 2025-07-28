# Forex Exchange Monitor Application
  
Monitor forex exchange rates and news in real-time.
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## Features

### Real-time RSS News Feeds
The application includes a comprehensive RSS feed system that provides real-time financial news from multiple sources:

- **Country-specific feeds**: News sources tailored for different regions (US, UK, EU, Kenya, Nigeria, South Africa)
- **Multiple sources per country**: Each country has 3+ RSS feeds for comprehensive coverage
- **Automatic fallback**: If RSS feeds are unavailable, the system falls back to curated mock data
- **User preferences**: Country selection is saved per user and persists across sessions
- **Real-time updates**: News can be refreshed manually with a dedicated refresh button

**Supported RSS Sources:**
- **US**: Reuters, Bloomberg, MarketWatch
- **UK**: Reuters UK, Financial Times, BBC Business
- **EU**: Reuters, Euronews, Bloomberg
- **Kenya**: Business Daily, The Star, Nation
- **Nigeria**: Premium Times, Vanguard, Punch
- **South Africa**: Business Live, Moneyweb, Fin24

### Forex Monitoring
- Real-time exchange rate monitoring
- Customizable currency pairs
- Price alerts and notifications
- Historical data tracking

### Authentication
Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
