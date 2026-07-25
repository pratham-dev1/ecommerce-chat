import type { RequestHandler } from "express";

import { RoleGrant } from "../../modules/role-grants/role-grant.model";
import { UserRoleGroup } from "../../modules/users/user-role-group.model";
import { AppError } from "../errors/AppError";

export const activeRoleHeaderName = "x-active-role-id";

export function requireGrant(grant: string): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
      }

      const activeRoleId = getActiveRoleId(req.headers[activeRoleHeaderName]);

      if (!activeRoleId) {
        throw new AppError(
          "Active role is required",
          400,
          "ACTIVE_ROLE_REQUIRED",
        );
      }

      const userRole = await UserRoleGroup.findOne({
        where: {
          roleId: activeRoleId,
          userId: Number(req.userId),
        },
      });

      if (!userRole) {
        throw new AppError(
          "You cannot use this role",
          403,
          "ACTIVE_ROLE_NOT_ALLOWED",
        );
      }

      const roleGrant = await RoleGrant.findOne({
        where: {
          name: grant,
          roleId: activeRoleId,
        },
      });

      if (!roleGrant) {
        throw new AppError(
          "You do not have permission to perform this action",
          403,
          "GRANT_REQUIRED",
        );
      }

      req.activeRoleId = activeRoleId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function getActiveRoleId(headerValue: string | string[] | undefined) {
  const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (!value) {
    return null;
  }

  const roleId = Number(value);

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return null;
  }

  return roleId;
}
