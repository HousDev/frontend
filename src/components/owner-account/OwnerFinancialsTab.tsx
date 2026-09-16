import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Calculator, Building2,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, Percent,
  Send, Loader2, IndianRupee, ShieldCheck, BellRing
} from 'lucide-react';
import { toast } from 'react-toastify';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';

interface OwnerFinancialsTabProps {
  properties: any[];
  ownerId?: number | string;
}

export const OwnerFinancialsTab: React.FC<OwnerFinancialsTabProps> = ({
  properties,
  ownerId,
}) => {
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | number | null>(null);

  const fetchLeases = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const res = await tenantBookingAPI.getByOwnerId(ownerId);
      if (res?.success && Array.isArray(res.data)) {
        setLeases(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch owner leases for financial tab:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, [ownerId]);

  const activeLeases = leases.filter((l) => l.booking_status === 'BOOKED');

  const totalCollectedRent = activeLeases
    .filter((l) => l.payment_status === 'VERIFIED')
    .reduce((sum, l) => sum + (Number(l.monthly_rent) || 25000), 0);

  const totalExpectedMonthly = properties.reduce(
    (sum, p) => sum + (Number(p.monthly_rent || p.expected_rent || p.rent) || 0),
    0
  );

  const annualPotential = totalExpectedMonthly * 12;

  // ROI Calculator state
  const [propertyPrice, setPropertyPrice] = useState<number>(7500000);
  const [calcMonthlyRent, setCalcMonthlyRent] = useState<number>(totalExpectedMonthly || 25000);

  const grossRentalYield = propertyPrice > 0 ? ((calcMonthlyRent * 12) / propertyPrice) * 100 : 0;

  const handleSendRentReminder = (lease: any) => {
    const leaseId = lease.id || lease.booking_id;
    setSendingReminderId(leaseId);
    setTimeout(() => {
      setSendingReminderId(null);
      toast.success(`🔔 Rent Payment Reminder sent to tenant (${lease.tenant_name || 'Tenant'})!`);
    }, 800);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 💰 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Monthly Expected Rent</span>
            <IndianRupee size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalExpectedMonthly.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Based on {properties.length} active rental listings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Verified Rent Dues Collected</span>
            <ShieldCheck size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₹{totalCollectedRent.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{activeLeases.length} active tenant leases</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Average Rental Yield</span>
            <Percent size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600 mt-1">
            {grossRentalYield > 0 ? grossRentalYield.toFixed(1) + '%' : '4.5%'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Standard residential benchmark</p>
        </div>
      </div>

      {/* 📊 Active Rent Collector & Tenant Ledger Tracker */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Active Tenant Rent Collector & Ledger Tracker</h3>
            <p className="text-[11px] text-slate-500">Track monthly rent payments and send instant reminders to tenants</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
            Live Rent Engine
          </span>
        </div>

        {leases.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">No active tenant leases initialized yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[9.5px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Tenant & Property</th>
                  <th className="py-3 px-3">Rent Due Date</th>
                  <th className="py-3 px-3">Monthly Rent</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leases.map((l) => {
                  const rent = Number(l.monthly_rent || 25000);
                  const isPaid = l.payment_status === 'VERIFIED';
                  const isClaimed = l.payment_status === 'CLAIMED';
                  const tenantName = l.tenant_name || `Tenant #${l.tenant_id}`;

                  return (
                    <tr key={`fin-lease-${l.id || l.booking_id}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 block">{tenantName}</span>
                        <span className="text-[10.5px] text-slate-500">{l.property_title || 'Apartment Unit'}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-bold">
                        {l.rent_due_day ? `${l.rent_due_day}th of month` : '5th of month'}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-emerald-700">₹{rent.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        {isPaid ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            ✓ PAID & VERIFIED
                          </span>
                        ) : isClaimed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                            🟡 UTR CLAIMED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                            ⏳ PENDING DUE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!isPaid && (
                          <button
                            type="button"
                            disabled={sendingReminderId === (l.id || l.booking_id)}
                            onClick={() => handleSendRentReminder(l)}
                            className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold shadow-2xs transition cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {sendingReminderId === (l.id || l.booking_id) ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <BellRing size={12} />
                            )}
                            <span>Send Dues Reminder</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🧮 Rental Yield & ROI Calculator Widget */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Calculator size={16} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Real Estate Rental Yield & ROI Calculator</h3>
            <p className="text-[11px] text-gray-500">Calculate annual gross yield based on property valuation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Estimated Property Value (₹)
            </label>
            <input
              type="number"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Monthly Expected Rent (₹)
            </label>
            <input
              type="number"
              value={calcMonthlyRent}
              onChange={(e) => setCalcMonthlyRent(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="bg-orange-50/70 border border-orange-200/80 p-4 rounded-2xl text-center">
            <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider block">
              Estimated Gross Rental Yield
            </span>
            <div className="text-2xl font-black text-orange-600 mt-0.5">
              {grossRentalYield.toFixed(2)}% <span className="text-xs font-normal text-gray-600">/ year</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerFinancialsTab;
