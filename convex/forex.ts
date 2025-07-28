import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Initialize default currency pairs for new users
export const initializeDefaultPairs = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has preferences
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing && existing.watchedPairs.length > 0) {
      // User already has pairs, don't initialize
      return existing.watchedPairs;
    }

    // Default major currencies against KES
    const defaultPairs = [
      { id: "USD-KES", baseCurrency: "USD", targetCurrency: "KES", order: 0 },
      { id: "EUR-KES", baseCurrency: "EUR", targetCurrency: "KES", order: 1 },
      { id: "GBP-KES", baseCurrency: "GBP", targetCurrency: "KES", order: 2 },
      { id: "JPY-KES", baseCurrency: "JPY", targetCurrency: "KES", order: 3 },
      { id: "AUD-KES", baseCurrency: "AUD", targetCurrency: "KES", order: 4 },
      { id: "CAD-KES", baseCurrency: "CAD", targetCurrency: "KES", order: 5 },
      { id: "CHF-KES", baseCurrency: "CHF", targetCurrency: "KES", order: 6 },
      { id: "CNY-KES", baseCurrency: "CNY", targetCurrency: "KES", order: 7 },
    ];

    if (existing) {
      // Update existing preferences with default pairs
      await ctx.db.patch(existing._id, {
        watchedPairs: defaultPairs,
      });
    } else {
      // Create new preferences with default pairs
      await ctx.db.insert("userPreferences", {
        userId,
        watchedPairs: defaultPairs,
        newsCountry: "KE", // Default to Kenya
        youtubeStreams: [],
      });
    }

    return defaultPairs;
  },
});

// Get user preferences
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return prefs;
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    watchedPairs: v.optional(v.array(v.object({
      id: v.string(),
      baseCurrency: v.string(),
      targetCurrency: v.string(),
      order: v.number(),
    }))),
    newsCountry: v.optional(v.string()),
    youtubeStreams: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      channelId: v.string(),
      videoId: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        watchedPairs: args.watchedPairs || [],
        newsCountry: args.newsCountry,
        youtubeStreams: args.youtubeStreams,
      });
    }
  },
});

// Get user alerts
export const getUserAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("alerts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Create alert
export const createAlert = mutation({
  args: {
    pairId: v.string(),
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    targetRate: v.number(),
    condition: v.union(v.literal("above"), v.literal("below")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("alerts", {
      userId,
      pairId: args.pairId,
      baseCurrency: args.baseCurrency,
      targetCurrency: args.targetCurrency,
      targetRate: args.targetRate,
      condition: args.condition,
      isActive: true,
      triggered: false,
    });
  },
});

// Delete alert
export const deleteAlert = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const alert = await ctx.db.get(args.alertId);
    if (!alert || alert.userId !== userId) {
      throw new Error("Alert not found or unauthorized");
    }

    await ctx.db.delete(args.alertId);
  },
});

// Get latest exchange rates
export const getExchangeRates = query({
  args: { baseCurrency: v.string() },
  handler: async (ctx, args) => {
    const rates = await ctx.db
      .query("exchangeRates")
      .withIndex("by_base_currency", (q) => q.eq("baseCurrency", args.baseCurrency))
      .order("desc")
      .first();

    return rates;
  },
});

// Fetch and store exchange rates (called by action)
export const storeExchangeRates = internalMutation({
  args: {
    baseCurrency: v.string(),
    rates: v.record(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("exchangeRates", {
      baseCurrency: args.baseCurrency,
      rates: args.rates,
      timestamp: Date.now(),
    });
  },
});

// Action to fetch exchange rates from external API
export const fetchExchangeRates = action({
  args: { baseCurrency: v.string() },
  handler: async (ctx, args) => {
    try {
      // console.log(`Fetching rates for ${args.baseCurrency}...`);
      
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${args.baseCurrency}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // console.log(`Received rates for ${args.baseCurrency}:`, Object.keys(data.rates).length, 'currencies');
      
      // Store the rates using the internal mutation
      await ctx.runMutation(internal.forex.storeExchangeRates, {
        baseCurrency: args.baseCurrency,
        rates: data.rates,
      });
      
      return data.rates;
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      throw error;
    }
  },
});

// Check and trigger alerts
export const checkAlerts = internalMutation({
  args: {
    baseCurrency: v.string(),
    rates: v.record(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .filter((q) => q.eq(q.field("baseCurrency"), args.baseCurrency))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("triggered"), false))
      .collect();

    for (const alert of alerts) {
      const currentRate = args.rates[alert.targetCurrency];
      if (!currentRate) continue;

      let shouldTrigger = false;
      if (alert.condition === "above" && currentRate >= alert.targetRate) {
        shouldTrigger = true;
      } else if (alert.condition === "below" && currentRate <= alert.targetRate) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        await ctx.db.patch(alert._id, {
          triggered: true,
        });
      }
    }
  },
});

// Enhanced action that also checks alerts and stores historical data
export const fetchExchangeRatesAndCheckAlerts = action({
  args: { baseCurrency: v.string() },
  handler: async (ctx, args) => {
    try {
      // console.log(`Fetching rates for ${args.baseCurrency}...`);
      
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${args.baseCurrency}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // console.log(`Received rates for ${args.baseCurrency}:`, Object.keys(data.rates).length, 'currencies');
      
      // Store the rates
      await ctx.runMutation(internal.forex.storeExchangeRates, {
        baseCurrency: args.baseCurrency,
        rates: data.rates,
      });

      // Store historical data for trend tracking
      for (const [targetCurrency, rate] of Object.entries(data.rates)) {
        await ctx.runMutation(internal.forex.storeHistoricalRate, {
          baseCurrency: args.baseCurrency,
          targetCurrency,
          rate: rate as number,
        });
      }

      // Check alerts
      await ctx.runMutation(internal.forex.checkAlerts, {
        baseCurrency: args.baseCurrency,
        rates: data.rates,
      });
      
      return data.rates;
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      throw error;
    }
  },
});

// Store historical rate for trend tracking with smart retention
export const storeHistoricalRate = internalMutation({
  args: {
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const timestamp = now;
    
    // Smart retention intervals (in milliseconds)
    const intervals = {
      minute: 60 * 1000,      // 1 minute
      fiveMinutes: 5 * 60 * 1000,  // 5 minutes
      hour: 60 * 60 * 1000,   // 1 hour
      sixHours: 6 * 60 * 60 * 1000, // 6 hours
      day: 24 * 60 * 60 * 1000,     // 24 hours
    };
    
    // Check if we should store this rate based on time intervals
    const shouldStore = await shouldStoreHistoricalRate(ctx, args.baseCurrency, args.targetCurrency, timestamp, intervals);
    
    if (shouldStore) {
      await ctx.db.insert("historicalRates", {
        baseCurrency: args.baseCurrency,
        targetCurrency: args.targetCurrency,
        rate: args.rate,
        timestamp: timestamp,
      });
      
      // Clean up old data to prevent unlimited growth
      await cleanupOldHistoricalRates(ctx, args.baseCurrency, args.targetCurrency);
    }
  },
});

// Helper function to determine if we should store a historical rate
async function shouldStoreHistoricalRate(
  ctx: any,
  baseCurrency: string,
  targetCurrency: string,
  currentTimestamp: number,
  intervals: Record<string, number>
): Promise<boolean> {
  // Always store if no previous records exist
  const existingRecords = await ctx.db
    .query("historicalRates")
    .withIndex("by_pair", (q: any) => 
      q.eq("baseCurrency", baseCurrency)
       .eq("targetCurrency", targetCurrency)
    )
    .order("desc")
    .take(1);
  
  if (existingRecords.length === 0) {
    return true;
  }
  
  const lastRecord = existingRecords[0];
  const timeSinceLastRecord = currentTimestamp - lastRecord.timestamp;
  
  // Store based on time intervals
  if (timeSinceLastRecord >= intervals.day) {
    return true; // Store daily records
  }
  
  if (timeSinceLastRecord >= intervals.sixHours) {
    return true; // Store 6-hour records
  }
  
  if (timeSinceLastRecord >= intervals.hour) {
    return true; // Store hourly records
  }
  
  if (timeSinceLastRecord >= intervals.fiveMinutes) {
    return true; // Store 5-minute records
  }
  
  if (timeSinceLastRecord >= intervals.minute) {
    return true; // Store minute records
  }
  
  return false; // Don't store if too recent
}

// Clean up old historical rates to prevent unlimited growth
async function cleanupOldHistoricalRates(
  ctx: any,
  baseCurrency: string,
  targetCurrency: string
): Promise<void> {
  const now = Date.now();
  const retentionPeriods = {
    minuteRecords: 60 * 60 * 1000,      // Keep minute records for 1 hour
    fiveMinuteRecords: 24 * 60 * 60 * 1000,  // Keep 5-min records for 24 hours
    hourlyRecords: 7 * 24 * 60 * 60 * 1000, // Keep hourly records for 7 days
    sixHourRecords: 30 * 24 * 60 * 60 * 1000, // Keep 6-hour records for 30 days
    dailyRecords: 90 * 24 * 60 * 60 * 1000,   // Keep daily records for 90 days
  };
  
  // Delete records older than 90 days (keep only daily records beyond this)
  const cutoffTime = now - retentionPeriods.dailyRecords;
  
  const oldRecords = await ctx.db
    .query("historicalRates")
    .withIndex("by_pair", (q: any) => 
      q.eq("baseCurrency", baseCurrency)
       .eq("targetCurrency", targetCurrency)
    )
    .filter((q: any) => q.lt(q.field("timestamp"), cutoffTime))
    .collect();
  
  // Delete old records in batches to avoid timeouts
  const batchSize = 100;
  for (let i = 0; i < oldRecords.length; i += batchSize) {
    const batch = oldRecords.slice(i, i + batchSize);
    await Promise.all(
      batch.map((record: any) => ctx.db.delete(record._id))
    );
  }
}

// Get historical rates for a currency pair
export const getHistoricalRates = query({
  args: {
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    hours: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("historicalRates"),
    _creationTime: v.number(),
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    rate: v.number(),
    timestamp: v.number(),
  })),
  handler: async (ctx, args) => {
    const hours = args.hours || 24; // Default to 24 hours
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    return await ctx.db
      .query("historicalRates")
      .withIndex("by_pair", (q) => 
        q.eq("baseCurrency", args.baseCurrency)
         .eq("targetCurrency", args.targetCurrency)
      )
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .order("desc")
      .collect();
  },
});

// Get trend data for a currency pair
export const getTrendData = query({
  args: {
    baseCurrency: v.string(),
    targetCurrency: v.string(),
  },
  returns: v.object({
    currentRate: v.optional(v.number()),
    previousRate: v.optional(v.number()),
    change: v.number(),
    changePercent: v.number(),
    trend: v.union(v.literal("up"), v.literal("down"), v.literal("stable")),
    high24h: v.optional(v.number()),
    low24h: v.optional(v.number()),
    volume24h: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    // Get current rate
    const currentRate = await ctx.db
      .query("exchangeRates")
      .withIndex("by_base_currency", (q) => q.eq("baseCurrency", args.baseCurrency))
      .order("desc")
      .first();

    const currentRateValue = currentRate?.rates?.[args.targetCurrency];

    // Get historical rates for the last 24 hours
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
    const historicalRates = await ctx.db
      .query("historicalRates")
      .withIndex("by_pair", (q) => 
        q.eq("baseCurrency", args.baseCurrency)
         .eq("targetCurrency", args.targetCurrency)
      )
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .order("desc")
      .collect();

    if (historicalRates.length === 0) {
      return {
        currentRate: currentRateValue,
        previousRate: undefined,
        change: 0,
        changePercent: 0,
        trend: "stable" as const,
        high24h: currentRateValue,
        low24h: currentRateValue,
        volume24h: undefined,
      };
    }

    const previousRate = historicalRates[0]?.rate;
    const change = currentRateValue && previousRate ? currentRateValue - previousRate : 0;
    const changePercent = previousRate && previousRate !== 0 ? (change / previousRate) * 100 : 0;

    // Calculate 24h high/low
    const rates24h = historicalRates.map(h => h.rate);
    if (currentRateValue) rates24h.push(currentRateValue);
    
    const high24h = Math.max(...rates24h);
    const low24h = Math.min(...rates24h);

    // Determine trend
    let trend: "up" | "down" | "stable" = "stable";
    if (Math.abs(change) > 0.0001) {
      trend = change > 0 ? "up" : "down";
    }

    return {
      currentRate: currentRateValue,
      previousRate,
      change,
      changePercent,
      trend,
      high24h,
      low24h,
      volume24h: undefined, // Not available from this API
    };
  },
});

// NewsData.io API functionality
export const fetchRSSFeed = action({
  args: {
    countryCode: v.string(),
  },
  returns: v.array(v.object({
    id: v.string(),
    title: v.string(),
    summary: v.string(),
    url: v.string(),
    publishedAt: v.string(),
    source: v.string(),
  })),
  handler: async (ctx, args) => {
    // NewsData.io API configuration
    const API_KEY = process.env.CONVEX_NEWSDATA_API_KEY || ""

    if (!API_KEY || API_KEY === "") {
      throw new Error("NewsData.io API key is not set");
    }

    const BASE_URL = "https://newsdata.io/api/1/latest";
    
    // Map country codes to NewsData.io country codes
    const countryMapping = {
      US: "us",
      GB: "gb", 
      EU: "eu",
      KE: "ke",
      NG: "ng",
      ZA: "za",
    };
    
    const countryCode = countryMapping[args.countryCode as keyof typeof countryMapping] || "us";
    
    try {
      // Build query parameters - NewsData.io API format
      const params = new URLSearchParams({
        category: "business",
        language: "en",
        size: "5", // Start with smaller size
      });
      
      // Add country only if it's not the default
      if (countryCode !== "us") {
        params.append("country", countryCode);
      }
      
      const url = `${BASE_URL}?${params.toString()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-ACCESS-KEY': API_KEY,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`NewsData.io API returned status ${response.status}`);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        console.warn("Invalid response format from NewsData.io API");
        return [];
      }
      
      // Transform NewsData.io response to our format
      const newsItems = data.results.map((article: any, index: number) => ({
        id: article.article_id || `news-${index}`,
        title: article.title || "",
        summary: article.description || article.content?.substring(0, 150) + "..." || "",
        url: article.link || "",
        publishedAt: article.pubDate || new Date().toISOString(),
        source: article.source_name || "News Source",
      }));
      
      // Filter out items without required fields
      const validNews = newsItems.filter((item: any) => 
        item.title && item.url && item.title.trim() !== ""
      );
      
      // Sort by publication date (newest first) and limit to 20 items
      return validNews
        .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 20);
        
    } catch (error) {
      console.error("Error fetching news from NewsData.io API:", error);
      return [];
    }
  },
});

export const updateUserNewsCountry = mutation({
  args: {
    userId: v.id("users"),
    countryCode: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existingPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingPrefs) {
      await ctx.db.patch(existingPrefs._id, {
        newsCountry: args.countryCode,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        watchedPairs: [],
        newsCountry: args.countryCode,
      });
    }
    return null;
  },
});

export const getUserNewsCountry = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    
    return prefs?.newsCountry || null;
  },
});

// Cron job to clean up old historical rates across all pairs
export const cleanupAllHistoricalRates = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const cutoffTime = now - (90 * 24 * 60 * 60 * 1000); // 90 days
    
    // Get all unique currency pairs
    const allPairs = await ctx.db
      .query("historicalRates")
      .withIndex("by_timestamp", (q: any) => q.lt("timestamp", cutoffTime))
      .collect();
    
    // Group by currency pair to avoid duplicates
    const pairMap = new Map<string, any[]>();
    for (const record of allPairs) {
      const pairKey = `${record.baseCurrency}-${record.targetCurrency}`;
      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, []);
      }
      pairMap.get(pairKey)!.push(record);
    }
    
    // Delete old records for each pair
    const batchSize = 50;
    for (const [pairKey, records] of pairMap) {
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await Promise.all(
          batch.map((record: any) => ctx.db.delete(record._id))
        );
      }
    }
    
    return null;
  },
});

// Manual cleanup function for testing and maintenance
export const manualCleanup = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Run the cleanup function
    await ctx.runMutation(internal.forex.cleanupAllHistoricalRates, {});
    return null;
  },
});

// Fetch historical daily data from external API for longer timeframes
export const fetchHistoricalDailyRates = action({
  args: {
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    startDate: v.string(), // Format: "YYYY-MM-DD"
    endDate: v.string(),   // Format: "YYYY-MM-DD"
  },
  returns: v.array(v.object({
    date: v.string(),
    rate: v.number(),
  })),
  handler: async (ctx, args) => {
    try {
      const API_KEY = process.env.CONVEX_EXCHANGERATE_API_KEY;
      if (!API_KEY) {
        throw new Error("Exchange Rate API key not configured");
      }

      const results = [];
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);
      
      // Fetch daily data for each date in range
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        const day = date.getDate();
        
        const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/history/${args.baseCurrency}/${year}/${month}/${day}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch data for ${year}-${month}-${day}: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        if (data.result === "success" && data.conversion_rates && data.conversion_rates[args.targetCurrency]) {
          results.push({
            date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            rate: data.conversion_rates[args.targetCurrency],
          });
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return results;
    } catch (error) {
      console.error("Failed to fetch historical daily rates:", error);
      throw error;
    }
  },
});

// Get historical data optimized for different timeframes
export const getOptimizedHistoricalRates = query({
  args: {
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    timeFrame: v.union(v.literal("1D"), v.literal("1W"), v.literal("1M"), v.literal("3M"), v.literal("1Y")),
  },
  returns: v.array(v.object({
    date: v.string(),
    rate: v.number(),
    timestamp: v.number(),
  })),
  handler: async (ctx, args) => {
    const now = Date.now();
    let cutoffTime: number;
    
    switch (args.timeFrame) {
      case "1D": {
        // Use stored hourly/minute data for 1D
        cutoffTime = now - (24 * 60 * 60 * 1000);
        const hourlyData = await ctx.db
          .query("historicalRates")
          .withIndex("by_pair", (q) => 
            q.eq("baseCurrency", args.baseCurrency)
             .eq("targetCurrency", args.targetCurrency)
          )
          .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
          .order("asc")
          .collect();
        
        return hourlyData.map(rate => ({
          date: new Date(rate.timestamp).toISOString().split('T')[0],
          rate: rate.rate,
          timestamp: rate.timestamp,
        }));
      }
        
      case "1W":
      case "1M":
      case "3M":
      case "1Y":
        // For longer timeframes, use daily data from external API
        // This would need to be called from the frontend with the action
        // For now, return empty array - frontend should call fetchHistoricalDailyRates
        return [];
        
      default:
        return [];
    }
  },
});



