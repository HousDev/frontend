import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ImportExportPage: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const recentImports = [
    {
      id: 1,
      filename: 'leads_2025_q1.csv',
      type: 'Leads',
      status: 'completed',
      records: 1250,
      date: '2025-01-15 14:30',
      errors: 0,
    },
    {
      id: 2,
      filename: 'properties_update.xlsx',
      type: 'Properties',
      status: 'completed',
      records: 890,
      date: '2025-01-14 09:45',
      errors: 3,
    },
    {
      id: 3,
      filename: 'contacts_import.csv',
      type: 'Contacts',
      status: 'processing',
      records: 456,
      date: '2025-01-15 16:20',
      errors: 0,
    },
    {
      id: 4,
      filename: 'user_data.json',
      type: 'Users',
      status: 'failed',
      records: 0,
      date: '2025-01-13 11:15',
      errors: 15,
    },
  ];

  const exportTemplates = [
    { id: 1, name: 'Leads Export', description: 'All lead data with contact information', type: 'leads' },
    { id: 2, name: 'Properties Export', description: 'Property listings with full details', type: 'properties' },
    { id: 3, name: 'Users Export', description: 'User accounts and role information', type: 'users' },
    { id: 4, name: 'Activities Export', description: 'Activity logs and interaction history', type: 'activities' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import & Export</h1>
        <p className="text-muted-foreground">
          Import data from external sources or export your data for backup and analysis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>
              Upload CSV, Excel, or JSON files to import data into the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-type">Data Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type to import" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="properties">Properties</SelectItem>
                  <SelectItem value="contacts">Contacts</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file-upload">Choose File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, Excel (.xlsx, .xls), JSON
              </p>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex gap-2">
              <Button disabled={isUploading}>
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Export your data in various formats for backup or external analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {exportTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-3 w-3" />
                    Export
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Imports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
          <CardDescription>
            History of recent data import operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentImports.map((importItem) => (
              <div key={importItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(importItem.status)}
                  <div>
                    <p className="font-medium">{importItem.filename}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{importItem.type}</span>
                      <span>•</span>
                      <span>{importItem.records} records</span>
                      <span>•</span>
                      <span>{importItem.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {importItem.errors > 0 && (
                    <Badge variant="destructive">{importItem.errors} errors</Badge>
                  )}
                  {getStatusBadge(importItem.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportPage;