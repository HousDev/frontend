import React, { useState } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Users } from 'lucide-react';

const ImportLeadsModal = ({ isOpen, onClose, onImport }: any) => {
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
          salutation: 'Mr.',
          name: 'Amit Sharma',
          phone: '9876543210',
          email: 'amit.sharma@email.com',
          city: 'Mumbai',
          location: 'Bandra',
          source: 'Website'
        },
        {
          salutation: 'Mrs.',
          name: 'Priya Patel',
          phone: '8765432109',
          email: 'priya.patel@email.com',
          city: 'Pune',
          location: 'Koregaon Park',
          source: 'Referral'
        },
        {
          salutation: 'Mr.',
          name: 'Rohit Gupta',
          phone: '7654321098',
          email: 'rohit.gupta@email.com',
          city: 'Delhi',
          location: 'Gurgaon',
          source: 'Social Media'
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
    const csvContent = `Salutation,Name,Phone,Email,State,City,Location,Source,Priority,Stage,Status
Mr.,John Doe,9876543210,john.doe@email.com,Maharashtra,Mumbai,Andheri,Website,medium,lead,active
Mrs.,Jane Smith,8765432109,jane.smith@email.com,Karnataka,Bangalore,Koramangala,Referral,high,interested,active`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
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
              <h2 className="text-2xl font-bold text-gray-900">Import Leads</h2>
              <p className="text-gray-600 mt-1">Upload CSV or Excel file to import multiple leads</p>
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
                  <span className="text-green-600 font-medium">{previewData.length} leads ready to import</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {previewData.slice(0, 5).map((lead, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">{lead.salutation} {lead.name}</span>
                        </div>
                        <div className="text-gray-600">
                          {lead.phone} • {lead.email}
                        </div>
                        <div className="text-gray-600">
                          {lead.location}, {lead.city}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {previewData.length > 5 && (
                    <div className="text-center text-gray-500 text-sm">
                      ... and {previewData.length - 5} more leads
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Import Instructions */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Import Instructions</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Download the template file and fill in your lead data</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Ensure all required fields (Name, Phone) are filled</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Save the file as CSV or Excel format</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Upload the file and review the preview before importing</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {previewData.length > 0 ? `${previewData.length} leads ready to import` : 'No file selected'}
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
                <Users size={16} />
                <span>Import {previewData.length} Leads</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportLeadsModal;