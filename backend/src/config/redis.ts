import { createClient } from "redis";

import { env } from "./env";

export const redisClient = createClient({
  socket: {
    reconnectStrategy: false,
  },
  url: env.redisUrl,
});

redisClient.on("error", (error) => {
  console.warn("Redis client error", error);
});

// Connect as soon as this module loads, not when initializeRedis() is explicitly called,
// so anything that imports redisClient at import-time (e.g. loginRateLimiter's RedisStore) doesn't race a still-closed client.
const connectionPromise = redisClient.connect();

export async function initializeRedis() {
  try {
    await connectionPromise;
    await redisClient.ping();
    console.log("Redis connected");
  } catch (error) {
    console.warn("Redis unavailable; cache disabled", error);
  }
}

export async function closeRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}
