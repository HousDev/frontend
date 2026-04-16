import React from 'react';
import { BarChart3, Eye, MessageCircle, Users, TrendingUp, DollarSign, Calendar, Target, Activity } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface ReportsTabProps {
  property: any;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ property }) => {
  const views = property.publicViews || 0;
  const visits = property.visits || 0;
  const conversion = views ? ((visits / views) * 100).toFixed(1) : '0.0';

  const safeDaysOnMarket = (createdAt?: string) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt).getTime();
    if (Number.isNaN(created)) return 0;
    return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  };

  const pricePerSqFt = Math.round((Number(property.budget) || 0) / (Number(property.carpetArea) || 1));
  const marketAvg = 18500;
  const priceVariance = ((pricePerSqFt - marketAvg) / marketAvg * 100).toFixed(1);

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <div className="bg-white rounded-lg p-2 transition-all hover:shadow-sm" style={{ border: `1px solid ${BD}` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wider" style={{ color: MU }}>{label}</p>
          <p className="text-base font-bold mt-0.5" style={{ color: N }}>{value}</p>
          {subtext && <p className="text-[7px] mt-0.5" style={{ color: MU }}>{subtext}</p>}
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const InfoRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
    <div className="flex items-center justify-between py-1.5 border-b last:border-b-0" style={{ borderColor: BD }}>
      <span className="text-[9px] sm:text-[10px]" style={{ color: MU }}>{label}</span>
      <span className={`text-[10px] sm:text-[11px] font-medium ${highlight ? 'font-semibold' : ''}`} style={{ color: highlight ? O : N }}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <div className="flex items-center gap-1.5">
            <Activity size={14} style={{ color: O }} />
            <h3 className="text-[11px] font-semibold" style={{ color: N }}>Performance Analytics</h3>
          </div>
        </div>
        
        <div className="p-3">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <StatCard icon={Eye} label="Total Views" value={views.toLocaleString()} subtext="All time" color="#3b82f6" />
            <StatCard icon={MessageCircle} label="Inquiries" value={property.publicInquiries || 0} subtext="Received" color="#10b981" />
            <StatCard icon={Users} label="Site Visits" value={visits.toLocaleString()} subtext="Physical visits" color={O} />
            <StatCard icon={TrendingUp} label="Conversion" value={`${conversion}%`} subtext="Views to visits" color="#8b5cf6" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: BD }}>
            {/* Left Column - Engagement */}
            <div className="rounded-lg p-2" style={{ background: BG, border: `1px solid ${BD}` }}>
              <h4 className="text-[9px] font-semibold mb-1.5" style={{ color: N }}>Engagement Metrics</h4>
              <div className="space-y-0">
                <InfoRow label="Total Views" value={views.toLocaleString()} />
                <InfoRow label="Inquiries" value={(property.publicInquiries || 0).toLocaleString()} />
                <InfoRow label="Site Visits" value={visits.toLocaleString()} />
                <InfoRow label="Conversion Rate" value={`${conversion}%`} highlight />
              </div>
            </div>

            {/* Right Column - Market Position */}
            <div className="rounded-lg p-2" style={{ background: BG, border: `1px solid ${BD}` }}>
              <h4 className="text-[9px] font-semibold mb-1.5" style={{ color: N }}>Market Position</h4>
              <div className="space-y-0">
                <InfoRow label="Price/sq ft" value={`₹${pricePerSqFt.toLocaleString('en-IN')}`} />
                <InfoRow label="Market Average" value={`₹${marketAvg.toLocaleString('en-IN')}`} />
                <InfoRow label="Price Variance" value={`${priceVariance}%`} highlight />
                <InfoRow label="Days on Market" value={safeDaysOnMarket(property.created_at).toString()} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} style={{ color: O }} />
            <h3 className="text-[11px] font-semibold" style={{ color: N }}>Market Insights</h3>
          </div>
        </div>
        <div className="p-3">
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border" style={{ borderColor: BD }}>
            <div className="text-center">
              <BarChart3 size={32} style={{ color: MU }} className="mx-auto mb-1.5" />
              <p className="text-[9px] sm:text-[10px]" style={{ color: MU }}>Market analysis charts will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="bg-white rounded-xl border p-3" style={{ borderColor: BD }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Target size={12} style={{ color: O }} />
          <h3 className="text-[10px] font-semibold" style={{ color: N }}>Key Insights</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-1.5 rounded" style={{ background: `${O}08` }}>
            <TrendingUp size={12} style={{ color: O }} />
            <div>
              <p className="text-[7px]" style={{ color: MU }}>Performance vs Market</p>
              <p className="text-[9px] font-semibold" style={{ color: O }}>{Number(priceVariance) > 0 ? '+' : ''}{priceVariance}% better</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded" style={{ background: `${N}08` }}>
            <Users size={12} style={{ color: N }} />
            <div>
              <p className="text-[7px]" style={{ color: MU }}>Buyer Interest</p>
              <p className="text-[9px] font-semibold" style={{ color: N }}>{visits + (property.publicInquiries || 0)} engagements</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded" style={{ background: '#3b82f608' }}>
            <Calendar size={12} style={{ color: '#3b82f6' }} />
            <div>
              <p className="text-[7px]" style={{ color: MU }}>Days on Market</p>
              <p className="text-[9px] font-semibold" style={{ color: '#3b82f6' }}>{safeDaysOnMarket(property.created_at)} days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;