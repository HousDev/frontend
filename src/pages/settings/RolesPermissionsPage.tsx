import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Save,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';

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

const RolesPermissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setRoles([
        {
          id: '1',
          name: 'Admin',
          description: 'Full system access with all administrative privileges',
          permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'system.manage'],
          user_count: 2,
          is_system: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Manager',
          description: 'Team management and oversight capabilities',
          permissions: ['user.read', 'user.update', 'lead.create', 'lead.read', 'lead.update', 'property.create', 'property.read', 'property.update'],
          user_count: 5,
          is_system: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'Agent',
          description: 'Sales agent with lead and property management',
          permissions: ['lead.create', 'lead.read', 'lead.update', 'property.read', 'activity.create', 'activity.read', 'activity.update'],
          user_count: 15,
          is_system: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '4',
          name: 'Seller',
          description: 'Property owners who list properties',
          permissions: ['property.create', 'property.read', 'property.update', 'lead.read'],
          user_count: 25,
          is_system: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '5',
          name: 'Buyer',
          description: 'Property buyers with limited access',
          permissions: ['property.read', 'activity.create', 'activity.read'],
          user_count: 50,
          is_system: true,
          created_at: '2024-01-01T00:00:00Z',
        },
      ]);

      setPermissions([
        { id: '1', name: 'Create Users', resource: 'user', action: 'create', description: 'Create new user accounts' },
        { id: '2', name: 'View Users', resource: 'user', action: 'read', description: 'View user information and profiles' },
        { id: '3', name: 'Update Users', resource: 'user', action: 'update', description: 'Edit user information and settings' },
        { id: '4', name: 'Delete Users', resource: 'user', action: 'delete', description: 'Remove user accounts' },
        { id: '5', name: 'Create Leads', resource: 'lead', action: 'create', description: 'Add new leads to the system' },
        { id: '6', name: 'View Leads', resource: 'lead', action: 'read', description: 'Access lead information' },
        { id: '7', name: 'Update Leads', resource: 'lead', action: 'update', description: 'Edit lead details and status' },
        { id: '8', name: 'Delete Leads', resource: 'lead', action: 'delete', description: 'Remove leads from system' },
        { id: '9', name: 'Create Properties', resource: 'property', action: 'create', description: 'Add new property listings' },
        { id: '10', name: 'View Properties', resource: 'property', action: 'read', description: 'Access property information' },
        { id: '11', name: 'Update Properties', resource: 'property', action: 'update', description: 'Edit property details' },
        { id: '12', name: 'Delete Properties', resource: 'property', action: 'delete', description: 'Remove property listings' },
        { id: '13', name: 'Create Activities', resource: 'activity', action: 'create', description: 'Schedule new activities and tasks' },
        { id: '14', name: 'View Activities', resource: 'activity', action: 'read', description: 'Access activity information' },
        { id: '15', name: 'Update Activities', resource: 'activity', action: 'update', description: 'Edit activity details' },
        { id: '16', name: 'Delete Activities', resource: 'activity', action: 'delete', description: 'Remove activities and tasks' },
        { id: '17', name: 'System Management', resource: 'system', action: 'manage', description: 'Access system settings and configuration' },
        { id: '18', name: 'View Reports', resource: 'report', action: 'read', description: 'Access analytics and reports' },
        { id: '19', name: 'Export Data', resource: 'data', action: 'export', description: 'Export system data' },
        { id: '20', name: 'Import Data', resource: 'data', action: 'import', description: 'Import data into system' },
      ]);
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
      toast.error('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      // Mock API call - replace with actual implementation
      const newRoleData = {
        ...newRole,
        id: Date.now().toString(),
        user_count: 0,
        is_system: false,
        created_at: new Date().toISOString(),
      };
      setRoles([...roles, newRoleData]);
      setNewRole({ name: '', description: '', permissions: [] });
      setShowAddRole(false);
      toast.success('Role created successfully');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    }
  };

  const handleUpdateRole = async (role: Role) => {
    try {
      // Mock API call - replace with actual implementation
      setRoles(roles.map(r => r.id === role.id ? role : r));
      setEditingRole(null);
      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.is_system) {
      toast.error('Cannot delete system roles');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role? Users with this role will lose their permissions.')) {
      try {
        setRoles(roles.filter(r => r.id !== roleId));
        toast.success('Role deleted successfully');
      } catch (error) {
        console.error('Error deleting role:', error);
        toast.error('Failed to delete role');
      }
    }
  };

  const togglePermission = (permissionId: string, rolePermissions: string[]) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return rolePermissions;

    const permissionKey = `${permission.resource}.${permission.action}`;
    if (rolePermissions.includes(permissionKey)) {
      return rolePermissions.filter(p => p !== permissionKey);
    } else {
      return [...rolePermissions, permissionKey];
    }
  };

  const hasPermission = (permissionId: string, rolePermissions: string[]) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return false;
    const permissionKey = `${permission.resource}.${permission.action}`;
    return rolePermissions.includes(permissionKey);
  };

  const groupPermissionsByResource = () => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side: Back + Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3 sm:gap-0">
          <Link to="/dashboard/settings" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center sm:justify-start">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Roles & Permissions
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage user roles and their access permissions
            </p>
          </div>
        </div>

        {/* Right side: Add Role */}
        {activeTab === 'roles' && (
          <Button
            onClick={() => setShowAddRole(true)}
            className="flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Role</span>
          </Button>
        )}
      </div>


      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Roles ({roles.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Roles List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <div key={role.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                          {role.is_system && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRole(role)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {!role.is_system && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-medium">{role.user_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Permissions:</span>
                        <span className="font-medium">{role.permissions.length}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(role.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {Object.entries(groupPermissionsByResource()).map(([resource, resourcePermissions]) => (
                <div key={resource} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                    {resource} Permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resourcePermissions.map((permission) => (
                      <div key={permission.id} className="bg-white rounded border border-gray-200 p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lock className="h-4 w-4 text-gray-400" />
                          <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600">{permission.description}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {permission.resource}.{permission.action}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Role Modal */}
      {(showAddRole || editingRole) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                  <input
                    type="text"
                    value={editingRole ? editingRole.name : newRole.name}
                    onChange={(e) => {
                      if (editingRole) {
                        setEditingRole({ ...editingRole, name: e.target.value });
                      } else {
                        setNewRole({ ...newRole, name: e.target.value });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={editingRole ? editingRole.description : newRole.description}
                    onChange={(e) => {
                      if (editingRole) {
                        setEditingRole({ ...editingRole, description: e.target.value });
                      } else {
                        setNewRole({ ...newRole, description: e.target.value });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter role description"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Permissions</h4>
                <div className="space-y-4">
                  {Object.entries(groupPermissionsByResource()).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                        {resource} Permissions
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {resourcePermissions.map((permission) => {
                          const currentPermissions = editingRole ? editingRole.permissions : newRole.permissions;
                          const isChecked = hasPermission(permission.id, currentPermissions);

                          return (
                            <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const newPermissions = togglePermission(permission.id, currentPermissions);
                                  if (editingRole) {
                                    setEditingRole({ ...editingRole, permissions: newPermissions });
                                  } else {
                                    setNewRole({ ...newRole, permissions: newPermissions });
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{permission.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    if (editingRole) {
                      handleUpdateRole(editingRole);
                    } else {
                      handleCreateRole();
                    }
                  }}
                  disabled={editingRole ? !editingRole.name : !newRole.name}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddRole(false);
                    setEditingRole(null);
                    setNewRole({ name: '', description: '', permissions: [] });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsPage;