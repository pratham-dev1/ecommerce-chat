import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCartStore } from "@/features/cart";
import { formatCurrency } from "@/lib/currency";

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <Stack spacing={3}>
      <PageHeader description="Review items before checkout." title="Cart" />
      {items.length === 0 ? (
        <EmptyState
          description="Cart items will appear here once products are added."
          title="Your cart is empty"
        />
      ) : (
        <Paper sx={{ p: 3 }} variant="outlined">
          <Stack spacing={2}>
            {items.map((item, index) => (
              <Stack key={item.id} spacing={2}>
                <Stack
                  direction={{ sm: "row", xs: "column" }}
                  spacing={2}
                  sx={{ alignItems: { sm: "center", xs: "stretch" } }}
                >
                  {item.image ? (
                    <Box
                      alt={item.name}
                      component="img"
                      src={item.image}
                      sx={{
                        aspectRatio: "4 / 3",
                        borderRadius: 1,
                        objectFit: "cover",
                        width: { sm: 112, xs: "100%" },
                      }}
                    />
                  ) : null}
                  <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h2">{item.name}</Typography>
                    <Typography color="text.secondary">{formatCurrency(item.price)}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center", flexShrink: 0 }}
                  >
                    <Tooltip title="Decrease quantity">
                      <span>
                        <IconButton
                          aria-label={`Decrease quantity for ${item.name}`}
                          disabled={item.quantity <= 1}
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          size="small"
                        >
                          <Minus size={15} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <TextField
                      onChange={(event) =>
                        updateItemQuantity(item.id, Number(event.target.value))
                      }
                      size="small"
                      slotProps={{
                        htmlInput: {
                          "aria-label": `Quantity for ${item.name}`,
                          min: 1,
                          step: 1,
                        },
                      }}
                      sx={{
                        width: 72,
                        "& input": {
                          px: 0.75,
                          py: 0.75,
                          textAlign: "center",
                        },
                      }}
                      type="number"
                      value={item.quantity}
                    />
                    <Tooltip title="Increase quantity">
                      <IconButton
                        aria-label={`Increase quantity for ${item.name}`}
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        size="small"
                      >
                        <Plus size={15} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove item">
                      <IconButton
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.id)}
                        size="small"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Typography sx={{ fontWeight: 800, minWidth: 96, textAlign: "right" }}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Stack>
                {index < items.length - 1 ? <Divider /> : null}
              </Stack>
            ))}
            <Divider />
            <Stack
              direction={{ sm: "row", xs: "column" }}
              spacing={2}
              sx={{ alignItems: { sm: "center", xs: "stretch" }, justifyContent: "flex-end" }}
            >
              <Typography sx={{ fontWeight: 800 }} variant="h2">
                Subtotal {formatCurrency(subtotal)}
              </Typography>
              <Button component={RouterLink} to="/checkout" variant="contained">
                Checkout
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
