import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPin,
  Building, User, FileText, CheckCircle, X, SlidersHorizontal
} from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface Tenant {
  id: number;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  preferred_location: string;
  budget_min: string;
  budget_max: string;
  preferred_bhk: string;
  tenant_type: 'Family' | 'Bachelor (Male)' | 'Bachelor (Female)' | 'Company' | '';
  move_in_date: string;
  current_address: string;
  notes: string;
  status: 'Active Search' | 'Interested' | 'Agreement Signed' | 'Inactive';
}

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 1,
    tenant_id: 'TEN0001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    whatsapp: '9876543210',
    preferred_location: 'Kharghar, Sector 12',
    budget_min: '15000',
    budget_max: '22000',
    preferred_bhk: '2 BHK',
    tenant_type: 'Family',
    move_in_date: '2026-09-01',
    current_address: 'Flat 402, Shiv Darshan Towers, Vashi, Navi Mumbai',
    notes: 'Needs parking space for a sedan and prefers high floor flats.',
    status: 'Active Search',
  },
  {
    id: 2,
    tenant_id: 'TEN0002',
    name: 'Priyanka Patel',
    email: 'priyanka.patel@example.com',
    phone: '9812345678',
    whatsapp: '9812345678',
    preferred_location: 'Seawoods',
    budget_min: '25000',
    budget_max: '35000',
    preferred_bhk: '3 BHK',
    tenant_type: 'Family',
    move_in_date: '2026-09-15',
    current_address: 'A-12, Green Meadows, Pune',
    notes: 'Family moving due to job relocation. Prefers fully furnished flats.',
    status: 'Interested',
  },
  {
    id: 3,
    tenant_id: 'TEN0003',
    name: 'Vikram Aditya',
    email: 'vikram.aditya@example.com',
    phone: '9988776655',
    whatsapp: '9988776655',
    preferred_location: 'Belapur',
    budget_min: '12000',
    budget_max: '18000',
    preferred_bhk: '1 BHK',
    tenant_type: 'Bachelor (Male)',
    move_in_date: '2026-08-25',
    current_address: 'Room 10, Sector 15, Kopar Khairane',
    notes: 'IT Professional. Quiet place preferred. Lock-in period of 12 months is fine.',
    status: 'Agreement Signed',
  },
  {
    id: 4,
    tenant_id: 'TEN0004',
    name: 'Tanya Sen',
    email: 'tanya.sen@example.com',
    phone: '9777888999',
    whatsapp: '9777888999',
    preferred_location: 'Nerul East',
    budget_min: '18000',
    budget_max: '24000',
    preferred_bhk: '2 BHK',
    tenant_type: 'Bachelor (Female)',
    move_in_date: '2026-10-01',
    current_address: 'B-303, Tulip Heights, Thane',
    notes: 'Needs flat close to Nerul railway station.',
    status: 'Active Search',
  },
  {
    id: 5,
    tenant_id: 'TEN0005',
    name: 'Intellect Software Solutions',
    email: 'admin@intellectsoft.com',
    phone: '2244556677',
    whatsapp: '9888999000',
    preferred_location: 'Ghansoli, Millennium Business Park',
    budget_min: '40000',
    budget_max: '60000',
    preferred_bhk: '3 BHK',
    tenant_type: 'Company',
    move_in_date: '2026-09-10',
    current_address: 'Unit 5, MBP, Ghansoli',
    notes: 'Company lease agreement. High premium quality apartment required.',
    status: 'Active Search',
  }
];

/* ---------- DESIGN TOKENS (MATCHING PROPERTY FORM) ---------- */
const BRAND = '#E6761D';
const INP = 'w-full h-8 px-2.5 rounded-md text-xs border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-colors placeholder:text-gray-400';
const LBL = 'block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 mb-3 mt-4">
    <div className="w-1 h-3.5 rounded-full flex-shrink-0" style={{ background: BRAND }} />
    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND }}>{children}</span>
    <div className="flex-1 h-px bg-orange-100" />
  </div>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; className?: string }> = ({
  label, required, children, className = '',
}) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className={LBL}>{label}{required && <span className="text-red-400 ml-0.5 normal-case">*</span>}</label>
    {children}
  </div>
);

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Form states
  const [formState, setFormState] = useState<Partial<Tenant>>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    preferred_location: '',
    budget_min: '',
    budget_max: '',
    preferred_bhk: '',
    tenant_type: '',
    move_in_date: '',
    current_address: '',
    notes: '',
    status: 'Active Search'
  });

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tenant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone.includes(searchTerm) ||
        t.preferred_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.preferred_bhk.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter ? t.status === statusFilter : true;
      const matchType = typeFilter ? t.tenant_type === typeFilter : true;

      return matchSearch && matchStatus && matchType;
    });
  }, [tenants, searchTerm, statusFilter, typeFilter]);

  const handleOpenAddModal = () => {
    setEditingTenant(null);
    setFormState({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      preferred_location: '',
      budget_min: '',
      budget_max: '',
      preferred_bhk: '',
      tenant_type: '',
      move_in_date: '',
      current_address: '',
      notes: '',
      status: 'Active Search'
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormState(tenant);
    setShowFormModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.phone) {
      toast.error('Name and Phone fields are required.');
      return;
    }

    if (editingTenant) {
      // Update
      setTenants(prev =>
        prev.map(t => (t.id === editingTenant.id ? { ...t, ...formState } as Tenant : t))
      );
      toast.success('Tenant details updated successfully!');
    } else {
      // Add new
      const newId = tenants.length > 0 ? Math.max(...tenants.map(t => t.id)) + 1 : 1;
      const formattedId = `TEN${String(newId).padStart(4, '0')}`;
      const newTenant: Tenant = {
        id: newId,
        tenant_id: formattedId,
        name: formState.name || '',
        email: formState.email || '',
        phone: formState.phone || '',
        whatsapp: formState.whatsapp || '',
        preferred_location: formState.preferred_location || '',
        budget_min: formState.budget_min || '',
        budget_max: formState.budget_max || '',
        preferred_bhk: formState.preferred_bhk || '',
        tenant_type: (formState.tenant_type as any) || '',
        move_in_date: formState.move_in_date || '',
        current_address: formState.current_address || '',
        notes: formState.notes || '',
        status: (formState.status as any) || 'Active Search'
      };

      setTenants(prev => [newTenant, ...prev]);
      toast.success('New Tenant added successfully!');
    }
    setShowFormModal(false);
  };

  const handleDeleteTenant = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E6761D',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setTenants(prev => prev.filter(t => t.id !== id));
        toast.success('Tenant profile deleted.');
      }
    });
  };

  const getStatusColor = (status: Tenant['status']) => {
    switch (status) {
      case 'Active Search':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Interested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Agreement Signed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 p-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="text-[#E6761D]" size={22} />
            Tenant Management
          </h1>
          <p className="text-xs text-gray-500">Track and manage tenant profiles, rental requirements, and agreement status.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors bg-[#E6761D] hover:bg-[#CC6A1A] shadow-md"
        >
          <Plus size={16} />
          Add Tenant
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by ID, Name, BHK, or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#E6761D] transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
              <SlidersHorizontal size={14} />
              Filters:
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E6761D] bg-white text-gray-600"
            >
              <option value="">All Tenant Types</option>
              <option value="Family">Family</option>
              <option value="Bachelor (Male)">Bachelor (Male)</option>
              <option value="Bachelor (Female)">Bachelor (Female)</option>
              <option value="Company">Company</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E6761D] bg-white text-gray-600"
            >
              <option value="">All Statuses</option>
              <option value="Active Search">Active Search</option>
              <option value="Interested">Interested</option>
              <option value="Agreement Signed">Agreement Signed</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-100 text-left">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              <tr>
                <th className="px-4 py-3">Tenant ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Requirements</th>
                <th className="px-4 py-3">Budget Range</th>
                <th className="px-4 py-3">Move-In Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900">{t.tenant_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{t.name}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{t.tenant_type || 'Renter'}</div>
                    </td>
                    <td className="px-4 py-3 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Phone size={11} className="text-gray-400" />
                        <span>{t.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <SiWhatsapp size={11} className="text-green-600" />
                        <span>{t.whatsapp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 space-y-0.5">
                      <div className="font-semibold text-gray-800">{t.preferred_bhk}</div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{t.preferred_location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{parseInt(t.budget_min).toLocaleString()} - ₹{parseInt(t.budget_max).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.move_in_date ? new Date(t.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 rounded hover:bg-gray-100 text-blue-600 hover:text-blue-700 transition-colors"
                          title="Edit Tenant"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(t.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-red-600 hover:text-red-700 transition-colors"
                          title="Delete Tenant"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <Building size={32} className="mx-auto mb-2 text-gray-300" />
                    No tenants found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal (Matching Lead Form / Property Form exactly) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header (Dark background matching PropertyFormModal) */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b bg-[#111827] border-gray-800 text-white">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#E6761D]" />
                <h2 className="text-sm font-bold text-white">
                  {editingTenant ? `Edit Tenant Profile (${editingTenant.tenant_id})` : 'Add New Tenant Profile'}
                </h2>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X size={16} style={{ color: 'white' }} />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[75vh]">
              
              {/* Section 1: Personal Information */}
              <SectionHeader>Personal Details</SectionHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Field label="Tenant Name" required>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formState.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={INP}
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    type="email"
                    name="email"
                    value={formState.email || ''}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className={INP}
                  />
                </Field>
                <Field label="Phone Number" required>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formState.phone || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className={INP}
                  />
                </Field>
                <Field label="WhatsApp Number">
                  <input
                    type="text"
                    name="whatsapp"
                    value={formState.whatsapp || ''}
                    onChange={handleInputChange}
                    placeholder="WhatsApp number"
                    className={INP}
                  />
                </Field>
              </div>

              {/* Section 2: Requirements & Preferences */}
              <SectionHeader>Requirements & Locations</SectionHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Field label="Preferred Locations">
                  <input
                    type="text"
                    name="preferred_location"
                    value={formState.preferred_location || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Kharghar, Seawoods"
                    className={INP}
                  />
                </Field>
                <Field label="Preferred BHK Configuration">
                  <input
                    type="text"
                    name="preferred_bhk"
                    value={formState.preferred_bhk || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 2 BHK, 3 BHK"
                    className={INP}
                  />
                </Field>
                <Field label="Tenant Category / Type">
                  <select
                    name="tenant_type"
                    value={formState.tenant_type || ''}
                    onChange={handleInputChange}
                    className={INP}
                  >
                    <option value="">Select Category</option>
                    <option value="Family">Family</option>
                    <option value="Bachelor (Male)">Bachelor (Male)</option>
                    <option value="Bachelor (Female)">Bachelor (Female)</option>
                    <option value="Company">Company</option>
                  </select>
                </Field>
                <Field label="Expected Move-in Date">
                  <input
                    type="date"
                    name="move_in_date"
                    value={formState.move_in_date || ''}
                    onChange={handleInputChange}
                    className={INP}
                  />
                </Field>
              </div>

              {/* Section 3: Financials & Status */}
              <SectionHeader>Financials & Remarks</SectionHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Field label="Monthly Budget Min (₹)">
                  <input
                    type="text"
                    name="budget_min"
                    value={formState.budget_min || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 15000"
                    className={INP}
                  />
                </Field>
                <Field label="Monthly Budget Max (₹)">
                  <input
                    type="text"
                    name="budget_max"
                    value={formState.budget_max || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 25000"
                    className={INP}
                  />
                </Field>
                <Field label="Current Residence Address" className="sm:col-span-2">
                  <input
                    type="text"
                    name="current_address"
                    value={formState.current_address || ''}
                    onChange={handleInputChange}
                    placeholder="Enter current city/address"
                    className={INP}
                  />
                </Field>
                <Field label="Lead Search Status">
                  <select
                    name="status"
                    value={formState.status || 'Active Search'}
                    onChange={handleInputChange}
                    className={`${INP} font-bold text-gray-700`}
                  >
                    <option value="Active Search">Active Search</option>
                    <option value="Interested">Interested</option>
                    <option value="Agreement Signed">Agreement Signed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </Field>
                <Field label="Special Requirements & Notes" className="sm:col-span-3">
                  <textarea
                    name="notes"
                    value={formState.notes || ''}
                    onChange={handleInputChange}
                    placeholder="Specify parking, furnishing preferences, pet restrictions, lock-in duration etc."
                    rows={2}
                    className="w-full p-2 rounded-md text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#E6761D] transition-colors resize-none"
                  />
                </Field>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 mt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="h-8 px-4 text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 text-xs font-bold text-white bg-[#E6761D] hover:bg-[#CC6A1A] rounded-md transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle size={13} />
                  {editingTenant ? 'Update Tenant' : 'Add Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
