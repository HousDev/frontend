// frontend/src/components/reports/LeadSourceReportTab.tsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Globe, Award } from "lucide-react";

interface LeadSourceReportTabProps {
  sources: any[];
  loading?: boolean;
}

export const LeadSourceReportTab: React.FC<LeadSourceReportTabProps> = ({ sources = [], loading = false }) => {
  return (
    <div className="space-y-6">
      {/* Source Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-orange-500" /> Lead Source Channel Performance & Conversion
        </h3>
        <div className="h-64 w-full">
          {sources.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              No lead source statistics found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#ffffff", fontWeight: 600 }}
                  labelStyle={{ color: "#94a3b8", fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="totalLeads" name="Total Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qualified" name="Qualified" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" name="Closed Deals" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Source Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3">Source Channel</th>
              <th className="p-3">Total Leads</th>
              <th className="p-3">Contacted</th>
              <th className="p-3">Qualified</th>
              <th className="p-3">Closed Deals</th>
              <th className="p-3">Conversion Rate (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sources.map((s, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="p-3 font-semibold text-gray-900">{s.source}</td>
                <td className="p-3 text-gray-700 font-medium">{s.totalLeads}</td>
                <td className="p-3 text-gray-600">{s.contacted}</td>
                <td className="p-3 text-gray-600">{s.qualified}</td>
                <td className="p-3 font-bold text-emerald-600">{s.closed}</td>
                <td className="p-3 font-semibold text-blue-600">{s.conversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
