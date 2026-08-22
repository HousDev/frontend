import React, { useState } from 'react';
import { X, Calendar, Clock, Bell, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface TenantFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: number | string;
    name: string;
    phone: string;
    email?: string;
    tenant_id: string;
  };
  onSave?: (followupData: any) => void;
}

const BRAND = '#e67e22';

export default function TenantFollowupModal({ isOpen, onClose, tenant, onSave }: TenantFollowupModalProps) {
  const [form, setForm] = useState({
    followupType: 'call',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    status: 'Active Search',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scheduledDate) {
      toast.error('Please select a follow-up date');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Follow-up scheduled for tenant ${tenant.name}`);
      onSave?.({ ...form, tenant_id: tenant.id });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-orange-50/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Schedule Tenant Follow-up</h3>
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
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Follow-up Type</label>
            <select
              value={form.followupType}
              onChange={(e) => setForm({ ...form, followupType: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="call">Phone Call</option>
              <option value="whatsapp">WhatsApp Message</option>
              <option value="visit">Property Visit</option>
              <option value="email">Email</option>
              <option value="meeting">In-Person Meeting</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full h-9 px-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Time</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                className="w-full h-9 px-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tenant Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="Active Search">Active Search</option>
              <option value="Interested">Interested</option>
              <option value="Agreement Signed">Agreement Signed</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Remarks & Notes</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Add follow-up details, tenant preferences or next steps..."
              rows={3}
              className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-orange-500"
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
              className="px-4 py-2 rounded-lg text-white font-bold transition-colors"
              style={{ background: BRAND }}
            >
              {loading ? 'Saving...' : 'Save Follow-up'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
