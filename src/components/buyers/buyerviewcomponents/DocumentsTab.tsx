import React from 'react';
import { FileText, Plus, Eye, Download, Share } from 'lucide-react';

interface DocumentsTabProps {
  buyer: any;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ buyer }) => {
  const documentCategories = [
    { id: "financial", label: "Financial Documents", count: 3, color: "green" },
    { id: "identity", label: "Identity Documents", count: 2, color: "blue" },
    { id: "property", label: "Property Documents", count: 1, color: "purple" },
    { id: "loan", label: "Loan Documents", count: 2, color: "orange" },
  ];

  const sampleDocuments = [
    { id: 1, name: "Salary Slips (Last 3 months)", category: "financial", status: "verified", date: "2025-01-10", size: "2.3 MB" },
    { id: 2, name: "Bank Statements", category: "financial", status: "pending", date: "2025-01-12", size: "5.1 MB" },
    { id: 3, name: "PAN Card", category: "identity", status: "verified", date: "2025-01-08", size: "0.8 MB" },
    { id: 4, name: "Aadhar Card", category: "identity", status: "verified", date: "2025-01-08", size: "1.2 MB" },
    { id: 5, name: "Property Shortlist", category: "property", status: "updated", date: "2025-01-13", size: "0.5 MB" },
    { id: 6, name: "Loan Pre-approval Letter", category: "loan", status: "received", date: "2025-01-12", size: "1.8 MB" },
  ];

  const getDocumentStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { bg: "bg-green-100", text: "text-green-700", label: "Verified", icon: "✅" },
      pending: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending", icon: "⏳" },
      received: { bg: "bg-blue-100", text: "text-blue-700", label: "Received", icon: "📄" },
      updated: { bg: "bg-purple-100", text: "text-purple-700", label: "Updated", icon: "🔄" },
      rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected", icon: "❌" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Document Management</h3>
        <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={12} />
          <span>Upload</span>
        </button>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {documentCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-xs text-gray-900">{category.label}</h4>
                <p className="text-xs text-gray-600">{category.count} docs</p>
              </div>
              <div className={`w-2.5 h-2.5 bg-${category.color}-500 rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h4 className="font-semibold text-xs text-gray-900">All Documents</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {sampleDocuments.map((doc) => (
            <div key={doc.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-xs text-gray-900">{doc.name}</div>
                    <div className="text-xs text-gray-600">
                      {doc.category} • {doc.size} • {doc.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getDocumentStatusBadge(doc.status)}
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                      <Eye size={12} />
                    </button>
                    <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                      <Download size={12} />
                    </button>
                    <button className="p-1 text-purple-600 hover:bg-purple-100 rounded">
                      <Share size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;