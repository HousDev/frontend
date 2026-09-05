import React from 'react';
import {
  BarChart3, Phone, Edit, LogOut, CheckCircle2,
  Building2, User
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

interface OwnerHeaderProps {
  owner: any;
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  onOpenEditModal: () => void;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  owner,
  onOpenMobileSidebar,
  onLogout,
  onOpenEditModal,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
          title="Open Menu"
        >
          <BarChart3 size={16} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-sm sm:text-base">Owner Portal Account</h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <CheckCircle2 size={10} />
              <span>{owner?.status || 'Active Owner'}</span>
            </span>
          </div>
          <p className="text-[10px] text-gray-500 hidden sm:block">
            Track rental properties, prospective inquiries, site visits, and monthly cash flow.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        {owner?.phone && (
          <>
            <a
              href={`tel:${owner.phone}`}
              className="p-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              title="Call Owner"
            >
              <Phone size={13} />
            </a>
            <a
              href={`https://wa.me/${String(owner.whatsapp || owner.phone).replace(/\D/g, '')}?text=Hi ${owner.name}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] shadow-2xs transition-colors"
              title="WhatsApp"
            >
              <SiWhatsapp size={12} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </>
        )}

        <button
          onClick={onOpenEditModal}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-slate-700 font-bold text-[10px] shadow-2xs cursor-pointer"
        >
          <Edit size={12} />
          <span className="hidden sm:inline">Edit Profile</span>
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] shadow-2xs transition-colors cursor-pointer"
          title="Log Out"
        >
          <LogOut size={12} />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};

export default OwnerHeader;
