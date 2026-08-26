import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Calendar, Clock, Home, MapPin, FileText, CheckCircle2, Search, Loader2, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { usersAPI } from '@/lib/api';

interface TenantVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: number | string;
    name: string;
    phone: string;
    preferred_location?: string;
    tenant_id: string;
  };
  onSave?: (visitData: any) => void;
}

export default function TenantVisitModal({ isOpen, onClose, tenant, onSave }: TenantVisitModalProps) {
  const [form, setForm] = useState({
    propertyTitle: '',
    rental_property_id: null as number | string | null,
    owner_id: null as number | string | null,
    executive_id: '' as number | string,
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '11:00',
    duration_minutes: 60,
    visit_type: 'site_visit',
    meetPoint: tenant.preferred_location || '',
    remarks: '',
    feedback: '',
    rating: 5,
    accompanied_by: '',
    outcome: '',
    status: 'Scheduled',
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingProps, setLoadingProps] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch properties and executives on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingProps(true);
      try {
        const [propsList, usersRes] = await Promise.all([
          rentalPropertiesAPI.getAll().catch(() => []),
          usersAPI.getAllUsers().catch(() => ({ success: false, data: [] }))
        ]);
        setProperties(propsList);
        if (usersRes.success && Array.isArray(usersRes.data)) {
          const execs = usersRes.data.filter((u: any) =>
            u.role === "sales_executive" || u.role_name === "sales_executive" || u.role_name === "admin"
          );
          setExecutives(execs);
        }
      } catch (err) {
        console.error('Error fetching modal data:', err);
      } finally {
        setLoadingProps(false);
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Click outside dropdown handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;
    const term = searchTerm.toLowerCase();
    return properties.filter((p: any) => {
      const idStr = `rent-${p.id}`;
      const titleStr = String(p.title || p.property_type_name || '').toLowerCase();
      const locStr = String(p.location_name || p.society_name || '').toLowerCase();
      return idStr.includes(term) || titleStr.includes(term) || locStr.includes(term);
    });
  }, [searchTerm, properties]);

  const handleSelectProperty = (p: any) => {
    const title = p.title || p.property_type_name || p.unit_type || `Rental Property RENT-${p.id}`;
    setForm(prev => ({
      ...prev,
      propertyTitle: title,
      rental_property_id: p.id,
      owner_id: p.owner_id || p.seller_id || null,
      meetPoint: p.society_name || p.location_name || p.address || prev.meetPoint,
    }));
    setSearchTerm(`RENT-${p.id} - ${title}`);
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visitDate) {
      toast.error('Please select a visit date');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        tenant_id: tenant.id,
        property_title: form.propertyTitle,
        rental_property_id: form.rental_property_id,
        owner_id: form.owner_id,
        executive_id: form.executive_id || null,
        visit_date: form.visitDate,
        visit_time: form.visitTime,
        duration_minutes: Number(form.duration_minutes),
        visit_type: form.visit_type,
        meeting_point: form.meetPoint,
        remarks: form.remarks,
        feedback: form.feedback || null,
        rating: form.rating ? Number(form.rating) : null,
        accompanied_by: form.accompanied_by || null,
        outcome: form.outcome || null,
        status: form.status,
      };
      await tenantVisitAPI.create(payload);
      toast.success(`Site Visit scheduled for ${tenant.name}`);
      onSave?.(payload);
      onClose();
    } catch (err) {
      console.error('Error creating visit:', err);
      toast.error('Failed to schedule site visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-green-50/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold">
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Schedule Property Site Visit</h3>
              <p className="text-[11px] text-gray-500">{tenant.name} ({tenant.tenant_id})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Autocomplete Rental Property */}
          <div className="relative" ref={wrapperRef}>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rental Property <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by ID (e.g. rent-5), title, or location..."
                className="w-full h-9 pl-8 pr-8 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
                required
              />
              <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setForm(prev => ({ ...prev, propertyTitle: '', rental_property_id: null, owner_id: null }));
                  }}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {loadingProps ? (
                  <div className="flex items-center justify-center py-4 text-gray-400 gap-1.5">
                    <Loader2 className="animate-spin text-green-600" size={14} />
                    <span>Loading rental properties...</span>
                  </div>
                ) : filteredProperties.length > 0 ? (
                  filteredProperties.map((p: any) => {
                    const title = p.title || p.property_type_name || p.unit_type || `Rental Property RENT-${p.id}`;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProperty(p)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-gray-50 last:border-b-0 flex flex-col gap-0.5"
                      >
                        <div className="font-semibold text-slate-800 text-xs">RENT-{p.id} - {title}</div>
                        <div className="text-[10px] text-gray-400">{p.location_name || p.society_name || 'No location info'}</div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-gray-400 italic">No matching properties found.</div>
                )}
              </div>
            )}
          </div>

          {/* Assigned Executive */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Executive</label>
            <select
              value={form.executive_id}
              onChange={(e) => setForm({ ...form, executive_id: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
            >
              <option value="">Select Executive</option>
              {executives.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name || ex.username}</option>
              ))}
            </select>
          </div>

          {/* Date, Time, Duration Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={form.visitDate}
                onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                className="w-full h-9 px-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Time</label>
              <input
                type="time"
                value={form.visitTime}
                onChange={(e) => setForm({ ...form, visitTime: e.target.value })}
                className="w-full h-9 px-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</label>
              <select
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                className="w-full h-9 px-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Visit Type & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Visit Type</label>
              <select
                value={form.visit_type}
                onChange={(e) => setForm({ ...form, visit_type: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
              >
                <option value="site_visit">Site Visit</option>
                <option value="virtual_tour">Virtual Tour</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Meeting Point & Accompanied By */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Meeting Point</label>
              <input
                type="text"
                value={form.meetPoint}
                onChange={(e) => setForm({ ...form, meetPoint: e.target.value })}
                placeholder="Society gate, office, etc."
                className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Accompanied By</label>
              <input
                type="text"
                value={form.accompanied_by}
                onChange={(e) => setForm({ ...form, accompanied_by: e.target.value })}
                placeholder="e.g. Spouse, Agent"
                className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
              />
            </div>
          </div>

          {/* If status is Completed, collect Feedback */}
          {form.status === 'Completed' && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setForm({ ...form, rating: stars })}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star size={16} className={stars <= form.rating ? 'fill-current' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Visit Feedback</label>
                <textarea
                  value={form.feedback}
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  placeholder="Tenant's reaction, rent negotiation comments, etc."
                  rows={2}
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Outcome</label>
                <input
                  type="text"
                  value={form.outcome}
                  onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                  placeholder="e.g. Liked, wants rent reduced"
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Notes & Instructions</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Key handover, owner presence notes, etc."
              rows={2}
              className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white font-bold transition-colors bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Scheduling...' : 'Schedule Visit'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
