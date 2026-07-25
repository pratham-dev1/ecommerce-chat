import { Paper, Stack, Typography } from "@mui/material";

export function ForbiddenPage() {
  return (
    <Paper sx={{ mx: "auto", maxWidth: 520, p: { xs: 3, sm: 4 } }} variant="outlined">
      <Stack spacing={1}>
        <Typography variant="h1">Access denied</Typography>
        <Typography color="text.secondary">
          Your account does not have permission to open this page.
        </Typography>
      </Stack>
    </Paper>
  );
}
