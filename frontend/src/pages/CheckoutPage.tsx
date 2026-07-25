import { Stack } from "@mui/material";

import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function CheckoutPage() {
  return (
    <Stack spacing={3}>
      <PageHeader description="Confirm shipping, payment, and order details." title="Checkout" />
      <EmptyState description="Checkout steps will be connected after cart and payment flows are ready." title="Checkout is not ready yet" />
    </Stack>
  );
}
