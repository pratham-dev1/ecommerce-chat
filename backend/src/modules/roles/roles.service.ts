import { Role, type RoleInstance } from "./role.model";

export class RolesService {
  async listRoles() {
    const roles = await Role.findAll({
      order: [["id", "ASC"]],
    });

    return roles.map((role) => this.serializeRole(role));
  }

  private serializeRole(role: RoleInstance) {
    return {
      id: Number(role.id),
      name: role.name,
    };
  }
}
