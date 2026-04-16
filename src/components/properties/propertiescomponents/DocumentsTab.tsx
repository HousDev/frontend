// import React from 'react';
// import { FileText } from 'lucide-react';

// interface DocumentsTabProps {
//   property: any;
//   onCreateDocument: () => void;
// }

// const DocumentsTab: React.FC<DocumentsTabProps> = ({
//   property,
//   onCreateDocument
// }) => {
//   const documentCategories = [
//     { id: 'ownership', label: 'Ownership Documents', count: 3, color: 'blue' },
//     { id: 'legal', label: 'Legal Documents', count: 2, color: 'green' },
//     { id: 'financial', label: 'Financial Documents', count: 1, color: 'purple' },
//     { id: 'marketing', label: 'Marketing Materials', count: 4, color: 'orange' }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Document Categories */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {documentCategories.map((category) => (
//           <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">{category.label}</p>
//                 <p className="text-lg font-bold text-gray-900">{category.count}</p>
//               </div>
//               <FileText className={`text-${category.color}-600`} size={20} />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Create Document Actions */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Documents</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <button
//             onClick={onCreateDocument}
//             className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
//           >
//             <FileText className="text-blue-600" size={20} />
//             <div className="text-left">
//               <div className="font-medium text-blue-900">Mandate Agreement</div>
//               <div className="text-sm text-blue-700">Exclusive selling rights</div>
//             </div>
//           </button>
//           <button
//             onClick={onCreateDocument}
//             className="flex items-center space-x-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
//           >
//             <FileText className="text-green-600" size={20} />
//             <div className="text-left">
//               <div className="font-medium text-green-900">Authorization Letter</div>
//               <div className="text-sm text-green-700">Selling authorization</div>
//             </div>
//           </button>
//           <button
//             onClick={onCreateDocument}
//             className="flex items-center space-x-3 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
//           >
//             <FileText className="text-purple-600" size={20} />
//             <div className="text-left">
//               <div className="font-medium text-purple-900">Marketing Rights</div>
//               <div className="text-sm text-purple-700">Marketing authorization</div>
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentsTab;

import React from 'react';
import { FileText, Shield, Scale, DollarSign, Megaphone, FileCheck, PenTool, Share2 } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface DocumentsTabProps {
  property: any;
  onCreateDocument: () => void;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  property,
  onCreateDocument
}) => {
  const documentCategories = [
    { id: 'ownership', label: 'Ownership Documents', count: 3, color: '#3b82f6', icon: Shield },
    { id: 'legal', label: 'Legal Documents', count: 2, color: '#10b981', icon: Scale },
    { id: 'financial', label: 'Financial Documents', count: 1, color: '#8b5cf6', icon: DollarSign },
    { id: 'marketing', label: 'Marketing Materials', count: 4, color: O, icon: Megaphone }
  ];

  const documentTemplates = [
    { id: 'mandate', label: 'Mandate Agreement', description: 'Exclusive selling rights', color: '#3b82f6', icon: FileCheck },
    { id: 'authorization', label: 'Authorization Letter', description: 'Selling authorization', color: '#10b981', icon: PenTool },
    { id: 'marketing', label: 'Marketing Rights', description: 'Marketing authorization', color: O, icon: Share2 }
  ];

  return (
    <div className="space-y-3">
      {/* Document Categories */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
  {documentCategories.map((category) => {
    const Icon = category.icon;
    return (
      <div
        key={category.id}
        className="bg-white rounded-md sm:rounded-lg border p-2 sm:p-2.5 transition-all hover:shadow-sm"
        style={{ borderColor: BD }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[8px] sm:text-[9px] uppercase tracking-wider"
              style={{ color: MU }}
            >
              {category.label}
            </p>
            <p
              className="text-sm sm:text-base font-bold mt-0.5"
              style={{ color: N }}
            >
              {category.count}
            </p>
          </div>

          <div
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center"
            style={{ background: `${category.color}15` }}
          >
            <Icon size={12} className="sm:w-[14px] sm:h-[14px]" style={{ color: category.color }} />
          </div>
        </div>
      </div>
    );
  })}
</div>

      {/* Create Document Actions */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <h3 className="text-[11px] font-semibold" style={{ color: N }}>Create Documents</h3>
          <p className="text-[9px] mt-0.5" style={{ color: MU }}>Generate legal documents for this property</p>
        </div>
        
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {documentTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={onCreateDocument}
                  className="flex items-center gap-2.5 p-3.5 rounded-lg transition-all hover:shadow-md group"
                  style={{ border: `1px solid ${BD}`, background: BG }}
                >
                  <div className="p-1.5 rounded-lg transition-colors" style={{ background: `${template.color}15` }}>
                    <Icon size={22} style={{ color: template.color }} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-[11px] font-semibold truncate" style={{ color: N }}>{template.label}</div>
                    <div className="text-[9px] truncate" style={{ color: MU }}>{template.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty State - No documents message (optional) */}
      <div className="bg-white rounded-lg border p-4 text-center" style={{ borderColor: BD, background: BG }}>
        <FileText size={24} style={{ color: MU }} className="mx-auto mb-2" />
        <p className="text-[10px]" style={{ color: MU }}>No documents uploaded yet</p>
        <p className="text-[9px] mt-0.5" style={{ color: MU }}>Documents will appear here once created</p>
      </div>
    </div>
  );
};

export default DocumentsTab;