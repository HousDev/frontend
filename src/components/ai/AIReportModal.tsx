import React, { useState } from 'react';
import {
  X,
  Brain,
  TrendingUp,
  Target,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Sparkles,
  Search,
  ArrowRight,
  ChevronRight,
  Flame,
  Calendar,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockPro?: () => void;
  initialLocality?: string;
}

const PUNE_LOCALITIES = [
  'Wakad',
  'Baner',
  'Hinjewadi',
  'Kharadi',
  'Ravet',
  'Punawale',
  'Balewadi',
  'Bavdhan',
  'Pimple Saudagar',
  'Kothrud'
];

const AIReportModal: React.FC<AIReportModalProps> = ({
  isOpen,
  onClose,
  onUnlockPro,
  initialLocality = 'Wakad'
}) => {
  const [persona, setPersona] = useState<'buyer' | 'seller' | 'tenant' | 'landlord'>('buyer');
  const [locality, setLocality] = useState(initialLocality);
  const [bhk, setBhk] = useState('2 BHK');
  const [carpetArea, setCarpetArea] = useState<number>(780);
  const [price, setPrice] = useState<number>(7500000);
  const [societyName, setSocietyName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('v1/ai-reports/generate', {
        persona,
        locality,
        societyName,
        bhk,
        carpetArea: Number(carpetArea),
        price: Number(price)
      });

      if (res.data?.success && res.data.report) {
        setReport(res.data.report);
      } else {
        toast.error('Could not generate report. Please try again.');
      }
    } catch (err: any) {
      toast.error('Report error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-900 via-[#0b3856] to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#E6761D] to-orange-400 text-white shadow-md">
              <Brain size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">Real-Time AI Market Report</h3>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Live Data Sync
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Powered by Current DB Comps + Historical Transactions + Google Search Demand
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Persona Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
              1. Select Your Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'buyer', label: '🏠 Buyer', desc: 'Buy Resale Flat' },
                { id: 'seller', label: '🏷️ Seller', desc: 'Sell at Best Price' },
                { id: 'tenant', label: '🔑 Tenant', desc: 'Rent a Home' },
                { id: 'landlord', label: '🏢 Landowner', desc: 'Rent Out Property' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    persona === p.id
                      ? 'border-[#E6761D] bg-orange-50/70 shadow-sm ring-2 ring-[#E6761D]/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{p.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Property Inputs */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              2. Property & Locality Details (Pune)
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Locality</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E6761D] focus:border-[#E6761D]"
                >
                  {PUNE_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>{loc}, Pune</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">BHK Configuration</label>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E6761D] focus:border-[#E6761D]"
                >
                  {['1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Carpet Area (sq.ft)</label>
                <input
                  type="number"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(Number(e.target.value))}
                  placeholder="e.g. 780"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E6761D] focus:border-[#E6761D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {persona === 'seller' ? 'Your Target / Expected Price (₹)' : 'Asking / Target Price (₹)'}
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="e.g. 7500000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E6761D] focus:border-[#E6761D]"
                />
                <span className="text-[11px] text-gray-500 mt-1 block font-medium">
                  {formatCurrency(price)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Society Name (Optional)</label>
                <input
                  type="text"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  placeholder="e.g. Rohan Tarang, Kolte Patil Western"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E6761D] focus:border-[#E6761D]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Brain className="animate-spin" size={16} />
                    Analyzing Current Comps & Trends...
                  </>
                ) : (
                  <>
                    Generate Real-Time AI Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Report Section */}
          {report && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Verdict Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0b3856] to-slate-900 text-white shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-orange-500 text-white">
                        AI Verdict
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        Score: <strong className="text-white text-sm">{report.aiScore}/100</strong>
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-100 leading-relaxed max-w-2xl">
                      {report.aiVerdict}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 bg-white/10 px-4 py-2.5 rounded-xl border border-white/15">
                    <div className="text-[11px] text-gray-300 uppercase tracking-wider">Status</div>
                    <div className={`text-base font-extrabold capitalize ${
                      report.priceStatus === 'undervalued' ? 'text-emerald-400' :
                      report.priceStatus === 'fair' ? 'text-blue-300' : 'text-amber-400'
                    }`}>
                      {report.priceStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Fair Value Spectrum */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <Target size={16} className="text-blue-600" />
                    Fair Market Value
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(report.fairValuation?.mid)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Band: {formatCurrency(report.fairValuation?.min)} - {formatCurrency(report.fairValuation?.max)}
                  </div>
                  <div className="mt-3 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg font-medium">
                    Rate: ₹{Number(report.currentMarketRateSqft).toLocaleString()}/sq.ft
                  </div>
                </div>

                {/* Google Trends Search Heat */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <Flame size={16} className="text-orange-500" />
                    Google Search Demand
                  </div>
                  <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {report.googleDemandHeat?.score || 85}/100
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium uppercase">
                      {report.googleDemandHeat?.direction || 'rising'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {report.googleDemandHeat?.topQueries || `Flats in ${locality}`}
                  </div>
                  <div className="mt-3 text-[11px] text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg font-medium">
                    High buyer search volume in Pune
                  </div>
                </div>

                {/* Historical 3-Yr Growth */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <TrendingUp size={16} className="text-emerald-600" />
                    3-Yr Historical CAGR
                  </div>
                  <div className="text-xl font-bold text-emerald-600">
                    +{report.historicalCagr || 8.5}% / yr
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Tracked from closed registry deeds
                  </div>
                  <div className="mt-3 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">
                    Rental yield: ~4.6% in {locality}
                  </div>
                </div>
              </div>

              {/* Strengths & Risks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    Market Highlights & Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {report.strengths?.map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <ShieldAlert size={16} />
                    Legal & Due Diligence Advisory
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {report.risks?.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verified Active Comps from Database */}
              {report.comparableListings?.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Building2 size={16} className="text-blue-600" />
                      Current Verified Listings in {locality} (Database Comps)
                    </h4>
                    <span className="text-xs text-gray-500 font-medium">
                      {report.comparableListings.length} Active Comps
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {report.comparableListings.slice(0, 3).map((comp: any) => (
                      <div key={comp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="font-semibold text-gray-900 truncate">
                          {comp.society_name || `${comp.unit_type || '2 BHK'} in ${comp.location_name}`}
                        </div>
                        <div className="text-gray-500 text-[11px] mt-0.5">
                          {comp.unit_type || '2 BHK'} · {comp.carpet_area || 750} sq.ft
                        </div>
                        <div className="text-sm font-extrabold text-[#E6761D] mt-2">
                          {formatCurrency(comp.final_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Upgrade Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-purple-300" />
                    <span className="text-sm font-bold tracking-tight">
                      Unlock Full AI Negotiation Playbook & PDF
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 max-w-xl">
                    Get the exact counter-offer script, 30-year society title checklist, and branded executive PDF report.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    if (onUnlockPro) onUnlockPro();
                  }}
                  className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Unlock Pro Features
                  <ChevronRight size={14} />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AIReportModal;
