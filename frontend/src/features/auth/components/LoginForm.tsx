import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import type { Location } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { ControlledTextField } from "@/components/form/ControlledTextField";
import { Button } from "@/components/ui/Button";

import { useLoginMutation } from "../hooks/useLoginMutation";
import type { LoginFormValues } from "../types/login";

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<LoginFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
    navigate(getRedirectPath(location), { replace: true });
  };

  return (
    <Stack component="form" noValidate onSubmit={handleSubmit(onSubmit)} spacing={2.25}>
      <ControlledTextField
        autoComplete="email"
        control={control}
        label="Email"
        name="email"
        placeholder="you@example.com"
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
        autoComplete="current-password"
        control={control}
        label="Password"
        name="password"
        placeholder="Enter your password"
        rules={{
          minLength: {
            message: "Password must be at least 8 characters",
            value: 8,
          },
          required: "Password is required",
        }}
        type="password"
      />

      {loginMutation.isError && (
        <Alert severity="error" variant="outlined">
          Unable to sign in. Please check your credentials and try again.
        </Alert>
      )}

      <Button disabled={isSubmitting || loginMutation.isPending} fullWidth size="large" type="submit">
        {loginMutation.isPending ? "Signing in" : "Sign in"}
      </Button>
    </Stack>
  );
}

function getRedirectPath(location: Location) {
  const from = (location.state as { from?: Location } | null)?.from;

  if (!from?.pathname || from.pathname === "/login" || from.pathname === "/signup") {
    return "/";
  }

  return `${from.pathname}${from.search}${from.hash}`;
}
