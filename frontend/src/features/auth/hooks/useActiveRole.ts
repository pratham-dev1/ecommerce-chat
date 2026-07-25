import { useEffect } from "react";

import type { User } from "@/features/users/types/user";

import {
  ensureActiveRoleForUser,
  useActiveRoleStore,
} from "../store/activeRoleStore";

export function useActiveRole(user: User | null | undefined) {
  const storedActiveRoleId = useActiveRoleStore((state) => state.activeRoleId);
  const setActiveRoleId = useActiveRoleStore((state) => state.setActiveRoleId);
  const roles = user?.roles ?? [];
  const activeRole =
    roles.find((role) => role.id === storedActiveRoleId) ?? roles[0] ?? null;
    console.log(activeRole)
  const activeRoleId = activeRole?.id ?? null;
  const activeGrants = activeRole?.grants ?? [];

  useEffect(() => {
    ensureActiveRoleForUser(user);
  }, [user, storedActiveRoleId]);

  return {
    activeGrants,
    activeRole,
    activeRoleId,
    hasGrant: (grant: string) => activeGrants.includes(grant),
    setActiveRoleId,
  };
}
