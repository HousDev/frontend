import { api } from "./api";

export interface RoleDTO {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // e.g. ["user.create", "lead.read"]
  user_count: number;
  is_system: boolean;
  created_at: string;
}

export interface PermissionDTO {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

// ✅ PUT /rbac/roles/:roleId/permissions ka response
export interface UpdateRolePermissionsResponse {
  success: boolean;
  message: string;
}

export const rbacAPI = {
  /**
   * (Optional) GET /api/rbac/permissions
   * Agar backend me ye endpoint add karoge to:
   * return type: PermissionDTO[]
   */
  getPermissions: async (): Promise<PermissionDTO[]> => {
    const response = await api.get<PermissionDTO[]>("/rbac/permissions");
    return response.data || [];
  },

  /**
   * (Optional) GET /api/rbac/roles
   * Agar backend me ye endpoint add karoge to:
   * return type: RoleDTO[]
   */
  getRoles: async (): Promise<RoleDTO[]> => {
    const response = await api.get<RoleDTO[]>("/rbac/roles");
    return response.data || [];
  },

  /**
   * 🔹 Get permission keys for a role
   * GET /api/rbac/roles/:roleId/permissions
   * Backend se: ['user.create', 'lead.read', ...]
   */
  getRolePermissions: async (roleId: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/rbac/roles/${roleId}/permissions`);
    console.log("RBAC getRolePermissions response:", response.data);
    return response.data || [];
  },

  /**
   * 🔹 Replace permissions for a role
   * PUT /api/rbac/roles/:roleId/permissions
   * body: { permissions: string[] }
   * Backend se: { success: boolean; message: string }
   */
  updateRolePermissions: async (
    roleId: string,
    permissions: string[]
  ): Promise<UpdateRolePermissionsResponse> => {
    const response = await api.put<UpdateRolePermissionsResponse>(
      `/rbac/roles/${roleId}/permissions`,
      { permissions }
    );
    return response.data;
  },
};
