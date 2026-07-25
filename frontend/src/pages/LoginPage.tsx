import Alert from "@mui/material/Alert";
import { Box, Link, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { LoginForm } from "@/features/auth";

export function LoginPage() {
  return (
    <Box
      sx={{
        maxWidth: 480,
        mx: "auto",
        width: "100%",
      }}
    >
      <Paper sx={{ p: { xs: 3, sm: 4 } }} variant="outlined">
        <Stack spacing={3}>
          <Stack spacing={0.75}>
            <Typography variant="h1">Sign in</Typography>
            <Typography color="text.secondary">
              Access your account, orders, cart, and saved checkout details.
            </Typography>
          </Stack>
          <Alert severity="info" variant="outlined">
            <Stack spacing={0.5}>
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                Test login credentials
              </Typography>
              <Typography variant="body2">Email: test1@gmail.com</Typography>
              <Typography variant="body2">Password: Test#1234</Typography>
            </Stack>
          </Alert>
          <LoginForm />
          <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="body2">
            Need an account?{" "}
            <Link component={RouterLink} to="/signup" underline="hover">
              Create one
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
