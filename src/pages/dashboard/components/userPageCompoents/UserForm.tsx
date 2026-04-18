

// // ./components/userPageCompoents/UserForm.tsx
// import React, { useEffect } from 'react';
// import { Eye, EyeOff } from 'lucide-react';
// import Button from '@/components/ui/Button';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';
// import type { MasterOption } from '@/lib/useMasterData';

// export interface User {
//   id?: string;
//   username?: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   salutation?: string;
//   password?: string;
//   role: string;
//   phone?: string;
//   avatar?: string;
//   designation?: string;
//   department?: string;
//   is_active?: boolean;
//   last_login?: string;
//   created_at?: string;
//   total_leads?: number;
//   total_properties?: number;
//   total_revenue?: number;
//   modulePermissions?: any;
//   dob?: string;
//   blood_group?: string;
//   // allow string (UUID) or numeric id OR null
//   buyer_id?: string | number | null;
//   seller_id?: string | number | null;
// }

// type FormErrors = { [key: string]: string };

// export interface UserFormProps {
//   visible: boolean;
//   onClose: () => void;
//   onSubmit: () => void;
//   editingUser: User | null;
//   newUser: User;
//   setNewUser: (u: User) => void;
//   formErrors: FormErrors;
//   handleInputChange: (field: keyof User, value: string) => void;
//   handleGeneratePassword: () => void;
//   showPassword: boolean;
//   setShowPassword: (v: boolean) => void;
//   masterLoading: boolean;
//   masters: Record<string, MasterOption[]>;
//   submitDisabled?: boolean;
// }

// const UserForm: React.FC<UserFormProps> = ({
//   visible,
//   onClose,
//   onSubmit,
//   editingUser,
//   newUser,
//   setNewUser,
//   formErrors,
//   handleInputChange,
//   handleGeneratePassword,
//   showPassword,
//   setShowPassword,
//   masterLoading,
//   masters,
//   submitDisabled,
// }) => {
//   if (!visible) return null;

//   const roles = masters.role || [];
//   const designations = masters.designation || [];
//   const departments = masters.department || [];
//   const bloodGroups = masters['blood groups'] || [];
//   const salutations = masters.salutation || masters['salutation'] || [];


//   useEffect(() => {
//     if (editingUser) {

//     } else if (newUser.buyer_id || newUser.seller_id) {

//     }
//   }, [editingUser, newUser.buyer_id, newUser.seller_id, newUser.role, newUser.salutation]);

//   const defaultDisabled =
//     !newUser.salutation ||
//     !newUser.email ||
//     !newUser.first_name ||
//     !newUser.last_name ||
//     !newUser.role ||
//     !newUser.dob ||
//     (!editingUser && !newUser.password);

//   // Helper when role changes to keep buyer_id/seller_id consistent
//   const handleRoleChange = (value: string) => {
//     // Notify parent generic change handler
//     handleInputChange('role', value);

//     // Update IDs accordingly: keep whichever id exists for that role, clear the other
//     if (value.toLowerCase() === 'buyer') {
//       setNewUser({
//         ...newUser,
//         role: value,
//         buyer_id: newUser.buyer_id ?? null,
//         seller_id: null,
//       });

//     } else if (value.toLowerCase() === 'seller') {
//       setNewUser({
//         ...newUser,
//         role: value,
//         seller_id: newUser.seller_id ?? null,
//         buyer_id: null,
//       });

//     } else {
//       setNewUser({
//         ...newUser,
//         role: value,
//         buyer_id: null,
//         seller_id: null,
//       });

//     }
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
//       role="dialog"
//       aria-modal="true"
//     >
//       <div className="bg-white rounded-lg w-full max-w-full sm:max-w-xl shadow-lg">
//         {/* Header */}
//         <div className="px-4 sm:px-6 pt-4 sm:pt-6">
//           <h3 className="text-base sm:text-lg font-semibold text-gray-900">
//             {editingUser ? 'Edit User' : 'Add User'}
//           </h3>
//         </div>

//         {/* Body */}
//         <div className="px-4 sm:px-6 pb-4 sm:pb-6 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto overscroll-contain">
//           {masterLoading ? (
//             <div className="flex justify-center items-center py-8">
//               <LoadingSpinner size="sm" />
//               <span className="ml-2 text-base">Loading form options...</span>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 gap-4">
//                 {/* Row: Salutation / First / Last */}
//                 <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Salutation <span className="text-red-500">*</span>
//                     </label>

//                     {salutations.length > 0 ? (
//                       <select
//                         value={newUser.salutation || ''}
//                         onChange={(e) => handleInputChange('salutation', e.target.value)}
//                         className={`w-full h-10 sm:h-9 border rounded px-2 text-sm focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.salutation ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                       >
//                         <option value="">Select</option>
//                         {salutations.map((s) => (
//                           <option key={s.value} value={s.value}>
//                             {s.label}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <input
//                         type="text"
//                         value={newUser.salutation || ''}
//                         onChange={(e) => handleInputChange('salutation', e.target.value)}
//                         className={`w-full h-10 sm:h-9 border rounded px-2 text-sm focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.salutation ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="Mr / Ms / Dr"
//                       />
//                     )}
//                     {formErrors.salutation && (
//                       <p className="text-red-600 text-xs mt-1">{formErrors.salutation}</p>
//                     )}
//                   </div>

//                   <div className="md:col-span-5">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       First Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={newUser.first_name}
//                       onChange={(e) => handleInputChange('first_name', e.target.value)}
//                       className={`w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.first_name ? 'border-red-300' : 'border-gray-300'
//                         }`}
//                       placeholder="First name"
//                     />
//                     {formErrors.first_name && (
//                       <p className="text-red-600 text-xs mt-1">{formErrors.first_name}</p>
//                     )}
//                   </div>

//                   <div className="md:col-span-5">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Last Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={newUser.last_name}
//                       onChange={(e) => handleInputChange('last_name', e.target.value)}
//                       className={`w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.last_name ? 'border-red-300' : 'border-gray-300'
//                         }`}
//                       placeholder="Last name"
//                     />
//                     {formErrors.last_name && (
//                       <p className="text-red-600 text-xs mt-1">{formErrors.last_name}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Row: Username / Email */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Username <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={newUser.username || ''}
//                       onChange={(e) => handleInputChange('username', e.target.value)}
//                       className={`w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.username ? 'border-red-300' : 'border-gray-300'
//                         }`}
//                       placeholder="Username"
//                     />
//                     {formErrors.username && (
//                       <p className="text-red-600 text-xs mt-1">{formErrors.username}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="email"
//                       value={newUser.email}
//                       onChange={(e) => handleInputChange('email', e.target.value)}
//                       className={`w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.email ? 'border-red-300' : 'border-gray-300'
//                         }`}
//                       placeholder="Email"
//                     />
//                     {formErrors.email && (
//                       <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Row: DOB / Phone */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Date of Birth <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="date"
//                       value={newUser.dob || ''}
//                       onChange={(e) => handleInputChange('dob', e.target.value)}
//                       max={new Date().toISOString().split('T')[0]}
//                       className={`w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.dob ? 'border-red-300' : 'border-gray-300'
//                         }`}
//                     />
//                     {formErrors.dob && (
//                       <p className="text-red-600 text-xs mt-1">{formErrors.dob}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="tel"
//                       value={newUser.phone || ''}
//                       onChange={(e) => handleInputChange('phone', e.target.value)}
//                       className="w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
//                       placeholder="Phone"
//                     />
//                   </div>
//                 </div>

//                 {/* Row: Department / Role */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Department <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={newUser.department || ''}
//                       onChange={(e) => handleInputChange('department', e.target.value)}
//                       className="w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
//                     >
//                       <option value="">Select Department</option>
//                       {departments.map((department) => (
//                         <option key={department.value} value={department.value}>
//                           {department.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Role <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={newUser.role || ''}
//                       onChange={(e) => handleRoleChange(e.target.value)}
//                       className={`w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.role ? 'border-red-300' : 'border-gray-300'
//                         }`}
//                     >
//                       <option value="">Select Role</option>
//                       {roles.map((role) => (
//                         <option key={role.value} value={role.value}>
//                           {role.label}
//                         </option>
//                       ))}
//                     </select>
//                     {formErrors.role && (
//                       <p className="text-red-600 text-xs mt-1">{formErrors.role}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Row: Designation / Blood Group */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
//                     <select
//                       value={newUser.designation || ''}
//                       onChange={(e) => handleInputChange('designation', e.target.value)}
//                       className="w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
//                     >
//                       <option value="">Select Designation</option>
//                       {designations.map((designation) => (
//                         <option key={designation.value} value={designation.value}>
//                           {designation.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
//                     <select
//                       value={newUser.blood_group || ''}
//                       onChange={(e) => handleInputChange('blood_group', e.target.value)}
//                       className="w-full h-10 sm:h-9 border rounded px-2 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-300"
//                     >
//                       <option value="">Select Blood Group</option>
//                       {bloodGroups.map((bloodGroup) => (
//                         <option key={bloodGroup.value} value={bloodGroup.value}>
//                           {bloodGroup.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {/* Password */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Password {!editingUser && <span className="text-red-500">*</span>}
//                     {editingUser && (
//                       <span className="text-gray-400 text-sm"> (leave blank to keep current)</span>
//                     )}
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={newUser.password || ''}
//                       onChange={(e) => handleInputChange('password', e.target.value)}
//                       className={`w-full h-10 sm:h-9 border rounded px-2 pr-20 text-base focus:outline-blue-500 focus:ring-1 focus:ring-blue-500 ${formErrors.password ? 'border-red-300' : 'border-gray-300'
//                         }`}
//                       placeholder={editingUser ? 'New password (optional)' : 'Password (min 6 characters)'}
//                     />
//                     <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="text-gray-400 hover:text-gray-600"
//                       >
//                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleGeneratePassword}
//                         className="text-blue-600 hover:text-blue-700 text-xs font-medium"
//                       >
//                         Gen
//                       </button>
//                     </div>
//                   </div>
//                   {formErrors.password && (
//                     <p className="text-red-600 text-xs mt-1">{formErrors.password}</p>
//                   )}

//                   {newUser.password && !editingUser && (
//                     <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
//                       <p className="text-xs text-blue-800 font-medium">
//                         **Password: <span className="font-mono">{newUser.password}</span>
//                       </p>
//                     </div>
//                   )}

//                   {editingUser && newUser.password && (
//                     <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
//                       <p className="text-xs text-green-800 font-medium">
//                         **New Password: <span className="font-mono">{newUser.password}</span>
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Footer / Actions */}
//         <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-white sticky bottom-0">
//           <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
//             <Button
//               onClick={onSubmit}
//               disabled={submitDisabled ?? defaultDisabled}
//               size="sm"
//               className="w-full sm:w-auto"
//             >
//               {editingUser ? 'Update' : 'Create'}
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 onClose();
//               }}
//               size="sm"
//               className="w-full sm:w-auto"
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserForm;.
// ./components/userPageCompoents/UserForm.tsx
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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
                      value={newUser.role || ''}
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