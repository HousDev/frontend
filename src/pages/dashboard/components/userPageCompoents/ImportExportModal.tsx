// components/userPageCompoents/ImportExportModal.tsx
import React, { useState } from 'react';
import { Download, Upload, X, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { usersAPI } from '@/lib/api';
import { toast } from 'react-toastify';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';  // ✅ Condition ke liye
  tabType?: string; // 'all', 'buyers', 'sellers', 'buyer-accounts', 'seller-accounts'
  onSuccess?: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  tabType = 'all',
  onSuccess 
}) => {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [exportLoading, setExportLoading] = useState(false);
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importType, setImportType] = useState<'users' | 'buyers' | 'sellers'>('users');
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const getTabTitle = () => {
    switch (tabType) {
      case 'all': return 'Team Members';
      case 'buyers': return 'Buyers';
      case 'sellers': return 'Sellers';
      case 'buyer-accounts': return 'Buyer Accounts';
      case 'seller-accounts': return 'Seller Accounts';
      case 'tenant-accounts': return 'Tenant Accounts';
      case 'owner-accounts': return 'Owner Accounts';
      default: return 'Users';
    }
  };

  // ==================== EXPORT FUNCTIONS ====================
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await usersAPI.exportUsersByTab(tabType, exportFormat);
      const blob = new Blob([response.data], { 
        type: exportFormat === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${getTabTitle().toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${getTabTitle()} exported successfully`);
      onClose();
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  // ==================== IMPORT FUNCTIONS ====================
  const handleDownloadTemplate = async () => {
    try {
      const response = await usersAPI.downloadImportTemplate(importType);
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${importType}-import-template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (validTypes.includes(fileExt)) {
        setImportFile(file);
        setErrors([]);
      } else {
        toast.error('Please upload valid Excel or CSV file');
        e.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImportLoading(true);
    try {
      const result = await usersAPI.importUsersByType(importFile, importType);
      if (result.success) {
        toast.success(result.message || `Successfully imported ${result.importedCount || 0} ${importType}`);
        if (result.errors?.length > 0) {
          setErrors(result.errors);
        } else {
          onSuccess?.();
          onClose();
        }
      } else {
        toast.error(result.message || 'Import failed');
        if (result.errors) setErrors(result.errors);
      }
    } catch (error: any) {
      console.error('Error importing:', error);
      toast.error(error?.response?.data?.message || 'Failed to import');
      if (error?.response?.data?.errors) setErrors(error.response.data.errors);
    } finally {
      setImportLoading(false);
    }
  };

  const getInstructions = () => {
    switch (importType) {
      case 'buyers':
        return [
          'Email must be unique',
          'Password minimum 6 characters',
          'Valid salutation: Mr, Mrs, Ms, Dr',
          'Status: active or inactive',
          'Date format: YYYY-MM-DD'
        ];
      case 'sellers':
        return [
          'Email must be unique',
          'Password minimum 6 characters',
          'Valid salutation: Mr, Mrs, Ms, Dr',
          'Status: active or inactive',
          'Date format: YYYY-MM-DD'
        ];
      default:
        return [
          'Email must be unique',
          'Password minimum 6 characters',
          'Valid roles: admin, agent, manager, buyer, seller, executive',
          'Status: active or inactive',
          'Date format: YYYY-MM-DD'
        ];
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b rounded-md" style={{ backgroundColor: '#0f2b3d' }}>
          <h2 className="text-lg font-semibold text-white">
            {mode === 'export' ? `Export ${getTabTitle()}` : 'Import Data'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Content - Condition based on mode */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* ========== EXPORT MODE ========== */}
          {mode === 'export' && (
            <>
              <p className="text-sm text-gray-600">
                Export {getTabTitle()} data to Excel or CSV format.
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Export Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value as 'excel')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value as 'csv')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">CSV (.csv)</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Export includes all {getTabTitle().toLowerCase()} data based on current filters.
                </p>
              </div>
            </>
          )}

          {/* ========== IMPORT MODE ========== */}
          {mode === 'import' && (
            <>
              {/* Import Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Import Type</label>
                <select
                  value={importType}
                  onChange={(e) => {
                    setImportType(e.target.value as any);
                    setImportFile(null);
                    setErrors([]);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="users">Users (Team Members)</option>
                  <option value="buyers">Buyers</option>
                  <option value="sellers">Sellers</option>
                </select>
              </div>

              <Button onClick={handleDownloadTemplate} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download {importType === 'users' ? 'Users' : importType === 'buyers' ? 'Buyers' : 'Sellers'} Template
              </Button>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="import-file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="import-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {importFile ? importFile.name : 'Click to select or drag and drop'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Supports .xlsx, .xls, .csv files
                  </span>
                </label>
              </div>

              {importFile && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">{importFile.name}</span>
                  </div>
                  <button onClick={() => setImportFile(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Import Errors:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx} className="text-xs text-red-700">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-yellow-800 mb-2">Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {getInstructions().map((instruction, idx) => (
                    <li key={idx} className="text-xs text-yellow-700">{instruction}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={mode === 'export' ? handleExport : handleImport}
            disabled={mode === 'export' ? exportLoading : (importLoading || !importFile)}
            style={{ backgroundColor: '#e67e22' }}
            className="text-white"
          >
            {mode === 'export' 
              ? (exportLoading ? 'Exporting...' : 'Export')
              : (importLoading ? 'Importing...' : 'Import')
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;