import React from 'react';
import { Share2, Globe, FileText, Camera, Sparkles, Send, CheckCircle, ExternalLink } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";

interface RentalMarketingTabProps {
  property: any;
  onCreateBrochure: () => void;
  onShareProperty: () => void;
  onManageMedia: () => void;
  onPublishProperty: () => void;
}

const RentalMarketingTab: React.FC<RentalMarketingTabProps> = ({
  property,
  onCreateBrochure,
  onShareProperty,
  onManageMedia,
  onPublishProperty,
}) => {
  return (
    <div className="space-y-4">
      {/* Marketing Action Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold" style={{ color: N }}>Rental Marketing & Listing Promotion</h3>
          <p className="text-[11px] text-gray-500">Promote this rental property across portals, WhatsApp, brochures, and media</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShareProperty}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 shadow-sm"
            style={{ background: O }}
          >
            <Share2 size={13} />
            <span>Share Property</span>
          </button>
        </div>
      </div>

      {/* Marketing Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: BD }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 mb-3">
            <FileText size={16} />
          </div>
          <h4 className="text-xs font-bold" style={{ color: N }}>Rental Brochure</h4>
          <p className="text-[10px] text-gray-500 mt-1 mb-3">Generate rental flyer with rent & deposit terms</p>
          <button onClick={onCreateBrochure} className="text-xs font-bold text-orange-600 hover:underline">
            Generate Flyer →
          </button>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: BD }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 mb-3">
            <FaWhatsapp size={16} />
          </div>
          <h4 className="text-xs font-bold" style={{ color: N }}>WhatsApp Broadcaster</h4>
          <p className="text-[10px] text-gray-500 mt-1 mb-3">Share directly with matching tenants</p>
          <button onClick={onShareProperty} className="text-xs font-bold text-emerald-600 hover:underline">
            Send WhatsApp →
          </button>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: BD }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600 mb-3">
            <Camera size={16} />
          </div>
          <h4 className="text-xs font-bold" style={{ color: N }}>Photos & Media</h4>
          <p className="text-[10px] text-gray-500 mt-1 mb-3">Manage flat photos, society images & video tours</p>
          <button onClick={onManageMedia} className="text-xs font-bold text-purple-600 hover:underline">
            Manage Gallery →
          </button>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: BD }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 mb-3">
            <Globe size={16} />
          </div>
          <h4 className="text-xs font-bold" style={{ color: N }}>Public Web Listing</h4>
          <p className="text-[10px] text-gray-500 mt-1 mb-3">Control public listing status on portal</p>
          <button onClick={onPublishProperty} className="text-xs font-bold text-indigo-600 hover:underline">
            Listing Settings →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalMarketingTab;
