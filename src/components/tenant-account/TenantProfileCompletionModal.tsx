import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  Briefcase,
  IndianRupee,
  Home,
  MapPin,
  Calendar,
  Utensils,
  Dog,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Tenant } from './types';
import { tenantAPI } from '@/lib/tenantAPI';
import { toast } from 'react-toastify';

interface TenantProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onProfileUpdated: (updatedTenant: Tenant) => void;
  onSuccessProceed?: () => void;
  propertyTitle?: string;
  missingFields?: { field: string; label: string }[];
}

export default function TenantProfileCompletionModal({
  isOpen,
  onClose,
  tenant,
  onProfileUpdated,
  onSuccessProceed,
  propertyTitle,
  missingFields = [],
}: TenantProfileCompletionModalProps) {
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    phone: tenant?.phone || '',
    email: tenant?.email || '',
    tenant_type: tenant?.tenant_type || 'Family',
    occupation_type: tenant?.occupation_type || 'Salaried',
    company_name: tenant?.company_name || '',
    monthly_income: tenant?.monthly_income || '',
    budget_min: tenant?.budget_min || '',
    budget_max: tenant?.budget_max || '',
    preferred_bhk: tenant?.preferred_bhk || '2 BHK',
    preferred_location: tenant?.preferred_location || '',
    food_preference: tenant?.food_preference || 'Any',
    has_pets: tenant?.has_pets || 'No',
    move_in_date: tenant?.move_in_date || '',
    family_members_count: tenant?.family_members_count || '2',
    expected_stay_duration: tenant?.expected_stay_duration || '11 Months',
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are mandatory.');
      return;
    }

    setSaving(true);
    try {
      if (tenant?.id) {
        await tenantAPI.update(tenant.id, formData);
      }
      const updatedTenant: Tenant = {
        ...tenant,
        ...formData,
      };
      onProfileUpdated(updatedTenant);
      toast.success('Profile completed successfully! Match score is now ready.');
      onClose();
      if (onSuccessProceed) {
        onSuccessProceed();
      }
    } catch (err: any) {
      console.error('Error updating tenant profile:', err);
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Complete Your Tenant Profile
              </h2>
              <p className="text-[11px] text-slate-300">
                {propertyTitle
                  ? `Required to express interest in "${propertyTitle}" & compute Match %`
                  : "Required to connect with property owners & calculate match accuracy"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Missing fields notice */}
        {missingFields.length > 0 && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-[11px] text-amber-800 shrink-0">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <span>
              Please fill in your <strong>{missingFields.map(f => f.label).join(', ')}</strong> to send your interest to the owner.
            </span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-700">
          {/* Section 1: Basic & Occupancy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <User size={13} className="text-orange-500" />
              <span>Personal & Occupancy Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Tenant Type *
                </label>
                <select
                  value={formData.tenant_type}
                  onChange={(e) => handleChange('tenant_type', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                >
                  <option value="Family">Family</option>
                  <option value="Bachelor Male">Bachelor Male</option>
                  <option value="Bachelor Female">Bachelor Female</option>
                  <option value="Company Lease">Company Lease</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Employment & Income */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Briefcase size={13} className="text-indigo-500" />
              <span>Employment & Financials</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Occupation Type
                </label>
                <select
                  value={formData.occupation_type}
                  onChange={(e) => handleChange('occupation_type', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                >
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business">Business</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Infosys, TCS, Freelance"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Monthly Income (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 60000"
                  value={formData.monthly_income}
                  onChange={(e) => handleChange('monthly_income', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Rental Preferences */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Home size={13} className="text-emerald-500" />
              <span>Rental Expectations & Budget</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Preferred BHK
                </label>
                <select
                  value={formData.preferred_bhk}
                  onChange={(e) => handleChange('preferred_bhk', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                >
                  <option value="1 RK">1 RK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Max Monthly Budget (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 28000"
                  value={formData.budget_max}
                  onChange={(e) => handleChange('budget_max', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Preferred Move-in Date *
                </label>
                <input
                  type="date"
                  value={formData.move_in_date}
                  onChange={(e) => handleChange('move_in_date', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Habits & Pets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Utensils size={13} className="text-teal-500" />
              <span>Lifestyle Preferences</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Food Habit
                </label>
                <select
                  value={formData.food_preference}
                  onChange={(e) => handleChange('food_preference', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                >
                  <option value="Veg Only">Veg Only (Pure Veg)</option>
                  <option value="Veg/Non-Veg">Veg / Non-Veg</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Has Pets?
                </label>
                <select
                  value={formData.has_pets}
                  onChange={(e) => handleChange('has_pets', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Dog/Cat/Other)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Stay Duration
                </label>
                <select
                  value={formData.expected_stay_duration}
                  onChange={(e) => handleChange('expected_stay_duration', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                >
                  <option value="11 Months">11 Months</option>
                  <option value="1 - 2 Years">1 - 2 Years</option>
                  <option value="2+ Years">2+ Years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 disabled:opacity-60 transition cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Save Profile & Continue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
