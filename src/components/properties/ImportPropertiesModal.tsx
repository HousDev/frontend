import React, { useState } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Home } from 'lucide-react';

const ImportPropertiesModal = ({ isOpen, onClose, onImport }: any) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
      alert('Please select a CSV or Excel file');
      return;
    }
    
    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);
    
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample preview data
      const sampleData = [
        {
          title: 'Modern 2BHK Apartment',
          type: 'Residential',
          subtype: 'Apartment',
          unitType: '2BHK',
          city: 'Mumbai',
          location: 'Bandra West',
          society: 'Sea View Towers',
          carpetArea: 980,
          budget: 18000000,
          status: 'Available'
        },
        {
          title: 'Luxury 3BHK Villa',
          type: 'Residential',
          subtype: 'Villa',
          unitType: '3BHK',
          city: 'Pune',
          location: 'Koregaon Park',
          society: 'Green Valley',
          carpetArea: 2200,
          budget: 35000000,
          status: 'Available'
        }
      ];
      
      setPreviewData(sampleData);
    } catch (error) {
      setErrors(['Error processing file. Please check the format and try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      alert('No data to import');
      return;
    }
    
    onImport(previewData);
  };

  const downloadTemplate = () => {
    const csvContent = `Title,Type,Subtype,UnitType,City,Location,Society,CarpetArea,Budget,Status,Seller
Modern 2BHK Apartment,Residential,Apartment,2BHK,Mumbai,Bandra West,Sea View Towers,980,18000000,Available,John Doe
Luxury 3BHK Villa,Residential,Villa,3BHK,Pune,Koregaon Park,Green Valley,2200,35000000,Available,Jane Smith`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Properties</h2>
              <p className="text-gray-600 mt-1">Upload CSV or Excel file to import multiple properties</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Download Template */}
          <div className="mb-6 bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Download Template</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Download our CSV template to ensure proper formatting
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="text-gray-600" size={24} />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {file ? file.name : 'Drop your file here, or click to browse'}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Supports CSV and Excel files (max 10MB)
                  </p>
                </div>
                
                {!file && (
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Choose File
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="mb-6 bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                <div>
                  <h3 className="font-semibold text-yellow-900">Processing File...</h3>
                  <p className="text-sm text-yellow-700">Please wait while we process your file</p>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900">Import Errors</h3>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview Data</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-green-600 font-medium">{previewData.length} properties ready to import</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {previewData.slice(0, 5).map((prop, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">{prop.title}</span>
                        </div>
                        <div className="text-gray-600">
                          {prop.unitType} • {prop.carpetArea} sq ft
                        </div>
                        <div className="text-gray-600">
                          {prop.location}, {prop.city}
                        </div>
                        <div className="text-green-600 font-medium">
                          ₹{(prop.budget / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {previewData.length > 5 && (
                    <div className="text-center text-gray-500 text-sm">
                      ... and {previewData.length - 5} more properties
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {previewData.length > 0 ? `${previewData.length} properties ready to import` : 'No file selected'}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={previewData.length === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Home size={16} />
                <span>Import {previewData.length} Properties</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPropertiesModal;