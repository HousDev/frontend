import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Share, 
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  Send,
  MessageCircle,
  Mail,
  Phone,
  User,
  Building,
  Calendar,
  Star,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  RefreshCw,
  ExternalLink,
  Copy,
  QrCode,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Printer,
  Upload,
  Link,
  Bookmark,
  Heart,
  Flag,
  Tag,
  Zap,
  Crown,
  Gem,
  Sparkles,
  Bot,
  Brain,
  Lightbulb,
  X,
  Menu
} from 'lucide-react';

const DocumentsManagement = ({ seller }: any) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showESignModal, setShowESignModal] = useState(false);

  // Sample seller data if not provided
  const defaultSeller = {
    name: 'John Doe',
    phone: '+91 9876543210',
    email: 'john@example.com'
  };
  
  const currentSeller = seller || defaultSeller;

  // Sample documents for the seller
  const documents = [
    {
      id: 1,
      title: 'Exclusive Mandate Agreement - Skyline Towers',
      type: 'mandate_agreement',
      template: 'Exclusive Mandate Agreement',
      property: 'Skyline Towers, Andheri West',
      status: 'pending_signature',
      priority: 'high',
      created_date: '2025-01-12',
      created_by: 'Admin User',
      document_id: 'MAN-2025-001',
      progress: 75,
      next_action: 'Digital signature required',
      tracking_history: [
        { action: 'Document Created', timestamp: '2025-01-12T10:00:00Z', user: 'Admin User', status: 'completed' },
        { action: 'Sent for Review', timestamp: '2025-01-12T10:30:00Z', user: 'Admin User', status: 'completed' },
        { action: 'Reviewed by Seller', timestamp: '2025-01-12T14:00:00Z', user: currentSeller.name, status: 'completed' },
        { action: 'OTP Verification', timestamp: '2025-01-12T14:30:00Z', user: currentSeller.name, status: 'pending' }
      ],
      shared_channels: ['email', 'whatsapp'],
      approval_required: false,
      otp_verified: false,
      esign_completed: false,
      validity_period: '6 months',
      commission_rate: '2%'
    },
    {
      id: 2,
      title: 'Property Sale Agreement - Green Valley Villa',
      type: 'sale_agreement',
      template: 'Property Sale Agreement',
      property: 'Green Valley Villa, Pune',
      status: 'otp_verified',
      priority: 'high',
      created_date: '2025-01-10',
      created_by: 'Manager User',
      document_id: 'PSA-2025-002',
      progress: 85,
      next_action: 'E-signature pending',
      tracking_history: [
        { action: 'Document Created', timestamp: '2025-01-10T09:00:00Z', user: 'Manager User', status: 'completed' },
        { action: 'Shared with Parties', timestamp: '2025-01-10T09:30:00Z', user: 'Manager User', status: 'completed' },
        { action: 'OTP Verified', timestamp: '2025-01-10T15:00:00Z', user: currentSeller.name, status: 'completed' },
        { action: 'E-Sign Pending', timestamp: '2025-01-10T15:30:00Z', user: currentSeller.name, status: 'active' }
      ],
      shared_channels: ['email', 'whatsapp', 'sms'],
      approval_required: false,
      otp_verified: true,
      esign_completed: false,
      sale_amount: '₹4.2Cr',
      buyer_name: 'Confidential'
    },
    {
      id: 3,
      title: 'Society NOC Request - Metro Heights',
      type: 'society_noc',
      template: 'Society NOC Request',
      property: 'Metro Heights, Andheri East',
      status: 'completed',
      priority: 'medium',
      created_date: '2025-01-08',
      created_by: 'Executive User',
      document_id: 'NOC-2025-003',
      progress: 100,
      next_action: 'Document completed',
      tracking_history: [
        { action: 'Document Created', timestamp: '2025-01-08T11:00:00Z', user: 'Executive User', status: 'completed' },
        { action: 'Submitted to Society', timestamp: '2025-01-08T14:00:00Z', user: 'Executive User', status: 'completed' },
        { action: 'Society Approval', timestamp: '2025-01-09T10:00:00Z', user: 'Society Secretary', status: 'completed' },
        { action: 'NOC Received', timestamp: '2025-01-09T16:00:00Z', user: 'Executive User', status: 'completed' }
      ],
      shared_channels: ['email'],
      approval_required: false,
      otp_verified: true,
      esign_completed: true,
      society_name: 'Metro Heights Society'
    },
    {
      id: 4,
      title: 'Token Receipt - Skyline Towers',
      type: 'token_receipt',
      template: 'Token Receipt',
      property: 'Skyline Towers, Andheri West',
      status: 'shared',
      priority: 'medium',
      created_date: '2025-01-11',
      created_by: 'Admin User',
      document_id: 'TR-2025-004',
      progress: 60,
      next_action: 'Awaiting buyer confirmation',
      tracking_history: [
        { action: 'Document Created', timestamp: '2025-01-11T12:00:00Z', user: 'Admin User', status: 'completed' },
        { action: 'Shared with Buyer', timestamp: '2025-01-11T12:30:00Z', user: 'Admin User', status: 'completed' },
        { action: 'Buyer Review', timestamp: '2025-01-11T18:00:00Z', user: 'Buyer', status: 'pending' }
      ],
      shared_channels: ['whatsapp', 'email'],
      approval_required: false,
      otp_verified: false,
      esign_completed: false,
      token_amount: '₹5,00,000'
    },
    {
      id: 5,
      title: 'Bank NOC Request - All Properties',
      type: 'bank_noc',
      template: 'Bank NOC Request',
      property: 'All Properties',
      status: 'pending_approval',
      priority: 'low',
      created_date: '2025-01-09',
      created_by: 'Manager User',
      document_id: 'BNOC-2025-005',
      progress: 40,
      next_action: 'Admin approval required',
      tracking_history: [
        { action: 'Document Created', timestamp: '2025-01-09T14:00:00Z', user: 'Manager User', status: 'completed' },
        { action: 'Pending Approval', timestamp: '2025-01-09T14:30:00Z', user: 'Manager User', status: 'active' }
      ],
      shared_channels: [],
      approval_required: true,
      otp_verified: false,
      esign_completed: false,
      bank_name: 'HDFC Bank'
    }
  ];

  const documentTabs = [
    { id: 'all', label: 'All Docs', count: documents.length },
    { id: 'pending', label: 'Pending', count: documents.filter(d => d.status !== 'completed').length },
    { id: 'completed', label: 'Done', count: documents.filter(d => d.status === 'completed').length },
    { id: 'signatures', label: 'Sign', count: documents.filter(d => !d.esign_completed).length }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && doc.status !== 'completed') ||
                      (activeTab === 'completed' && doc.status === 'completed') ||
                      (activeTab === 'signatures' && !doc.esign_completed);
    
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending_signature': { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Pending Sign', icon: Clock },
      'otp_verified': { bg: 'bg-blue-50', text: 'text-blue-600', label: 'OTP Done', icon: Shield },
      'shared': { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Shared', icon: Send },
      'completed': { bg: 'bg-green-50', text: 'text-green-600', label: 'Complete', icon: CheckCircle },
      'pending_approval': { bg: 'bg-red-50', text: 'text-red-600', label: 'Need Approval', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.shared;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={10} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { bg: 'bg-red-50', text: 'text-red-600', label: 'High' },
      'medium': { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Medium' },
      'low': { bg: 'bg-green-50', text: 'text-green-600', label: 'Low' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleDocumentAction = (action: string, document: any) => {
    setSelectedDocument(document);
    
    switch (action) {
      case 'view':
        setShowDocumentViewer(true);
        break;
      case 'track':
        setShowTrackingModal(true);
        break;
      case 'otp':
        setShowOTPModal(true);
        break;
      case 'esign':
        setShowESignModal(true);
        break;
      case 'download':
        // Generate PDF download
       const link = window.document.createElement('a');
        link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKERvY3VtZW50KQo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEyMSAwMDAwMCBuIAowMDAwMDAwMTc4IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAyIDAgUgo+PgpzdGFydHhyZWYKMjczCiUlRU9GCg==';
        link.download = `${document.document_id}.pdf`;
        link.click();
        break;
      case 'share':
        const shareMessage = `Document: ${document.title}\nDocument ID: ${document.document_id}\nStatus: ${document.status}\n\nView document: https://resaleexpert.com/document/${document.document_id}\n\nResaleExpert Team`;
        navigator.clipboard.writeText(shareMessage);
        alert('Document link copied to clipboard!');
        break;
      default:
        break;
    }
  };

  const initiateOTPVerification = async () => {
    if (!selectedDocument) return;
    
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`OTP sent to ${currentSeller.phone} for document verification`);
      
      const otp = prompt('Enter OTP received on your phone:');
      if (otp && otp === '123456') { // Simulate OTP verification
        // Update document status
        const updatedDoc = { ...selectedDocument, otp_verified: true, status: 'otp_verified' };
        alert('OTP verified successfully! Document ready for e-signature.');
        setShowOTPModal(false);
      } else if (otp) {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      alert('OTP verification failed. Please try again.');
    }
  };

  const initiateESign = async () => {
    if (!selectedDocument) return;
    
    try {
      // Simulate e-signature process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const confirmed = window.confirm('Proceed with digital signature using Aadhaar OTP?');
      if (confirmed) {
        const aadhaarOTP = prompt('Enter Aadhaar OTP for digital signature:');
        if (aadhaarOTP && aadhaarOTP === '654321') {
          alert('Document signed successfully! Digital signature completed.');
          setShowESignModal(false);
        } else if (aadhaarOTP) {
          alert('Invalid Aadhaar OTP. Please try again.');
        }
      }
    } catch (error) {
      alert('E-signature failed. Please try again.');
    }
  };

  const approveDocument = async () => {
    if (!selectedDocument) return;
    
    const confirmed = window.confirm('Approve this document for processing?');
    if (confirmed) {
      alert('Document approved successfully!');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-xs text-gray-600 mt-1">Manage property documents</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs">
            <Upload size={14} />
            <span>Upload</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
            <Plus size={14} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total</p>
              <p className="text-lg font-bold">{documents.length}</p>
            </div>
            <FileText size={16} className="text-blue-200" />
          </div>
          <div className="text-blue-100 text-xs mt-1">All docs</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Pending</p>
              <p className="text-lg font-bold">{documents.filter(d => d.status !== 'completed').length}</p>
            </div>
            <Clock size={16} className="text-orange-200" />
          </div>
          <div className="text-orange-100 text-xs mt-1">Need action</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Done</p>
              <p className="text-lg font-bold">{documents.filter(d => d.status === 'completed').length}</p>
            </div>
            <CheckCircle size={16} className="text-green-200" />
          </div>
          <div className="text-green-100 text-xs mt-1">Completed</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">This Month</p>
              <p className="text-lg font-bold">{documents.filter(d => new Date(d.created_date).getMonth() === new Date().getMonth()).length}</p>
            </div>
            <TrendingUp size={16} className="text-purple-200" />
          </div>
          <div className="text-purple-100 text-xs mt-1">New docs</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <button className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
              <Filter size={14} />
              <span>Filters</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Document Tabs */}
        <div className="mt-3">
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {documentTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-200' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <FileText className="text-blue-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{document.title}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(document.status)}
                        {getPriorityBadge(document.priority)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Building size={10} />
                        <span className="truncate">{document.property}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={10} />
                        <span>{document.created_date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User size={10} />
                        <span className="truncate">{document.created_by}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-700 mb-1">
                      <span className="font-medium">ID:</span> {document.document_id}
                    </div>
                    <div className="text-xs text-gray-700">
                      <span className="font-medium">Next:</span> {document.next_action}
                    </div>
                  </div>
                </div>
                <div className="text-center sm:text-right flex-shrink-0">
                  <div className="text-lg font-bold text-blue-600">{document.progress}%</div>
                  <div className="text-xs text-gray-500 mb-2">Progress</div>
                  <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2 mx-auto sm:mx-0">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${document.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 mt-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Template</div>
                  <div className="font-medium text-gray-900 text-xs">{document.template}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">OTP Status</div>
                  <div className="flex items-center space-x-1">
                    {document.otp_verified ? (
                      <CheckCircle className="text-green-500" size={12} />
                    ) : (
                      <Clock className="text-orange-500" size={12} />
                    )}
                    <span className="text-xs font-medium">
                      {document.otp_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">E-Sign</div>
                  <div className="flex items-center space-x-1">
                    {document.esign_completed ? (
                      <CheckCircle className="text-green-500" size={12} />
                    ) : (
                      <Clock className="text-orange-500" size={12} />
                    )}
                    <span className="text-xs font-medium">
                      {document.esign_completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shared Channels */}
              {document.shared_channels.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Shared Via</div>
                  <div className="flex flex-wrap gap-1">
                    {document.shared_channels.map((channel: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDocumentAction('view', document)}
                  className="flex items-center space-x-1 px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  <Eye size={12} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDocumentAction('track', document)}
                  className="flex items-center space-x-1 px-2 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-xs"
                >
                  <BarChart3 size={12} />
                  <span>Track</span>
                </button>
                {document.approval_required && (
                  <button
                    onClick={approveDocument}
                    className="flex items-center space-x-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                  >
                    <CheckCircle size={12} />
                    <span>Approve</span>
                  </button>
                )}
                {!document.otp_verified && (
                  <button
                    onClick={() => handleDocumentAction('otp', document)}
                    className="flex items-center space-x-1 px-2 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs"
                  >
                    <Shield size={12} />
                    <span>OTP</span>
                  </button>
                )}
                {document.otp_verified && !document.esign_completed && (
                  <button
                    onClick={() => handleDocumentAction('esign', document)}
                    className="flex items-center space-x-1 px-2 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                  >
                    <Award size={12} />
                    <span>Sign</span>
                  </button>
                )}
                <button
                  onClick={() => handleDocumentAction('download', document)}
                  className="flex items-center space-x-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                >
                  <Download size={12} />
                  <span>Get</span>
                </button>
                <button
                  onClick={() => handleDocumentAction('share', document)}
                  className="flex items-center space-x-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                >
                  <Share size={12} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={32} />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-xs text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <DocumentViewerModal 
          document={selectedDocument}
          onClose={() => {
            setShowDocumentViewer(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedDocument && (
        <DocumentTrackingModal 
          document={selectedDocument}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && selectedDocument && (
        <OTPVerificationModal 
          document={selectedDocument}
          seller={currentSeller}
          onVerify={initiateOTPVerification}
          onClose={() => {
            setShowOTPModal(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* E-Sign Modal */}
      {showESignModal && selectedDocument && (
        <ESignModal 
          document={selectedDocument}
          seller={currentSeller}
          onSign={initiateESign}
          onClose={() => {
            setShowESignModal(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};

// Document Viewer Modal
const DocumentViewerModal = ({ document, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate pr-4">{document.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-gray-50 rounded-lg p-4 min-h-64">
            <div className="text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Document Preview</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <p><span className="font-medium">ID:</span> {document.document_id}</p>
                <p><span className="font-medium">Type:</span> {document.template}</p>
                <p><span className="font-medium">Property:</span> {document.property}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Tracking Modal
const DocumentTrackingModal = ({ document, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Document Tracking</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {document.tracking_history.map((entry: any, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  entry.status === 'completed' ? 'bg-green-100' :
                  entry.status === 'active' ? 'bg-blue-100' :
                  'bg-orange-100'
                }`}>
                  {entry.status === 'completed' ? (
                    <CheckCircle className="text-green-600" size={12} />
                  ) : entry.status === 'active' ? (
                    <Clock className="text-blue-600" size={12} />
                  ) : (
                    <AlertCircle className="text-orange-600" size={12} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-xs">{entry.action}</div>
                  <div className="text-xs text-gray-600">by {entry.user}</div>
                  <div className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// OTP Verification Modal
const OTPVerificationModal = ({ document, seller, onVerify, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">OTP Verification</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full w-12 h-12 mx-auto mb-3">
              <Shield className="text-orange-600" size={24} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Verify Identity</h3>
            <p className="text-xs text-gray-600 mb-2">OTP will be sent to your phone</p>
            <p className="text-xs text-gray-500">{seller.phone}</p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2 text-xs">Document Details</h4>
              <div className="text-xs text-blue-800 space-y-1">
                <div><span className="font-medium">Doc:</span> {document.title}</div>
                <div><span className="font-medium">ID:</span> {document.document_id}</div>
                <div><span className="font-medium">Property:</span> {document.property}</div>
              </div>
            </div>
            
            <button
              onClick={onVerify}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium text-xs"
            >
              Send OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// E-Sign Modal
const ESignModal = ({ document, seller, onSign, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Digital Signature</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-3">
              <Award className="text-purple-600" size={24} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Digital Signature</h3>
            <p className="text-xs text-gray-600">Sign document digitally</p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-purple-900 mb-2 text-xs">Signature Details</h4>
              <div className="text-xs text-purple-800 space-y-1">
                <div><span className="font-medium">Signer:</span> {seller.name}</div>
                <div><span className="font-medium">Document:</span> {document.document_id}</div>
                <div><span className="font-medium">Method:</span> Aadhaar OTP</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={12} />
                <div className="text-xs text-yellow-800">
                  <div className="font-medium mb-1">Important:</div>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>Have Aadhaar card ready</li>
                    <li>OTP sent to Aadhaar phone</li>
                    <li>Legally binding signature</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={onSign}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-xs"
            >
              Proceed with E-Sign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsManagement;