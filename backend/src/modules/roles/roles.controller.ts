import type { Request, Response } from "express";

import { RolesService } from "./roles.service";

const rolesService = new RolesService();

export async function listRolesController(_req: Request, res: Response) {
  const roles = await rolesService.listRoles();
  res.status(200).json(roles);
}
