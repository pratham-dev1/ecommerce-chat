import {
  AppBar,
  Avatar,
  Button,
  Container,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { LogOut, Moon, Sun } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

import { useColorMode } from "@/app/theme/ColorModeProvider";
import { useActiveRole, useAuthUser, useLogoutMutation } from "@/features/auth";
import { hasAuthSessionHint } from "@/features/auth/utils/authSession";
import { useCartStore } from "@/features/cart";

const navItems = [
  { label: "Products", to: "/products" },
  { label: "Cart", to: "/cart" },
  { label: "Chat", to: "/chat" },
  { label: "Orders", to: "/orders" },
];

const adminNavItems = [{ grant: "READ_USER", label: "Users", to: "/users" }];

export function Header() {
  const { mode, toggleColorMode } = useColorMode();
  const { data: user } = useAuthUser({ enabled: hasAuthSessionHint() });
  const { activeRoleId, hasGrant, setActiveRoleId } = useActiveRole(user);
  const itemCount = useCartStore((state) => state.itemCount);
  const logoutMutation = useLogoutMutation();
  const isDarkMode = mode === "dark";
  const isAuthenticated = Boolean(user);
  const roles = user?.roles ?? [];
  const visibleAdminNavItems = adminNavItems.filter((item) => hasGrant(item.grant));

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setActiveRoleId(Number(event.target.value));
  };

  return (
    <AppBar
      color="inherit"
      elevation={0}
      position="sticky"
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, minHeight: 64 }}>
          {isAuthenticated ? (
            <Typography
              color="text.primary"
              component={RouterLink}
              sx={{
                fontWeight: 800,
                mr: "auto",
                textDecoration: "none",
              }}
              to="/"
              variant="h6"
            >
              Ecommerce + Chat
            </Typography>
          ) : (
            <Typography
              color="text.primary"
              sx={{
                fontWeight: 800,
                mr: "auto",
              }}
              variant="h6"
            >
              Ecommerce + Chat
            </Typography>
          )}

          {isAuthenticated ? (
            <Stack
              aria-label="Main navigation"
              component="nav"
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center" }}
            >
              {navItems.map((item) => (
                <Button
                  color="inherit"
                  component={RouterLink}
                  key={item.to}
                  size="small"
                  sx={{ color: "text.secondary" }}
                  to={item.to}
                >
                  {item.to === "/cart" && itemCount > 0
                    ? `${item.label} (${itemCount})`
                    : item.label}
                </Button>
              ))}
              {visibleAdminNavItems.map((item) => (
                <Button
                  color="inherit"
                  component={RouterLink}
                  key={item.to}
                  size="small"
                  sx={{ color: "text.secondary" }}
                  to={item.to}
                >
                  {item.label}
                </Button>
              ))}
              {roles.length > 1 ? (
                <FormControl size="small" sx={{ minWidth: 112 }}>
                  <Select
                    aria-label="Active role"
                    onChange={handleRoleChange}
                    sx={{
                      color: "text.secondary",
                      height: 34,
                      ".MuiSelect-select": {
                        py: 0.75,
                      },
                    }}
                    value={activeRoleId ? String(activeRoleId) : ""}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
              <Button
                color="inherit"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
                size="small"
                startIcon={<LogOut size={16} />}
                sx={{ color: "text.secondary" }}
              >
                Logout
              </Button>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  maxWidth: 180,
                  minWidth: 0,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    height: 30,
                    width: 30,
                  }}
                >
                  {getInitials(user?.name ?? "User")}
                </Avatar>
                <Typography
                  color="text.primary"
                  noWrap
                  sx={{ fontWeight: 700, minWidth: 0 }}
                  variant="body2"
                >
                  {user?.name}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Button
              color="inherit"
              component={RouterLink}
              size="small"
              sx={{ color: "text.secondary" }}
              to="/login"
            >
              Login
            </Button>
          )}

          <Tooltip title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              color="inherit"
              onClick={toggleColorMode}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}
