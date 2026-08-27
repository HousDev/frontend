import React from 'react';
import { BarChart3, TrendingUp, Users, Eye, FileText, Download } from 'lucide-react';

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

interface RentalReportsTabProps {
  property: any;
}

const RentalReportsTab: React.FC<RentalReportsTabProps> = ({ property }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: N }}>Rental Analytics & Activity Reports</h3>
          <p className="text-[11px] text-gray-500">Track total tenant views, visit conversions, and performance stats</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: BD }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Views</span>
            <Eye size={16} className="text-blue-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">124 Views</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">↑ +18% this week</p>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: BD }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-gray-400">Tenant Inspections</span>
            <Users size={16} className="text-orange-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">8 Visits</p>
          <p className="text-[10px] text-slate-500 mt-1">Scheduled via portal</p>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: BD }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-gray-400">Active Inquiries</span>
            <TrendingUp size={16} className="text-purple-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">15 Matched</p>
          <p className="text-[10px] text-slate-500 mt-1">Tenants in pipeline</p>
        </div>
      </div>
    </div>
  );
};

export default RentalReportsTab;
