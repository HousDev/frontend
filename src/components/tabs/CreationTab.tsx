import React, { useState, useEffect, useCallback } from "react";
import { FileText, Building, Files } from "lucide-react";
import DocumentCreation from "../creation/DocumentCreation";
import TemplateCreation from "../creation/TemplateCreation";
import DraftDocuments from "../creation/DraftDocuments";
import CreatedDocuments from "../creation/CreatedDocuments";

type TabId = "documents" | "templates" | "drafts" | "created";

interface CreationTabProps {
  initialSubTab?: TabId;
}

const CreationTab: React.FC<CreationTabProps> = ({ initialSubTab = "documents" }) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialSubTab);
  const [draftToResume, setDraftToResume] = useState<any | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "documents", label: "Document Creation", icon: FileText },
    { id: "templates", label: "Template Creation", icon: Building },
    { id: "drafts", label: "Draft Documents", icon: Files },
    { id: "created", label: "Created Documents", icon: FileText },
  ];

  const handleResumeDraft = useCallback((draft: any) => {
    setDraftToResume(draft);
    setActiveTab("documents");
    window.dispatchEvent(new CustomEvent("resumeDraft", { detail: draft }));
  }, []);

  return (
    <div className="p-6 pt-4">
      {/* Tab Navigation */}
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-blue-500 text-blue-600 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
        {activeTab === "documents" && <DocumentCreation />}
        {activeTab === "templates" && <TemplateCreation />}
        {activeTab === "drafts" && (
          <DraftDocuments onContinue={handleResumeDraft} />
        )}
        {activeTab === "created" && <CreatedDocuments />}
      </div>
    </div>
  );
};

export default CreationTab;
