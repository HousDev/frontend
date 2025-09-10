import React from 'react';
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
  Eye,
  ArrowRight
} from 'lucide-react';

const DashboardTab = ({ onNavigateToTracking }: { onNavigateToTracking?: () => void }) => {
  const stats = [
    { label: 'Total Documents', value: '1,247', icon: FileText, color: 'blue', change: '+12%' },
    { label: 'Active Clients', value: '89', icon: Users, color: 'green', change: '+8%' },
    { label: 'Pending Approvals', value: '23', icon: Clock, color: 'orange', change: '-5%' },
    { label: 'Completed Today', value: '34', icon: CheckCircle, color: 'emerald', change: '+15%' },
  ];

  const recentDocuments = [
    {
      id: 1,
      title: 'Property Sale Agreement - Flat A-404',
      type: 'Deal Agreement',
      client: 'Rajesh Kumar',
      status: 'e-sign_pending',
      date: '2025-01-12',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Society NOC Request - Tower B',
      type: 'Society Document',
      client: 'Priya Sharma',
      status: 'otp_verified',
      date: '2025-01-12',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Exclusive Mandate Agreement',
      type: 'Agency Document',
      client: 'Mumbai Properties Ltd',
      status: 'completed',
      date: '2025-01-11',
      priority: 'low'
    },
    {
      id: 4,
      title: 'Token Receipt - Project Phoenix',
      type: 'Receipt',
      client: 'Amit Patel',
      status: 'shared',
      date: '2025-01-11',
      priority: 'medium'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'e-sign_pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'E-Sign Pending' },
      'otp_verified': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'OTP Verified' },
      'shared': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shared' },
      'created': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Created' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
      'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDocument = (docId: number) => {
    console.log('Viewing document:', docId);
    if (onNavigateToTracking) {
      onNavigateToTracking();
    }
  };

  const handleDownloadDocument = (docId: number) => {
    console.log('Downloading document:', docId);
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEK...';
    link.download = `document-${docId}.pdf`;
    link.click();
  };

  return (
    <div className="p-4 space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`text-${stat.color}-600`} size={18} />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="text-green-500" size={14} />
                <span className="text-green-600 text-xs font-medium ml-1">{stat.change}</span>
                <span className="text-gray-500 text-xs ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Documents</h2>
            <button
              onClick={onNavigateToTracking}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {['Document', 'Client', 'Status', 'Priority', 'Date', 'Actions'].map((col, i) => (
                  <th key={i} className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2">
                    <div>
                      <div className="text-xs font-medium text-gray-900">{doc.title}</div>
                      <div className="text-[11px] text-gray-500">{doc.type}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-900">{doc.client}</td>
                  <td className="px-4 py-2">{getStatusBadge(doc.status)}</td>
                  <td className="px-4 py-2">{getPriorityBadge(doc.priority)}</td>
                  <td className="px-4 py-2 text-[11px] text-gray-500">{doc.date}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-1">
                      <button
                        title="View Document"
                        onClick={() => handleViewDocument(doc.id)}
                        className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        title="Download Document"
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions + Template Usage + System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <button className="w-full sm:w-auto bg-blue-600 text-white py-1.5 px-4 rounded-lg hover:bg-blue-700 transition-colors text-xs">
              Generate New Document
            </button>
            <button className="w-full sm:w-auto bg-gray-100 text-gray-700 py-1.5 px-4 rounded-lg hover:bg-gray-200 transition-colors text-xs">
              Create Template
            </button>
            <button className="w-full sm:w-auto bg-gray-100 text-gray-700 py-1.5 px-4 rounded-lg hover:bg-gray-200 transition-colors text-xs">
              Add New Client
            </button>
          </div>



        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Template Usage</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Sale Agreement</span>
              <span className="text-sm font-semibold">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Token Receipt</span>
              <span className="text-sm font-semibold">32</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">NOC Request</span>
              <span className="text-sm font-semibold">18</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">System Health</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">API Status: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Storage: Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
