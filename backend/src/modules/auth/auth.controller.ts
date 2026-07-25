import type { Request, Response } from "express";

import { AppError } from "../../common/errors/AppError";
import {
  accessTokenCookieName,
  getAccessTokenCookieOptions,
  getClearAuthCookieOptions,
  getRefreshTokenCookieOptions,
  refreshTokenCookieName,
} from "./auth.cookie";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

const authService = new AuthService();
const usersService = new UsersService();

export async function loginController(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.login(req.body);

  res.cookie(accessTokenCookieName, accessToken, getAccessTokenCookieOptions());
  res.cookie(refreshTokenCookieName, refreshToken, getRefreshTokenCookieOptions());
  res.status(200).json({ user });
}

export async function refreshController(req: Request, res: Response) {
  const refreshToken =
    typeof req.cookies?.[refreshTokenCookieName] === "string"
      ? req.cookies[refreshTokenCookieName]
      : undefined;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401, "REFRESH_TOKEN_REQUIRED");
  }

  const { accessToken, user } = await authService.refreshSession(refreshToken);

  res.cookie(accessTokenCookieName, accessToken, getAccessTokenCookieOptions());
  res.status(200).json({ user });
}

export async function logoutController(_req: Request, res: Response) {
  res.clearCookie(accessTokenCookieName, getClearAuthCookieOptions());
  res.clearCookie(refreshTokenCookieName, getClearAuthCookieOptions());
  res.status(204).send();
}

export async function registerController(req: Request, res: Response) {
  const user = await usersService.createUser(req.body);
  res.status(201).json(user);
}
