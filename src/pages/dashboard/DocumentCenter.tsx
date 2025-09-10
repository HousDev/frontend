import React, { useState, useEffect } from 'react';
import DashboardTab from '../../components/tabs/DashboardTab';
import TrackingTab from '../../components/tabs/TrackingTab';
import CreationTab from '../../components/tabs/CreationTab';

const DocumentCenter = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: DashboardTab },
    { id: 'tracking', label: 'Tracking', component: TrackingTab },
    { id: 'creation', label: 'Creation', component: CreationTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  const handleNavigateToTracking = () => {
    setActiveTab('tracking');
    localStorage.setItem('activeTab', 'tracking');
  };

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col bg-gray-50 ">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Document Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Manage templates, track documents, and generate new files
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              System Active
            </div>
            <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Admin Access
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
                className={`py-1 px-1 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <DashboardTab onNavigateToTracking={handleNavigateToTracking} />}
        {activeTab === 'tracking' && <TrackingTab />}
        {activeTab === 'creation' && <CreationTab />}
      </div>
    </div>
  );
};

export default DocumentCenter;
