import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { UserPlus } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { ControlledTextField } from "@/components/form/ControlledTextField";
import { Button } from "@/components/ui/Button";

import { useSignupMutation } from "../hooks/useSignupMutation";
import type { SignupFormValues, SignupPayload } from "../types/signup";

const defaultValues: SignupFormValues = {
  age: "",
  confirmPassword: "",
  dob: "",
  email: "",
  name: "",
  password: "",
  username: "",
};

export function SignupForm() {
  const navigate = useNavigate();
  const signupMutation = useSignupMutation();
  const {
    control,
    formState: { isSubmitting },
    getValues,
    handleSubmit,
  } = useForm<SignupFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = async (values: SignupFormValues) => {
    await signupMutation.mutateAsync(toSignupPayload(values));
    navigate("/login", { replace: true });
  };

  const isBusy = isSubmitting || signupMutation.isPending;

  return (
    <Stack component="form" noValidate onSubmit={handleSubmit(onSubmit)} spacing={2.25}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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

      <ControlledTextField
        autoComplete="email"
        control={control}
        disabled={isBusy}
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

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
        <ControlledTextField
          autoComplete="new-password"
          control={control}
          disabled={isBusy}
          label="Confirm password"
          name="confirmPassword"
          rules={{
            validate: (value: string) => value === getValues("password") || "Passwords do not match",
          }}
          type="password"
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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

      {signupMutation.isError && (
        <Alert severity="error" variant="outlined">
          Account could not be created. Please check the details and try again.
        </Alert>
      )}

      <Button
        disabled={isBusy}
        fullWidth
        size="large"
        startIcon={<UserPlus size={18} />}
        type="submit"
      >
        {signupMutation.isPending ? "Creating account" : "Create account"}
      </Button>

      <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="body2">
        Already have an account?{" "}
        <Link component={RouterLink} to="/login" underline="hover">
          Sign in
        </Link>
      </Typography>
    </Stack>
  );
}

function toSignupPayload(values: SignupFormValues): SignupPayload {
  return {
    ...(values.age ? { age: Number(values.age) } : {}),
    ...(values.dob ? { dob: values.dob } : {}),
    email: values.email.trim(),
    name: values.name.trim(),
    password: values.password,
    username: values.username.trim(),
  };
}
