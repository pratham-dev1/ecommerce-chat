import { Paper, Stack, Typography } from "@mui/material";

type EmptyStateProps = {
  description: string;
  title: string;
};

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 3 }} variant="outlined">
      <Stack spacing={0.75}>
        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Paper>
  );
}
