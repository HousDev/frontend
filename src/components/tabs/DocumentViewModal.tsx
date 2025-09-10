import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  User, 
  Users, 
  Building, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Shield, 
  Eye, 
  Mail, 
  MessageCircle, 
  Phone,
  Download,
  Share,
  Edit,
  Activity,
  MapPin,
  DollarSign,
  Award,
  Crown,
  Star,
  Target,
  TrendingUp,
  AlertCircle,
  Send,
  Bell,
  Flag,
  Bookmark,
  Heart,
  Zap,
  Gem
} from 'lucide-react';

const DocumentViewModal = ({ isOpen, onClose, document }: any) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !document) return null;

  const tabs = [
    { id: 'details', label: 'Document Details', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'sharing', label: 'Sharing', icon: Share }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed', icon: CheckCircle },
      'e-sign_pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'E-Sign Pending', icon: Clock },
      'otp_verified': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'OTP Verified', icon: Shield },
      'shared': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shared', icon: Send },
      'created': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Created', icon: FileText }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { bg: 'bg-red-100', text: 'text-red-700', label: 'High Priority', icon: AlertCircle },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Priority', icon: Clock },
      'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Priority', icon: CheckCircle }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getActionIcon = (iconName: string) => {
    const icons = {
      'FileText': FileText,
      'Mail': Mail,
      'MessageCircle': MessageCircle,
      'Eye': Eye,
      'Shield': Shield,
      'CheckCircle': CheckCircle,
      'Award': Award,
      'Crown': Crown,
      'Send': Send,
      'Phone': Phone
    };
    
    const Icon = icons[iconName as keyof typeof icons] || FileText;
    return <Icon size={16} />;
  };

  const getStageColor = (stage: string) => {
    const stageColors = {
      'created': 'text-gray-600 bg-gray-100',
      'shared': 'text-purple-600 bg-purple-100',
      'viewed': 'text-blue-600 bg-blue-100',
      'otp_initiated': 'text-orange-600 bg-orange-100',
      'otp_verified': 'text-green-600 bg-green-100',
      'under_review': 'text-indigo-600 bg-indigo-100',
      'reviewed': 'text-cyan-600 bg-cyan-100',
      'e_signed': 'text-pink-600 bg-pink-100',
      'completed': 'text-emerald-600 bg-emerald-100'
    };
    
    return stageColors[stage as keyof typeof stageColors] || 'text-gray-600 bg-gray-100';
  };

  const generateDocumentPreview = () => {
    if (document.template_name === 'Booking Form') {
      return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1f2937; padding-bottom: 20px;">
            <h1 style="color: #1f2937; margin-bottom: 10px; font-size: 28px;">PROPERTY BOOKING FORM</h1>
            <p style="color: #6b7280; font-size: 16px;">Document ID: ${document.data.document_id}</p>
            <p style="color: #6b7280; font-size: 16px;">Date: ${document.data.document_date}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Property Details</h2>
            <div style="margin-top: 20px; background: #f9fafb; padding: 20px; border-radius: 8px;">
              <p><strong>Property Address:</strong> ${document.data.property_address}</p>
              <p><strong>Property Type:</strong> ${document.data.property_type}</p>
              <p><strong>Area:</strong> ${document.data.property_area} sq ft</p>
              <p><strong>Booking Amount:</strong> ₹${document.data.booking_amount?.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer Information</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                <h3 style="color: #4b5563; margin-bottom: 15px;">Primary Applicant</h3>
                <p><strong>Name:</strong> ${document.data.buyer_name}</p>
                <p><strong>Phone:</strong> ${document.data.buyer_phone}</p>
                <p><strong>Email:</strong> ${document.data.buyer_email}</p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                <h3 style="color: #4b5563; margin-bottom: 15px;">Deal Executive</h3>
                <p><strong>Name:</strong> ${document.data.sales_executive}</p>
                <p><strong>Employee ID:</strong> ${document.data.executive_id}</p>
                <p><strong>Contact:</strong> ${document.data.executive_phone}</p>
                <p><strong>Email:</strong> ${document.data.executive_email}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1f2937; padding-bottom: 20px;">
          <h1 style="color: #1f2937; margin-bottom: 10px; font-size: 28px;">${document.template_name.toUpperCase()}</h1>
          <p style="color: #6b7280; font-size: 16px;">Document ID: ${document.data.document_id}</p>
          <p style="color: #6b7280; font-size: 16px;">Date: ${document.data.document_date}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Parties Involved</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <h3 style="color: #4b5563; margin-bottom: 15px;">Seller</h3>
              <p><strong>Name:</strong> ${document.data.seller_name}</p>
              <p><strong>Phone:</strong> ${document.data.seller_phone}</p>
              <p><strong>Email:</strong> ${document.data.seller_email}</p>
            </div>
            ${document.data.buyer_name ? `
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <h3 style="color: #4b5563; margin-bottom: 15px;">Buyer</h3>
              <p><strong>Name:</strong> ${document.data.buyer_name}</p>
              <p><strong>Phone:</strong> ${document.data.buyer_phone}</p>
              <p><strong>Email:</strong> ${document.data.buyer_email}</p>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Property Details</h2>
          <div style="margin-top: 20px; background: #f9fafb; padding: 20px; border-radius: 8px;">
            <p><strong>Address:</strong> ${document.data.property_address}</p>
            <p><strong>Type:</strong> ${document.data.property_type}</p>
            <p><strong>Area:</strong> ${document.data.property_area} sq ft</p>
            ${document.data.sale_amount ? `<p><strong>Sale Amount:</strong> ₹${document.data.sale_amount.toLocaleString('en-IN')}</p>` : ''}
            ${document.data.token_amount ? `<p><strong>Token Amount:</strong> ₹${document.data.token_amount.toLocaleString('en-IN')}</p>` : ''}
          </div>
        </div>
        
        <div style="margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <div style="text-align: center;">
            <div style="border-top: 2px solid #374151; padding-top: 15px; margin-top: 40px;">
              <p style="font-weight: bold; margin-bottom: 5px;">Seller Signature</p>
              <p style="color: #6b7280; font-size: 14px;">${document.data.seller_name}</p>
              <p style="color: #6b7280; font-size: 12px;">Date: ${document.data.document_date}</p>
            </div>
          </div>
          ${document.data.buyer_name ? `
          <div style="text-align: center;">
            <div style="border-top: 2px solid #374151; padding-top: 15px; margin-top: 40px;">
              <p style="font-weight: bold; margin-bottom: 5px;">Buyer Signature</p>
              <p style="color: #6b7280; font-size: 14px;">${document.data.buyer_name}</p>
              <p style="color: #6b7280; font-size: 12px;">Date: ${document.data.document_date}</p>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{document.title}</h2>
                <p className="text-gray-600 mt-1">{document.template_name} • ID: {document.data.document_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKERvY3VtZW50KQo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEyMSAwMDAwMCBuIAowMDAwMDAwMTc4IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAyIDAgUgo+PgpzdGFydHhyZWYKMjczCiUlRU9GCg==';
                  link.download = `${document.title}.pdf`;
                  link.click();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Document Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Document Summary</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(document.status)}
                    {getPriorityBadge(document.priority)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Template:</span>
                    <div className="font-semibold text-gray-900">{document.template_name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Created By:</span>
                    <div className="font-semibold text-gray-900">{document.created_by}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Assigned To:</span>
                    <div className="font-semibold text-gray-900">{document.assigned_to}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Progress:</span>
                    <div className="font-semibold text-gray-900">{document.stage_progress}%</div>
                  </div>
                </div>
              </div>

              {/* Parties Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="mr-2" size={20} />
                    Seller Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <div className="font-semibold text-gray-900">{document.data.seller_name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <div className="font-semibold text-gray-900">{document.data.seller_phone}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <div className="font-semibold text-gray-900">{document.data.seller_email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={() => window.open(`tel:${document.data.seller_phone}`)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Phone size={14} />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => {
                        const message = `Hi ${document.data.seller_name}, regarding document ${document.data.document_id}`;
                        window.open(`https://wa.me/${document.data.seller_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {document.data.buyer_name && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="mr-2" size={20} />
                      Buyer Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Name:</span>
                        <div className="font-semibold text-gray-900">{document.data.buyer_name}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Phone:</span>
                        <div className="font-semibold text-gray-900">{document.data.buyer_phone}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <div className="font-semibold text-gray-900">{document.data.buyer_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <button
                        onClick={() => window.open(`tel:${document.data.buyer_phone}`)}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Phone size={14} />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={() => {
                          const message = `Hi ${document.data.buyer_name}, regarding document ${document.data.document_id}`;
                          window.open(`https://wa.me/${document.data.buyer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="mr-2" size={20} />
                  Property Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Address:</span>
                    <div className="font-semibold text-gray-900">{document.data.property_address}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Type:</span>
                    <div className="font-semibold text-gray-900">{document.data.property_type}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Area:</span>
                    <div className="font-semibold text-gray-900">{document.data.property_area} sq ft</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Sales Executive:</span>
                    <div className="font-semibold text-gray-900">{document.data.sales_executive}</div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              {(document.data.sale_amount || document.data.token_amount || document.data.booking_amount) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Financial Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {document.data.sale_amount && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(document.data.sale_amount)}
                        </div>
                        <div className="text-sm text-green-700">Sale Amount</div>
                      </div>
                    )}
                    {document.data.token_amount && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(document.data.token_amount)}
                        </div>
                        <div className="text-sm text-blue-700">Token Amount</div>
                      </div>
                    )}
                    {document.data.booking_amount && (
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(document.data.booking_amount)}
                        </div>
                        <div className="text-sm text-purple-700">Booking Amount</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Document Timeline</h3>
              
              {/* Progress Overview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-gray-900">Overall Progress</span>
                  <span className="font-bold text-blue-600">{document.stage_progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${document.stage_progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {document.tracking_history?.map((entry: any, index: number) => (
                  <div key={entry.id} className="relative">
                    {/* Timeline line */}
                    {index < document.tracking_history.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-full ${getStageColor(entry.stage)}`}>
                        {getActionIcon(entry.icon)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{entry.action}</h4>
                          <span className="text-sm text-gray-500">{formatTimestamp(entry.timestamp)}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{entry.details}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">by {entry.user}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(entry.stage)}`}>
                            {entry.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Next Steps</h4>
                <div className="space-y-2">
                  {document.status === 'created' && (
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Send size={14} />
                      <span className="text-sm">Share document with parties</span>
                    </div>
                  )}
                  {document.status === 'shared' && (
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Shield size={14} />
                      <span className="text-sm">Wait for OTP verification</span>
                    </div>
                  )}
                  {document.status === 'otp_verified' && (
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Award size={14} />
                      <span className="text-sm">Proceed with e-signature</span>
                    </div>
                  )}
                  {document.status === 'e-sign_pending' && (
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Crown size={14} />
                      <span className="text-sm">Complete final processing</span>
                    </div>
                  )}
                  {document.status === 'completed' && (
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle size={14} />
                      <span className="text-sm">Document processing completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <Eye size={14} />
                    <span>Full Screen</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                <div 
                  className="bg-white p-6 rounded-lg shadow-sm max-h-96 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: generateDocumentPreview() }}
                />
              </div>
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Sharing Information</h3>
              
              {/* Sharing Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Sharing Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{document.shared_channels.length}</div>
                    <div className="text-sm text-gray-600">Channels Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {document.tracking_history?.filter((h: any) => h.action.includes('Shared')).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Times Shared</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {document.tracking_history?.filter((h: any) => h.action.includes('Viewed')).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Times Viewed</div>
                  </div>
                </div>
              </div>

              {/* Sharing History */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Sharing History</h4>
                {document.tracking_history?.filter((h: any) => h.action.includes('Shared')).map((entry: any) => (
                  <div key={entry.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStageColor(entry.stage)}`}>
                          {getActionIcon(entry.icon)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{entry.action}</div>
                          <div className="text-sm text-gray-600">{entry.details}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{formatTimestamp(entry.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Share Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Share</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <MessageCircle className="text-green-600" size={20} />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">WhatsApp</div>
                      <div className="text-sm text-gray-600">Send via WhatsApp</div>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="text-blue-600" size={20} />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-sm text-gray-600">Send via Email</div>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Phone className="text-purple-600" size={20} />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">SMS</div>
                      <div className="text-sm text-gray-600">Send via SMS</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {formatTimestamp(document.updated_at)}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewModal;