import type { CookieOptions } from "express";

import { env } from "../../config/env";

export const accessTokenCookieName = "access_token";
export const refreshTokenCookieName = "refresh_token";

const accessTokenCookieMaxAge = 15 * 60 * 1000;
const refreshTokenCookieMaxAge = 7 * 24 * 60 * 60 * 1000;

export function getAccessTokenCookieOptions(): CookieOptions {
  return {
    ...getBaseCookieOptions(),
    maxAge: accessTokenCookieMaxAge,
  };
}

export function getRefreshTokenCookieOptions(): CookieOptions {
  return {
    ...getBaseCookieOptions(),
    maxAge: refreshTokenCookieMaxAge,
  };
}

export function getClearAuthCookieOptions(): CookieOptions {
  return getBaseCookieOptions();
}

function getBaseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    secure: env.nodeEnv === "production",
  };
}
