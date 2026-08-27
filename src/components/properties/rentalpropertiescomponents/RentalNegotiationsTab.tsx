import React from 'react';
import { Target, IndianRupee, ShieldCheck, Calendar, Clock, Plus, CheckCircle2 } from 'lucide-react';

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

interface RentalNegotiationsTabProps {
  property: any;
  onStartNegotiation: () => void;
}

const RentalNegotiationsTab: React.FC<RentalNegotiationsTabProps> = ({
  property,
  onStartNegotiation
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: N }}>Rent & Lock-in Negotiations</h3>
          <p className="text-[11px] text-gray-500">Track active price negotiations, deposit offers, and lock-in period discussions with prospective tenants</p>
        </div>
        <button
          onClick={onStartNegotiation}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 shadow-sm"
          style={{ background: O }}
        >
          <Plus size={14} />
          <span>New Rent Offer</span>
        </button>
      </div>

      {/* Financial Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">Monthly Rent</p>
          <p className="text-sm font-bold mt-0.5 text-orange-600">₹{Number(property?.monthly_rent || 0).toLocaleString('en-IN')}/mo</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">Security Deposit</p>
          <p className="text-sm font-bold mt-0.5 text-slate-800">₹{Number(property?.security_deposit || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">Lock-in Period</p>
          <p className="text-sm font-bold mt-0.5 text-slate-800">{property?.lock_in_period ? `${property.lock_in_period} Months` : 'N/A'}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">Notice Period</p>
          <p className="text-sm font-bold mt-0.5 text-slate-800">{property?.notice_period || 'N/A'}</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: BD }}>
        <Target size={28} className="mx-auto mb-2 text-slate-400 opacity-40" />
        <p className="text-xs font-bold" style={{ color: N }}>No active rent negotiations</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Click "New Rent Offer" to record tenant rent negotiations and deposit terms</p>
      </div>
    </div>
  );
};

export default RentalNegotiationsTab;
