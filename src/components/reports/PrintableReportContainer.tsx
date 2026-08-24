// frontend/src/components/reports/PrintableReportContainer.tsx
import React from "react";
import { Building } from "lucide-react";

interface PrintableReportContainerProps {
  reportTitle: string;
  stats?: { label: string; value: any }[];
  columns: { key: string; header: string; render?: (row: any) => React.ReactNode }[];
  data: any[];
}

export const PrintableReportContainer: React.FC<PrintableReportContainerProps> = ({
  reportTitle,
  stats = [],
  columns = [],
  data = [],
}) => {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const currentTimestamp = new Date().toLocaleString("en-IN");

  return (
    <div id="printable-report-container" className="hidden print:block p-8 text-gray-900 bg-white font-sans relative min-h-screen">
      {/* Faint Background Watermark Text Matching Screenshot 1 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] text-8xl font-black text-navy-900 rotate-[-25deg]">
        Resale Expert
      </div>

      {/* Header Block Matching Screenshot 1 */}
      <div className="flex items-center justify-between border-b-2 border-[#0f1f38] pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Building className="w-8 h-8 text-navy-900" />
          <div>
            <div className="text-2xl font-black tracking-tight text-[#0f1f38]">Resale Expert</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{reportTitle}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-gray-400 uppercase">REPORT DATE</div>
          <div className="text-sm font-black text-gray-900">{currentDate}</div>
        </div>
      </div>

      {/* Metadata Subheader */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4 text-xs font-semibold text-gray-600">
        <div>Property: <span className="font-bold text-gray-900">All Properties</span></div>
        <div>Period: <span className="font-bold text-gray-900">All Time</span></div>
        <div>Generated: <span className="font-bold text-gray-900">{currentTimestamp}</span></div>
      </div>

      {/* Top 4 Stat Box Chips Matching Screenshot 1 */}
      {stats.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.slice(0, 4).map((st, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border border-gray-300 bg-gray-50 flex flex-col justify-between`}
            >
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{st.label}</div>
              <div className="text-xl font-extrabold text-gray-900 mt-1">{st.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Full-Width Bordered Records Table Matching Screenshot 1 */}
      <table className="w-full text-left text-xs border-collapse border border-gray-300 mb-6">
        <thead className="bg-gray-100 text-gray-800 font-bold text-[11px] uppercase tracking-wider">
          <tr>
            <th className="p-2 border border-gray-300 w-10 text-center">#</th>
            {columns.map((col) => (
              <th key={col.key} className="p-2 border border-gray-300">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="p-8 text-center text-gray-400">
                No records recorded.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-2 text-center font-bold text-gray-500 border border-gray-300">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="p-2 text-gray-800 border border-gray-300">
                    {col.render ? col.render(row) : row[col.key] || "N/A"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Footer Block Matching Screenshot 1 */}
      <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-xs text-gray-500 font-medium">
        <div>Resale Expert Real Estate BI System</div>
        <div>{data.length} record(s)</div>
      </div>
    </div>
  );
};
