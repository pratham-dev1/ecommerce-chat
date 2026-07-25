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

export async function initializeRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

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
