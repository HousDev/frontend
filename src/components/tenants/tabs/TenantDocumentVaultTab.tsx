import React, { useState } from 'react';
import { FileText, ClipboardCheck, Camera, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { Tenant, InspectionItem } from './types';

interface TenantDocumentVaultTabProps {
  tenant: Tenant;
}

export default function TenantDocumentVaultTab({ tenant }: TenantDocumentVaultTabProps) {
  const documents = [
    { title: 'Aadhaar / Passport ID Proof', status: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { title: 'PAN Card Copy', status: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { title: 'Salary Slip / Employment Proof', status: 'Uploaded', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { title: 'Police Verification Form', status: 'Pending Verification', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { title: 'Registered Rent Agreement', status: tenant.rental_property_id ? 'Executed' : 'Pending Link', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: '1', room: 'Living Room', item: 'Wall Paint & Lights', condition: 'Good', hasPhoto: true },
    { id: '2', room: 'Kitchen', item: 'Modular Cabinets & Sink', condition: 'Good', hasPhoto: true },
    { id: '3', room: 'Master Bedroom', item: 'Wooden Flooring & Wardrobe', condition: 'Minor Wear', notes: 'Minor scratch on left panel', hasPhoto: true },
    { id: '4', room: 'Bathroom', item: 'Geyser & Fittings', condition: 'Good', hasPhoto: false },
  ]);

  const handleToggleCondition = (id: string) => {
    setInspectionItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCond = item.condition === 'Good' ? 'Minor Wear' : item.condition === 'Minor Wear' ? 'Needs Repair' : 'Good';
          return { ...item, condition: nextCond };
        }
        return item;
      })
    );
  };

  const handleSignInspection = () => {
    toast.success('Digital Move-in Inspection signed & archived with owner vault!');
  };

  return (
    <div className="space-y-4">
      {/* Official Vault Checklist */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <h2 className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5">Lease & Document Vault</h2>
        <p className="text-[10px] text-gray-500 mb-4">Checklist of tenant verification and rent agreement documents</p>

        <div className="space-y-2">
          {documents.map((doc, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-gray-200 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <FileText size={15} className="text-gray-400" />
                <span className="font-bold text-xs text-slate-800">{doc.title}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${doc.color}`}>
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Move-in / Move-out Inspection Checklist */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[9px] border border-blue-200 uppercase">
              <ShieldCheck size={11} /> Security Deposit Protection
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1">
              Digital Move-in Condition Inspection
            </h3>
            <p className="text-[10px] text-gray-500">
              Verify pre-existing property wear and tear at move-in to safeguard your security deposit.
            </p>
          </div>

          <button
            onClick={handleSignInspection}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-colors shrink-0 flex items-center gap-1"
          >
            <ClipboardCheck size={13} />
            <span>Sign & Archive Report</span>
          </button>
        </div>

        <div className="space-y-2">
          {inspectionItems.map((item) => (
            <div key={item.id} className="p-3 rounded-lg border border-gray-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase text-gray-400">{item.room}</span>
                <h4 className="font-bold text-slate-900">{item.item}</h4>
                {item.notes && <p className="text-[10px] text-gray-500 mt-0.5">{item.notes}</p>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleCondition(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-colors ${
                    item.condition === 'Good'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.condition === 'Minor Wear'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  Status: {item.condition}
                </button>

                <button
                  onClick={() => toast.info(`Photo attachment logged for ${item.item}`)}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white text-slate-600 hover:bg-gray-50 text-[10px]"
                  title="Upload Photo"
                >
                  <Camera size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
