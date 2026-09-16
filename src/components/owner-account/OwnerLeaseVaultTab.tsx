import React, { useState, useEffect } from 'react';
import {
  FileText, Shield, Download, Eye, Upload, CheckCircle2,
  ExternalLink, Loader2, FolderCheck, BadgeCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';

interface OwnerLeaseVaultTabProps {
  properties: any[];
  ownerName?: string;
  ownerId?: number | string;
}

export const OwnerLeaseVaultTab: React.FC<OwnerLeaseVaultTabProps> = ({
  properties,
  ownerName = 'Owner',
  ownerId,
}) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchOwnerVaultDocs = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const res = await tenantBookingAPI.getByOwnerId(ownerId);
      if (res?.success && Array.isArray(res.data)) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn('Could not load owner vault bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerVaultDocs();
  }, [ownerId]);

  // Extract all documents (Agreements & KYC)
  const realDocuments: any[] = [];

  bookings.forEach((b) => {
    const tenantName = b.tenant_name || `Tenant #${b.tenant_id}`;
    const propTitle = b.property_title || b.society_name ? `${b.unit_type || '2 BHK'} at ${b.society_name}` : `Property #${b.property_id}`;

    if (b.agreement_document) {
      realDocuments.push({
        id: `agreement-${b.id || b.booking_id}`,
        title: `Signed Rental Agreement — ${tenantName}`,
        type: 'Lease Agreement',
        property: propTitle,
        date: b.agreement_signed_at ? new Date(b.agreement_signed_at).toLocaleDateString('en-IN') : 'Active Lease',
        status: b.booking_status === 'BOOKED' ? 'Active Lease' : 'Signed',
        url: b.agreement_document,
        icon: 'pdf',
      });
    }

    if (b.id_proof_document) {
      realDocuments.push({
        id: `kyc-${b.id || b.booking_id}`,
        title: `Verified Tenant KYC Document (${b.id_proof_type || 'Aadhaar/PAN'}) — ${tenantName}`,
        type: 'Tenant KYC',
        property: propTitle,
        date: 'Verified Record',
        status: 'Approved KYC',
        url: b.id_proof_document,
        icon: 'kyc',
      });
    }
  });

  // Default templates if no active tenancies yet
  const defaultTemplates = [
    {
      id: 'tpl-1',
      title: 'Standard Registered Rent Agreement Format (Maharashtra 11-Month)',
      type: 'Legal Template',
      property: properties[0]?.society_name || 'All Properties',
      date: 'Standard Form',
      status: 'Ready Template',
      url: '/agreements/sample_rental_agreement.pdf',
      icon: 'pdf',
    },
    {
      id: 'tpl-2',
      title: 'Tenant Police Verification Form & Identity Format',
      type: 'Verification Template',
      property: properties[0]?.society_name || 'All Properties',
      date: 'Standard Form',
      status: 'Ready Template',
      url: '/agreements/sample_rental_agreement.pdf',
      icon: 'kyc',
    },
  ];

  const displayDocs = realDocuments.length > 0 ? realDocuments : defaultTemplates;

  const handleDownload = (doc: any) => {
    toast.info(`Opening document: ${doc.title}`);
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b3856] via-[#10344d] to-[#184d6e] p-5 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center font-bold">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Lease & Document Vault</h3>
            <p className="text-xs text-slate-300">Secure digital repository for signed rental agreements, tenant KYC records, and legal contracts.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-amber-300 font-bold text-xs border border-white/15">
            {realDocuments.length} Verified Vault Records
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
          <Loader2 size={18} className="animate-spin text-orange-500" />
          <span className="text-xs font-semibold">Loading document vault records...</span>
        </div>
      )}

      {/* Documents Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${doc.type.includes('KYC') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {doc.type.includes('KYC') ? <BadgeCheck size={18} /> : <FileText size={18} />}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase">
                    {doc.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {doc.property}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-semibold">{doc.date}</span>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-3 py-1.5 rounded-xl bg-[#0b3856] hover:bg-[#072438] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <ExternalLink size={12} />
                  <span>View / Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerLeaseVaultTab;
