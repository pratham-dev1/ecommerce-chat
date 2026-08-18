import IORedis from "ioredis";

import { env } from "./env";

// BullMQ's blocking commands require maxRetriesPerRequest: null on the connection.
export const queueConnection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

queueConnection.on("error", (error) => {
  console.warn("BullMQ Redis connection error", error);
});
