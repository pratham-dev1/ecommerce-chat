import { Stack, Typography } from "@mui/material";

type PageHeaderProps = {
  description?: string;
  title: string;
};

export function PageHeader({ description, title }: PageHeaderProps) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="h1">{title}</Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
    </Stack>
  );
}
