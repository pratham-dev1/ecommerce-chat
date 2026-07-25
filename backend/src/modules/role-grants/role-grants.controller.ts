import type { Request, Response } from "express";

import { RoleGrantsService } from "./role-grants.service";

const roleGrantsService = new RoleGrantsService();

export async function createRoleGrantController(req: Request, res: Response) {
  const roleGrant = await roleGrantsService.createRoleGrant(req.body);
  res.status(201).json(roleGrant);
}

export async function listRoleGrantsController(_req: Request, res: Response) {
  const roleGrants = await roleGrantsService.listRoleGrants();
  res.status(200).json(roleGrants);
}

export async function getRoleGrantController(req: Request, res: Response) {
  const roleGrant = await roleGrantsService.getRoleGrantById(
    Number(req.params.roleGrantId),
  );

  res.status(200).json(roleGrant);
}

export async function updateRoleGrantController(req: Request, res: Response) {
  const roleGrant = await roleGrantsService.updateRoleGrant(
    Number(req.params.roleGrantId),
    req.body,
  );

  res.status(200).json(roleGrant);
}

export async function deleteRoleGrantController(req: Request, res: Response) {
  await roleGrantsService.deleteRoleGrant(Number(req.params.roleGrantId));
  res.status(204).send();
}
