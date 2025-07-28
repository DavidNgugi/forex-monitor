import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userPreferences: defineTable({
    userId: v.id("users"),
    watchedPairs: v.array(v.object({
      id: v.string(),
      baseCurrency: v.string(),
      targetCurrency: v.string(),
      order: v.number(),
    })),
    newsCountry: v.optional(v.string()),
    youtubeStreams: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      channelId: v.string(),
      videoId: v.string(),
    }))),
  }).index("by_user", ["userId"]),
  
  alerts: defineTable({
    userId: v.id("users"),
    pairId: v.string(),
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    targetRate: v.number(),
    condition: v.union(v.literal("above"), v.literal("below")),
    isActive: v.boolean(),
    triggered: v.boolean(),
  }).index("by_user", ["userId"])
    .index("by_user_and_pair", ["userId", "pairId"])
    .index("by_currency_pair", ["baseCurrency", "targetCurrency"]),

  exchangeRates: defineTable({
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    rate: v.number(),
    timestamp: v.number(),
  }).index("by_pair", ["baseCurrency", "targetCurrency"])
    .index("by_timestamp", ["timestamp"]),

  historicalRates: defineTable({
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    rate: v.number(),
    timestamp: v.number(),
  }).index("by_pair", ["baseCurrency", "targetCurrency"])
    .index("by_timestamp", ["timestamp"])
    .index("by_pair_and_timestamp", ["baseCurrency", "targetCurrency", "timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
