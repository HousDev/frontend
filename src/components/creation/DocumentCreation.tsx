import React, { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import DocumentForm from './DocumentForm';

const DocumentCreation = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [documentData, setDocumentData] = useState({});

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setDocumentData({}); // Reset document data when selecting new template
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setDocumentData({});
  };

  return (
    <div>
      {!selectedTemplate ? (
        <div>
          <TemplateSelector 
            onSelectTemplate={handleTemplateSelect}
            mode="select" // Only for selecting, not editing
          />
        </div>
      ) : (
        <DocumentForm 
          template={selectedTemplate}
          documentData={documentData}
          onDataChange={setDocumentData}
          onBack={handleBackToTemplates}
        />
      )}
    </div>
  );
};

export default DocumentCreation;