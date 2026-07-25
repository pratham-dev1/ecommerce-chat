import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";

type ControlledTextFieldProps<TFieldValues extends FieldValues> = UseControllerProps<TFieldValues> & {
  autoComplete?: TextFieldProps["autoComplete"];
  disabled?: TextFieldProps["disabled"];
  label: string;
  placeholder?: TextFieldProps["placeholder"];
  size?: TextFieldProps["size"];
  type?: TextFieldProps["type"];
};

export function ControlledTextField<TFieldValues extends FieldValues>({
  autoComplete,
  control,
  disabled,
  label,
  name,
  placeholder,
  rules,
  size = "medium",
  type = "text",
}: ControlledTextFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
    rules,
  });

  const { ref, ...inputProps } = field;

  return (
    <TextField
      {...inputProps}
      autoComplete={autoComplete}
      disabled={disabled}
      error={Boolean(error)}
      helperText={error?.message}
      inputRef={ref}
      label={label}
      placeholder={placeholder}
      size={size}
      type={type}
      value={field.value ?? ""}
    />
  );
}
