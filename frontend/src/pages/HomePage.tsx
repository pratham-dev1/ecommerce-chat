import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function HomePage() {
  return (
    <Paper
      sx={{
        bgcolor: "background.paper",
        p: { xs: 3, sm: 4 },
      }}
      variant="outlined"
    >
      <Stack spacing={2} sx={{ alignItems: "flex-start", maxWidth: 640 }}>
        <Typography variant="h1">Storefront</Typography>
        <Typography color="text.secondary">
          Manage the shopping flow, catalog discovery, cart state, checkout, and customer orders.
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained">
          Browse products
        </Button>
      </Stack>
    </Paper>
  );
}
