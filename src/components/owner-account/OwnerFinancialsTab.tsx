import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, Calculator, Building2,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, Percent
} from 'lucide-react';

interface OwnerFinancialsTabProps {
  properties: any[];
}

export const OwnerFinancialsTab: React.FC<OwnerFinancialsTabProps> = ({
  properties,
}) => {
  const totalRentPotential = properties.reduce(
    (sum, p) => sum + (Number(p.monthly_rent || p.expected_rent || p.rent) || 0),
    0
  );

  const annualPotential = totalRentPotential * 12;

  // ROI Calculator state
  const [propertyPrice, setPropertyPrice] = useState<number>(7500000);
  const [calcMonthlyRent, setCalcMonthlyRent] = useState<number>(totalRentPotential || 25000);

  const grossRentalYield = propertyPrice > 0 ? ((calcMonthlyRent * 12) / propertyPrice) * 100 : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 💰 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Monthly Expected Rent</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalRentPotential.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Based on {properties.length} active rental assets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Annual Potential Yield</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            ₹{annualPotential.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Projected 12-month gross returns</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Average Rental Yield</span>
            <Percent size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600 mt-1">
            4.2% - 5.1%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Standard residential benchmark</p>
        </div>
      </div>

      {/* 📊 Property-wise Breakdown Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
        <h3 className="font-bold text-sm text-slate-900 mb-3">Property-wise Rent Structure</h3>
        {properties.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No linked properties to calculate financial breakdown.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">BHK / Type</th>
                  <th className="py-2.5 px-3">Monthly Rent</th>
                  <th className="py-2.5 px-3">Security Deposit</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {properties.map((p) => {
                  const rent = Number(p.monthly_rent || p.expected_rent || p.rent) || 0;
                  const dep = Number(p.security_deposit || p.deposit) || rent * 2;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {p.society_name || p.title || 'Apartment'}
                      </td>
                      <td className="py-3 px-3 text-gray-600">{p.unit_type || 'Residential'}</td>
                      <td className="py-3 px-3 font-bold text-orange-600">₹{rent.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-slate-800">₹{dep.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          ● Active
                        </span>
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
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Calculator size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Real Estate Rental Yield Calculator</h3>
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
