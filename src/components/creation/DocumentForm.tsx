import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Share,
  FileText,
  X,
  Users,
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Shield,
  User,
} from 'lucide-react';

// external child components — keep as "any" so file compiles if these are not typed yet
import DocumentPreview from './DocumentPreview';
import ClientSelector from './ClientSelector';
import PropertySelector from './PropertySelector';
import VariablePanel from './VariablePanel';
import PaymentTracker from './PaymentTracker';


type Template = {
  id: number | string;
  name: string;
  category?: string;
  variables: string[];
};

type Party = {
  id?: string | number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  [k: string]: any;
};

type PropertyType = {
  id?: string | number;
  title?: string;
  address?: string;
  type?: string;
  area?: string | number;
  unitNo?: string;
  society?: string;
  [k: string]: any;
};

type DocumentFormProps = {
  template?: Template;
  documentData?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
  onBack?: () => void;
};

const defaultTemplate: Template = {
  id: 1,
  name: 'Sale Agreement',
  category: 'Agreement',
  variables: [
    'seller_name',
    'buyer_name',
    'property_address',
    'sale_amount',
    'token_amount',
    'booking_amount',
    'commission_rate',
    'validity_period',
    'agreement_date',
    'possession_date',
  ],
};

const DocumentForm: React.FC<DocumentFormProps> = ({
  template = defaultTemplate,
  documentData = {},
  onDataChange = () => {},
  onBack = () => {},
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    title: '',
    seller: null as Party | null,
    buyer: null as Party | null,
    property: null as PropertyType | null,
    document_id: '',
    document_date: new Date().toISOString().split('T')[0],
    sales_executive: 'Admin User',
    executive_id: 'EXE001',
    executive_phone: '+91 99999 99999',
    executive_email: 'admin@resaleexpert.com',
    ...documentData,
  });

  const [showSellerSelector, setShowSellerSelector] = useState(false);
  const [showBuyerSelector, setShowBuyerSelector] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [showVariablePanel, setShowVariablePanel] = useState(true);
  const [showPaymentTracker, setShowPaymentTracker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    { id: 1, label: 'Parties', icon: Users, description: 'Select seller and buyer' },
    { id: 2, label: 'Property', icon: Building, description: 'Choose property details' },
    { id: 3, label: 'Document', icon: FileText, description: 'Fill document data' },
    { id: 4, label: 'Review', icon: Eye, description: 'Preview and finalize' },
  ];

  // Generate a simple document id when template changes (if none provided)
  useEffect(() => {
    if (!formData.document_id) {
      const prefix = (template?.category ?? 'DOC').toString().toUpperCase().slice(0, 3);
      const timestamp = Date.now().toString().slice(-6);
      setFormData((prev) => ({ ...prev, document_id: `${prefix}${timestamp}` }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]);

  // Auto-generate title using parties when available
  useEffect(() => {
    if (template && formData.seller && formData.buyer) {
      const title = `${template.name} - ${formData.seller.name} to ${formData.buyer.name}`;
      setFormData((prev) => ({ ...prev, title }));
    } else if (template && formData.seller) {
      const title = `${template.name} - ${formData.seller.name}`;
      setFormData((prev) => ({ ...prev, title }));
    }
  }, [template, formData.seller, formData.buyer]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      onDataChange?.(next);
      return next;
    });
  };

  const handleSellerSelect = (seller: Party) => {
    setFormData((prev) => ({
      ...prev,
      seller,
      seller_name: seller.name,
      seller_phone: seller.phone,
      seller_email: seller.email,
      seller_address: seller.address,
    }));
    setShowSellerSelector(false);
  };

  const handleBuyerSelect = (buyer: Party) => {
    setFormData((prev) => ({
      ...prev,
      buyer,
      buyer_name: buyer.name,
      buyer_phone: buyer.phone,
      buyer_email: buyer.email,
      buyer_address: buyer.address,
    }));
    setShowBuyerSelector(false);
  };

  const handlePropertySelect = (prop: PropertyType) => {
    setFormData((prev) => ({
      ...prev,
      property: prop,
      property_address: prop.address,
      property_type: prop.type,
      property_area: prop.area,
      unit_number: prop.unitNo,
      society_name: prop.society,
    }));
    setShowPropertySelector(false);
  };

  const handleVariableInsert = (variable: { name: string }) => {
    // Hook used by variable panel (placeholder action)
    alert(`Variable ${variable.name} inserted into document!`);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draftData = {
        id: Date.now().toString(),
        title: formData.title || `${template.name} - Draft`,
        templateId: template.id,
        templateName: template.name,
        data: formData,
        savedAt: new Date().toISOString(),
        status: 'draft',
      };

      const existingDrafts = JSON.parse(localStorage.getItem('documentDrafts') || '[]');
      const updatedDrafts = [...existingDrafts, draftData];
      localStorage.setItem('documentDrafts', JSON.stringify(updatedDrafts));
      window.dispatchEvent(new CustomEvent('draftsUpdated'));
      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDocument = async () => {
    if (!formData.seller) {
      alert('Please select a seller');
      return;
    }
    if (!formData.buyer && template.variables.includes('buyer_name')) {
      alert('Please select a buyer');
      return;
    }

    setIsGenerating(true);
    try {
      // simulate
      await new Promise((r) => setTimeout(r, 1200));
      const documentDataOutput = {
        id: Date.now(),
        title: formData.title,
        template_id: template.id,
        template_name: template.name,
        data: formData,
        status: 'created',
        priority: 'medium',
        created_by: 'Current User',
        assigned_to: formData.sales_executive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      console.log('Generated document:', documentDataOutput);
      alert('Document generated successfully!');
      // Real app: call backend and redirect / open tracking view
    } catch (err) {
      console.error('Error generating document:', err);
      alert('Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!formData.seller) {
      alert('Please complete the document first');
      return;
    }
    console.log('Sharing document:', formData);
    alert('Document shared successfully!');
  };

  const isStepComplete = (stepId: number) => {
    switch (stepId) {
      case 1:
        return Boolean(formData.seller) && (!template.variables.includes('buyer_name') || Boolean(formData.buyer));
      case 2:
        return Boolean(formData.property) || !template.variables.includes('property_address');
      case 3:
        return Boolean(formData.title) && Boolean(formData.document_date);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const canProceedToStep = (stepId: number) => {
    for (let i = 1; i < stepId; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-xs">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" type="button">
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Create Document</h1>
              <p className="text-gray-600 mt-1">Template: {template.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              type="button"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              type="button"
            >
              <Share size={14} />
              <span>Share</span>
            </button>

            <button
              onClick={handleGenerateDocument}
              disabled={isGenerating || !formData.seller}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <FileText size={14} />
              <span>{isGenerating ? 'Generating...' : 'Generate Document'}</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = isStepComplete(step.id);
              const canAccess = canProceedToStep(step.id);

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => canAccess && setActiveStep(step.id)}
                    disabled={!canAccess}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isCompleted
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : canAccess
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive ? 'bg-blue-200' : isCompleted ? 'bg-green-200' : 'bg-gray-200'
                      }`}
                    >
                      <Icon size={12} />
                    </div>

                    <div className="text-left">
                      <div className="font-medium">{step.label}</div>
                      <div className="opacity-75">{step.description}</div>
                    </div>

                    {isCompleted && <CheckCircle className="text-green-600" size={12} />}
                  </button>

                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-1 ${isStepComplete(step.id) ? 'bg-green-300' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {activeStep === 1 && (
            <PartiesStep
              formData={formData}
              onInputChange={handleInputChange}
              onSellerSelect={() => setShowSellerSelector(true)}
              onBuyerSelect={() => setShowBuyerSelector(true)}
              template={template}
              showVariablePanel={showVariablePanel}
              setShowVariablePanel={setShowVariablePanel}
              handleVariableInsert={handleVariableInsert}
            />
          )}

          {activeStep === 2 && (
            <PropertyStep
              formData={formData}
              onInputChange={handleInputChange}
              onPropertySelect={() => setShowPropertySelector(true)}
              template={template}
              onContinue={() => setActiveStep(3)}
            />
          )}

          {activeStep === 3 && <DocumentStep formData={formData} onInputChange={handleInputChange} template={template} />}

          {activeStep === 4 && (
            <ReviewStep formData={formData} template={template} onShowPayments={() => setShowPaymentTracker(true)} />
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 text-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
              disabled={activeStep === 1}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={12} />
              <span>Previous</span>
            </button>

            {!showVariablePanel && activeStep === 1 && (
              <button
                type="button"
                onClick={() => setShowVariablePanel(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Eye size={12} />
                <span>Show Preview</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-gray-500">
              Step {activeStep} of {steps.length} • {template.name}
            </div>

            {activeStep < steps.length ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(prev + 1, steps.length))}
                disabled={!isStepComplete(activeStep)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowLeft size={12} className="rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerateDocument}
                disabled={isGenerating || !formData.seller}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={12} />
                <span>{isGenerating ? 'Generating...' : 'Generate Document'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSellerSelector && (
        <ClientSelector title="Select Seller" onSelect={handleSellerSelect} onClose={() => setShowSellerSelector(false)} />
      )}

      {showBuyerSelector && (
        <ClientSelector title="Select Buyer" onSelect={handleBuyerSelect} onClose={() => setShowBuyerSelector(false)} />
      )}

      {showPropertySelector && (
        <PropertySelector title="Select Property" onSelect={handlePropertySelect} onClose={() => setShowPropertySelector(false)} />
      )}

      {showPaymentTracker && (
        <PaymentTrackerModal
          isOpen={showPaymentTracker}
          onClose={() => setShowPaymentTracker(false)}
          documentData={formData}
          onDataChange={handleInputChange}
        />
      )}
    </div>
  );
};

/* --------------------------
   Step components (internal)
   -------------------------- */

type PartiesStepProps = {
  formData: Record<string, any>;
  onInputChange: (field: string, value: any) => void;
  onSellerSelect: () => void;
  onBuyerSelect: () => void;
  template: Template;
  showVariablePanel: boolean;
  setShowVariablePanel: (v: boolean) => void;
  handleVariableInsert: (v: { name: string }) => void;
};

const PartiesStep: React.FC<PartiesStepProps> = ({
  formData,
  onInputChange,
  onSellerSelect,
  onBuyerSelect,
  template,
  showVariablePanel,
  setShowVariablePanel,
  handleVariableInsert,
}) => {
  const requiresBuyer = template.variables.includes('buyer_name');

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="font-bold text-gray-900 mb-2">Select Parties</h2>
        <p className="text-gray-600">Choose the seller and buyer for this document</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <User className="mr-2" size={16} />
            Seller Information <span className="ml-2 text-red-500">*</span>
          </h3>

          {formData.seller ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="text-green-600" size={18} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{formData.seller.name}</div>
                  <div className="text-gray-600">{formData.seller.phone}</div>
                  <div className="text-gray-600">{formData.seller.email}</div>
                </div>
              </div>
              <button type="button" onClick={onSellerSelect} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Change Seller
              </button>
            </div>
          ) : (
            <button type="button" onClick={onSellerSelect} className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
              <div className="text-center">
                <User className="mx-auto text-gray-400 mb-2" size={24} />
                <div className="font-medium text-gray-900">Select Seller</div>
                <div className="text-gray-500">Choose from existing clients or add new</div>
              </div>
            </button>
          )}
        </div>

        {requiresBuyer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="mr-2" size={16} />
              Buyer Information <span className="ml-2 text-red-500">*</span>
            </h3>

            {formData.buyer ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="text-green-600" size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{formData.buyer.name}</div>
                    <div className="text-gray-600">{formData.buyer.phone}</div>
                    <div className="text-gray-600">{formData.buyer.email}</div>
                  </div>
                </div>
                <button type="button" onClick={onBuyerSelect} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Change Buyer
                </button>
              </div>
            ) : (
              <button type="button" onClick={onBuyerSelect} className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
                <div className="text-center">
                  <Users className="mx-auto text-gray-400 mb-2" size={24} />
                  <div className="font-medium text-gray-900">Select Buyer</div>
                  <div className="text-gray-500">Choose from existing clients or add new</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="mr-2" size={16} />
          Sales Executive Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Executive Name</label>
            <input type="text" value={formData.sales_executive} onChange={(e) => onInputChange('sales_executive', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Executive ID</label>
            <input type="text" value={formData.executive_id} onChange={(e) => onInputChange('executive_id', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Executive Phone</label>
            <input type="tel" value={formData.executive_phone} onChange={(e) => onInputChange('executive_phone', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Executive Email</label>
            <input type="email" value={formData.executive_email} onChange={(e) => onInputChange('executive_email', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" />
          </div>
        </div>
      </div>

      {showVariablePanel && (
        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <DocumentPreview template={template} documentData={formData} isVisible={true} />
          </div>

          <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Variables</h3>
              <button type="button" onClick={() => setShowVariablePanel(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <VariablePanel onVariableInsert={handleVariableInsert} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type PropertyStepProps = {
  formData: Record<string, any>;
  onInputChange: (field: string, value: any) => void;
  onPropertySelect: () => void;
  template: Template;
  onContinue: () => void;
};

const PropertyStep: React.FC<PropertyStepProps> = ({ formData, onInputChange, onPropertySelect, template, onContinue }) => {
  const requiresProperty = template.variables.includes('property_address');

  if (!requiresProperty) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Not Required</h3>
          <p className="text-gray-500">This template doesn't require property information</p>
          <button type="button" onClick={onContinue} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Continue to Next Step
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Property Information</h2>
        <p className="text-gray-600">Select or enter property details for this document</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="mr-2" size={20} />
          Property Details <span className="ml-2 text-red-500">*</span>
        </h3>

        {formData.property ? (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Building className="text-green-600" size={24} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{formData.property.title}</div>
                <div className="text-sm text-gray-600">{formData.property.address}</div>
                <div className="text-sm text-gray-600">{formData.property.type} • {formData.property.area}</div>
              </div>
            </div>
            <button type="button" onClick={onPropertySelect} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Change Property
            </button>
          </div>
        ) : (
          <button type="button" onClick={onPropertySelect} className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
            <div className="text-center">
              <Building className="mx-auto text-gray-400 mb-2" size={32} />
              <div className="font-medium text-gray-900">Select Property</div>
              <div className="text-sm text-gray-500">Choose from existing properties or add new</div>
            </div>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Or Enter Property Details Manually</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Property Address</label>
            <textarea value={formData.property_address || ''} onChange={(e) => onInputChange('property_address', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" rows={2} placeholder="Enter complete property address" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Property Type</label>
            <select value={formData.property_type || ''} onChange={(e) => onInputChange('property_type', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs">
              <option value="">Select type</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Commercial">Commercial</option>
              <option value="Plot">Plot</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Property Area (sq ft)</label>
            <input type="number" value={formData.property_area || ''} onChange={(e) => onInputChange('property_area', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" placeholder="e.g., 1250" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Unit Number</label>
            <input type="text" value={formData.unit_number || ''} onChange={(e) => onInputChange('unit_number', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" placeholder="e.g., A-404" />
          </div>
        </div>
      </div>
    </div>
  );
};

type DocumentStepProps = {
  formData: Record<string, any>;
  onInputChange: (field: string, value: any) => void;
  template: Template;
};

const DocumentStep: React.FC<DocumentStepProps> = ({ formData, onInputChange, template }) => {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Document Information</h2>
        <p className="text-gray-600">Fill in the document details and financial information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
          <FileText className="mr-2" size={16} />
          Document Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Document Title</label>
            <input type="text" value={formData.title} onChange={(e) => onInputChange('title', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Enter document title" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Document ID</label>
            <input type="text" value={formData.document_id} readOnly className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-xs" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Document Date</label>
            <input type="date" value={formData.document_date} onChange={(e) => onInputChange('document_date', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" />
          </div>
        </div>
      </div>

      {(template.variables.includes('sale_amount') ||
        template.variables.includes('token_amount') ||
        template.variables.includes('booking_amount')) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <DollarSign className="mr-2" size={16} />
            Financial Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {template.variables.includes('sale_amount') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Sale Amount (₹)</label>
                <input type="number" value={formData.sale_amount || ''} onChange={(e) => onInputChange('sale_amount', Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" placeholder="25000000" />
              </div>
            )}

            {template.variables.includes('token_amount') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Token Amount (₹)</label>
                <input type="number" value={formData.token_amount || ''} onChange={(e) => onInputChange('token_amount', Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" placeholder="500000" />
              </div>
            )}

            {template.variables.includes('booking_amount') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Booking Amount (₹)</label>
                <input type="number" value={formData.booking_amount || ''} onChange={(e) => onInputChange('booking_amount', Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" placeholder="1000000" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {template.variables.includes('commission_rate') && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Commission Rate (%)</label>
              <input type="number" value={formData.commission_rate || ''} onChange={(e) => onInputChange('commission_rate', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" placeholder="2" step="0.1" />
            </div>
          )}

          {template.variables.includes('validity_period') && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Validity Period</label>
              <input type="text" value={formData.validity_period || ''} onChange={(e) => onInputChange('validity_period', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" placeholder="6 months" />
            </div>
          )}

          {template.variables.includes('agreement_date') && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Agreement Date</label>
              <input type="date" value={formData.agreement_date || ''} onChange={(e) => onInputChange('agreement_date', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" />
            </div>
          )}

          {template.variables.includes('possession_date') && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Possession Date</label>
              <input type="date" value={formData.possession_date || ''} onChange={(e) => onInputChange('possession_date', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type ReviewStepProps = {
  formData: Record<string, any>;
  template: Template;
  onShowPayments: () => void;
};

const ReviewStep: React.FC<ReviewStepProps> = ({ formData, template, onShowPayments }) => {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Review & Finalize</h2>
        <p className="text-gray-600">Review all information before generating the document</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pt-1">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Document Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-600">Template:</span><span className="font-medium">{template.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Title:</span><span className="font-medium">{formData.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Document ID:</span><span className="font-medium">{formData.document_id}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium">{formData.document_date}</span></div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Parties Information</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-600">Seller:</span><span className="font-medium">{formData.seller?.name}</span></div>
              {formData.buyer && <div className="flex justify-between"><span className="text-gray-600">Buyer:</span><span className="font-medium">{formData.buyer?.name}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Executive:</span><span className="font-medium">{formData.sales_executive}</span></div>
            </div>
          </div>
        </div>
      </div>

      {formData.property && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pt-1">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Property Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><span className="text-gray-600">Address:</span><div className="font-medium">{formData.property_address}</div></div>
            <div><span className="text-gray-600">Type:</span><div className="font-medium">{formData.property_type}</div></div>
            <div><span className="text-gray-600">Area:</span><div className="font-medium">{formData.property_area} sq ft</div></div>
          </div>
        </div>
      )}

      {(formData.sale_amount || formData.token_amount || formData.booking_amount) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pt-1 ">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Financial Summary</h3>
            <button type="button" onClick={onShowPayments} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
              <CreditCard size={14} />
              <span>Payment Tracking</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formData.sale_amount && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">₹{(Number(formData.sale_amount) / 100000).toFixed(1)}L</div>
                <div className="text-xs text-green-700">Sale Amount</div>
              </div>
            )}

            {formData.token_amount && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">₹{(Number(formData.token_amount) / 100000).toFixed(1)}L</div>
                <div className="text-xs text-blue-700">Token Amount</div>
              </div>
            )}

            {formData.booking_amount && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">₹{(Number(formData.booking_amount) / 100000).toFixed(1)}L</div>
                <div className="text-xs text-purple-700">Booking Amount</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pt-1">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Pre-Generation Checklist</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">{formData.seller ? <CheckCircle className="text-green-600" size={16} /> : <AlertCircle className="text-red-600" size={16} />}<span className={formData.seller ? 'text-green-700' : 'text-red-700'}>Seller information is complete</span></div>

          {template.variables.includes('buyer_name') && (<div className="flex items-center space-x-2">{formData.buyer ? <CheckCircle className="text-green-600" size={16} /> : <AlertCircle className="text-red-600" size={16} />}<span className={formData.buyer ? 'text-green-700' : 'text-red-700'}>Buyer information is complete</span></div>)}

          {template.variables.includes('property_address') && (<div className="flex items-center space-x-2">{formData.property_address ? <CheckCircle className="text-green-600" size={16} /> : <AlertCircle className="text-red-600" size={16} />}<span className={formData.property_address ? 'text-green-700' : 'text-red-700'}>Property information is complete</span></div>)}

          <div className="flex items-center space-x-2">{formData.title && formData.document_date ? <CheckCircle className="text-green-600" size={16} /> : <AlertCircle className="text-red-600" size={16} />}<span className={formData.title && formData.document_date ? 'text-green-700' : 'text-red-700'}>Document details are complete</span></div>
        </div>
      </div>
    </div>
  );
};

/* Payment Tracker Modal (simple wrapper) */
type PaymentTrackerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  documentData: Record<string, any>;
  onDataChange: (field: string, value: any) => void;
};

const PaymentTrackerModal: React.FC<PaymentTrackerModalProps> = ({ isOpen, onClose, documentData, onDataChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Payment Tracking</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <PaymentTracker documentData={documentData} onDataChange={onDataChange} />
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
