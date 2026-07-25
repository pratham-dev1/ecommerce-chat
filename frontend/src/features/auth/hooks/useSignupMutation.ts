import { useMutation } from "@tanstack/react-query";

import { signup } from "../api/authApi";

export function useSignupMutation() {
  return useMutation({
    mutationFn: signup,
  });
}
