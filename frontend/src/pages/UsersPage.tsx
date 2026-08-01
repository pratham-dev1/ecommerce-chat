import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { MessageCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { useActiveRole, useAuthUser } from "@/features/auth";
import {
  UserForm,
  useCreateUserMutation,
  useDeleteUserMutation,
  useRoles,
  useUpdateUserMutation,
  useUser,
  useUsers,
  type User,
  type UserFilterField,
  type UserFilterOperator,
  type UserPayload,
  type UserSortField,
} from "@/features/users";

const usersPageSize = 100;
const userFilterFields = new Set<string>([
  "age",
  "dob",
  "email",
  "id",
  "name",
  "username",
]);
const userFilterOperators = new Set<string>([
  "!=",
  "<",
  "<=",
  "=",
  ">",
  ">=",
  "after",
  "before",
  "contains",
  "doesNotContain",
  "doesNotEqual",
  "endsWith",
  "equals",
  "is",
  "isEmpty",
  "isNotEmpty",
  "not",
  "onOrAfter",
  "onOrBefore",
  "startsWith",
]);
const userSortFields = new Set<string>([
  "age",
  "createdAt",
  "dob",
  "email",
  "id",
  "name",
  "updatedAt",
  "username",
]);
const noValueFilterOperators = new Set<string>(["isEmpty", "isNotEmpty"]);
type UserDrawerMode = "create" | "edit";
type UserFieldSearch = {
  age: string;
  dob: string;
  email: string;
  id: string;
  name: string;
  username: string;
};
type UserFieldSearchKey = keyof UserFieldSearch;

const emptyUserFieldSearch: UserFieldSearch = {
  age: "",
  dob: "",
  email: "",
  id: "",
  name: "",
  username: "",
};

const userFieldSearchInputs: Array<{
  key: UserFieldSearchKey;
  label: string;
  type?: string;
}> = [
  { key: "email", label: "Email" },
  { key: "username", label: "Username" },
  { key: "name", label: "Name" },
  { key: "id", label: "ID", type: "number" },
  { key: "age", label: "Age", type: "number" },
  { key: "dob", label: "DOB", type: "date" },
];

export function UsersPage() {
  const navigate = useNavigate();
  const { data: currentUser } = useAuthUser();
  const { hasGrant } = useActiveRole(currentUser);
  const [drawerMode, setDrawerMode] = useState<UserDrawerMode>("create");
  const [fieldSearch, setFieldSearch] = useState<UserFieldSearch>(emptyUserFieldSearch);
  const [fieldSearchDraft, setFieldSearchDraft] =
    useState<UserFieldSearch>(emptyUserFieldSearch);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: usersPageSize,
  });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const usersQueryParams = useMemo(
    () => toUsersQueryParams(paginationModel, sortModel, filterModel, fieldSearch),
    [fieldSearch, filterModel, paginationModel, sortModel],
  );
  const {
    data: usersResponse,
    isError,
    isFetching,
    isLoading,
  } = useUsers(usersQueryParams);
  const selectedUserQuery = useUser(
    selectedUserId,
    isUserDrawerOpen && drawerMode === "edit",
  );
  const canCreateUsers = hasGrant("CREATE_USER");
  const canEditUsers = hasGrant("EDIT_USER");
  const rolesQuery = useRoles(canEditUsers);
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const users = usersResponse?.data ?? [];
  const totalUsers = usersResponse?.pagination.total ?? 0;
  const selectedUser = drawerMode === "edit" ? selectedUserQuery.data ?? null : null;

  const isMutating =
    createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending;

  useEffect(() => {
    if (areFieldSearchesEqual(fieldSearch, fieldSearchDraft)) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFieldSearch(fieldSearchDraft);
      setPaginationModel((currentPaginationModel) => ({
        ...currentPaginationModel,
        page: 0,
      }));
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [fieldSearch, fieldSearchDraft]);

  const resetToFirstPage = () => {
    setPaginationModel((currentPaginationModel) => ({
      ...currentPaginationModel,
      page: 0,
    }));
  };

  const handleFilterModelChange = (nextFilterModel: GridFilterModel) => {
    setFilterModel(nextFilterModel);
    resetToFirstPage();
  };

  const handleFieldSearchChange = (key: UserFieldSearchKey, value: string) => {
    setFieldSearchDraft((currentFieldSearch) => ({
      ...currentFieldSearch,
      [key]: value,
    }));
  };

  const clearFieldSearch = () => {
    setFieldSearch(emptyUserFieldSearch);
    setFieldSearchDraft(emptyUserFieldSearch);
    resetToFirstPage();
  };

  const handleSortModelChange = (nextSortModel: GridSortModel) => {
    setSortModel(nextSortModel.slice(0, 1));
    resetToFirstPage();
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedUserId(null);
    setIsUserDrawerOpen(true);
  };

  const openEditDrawer = (userId: number) => {
    setDrawerMode("edit");
    setSelectedUserId(userId);
    setIsUserDrawerOpen(true);
  };

  const closeUserDrawer = () => {
    setIsUserDrawerOpen(false);
    setSelectedUserId(null);
  };

  const handleCreateUser = async (payload: UserPayload) => {
    await createUserMutation.mutateAsync(payload);
    closeUserDrawer();
  };

  const handleUpdateUser = async (payload: UserPayload) => {
    if (!selectedUserId) {
      return;
    }

    await updateUserMutation.mutateAsync({ payload, userId: selectedUserId });
    closeUserDrawer();
  };

  const handleDeleteUser = async (user: User) => {
    const shouldDelete = window.confirm(`Delete ${user.name}?`);

    if (!shouldDelete) {
      return;
    }

    await deleteUserMutation.mutateAsync(user.id);

    if (selectedUserId === user.id) {
      closeUserDrawer();
    }
  };

  const handleOpenChat = (user: User) => {
    navigate("/chat", { state: { name: user.name, userId: user.id } });
  };

  const columns: GridColDef<User>[] = [
    {
      field: "name",
      flex: 1,
      headerName: "Name",
      minWidth: 160,
    },
    {
      field: "username",
      flex: 1,
      headerName: "Username",
      minWidth: 150,
    },
    {
      field: "email",
      flex: 1.4,
      headerName: "Email",
      minWidth: 220,
    },
    {
      field: "age",
      headerName: "Age",
      minWidth: 90,
      renderCell: ({ row }) => row.age ?? "-",
    },
    {
      field: "dob",
      flex: 0.9,
      headerName: "Date of birth",
      minWidth: 150,
      renderCell: ({ row }) => row.dob ?? "-",
    },
    {
      align: "right",
      field: "actions",
      headerAlign: "right",
      headerName: "Actions",
      minWidth: canEditUsers ? 156 : 72,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", width: "100%" }}>
          <Tooltip title="Chat">
            <span>
              <IconButton
                aria-label={`Chat with ${row.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenChat(row);
                }}
                size="small"
              >
                <MessageCircle size={17} />
              </IconButton>
            </span>
          </Tooltip>
          {canEditUsers ? (
            <>
              <Tooltip title="Edit user">
                <span>
                  <IconButton
                    aria-label={`Edit ${row.name}`}
                    disabled={isMutating}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditDrawer(row.id);
                    }}
                    size="small"
                  >
                    <Pencil size={17} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Delete user">
                <span>
                  <IconButton
                    aria-label={`Delete ${row.name}`}
                    disabled={isMutating}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDeleteUser(row);
                    }}
                    size="small"
                  >
                    <Trash2 size={17} />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          ) : null}
        </Stack>
      ),
      sortable: false,
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ sm: "row", xs: "column" }}
        spacing={2}
        sx={{ alignItems: { sm: "center", xs: "stretch" }, justifyContent: "space-between" }}
      >
        <PageHeader description="Create, review, update, and remove user accounts." title="Users" />
        {canCreateUsers ? (
          <Button onClick={openCreateDrawer} startIcon={<Plus size={16} />} variant="contained">
            Create user
          </Button>
        ) : null}
      </Stack>

      {(createUserMutation.isError || updateUserMutation.isError || deleteUserMutation.isError) && (
        <Alert severity="error" variant="outlined">
          User change could not be completed.
        </Alert>
      )}

      {isError ? (
        <Alert severity="error" variant="outlined">
          Users could not be loaded right now.
        </Alert>
      ) : null}

      {rolesQuery.isError ? (
        <Alert severity="error" variant="outlined">
          Roles could not be loaded right now.
        </Alert>
      ) : null}

      <Stack
        direction={{ md: "row", xs: "column" }}
        spacing={1.5}
        sx={{ alignItems: { md: "center", xs: "stretch" } }}
      >
        <Box
          sx={{
            display: "grid",
            flex: 1,
            gap: 1.5,
            gridTemplateColumns: {
              lg: "repeat(6, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              xs: "1fr",
            },
          }}
        >
          {userFieldSearchInputs.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              onChange={(event) => handleFieldSearchChange(field.key, event.target.value)}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                },
                ...(field.type === "date" ? { inputLabel: { shrink: true } } : {}),
              }}
              type={field.type ?? "text"}
              value={fieldSearchDraft[field.key]}
            />
          ))}
        </Box>
        <Button
          disabled={!hasFieldSearch(fieldSearchDraft)}
          onClick={clearFieldSearch}
          sx={{ alignSelf: { md: "center", xs: "flex-start" } }}
          variant="outlined"
        >
          Clear
        </Button>
      </Stack>

      {!isError ? (
        <Paper sx={{ height: 520, width: "100%" }} variant="outlined">
          <DataGrid
            columnFilterDebounceMs={400}
            columns={columns}
            disableRowSelectionOnClick
            filterDebounceMs={400}
            filterMode="server"
            filterModel={filterModel}
            loading={isLoading || isFetching}
            onFilterModelChange={handleFilterModelChange}
            onPaginationModelChange={setPaginationModel}
            onRowClick={(params) => {
              if (canEditUsers) {
                openEditDrawer(Number(params.row.id));
              }
            }}
            onSortModelChange={handleSortModelChange}
            pageSizeOptions={[usersPageSize]}
            paginationMode="server"
            paginationModel={paginationModel}
            rowCount={totalUsers}
            rows={users}
            showToolbar
            sortModel={sortModel}
            sortingMode="server"
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 800,
              },
              "& .MuiDataGrid-row": {
                cursor: canEditUsers ? "pointer" : "default",
              },
            }}
          />
        </Paper>
      ) : null}

      <Drawer anchor="right" onClose={closeUserDrawer} open={isUserDrawerOpen}>
        <Box
          sx={{
            maxWidth: "100vw",
            p: 3,
            width: { sm: 460, xs: "100vw" },
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h2">
                  {drawerMode === "create" ? "Create user" : "Edit user"}
                </Typography>
                <Typography color="text.secondary">
                  {drawerMode === "create"
                    ? "Add a new account."
                    : "Update account details."}
                </Typography>
              </Stack>
              <Tooltip title="Close">
                <IconButton aria-label="Close user form" onClick={closeUserDrawer} size="small">
                  <X size={18} />
                </IconButton>
              </Tooltip>
            </Stack>

            <Divider />

            {drawerMode === "edit" && selectedUserQuery.isLoading ? (
              <Stack
                spacing={2}
                sx={{ alignItems: "center", justifyContent: "center", minHeight: 240 }}
              >
                <CircularProgress />
                <Typography color="text.secondary">Loading user</Typography>
              </Stack>
            ) : null}

            {drawerMode === "edit" && selectedUserQuery.isError ? (
              <Alert severity="error" variant="outlined">
                User details could not be loaded.
              </Alert>
            ) : null}

            {drawerMode === "create" || selectedUser ? (
              <UserForm
                isSubmitting={isMutating}
                layout="drawer"
                mode={drawerMode}
                onCancel={closeUserDrawer}
                onSubmit={drawerMode === "edit" ? handleUpdateUser : handleCreateUser}
                roles={rolesQuery.data ?? []}
                rolesLoading={rolesQuery.isLoading}
                user={selectedUser}
              />
            ) : null}
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}

function toUsersQueryParams(
  paginationModel: GridPaginationModel,
  sortModel: GridSortModel,
  filterModel: GridFilterModel,
  fieldSearch: UserFieldSearch,
) {
  const activeSort = sortModel.find(
    (sortItem) =>
      sortItem.sort &&
      userSortFields.has(sortItem.field),
  );
  const activeFilter = filterModel.items.find((filterItem) => {
    if (
      !userFilterFields.has(filterItem.field) ||
      !userFilterOperators.has(filterItem.operator)
    ) {
      return false;
    }

    if (noValueFilterOperators.has(filterItem.operator)) {
      return true;
    }

    return normalizeFilterValue(filterItem.value) !== undefined;
  });
  const filterValue = activeFilter ? normalizeFilterValue(activeFilter.value) : undefined;
  const search = filterModel.quickFilterValues
    ?.map((value) => String(value).trim())
    .filter(Boolean)
    .join(" ");

  return {
    ...toFieldSearchQueryParams(fieldSearch),
    ...(activeFilter
      ? {
          filterField: activeFilter.field as UserFilterField,
          filterOperator: activeFilter.operator as UserFilterOperator,
          ...(filterValue ? { filterValue } : {}),
        }
      : {}),
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    ...(search ? { search } : {}),
    ...(activeSort?.sort
      ? {
          sortDirection: activeSort.sort,
          sortField: activeSort.field as UserSortField,
        }
      : {}),
  };
}

function toFieldSearchQueryParams(fieldSearch: UserFieldSearch) {
  return Object.fromEntries(
    Object.entries(fieldSearch)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => Boolean(value)),
  );
}

function hasFieldSearch(fieldSearch: UserFieldSearch) {
  return Object.values(fieldSearch).some((value) => Boolean(value.trim()));
}

function areFieldSearchesEqual(
  firstFieldSearch: UserFieldSearch,
  secondFieldSearch: UserFieldSearch,
) {
  return userFieldSearchInputs.every(
    (field) => firstFieldSearch[field.key] === secondFieldSearch[field.key],
  );
}

function normalizeFilterValue(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalizedValue = Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).join(",")
    : String(value).trim();

  return normalizedValue || undefined;
}
