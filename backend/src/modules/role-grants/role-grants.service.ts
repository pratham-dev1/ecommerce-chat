import { AppError } from "../../common/errors/AppError";
import { Role } from "../roles/role.model";
import { RoleGrant, type RoleGrantInstance } from "./role-grant.model";
import type {
  CreateRoleGrantInput,
  UpdateRoleGrantInput,
} from "./role-grants.validation";

export class RoleGrantsService {
  async createRoleGrant(input: CreateRoleGrantInput) {
    const normalizedInput = this.normalizeCreateRoleGrantInput(input);
    await this.ensureRoleExists(normalizedInput.roleId);

    const roleGrant = await RoleGrant.create(normalizedInput);

    return this.serializeRoleGrant(roleGrant);
  }

  async listRoleGrants() {
    const roleGrants = await RoleGrant.findAll({
      order: [["id", "ASC"]],
    });

    return roleGrants.map((roleGrant) => this.serializeRoleGrant(roleGrant));
  }

  async getRoleGrantById(roleGrantId: number) {
    const roleGrant = await RoleGrant.findByPk(roleGrantId);

    if (!roleGrant) {
      throw new AppError("Role grant not found", 404, "ROLE_GRANT_NOT_FOUND");
    }

    return this.serializeRoleGrant(roleGrant);
  }

  async updateRoleGrant(roleGrantId: number, input: UpdateRoleGrantInput) {
    const roleGrant = await RoleGrant.findByPk(roleGrantId);

    if (!roleGrant) {
      throw new AppError("Role grant not found", 404, "ROLE_GRANT_NOT_FOUND");
    }

    const normalizedInput = this.normalizeRoleGrantInput(input);

    if (normalizedInput.roleId !== undefined) {
      await this.ensureRoleExists(normalizedInput.roleId);
    }

    await roleGrant.update(normalizedInput);

    return this.serializeRoleGrant(roleGrant);
  }

  async deleteRoleGrant(roleGrantId: number) {
    const roleGrant = await RoleGrant.findByPk(roleGrantId);

    if (!roleGrant) {
      throw new AppError("Role grant not found", 404, "ROLE_GRANT_NOT_FOUND");
    }

    await roleGrant.destroy();
  }

  private async ensureRoleExists(roleId: number) {
    const role = await Role.findByPk(roleId);

    if (!role) {
      throw new AppError("Role not found", 404, "ROLE_NOT_FOUND");
    }
  }

  private normalizeCreateRoleGrantInput(input: CreateRoleGrantInput) {
    return {
      name: input.name.trim(),
      roleId: input.roleId,
    };
  }

  private normalizeRoleGrantInput(input: UpdateRoleGrantInput) {
    return {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.roleId !== undefined ? { roleId: input.roleId } : {}),
    };
  }

  private serializeRoleGrant(roleGrant: RoleGrantInstance) {
    return {
      createdAt: roleGrant.createdAt,
      id: Number(roleGrant.id),
      name: roleGrant.name,
      roleId: Number(roleGrant.roleId),
      updatedAt: roleGrant.updatedAt,
    };
  }
}
