import { AppError } from "../../common/errors/AppError";
import { User } from "../users/user.model";
import { UsersService } from "../users/users.service";
import type { LoginInput } from "./auth.validation";
import { verifyPassword } from "./password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./token";

export class AuthService {
  private readonly usersService = new UsersService();

  async login(input: LoginInput) {
    const user = await User.findOne({
      where: {
        email: input.email,
      },
    });

    if (!user?.password) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await verifyPassword(input.password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    return {
      accessToken: signAccessToken({
        email: user.email,
        userId: user.id,
      }),
      refreshToken: signRefreshToken({
        email: user.email,
        userId: user.id,
      }),
      user: await this.usersService.getUserById(Number(user.id)),
    };
  }

  async refreshSession(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const user = await User.findByPk(Number(payload.sub));

    if (!user) {
      throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    return {
      accessToken: signAccessToken({
        email: user.email,
        userId: user.id,
      }),
      user: await this.usersService.getUserById(Number(user.id)),
    };
  }
}
