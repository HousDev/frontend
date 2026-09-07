import React, { useState } from 'react';
import {
  Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ShieldAlert, UserCheck, X, FileText, Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Tenant, MaintenanceTicket } from './types';

interface TenantMaintenanceTabProps {
  tenant: Tenant;
}

export default function TenantMaintenanceTab({ tenant }: TenantMaintenanceTabProps) {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<MaintenanceTicket['category']>('Plumbing');
  const [priority, setPriority] = useState<MaintenanceTicket['priority']>('Medium');
  const [description, setDescription] = useState<string>('');

  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    {
      id: 'TKT-201',
      ticketNo: 'TKT-2026-004',
      title: 'Kitchen Sink Tap Leakage',
      category: 'Plumbing',
      priority: 'Medium',
      description: 'The kitchen sink faucet is dripping continuously causing water accumulation.',
      status: 'Technician Assigned',
      createdAt: '2026-09-02',
      technicianName: 'Ramesh Kumar (Plumber)',
      estimatedCost: 350,
    },
    {
      id: 'TKT-200',
      ticketNo: 'TKT-2026-002',
      title: 'Master Bedroom AC Servicing',
      category: 'Appliance',
      priority: 'Low',
      description: 'Routine AC filter cleaning and cooling check required.',
      status: 'Completed',
      createdAt: '2026-08-15',
      technicianName: 'CoolAir Solutions',
      estimatedCost: 650,
    },
  ]);

  const handleCreateTicket = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and issue description');
      return;
    }

    const newTicket: MaintenanceTicket = {
      id: `TKT-${Date.now()}`,
      ticketNo: `TKT-2026-0${tickets.length + 5}`,
      title,
      category,
      priority,
      description,
      status: 'Pending Approval',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTickets([newTicket, ...tickets]);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    toast.success('Maintenance request submitted to owner and executive successfully!');
  };

  const getPriorityBadge = (p: MaintenanceTicket['priority']) => {
    switch (p) {
      case 'Emergency':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (s: MaintenanceTicket['status']) => {
    switch (s) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
      case 'Technician Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Wrench size={16} className="text-orange-500" />
              <span>Maintenance & Repair Portal</span>
            </h2>
            <p className="text-[10px] text-gray-500">
              Submit repair requests for your property. Track technician visits and landlord approvals.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Raise Repair Request</span>
          </button>
        </div>

        {/* Ticket Stats */}
        <div className="grid grid-cols-3 gap-3 pt-1 text-center">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-base font-black text-slate-900">{tickets.length}</span>
            <span className="text-[9px] font-bold uppercase text-gray-400 block">Total Requests</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-base font-black text-blue-600">
              {tickets.filter((t) => t.status !== 'Completed').length}
            </span>
            <span className="text-[9px] font-bold uppercase text-gray-400 block">Active Tickets</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-base font-black text-emerald-600">
              {tickets.filter((t) => t.status === 'Completed').length}
            </span>
            <span className="text-[9px] font-bold uppercase text-gray-400 block">Resolved</span>
          </div>
        </div>
      </div>

      {/* Maintenance Tickets List */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs sm:text-sm text-slate-900">Your Maintenance Tickets</h3>

        {tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl border border-gray-200 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-[9px]">
                      {t.ticketNo}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{t.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getPriorityBadge(t.priority)}`}>
                      {t.priority} Priority
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed">{t.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>Category: <strong className="text-slate-700">{t.category}</strong></span>
                    <span>Logged Date: <strong>{new Date(t.createdAt).toLocaleDateString('en-IN')}</strong></span>
                  </div>

                  {t.technicianName && (
                    <div className="flex items-center gap-1 font-semibold text-blue-700">
                      <UserCheck size={12} />
                      <span>Assigned: {t.technicianName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl text-[10px]">
            No maintenance repair requests raised yet.
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Raise Maintenance Request</h3>
                <p className="text-[10px] text-gray-500">Describe the maintenance issue at your rented property</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Geyser not heating, Bathroom tap leakage..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-lg font-bold outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-gray-300 rounded-lg font-bold outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Appliance">Appliance</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Painting">Painting</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="General">General Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-gray-300 rounded-lg font-bold outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Issue Description & Details</label>
                <textarea
                  rows={3}
                  placeholder="Provide detailed description of the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-lg font-medium outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleCreateTicket}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check size={14} />
              <span>Submit Request</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
