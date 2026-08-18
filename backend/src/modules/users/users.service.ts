import { cast, col, Op, Order, where, WhereOptions } from "sequelize";

import { AppError } from "../../common/errors/AppError";
import { CacheService } from "../../common/services/cache.service";
import { hashPassword } from "../auth/password";
import { RoleGrant, RoleGrantInstance } from "../role-grants/role-grant.model";
import { Role, RoleInstance } from "../roles/role.model";
import { User, UserAttributes, UserInstance } from "./user.model";
import { UserRoleGroup } from "./user-role-group.model";
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from "./users.validation";

const usersCacheVersion = "v1";
const usersCountCacheTtlSeconds = 60 * 5;
const userDetailCacheTtlSeconds = 60 * 10;
const usersCountCacheKeyPattern = `users:${usersCacheVersion}:count:*`;

type SerializedUserRole = {
  grants: string[];
  id: number;
  name: string;
};

type SerializedUser = {
  age: number | null;
  createdAt: string;
  deletedAt: string | null;
  dob: string | null;
  email: string;
  grants: string[];
  id: number;
  name: string;
  roleIds: number[];
  roles: SerializedUserRole[];
  updatedAt: string;
  username: string;
};

type RoleWithGrants = RoleInstance & {
  grants?: RoleGrantInstance[];
};

type UserWithRoles = UserInstance & {
  roles?: RoleWithGrants[];
};

export class UsersService {
  private readonly cacheService = new CacheService();

  async createUser(input: CreateUserInput) {
    await this.ensureEmailAndUsernameAreAvailable(input.email, input.username);
    const roleIds = await this.resolveCreateUserRoleIds(input.roleIds);

    const user = await User.create({
      age: input.age ?? null,
      dob: input.dob ?? null,
      email: input.email,
      name: input.name,
      password: await hashPassword(input.password),
      username: input.username,
    });

    await this.replaceUserRoles(Number(user.id), roleIds);
    await this.cacheService.deleteByPattern(usersCountCacheKeyPattern);

    return this.getUserById(Number(user.id));
  }

  async listUsers(input: ListUsersQuery) {
    const where = this.toListUsersWhere(input);
    const [count, rows] = await Promise.all([
      this.countUsers(input, where),
      User.findAll({
        limit: input.pageSize,
        offset: (input.page - 1) * input.pageSize,
        order: this.toListUsersOrder(input),
        where,
      }),
    ]);

    return {
      data: rows.map((user) => this.serializeUser(user)),
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        total: count,
        totalPages: Math.ceil(count / input.pageSize),
      },
    };
  }

  async getUserById(userId: number) {
    const userDetailCacheKey = this.cacheService.createKey(
      "users",
      usersCacheVersion,
      "detail",
      userId,
    );
    const cachedUser = await this.cacheService.getJson<SerializedUser>(userDetailCacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await User.findByPk(userId, {
      include: this.getUserInclude(),
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const serializedUser = this.serializeUser(user);

    await this.cacheService.setJson(
      userDetailCacheKey,
      serializedUser,
      userDetailCacheTtlSeconds,
    );

    return serializedUser;
  }

  async updateUser(userId: number, input: UpdateUserInput) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    await this.ensureEmailAndUsernameAreAvailable(input.email, input.username, userId);
    const roleIds =
      input.roleIds !== undefined
        ? await this.normalizeAndEnsureRoleIds(input.roleIds)
        : undefined;

    await user.update(await this.toUpdatePayload(input));

    if (roleIds !== undefined) {
      await this.replaceUserRoles(userId, roleIds);
    }

    await this.deleteUserDetailCache(userId);
    await this.cacheService.deleteByPattern(usersCountCacheKeyPattern);

    return this.getUserById(userId);
  }

  async listAllUsersForEmail() {
    const users = await User.findAll({
      attributes: ["id", "name", "email"],
    });

    return users.map((user) => ({
      email: user.email,
      id: Number(user.id),
      name: user.name,
    }));
  }

  async deleteUser(userId: number) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    await user.destroy();
    await this.deleteUserDetailCache(userId);
    await this.cacheService.deleteByPattern(usersCountCacheKeyPattern);
  }

  private async countUsers(
    input: ListUsersQuery,
    where: WhereOptions<UserAttributes> | undefined,
  ) {
    const cacheKey = this.getUsersCountCacheKey(input);
    const cachedCount = await this.cacheService.getJson<number>(cacheKey);

    if (cachedCount !== null) {
      return cachedCount;
    }

    const count = await User.count({ where });
    await this.cacheService.setJson(cacheKey, count, usersCountCacheTtlSeconds);

    return count;
  }

  private getUsersCountCacheKey(input: ListUsersQuery) {
    const parts: Array<boolean | number | string> = ["users", usersCacheVersion, "count"];
    const countFields = [
      ["search", input.search],
      ["id", input.id],
      ["name", input.name],
      ["username", input.username],
      ["email", input.email],
      ["age", input.age],
      ["dob", input.dob],
      ["filterField", input.filterField],
      ["filterOperator", input.filterOperator],
      ["filterValue", input.filterValue],
    ] as const;

    for (const [key, value] of countFields) {
      if (value !== undefined && value !== "") {
        parts.push(key, value);
      }
    }

    if (parts.length === 3) {
      parts.push("all");
    }

    return this.cacheService.createKey(...parts);
  }

  private async normalizeAndEnsureRoleIds(roleIds: number[] = []) {
    const uniqueRoleIds = [...new Set(roleIds)];

    if (uniqueRoleIds.length === 0) {
      return [];
    }

    const rolesCount = await Role.count({
      where: {
        id: uniqueRoleIds,
      },
    });

    if (rolesCount !== uniqueRoleIds.length) {
      throw new AppError("One or more roles were not found", 404, "ROLE_NOT_FOUND");
    }

    return uniqueRoleIds;
  }

  private toListUsersOrder(input: ListUsersQuery): Order {
    const direction = input.sortDirection === "desc" ? "DESC" : "ASC";

    if (input.sortField === "id") {
      return [["id", direction]];
    }

    return [
      [input.sortField, direction],
      ["id", "ASC"],
    ];
  }

  private toListUsersWhere(input: ListUsersQuery): WhereOptions<UserAttributes> | undefined {
    const conditions: WhereOptions<UserAttributes>[] = [];
    const searchCondition = this.toSearchCondition(input.search);
    const fieldSearchCondition = this.toFieldSearchCondition(input);
    const filterCondition = this.toFilterCondition(input);

    if (searchCondition) {
      conditions.push(searchCondition);
    }

    if (fieldSearchCondition) {
      conditions.push(fieldSearchCondition);
    }

    if (filterCondition) {
      conditions.push(filterCondition);
    }

    if (conditions.length === 0) {
      return undefined;
    }

    return {
      [Op.and]: conditions,
    } as WhereOptions<UserAttributes>;
  }

  private toFieldSearchCondition(input: ListUsersQuery): WhereOptions<UserAttributes> | undefined {
    const conditions: WhereOptions<UserAttributes>[] = [];

    if (input.id !== undefined) {
      conditions.push({ id: input.id });
    }

    if (input.name) {
      conditions.push({ name: { [Op.iLike]: `%${input.name}%` } });
    }

    if (input.username) {
      conditions.push({ username: { [Op.iLike]: `%${input.username}%` } });
    }

    if (input.email) {
      conditions.push({ email: { [Op.iLike]: `%${input.email}%` } });
    }

    if (input.age !== undefined) {
      conditions.push({ age: input.age });
    }

    if (input.dob) {
      conditions.push({ dob: input.dob });
    }

    if (conditions.length === 0) {
      return undefined;
    }

    return {
      [Op.and]: conditions,
    } as WhereOptions<UserAttributes>;
  }

  private toSearchCondition(search?: string): WhereOptions<UserAttributes> | undefined {
    if (!search) {
      return undefined;
    }

    const pattern = `%${search}%`;
    const numericSearch = Number(search);
    const textConditions: WhereOptions<UserAttributes>[] = [
      { name: { [Op.iLike]: pattern } },
      { username: { [Op.iLike]: pattern } },
      { email: { [Op.iLike]: pattern } },
      where(cast(col("dob"), "TEXT"), { [Op.iLike]: pattern }) as WhereOptions<UserAttributes>,
    ];

    if (Number.isInteger(numericSearch)) {
      textConditions.push({ id: numericSearch }, { age: numericSearch });
    }

    return {
      [Op.or]: textConditions,
    } as WhereOptions<UserAttributes>;
  }

  private toFilterCondition(input: ListUsersQuery): WhereOptions<UserAttributes> | undefined {
    if (!input.filterField || !input.filterOperator) {
      return undefined;
    }

    const field = input.filterField;
    const operator = input.filterOperator;
    const value = input.filterValue;

    if (operator === "isEmpty") {
      if (field === "age") {
        return { age: { [Op.is]: null } } as WhereOptions<UserAttributes>;
      }

      return {
        [Op.or]: [{ [field]: { [Op.is]: null } }, { [field]: "" }],
      } as WhereOptions<UserAttributes>;
    }

    if (operator === "isNotEmpty") {
      if (field === "age") {
        return { age: { [Op.not]: null } } as WhereOptions<UserAttributes>;
      }

      return {
        [Op.and]: [{ [field]: { [Op.not]: null } }, { [field]: { [Op.ne]: "" } }],
      } as WhereOptions<UserAttributes>;
    }

    if (!value) {
      return undefined;
    }

    if (field === "id" || field === "age") {
      return this.toNumericFilterCondition(field, operator, value);
    }

    if (field === "dob") {
      return this.toComparableFilterCondition(field, operator, value);
    }

    return this.toTextFilterCondition(field, operator, value);
  }

  private toNumericFilterCondition(
    field: "age" | "id",
    operator: ListUsersQuery["filterOperator"],
    value: string,
  ): WhereOptions<UserAttributes> | undefined {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return undefined;
    }

    const operatorMap = {
      "!=": Op.ne,
      "<": Op.lt,
      "<=": Op.lte,
      "=": Op.eq,
      ">": Op.gt,
      ">=": Op.gte,
      doesNotEqual: Op.ne,
      equals: Op.eq,
      is: Op.eq,
      not: Op.ne,
    } as const;
    const sequelizeOperator = operatorMap[operator as keyof typeof operatorMap];

    if (!sequelizeOperator) {
      return undefined;
    }

    return {
      [field]: {
        [sequelizeOperator]: numericValue,
      },
    } as WhereOptions<UserAttributes>;
  }

  private toComparableFilterCondition(
    field: "dob",
    operator: ListUsersQuery["filterOperator"],
    value: string,
  ): WhereOptions<UserAttributes> | undefined {
    const operatorMap = {
      "!=": Op.ne,
      "<": Op.lt,
      "<=": Op.lte,
      "=": Op.eq,
      ">": Op.gt,
      ">=": Op.gte,
      after: Op.gt,
      before: Op.lt,
      doesNotEqual: Op.ne,
      equals: Op.eq,
      is: Op.eq,
      not: Op.ne,
      onOrAfter: Op.gte,
      onOrBefore: Op.lte,
    } as const;
    const sequelizeOperator = operatorMap[operator as keyof typeof operatorMap];

    if (!sequelizeOperator) {
      return this.toTextFilterCondition(field, operator, value);
    }

    return {
      [field]: {
        [sequelizeOperator]: value,
      },
    } as WhereOptions<UserAttributes>;
  }

  private toTextFilterCondition(
    field: "dob" | "email" | "name" | "username",
    operator: ListUsersQuery["filterOperator"],
    value: string,
  ): WhereOptions<UserAttributes> | undefined {
    switch (operator) {
      case "contains":
        return this.toTextLikeCondition(field, Op.iLike, `%${value}%`);
      case "doesNotContain":
        return this.toTextLikeCondition(field, Op.notILike, `%${value}%`);
      case "endsWith":
        return this.toTextLikeCondition(field, Op.iLike, `%${value}`);
      case "equals":
      case "=":
      case "is":
        return this.toTextLikeCondition(field, Op.iLike, value);
      case "doesNotEqual":
      case "!=":
      case "not":
        return this.toTextLikeCondition(field, Op.notILike, value);
      case "startsWith":
        return this.toTextLikeCondition(field, Op.iLike, `${value}%`);
      default:
        return undefined;
    }
  }

  private toTextLikeCondition(
    field: "dob" | "email" | "name" | "username",
    operator: typeof Op.iLike | typeof Op.notILike,
    value: string,
  ): WhereOptions<UserAttributes> {
    if (field === "dob") {
      return where(cast(col("dob"), "TEXT"), { [operator]: value }) as WhereOptions<UserAttributes>;
    }

    return { [field]: { [operator]: value } } as WhereOptions<UserAttributes>;
  }

  private async resolveCreateUserRoleIds(roleIds?: number[]) {
    if (roleIds !== undefined) {
      return this.normalizeAndEnsureRoleIds(roleIds);
    }

    const defaultRole = await Role.findOne({
      where: {
        name: "User",
      },
    });

    if (!defaultRole) {
      throw new AppError(
        "Default user role was not found",
        500,
        "DEFAULT_USER_ROLE_NOT_FOUND",
      );
    }

    return [Number(defaultRole.id)];
  }

  private async replaceUserRoles(userId: number, roleIds: number[]) {
    await UserRoleGroup.destroy({
      where: {
        userId,
      },
    });

    if (roleIds.length > 0) {
      await UserRoleGroup.bulkCreate(
        roleIds.map((roleId) => ({
          roleId,
          userId,
        })),
      );
    }

    await this.deleteUserDetailCache(userId);
  }

  private async deleteUserDetailCache(userId: number) {
    await this.cacheService.deleteKey(
      this.cacheService.createKey("users", usersCacheVersion, "detail", userId),
    );
  }

  private async ensureEmailAndUsernameAreAvailable(
    email?: string,
    username?: string,
    currentUserId?: number,
  ) {
    const checks = [];

    if (email) {
      checks.push({ email });
    }

    if (username) {
      checks.push({ username });
    }

    if (checks.length === 0) {
      return;
    }

    const existingUser = await User.findOne({
      paranoid: false,
      where: {
        [Op.and]: [
          { [Op.or]: checks },
          ...(currentUserId ? [{ id: { [Op.ne]: currentUserId } }] : []),
        ],
      },
    });

    if (!existingUser) {
      return;
    }

    if (email && existingUser.email === email) {
      throw new AppError("Email is already in use", 409, "EMAIL_ALREADY_EXISTS");
    }

    throw new AppError("Username is already in use", 409, "USERNAME_ALREADY_EXISTS");
  }

  private async toUpdatePayload(input: UpdateUserInput) {
    return {
      ...(input.age !== undefined ? { age: input.age } : {}),
      ...(input.dob !== undefined ? { dob: input.dob } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.password !== undefined ? { password: await hashPassword(input.password) } : {}),
      ...(input.username !== undefined ? { username: input.username } : {}),
    };
  }

  private serializeUser(user: UserInstance): SerializedUser {
    const roles = this.getIncludedRoles(user);
    const grants = roles.flatMap((role) => role.grants ?? []);

    return {
      age: user.age,
      createdAt: user.createdAt.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
      dob: user.dob,
      email: user.email,
      grants: [...new Set(grants.map((roleGrant) => roleGrant.name))],
      id: Number(user.id),
      name: user.name,
      roleIds: roles.map((role) => Number(role.id)),
      roles: roles.map((role) => ({
        grants: (role.grants ?? []).map((roleGrant) => roleGrant.name),
        id: Number(role.id),
        name: role.name,
      })),
      updatedAt: user.updatedAt.toISOString(),
      username: user.username,
    };
  }

  private getIncludedRoles(user: UserInstance) {
    const includedRoles = (user as UserWithRoles).roles ?? [];

    return [...includedRoles].sort((firstRole, secondRole) => {
      return Number(firstRole.id) - Number(secondRole.id);
    });
  }

  private getUserInclude() {
    return [
      {
        as: "roles",
        include: [
          {
            as: "grants",
            model: RoleGrant,
          },
        ],
        model: Role,
        through: {
          attributes: [],
        },
      },
    ];
  }
}
