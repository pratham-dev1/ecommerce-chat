import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";

type ButtonProps = MuiButtonProps;

export function Button({ variant = "contained", ...props }: ButtonProps) {
  return <MuiButton variant={variant} {...props} />;
}
