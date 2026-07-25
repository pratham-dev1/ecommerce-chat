import {
  Box,
  Button,
  Card,
  CardActions,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { memo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useCartStore } from "@/features/cart";
import { formatCurrency } from "@/lib/currency";

import type { ProductSummary } from "../types/product";

type ProductCardProps = {
  product: ProductSummary;
};

const defaultQuantity = 1;
const maxProductQuantity = 99;

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(defaultQuantity);
  const addItem = useCartStore((state) => state.addItem);

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

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }} variant="outlined">
      <CardActionArea
        component={RouterLink}
        sx={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "stretch" }}
        to={`/products/${product.id}`}
      >
        {product.image ? (
          <CardMedia
            alt={product.name}
            component="img"
            image={product.image}
            loading="lazy"
            sx={{ aspectRatio: "4 / 3", objectFit: "cover" }}
          />
        ) : null}
        <CardContent sx={{ flex: 1 }}>
          <Stack spacing={1}>
            <Typography variant="h2">{product.name}</Typography>
            {product.description ? (
              <Typography color="text.secondary">{product.description}</Typography>
            ) : null}
            <Typography color="primary" sx={{ fontWeight: 800 }}>
              {formatCurrency(product.price)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
      <CardActions
        sx={{
          borderColor: "divider",
          borderTop: 1,
          gap: 1,
          justifyContent: "space-between",
          p: 1.5,
        }}
      >
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
          <Tooltip title="Decrease quantity">
            <span>
              <IconButton
                aria-label={`Decrease quantity for ${product.name}`}
                disabled={quantity <= defaultQuantity}
                onClick={decreaseQuantity}
                size="small"
              >
                <Minus size={15} />
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
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
              height: 32,
              justifyContent: "center",
              minWidth: 38,
              px: 0.75,
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
                <Plus size={15} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Button
          onClick={handleAddToCart}
          size="small"
          startIcon={<ShoppingCart size={16} />}
          sx={{ flexShrink: 0 }}
          variant="contained"
        >
          Add
        </Button>
      </CardActions>
    </Card>
  );
});
