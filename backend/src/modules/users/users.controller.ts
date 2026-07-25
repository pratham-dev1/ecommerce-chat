import type { Request, Response } from "express";

import { AppError } from "../../common/errors/AppError";
import { UsersService } from "./users.service";
import { listUsersQuerySchema } from "./users.validation";

const usersService = new UsersService();

export async function createUserController(req: Request, res: Response) {
  const user = await usersService.createUser(req.body);
  res.status(201).json(user);
}

export async function listUsersController(req: Request, res: Response) {
  const query = listUsersQuerySchema.parse(req.query);
  const users = await usersService.listUsers(query);
  res.status(200).json(users);
}

export async function getCurrentUserController(req: Request, res: Response) {
  if (!req.userId) {
    throw new AppError("Current user is not available", 401, "AUTH_REQUIRED");
  }

  const user = await usersService.getUserById(Number(req.userId));
  res.status(200).json(user);
}

export async function getUserController(req: Request, res: Response) {
  const user = await usersService.getUserById(Number(req.params.userId));
  res.status(200).json(user);
}

export async function updateUserController(req: Request, res: Response) {
  const user = await usersService.updateUser(Number(req.params.userId), req.body);
  res.status(200).json(user);
}

export async function deleteUserController(req: Request, res: Response) {
  await usersService.deleteUser(Number(req.params.userId));
  res.status(204).send();
}
