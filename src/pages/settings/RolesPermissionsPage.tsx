
// // src/pages/settings/RolesPermissionsPage.tsx
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { ArrowLeft, Shield, Edit, Lock, Save } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import Button from "@/components/ui/Button";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";
// import { masterDataAPI } from "@/lib/mastersAPI";
// import { toast } from "react-toastify";
// import { rbacAPI } from "@/lib/rbacAPI";

// interface Role {
//   id: string;
//   name: string;
//   description: string;
//   permissions: string[];
//   user_count: number;
//   is_system: boolean;
//   created_at: string;
// }

// interface Permission {
//   id: string;
//   name: string;
//   resource: string;
//   action: string;
//   description: string;
// }

// const RolesPermissionsPage: React.FC = () => {
//   const { user } = useAuth();
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [permissions, setPermissions] = useState<Permission[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
//   const [editingRole, setEditingRole] = useState<Role | null>(null);

//   useEffect(() => {
//     console.log("CURRENT USER ===>", user);
//   }, [user]);

//   useEffect(() => {
//     fetchMasterRoles();
//     fetchPermissions();
//   }, []);

//   const fetchMasterRoles = async () => {
//     setLoading(true);
//     try {
//       const commonMasterTypes: any[] = await masterDataAPI.getAllMasterTypes("common");
//       const roleType = commonMasterTypes.find(
//         (t) => ((t.name || "") as string).toLowerCase() === "role" || ((t.name || "") as string).toLowerCase() === "roles"
//       );

//       if (!roleType) {
//         console.warn("Role master type not found — roles will be empty");
//         setRoles([]);
//         return;
//       }

//       const masterRoles = await masterDataAPI.getMasterValues(roleType.id);
//       if (!Array.isArray(masterRoles)) {
//         console.warn("Master roles response is not an array — roles will be empty");
//         setRoles([]);
//         return;
//       }

//       const mapped: Role[] = masterRoles.map((item: any) => {
//         const rawName = item.value || item.name || `Role ${item.id}`;
//         const slug = String(rawName).toLowerCase().trim();

//         return {
//           id: slug,
//           name: rawName,
//           description: item.description || item.meta?.description || "",
//           permissions: Array.isArray(item.permissions)
//             ? item.permissions.map((p: any) => (typeof p === "string" ? p : `${p.resource}.${p.action}`))
//             : [],
//           user_count: typeof item.user_count === "number" ? item.user_count : 0,
//           is_system: !!item.is_system,
//           created_at: item.created_at || new Date().toISOString(),
//         };
//       });

//       // DB RBAC se merge
//       try {
//         const merged = await Promise.all(
//           mapped.map(async (role) => {
//             try {
//               const dbPermissions = await rbacAPI.getRolePermissions(role.id);
//               if (Array.isArray(dbPermissions) && dbPermissions.length > 0) {
//                 return {
//                   ...role,
//                   permissions: dbPermissions,
//                 };
//               }
//               return role;
//             } catch (err) {
//               console.warn("Failed to load role permissions for role", role.id, err);
//               return role;
//             }
//           })
//         );
//         setRoles(merged);
//       } catch (err) {
//         console.warn("Failed to merge DB role permissions, using master only", err);
//         setRoles(mapped);
//       }
//     } catch (error) {
//       console.error("Failed to load roles from master API:", error);
//       setRoles([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPermissions = async () => {
//     try {
//       const staticPermissions: Permission[] = [
//         // =============================
//         // USER PERMISSIONS
//         // =============================
//         { id: "1", name: "Create Users", resource: "user", action: "create", description: "Create new user accounts" },
//         { id: "2", name: "View Users", resource: "user", action: "read", description: "View user information and profiles" },
//         { id: "3", name: "Update Users", resource: "user", action: "update", description: "Edit user information and settings" },
//         { id: "4", name: "Delete Users", resource: "user", action: "delete", description: "Remove user accounts" },

//         // =============================
//         // LEADS PERMISSIONS
//         // =============================
//         { id: "5", name: "Create Leads", resource: "lead", action: "create", description: "Add new leads to the system" },
//         { id: "6", name: "View Leads", resource: "lead", action: "read", description: "Access lead information" },
//         { id: "7", name: "Update Leads", resource: "lead", action: "update", description: "Edit lead details and status" },
//         { id: "8", name: "Delete Leads", resource: "lead", action: "delete", description: "Remove leads from system" },
//         { id: "35", name: "Assign Leads", resource: "lead", action: "assign", description: "Assign leads to team members" },
//         { id: "36", name: "Bulk Delete Leads", resource: "lead", action: "bulk_delete", description: "Delete multiple leads at once" },

//         // =============================
//         // FOLLOWUPS PERMISSIONS - UPDATED
//         // =============================
//         { id: "46", name: "Create Followups", resource: "followup", action: "create", description: "Add followup entries to leads" },
//         { id: "47", name: "View Followups", resource: "followup", action: "read", description: "View existing followup entries" },
//         { id: "48", name: "Update Followups", resource: "followup", action: "update", description: "Edit existing followup entries" },
//         { id: "49", name: "Delete Followups", resource: "followup", action: "delete", description: "Remove followup entries from leads" },

//         // =============================
//         // PROPERTIES PERMISSIONS
//         // =============================
//         { id: "9", name: "Create Properties", resource: "property", action: "create", description: "Add new property listings" },
//         { id: "10", name: "View Properties", resource: "property", action: "read", description: "Access property information" },
//         { id: "11", name: "Update Properties", resource: "property", action: "update", description: "Edit property details" },
//         { id: "12", name: "Delete Properties", resource: "property", action: "delete", description: "Remove property listings" },
//         { id: "37", name: "Assign Properties", resource: "property", action: "assign", description: "Assign properties to agents" },
//         { id: "38", name: "Bulk Delete Properties", resource: "property", action: "bulk_delete", description: "Delete multiple properties at once" },

//         // =============================
//         // BUYERS PERMISSIONS
//         // =============================
//         { id: "21", name: "Create Buyers", resource: "buyer", action: "create", description: "Add new buyer records" },
//         { id: "22", name: "View Buyers", resource: "buyer", action: "read", description: "View buyer details" },
//         { id: "23", name: "Update Buyers", resource: "buyer", action: "update", description: "Edit buyer records" },
//         { id: "24", name: "Delete Buyers", resource: "buyer", action: "delete", description: "Delete buyer records" },
//         { id: "39", name: "Assign Buyers", resource: "buyer", action: "assign", description: "Assign buyers to agents" },
//         { id: "40", name: "Bulk Delete Buyers", resource: "buyer", action: "bulk_delete", description: "Delete multiple buyers at once" },

//         // =============================
//         // SELLERS PERMISSIONS
//         // =============================
//         { id: "25", name: "Create Sellers", resource: "seller", action: "create", description: "Add new seller records" },
//         { id: "26", name: "View Sellers", resource: "seller", action: "read", description: "View seller details" },
//         { id: "27", name: "Update Sellers", resource: "seller", action: "update", description: "Edit seller records" },
//         { id: "28", name: "Delete Sellers", resource: "seller", action: "delete", description: "Delete seller records" },
//         { id: "41", name: "Assign Sellers", resource: "seller", action: "assign", description: "Assign sellers to agents" },
//         { id: "42", name: "Bulk Delete Sellers", resource: "seller", action: "bulk_delete", description: "Delete multiple sellers at once" },

//         // =============================
//         // BLOG / CMS PERMISSIONS
//         // =============================
//         { id: "29", name: "Create Blogs", resource: "blog", action: "create", description: "Add new blog posts" },
//         { id: "30", name: "View Blogs", resource: "blog", action: "read", description: "View blog posts" },
//         { id: "31", name: "Update Blogs", resource: "blog", action: "update", description: "Edit existing blog posts" },
//         { id: "32", name: "Delete Blogs", resource: "blog", action: "delete", description: "Delete blog posts" },
//         { id: "43", name: "Bulk Delete Blogs", resource: "blog", action: "bulk_delete", description: "Delete multiple blog posts at once" },

//         // =============================
//         // ACTIVITIES PERMISSIONS
//         // =============================
//         { id: "13", name: "Create Activities", resource: "activity", action: "create", description: "Schedule new activities and tasks" },
//         { id: "14", name: "View Activities", resource: "activity", action: "read", description: "Access activity information" },
//         { id: "15", name: "Update Activities", resource: "activity", action: "update", description: "Edit activity details" },
//         { id: "16", name: "Delete Activities", resource: "activity", action: "delete", description: "Remove activities and tasks" },
//         { id: "44", name: "Assign Activities", resource: "activity", action: "assign", description: "Assign activities to team members" },
//         { id: "45", name: "Bulk Delete Activities", resource: "activity", action: "bulk_delete", description: "Delete multiple activities at once" },

//         // =============================
//         // SYSTEM
//         // =============================
//         { id: "17", name: "System Management", resource: "system", action: "manage", description: "Access system settings and configuration" },

//         // =============================
//         // REPORTS
//         // =============================
//         { id: "18", name: "View Reports", resource: "report", action: "read", description: "Access analytics and reports" },

//         // =============================
//         // EXPORT / IMPORT
//         // =============================
//         { id: "19", name: "Export Data", resource: "data", action: "export", description: "Export system data" },
//         { id: "20", name: "Import Data", resource: "data", action: "import", description: "Import data into system" },
//       ];

//       setPermissions(staticPermissions);
//     } catch (error) {
//       console.error("Error loading static permissions:", error);
//       toast.error("Failed to load permissions");
//     }
//   };

//   const handleUpdateRole = async (role: Role) => {
//     try {
//       await rbacAPI.updateRolePermissions(role.id, role.permissions);

//       setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
//       setEditingRole(null);
//       toast.success("Role permissions updated successfully");
//     } catch (error: any) {
//       console.error("Error updating role:", error);
//       toast.error(error?.message || "Failed to update role permissions");
//     }
//   };

//   const togglePermission = (permissionId: string, rolePermissions: string[]) => {
//     const permission = permissions.find((p) => p.id === permissionId);
//     if (!permission) return rolePermissions;

//     const permissionKey = `${permission.resource}.${permission.action}`;
//     if (rolePermissions.includes(permissionKey)) {
//       return rolePermissions.filter((p) => p !== permissionKey);
//     } else {
//       return [...rolePermissions, permissionKey];
//     }
//   };

//   const hasPermission = (permissionId: string, rolePermissions: string[]) => {
//     const permission = permissions.find((p) => p.id === permissionId);
//     if (!permission) return false;
//     const permissionKey = `${permission.resource}.${permission.action}`;
//     return rolePermissions.includes(permissionKey);
//   };

//   const groupPermissionsByResource = () => {
//     const grouped: { [key: string]: Permission[] } = {};
//     permissions.forEach((permission) => {
//       if (!grouped[permission.resource]) grouped[permission.resource] = [];
//       grouped[permission.resource].push(permission);
//     });
//     return grouped;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center py-12">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="py-4">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3 sm:gap-0">
//           <Link to="/dashboard/settings" className="w-full sm:w-auto">
//             <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center sm:justify-start">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Settings
//             </Button>
//           </Link>

//           <div className="mb-1">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Roles & Permissions</h1>
//             <p className="text-gray-600 text-xs">Manage user roles and their access permissions</p>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow ">
//         <div className="border-b border-gray-200">
//           <nav className="flex space-x-8" aria-label="Tabs">
//             <button
//               onClick={() => setActiveTab("roles")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "roles"
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//             >
//               <div className="flex items-center space-x-2">
//                 <Shield className="h-4 w-4" />
//                 <span>Roles ({roles.length})</span>
//               </div>
//             </button>
//             <button
//               onClick={() => setActiveTab("permissions")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "permissions"
//                   ? "border-blue-500 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//             >
//               <div className="flex items-center space-x-2">
//                 <Lock className="h-4 w-4" />
//                 <span>Permissions ({permissions.length})</span>
//               </div>
//             </button>
//           </nav>
//         </div>

//         <div className="p-6">
//           {activeTab === "roles" && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {roles.map((role) => (
//                   <div key={role.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-2">
//                           <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
//                           {role.is_system && (
//                             <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">System</span>
//                           )}
//                         </div>
//                         <p className="text-sm text-gray-600 mt-1">{role.description}</p>
//                       </div>
//                       <div className="flex space-x-1">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => setEditingRole(role)}
//                           disabled={role.is_system}
//                         >
//                           <Edit className="h-3 w-3" />
//                         </Button>
//                       </div>
//                     </div>
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="text-gray-600">Users:</span>
//                         <span className="font-medium">{role.user_count}</span>
//                       </div>
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="text-gray-600">Permissions:</span>
//                         <span className="font-medium">{role.permissions.length}</span>
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Created: {new Date(role.created_at).toLocaleDateString()}
//                       </div>
//                     </div>

//                     <div className="mt-4 pt-4 border-t border-gray-200">
//                       <h4 className="text-sm font-medium text-gray-700 mb-2">Key Permissions:</h4>
//                       <div className="flex flex-wrap gap-1">
//                         {/* Show important permissions first */}
//                         {role.permissions
//                           .filter(p => p.includes('lead.') || p.includes('followup.') || p.includes('property.'))
//                           .slice(0, 4)
//                           .map((permission, idx) => (
//                             <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
//                               {permission.split('.')[1]}
//                             </span>
//                           ))}
//                         {role.permissions.length > 4 && (
//                           <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
//                             +{role.permissions.length - 4} more
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {activeTab === "permissions" && (
//             <div className="space-y-6">
//               {Object.entries(groupPermissionsByResource()).map(([resource, resourcePermissions]) => (
//                 <div key={resource} className="bg-gray-50 rounded-lg p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
//                     {resource} Permissions
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {resourcePermissions.map((permission) => (
//                       <div key={permission.id} className="bg-white rounded border border-gray-200 p-4">
//                         <div className="flex items-center space-x-2 mb-2">
//                           <Lock className="h-4 w-4 text-gray-400" />
//                           <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
//                         </div>
//                         <p className="text-xs text-gray-600">{permission.description}</p>
//                         <div className="mt-2">
//                           <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
//                             {permission.resource}.{permission.action}
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Edit Role Permissions Modal */}
//       {editingRole && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">
//               Edit Permissions - {editingRole.name}
//             </h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
//                   <input
//                     type="text"
//                     value={editingRole.name}
//                     onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                     placeholder="Enter role name"
//                     disabled={editingRole.is_system}
//                   />
//                 </div> */}
//                 {/* <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                   <input
//                     type="text"
//                     value={editingRole.description}
//                     onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2"
//                     placeholder="Enter role description"
//                     disabled={editingRole.is_system}
//                   />
//                 </div> */}
//               </div>

//               <div>
//                 <h4 className="text-md font-medium text-gray-900 mb-4">
//                   Permissions ({editingRole.permissions.length} selected)
//                 </h4>
//                 <div className="space-y-4">
//                   {Object.entries(groupPermissionsByResource()).map(([resource, resourcePermissions]) => (
//                     <div key={resource} className="border border-gray-200 rounded-lg p-4">
//                       <h5 className="text-sm font-medium text-gray-900 mb-3 capitalize">
//                         {resource} Permissions
//                       </h5>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                         {resourcePermissions.map((permission) => {
//                           const isChecked = hasPermission(permission.id, editingRole.permissions);

//                           return (
//                             <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={isChecked}
//                                 onChange={() => {
//                                   const newPermissions = togglePermission(permission.id, editingRole.permissions);
//                                   setEditingRole({
//                                     ...editingRole,
//                                     permissions: newPermissions,
//                                   });
//                                 }}
//                                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                                 disabled={editingRole.is_system}
//                               />
//                               <span className="text-sm text-gray-700">{permission.name}</span>
//                             </label>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex space-x-3">
//                 <Button
//                   onClick={() => handleUpdateRole(editingRole)}
//                   disabled={!editingRole.name || editingRole.is_system}
//                 >
//                   <Save className="h-4 w-4 mr-2" />
//                   Update Permissions
//                 </Button>
//                 <Button variant="outline" onClick={() => setEditingRole(null)}>
//                   Cancel
//                 </Button>
//               </div>

//               {editingRole.is_system && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0">
//                       <Shield className="h-5 w-5 text-yellow-400" />
//                     </div>
//                     <div className="ml-3">
//                       <h3 className="text-sm font-medium text-yellow-800">System Role</h3>
//                       <div className="mt-1 text-sm text-yellow-700">
//                         <p>This is a system role. Some permissions cannot be modified for system roles.</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RolesPermissionsPage;
// src/pages/settings/RolesPermissionsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Edit, Lock, Save, Users, Key, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { masterDataAPI } from "@/lib/mastersAPI";
import { toast } from "react-toastify";
import { rbacAPI } from "@/lib/rbacAPI";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
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

// Brand colors from Resale Expert logo
// Primary navy: #1a3a5c  Orange accent: #e87722

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
  }, []);

  const fetchMasterRoles = async () => {
    setLoading(true);
    try {
      const commonMasterTypes: any[] = await masterDataAPI.getAllMasterTypes("common");
      const roleType = commonMasterTypes.find(
        (t) => ((t.name || "") as string).toLowerCase() === "role" || ((t.name || "") as string).toLowerCase() === "roles"
      );

      if (!roleType) {
        console.warn("Role master type not found — roles will be empty");
        setRoles([]);
        return;
      }

      const masterRoles = await masterDataAPI.getMasterValues(roleType.id);
      if (!Array.isArray(masterRoles)) {
        console.warn("Master roles response is not an array — roles will be empty");
        setRoles([]);
        return;
      }

      const mapped: Role[] = masterRoles.map((item: any) => {
        const rawName = item.value || item.name || `Role ${item.id}`;
        const slug = String(rawName).toLowerCase().trim();

        return {
          id: slug,
          name: rawName,
          description: item.description || item.meta?.description || "",
          permissions: Array.isArray(item.permissions)
            ? item.permissions.map((p: any) => (typeof p === "string" ? p : `${p.resource}.${p.action}`))
            : [],
          user_count: typeof item.user_count === "number" ? item.user_count : 0,
          is_system: !!item.is_system,
          created_at: item.created_at || new Date().toISOString(),
        };
      });

      try {
        const merged = await Promise.all(
          mapped.map(async (role) => {
            try {
              const dbPermissions = await rbacAPI.getRolePermissions(role.id);
              if (Array.isArray(dbPermissions) && dbPermissions.length > 0) {
                return { ...role, permissions: dbPermissions };
              }
              return role;
            } catch (err) {
              console.warn("Failed to load role permissions for role", role.id, err);
              return role;
            }
          })
        );
        setRoles(merged);
      } catch (err) {
        console.warn("Failed to merge DB role permissions, using master only", err);
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
        { id: "1", name: "Create Users", resource: "user", action: "create", description: "Create new user accounts" },
        { id: "2", name: "View Users", resource: "user", action: "read", description: "View user information and profiles" },
        { id: "3", name: "Update Users", resource: "user", action: "update", description: "Edit user information and settings" },
        { id: "4", name: "Delete Users", resource: "user", action: "delete", description: "Remove user accounts" },
        { id: "5", name: "Create Leads", resource: "lead", action: "create", description: "Add new leads to the system" },
        { id: "6", name: "View Leads", resource: "lead", action: "read", description: "Access lead information" },
        { id: "7", name: "Update Leads", resource: "lead", action: "update", description: "Edit lead details and status" },
        { id: "8", name: "Delete Leads", resource: "lead", action: "delete", description: "Remove leads from system" },
        { id: "35", name: "Assign Leads", resource: "lead", action: "assign", description: "Assign leads to team members" },
        { id: "36", name: "Bulk Delete Leads", resource: "lead", action: "bulk_delete", description: "Delete multiple leads at once" },
        { id: "46", name: "Create Followups", resource: "followup", action: "create", description: "Add followup entries to leads" },
        { id: "47", name: "View Followups", resource: "followup", action: "read", description: "View existing followup entries" },
        { id: "48", name: "Update Followups", resource: "followup", action: "update", description: "Edit existing followup entries" },
        { id: "49", name: "Delete Followups", resource: "followup", action: "delete", description: "Remove followup entries from leads" },
        { id: "9", name: "Create Properties", resource: "property", action: "create", description: "Add new property listings" },
        { id: "10", name: "View Properties", resource: "property", action: "read", description: "Access property information" },
        { id: "11", name: "Update Properties", resource: "property", action: "update", description: "Edit property details" },
        { id: "12", name: "Delete Properties", resource: "property", action: "delete", description: "Remove property listings" },
        { id: "37", name: "Assign Properties", resource: "property", action: "assign", description: "Assign properties to agents" },
        { id: "38", name: "Bulk Delete Properties", resource: "property", action: "bulk_delete", description: "Delete multiple properties at once" },
        { id: "21", name: "Create Buyers", resource: "buyer", action: "create", description: "Add new buyer records" },
        { id: "22", name: "View Buyers", resource: "buyer", action: "read", description: "View buyer details" },
        { id: "23", name: "Update Buyers", resource: "buyer", action: "update", description: "Edit buyer records" },
        { id: "24", name: "Delete Buyers", resource: "buyer", action: "delete", description: "Delete buyer records" },
        { id: "39", name: "Assign Buyers", resource: "buyer", action: "assign", description: "Assign buyers to agents" },
        { id: "40", name: "Bulk Delete Buyers", resource: "buyer", action: "bulk_delete", description: "Delete multiple buyers at once" },
        { id: "25", name: "Create Sellers", resource: "seller", action: "create", description: "Add new seller records" },
        { id: "26", name: "View Sellers", resource: "seller", action: "read", description: "View seller details" },
        { id: "27", name: "Update Sellers", resource: "seller", action: "update", description: "Edit seller records" },
        { id: "28", name: "Delete Sellers", resource: "seller", action: "delete", description: "Delete seller records" },
        { id: "41", name: "Assign Sellers", resource: "seller", action: "assign", description: "Assign sellers to agents" },
        { id: "42", name: "Bulk Delete Sellers", resource: "seller", action: "bulk_delete", description: "Delete multiple sellers at once" },
        { id: "29", name: "Create Blogs", resource: "blog", action: "create", description: "Add new blog posts" },
        { id: "30", name: "View Blogs", resource: "blog", action: "read", description: "View blog posts" },
        { id: "31", name: "Update Blogs", resource: "blog", action: "update", description: "Edit existing blog posts" },
        { id: "32", name: "Delete Blogs", resource: "blog", action: "delete", description: "Delete blog posts" },
        { id: "43", name: "Bulk Delete Blogs", resource: "blog", action: "bulk_delete", description: "Delete multiple blog posts at once" },
        { id: "13", name: "Create Activities", resource: "activity", action: "create", description: "Schedule new activities and tasks" },
        { id: "14", name: "View Activities", resource: "activity", action: "read", description: "Access activity information" },
        { id: "15", name: "Update Activities", resource: "activity", action: "update", description: "Edit activity details" },
        { id: "16", name: "Delete Activities", resource: "activity", action: "delete", description: "Remove activities and tasks" },
        { id: "44", name: "Assign Activities", resource: "activity", action: "assign", description: "Assign activities to team members" },
        { id: "45", name: "Bulk Delete Activities", resource: "activity", action: "bulk_delete", description: "Delete multiple activities at once" },
        { id: "17", name: "System Management", resource: "system", action: "manage", description: "Access system settings and configuration" },
        { id: "18", name: "View Reports", resource: "report", action: "read", description: "Access analytics and reports" },
        { id: "19", name: "Export Data", resource: "data", action: "export", description: "Export system data" },
        { id: "20", name: "Import Data", resource: "data", action: "import", description: "Import data into system" },
      ];
      setPermissions(staticPermissions);
    } catch (error) {
      console.error("Error loading static permissions:", error);
      toast.error("Failed to load permissions");
    }
  };

  const handleUpdateRole = async (role: Role) => {
    try {
      await rbacAPI.updateRolePermissions(role.id, role.permissions);
      setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
      setEditingRole(null);
      toast.success("Role permissions updated successfully");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error?.message || "Failed to update role permissions");
    }
  };

  const togglePermission = (permissionId: string, rolePermissions: string[]) => {
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

  // Resource icon/color map
  const resourceMeta: Record<string, { color: string; bg: string }> = {
    user:     { color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
    lead:     { color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
    followup: { color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
    property: { color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200" },
    buyer:    { color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    seller:   { color: "text-rose-700",   bg: "bg-rose-50 border-rose-200" },
    blog:     { color: "text-teal-700",   bg: "bg-teal-50 border-teal-200" },
    activity: { color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
    system:   { color: "text-gray-700",   bg: "bg-gray-50 border-gray-200" },
    report:   { color: "text-cyan-700",   bg: "bg-cyan-50 border-cyan-200" },
    data:     { color: "text-slate-700",  bg: "bg-slate-50 border-slate-200" },
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-2">

      {/* ── Page Header ── */}
      <div className="mb-5">
        {/* Back + breadcrumb */}
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
          <Link to="/dashboard/settings" className="flex items-center gap-1 text-[#1a3a5c] hover:text-[#e87722] font-medium transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Settings
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-500">Roles &amp; Permissions</span>
        </div>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Brand accent bar */}
            <div className="w-1 h-10 rounded-full bg-[#e87722] shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a3a5c] leading-tight">
                Roles &amp; Permissions
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Manage user roles and their access permissions</p>
            </div>
          </div>
          {/* Stats pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a3a5c] shadow-sm">
              <Shield className="h-3.5 w-3.5 text-[#e87722]" />
              {roles.length} Roles
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a3a5c] shadow-sm">
              <Key className="h-3.5 w-3.5 text-[#e87722]" />
              {permissions.length} Permissions
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4 sm:px-6 sticky top-0 bg-white z-10">
          <nav className="flex gap-0" aria-label="Tabs">
            {(["roles", "permissions"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-[#e87722] text-[#e87722]"
                    : "border-transparent text-gray-500 hover:text-[#1a3a5c] hover:border-gray-300"
                }`}
              >
                {tab === "roles" ? <Shield className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <span className="capitalize">{tab}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${
                  activeTab === tab ? "bg-orange-100 text-[#e87722]" : "bg-gray-100 text-gray-500"
                }`}>
                  {tab === "roles" ? roles.length : permissions.length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-6">

          {/* ── ROLES TAB ── */}
          {activeTab === "roles" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="group relative border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-[#e87722] hover:shadow-md transition-all duration-200 bg-white overflow-hidden"
                >
                  {/* Subtle top accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1a3a5c] to-[#e87722] opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Role header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#1a3a5c]/8 border border-[#1a3a5c]/15 flex items-center justify-center shrink-0">
                        <Shield className="h-4 w-4 text-[#1a3a5c]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-[#1a3a5c] truncate">{role.name}</h3>
                          {role.is_system && (
                            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-[#1a3a5c] text-white rounded">
                              System
                            </span>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{role.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingRole(role)}
                      disabled={role.is_system}
                      className="shrink-0 ml-2 p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#e87722] hover:border-[#e87722] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={role.is_system ? "System role cannot be edited" : "Edit permissions"}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold text-[#1a3a5c]">{role.user_count}</span> users
                    </div>
                    <div className="w-px h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Key className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold text-[#1a3a5c]">{role.permissions.length}</span> permissions
                    </div>
                  </div>

                  {/* Key permissions */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions
                        .filter(p => p.includes('lead.') || p.includes('followup.') || p.includes('property.'))
                        .slice(0, 4)
                        .map((permission, idx) => (
                          <span key={idx} className="inline-block px-2 py-0.5 text-[10px] font-medium bg-orange-50 text-[#e87722] border border-orange-100 rounded-full">
                            {permission.split('.')[1]}
                          </span>
                        ))}
                      {role.permissions.length > 4 && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">
                          +{role.permissions.length - 4} more
                        </span>
                      )}
                      {role.permissions.length === 0 && (
                        <span className="text-[10px] text-gray-300 italic">No permissions assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Created date */}
                  <p className="text-[10px] text-gray-300 mt-2">
                    Created {new Date(role.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}

              {roles.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                  <Shield className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No roles found</p>
                </div>
              )}
            </div>
          )}

          {/* ── PERMISSIONS TAB ── */}
          {activeTab === "permissions" && (
            <div className="space-y-4">
              {Object.entries(groupPermissionsByResource()).map(([resource, resourcePermissions]) => {
                const meta = resourceMeta[resource] || { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
                return (
                  <div key={resource} className={`rounded-xl border p-4 sm:p-5 ${meta.bg}`}>
                    <h3 className={`text-sm font-bold capitalize mb-3 flex items-center gap-2 ${meta.color}`}>
                      <Lock className="h-3.5 w-3.5" />
                      {resource} Permissions
                      <span className="text-[10px] font-semibold bg-white/70 px-1.5 py-0.5 rounded-full ml-auto">
                        {resourcePermissions.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {resourcePermissions.map((permission) => (
                        <div key={permission.id} className="bg-white rounded-lg border border-white/80 shadow-sm p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Lock className="h-3 w-3 text-gray-300 shrink-0" />
                            <h4 className="text-xs font-semibold text-gray-800 truncate">{permission.name}</h4>
                          </div>
                          <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">{permission.description}</p>
                          <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded ${meta.bg} ${meta.color}`}>
                            {permission.resource}.{permission.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Role Modal ── */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">

            {/* Modal header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#1a3a5c] truncate">
                      Edit Permissions
                    </h3>
                    <p className="text-xs text-[#e87722] font-medium truncate">{editingRole.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                    {editingRole.permissions.length} selected
                  </span>
                  <button onClick={() => setEditingRole(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-4 sm:px-6 py-4 space-y-3">
              {Object.entries(groupPermissionsByResource()).map(([resource, resourcePermissions]) => {
                const meta = resourceMeta[resource] || { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
                return (
                  <div key={resource} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className={`px-4 py-2.5 ${meta.bg} border-b border-gray-200`}>
                      <h5 className={`text-xs font-bold capitalize ${meta.color}`}>
                        {resource} Permissions
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                      {resourcePermissions.map((permission) => {
                        const isChecked = hasPermission(permission.id, editingRole.permissions);
                        return (
                          <label
                            key={permission.id}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-orange-50/50 ${isChecked ? 'bg-orange-50/30' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const newPermissions = togglePermission(permission.id, editingRole.permissions);
                                setEditingRole({ ...editingRole, permissions: newPermissions });
                              }}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-[#e87722] focus:ring-[#e87722] focus:ring-1 shrink-0"
                              disabled={editingRole.is_system}
                            />
                            <span className={`text-xs ${isChecked ? 'text-[#1a3a5c] font-semibold' : 'text-gray-600'}`}>
                              {permission.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* System role warning */}
              {editingRole.is_system && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">System Role</p>
                    <p className="text-xs text-amber-700 mt-0.5">This is a system role. Permissions cannot be modified.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer — sticky */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-2.5">
              <button
                onClick={() => handleUpdateRole(editingRole)}
                disabled={!editingRole.name || editingRole.is_system}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Update Permissions
              </button>
              <button
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <span className="ml-auto text-xs text-gray-400 hidden sm:inline">
                {editingRole.permissions.length} permissions selected
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsPage;