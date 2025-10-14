// ./components/userPageCompoents/UsersPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Upload, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import UserForm from './components/userPageCompoents/UserForm';
import UsersManagement from './components/userPageCompoents/UsersManagement';

interface User {
  id?: string;
  username?: string;
  email: string;
  first_name: string;
  last_name: string;
  salutation?: string;
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
  buyer_id?: string | number | null;
  seller_id?: string | number | null;
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
    salutation: '',
    password: '',
    role: '',
    phone: '',
    designation: '',
    department: '',
    dob: '',
    blood_group: '',
    buyer_id: null,
    seller_id: null,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [masterLoading, setMasterLoading] = useState(true);
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

  // Helper: preserve id type when sending (numeric string -> number, uuid -> string)
  const toNullableId = (v: unknown): string | number | null => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return Number.isNaN(v) ? null : v;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (/^-?\d+$/.test(trimmed)) {
        const n = Number(trimmed);
        return Number.isNaN(n) ? trimmed : n;
      }
      return trimmed;
    }
    const n = Number(v as any);
    return Number.isNaN(n) ? null : n;
  };

  // Called by UsersManagement when "Create Account" button is clicked in buyers/sellers table
  const handleOpenCreateFromChild = async ({ role, prefill }: { role: 'buyer' | 'seller', prefill?: Partial<User> }) => {
    console.log("🔄 Opening create form with prefill:", { role, prefill });
    resetForm();

    // Set prefilled data but make it editable
    setNewUser(prev => ({
      ...prev,
      role,
      email: prefill?.email ?? '',
      first_name: prefill?.first_name ?? '',
      last_name: prefill?.last_name ?? '',
      salutation: prefill?.salutation ?? '',
      phone: prefill?.phone ?? '',
      username: prefill?.username ?? '',
      dob: prefill?.dob ?? '',
      // Preserve buyer_id/seller_id for linking
      buyer_id: prefill?.buyer_id ?? (role === 'buyer' ? prefill?.id ?? null : null),
      seller_id: prefill?.seller_id ?? (role === 'seller' ? prefill?.id ?? null : null),
    }));

    setEditingUser(null);
    setShowUserModal(true);
  };

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common']);
        setMasters(data);
      } catch (err) {
        console.error('Error fetching master options:', err);
        // toast.error('Failed to load dropdown options');
      } finally {
        setMasterLoading(false);
      }
    };

    fetchMasters();
  }, []);

  const getLabelFromValue = (masterKey: string, value: string | undefined) => {
    if (!value) return '';
    const masterOptions = masters[masterKey] || [];
    const option = masterOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getValueFromLabel = (masterKey: string, label: string | undefined) => {
    if (!label) return '';
    const masterOptions = masters[masterKey] || [];
    const option = masterOptions.find(opt => opt.label === label);
    return option ? option.value : label || '';
  };

  const generatePassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  };

  const validateForm = (isEdit = false) => {
    const errors: { [key: string]: string } = {};

    if (!newUser.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!isEdit && !newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password && newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!newUser.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!newUser.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!newUser.role) {
      errors.role = 'Role is required';
    }

    if (!newUser.salutation) {
      errors.salutation = 'Salutation is required';
    }

    if (newUser.username && newUser.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUser = async () => {
    const isEdit = !!editingUser;
    if (!validateForm(isEdit)) return;

    try {
      // Convert dropdown values back to labels for backend if required by your API
      const userData: any = {
        ...newUser,
        username: newUser.username || null,
        phone: newUser.phone || null,
        salutation: newUser.salutation ? getLabelFromValue('salutation', newUser.salutation) : null,
        designation: newUser.designation ? getLabelFromValue('designation', newUser.designation) : null,
        department: newUser.department ? getLabelFromValue('department', newUser.department) : null,
        role: newUser.role ? getLabelFromValue('role', newUser.role) : newUser.role,
        blood_group: newUser.blood_group ? getLabelFromValue('blood groups', newUser.blood_group) : null,
        dob: newUser.dob || null,
        // Include buyer_id/seller_id and preserve types (number or string) or null
        buyer_id: toNullableId(newUser.buyer_id ?? null),
        seller_id: toNullableId(newUser.seller_id ?? null),
      };

      if (isEdit && !newUser.password) {
        delete userData.password;
      }

      let response;
      if (isEdit) {
        response = await usersAPI.updateUser(editingUser!.id, userData);
        console.log("✅ User updated:", editingUser!.id);
      } else {
        response = await usersAPI.createUser({ ...userData, is_active: true });
        console.log("✅ User created with data sync");
      }

      if (response.success) {
        toast.success(`User ${isEdit ? 'updated' : 'created'} successfully`);

        // Show the password (if provided) in the success modal
        if (newUser.password) {
          setGeneratedPassword(newUser.password);
          setShowGeneratedPassword(true);
        }

        resetForm();
        setShowUserModal(false);
        setRefreshUsers(prev => prev + 1);
      } else {
        toast.error(response.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }
    } catch (err: any) {
      console.error(`❌ Error ${isEdit ? 'updating' : 'creating'} user:`, err.message);
      if (err?.response?.data?.message) {
        const msg = err.response.data.message;
        if (msg.includes('email already exists')) {
          setFormErrors({ email: 'A user with this email already exists' });
        } else if (msg.includes('username already exists')) {
          setFormErrors({ username: 'A user with this username already exists' });
        } else {
          toast.error(msg);
        }
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} user. Please try again.`);
      }
    }
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);

    // Format dob for date input
    let formattedDob = '';
    if (userToEdit.dob) {
      const d = new Date(userToEdit.dob);
      if (!isNaN(d.getTime())) formattedDob = d.toISOString().split('T')[0];
    }

    setNewUser({
      username: userToEdit.username || '',
      email: userToEdit.email,
      first_name: userToEdit.first_name,
      last_name: userToEdit.last_name,
      password: '',
      salutation: getValueFromLabel('salutation', userToEdit.salutation || ''),
      role: getValueFromLabel('role', userToEdit.role),
      phone: userToEdit.phone || '',
      designation: getValueFromLabel('designation', userToEdit.designation || ''),
      department: getValueFromLabel('department', userToEdit.department || ''),
      dob: formattedDob,
      blood_group: getValueFromLabel('blood groups', userToEdit.blood_group || ''),
      buyer_id: userToEdit.buyer_id ?? null,
      seller_id: userToEdit.seller_id ?? null,
    });

    setShowUserModal(true);
  };

  const resetForm = () => {
    setNewUser({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      salutation: '',
      password: '',
      role: '',
      phone: '',
      designation: '',
      department: '',
      dob: '',
      blood_group: '',
      buyer_id: null,
      seller_id: null,
    });
    setEditingUser(null);
    setFormErrors({});
    setGeneratedPassword('');
    setShowGeneratedPassword(false);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGeneratePassword = () => {
    const pw = generatePassword();
    setNewUser(prev => ({ ...prev, password: pw }));
  };

  const exportUsers = async () => {
    try {
      const response = await usersAPI.exportUsers();
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
      toast.error(error?.response?.data?.message || 'Failed to export users');
    }
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  {/* Title + subtitle */}
  <div>
    <h1 className="text-lg sm:text-xl font-bold text-gray-900">User Management</h1>
    <p className="text-gray-600 mt-1 text-xs sm:text-sm">
      Manage users, roles, and permissions
    </p>
  </div>

  {/* Actions */}
  <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
    <Button
      variant="outline"
      onClick={exportUsers}
      className="flex-1 sm:flex-none flex items-center justify-center space-x-2"
    >
      <Download className="h-4 w-4" />
      <span>Export</span>
    </Button>

    <Button
      variant="outline"
      className="flex-1 sm:flex-none flex items-center justify-center space-x-2"
    >
      <Upload className="h-4 w-4" />
      <span>Import</span>
    </Button>

    <Link to="/dashboard/settings/roles-permissions" className="flex-1 sm:flex-none">
      <Button
        variant="outline"
        className="w-full sm:w-auto flex items-center justify-center space-x-2"
      >
        <Shield className="h-4 w-4" />
        <span>Manage Roles</span>
      </Button>
    </Link>

    <Button
      onClick={() => {
        resetForm();
        setShowUserModal(true);
      }}
      className="flex-1 sm:flex-none flex items-center justify-center space-x-2"
      disabled={masterLoading}
    >
      <Plus className="h-4 w-4" />
      <span>Add User</span>
    </Button>
  </div>
</div>


      {/* UsersManagement */}
      <UsersManagement
        onEditUser={handleEditUser}
        refreshTrigger={refreshUsers}
        getLabelFromValue={getLabelFromValue}
        masters={masters}
        masterLoading={masterLoading}
        onCreateUser={handleOpenCreateFromChild}
      />

      {/* Reusable UserForm component */}
      <UserForm
        visible={showUserModal}
        onClose={() => { setShowUserModal(false); resetForm(); }}
        onSubmit={handleSubmitUser}
        editingUser={editingUser}
        newUser={newUser}
        setNewUser={(u) => setNewUser(u)}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleGeneratePassword={handleGeneratePassword}
        showPassword={false}
        setShowPassword={() => {}}
        masterLoading={masterLoading}
        masters={masters}
        submitDisabled={false}
      />

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
              <Button onClick={() => setShowGeneratedPassword(false)} size="sm">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;