import React, { useState, useEffect } from 'react';
import DashboardTab from '../../components/tabs/DashboardTab';
import TrackingTab from '../../components/tabs/TrackingTab';
import CreationTab from '../../components/tabs/CreationTab';
import { FileText, ShieldCheck, Sparkles } from 'lucide-react';

const DocumentCenter = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  const [creationSubTab, setCreationSubTab] = useState<'documents' | 'templates' | 'drafts' | 'created'>('documents');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: DashboardTab },
    { id: 'tracking', label: 'Tracking & Audits', component: TrackingTab },
    { id: 'creation', label: 'Creation & Studio', component: CreationTab },
  ];

  const handleNavigateToTracking = () => {
    setActiveTab('tracking');
    localStorage.setItem('activeTab', 'tracking');
  };

  const handleNavigateToCreation = (subTab: 'documents' | 'templates' | 'drafts' | 'created' = 'documents') => {
    setCreationSubTab(subTab);
    setActiveTab('creation');
    localStorage.setItem('activeTab', 'creation');
  };

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Executive Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={20} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Document Center
              </h1>

            </div>
            <p className="text-xs text-gray-500 mt-1">
              Manage smart templates, track e-signatures, generate agreements, and conduct SHA-256 legal audits
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Digio E-Sign Active</span>
            </div>
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
              <ShieldCheck size={13} className="text-slate-500" />
              <span>Admin Access</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4">
          <nav className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-semibold text-xs transition-all flex items-center space-x-1.5 ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && (
          <DashboardTab
            onNavigateToTracking={handleNavigateToTracking}
            onNavigateToCreation={handleNavigateToCreation}
          />
        )}
        {activeTab === 'tracking' && <TrackingTab />}
        {activeTab === 'creation' && <CreationTab initialSubTab={creationSubTab} />}
      </div>
    </div>
  );
};

export default DocumentCenter;
