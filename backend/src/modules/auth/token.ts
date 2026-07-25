import jwt from "jsonwebtoken";

import { env } from "../../config/env";

export type AccessTokenPayload = {
  email: string;
  sub: string;
  type: "access";
};

export type RefreshTokenPayload = {
  email: string;
  sub: string;
  type: "refresh";
};

const accessTokenExpiresIn = "15m";
const refreshTokenExpiresIn = "7d";

export function signAccessToken(input: { email: string; userId: number | string }) {
  return jwt.sign(
    {
      email: input.email,
      type: "access",
    },
    env.jwtAccessSecret,
    {
      expiresIn: accessTokenExpiresIn,
      subject: String(input.userId),
    },
  );
}

export function signRefreshToken(input: { email: string; userId: number | string }) {
  return jwt.sign(
    {
      email: input.email,
      type: "refresh",
    },
    env.jwtRefreshSecret,
    {
      expiresIn: refreshTokenExpiresIn,
      subject: String(input.userId),
    },
  );
}

export function verifyAccessToken(token: string) {
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);

    if (!isAccessTokenPayload(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    const payload = jwt.verify(token, env.jwtRefreshSecret);

    if (!isRefreshTokenPayload(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function isAccessTokenPayload(payload: unknown): payload is AccessTokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    "sub" in payload &&
    "type" in payload &&
    typeof payload.email === "string" &&
    typeof payload.sub === "string" &&
    payload.type === "access"
  );
}

function isRefreshTokenPayload(payload: unknown): payload is RefreshTokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    "sub" in payload &&
    "type" in payload &&
    typeof payload.email === "string" &&
    typeof payload.sub === "string" &&
    payload.type === "refresh"
  );
}
