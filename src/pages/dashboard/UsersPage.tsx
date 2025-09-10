import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Download, Upload, Shield, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import UsersManagement from './components/userPageCompoents/UsersManagement';

// Extend Window interface for permanent password storage
declare global {
  interface Window {
    tempUserPasswords?: {
      [userId: string]: {
        password: string;
        timestamp: number;
        permanent: boolean; // For admin-created users
      }
    };
  }
}

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

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<User>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: '',
    phone: '',
    designation: '',
    department: '',
    dob: '',
    blood_group: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [masterLoading, setMasterLoading] = useState(true);
  const [refreshUsers, setRefreshUsers] = useState(0);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  
  // Store original passwords for sharing (when creating new users or updating passwords)
  const [userPasswords, setUserPasswords] = useState<{[key: string]: string}>({});
  
  // Function to save password to session (survives page refresh) - PERMANENT for admin
  const savePasswordToSession = (userId: string, password: string) => {
    try {
      // Create a permanent storage in window object for passwords
      if (!window.tempUserPasswords) {
        window.tempUserPasswords = {};
      }
      window.tempUserPasswords[userId] = {
        password: password,
        timestamp: Date.now(),
        permanent: true // Mark as permanent for admin-created users
      };
      
      // Also update state
      setUserPasswords(prev => ({
        ...prev,
        [userId]: password
      }));
    } catch (error) {
      console.error('Error saving password:', error);
    }
  };

  // Function to get password from session - NO EXPIRATION for admin
  const getPasswordFromSession = (userId: string) => {
    try {
      if (window.tempUserPasswords && window.tempUserPasswords[userId]) {
        const passwordData = window.tempUserPasswords[userId];
        // For admin-created users, passwords are permanent (no expiration)
        if (passwordData.permanent) {
          return passwordData.password;
        }
        // Fallback for any non-permanent passwords (shouldn't happen for admin)
        const isRecent = (Date.now() - passwordData.timestamp) < (365 * 24 * 60 * 60 * 1000); // 1 year fallback
        if (isRecent) {
          return passwordData.password;
        } else {
          // Clean up old non-permanent password
          delete window.tempUserPasswords[userId];
        }
      }
    } catch (error) {
      console.error('Error getting password:', error);
    }
    return '';
  };

  // Initialize passwords from session storage on component mount - PERMANENT STORAGE
  useEffect(() => {
    try {
      if (window.tempUserPasswords) {
        const passwords = {};
        Object.keys(window.tempUserPasswords).forEach(userId => {
          const passwordData = window.tempUserPasswords[userId];
          // For permanent passwords (admin-created), always load them
          if (passwordData.permanent) {
            passwords[userId] = passwordData.password;
          } else {
            // For non-permanent, check expiration (fallback)
            const isRecent = (Date.now() - passwordData.timestamp) < (365 * 24 * 60 * 60 * 1000);
            if (isRecent) {
              passwords[userId] = passwordData.password;
            } else {
              delete window.tempUserPasswords[userId];
            }
          }
        });
        setUserPasswords(passwords);
      }
    } catch (error) {
      console.error('Error loading passwords:', error);
    }
  }, []);

  // Helper function to get label from value
  const getLabelFromValue = (masterKey: string, value: string) => {
    const masterOptions = masters[masterKey] || [];
    const option = masterOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Helper function to get value from label (for editing existing users)
  const getValueFromLabel = (masterKey: string, label: string) => {
    const masterOptions = masters[masterKey] || [];
    const option = masterOptions.find(opt => opt.label === label);
    return option ? option.value : label;
  };

  // Generate random password function
  const generatePassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  };

  // Get original password function with admin privileges
  const getOriginalPassword = (userId: string) => {
    // First try to get from state
    if (userPasswords[userId]) {
      return userPasswords[userId];
    }
    // Then try to get from session (permanent for admin)
    return getPasswordFromSession(userId);
  };

  // Admin function to manually clear a user's stored password if needed
  const clearStoredPassword = (userId: string) => {
    try {
      if (window.tempUserPasswords && window.tempUserPasswords[userId]) {
        delete window.tempUserPasswords[userId];
      }
      setUserPasswords(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (error) {
      console.error('Error clearing password:', error);
    }
  };

  // Admin function to get all stored passwords count
  const getStoredPasswordsCount = () => {
    try {
      return window.tempUserPasswords ? Object.keys(window.tempUserPasswords).length : 0;
    } catch (error) {
      return 0;
    }
  };

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions([
          'common',
        ]);
        setMasters(data);
        console.log("Fetched master data:", data);
      } catch (err) {
        console.error('Error fetching master options:', err);
        toast.error('Failed to load dropdown options');
      } finally {
        setMasterLoading(false);
      }
    };

    fetchMasters();
  }, []);

  const validateForm = (isEdit: boolean = false) => {
    const errors: { [key: string]: string } = {};

    if (!newUser.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!isEdit && !newUser.password) {
      errors.password = 'Password is required';
    } else if (!isEdit && newUser.password && newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (isEdit && newUser.password && newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!newUser.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!newUser.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!newUser.role) {
      errors.role = 'Role is required';
    }

    if (newUser.username && newUser.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUser = async () => {
    const isEdit = !!editingUser;
    if (!validateForm(isEdit)) {
      return;
    }

    try {
      console.log('Form submitted with user data:', newUser);

      // Prepare user data for API - Convert values to labels before sending to backend
      const userData = {
        ...newUser,
        username: newUser.username || null,
        phone: newUser.phone || null,
        // Convert dropdown values to labels for backend
        designation: newUser.designation ? getLabelFromValue('designation', newUser.designation) : null,
        department: newUser.department ? getLabelFromValue('department', newUser.department) : null,
        role: newUser.role ? getLabelFromValue('role', newUser.role) : newUser.role,
        blood_group: newUser.blood_group ? getLabelFromValue('blood groups', newUser.blood_group) : null,
        dob: newUser.dob || null,
      };

      // If editing and password is empty, don't send password field
      if (isEdit && !newUser.password) {
        delete userData.password;
      }

      console.log('Sending user data to backend:', userData);

      let response;
      if (isEdit) {
        response = await usersAPI.updateUser(editingUser.id, userData);
      } else {
        response = await usersAPI.createUser({ ...userData, is_active: true });
      }

      if (response.success) {
        toast.success(`User ${isEdit ? 'updated' : 'created'} successfully`);
        
        // Store password for sharing (for both new users and password updates)
        if (newUser.password && response.data?.id) {
          savePasswordToSession(response.data.id, newUser.password);
        } else if (isEdit && newUser.password && editingUser?.id) {
          savePasswordToSession(editingUser.id, newUser.password);
        }
        
        // Show generated password for new users or password updates
        if (newUser.password) {
          setGeneratedPassword(newUser.password);
          setShowGeneratedPassword(true);
        }
        
        resetForm();
        setShowUserModal(false);
        setRefreshUsers(prev => prev + 1); // Trigger refresh in child component

        console.log(`User ${isEdit ? 'updated' : 'created'} successfully:`, response.data);
      } else {
        toast.error(response.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }
    } catch (error: any) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} user:`, error);

      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('email already exists')) {
          setFormErrors({ email: 'A user with this email already exists' });
        } else if (error.response.data.message.includes('username already exists')) {
          setFormErrors({ username: 'A user with this username already exists' });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} user. Please try again.`);
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);

    // Format the date for the input field (YYYY-MM-DD)
    let formattedDob = '';
    if (user.dob) {
      const dobDate = new Date(user.dob);
      if (!isNaN(dobDate.getTime())) {
        formattedDob = dobDate.toISOString().split('T')[0];
      }
    }

    // Convert labels back to values for editing
    setNewUser({
      username: user.username || '',
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '', // Don't prefill password for security
      role: getValueFromLabel('role', user.role),
      phone: user.phone || '',
      designation: getValueFromLabel('designation', user.designation || ''),
      department: getValueFromLabel('department', user.department || ''),
      dob: formattedDob,
      blood_group: getValueFromLabel('blood groups', user.blood_group || ''),
    });
    setShowUserModal(true);
  };

  const exportUsers = async () => {
    try {
      const response = await usersAPI.exportUsers();
      // Handle CSV download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    } catch (error: any) {
      console.error('Error exporting users:', error);
      toast.error(error.response?.data?.message || 'Failed to export users');
    }
  };

  const resetForm = () => {
    setNewUser({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      role: '',
      phone: '',
      designation: '',
      department: '',
      dob: '',
      blood_group: '',
    });
    setEditingUser(null);
    setFormErrors({});
    setShowPassword(false);
    setGeneratedPassword('');
    setShowGeneratedPassword(false);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setNewUser({ ...newUser, [field]: value });

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  // Generate password button handler
  const handleGeneratePassword = () => {
    const password = generatePassword();
    setNewUser({ ...newUser, password });
    setShowPassword(true);
  };

  // Get master data arrays
  const roles = masters.role || [];
  const designations = masters.designation || [];
  const departments = masters.department || [];
  const bloodGroups = masters['blood groups'] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1 text-xs">
            Manage users, roles, and permissions
            {getStoredPasswordsCount() > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {getStoredPasswordsCount()} passwords stored
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={exportUsers}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
          <Link to="/dashboard/settings/roles-permissions">
            <Button variant="outline" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Manage Roles</span>
            </Button>
          </Link>
          <Button
            onClick={() => {
              resetForm();
              setShowUserModal(true);
            }}
            className="flex items-center space-x-2"
            disabled={masterLoading}
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h3>

            {masterLoading ? (
              <div className="flex justify-center ">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-base">Loading form options...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`w-full h-8 border outline-black rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.username ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Username"
                      />
                      {formErrors.username && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full h-8 border outline-black rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Email"
                      />
                      {formErrors.email && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className={`w-full h-8 border outline-black rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.first_name ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="First name"
                      />
                      {formErrors.first_name && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.first_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className={`w-full h-8 border outline-black rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.last_name ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Last name"
                      />
                      {formErrors.last_name && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.last_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DOB <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newUser.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        className="w-full h-8 border outline-black border-gray-300 rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newUser.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full h-8 border outline-black border-gray-300 rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Phone"
                      />
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newUser.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full h-8 border outline-black border-gray-300 rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                          <option key={department.value} value={department.value}>
                            {department.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className={`w-full h-8 border outline-black rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.role ? 'border-red-300' : 'border-gray-300'}`}
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.role && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.role}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                      </label>
                      <select
                        value={newUser.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        className="w-full h-8 border outline-black border-gray-300 rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Designation</option>
                        {designations.map((designation) => (
                          <option key={designation.value} value={designation.value}>
                            {designation.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Group
                      </label>
                      <select
                        value={newUser.blood_group}
                        onChange={(e) => handleInputChange('blood_group', e.target.value)}
                        className="w-full h-8 border outline-black border-gray-300 rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map((bloodGroup) => (
                          <option key={bloodGroup.value} value={bloodGroup.value}>
                            {bloodGroup.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {!editingUser && <span className="text-red-500">*</span>}
                      {editingUser && (
                        <span className="text-gray-400 text-sm">(leave blank to keep current)</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full h-8 border outline-black rounded px-2 pr-20 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.password ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder={editingUser ? "New password (optional)" : "Password (min 6 characters)"}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        {/* Enable generate password for both new and edit modes */}
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                        >
                          Gen
                        </button>
                      </div>
                    </div>
                    {formErrors.password && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.password}</p>
                    )}
                    
                    {/* Password display below input field */}
                    {newUser.password && !editingUser && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-800 font-medium">
                          **Password: <span className="font-mono">{newUser.password}</span>
                        </p>
                      </div>
                    )}
                    
                    {editingUser && newUser.password && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs text-green-800 font-medium">
                          **New Password: <span className="font-mono">{newUser.password}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    onClick={handleSubmitUser}
                    disabled={!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.role || !newUser.dob || (!editingUser && !newUser.password)}
                    size="sm"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserModal(false);
                      resetForm();
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Generated Password Modal */}
      {showGeneratedPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingUser ? 'User Updated Successfully!' : 'User Created Successfully!'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {editingUser ? 'The new password for this user is:' : 'The password for this user is:'}
              </p>
              <div className="bg-gray-100 p-3 rounded border">
                <code className="text-lg font-mono text-gray-900">{generatedPassword}</code>
              </div>
              <p className="text-xs text-red-600 mt-2">
                Please save this password securely. It will not be shown again.
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowGeneratedPassword(false)}
                size="sm"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Child Component */}
      <UsersManagement 
        onEditUser={handleEditUser}
        refreshTrigger={refreshUsers}
        userPasswords={userPasswords}
        getLabelFromValue={getLabelFromValue}
        masters={masters}
        masterLoading={masterLoading}
      />
    </div>
  );
};

export default UsersPage;