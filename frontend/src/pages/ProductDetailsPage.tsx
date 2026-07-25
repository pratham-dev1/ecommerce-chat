import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { useProduct } from "@/features/catalog";
import { useCartStore } from "@/features/cart";
import { formatCurrency } from "@/lib/currency";

const defaultQuantity = 1;
const maxProductQuantity = 99;

export function ProductDetailsPage() {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(defaultQuantity);
  const addItem = useCartStore((state) => state.addItem);
  const { data: product, isError, isLoading } = useProduct(productId);

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(defaultQuantity, currentQuantity - 1),
    );
  };

  const increaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.min(maxProductQuantity, currentQuantity + 1),
    );
  };

  if (isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", justifyContent: "center", minHeight: 320 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading product</Typography>
      </Stack>
    );
  }

  if (isError || !product) {
    return (
      <Stack spacing={3}>
        <Button
          component={RouterLink}
          startIcon={<ArrowLeft size={16} />}
          sx={{ alignSelf: "flex-start" }}
          to="/products"
          variant="outlined"
        >
          Products
        </Button>
        <Alert severity="error" variant="outlined">
          Product details could not be loaded.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        component={RouterLink}
        startIcon={<ArrowLeft size={16} />}
        sx={{ alignSelf: "flex-start" }}
        to="/products"
        variant="outlined"
      >
        Products
      </Button>

      <PageHeader description="View pricing and add this item to cart." title={product.name} />

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { md: "minmax(0, 1.1fr) minmax(340px, 0.9fr)", xs: "1fr" },
        }}
      >
        {product.image ? (
          <Box
            alt={product.name}
            component="img"
            src={product.image}
            sx={{
              aspectRatio: "4 / 3",
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              objectFit: "cover",
              width: "100%",
            }}
          />
        ) : (
          <Box
            sx={{
              alignItems: "center",
              aspectRatio: "4 / 3",
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              color: "text.secondary",
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            No image
          </Box>
        )}

        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <Typography color="primary" sx={{ fontWeight: 900 }} variant="h1">
              {formatCurrency(product.price)}
            </Typography>
            <Typography color="text.secondary">
              {product.description ?? "No description available."}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Tooltip title="Decrease quantity">
              <span>
                <IconButton
                  aria-label={`Decrease quantity for ${product.name}`}
                  disabled={quantity <= defaultQuantity}
                  onClick={decreaseQuantity}
                  size="small"
                >
                  <Minus size={16} />
                </IconButton>
              </span>
            </Tooltip>
            <Box
              aria-label={`Quantity for ${product.name}`}
              role="status"
              sx={{
                alignItems: "center",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
                height: 38,
                justifyContent: "center",
                minWidth: 48,
              }}
            >
              {quantity}
            </Box>
            <Tooltip title="Increase quantity">
              <span>
                <IconButton
                  aria-label={`Increase quantity for ${product.name}`}
                  disabled={quantity >= maxProductQuantity}
                  onClick={increaseQuantity}
                  size="small"
                >
                  <Plus size={16} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Button
            onClick={() => addItem(product, quantity)}
            size="large"
            startIcon={<ShoppingCart size={18} />}
            sx={{ alignSelf: "flex-start" }}
            variant="contained"
          >
            Add to cart
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
