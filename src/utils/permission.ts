// src/utils/permission.ts
import { AuthUser } from "@/contexts/AuthContext";

export function can(user: AuthUser | null | undefined, key: string): boolean {
  if (!user || !user.module_permissions) return false;

  const [resource, action] = key.split(".");
  if (!resource || !action) return false;

  const mod = (user.module_permissions as any)[resource];
  if (!mod) return false;

  return !!mod[action];
}
