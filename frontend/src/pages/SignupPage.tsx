import { Box, Paper, Stack, Typography } from "@mui/material";

import { SignupForm } from "@/features/auth";

export function SignupPage() {
  return (
    <Box
      sx={{
        maxWidth: 620,
        mx: "auto",
        width: "100%",
      }}
    >
      <Paper sx={{ p: { xs: 3, sm: 4 } }} variant="outlined">
        <Stack spacing={3}>
          <Stack spacing={0.75}>
            <Typography variant="h1">Create account</Typography>
            <Typography color="text.secondary">
              Sign up to start managing your profile, orders, cart, and checkout.
            </Typography>
          </Stack>
          <SignupForm />
        </Stack>
      </Paper>
    </Box>
  );
}
