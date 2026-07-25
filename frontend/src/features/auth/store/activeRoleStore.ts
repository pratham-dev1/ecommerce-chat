import { create } from "zustand";

import type { User } from "@/features/users/types/user";

const activeRoleStorageKey = "ecommerce-chat-active-role-id";

type ActiveRoleState = {
  activeRoleId: number | null;
  clearActiveRole: () => void;
  setActiveRoleId: (roleId: number | null) => void;
};

export const useActiveRoleStore = create<ActiveRoleState>((set) => ({
  activeRoleId: readStoredActiveRoleId(),
  clearActiveRole: () => {
    writeStoredActiveRoleId(null);
    set({ activeRoleId: null });
  },
  setActiveRoleId: (roleId) => {
    writeStoredActiveRoleId(roleId);
    set({ activeRoleId: roleId });
  },
}));

export function getActiveRoleId() {
  return useActiveRoleStore.getState().activeRoleId;
}

export function clearActiveRole() {
  useActiveRoleStore.getState().clearActiveRole();
}

export function ensureActiveRoleForUser(user: User | null | undefined) {
  if (user === undefined) {
    return getActiveRoleId();
  }

  const roles = user?.roles ?? [];

  if (roles.length === 0) {
    useActiveRoleStore.getState().clearActiveRole();
    return null;
  }

  const currentRoleId = getActiveRoleId();
  const currentRole = roles.find((role) => role.id === currentRoleId);

  if (currentRole) {
    return currentRole.id;
  }

  const nextRoleId = roles[0].id;
  useActiveRoleStore.getState().setActiveRoleId(nextRoleId);
  return nextRoleId;
}

function readStoredActiveRoleId() {
  try {
    const value = window.localStorage.getItem(activeRoleStorageKey);

    if (!value) {
      return null;
    }

    const roleId = Number(value);
    return Number.isInteger(roleId) && roleId > 0 ? roleId : null;
  } catch {
    return null;
  }
}

function writeStoredActiveRoleId(roleId: number | null) {
  try {
    if (!roleId) {
      window.localStorage.removeItem(activeRoleStorageKey);
      return;
    }

    window.localStorage.setItem(activeRoleStorageKey, String(roleId));
  } catch {
    // The backend session remains the source of truth.
  }
}
