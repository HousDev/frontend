import React, { useState } from 'react';
import { X, Activity, Calendar, Clock, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface TenantActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: number | string;
    name: string;
    phone: string;
    tenant_id: string;
  };
  onSave?: (activityData: any) => void;
}

export default function TenantActivityModal({ isOpen, onClose, tenant, onSave }: TenantActivityModalProps) {
  const [form, setForm] = useState({
    activityType: 'Phone Call',
    activityDate: new Date().toISOString().split('T')[0],
    duration: '15 mins',
    summary: '',
    outcome: 'Interested',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.summary.trim()) {
      toast.error('Please enter activity summary');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Activity logged for tenant ${tenant.name}`);
      onSave?.({ ...form, tenant_id: tenant.id });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Log Tenant Activity</h3>
              <p className="text-[11px] text-gray-500">{tenant.name} ({tenant.tenant_id})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Type</label>
              <select
                value={form.activityType}
                onChange={(e) => setForm({ ...form, activityType: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp Chat">WhatsApp Chat</option>
                <option value="Site Visit">Site Visit</option>
                <option value="In-Person Meeting">In-Person Meeting</option>
                <option value="Email Sent">Email Sent</option>
                <option value="Agreement Discussion">Agreement Discussion</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Outcome</label>
              <select
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Interested">Interested</option>
                <option value="Active Search">Active Search</option>
                <option value="Agreement Signed">Agreement Signed</option>
                <option value="Callback Requested">Callback Requested</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={form.activityDate}
                onChange={(e) => setForm({ ...form, activityDate: e.target.value })}
                className="w-full h-9 px-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 15 mins"
                className="w-full h-9 px-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Activity Summary / Notes</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Record key conversation points, requirements discussed..."
              rows={3}
              className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
              required
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
              className="px-4 py-2 rounded-lg text-white font-bold transition-colors bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Log Activity'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
