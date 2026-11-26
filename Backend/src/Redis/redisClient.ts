import { Redis } from "ioredis";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Shared Redis Instance

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    // If Redis is down, retry with exponential backoff (up to 2 seconds)
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  lazyConnect: false, // Start connecting immediately
});

// Event listeners for clean operational visibility
redis.on("connect", () => {
  console.log(`[Redis] 🟢 Successfully connected to Redis instance at ${redisUrl.split("@").pop()}`);
});
redis.on("error", (err) => {
  console.warn(`[Redis] ⚠️ Redis connection warning: ${err.message}`);
});