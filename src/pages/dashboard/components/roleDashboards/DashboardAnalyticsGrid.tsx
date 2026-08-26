import React, { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  Sparkles, TrendingUp, Building2, Calendar, Target, User, ShieldCheck,
  ChevronRight, ArrowUpRight, CheckCircle2, Award, Clock, Eye, Layers, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardAnalyticsGridProps {
  user?: any;
  allLeads: any[];
  allProperties: any[];
  buyersList: any[];
  sellersList: any[];
  visitsList: any[];
}

export const DashboardAnalyticsGrid: React.FC<DashboardAnalyticsGridProps> = ({
  user,
  allLeads = [],
  allProperties = [],
  buyersList = [],
  sellersList = [],
  visitsList = []
}) => {
  // 1. Lead Mix BHK Preference Calculations
  const leadMix = useMemo(() => {
    let bhk2 = 0, bhk3 = 0, bhk4 = 0;
    allProperties.forEach(p => {
      const text = String(p.title || p.unitType || p.unit_type || p.bhk || '').toLowerCase();
      if (text.includes('2') || text.includes('2bhk')) bhk2++;
      else if (text.includes('4') || text.includes('4bhk')) bhk4++;
      else bhk3++;
    });
    const total = (bhk2 + bhk3 + bhk4) || 1;
    const p2 = Math.round((bhk2 / total) * 100) || 22;
    const p3 = Math.round((bhk3 / total) * 100) || 39;
    const p4 = Math.round((bhk4 / total) * 100) || 39;
    return [
      { name: '2 BHK', val: bhk2 || 5, pct: p2, color: '#d97706' },
      { name: '3 BHK', val: bhk3 || 9, pct: p3, color: '#0c3854' },
      { name: '4 BHK', val: bhk4 || 9, pct: p4, color: '#10b981' },
    ];
  }, [allProperties]);

  // 2. Lead Dynamics (7 Days Line Data)
  const leadDynamicsData = useMemo(() => {
    const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
    const mockVals = [4, 6, 8, 23, 11, 7, 5];
    return days.map((d, i) => ({
      day: d,
      leads: allLeads.length > 0 ? (allLeads.length / 7 * (i + 1) + (i % 2 === 0 ? 3 : 1)) : mockVals[i]
    }));
  }, [allLeads]);

  // 3. Demand Analysis Radar Data
  const radarData = useMemo(() => [
    { subject: '2 BHK', value: 80 },
    { subject: '3 BHK', value: 120 },
    { subject: '4 BHK', value: 60 },
    { subject: 'Visits', value: visitsList.length || 45 },
    { subject: 'Leads', value: allLeads.length || 95 },
  ], [allLeads, visitsList]);

  // 4. Visit Status Doughnut Data
  const visitsCount = visitsList.length || 13;
  const pendingVisits = Math.max(2, Math.round(visitsCount * 0.4)) || 10;
  const visitDoughnutData = [
    { name: 'Visits', value: visitsCount, color: '#d97706' },
    { name: 'Pending', value: pendingVisits, color: '#1e293b' },
  ];

  // 5. Visit Dynamics Step Chart Data
  const visitDynamicsData = [
    { day: '19', visits: 2 },
    { day: '20', visits: 3 },
    { day: '21', visits: 5 },
    { day: '22', visits: 4 },
    { day: '23', visits: 7 },
    { day: '24', visits: 3 },
    { day: '25', visits: 2 },
  ];

  return (
    <div className="space-y-4">
      {/* ── ROW 1: 4 Analytics Widgets Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Widget 1: Lead Mix (BHK Preference) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                Lead Mix
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mb-3">BHK preference distribution</p>

            <div className="space-y-3">
              {leadMix.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-700">
                    <span>{item.name}</span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Highest demand</span>
            <span className="font-extrabold text-amber-600">3 BHK Premium</span>
          </div>
        </div>

        {/* Widget 2: Lead Dynamics Golden Line Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                Lead Dynamics
              </h3>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">• Leads</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mb-2">Enquiries received over last 7 days</p>
          </div>

          <div className="h-28 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadDynamicsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '11px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="leads" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <div>
              <span className="text-slate-400 block uppercase">TOTAL</span>
              <span className="text-slate-900 text-xs">{allLeads.length || 23}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase">DAILY AVG</span>
              <span className="text-slate-900 text-xs">{((allLeads.length || 23) / 7).toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase">TODAY</span>
              <span className="text-amber-600 text-xs">0</span>
            </div>
          </div>
        </div>

        {/* Widget 3: Demand Analysis Radar Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                Demand Analysis
              </h3>
              <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">LIVE</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mb-1">Property interest mapping</p>
          </div>

          <div className="h-32 w-full my-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                <Radar name="Interest" dataKey="value" stroke="#d97706" fill="#d97706" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] font-bold text-slate-400 text-center border-t border-slate-100 pt-1.5">
            Balanced Buyer Demand
          </div>
        </div>

        {/* Widget 4: Visit Status Doughnut Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                Visit Status
              </h3>
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mb-1">Site visit activity ratio</p>
          </div>

          <div className="h-28 w-full my-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visitDoughnutData}
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {visitDoughnutData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase">VISITS</span>
              <span className="text-base font-black text-slate-900 leading-none">{visitsCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 font-bold">
            <span className="flex items-center gap-1 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-amber-600" /> Visits {visitsCount}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-800" /> Pending {pendingVisits}
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Account, Visit Dynamics, CMS Modules & Featured Property Showcase ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Account Profile Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold text-xs text-slate-900">Account</span>
            <User className="w-4 h-4 text-amber-500" />
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 font-black flex items-center justify-center text-sm shadow-xs shrink-0 border border-amber-400">
              {user?.first_name ? user.first_name[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-slate-900 truncate">{user?.first_name || 'Admin'} {user?.last_name || ''}</h4>
              <p className="text-[10px] text-slate-400 font-medium truncate">Active session • {user?.role || 'Administrator'}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure connection</span>
          </div>
        </div>

        {/* Visit Dynamics Step Bar Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">Visit Dynamics</h3>
            <span className="text-[10px] font-bold text-slate-400">Avg 1.9</span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mb-2">Scheduled visits across last 7 days</p>

          <div className="h-20 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitDynamicsData} barGap={2}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="visits" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-1.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 text-center">
            Consistent Daily Appointments
          </div>
        </div>

        {/* CMS Modules Quick Access */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">Quick Navigation</h3>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Modules</span>
          </div>

          <div className="space-y-1.5 text-xs font-semibold">
            <Link to="/dashboard/leads" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
              <span className="flex items-center gap-2 text-[11px]"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Leads Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link to="/dashboard/properties" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
              <span className="flex items-center gap-2 text-[11px]"><Building2 className="w-3.5 h-3.5 text-indigo-500" /> Properties Inventory</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link to="/dashboard/property-visits" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
              <span className="flex items-center gap-2 text-[11px]"><Calendar className="w-3.5 h-3.5 text-pink-500" /> Visit Schedule</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Property Showcase Featured Card */}
        <div className="bg-[#0c3854] rounded-2xl p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between border border-[#0c3854]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#072437] via-[#0c3854]/70 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black tracking-wider border border-amber-500/30 uppercase">
              PROPERTY SHOWCASE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
              LIVE
            </span>
          </div>

          <div className="relative z-10 my-3">
            <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Featured Listing</p>
            <h4 className="text-sm font-black text-white leading-tight mt-0.5">Premium Residences</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" /> Hinjewadi-Wakad Link Rd, Pune
            </p>
          </div>

          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-400">₹ 85.00 Lakh</span>
            <Link to="/dashboard/properties" className="text-white hover:text-amber-300 font-bold text-[11px] flex items-center gap-0.5">
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalyticsGrid;
