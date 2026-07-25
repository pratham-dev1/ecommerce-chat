import type { RequestHandler } from "express";

import { accessTokenCookieName } from "../../modules/auth/auth.cookie";
import { verifyAccessToken } from "../../modules/auth/token";
import { AppError } from "../errors/AppError";

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorizationHeader = req.headers.authorization;
  console.log(authorizationHeader)
  const bearerToken = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : undefined;
  console.log(bearerToken)
  const cookieToken =
    typeof req.cookies?.[accessTokenCookieName] === "string"
      ? req.cookies[accessTokenCookieName]
      : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    next(new AppError("Invalid or expired token", 401, "INVALID_TOKEN"));
    return;
  }

  req.userId = payload.sub;
  next();
};
