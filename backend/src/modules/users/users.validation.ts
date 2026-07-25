import { z } from "zod";

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const passwordSchema = z.string().min(8).max(128);
const roleIdsSchema = z.array(z.number().int().positive()).optional();
const userFilterFieldSchema = z.enum(["id", "name", "username", "email", "age", "dob"]);
const userFilterOperatorSchema = z.enum([
  "contains",
  "doesNotContain",
  "equals",
  "doesNotEqual",
  "startsWith",
  "endsWith",
  "=",
  "!=",
  ">",
  ">=",
  "<",
  "<=",
  "is",
  "not",
  "after",
  "onOrAfter",
  "before",
  "onOrBefore",
  "isEmpty",
  "isNotEmpty",
]);
const userSortFieldSchema = z.enum([
  "id",
  "name",
  "username",
  "email",
  "age",
  "dob",
  "createdAt",
  "updatedAt",
]);

export const userIdParamsSchema = z.object({
  userId: z.string().regex(/^\d+$/),
});

export const listUsersQuerySchema = z.object({
  age: z.coerce.number().int().nonnegative().optional(),
  dob: dateOnlySchema.optional(),
  email: z.string().trim().max(255).optional(),
  filterField: userFilterFieldSchema.optional(),
  filterOperator: userFilterOperatorSchema.optional(),
  filterValue: z.string().trim().max(255).optional(),
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(100),
  search: z.string().trim().max(255).optional(),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  sortField: userSortFieldSchema.default("id"),
  username: z.string().trim().max(80).optional(),
});

const userFieldsSchema = z
  .object({
    age: z.number().int().nonnegative().optional(),
    dob: dateOnlySchema.optional(),
    email: z.string().email().max(255),
    name: z.string().trim().min(2).max(120),
    username: z
      .string()
      .trim()
      .min(3)
      .max(80)
      .regex(/^[a-zA-Z0-9_]+$/),
  })
  .strict();

export const registerUserSchema = userFieldsSchema;

export const createUserSchema = userFieldsSchema.extend({
  password: passwordSchema,
  roleIds: roleIdsSchema,
});

export const registerSchema = userFieldsSchema.extend({
  password: passwordSchema,
});

export const updateUserSchema = userFieldsSchema
  .partial()
  .extend({
    password: passwordSchema.optional(),
    roleIds: roleIdsSchema,
  })
  .refine((value) => Object.keys(value).length > 0);

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
