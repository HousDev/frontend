
// src/pages/settings/RolesPermissionsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Edit, Lock, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { masterDataAPI } from "@/lib/mastersAPI";
import { toast } from "react-toastify";
import { rbacAPI } from "@/lib/rbacAPI";

interface Role {
  /** REAL master id (number/uuid) – this will go into role_permissions.role_id */
  id: string | number;
  /** optional slug for display / debugging */
  slug?: string;
  name: string;
  description: string;
  permissions: string[]; // ["lead.create", "lead.export", ...]
  user_count: number;
  is_system: boolean;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

const RolesPermissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    console.log("CURRENT USER ===>", user);
  }, [user]);

  useEffect(() => {
    fetchMasterRoles();
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMasterRoles = async () => {
    setLoading(true);
    try {
      const commonMasterTypes: any[] = await masterDataAPI.getAllMasterTypes(
        "common"
      );

      const roleType = commonMasterTypes.find(
        (t) =>
          ((t.name || "") as string).toLowerCase() === "role" ||
          ((t.name || "") as string).toLowerCase() === "roles"
      );

      if (!roleType) {
        console.warn("Role master type not found — roles will be empty");
        setRoles([]);
        return;
      }

      const masterRoles = await masterDataAPI.getMasterValues(roleType.id);
      if (!Array.isArray(masterRoles)) {
        console.warn(
          "Master roles response is not an array — roles will be empty"
        );
        setRoles([]);
        return;
      }

      // ✅ Map master roles: id = REAL master id, slug = lowercased value/name
      const mapped: Role[] = masterRoles.map((item: any) => {
        const rawName = item.value || item.name || `Role ${item.id}`;
        const slug = String(rawName).toLowerCase().trim();

        return {
          id: item.id, // ⭐ this goes into DB role_permissions.role_id
          slug,
          name: rawName,
          description: item.description || item.meta?.description || "",
          permissions: Array.isArray(item.permissions)
            ? item.permissions.map((p: any) =>
              typeof p === "string" ? p : `${p.resource}.${p.action}`
            )
            : [],
          user_count:
            typeof item.user_count === "number" ? item.user_count : 0,
          is_system: !!item.is_system,
          created_at: item.created_at || new Date().toISOString(),
        };
      });

      // ✅ Merge DB RBAC permissions if available
      try {
        const merged = await Promise.all(
          mapped.map(async (role) => {
            try {
              const dbPermissions = await rbacAPI.getRolePermissions(
                String(role.id) // always send string id
              );
              if (Array.isArray(dbPermissions) && dbPermissions.length > 0) {
                return {
                  ...role,
                  permissions: dbPermissions,
                };
              }
              return role;
            } catch (err) {
              console.warn(
                "Failed to load role permissions for role",
                role.id,
                err
              );
              return role;
            }
          })
        );
        setRoles(merged);
      } catch (err) {
        console.warn(
          "Failed to merge DB role permissions, using master only",
          err
        );
        setRoles(mapped);
      }
    } catch (error) {
      console.error("Failed to load roles from master API:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const staticPermissions: Permission[] = [
        // ----- Users -----
        {
          id: "1",
          name: "Create Users",
          resource: "user",
          action: "create",
          description: "Create new user accounts",
        },
        {
          id: "2",
          name: "View Users",
          resource: "user",
          action: "read",
          description: "View user information and profiles",
        },
        {
          id: "3",
          name: "Update Users",
          resource: "user",
          action: "update",
          description: "Edit user information and settings",
        },
        {
          id: "4",
          name: "Delete Users",
          resource: "user",
          action: "delete",
          description: "Remove user accounts",
        },

        // ----- Leads -----
        {
          id: "5",
          name: "Create Leads",
          resource: "lead",
          action: "create",
          description: "Add new leads to the system",
        },
        {
          id: "6",
          name: "View Leads",
          resource: "lead",
          action: "read",
          description: "Access lead information",
        },
        {
          id: "7",
          name: "Update Leads",
          resource: "lead",
          action: "update",
          description: "Edit lead details and status",
        },
        {
          id: "8",
          name: "Delete Leads",
          resource: "lead",
          action: "delete",
          description: "Remove leads from system",
        },
        {
          id: "21",
          name: "Export Leads",
          resource: "lead",
          action: "export",
          description: "Export leads data (CSV/Excel)",
        },
        {
          id: "22",
          name: "Import Leads",
          resource: "lead",
          action: "import",
          description: "Import leads from CSV/Excel",
        },

        // ----- Properties -----
        {
          id: "9",
          name: "Create Properties",
          resource: "property",
          action: "create",
          description: "Add new property listings",
        },
        {
          id: "10",
          name: "View Properties",
          resource: "property",
          action: "read",
          description: "Access property information",
        },
        {
          id: "11",
          name: "Update Properties",
          resource: "property",
          action: "update",
          description: "Edit property details",
        },
        {
          id: "12",
          name: "Delete Properties",
          resource: "property",
          action: "delete",
          description: "Remove property listings",
        },

        // ----- Activities -----
        {
          id: "13",
          name: "Create Activities",
          resource: "activity",
          action: "create",
          description: "Schedule new activities and tasks",
        },
        {
          id: "14",
          name: "View Activities",
          resource: "activity",
          action: "read",
          description: "Access activity information",
        },
        {
          id: "15",
          name: "Update Activities",
          resource: "activity",
          action: "update",
          description: "Edit activity details",
        },
        {
          id: "16",
          name: "Delete Activities",
          resource: "activity",
          action: "delete",
          description: "Remove activities and tasks",
        },

        // ----- System / Reports / Data -----
        {
          id: "17",
          name: "System Management",
          resource: "system",
          action: "manage",
          description: "Access system settings and configuration",
        },
        {
          id: "18",
          name: "View Reports",
          resource: "report",
          action: "read",
          description: "Access analytics and reports",
        },
        {
          id: "19",
          name: "Export Data (Global)",
          resource: "data",
          action: "export",
          description: "Export generic system data",
        },
        {
          id: "20",
          name: "Import Data (Global)",
          resource: "data",
          action: "import",
          description: "Import generic data into system",
        },
      ];

      setPermissions(staticPermissions);
    } catch (error) {
      console.error("Error loading static permissions:", error);
      toast.error("Failed to load permissions");
    }
  };

  const handleUpdateRole = async (role: Role) => {
    try {
      // ✅ always send REAL id as string
      await rbacAPI.updateRolePermissions(
        String(role.id),
        role.permissions
      );

      setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
      setEditingRole(null);
      toast.success("Role permissions updated successfully");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error?.message || "Failed to update role permissions");
    }
  };

  const togglePermission = (
    permissionId: string,
    rolePermissions: string[]
  ) => {
    const permission = permissions.find((p) => p.id === permissionId);
    if (!permission) return rolePermissions;

    const permissionKey = `${permission.resource}.${permission.action}`;
    if (rolePermissions.includes(permissionKey)) {
      return rolePermissions.filter((p) => p !== permissionKey);
    } else {
      return [...rolePermissions, permissionKey];
    }
  };

  const hasPermission = (permissionId: string, rolePermissions: string[]) => {
    const permission = permissions.find((p) => p.id === permissionId);
    if (!permission) return false;
    const permissionKey = `${permission.resource}.${permission.action}`;
    return rolePermissions.includes(permissionKey);
  };

  const groupPermissionsByResource = () => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach((permission) => {
      if (!grouped[permission.resource]) grouped[permission.resource] = [];
      grouped[permission.resource].push(permission);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3 sm:gap-0">
          <Link to="/dashboard/settings" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center sm:justify-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>

          <div className="mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Roles & Permissions
            </h1>
            <p className="text-gray-600 text-xs">
              Manage user roles and their access permissions
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "roles"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Roles ({roles.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "permissions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Permissions ({permissions.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "roles" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <div
                    key={String(role.id)}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {role.name}
                          </h3>
                          {role.is_system && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {role.description}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRole(role)}
                          disabled={role.is_system}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-medium">
                          {role.user_count}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Permissions:</span>
                        <span className="font-medium">
                          {role.permissions.length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(role.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Permissions:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-6">
              {Object.entries(groupPermissionsByResource()).map(
                ([resource, resourcePermissions]) => (
                  <div key={resource} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                      {resource} Permissions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {resourcePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="bg-white rounded border border-gray-200 p-4"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Lock className="h-4 w-4 text-gray-400" />
                            <h4 className="text-sm font-medium text-gray-900">
                              {permission.name}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600">
                            {permission.description}
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              {permission.resource}.{permission.action}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Permissions Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Edit Permissions - {editingRole.name}
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={editingRole.name}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter role name"
                    disabled={editingRole.is_system}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingRole.description}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter role description"
                    disabled={editingRole.is_system}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Permissions ({editingRole.permissions.length} selected)
                </h4>
                <div className="space-y-4">
                  {Object.entries(groupPermissionsByResource()).map(
                    ([resource, resourcePermissions]) => (
                      <div
                        key={resource}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h5 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                          {resource} Permissions
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {resourcePermissions.map((permission) => {
                            const isChecked = hasPermission(
                              permission.id,
                              editingRole.permissions
                            );

                            return (
                              <label
                                key={permission.id}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const newPermissions = togglePermission(
                                      permission.id,
                                      editingRole.permissions
                                    );
                                    setEditingRole({
                                      ...editingRole,
                                      permissions: newPermissions,
                                    });
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  disabled={editingRole.is_system}
                                />
                                <span className="text-sm text-gray-700">
                                  {permission.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleUpdateRole(editingRole)}
                  disabled={!editingRole.name || editingRole.is_system}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Permissions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingRole(null)}
                >
                  Cancel
                </Button>
              </div>

              {editingRole.is_system && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        System Role
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700">
                        <p>
                          This is a system role. Some permissions cannot be
                          modified for system roles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsPage;
