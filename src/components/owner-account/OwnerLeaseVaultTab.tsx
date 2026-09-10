import React, { useState } from 'react';
import {
  FileText, Shield, Download, Eye, Plus, CheckCircle2,
  AlertCircle, Clock, Upload, Lock, FileCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

interface OwnerLeaseVaultTabProps {
  properties: any[];
  ownerName?: string;
}

export const OwnerLeaseVaultTab: React.FC<OwnerLeaseVaultTabProps> = ({
  properties,
  ownerName = 'Owner',
}) => {
  const [docFilter, setDocFilter] = useState('all');

  // Sample Documents synthesized from real properties or standard owner vault
  const documents = [
    {
      id: 1,
      title: 'Standard Registered Rent Agreement Template',
      type: 'Agreement',
      property: properties[0]?.society_name || 'All Properties',
      date: 'Aug 2026',
      status: 'Active',
      fileSize: '1.8 MB',
    },
    {
      id: 2,
      title: 'Tenant Police Verification & KYC Format',
      type: 'Verification',
      property: properties[0]?.society_name || 'All Properties',
      date: 'Jul 2026',
      status: 'Verified',
      fileSize: '620 KB',
    },
    {
      id: 3,
      title: 'Society Tenant Move-in NOC Letter Format',
      type: 'Society NOC',
      property: properties[0]?.society_name || 'All Properties',
      date: 'Jun 2026',
      status: 'Ready',
      fileSize: '410 KB',
    },
  ];

  const handleDownload = (title: string) => {
    toast.success(`Preparing download for: ${title}`);
  };

  const handleUploadNew = () => {
    toast.info('Document upload feature: Select file to upload to vault');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 🛡️ Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Lease & Document Vault</h3>
            <p className="text-xs text-gray-500">Secure storage for rent agreements, KYC records, and property certificates</p>
          </div>
        </div>

        <button
          onClick={handleUploadNew}
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start md:self-auto"
        >
          <Upload size={14} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 📄 Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-300 hover:shadow-md transition-all p-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  {doc.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                  {doc.title}
                </h4>
                <p className="text-[11px] text-gray-500 mt-1">
                  {doc.property} • {doc.fileSize}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-medium">Added {doc.date}</span>
              <button
                onClick={() => handleDownload(doc.title)}
                className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-800 text-xs font-bold border border-gray-200 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Download size={12} />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerLeaseVaultTab;
