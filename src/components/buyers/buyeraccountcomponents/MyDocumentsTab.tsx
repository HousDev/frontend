import React from 'react';
import { Upload } from 'lucide-react';

interface MyDocumentsTabProps {
  buyer: any;
}

const MyDocumentsTab: React.FC<MyDocumentsTabProps> = ({ buyer }) => {
  const documentCategories = [
    { id: 'financial', label: 'Financial Documents', count: 4, color: 'green' },
    { id: 'identity', label: 'Identity Proofs', count: 2, color: 'blue' },
    { id: 'property', label: 'Property Documents', count: 3, color: 'purple' },
    { id: 'loan', label: 'Loan Documents', count: 2, color: 'orange' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">My Documents</h3>
        <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs">
          <Upload size={14} />
          <span>Upload</span>
        </button>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {documentCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 text-xs">{category.label}</h4>
                <p className="text-xs text-gray-600">{category.count} docs</p>
              </div>
              <div className={`w-3 h-3 bg-${category.color}-500 rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Upload Guidelines */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-3 text-xs">Document Upload Guidelines</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <h5 className="font-medium text-blue-800 mb-1">Required for Loan Application:</h5>
            <ul className="space-y-0.5 text-blue-700">
              <li>• Last 3 months salary slips</li>
              <li>• Bank statements (6 months)</li>
              <li>• ITR for last 2 years</li>
              <li>• PAN and Aadhar cards</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-1">Property Documents:</h5>
            <ul className="space-y-0.5 text-blue-700">
              <li>• Property agreement copy</li>
              <li>• Builder NOC</li>
              <li>• Approved building plans</li>
              <li>• Property tax receipts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDocumentsTab;