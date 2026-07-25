import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { ProductCard } from "@/features/catalog/components/ProductCard";
import { useProducts } from "@/features/catalog";

const productsPageSize = 100;

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const {
    data: productsResponse,
    isError,
    isFetching,
    isLoading,
  } = useProducts({
    page,
    pageSize: productsPageSize,
    ...(search ? { search } : {}),
  });
  const products = productsResponse?.data ?? [];
  const pagination = productsResponse?.pagination;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  if (isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", justifyContent: "center", minHeight: 240 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading products</Typography>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" variant="outlined">
        Products could not be loaded right now.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Typography variant="h1">Products</Typography>
        <Typography color="text.secondary">
          {pagination
            ? `Showing ${products.length} of ${pagination.total} catalog items.`
            : "Browse available catalog items."}
        </Typography>
      </Stack>

      <TextField
        label="Search products"
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search by name or description"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: 420 }}
        value={searchInput}
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Box>

      {pagination && pagination.totalPages > 1 ? (
        <Stack direction="row" sx={{ justifyContent: "center" }}>
          <Pagination
            count={pagination.totalPages}
            disabled={isFetching}
            onChange={(_event, nextPage) => setPage(nextPage)}
            page={page}
            showFirstButton
            showLastButton
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
