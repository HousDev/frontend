import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentsTabProps {
  property: any;
  onCreateDocument: () => void;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  property,
  onCreateDocument
}) => {
  const documentCategories = [
    { id: 'ownership', label: 'Ownership Documents', count: 3, color: 'blue' },
    { id: 'legal', label: 'Legal Documents', count: 2, color: 'green' },
    { id: 'financial', label: 'Financial Documents', count: 1, color: 'purple' },
    { id: 'marketing', label: 'Marketing Materials', count: 4, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {documentCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{category.label}</p>
                <p className="text-lg font-bold text-gray-900">{category.count}</p>
              </div>
              <FileText className={`text-${category.color}-600`} size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Create Document Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onCreateDocument}
            className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="text-blue-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-blue-900">Mandate Agreement</div>
              <div className="text-sm text-blue-700">Exclusive selling rights</div>
            </div>
          </button>
          <button
            onClick={onCreateDocument}
            className="flex items-center space-x-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <FileText className="text-green-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-green-900">Authorization Letter</div>
              <div className="text-sm text-green-700">Selling authorization</div>
            </div>
          </button>
          <button
            onClick={onCreateDocument}
            className="flex items-center space-x-3 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <FileText className="text-purple-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-purple-900">Marketing Rights</div>
              <div className="text-sm text-purple-700">Marketing authorization</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;