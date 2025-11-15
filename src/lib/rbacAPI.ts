// src/lib/rbacAPI.ts
import { api } from "./api";

export interface RbacPermission {
  id: number | string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}

export const rbacAPI = {
  // -----------------------------------------------------
  // STATIC PERMISSIONS LIST (frontend se)
  // -----------------------------------------------------
  async getPermissions(): Promise<RbacPermission[]> {
    try {
      const staticPermissions: RbacPermission[] = [
        {
          id: "1",
          name: "Create Users",
          resource: "user",
          action: "create",
          description: "Create new user accounts",
          category: "user",
          is_active: true,
        },
        {
          id: "2",
          name: "View Users",
          resource: "user",
          action: "read",
          description: "View user information and profiles",
          category: "user",
          is_active: true,
        },
        {
          id: "3",
          name: "Update Users",
          resource: "user",
          action: "update",
          description: "Edit user information and settings",
          category: "user",
          is_active: true,
        },
        {
          id: "4",
          name: "Delete Users",
          resource: "user",
          action: "delete",
          description: "Remove user accounts",
          category: "user",
          is_active: true,
        },

        {
          id: "5",
          name: "Create Leads",
          resource: "lead",
          action: "create",
          description: "Add new leads to the system",
          category: "lead",
          is_active: true,
        },
        {
          id: "6",
          name: "View Leads",
          resource: "lead",
          action: "read",
          description: "Access lead information",
          category: "lead",
          is_active: true,
        },
        {
          id: "7",
          name: "Update Leads",
          resource: "lead",
          action: "update",
          description: "Edit lead details and status",
          category: "lead",
          is_active: true,
        },
        {
          id: "8",
          name: "Delete Leads",
          resource: "lead",
          action: "delete",
          description: "Remove leads from system",
          category: "lead",
          is_active: true,
        },

        {
          id: "9",
          name: "Create Properties",
          resource: "property",
          action: "create",
          description: "Add new property listings",
          category: "property",
          is_active: true,
        },
        {
          id: "10",
          name: "View Properties",
          resource: "property",
          action: "read",
          description: "Access property information",
          category: "property",
          is_active: true,
        },
        {
          id: "11",
          name: "Update Properties",
          resource: "property",
          action: "update",
          description: "Edit property details",
          category: "property",
          is_active: true,
        },
        {
          id: "12",
          name: "Delete Properties",
          resource: "property",
          action: "delete",
          description: "Remove property listings",
          category: "property",
          is_active: true,
        },

        {
          id: "13",
          name: "Create Activities",
          resource: "activity",
          action: "create",
          description: "Schedule new activities and tasks",
          category: "activity",
          is_active: true,
        },
        {
          id: "14",
          name: "View Activities",
          resource: "activity",
          action: "read",
          description: "Access activity information",
          category: "activity",
          is_active: true,
        },
        {
          id: "15",
          name: "Update Activities",
          resource: "activity",
          action: "update",
          description: "Edit activity details",
          category: "activity",
          is_active: true,
        },
        {
          id: "16",
          name: "Delete Activities",
          resource: "activity",
          action: "delete",
          description: "Remove activities and tasks",
          category: "activity",
          is_active: true,
        },

        {
          id: "17",
          name: "System Management",
          resource: "system",
          action: "manage",
          description: "Access system settings and configuration",
          category: "system",
          is_active: true,
        },
        {
          id: "18",
          name: "View Reports",
          resource: "report",
          action: "read",
          description: "Access analytics and reports",
          category: "report",
          is_active: true,
        },
        {
          id: "19",
          name: "Export Data",
          resource: "data",
          action: "export",
          description: "Export system data",
          category: "data",
          is_active: true,
        },
        {
          id: "20",
          name: "Import Data",
          resource: "data",
          action: "import",
          description: "Import data into system",
          category: "data",
          is_active: true,
        },
      ];

      return staticPermissions;
    } catch (err: any) {
      const msg =
        err?.message || "Failed to load static permissions";
      throw new Error(msg);
    }
  },

  // -----------------------------------------------------
  // GET /api/rbac/roles/:roleId/permissions
  // returns string[]: ['user.create', ...]
  // -----------------------------------------------------
  async getRolePermissions(roleId: string): Promise<string[]> {
    try {
      const res = await api.get(`/rbac/roles/${roleId}/permissions`);
      return res.data?.data || [];
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load role permissions";
      throw new Error(msg);
    }
  },

  // -----------------------------------------------------
  // PUT /api/rbac/roles/:roleId/permissions
  // Body: { permissions: [] }
  // -----------------------------------------------------
  async updateRolePermissions(
    roleId: string,
    permissions: string[]
  ): Promise<string[]> {
    try {
      const res = await api.put(`/rbac/roles/${roleId}/permissions`, {
        permissions,
      });

      return res.data?.data || [];
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update role permissions";
      throw new Error(msg);
    }
  },
};
