// frontend/src/components/reports/AutomationReportTab.tsx
import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Cpu, CheckCircle2, Clock } from "lucide-react";

interface AutomationReportTabProps {
  automations: any[];
  loading?: boolean;
}

export const AutomationReportTab: React.FC<AutomationReportTabProps> = ({
  automations = [],
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" /> Automated Cron Jobs & Background Workers Status
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3">Automation Worker</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Frequency / Execution Schedule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {automations.map((a, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {a.name}
                </td>
                <td className="p-3 text-gray-700">{a.type}</td>
                <td className="p-3">
                  <Badge variant="default" className="text-[10px] bg-emerald-600 text-white">
                    {a.status}
                  </Badge>
                </td>
                <td className="p-3 text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" /> {a.frequency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
