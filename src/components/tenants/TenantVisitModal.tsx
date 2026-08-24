import React, { useState } from 'react';
import { X, Calendar, Clock, Home, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

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

const BRAND = '#e67e22';

export default function TenantVisitModal({ isOpen, onClose, tenant, onSave }: TenantVisitModalProps) {
  const [form, setForm] = useState({
    propertyTitle: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '11:00',
    meetPoint: tenant.preferred_location || '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visitDate) {
      toast.error('Please select a visit date');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Site Visit scheduled for ${tenant.name}`);
      onSave?.({ ...form, tenant_id: tenant.id });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rental Property Title / ID</label>
            <input
              type="text"
              value={form.propertyTitle}
              onChange={(e) => setForm({ ...form, propertyTitle: e.target.value })}
              placeholder="e.g. RENT-102 (2BHK Apartment in Hinjewadi)"
              className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Visit Date</label>
              <input
                type="date"
                value={form.visitDate}
                onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                className="w-full h-9 px-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Visit Time</label>
              <input
                type="time"
                value={form.visitTime}
                onChange={(e) => setForm({ ...form, visitTime: e.target.value })}
                className="w-full h-9 px-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Meeting Point / Address</label>
            <input
              type="text"
              value={form.meetPoint}
              onChange={(e) => setForm({ ...form, meetPoint: e.target.value })}
              placeholder="Society main gate or landmark"
              className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Notes & Instructions</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Key handover, owner presence notes, etc."
              rows={3}
              className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
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
