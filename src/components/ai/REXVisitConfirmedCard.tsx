import React from 'react';
import { Calendar, Clock, CheckCircle2, MessageSquare, MapPin, Building2 } from 'lucide-react';
import { RexVisitData } from '@/services/rexApi';
import { getImageUrl } from '@/lib/helpers';

interface REXVisitConfirmedCardProps {
  visitData: RexVisitData;
  onOpenChatDesk?: (propertyId: number | string) => void;
  onBrowseMore?: () => void;
}

export const REXVisitConfirmedCard: React.FC<REXVisitConfirmedCardProps> = ({
  visitData,
  onOpenChatDesk,
  onBrowseMore
}) => {
  const formatPrice = (val?: number | string) => {
    if (!val) return 'Price on Request';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return String(val);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const rawPhoto = visitData.property_photos?.[0] || null;
  const photoUrl = rawPhoto ? getImageUrl(rawPhoto) : null;

  return (
    <div className="my-3 w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-xs p-4 space-y-3 text-slate-800">
      {/* Header Badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xs shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Visit Scheduled
          </div>
          <div className="text-[11px] text-slate-500">
            Booking ID: #{visitData.id}
          </div>
        </div>
      </div>

      {/* Date & Time Highlight */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between text-xs font-medium text-slate-700">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDate(visitData.visit_date)}</span>
        </div>
        <div className="h-3.5 w-[1px] bg-slate-300" />
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-900">{visitData.visit_time}</span>
        </div>
      </div>

      {/* Property Snippet */}
      {visitData.property_title && (
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs flex gap-3 items-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={visitData.property_title}
              className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-100"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 truncate" title={visitData.property_title}>
              {visitData.property_title}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
              <span className="truncate">{visitData.property_address || 'Verified Location'}</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">
              {formatPrice(visitData.property_price)}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Executive Note */}
      <div className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-200 leading-relaxed">
        {visitData.executive_name ? (
          <span>
            Executive <strong className="text-slate-900">{visitData.executive_name}</strong> has been assigned to host your visit.
          </span>
        ) : (
          <span>Our verified field executive will meet you at the property.</span>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-1.5 pt-1">
        {onOpenChatDesk && visitData.property_id && (
          <button
            onClick={() => onOpenChatDesk(visitData.property_id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat with Executive</span>
          </button>
        )}

        {onBrowseMore && (
          <button
            onClick={onBrowseMore}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition-colors text-center cursor-pointer"
          >
            Explore More Properties
          </button>
        )}
      </div>
    </div>
  );
};
export default REXVisitConfirmedCard;
