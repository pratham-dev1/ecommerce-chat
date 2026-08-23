import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import { redisClient } from "../../config/redis";
import { AppError } from "../errors/AppError";

export const loginRateLimiter = rateLimit({
  legacyHeaders: false,
  limit: 5,
  keyGenerator: (req) => {
    console.log(`Login attempt from IP: ${req.ip}`);
    return ipKeyGenerator(req.ip ?? "");
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  store: new RedisStore({
    prefix: "login-rl:",
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 5 * 60 * 1000,
  handler: (_req, _res, next) => {
    next(new AppError("Too many login attempts, please try again later", 429, "LOGIN_RATE_LIMITED"));
  },
});
