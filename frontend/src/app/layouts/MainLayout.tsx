import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

import { Header } from "@/components/layout/Header";

export function MainLayout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Header />
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
