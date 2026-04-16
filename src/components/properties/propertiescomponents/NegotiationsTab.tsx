import React from 'react';
import { Target, Users, Clock, IndianRupee, TrendingUp, MessageCircle } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface NegotiationsTabProps {
  property: any;
  onStartNegotiation: () => void;
}

const NegotiationsTab: React.FC<NegotiationsTabProps> = ({
  property,
  onStartNegotiation
}) => {
  const formatINRShort = (amount: number | string) => {
    const num = Number(amount);
    if (!num && num !== 0) return '-';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#10b98110', text: '#10b981', label: 'Active', icon: TrendingUp };
      case 'pending':
        return { bg: '#f59e0b10', text: '#f59e0b', label: 'Pending', icon: Clock };
      case 'closed':
        return { bg: '#64748b10', text: '#64748b', label: 'Closed', icon: Target };
      default:
        return { bg: `${N}10`, text: N, label: status, icon: Target };
    }
  };

  const negotiations = property?.negotiations || [];

  return (
    <div className="space-y-3">
      {/* Active Negotiations Card */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
       <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-end sm:items-center gap-2">
    
    <div className="flex items-center gap-1.5 w-full sm:w-auto">
      <Target size={14} style={{ color: O }} />
      <h3 className="text-[11px] font-semibold" style={{ color: N }}>
        Active Negotiations
      </h3>
    </div>

    <button
      onClick={onStartNegotiation}
      className="px-2 py-2 rounded-md text-[13px] text-white transition-all hover:opacity-90 self-end sm:self-auto"
      style={{ background: O }}
    >
      Start New Negotiation
    </button>

  </div>
</div>

        <div className="p-3">
          {negotiations.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {negotiations.map((negotiation: any, index: number) => {
                const statusConfig = getStatusConfig(negotiation.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={index} className="p-2.5 rounded-lg border" style={{ background: BG, borderColor: BD }}>
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${O}15` }}>
                          <Users size={12} style={{ color: O }} />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold" style={{ color: N }}>{negotiation.buyerName}</div>
                          <div className="text-[8px]" style={{ color: MU }}>Buyer</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium w-fit" style={{ background: statusConfig.bg, color: statusConfig.text }}>
                        <StatusIcon size={8} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Price Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-1.5 border-t" style={{ borderColor: BD }}>
                      <div>
                        <div className="flex items-center gap-0.5">
                          <IndianRupee size={8} style={{ color: MU }} />
                          <span className="text-[8px]" style={{ color: MU }}>Offered</span>
                        </div>
                        <div className="text-[11px] font-semibold mt-0.5" style={{ color: O }}>
                          {formatINRShort(negotiation.offeredPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-0.5">
                          <IndianRupee size={8} style={{ color: MU }} />
                          <span className="text-[8px]" style={{ color: MU }}>Counter</span>
                        </div>
                        <div className="text-[11px] font-semibold mt-0.5" style={{ color: N }}>
                          {formatINRShort(negotiation.counterPrice)}
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-0.5">
                          <Clock size={8} style={{ color: MU }} />
                          <span className="text-[8px]" style={{ color: MU }}>Last Update</span>
                        </div>
                        <div className="text-[10px] font-medium mt-0.5" style={{ color: N }}>
                          {negotiation.lastUpdate}
                        </div>
                      </div>
                    </div>

                    {/* Message/Notes if any */}
                    {negotiation.notes && (
                      <div className="mt-2 pt-1.5 border-t flex items-start gap-1.5" style={{ borderColor: BD }}>
                        <MessageCircle size={10} style={{ color: O }} />
                        <p className="text-[9px] flex-1" style={{ color: MU }}>{negotiation.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
              <Target size={24} style={{ color: MU }} className="mx-auto mb-1.5" />
              <p className="text-[12px]" style={{ color: MU }}>No active negotiations</p>
              <p className="text-[10px] mt-0.5" style={{ color: MU }}>Start a new negotiation to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NegotiationsTab;