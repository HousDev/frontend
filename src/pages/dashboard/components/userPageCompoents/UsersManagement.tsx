import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MoreHorizontal, Edit, Trash2, UserPlus, Mail, Phone,
  Calendar, Activity, CheckCircle, XCircle, Eye, Share2, MessageCircle, Copy, Plus
} from 'lucide-react';
import { usersAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';

interface User {
  id?: string;
  username?: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  role: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  department?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  total_leads?: number;
  total_properties?: number;
  total_revenue?: number;
  modulePermissions?: any;
  dob?: string;
  blood_group?: string;
}

interface UsersManagementProps {
  onEditUser: (user: User) => void;
  refreshTrigger: number;
  userPasswords: {[key: string]: string};
  getLabelFromValue: (masterKey: string, value: string) => string;
  masters: Record<string, any[]>;
  masterLoading: boolean;
}

const UsersManagement: React.FC<UsersManagementProps> = ({
  onEditUser,
  refreshTrigger,
  userPasswords,
  getLabelFromValue,
  masters,
  masterLoading
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Share modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingUser, setSharingUser] = useState<User | null>(null);

  // Decrypt password function - now just gets the stored password
  const getOriginalPassword = (userId: string) => {
    return userPasswords[userId] || '';
  };

  // Handle share button click
  const handleShareUser = (userItem: User) => {
    setSharingUser(userItem);
    setShowShareModal(true);
  };

  // Share via email
  const shareViaEmail = () => {
    if (!sharingUser) return;
    
    const password = getOriginalPassword(sharingUser.id);
    const subject = encodeURIComponent(`User Account Details - ${sharingUser.first_name} ${sharingUser.last_name}`);
    const body = encodeURIComponent(`
Hello,

Here are the account details for ${sharingUser.first_name} ${sharingUser.last_name}:

Name: ${sharingUser.first_name} ${sharingUser.last_name}
Email: ${sharingUser.email}
Username: ${sharingUser.username || 'N/A'}
Password: ${password || 'Not available'}
Role: ${getLabelFromValue('role', sharingUser.role)}

Please keep these credentials secure.

Best regards
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowShareModal(false);
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    if (!sharingUser) return;
    
    const password = getOriginalPassword(sharingUser.id);
    const message = encodeURIComponent(`
*User Account Details*

*Name:* ${sharingUser.first_name} ${sharingUser.last_name}
*Email:* ${sharingUser.email}
*Username:* ${sharingUser.username || 'N/A'}
*Password:* ${password || 'Not available'}
*Role:* ${getLabelFromValue('role', sharingUser.role)}

Please keep these credentials secure.
    `);
    
    window.open(`https://wa.me/?text=${message}`);
    setShowShareModal(false);
  };

  // Share via SMS
  const shareViaSMS = () => {
    if (!sharingUser) return;
    
    const password = getOriginalPassword(sharingUser.id);
    const message = encodeURIComponent(`
User Account Details - ${sharingUser.first_name} ${sharingUser.last_name}:
Email: ${sharingUser.email}
Username: ${sharingUser.username || 'N/A'}
Password: ${password || 'Not available'}
Role: ${getLabelFromValue('role', sharingUser.role)}
    `);
    
    window.open(`sms:?body=${message}`);
    setShowShareModal(false);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!sharingUser) return;
    
    const password = getOriginalPassword(sharingUser.id);
    const text = `
User Account Details - ${sharingUser.first_name} ${sharingUser.last_name}

Name:${sharingUser.first_name} ${sharingUser.last_name}
Email: ${sharingUser.email}
Username: ${sharingUser.username || 'N/A'}
Password: ${password || 'Not available'}
Role: ${getLabelFromValue('role', sharingUser.role)}
    `;
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success('User details copied to clipboard');
      setShowShareModal(false);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  useEffect(() => {
    if (!masterLoading) {
      fetchUsers();
    }
  }, [searchTerm, roleFilter, statusFilter, masterLoading, refreshTrigger]);

  // Update your fetchUsers function to match the backend API expectations
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (searchTerm) params.search = searchTerm;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      console.log("Sending filter request with params:", params);

      const response = await usersAPI.filterData(params);
      console.log("Filter response:", response);

      if (response.success) {
        setUsers(response.data);
        console.log("Users data set:", response.data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await usersAPI.updateUser(userId, { is_active: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await usersAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
      setShowBulkActions(false);
    } else {
      setSelectedUsers(users.map(user => user.id));
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      for (const userId of selectedUsers) {
        if (action === 'delete') {
          await usersAPI.deleteUser(userId);
        } else {
          await usersAPI.updateUser(userId, { is_active: action === 'activate' });
        }
      }
      toast.success(`Successfully ${action}d ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setShowBulkActions(false);
      fetchUsers();
    } catch (error: any) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} users`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'seller':
        return 'bg-green-100 text-green-800';
      case 'buyer':
        return 'bg-orange-100 text-orange-800';
      case 'executive':
        return 'bg-indigo-100 text-indigo-800';
      case 'team leader':
        return 'bg-yellow-100 text-yellow-800';
      case 'owner':
        return 'bg-pink-100 text-pink-800';
      case 'purchaser':
        return 'bg-teal-100 text-teal-800';
      case 'presales':
        return 'bg-cyan-100 text-cyan-800';
      case 'sales':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get master data arrays
  const roles = masters.role || [];

  return (
    <div className="space-y-6">
      {/* Share User Modal */}
      {showShareModal && sharingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Share User Details
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm mb-2">
               Name: {sharingUser.first_name} {sharingUser.last_name}
              </h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Email:</strong> {sharingUser.email}</p>
                <p><strong>Username:</strong> {sharingUser.username || 'N/A'}</p>
                <p><strong>Password:</strong> {getOriginalPassword(sharingUser.id) || 'Not available'}</p>
                <p><strong>Role:</strong> {getLabelFromValue('role', sharingUser.role)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={shareViaEmail}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
              >
                <Mail className="h-3 w-3" />
                <span>Email</span>
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
              >
                <MessageCircle className="h-3 w-3" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={shareViaSMS}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs"
              >
                <Phone className="h-3 w-3" />
                <span>SMS</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </button>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareModal(false);
                  setSharingUser(null);
                }}
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
              >
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUsers([]);
                  setShowBulkActions(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className=" rounded-lg ">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-1.5 lg:space-y-0 lg:space-x-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 relative z-10"
              />
            </div>
          </div>
          <div className="flex space-x-1.5">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={masterLoading}
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(userItem.id)}
                          onChange={() => handleSelectUser(userItem.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(userItem.first_name?.[0] || '') + (userItem.last_name?.[0] || '')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {userItem.first_name} {userItem.last_name}
                            </p>
                            {userItem.username && (
                              <p className="text-sm text-gray-500">@{userItem.username}</p>
                            )}

                            {userItem.dob && (
                              <p className="text-xs text-gray-400">
                                DOB: {new Date(userItem.dob).toLocaleDateString()}
                              </p>
                            )}
                            {userItem.blood_group && (
                              <p className="text-xs text-gray-400">
                                Blood Group: {userItem.blood_group}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-900">{userItem.email}</span>
                          </div>
                          {userItem.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-900">{userItem.phone}</span>
                            </div>
                          )}

                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userItem.role)}`}>
                          {userItem.role}
                        </span>
                        {userItem.department && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">
                              <span>Department: </span>{userItem.department}
                            </span>
                          </div>
                        )}
                        {userItem.designation && (
                          <p className="text-xs text-gray-400">
                            <span> Designation: </span>{userItem.designation}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {userItem.is_active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${userItem.is_active ? 'text-green-700' : 'text-red-700'}`}>
                            {userItem.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>{userItem.total_leads || 0} leads</div>
                          <div className="text-xs text-gray-500">
                            {userItem.total_properties || 0} properties
                          </div>
                          {userItem.total_revenue ? (
                            <div className="text-xs text-gray-500">
                              {formatCurrency(userItem.total_revenue)} revenue
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-900 space-y-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>Created: {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-gray-400" />
                            <span>Last Login: {userItem.last_login ? new Date(userItem.last_login).toLocaleDateString() : 'Never'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditUser(userItem)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShareUser(userItem)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(userItem.id, userItem.is_active)}
                              className={userItem.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                            >
                              {userItem.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                            ? 'Try adjusting your search criteria'
                            : 'Get started by adding your first user'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;