import React, { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import DocumentForm from './DocumentForm';

type GeneratedDocMeta = {
  id?: number | string;
  [k: string]: any;
} | null;


const DocumentCreation: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [documentData, setDocumentData] = useState<Record<string, any>>({});

  // TemplateSelector se aayega: { ...template, _generatedDoc?: { id, ... } }
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);

    // if TemplateSelector ne create karke id de di hai, pass it to the form so updates hit same row
    const generated = template?._generatedDoc as GeneratedDocMeta;
    setDocumentData(generated ?? {}); // { id, ... } or {}
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setDocumentData({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!selectedTemplate ? (
        <TemplateSelector
          mode="select"
          onSelectTemplate={handleTemplateSelect}
        />
      ) : (
        <DocumentForm
          template={selectedTemplate}
          documentData={documentData}          // contains { id } if already created
          onDataChange={setDocumentData}       // keeps parent copy in sync
          onBack={handleBackToTemplates}
        />
      )}
    </div>
  );
};

export default DocumentCreation;
