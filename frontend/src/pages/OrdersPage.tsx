import { Stack } from "@mui/material";

import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function OrdersPage() {
  return (
    <Stack spacing={3}>
      <PageHeader description="Track order history and fulfillment status." title="Orders" />
      <EmptyState description="Customer order history will appear here after checkout is connected." title="No orders yet" />
    </Stack>
  );
}
