// ./components/userPageCompoents/UserForm.tsx
import React, { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { MasterOption } from '@/lib/useMasterData';

export interface User {
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
  // allow string (UUID) or numeric id OR null
  buyer_id?: string | number | null;
  seller_id?: string | number | null;
}

type FormErrors = { [key: string]: string };

export interface UserFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingUser: User | null;
  newUser: User;
  setNewUser: (u: User) => void;
  formErrors: FormErrors;
  handleInputChange: (field: keyof User, value: string) => void;
  handleGeneratePassword: () => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  masterLoading: boolean;
  masters: Record<string, MasterOption[]>;
  submitDisabled?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  onClose,
  onSubmit,
  editingUser,
  newUser,
  setNewUser,
  formErrors,
  handleInputChange,
  handleGeneratePassword,
  showPassword,
  setShowPassword,
  masterLoading,
  masters,
  submitDisabled,
}) => {
  if (!visible) return null;

  // Console-only debugging: show buyer_id/seller_id (value + type) whenever editingUser/newUser change
  useEffect(() => {
    console.log('📌 UserForm mounted/updated — editingUser:', editingUser);
    console.log('📌 UserForm mounted/updated — newUser:', newUser);

    if (editingUser) {
      console.log('🔎 editingUser IDs:', {
        buyer_id: editingUser.buyer_id,
        buyer_id_type: editingUser.buyer_id === null ? 'null' : typeof editingUser.buyer_id,
        seller_id: editingUser.seller_id,
        seller_id_type: editingUser.seller_id === null ? 'null' : typeof editingUser.seller_id,
      });
    }

    console.log('🔎 newUser IDs:', {
      buyer_id: newUser.buyer_id,
      buyer_id_type: newUser.buyer_id === null ? 'null' : typeof newUser.buyer_id,
      seller_id: newUser.seller_id,
      seller_id_type: newUser.seller_id === null ? 'null' : typeof newUser.seller_id,
    });
  }, [editingUser, newUser]);

  const roles = masters.role || [];
  const designations = masters.designation || [];
  const departments = masters.department || [];
  const bloodGroups = masters['blood groups'] || [];
  const salutations = masters.salutation || masters['salutation'] || [];

  const defaultDisabled =
    !newUser.salutation ||
    !newUser.email ||
    !newUser.first_name ||
    !newUser.last_name ||
    !newUser.role ||
    !newUser.dob ||
    (!editingUser && !newUser.password);

  // helper when role changes to keep buyer_id/seller_id consistent
  const handleRoleChange = (value: string) => {
    // notify parent generic change handler
    handleInputChange('role', value);

    // update IDs accordingly: keep whichever id exists for that role, clear the other
    if (value.toLowerCase() === 'buyer') {
      setNewUser({
        ...newUser,
        role: value,
        buyer_id: newUser.buyer_id ?? null,
        seller_id: null,
      });
    } else if (value.toLowerCase() === 'seller') {
      setNewUser({
        ...newUser,
        role: value,
        seller_id: newUser.seller_id ?? null,
        buyer_id: null,
      });
    } else {
      setNewUser({
        ...newUser,
        role: value,
        buyer_id: null,
        seller_id: null,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
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
              {/* Row: Salutation / First / Last */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salutation <span className="text-red-500">*</span>
                  </label>

                  {salutations.length > 0 ? (
                    <select
                      value={newUser.salutation || ''}
                      onChange={(e) => handleInputChange('salutation', e.target.value)}
                      className={`w-full h-8 border rounded px-2 text-sm focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${
                        formErrors.salutation ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select</option>
                      {salutations.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newUser.salutation || ''}
                      onChange={(e) => handleInputChange('salutation', e.target.value)}
                      className={`w-full h-8 border rounded px-2 text-sm focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${
                        formErrors.salutation ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Mr / Ms / Dr"
                    />
                  )}
                  {formErrors.salutation && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.salutation}</p>
                  )}
                </div>

                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={`w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      formErrors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="First name"
                  />
                  {formErrors.first_name && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.first_name}</p>
                  )}
                </div>

                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={`w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      formErrors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Last name"
                  />
                  {formErrors.last_name && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Row: Username / Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.username || ''}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      formErrors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Username"
                  />
                  {formErrors.username && <p className="text-red-600 text-xs mt-1">{formErrors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Email"
                  />
                  {formErrors.email && <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>}
                </div>
              </div>

              {/* Row: DOB / Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DOB <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newUser.dob || ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
                    placeholder="Phone"
                  />
                </div>
              </div>

              {/* Row: Department / Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
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
                    value={newUser.role || ''}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className={`w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      formErrors.role ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.role && <p className="text-red-600 text-xs mt-1">{formErrors.role}</p>}
                </div>
              </div>

              {/* Row: Designation / Blood Group */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <select
                    value={newUser.designation || ''}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={newUser.blood_group || ''}
                    onChange={(e) => handleInputChange('blood_group', e.target.value)}
                    className="w-full h-8 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
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
                  {editingUser && <span className="text-gray-400 text-sm"> (leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full h-8 border rounded px-2 pr-20 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${
                      formErrors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={editingUser ? 'New password (optional)' : 'Password (min 6 characters)'}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={handleGeneratePassword} className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                      Gen
                    </button>
                  </div>
                </div>
                {formErrors.password && <p className="text-red-600 text-xs mt-1">{formErrors.password}</p>}

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
              <Button onClick={onSubmit} disabled={submitDisabled ?? defaultDisabled} size="sm">
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => { onClose(); }} size="sm">
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserForm;
