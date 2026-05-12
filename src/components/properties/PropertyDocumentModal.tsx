
import React, { useEffect, useState } from 'react';
import {
  X,
  Save,
  FileText,
  Plus,
  Eye,
  Share,
  Shield,
  CheckCircle,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Percent,
  Clock
} from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

type Property = {
  title?: string;
  propertyId?: string | number;
  seller?: {
    name?: string;
    phone?: string;
    email?: string;
  } | null;
  address?: string;
  unitType?: string;
  carpetArea?: string | number;
  location?: string;
  city?: string;
};

type DocumentData = {
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  property_address: string;
  property_type: string;
  property_area: string | number;
  commission_rate: string;
  validity_period: string;
  agreement_date: string;
  document_type?: string;
  template_id?: string;
};

type DocumentType = {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  requiredFields: (keyof DocumentData)[];
  process: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
};

const documentTypes: DocumentType[] = [
  {
    id: 'mandate_agreement',
    name: 'Exclusive Mandate Agreement',
    description: 'Exclusive selling rights agreement',
    category: 'agency',
    template: 'mandate_template',
    requiredFields: ['seller_name', 'property_address', 'commission_rate', 'validity_period'],
    process: [
      'Create document with property details',
      'Send to seller for review',
      'OTP verification',
      'Digital signature with Aadhaar OTP',
      'Document completion and filing'
    ]
  },
  {
    id: 'authorization_letter',
    name: 'Selling Authorization Letter',
    description: 'Authorization to sell property',
    category: 'agency',
    template: 'authorization_template',
    requiredFields: ['seller_name', 'property_address', 'commission_rate'],
    process: [
      'Generate authorization letter',
      'Share with seller',
      'Get signed copy',
      'Verify and file'
    ]
  },
  {
    id: 'marketing_rights',
    name: 'Marketing Rights Letter',
    description: 'Rights to market the property',
    category: 'agency',
    template: 'marketing_template',
    requiredFields: ['seller_name', 'property_address', 'validity_period'],
    process: [
      'Create marketing rights document',
      'Seller approval',
      'Marketing authorization',
      'Active marketing'
    ]
  },
  {
    id: 'brokerage_confirmation',
    name: 'Brokerage Confirmation Letter',
    description: 'Brokerage terms confirmation',
    category: 'financial',
    template: 'brokerage_template',
    requiredFields: ['seller_name', 'commission_rate', 'property_address'],
    process: [
      'Generate brokerage terms',
      'Seller confirmation',
      'Terms agreement',
      'Commission structure finalized'
    ]
  }
];

const defaultDocumentData = (property: Property | null): DocumentData => ({
  seller_name: property?.seller?.name ?? '',
  seller_phone: property?.seller?.phone ?? '',
  seller_email: property?.seller?.email ?? '',
  property_address: property?.address ?? '',
  property_type: property?.unitType ?? '',
  property_area: property?.carpetArea ?? '',
  commission_rate: '2',
  validity_period: '6 months',
  agreement_date: new Date().toISOString().split('T')[0]
});

const PropertyDocumentModal: React.FC<Props> = ({ isOpen, onClose, property }) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [documentData, setDocumentData] = useState<DocumentData>(defaultDocumentData(property ?? null));
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDocumentData(defaultDocumentData(property ?? null));
      setSelectedDocumentType('');
    }
  }, [isOpen, property]);

  if (!isOpen) return null;

  const handleDocumentTypeSelect = (docType: DocumentType) => {
    setSelectedDocumentType(docType.id);
    setDocumentData(prev => ({
      ...prev,
      document_type: docType.id,
      template_id: docType.template
    }));
  };

  const handleInputChange = <K extends keyof DocumentData>(field: K, value: DocumentData[K]) => {
    setDocumentData(prev => ({ ...prev, [field]: value }));
  };

  const createDocument = async () => {
    if (!selectedDocumentType) {
      alert('Please select a document type');
      return;
    }

    const docType = documentTypes.find(d => d.id === selectedDocumentType);
    if (!docType) return;

    const missingFields = docType.requiredFields.filter(field =>
      !documentData[field] || (typeof documentData[field] === 'string' && (documentData[field] as string).trim() === '')
    );

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const newDocument = {
        id: Date.now(),
        title: `${docType.name} - ${property?.title ?? 'Property'}`,
        template_name: docType.name,
        template_id: docType.template,
        data: documentData,
        status: 'created',
        priority: 'high',
        created_by: 'Admin User',
        created_at: new Date().toISOString(),
        property_id: property?.propertyId,
        tracking_history: [
          {
            action: 'Document Created',
            timestamp: new Date().toISOString(),
            user: 'Admin User',
            details: `${docType.name} created for property ${property?.title ?? ''}`,
            stage: 'created',
            icon: 'FileText'
          }
        ]
      };

      alert('Document created successfully in Document Center!');
      startDocumentProcess(newDocument, docType);
    } catch (err) {
      console.error('Error creating document:', err);
      alert('Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  const startDocumentProcess = (document: any, docType: DocumentType) => {
    const shareMessage = `Dear ${documentData.seller_name || 'Seller'},\n\nYour ${docType.name} for property ${property?.title ?? ''} is ready for review.\n\nDocument ID: ${document.id}\nProperty: ${property?.title ?? ''}\nLocation: ${property?.location ?? ''}, ${property?.city ?? ''}\n\nPlease review and provide your approval.\n\nFor any queries, contact us at ${documentData.seller_phone || 'N/A'}\n\nBest regards,\nResaleExpert Team`;

    if (documentData.seller_phone) {
      const phone = documentData.seller_phone.replace(/\D/g, '');
      if (phone) {
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    }

    if (documentData.seller_email) {
      const subject = `${docType.name} - ${property?.title ?? ''}`;
      const mailtoUrl = `mailto:${documentData.seller_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`;
      window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
    }

    alert('Document shared with seller via available channels (WhatsApp / Email).');
  };

  const selectedDocType = documentTypes.find(d => d.id === selectedDocumentType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div>
            <h2 className="text-sm font-bold text-white">Create Property Documents</h2>
            <p className="text-[10px] text-white/70">{property?.title ?? 'Property'} - Legal & Authorization</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 ">
            
            {/* Left Column - Document Types */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold" style={{ color: N }}>Select Document Type</h3>
              
              <div className="space-y-1.5">
                {documentTypes.map((docType) => (
                  <button
                    key={docType.id}
                    onClick={() => handleDocumentTypeSelect(docType)}
                    className={`w-full p-2 rounded-lg border transition-all text-left ${
                      selectedDocumentType === docType.id ? 'ring-1' : ''
                    }`}
                    style={{
                      borderColor: selectedDocumentType === docType.id ? O : BD,
                      background: selectedDocumentType === docType.id ? `${O}10` : BG
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded" style={{ background: `${O}15` }}>
                        <FileText size={12} style={{ color: O }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold" style={{ color: selectedDocumentType === docType.id ? O : N }}>
                          {docType.name}
                        </div>
                        <div className="text-[9px] mt-0.5" style={{ color: MU }}>{docType.description}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1 py-0.5 rounded text-[8px] font-medium" style={{ background: `${N}10`, color: N }}>
                            {docType.category}
                          </span>
                          <span className="text-[8px]" style={{ color: MU }}>{docType.process.length} steps</span>
                        </div>
                      </div>
                      <ChevronRight size={12} style={{ color: selectedDocumentType === docType.id ? O : MU }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Document Details */}
            <div className="space-y-3 mt-7">
              {selectedDocumentType && selectedDocType ? (
                <>
                  {/* Document Process */}
                  <div className="rounded-lg border p-2.5" style={{ borderColor: BD }}>
                    <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Document Process</h3>
                    <div className="space-y-1.5">
                      {selectedDocType.process.map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: O }}>
                            {index + 1}
                          </div>
                          <span className="text-[10px]" style={{ color: MU }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Information */}
                  <div className="rounded-lg border p-2.5" style={{ borderColor: BD }}>
                    <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Document Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Seller Name</label>
                        <div className="flex items-center gap-1.5">
                          <User size={11} style={{ color: O }} />
                          <input
                            type="text"
                            value={documentData.seller_name}
                            onChange={(e) => handleInputChange('seller_name', e.target.value)}
                            className="flex-1 px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                            style={{ borderColor: BD }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Seller Phone</label>
                        <div className="flex items-center gap-1.5">
                          <Phone size={11} style={{ color: O }} />
                          <input
                            type="tel"
                            value={documentData.seller_phone}
                            onChange={(e) => handleInputChange('seller_phone', e.target.value)}
                            className="flex-1 px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                            style={{ borderColor: BD }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Seller Email</label>
                        <div className="flex items-center gap-1.5">
                          <Mail size={11} style={{ color: O }} />
                          <input
                            type="email"
                            value={documentData.seller_email}
                            onChange={(e) => handleInputChange('seller_email', e.target.value)}
                            className="flex-1 px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                            style={{ borderColor: BD }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Property Address</label>
                        <div className="flex items-start gap-1.5">
                          <MapPin size={11} style={{ color: O }} className="mt-1" />
                          <textarea
                            value={documentData.property_address}
                            onChange={(e) => handleInputChange('property_address', e.target.value)}
                            className="flex-1 px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1 resize-none"
                            style={{ borderColor: BD }}
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>
                            <Percent size={10} className="inline mr-0.5" /> Commission (%)
                          </label>
                          <input
                            type="number"
                            value={documentData.commission_rate}
                            onChange={(e) => handleInputChange('commission_rate', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                            style={{ borderColor: BD }}
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>
                            <Clock size={10} className="inline mr-0.5" /> Validity
                          </label>
                          <select
                            value={documentData.validity_period}
                            onChange={(e) => handleInputChange('validity_period', e.target.value)}
                            className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                            style={{ borderColor: BD }}
                          >
                            <option value="3 months">3 months</option>
                            <option value="6 months">6 months</option>
                            <option value="1 year">1 year</option>
                            <option value="2 years">2 years</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>
                          <Calendar size={10} className="inline mr-0.5" /> Agreement Date
                        </label>
                        <input
                          type="date"
                          value={documentData.agreement_date}
                          onChange={(e) => handleInputChange('agreement_date', e.target.value)}
                          className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                          style={{ borderColor: BD }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Features */}
                  <div className="rounded-lg p-2.5" style={{ background: `${O}08`, border: `1px solid ${O}20` }}>
                    <h4 className="text-[10px] font-semibold mb-1.5" style={{ color: O }}>Document Features</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Shield size={10} style={{ color: O }} />
                        <span className="text-[9px]" style={{ color: MU }}>Aadhaar OTP verification</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={10} style={{ color: O }} />
                        <span className="text-[9px]" style={{ color: MU }}>Digital signature support</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Share size={10} style={{ color: O }} />
                        <span className="text-[9px]" style={{ color: MU }}>Multi-channel sharing</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye size={10} style={{ color: O }} />
                        <span className="text-[9px]" style={{ color: MU }}>Real-time tracking</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 rounded-lg border" style={{ borderColor: BD, background: BG }}>
                  <FileText size={32} style={{ color: MU }} className="mx-auto mb-2" />
                  <h3 className="text-[11px] font-semibold mb-1" style={{ color: N }}>Select Document Type</h3>
                  <p className="text-[9px]" style={{ color: MU }}>Choose the type of document you want to create</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: BD, background: BG }}>
          <div className="text-[9px]" style={{ color: MU }}>
            {selectedDocumentType ? 'Document will be created in Document Center' : 'Select document type to continue'}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="px-2 py-1 text-[10px] border rounded transition-colors hover:bg-gray-50"
              style={{ borderColor: BD, color: N }}
            >
              Cancel
            </button>
            <button
              onClick={createDocument}
              disabled={!selectedDocumentType || isCreating}
              className="px-2 py-1 text-[10px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: O }}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-2 w-2 border-2 border-white border-t-transparent" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={10} />
                  <span>Create</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User icon component
const User = ({ size = 12, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default PropertyDocumentModal;