export type UserRole = {
  grants: string[];
  id: number;
  name: string;
};

export type AssignableRole = {
  id: number;
  name: string;
};

export type User = {
  age: number | null;
  createdAt: string;
  deletedAt: string | null;
  dob: string | null;
  email: string;
  grants: string[];
  id: number;
  name: string;
  roleIds: number[];
  roles: UserRole[];
  updatedAt: string;
  username: string;
};

export type UsersResponse = {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type UsersQueryParams = {
  age?: string;
  dob?: string;
  email?: string;
  filterField?: UserFilterField;
  filterOperator?: UserFilterOperator;
  filterValue?: string;
  id?: string;
  name?: string;
  page: number;
  pageSize: number;
  search?: string;
  sortDirection?: UserSortDirection;
  sortField?: UserSortField;
  username?: string;
};

export type UserFilterField = "age" | "dob" | "email" | "id" | "name" | "username";

export type UserFilterOperator =
  | "!="
  | "<"
  | "<="
  | "="
  | ">"
  | ">="
  | "after"
  | "before"
  | "contains"
  | "doesNotContain"
  | "doesNotEqual"
  | "endsWith"
  | "equals"
  | "is"
  | "isEmpty"
  | "isNotEmpty"
  | "not"
  | "onOrAfter"
  | "onOrBefore"
  | "startsWith";

export type UserSortDirection = "asc" | "desc";

export type UserSortField =
  | "age"
  | "createdAt"
  | "dob"
  | "email"
  | "id"
  | "name"
  | "updatedAt"
  | "username";

export type UserPayload = {
  age?: number;
  dob?: string;
  email: string;
  name: string;
  password?: string;
  roleIds?: number[];
  username: string;
};

export type UpdateUserPayload = Partial<UserPayload>;
