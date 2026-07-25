const authSessionHintKey = "ecommerce-chat-has-auth-session";

export function hasAuthSessionHint() {
  try {
    return window.localStorage.getItem(authSessionHintKey) === "true";
  } catch {
    return true;
  }
}

export function setAuthSessionHint() {
  try {
    window.localStorage.setItem(authSessionHintKey, "true");
  } catch {
    // Ignore storage failures; the server-side session remains the source of truth.
  }
}

export function clearAuthSessionHint() {
  try {
    window.localStorage.removeItem(authSessionHintKey);
  } catch {
    // Ignore storage failures; the server-side session remains the source of truth.
  }
}
