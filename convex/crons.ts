import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup of old historical rates daily at 2 AM
crons.cron(
  "cleanup_historical_rates",
  "0 2 * * *", // Daily at 2 AM
  internal.forex.cleanupAllHistoricalRates,
  {}
);

export default crons; 