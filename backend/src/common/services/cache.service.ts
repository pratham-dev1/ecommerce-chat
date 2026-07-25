import { redisClient } from "../../config/redis";

type CacheKeyPart = boolean | number | string;

export class CacheService {
  createKey(...parts: CacheKeyPart[]) {
    return parts.map((part) => String(part)).join(":");
  }

  async getJson<T>(key: string) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const cachedValue = await redisClient.get(key);

      if (!cachedValue) {
        return null;
      }

      return JSON.parse(cachedValue) as T;
    } catch (error) {
      console.warn(`Cache get failed for key "${key}"`, error);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.warn(`Cache set failed for key "${key}"`, error);
    }
  }

  async deleteKey(key: string) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      await redisClient.del(key);
    } catch (error) {
      console.warn(`Cache delete failed for key "${key}"`, error);
    }
  }

  async deleteByPattern(pattern: string) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const keys: string[] = [];

      for await (const key of redisClient.scanIterator({
        MATCH: pattern,
      })) {
        keys.push(String(key));
      }

      if (keys.length === 0) {
        return;
      }

      await redisClient.del(keys);
    } catch (error) {
      console.warn(`Cache delete by pattern failed for pattern "${pattern}"`, error);
    }
  }

  private isAvailable() {
    return redisClient.isReady;
  }
}
