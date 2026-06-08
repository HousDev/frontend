 //components/userPageCompoents/UserForm.tsx
import React, { useEffect } from 'react';
import { Eye, EyeOff, X, User, Mail, Phone, Calendar, Briefcase, Users, Droplet, Key, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { MasterOption } from '@/lib/useMasterData';

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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

// Compact Form Field Component
const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
}> = ({ label, required, children, icon, error }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
      {icon && <span className="text-orange-500">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[9px] mt-0.5">{error}</p>}
  </div>
);

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

  const roles = masters.role || [];
  const designations = masters.designation || [];
  const departments = masters.department || [];
  const bloodGroups = masters['blood groups'] || [];
  const salutations = masters.salutation || masters['salutation'] || [];

  useEffect(() => {
    if (editingUser) {
      // Edit mode logic preserved
    } else if (newUser.buyer_id || newUser.seller_id) {
      // Initial logic preserved
    }
  }, [editingUser, newUser.buyer_id, newUser.seller_id, newUser.role, newUser.salutation]);

  const defaultDisabled =
    !newUser.salutation ||
    !newUser.email ||
    !newUser.first_name ||
    !newUser.last_name ||
    !newUser.role ||
    !newUser.dob ||
    (!editingUser && !newUser.password);

  const handleRoleChange = (value: string) => {
    handleInputChange('role', value);

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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
      style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      // onClick={(e) => {
      //   if (e.target === e.currentTarget) onClose();
      // }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-full sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Compact Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg" style={{ background: `${O}20` }}>
              <Users size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Compact Body - Reduced padding */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
          {masterLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-xs" style={{ color: MU }}>Loading...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Row 1: Salutation + First Name + Last Name - ALL IN ONE ROW */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <FormField label="Salutation" required icon={<User size={8} />} error={formErrors.salutation}>
                    {salutations.length > 0 ? (
                      <select
                        value={newUser.salutation || ''}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                        style={{ borderColor: formErrors.salutation ? '#ef4444' : BD }}
                      >
                        <option value="">Select</option>
                        {salutations.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={newUser.salutation || ''}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                        style={{ borderColor: formErrors.salutation ? '#ef4444' : BD }}
                        placeholder="Mr"
                      />
                    )}
                  </FormField>
                </div>

                <div>
                  <FormField label="First Name" required icon={<User size={8} />} error={formErrors.first_name}>
                    <input
                      type="text"
                      value={newUser.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: formErrors.first_name ? '#ef4444' : BD }}
                      placeholder="First"
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Last Name" required icon={<User size={8} />} error={formErrors.last_name}>
                    <input
                      type="text"
                      value={newUser.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: formErrors.last_name ? '#ef4444' : BD }}
                      placeholder="Last"
                    />
                  </FormField>
                </div>
              </div>

              {/* Row 2: Username + Email - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FormField label="Username" required icon={<User size={8} />} error={formErrors.username}>
                    <input
                      type="text"
                      value={newUser.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: formErrors.username ? '#ef4444' : BD }}
                      placeholder="Username"
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Email" required icon={<Mail size={8} />} error={formErrors.email}>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: formErrors.email ? '#ef4444' : BD }}
                      placeholder="Email"
                    />
                  </FormField>
                </div>
              </div>

              {/* Row 3: DOB + Phone - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FormField label="DOB" required icon={<Calendar size={8} />} error={formErrors.dob}>
                    <input
                      type="date"
                      value={newUser.dob || ''}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: formErrors.dob ? '#ef4444' : BD }}
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Phone" required icon={<Phone size={8} />}>
                    <input
                      type="tel"
                      value={newUser.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: BD }}
                      maxLength={10}
                      placeholder="Phone"
                    />
                  </FormField>
                </div>
              </div>

              {/* Row 4: Department + Role - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FormField label="Department" required icon={<Briefcase size={8} />}>
                    <select
                      value={newUser.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select Dept</option>
                      {departments.map((department) => (
                        <option key={department.value} value={department.value}>
                          {department.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div>
                  <FormField label="Role" required icon={<Shield size={8} />} error={formErrors.role}>
                   <select
  value={roles.find(r =>
    r.value.toLowerCase().trim() === (newUser.role || '').toLowerCase().trim()
  )?.value || ''}
  onChange={(e) => handleRoleChange(e.target.value)}
  className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
  style={{ borderColor: formErrors.role ? '#ef4444' : BD }}
>
  <option value="">Select Role</option>
  {roles.map((role) => (
    <option key={role.value} value={role.value}>
      {role.label}
    </option>
  ))}
</select>
                  </FormField>
                </div>
              </div>

              {/* Row 5: Designation + Blood Group - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FormField label="Designation" icon={<Briefcase size={8} />}>
                    <select
                      value={newUser.designation || ''}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select Desig</option>
                      {designations.map((designation) => (
                        <option key={designation.value} value={designation.value}>
                          {designation.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div>
                  <FormField label="Blood Group" icon={<Droplet size={8} />}>
                    <select
                      value={newUser.blood_group || ''}
                      onChange={(e) => handleInputChange('blood_group', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select Blood</option>
                      {bloodGroups.map((bloodGroup) => (
                        <option key={bloodGroup.value} value={bloodGroup.value}>
                          {bloodGroup.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Password - Full width */}
              <div>
                <FormField 
                  label="Password" 
                  required={!editingUser} 
                  icon={<Key size={8} />}
                  error={formErrors.password}
                >
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newUser.password || ''}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 pr-20 text-xs focus:outline-none focus:ring-1 focus:ring-offset-1 transition-all bg-white"
                      style={{ borderColor: formErrors.password ? '#ef4444' : BD }}
                      placeholder={editingUser ? 'New password (optional)' : 'Password'}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                        style={{ color: MU }}
                      >
                        {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors"
                        style={{ background: `${O}15`, color: O }}
                      >
                        Gen
                      </button>
                    </div>
                  </div>
                </FormField>

                {editingUser && newUser.password && (
                  <div className="mt-1.5 p-1.5 rounded-lg" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                    <p className="text-[9px] font-medium" style={{ color: O }}>
                      New: <span className="font-mono">{newUser.password}</span>
                    </p>
                  </div>
                )}

                {!editingUser && newUser.password && (
                  <div className="mt-1.5 p-1.5 rounded-lg" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                    <p className="text-[9px] font-medium" style={{ color: O }}>
                      Password: <span className="font-mono">{newUser.password}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer */}
      <div
  className="px-3 py-2 border-t flex flex-row sm:flex-row sm:justify-end gap-1.5"
  style={{ borderColor: BD, background: BG }}
>
  <Button
    onClick={onSubmit}
    disabled={submitDisabled ?? defaultDisabled}
    size="sm"
    className="flex-1 sm:flex-none text-xs py-1.5"
    style={{ background: O, color: 'white' }}
  >
    {editingUser ? 'Update' : 'Create'}
  </Button>

  <Button
    variant="outline"
    onClick={onClose}
    size="sm"
    className="flex-1 sm:flex-none text-xs py-1.5"
    style={{ borderColor: BD, color: N }}
  >
    Cancel
  </Button>
</div>
      </div>
    </div>
  );
};

export default UserForm;