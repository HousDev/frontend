import React from 'react';
import { FileText, Shield, Scale, DollarSign, Megaphone, FileCheck, PenTool, Share2, Key, Home } from 'lucide-react';

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface RentalDocumentsTabProps {
  property: any;
  onCreateDocument: () => void;
}

const RentalDocumentsTab: React.FC<RentalDocumentsTabProps> = ({
  property,
  onCreateDocument
}) => {
  const documentCategories = [
    { id: 'lease', label: 'Rent Agreement', count: 1, color: '#3b82f6', icon: FileCheck },
    { id: 'ownership', label: 'Property Ownership', count: 2, color: '#10b981', icon: Shield },
    { id: 'deposit', label: 'Security Deposit Receipt', count: 1, color: '#8b5cf6', icon: DollarSign },
    { id: 'marketing', label: 'Rental Marketing Materials', count: 3, color: O, icon: Megaphone }
  ];

  const documentTemplates = [
    { id: 'agreement', label: 'Rental Agreement Draft', description: 'Standard 11-month rent agreement template', color: '#3b82f6', icon: FileCheck },
    { id: 'possession', label: 'Keys & Handover Letter', description: 'Tenant possession & inventory checklist', color: '#10b981', icon: Key },
    { id: 'deposit_receipt', label: 'Deposit Receipt', description: 'Security deposit confirmation voucher', color: O, icon: DollarSign }
  ];

  return (
    <div className="space-y-3">
      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {documentCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="bg-white rounded-lg border p-2.5 transition-all hover:shadow-sm" style={{ borderColor: BD }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: MU }}>{category.label}</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: N }}>{category.count}</p>
                </div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${category.color}15` }}>
                  <Icon size={14} style={{ color: category.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Templates */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b bg-slate-50/50" style={{ borderColor: BD }}>
          <h3 className="text-xs font-bold" style={{ color: N }}>Create Rental Documents</h3>
          <p className="text-[10px] text-gray-500">Generate rental agreements, deposit receipts, and handover letters</p>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {documentTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={onCreateDocument}
                  className="flex items-center gap-2.5 p-3 rounded-lg border transition-all hover:shadow-md text-left"
                  style={{ borderColor: BD, background: BG }}
                >
                  <div className="p-2 rounded-lg" style={{ background: `${template.color}15` }}>
                    <Icon size={20} style={{ color: template.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate" style={{ color: N }}>{template.label}</div>
                    <div className="text-[9px] text-gray-500 truncate">{template.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDocumentsTab;
