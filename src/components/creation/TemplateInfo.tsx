import React, { useRef, useState, useEffect } from 'react';
import { TemplateData, DocumentSettings } from './types';

type TemplateInfoProps = {
  templateData: TemplateData;
  setTemplateData: (data: TemplateData) => void;
  documentSettings: DocumentSettings;
  setDocumentSettings: (settings: DocumentSettings) => void;
};

const TemplateInfo: React.FC<TemplateInfoProps> = ({
  templateData,
  setTemplateData,
  documentSettings,
  setDocumentSettings
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [logoName, setLogoName] = useState<string>('');
  const [hidden, setHidden] = useState<boolean>(false);

  const handleFileChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | ArrayBuffer | null;
      if (typeof result === 'string') {
        setDocumentSettings({ ...documentSettings, logoUrl: result });
        setLogoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const onChooseFile = () => {
    fileInputRef.current?.click();
  };

  const onFileInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const removeLogo = () => {
    setDocumentSettings({ ...documentSettings, logoUrl: '' });
    setLogoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 🔹 Smooth scroll when hide/show changes
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hidden]);

  if (hidden) {
    return (
      <div
        ref={sectionRef}
        className="p-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between no-print"
      >
        <div className="text-[10px] text-gray-700 truncate">
          Settings hidden
          {documentSettings.headerTitle ? ` — ${documentSettings.headerTitle}` : ''}
          {logoName ? ` · ${logoName}` : ''}
        </div>
        <button
          type="button"
          onClick={() => setHidden(false)}
          className="px-2 py-1 text-[10px] border border-gray-300 rounded-md bg-white hover:bg-gray-50"
        >
          Show settings
        </button>
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0 no-print"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Template Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[10px]"
                placeholder="Enter template name"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={templateData.category}
                onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[10px]"
              >
                <option value="deal">Deal</option>
                <option value="agency">Agency</option>
                <option value="society">Society</option>
                <option value="handover">Handover</option>
                <option value="banking">Banking</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={templateData.description}
                onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[10px]"
                placeholder="Brief description"
              />
            </div>
          </div>

          {/* Document Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Header Title
              </label>
              <input
                type="text"
                value={documentSettings.headerTitle}
                onChange={(e) =>
                  setDocumentSettings({
                    ...documentSettings,
                    headerTitle: e.target.value
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[10px]"
                placeholder="e.g. Agreement of Sale"
              />
            </div>

            {/* Logo upload / preview */}
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Header Logo
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onChooseFile}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-[10px] bg-white hover:bg-gray-50 truncate max-w-[150px] text-left"
                  title={logoName || 'Click to upload logo'}
                >
                  {logoName || 'Upload logo'}
                </button>

                {documentSettings.logoUrl ? (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="px-2 py-1 border border-red-300 rounded-lg text-[10px] bg-white hover:bg-red-50 text-red-600"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileInputChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Watermark Text
              </label>
              <input
                type="text"
                value={documentSettings.watermarkText}
                onChange={(e) =>
                  setDocumentSettings({
                    ...documentSettings,
                    watermarkText: e.target.value
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[10px]"
                placeholder="CONFIDENTIAL"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Watermark Opacity ({documentSettings.watermarkOpacity.toFixed(2)})
              </label>
              <input
                type="range"
                min={0.02}
                max={0.2}
                step={0.01}
                value={documentSettings.watermarkOpacity}
                onChange={(e) =>
                  setDocumentSettings({
                    ...documentSettings,
                    watermarkOpacity: parseFloat(e.target.value)
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="ml-4 mt-1">
          <button
            type="button"
            onClick={() => setHidden(true)}
            className="px-2 py-1 text-[10px] border border-gray-200 rounded-md bg-white hover:bg-gray-50"
          >
            Hide
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateInfo;
