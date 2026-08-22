// frontend/src/components/reports/CommunicationReportTab.tsx
import React from "react";
import { MessageSquare } from "lucide-react";

interface CommunicationReportTabProps {
  summary?: { total_messages: number; inbound_count: number; outbound_count: number; unread_count: number } | null;
  loading?: boolean;
}

export const CommunicationReportTab: React.FC<CommunicationReportTabProps> = ({
  summary,
  loading = false,
}) => {
  const safeSummary = summary || { total_messages: 0, inbound_count: 0, outbound_count: 0, unread_count: 0 };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-4">
      <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full">
        <MessageSquare className="w-8 h-8" />
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900">WhatsApp CRM Integration Active</h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
          Real-time WhatsApp webhook synchronization is active. All inbound ({safeSummary.inbound_count || 0}) and outbound ({safeSummary.outbound_count || 0}) messages are tracked and presented in top stats.
        </p>
      </div>
    </div>
  );
};
