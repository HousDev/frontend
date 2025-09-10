import React, { useState } from 'react';
import { FileText, Building, Trash2 } from 'lucide-react';
import DocumentCreation from '../creation/DocumentCreation';
import TemplateCreation from '../creation/TemplateCreation';

const CreationTab = () => {
  const [activeTab, setActiveTab] = useState('documents');

  const tabs = [
    { id: 'documents', label: 'Document Creation', icon: FileText },
    { id: 'templates', label: 'Template Creation', icon: Building },
    { id: 'drafts', label: 'Draft Documents', icon: FileText },
  ];

  return (
    <div className="p-6 pt-0">
      {/* Tab Navigation */}
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'documents' && <DocumentCreation />}
        {activeTab === 'templates' && <TemplateCreation />}
        {activeTab === 'drafts' && <DraftDocuments />}
      </div>
    </div>
  );
};

const DraftDocuments = () => {
  const [drafts, setDrafts] = useState(() => {
    const savedDrafts = localStorage.getItem('documentDrafts');
    return savedDrafts ? JSON.parse(savedDrafts) : [];
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh drafts when component mounts or when localStorage changes
  React.useEffect(() => {
    const savedDrafts = localStorage.getItem('documentDrafts');
    setDrafts(savedDrafts ? JSON.parse(savedDrafts) : []);
  }, [refreshKey]);

  // Listen for storage changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events from the same tab
    window.addEventListener('draftsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('draftsUpdated', handleStorageChange);
    };
  }, []);

  const deleteDraft = (draftId: string) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      const updatedDrafts = drafts.filter((draft: any) => draft.id !== draftId);
      setDrafts(updatedDrafts);
      localStorage.setItem('documentDrafts', JSON.stringify(updatedDrafts));
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('draftsUpdated'));
    }
  };

  const continueDraft = (draft: any) => {
    // Logic to continue editing the draft
    console.log('Continue editing draft:', draft);
    // You could emit an event or use a callback to switch to document creation with this draft
  };

  return (
   <div className="space-y-6 text-xs">
  <div>
    <h2 className="font-bold text-gray-900">Draft Documents</h2>
    <p className="text-gray-600 mt-1">Continue working on your saved drafts</p>
  </div>

  {drafts.length === 0 ? (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-xs">
      <FileText className="mx-auto text-gray-300 mb-4" size={40} />
      <h3 className="font-bold text-gray-900 mb-2">No drafts found</h3>
      <p className="text-gray-500">
        Start creating a document and save it as draft to see it here
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drafts.map((draft: any) => (
        <div
          key={draft.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow text-xs"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {draft.title}
              </h3>
              <p className="text-gray-500">Template: {draft.templateName}</p>
            </div>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
              Draft
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <span className="text-gray-500">Seller:</span>{" "}
              {draft.data.seller_name || "Not specified"}
            </div>
            <div>
              <span className="text-gray-500">Buyer:</span>{" "}
              {draft.data.buyer_name || "Not specified"}
            </div>
            <div>
              <span className="text-gray-500">Saved:</span>{" "}
              {new Date(draft.savedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => continueDraft(draft)}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={() => deleteDraft(draft.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

  );
};
export default CreationTab;