import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
} from "@mui/material";
import { Save, X } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { ControlledTextField } from "@/components/form/ControlledTextField";
import { Button } from "@/components/ui/Button";

import type { AssignableRole, User, UserPayload } from "../types/user";

type UserFormValues = {
  age: string;
  dob: string;
  email: string;
  name: string;
  password: string;
  roleIds: number[];
  username: string;
};

type UserFormProps = {
  isSubmitting?: boolean;
  layout?: "drawer" | "page";
  mode: "create" | "edit";
  onCancel?: () => void;
  onSubmit: (payload: UserPayload) => Promise<void>;
  roles?: AssignableRole[];
  rolesLoading?: boolean;
  user?: User | null;
};

const emptyValues: UserFormValues = {
  age: "",
  dob: "",
  email: "",
  name: "",
  password: "",
  roleIds: [],
  username: "",
};

export function UserForm({
  isSubmitting = false,
  layout = "page",
  mode,
  onCancel,
  onSubmit,
  roles = [],
  rolesLoading = false,
  user,
}: UserFormProps) {
  const {
    control,
    formState: { isSubmitting: isFormSubmitting },
    handleSubmit,
    reset,
  } = useForm<UserFormValues>({
    defaultValues: emptyValues,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(user ? toFormValues(user) : emptyValues);
  }, [reset, user]);

  const isBusy = isSubmitting || isFormSubmitting;
  const fieldDirection =
    layout === "drawer" ? "column" : ({ sm: "row", xs: "column" } as const);

  const submitForm = async (values: UserFormValues) => {
    await onSubmit(toPayload(values, { includeRoles: mode === "edit" }));

    if (mode === "create") {
      reset(emptyValues);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(submitForm)}>
      <Stack spacing={2}>
        <Stack direction={fieldDirection} spacing={2}>
          <ControlledTextField
            autoComplete="name"
            control={control}
            disabled={isBusy}
            label="Name"
            name="name"
            rules={{
              maxLength: { message: "Name must be 120 characters or less", value: 120 },
              minLength: { message: "Name must be at least 2 characters", value: 2 },
              required: "Name is required",
            }}
          />
          <ControlledTextField
            autoComplete="username"
            control={control}
            disabled={isBusy}
            label="Username"
            name="username"
            rules={{
              maxLength: { message: "Username must be 80 characters or less", value: 80 },
              minLength: { message: "Username must be at least 3 characters", value: 3 },
              pattern: {
                message: "Use letters, numbers, and underscores",
                value: /^[a-zA-Z0-9_]+$/,
              },
              required: "Username is required",
            }}
          />
        </Stack>

        <Stack direction={fieldDirection} spacing={2}>
          <ControlledTextField
            autoComplete="email"
            control={control}
            disabled={isBusy}
            label="Email"
            name="email"
            rules={{
              pattern: {
                message: "Enter a valid email address",
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              },
              required: "Email is required",
            }}
            type="email"
          />
          <ControlledTextField
            control={control}
            disabled={isBusy}
            label="Age"
            name="age"
            rules={{
              min: { message: "Age cannot be negative", value: 0 },
              pattern: { message: "Age must be a whole number", value: /^\d*$/ },
            }}
            type="number"
          />
          <ControlledTextField
            control={control}
            disabled={isBusy}
            label="Date of birth"
            name="dob"
            type="date"
          />
        </Stack>

        {mode === "create" ? (
          <ControlledTextField
            autoComplete="new-password"
            control={control}
            disabled={isBusy}
            label="Password"
            name="password"
            rules={{
              maxLength: { message: "Password must be 128 characters or less", value: 128 },
              minLength: { message: "Password must be at least 8 characters", value: 8 },
              required: "Password is required",
            }}
            type="password"
          />
        ) : null}

        {mode === "edit" ? (
          <FormControl disabled={isBusy || rolesLoading} fullWidth>
            <InputLabel id="user-form-role-select-label">Roles</InputLabel>
            <Controller
              control={control}
              name="roleIds"
              render={({ field }) => {
                const selectedRoleIds = (field.value ?? []).map(String);

                return (
                  <Select
                    input={<OutlinedInput label="Roles" />}
                    labelId="user-form-role-select-label"
                    multiple
                    onChange={(event) => {
                      const value = event.target.value;
                      const nextRoleIds = (Array.isArray(value) ? value : value.split(","))
                        .map(Number)
                        .filter((roleId) => Number.isInteger(roleId));

                      field.onChange(nextRoleIds);
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {(selected as string[]).map((roleId) => {
                          const role = roles.find((availableRole) => availableRole.id === Number(roleId));

                          return (
                            <Chip
                              key={roleId}
                              label={role?.name ?? roleId}
                              size="small"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    )}
                    value={selectedRoleIds}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                );
              }}
            />
            {rolesLoading ? (
              <FormHelperText>Loading roles</FormHelperText>
            ) : roles.length === 0 ? (
              <FormHelperText>No roles are available.</FormHelperText>
            ) : null}
          </FormControl>
        ) : null}

        <Stack direction="row" spacing={1.25} sx={{ justifyContent: "flex-end" }}>
          {onCancel ? (
            <Button
              disabled={isBusy}
              onClick={onCancel}
              startIcon={<X size={16} />}
              type="button"
              variant="outlined"
            >
              Cancel
            </Button>
          ) : null}
          <Button disabled={isBusy} startIcon={<Save size={16} />} type="submit">
            {mode === "create" ? "Create user" : "Save changes"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function toFormValues(user: User): UserFormValues {
  return {
    age: user.age === null ? "" : String(user.age),
    dob: user.dob ?? "",
    email: user.email,
    name: user.name,
    password: "",
    roleIds: user.roleIds,
    username: user.username,
  };
}

function toPayload(
  values: UserFormValues,
  options: { includeRoles: boolean },
): UserPayload {
  return {
    ...(values.age ? { age: Number(values.age) } : {}),
    ...(values.dob ? { dob: values.dob } : {}),
    email: values.email.trim(),
    name: values.name.trim(),
    ...(values.password ? { password: values.password } : {}),
    ...(options.includeRoles ? { roleIds: values.roleIds } : {}),
    username: values.username.trim(),
  };
}
