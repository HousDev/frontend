// // src/utils/permission.ts
// import { AuthUser } from "@/contexts/AuthContext";

// export function can(user: AuthUser | null | undefined, key: string): boolean {
//   if (!user || !user.module_permissions) return false;

//   const [resource, action] = key.split(".");
//   if (!resource || !action) return false;

//   const mod = (user.module_permissions as any)[resource];
//   if (!mod) return false;

//   return !!mod[action];
// }




// // src/utils/permission.ts
// import { User } from "@/contexts/AuthContext";

// /**
//  * permission key format: "resource.action", e.g. "lead.import" or "lead.export"
//  */
// export function can(user: User | null | undefined, key: string): boolean {
//   if (!user || !user.module_permissions) return false;

//   const parts = key.split(".");
//   if (parts.length < 2) return false;
//   const resource = parts[0];
//   const action = parts[1];

//   const mod = (user.module_permissions as any)[resource];
//   if (!mod) return false;

//   // action may be import/export/create/read/update/delete/manage/view etc
//   return !!mod[action];
// }




// src/utils/permission.ts
import { User } from "@/contexts/AuthContext";

/**
 * permission key format: "resource.action", e.g. "lead.import" or "lead.export"
 */
export function can(user: User | null | undefined, key: string): boolean {
  if (!user) return false;

  // Admin always gets full access
  if ((user.role || "").toLowerCase() === "admin") return true;

  if (!user.module_permissions) return false;

  // overview.full_access = true means full access for any role
  const overviewMod = (user.module_permissions as any)["overview"];
  if (overviewMod?.full_access) return true;

  const parts = key.split(".");
  if (parts.length < 2) return false;
  const resource = parts[0];
  const action = parts[1];

  const mod = (user.module_permissions as any)[resource];
  if (!mod) return false;

  return !!mod[action];
}
