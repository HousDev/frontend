
import React, { CSSProperties, useState } from 'react';
import { X, Save, CreditCard, User, Building, DollarSign, FileText, CheckCircle, AlertCircle, Calculator, Percent, TrendingUp, Award, Shield, Clock, Phone, Mail, MapPin } from 'lucide-react';

const LoanApplicationModal = ({ isOpen, onClose, buyer, onUpdateBuyer }: any) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    applicantName: buyer.name,
    applicantPhone: buyer.phone,
    applicantEmail: buyer.email,
    dateOfBirth: '',
    panNumber: '',
    aadharNumber: '',
    maritalStatus: 'single',
    
    // Co-applicant Information
    hasCoApplicant: false,
    coApplicantName: '',
    coApplicantPhone: '',
    coApplicantEmail: '',
    coApplicantDOB: '',
    coApplicantPAN: '',
    coApplicantRelation: 'spouse',
    
    // Employment Information
    employmentType: 'salaried',
    companyName: '',
    designation: '',
    workExperience: '',
    monthlyIncome: buyer.financials?.monthlyIncome || 0,
    otherIncome: 0,
    
    // Co-applicant Employment
    coApplicantEmploymentType: 'salaried',
    coApplicantCompany: '',
    coApplicantIncome: 0,
    
    // Loan Information
    loanAmount: buyer.financials?.loanAmount || 0,
    loanTenure: 240, // months
    propertyValue: buyer.budget.max,
    downPayment: buyer.financials?.downPayment || 0,
    loanPurpose: 'home_purchase',
    
    // Bank Preference
    preferredBank: buyer.financials?.bankPreference || 'HDFC Bank',
    
    // Property Information
    propertyType: buyer.requirements.propertyType,
    propertyLocation: buyer.requirements.preferredLocations[0] || buyer.location,
    propertyStatus: buyer.requirements.possession,
    
    // Financial Information
    existingLoans: [],
    creditCards: [],
    investments: [],
    
    // Documents
    documents: {
      salarySlips: false,
      bankStatements: false,
      itr: false,
      formSixteen: false,
      panCard: false,
      aadharCard: false,
      propertyDocuments: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const steps = [
    { id: 1, label: 'Personal Info', icon: User },
    { id: 2, label: 'Employment', icon: Building },
    { id: 3, label: 'Loan Details', icon: CreditCard },
    { id: 4, label: 'Documents', icon: FileText },
    { id: 5, label: 'Review', icon: CheckCircle }
  ];

  const banks = [
    { name: 'HDFC Bank', rate: 8.5, processing: 0.5, features: ['Quick approval', 'Digital process', 'Flexible tenure'] },
    { name: 'ICICI Bank', rate: 8.7, processing: 0.5, features: ['Pre-approved offers', 'Online tracking', 'Doorstep service'] },
    { name: 'SBI', rate: 8.4, processing: 0.25, features: ['Lowest rates', 'Government backing', 'Wide network'] },
    { name: 'Axis Bank', rate: 8.8, processing: 0.5, features: ['Quick disbursal', 'Flexible EMI', 'Premium service'] },
    { name: 'Kotak Bank', rate: 8.6, processing: 0.5, features: ['Digital experience', 'Quick approval', 'Relationship benefits'] }
  ];

  const employmentTypes = [
    { value: 'salaried', label: 'Salaried' },
    { value: 'self_employed', label: 'Self Employed' },
    { value: 'business', label: 'Business Owner' },
    { value: 'professional', label: 'Professional' }
  ];

  const maritalStatuses = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ];

  const relations = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' }
  ];

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const calculateEligibility = () => {
    const totalIncome = formData.monthlyIncome + (formData.hasCoApplicant ? formData.coApplicantIncome : 0);
    const maxEMI = totalIncome * 0.6; // 60% of income
    const selectedBank = banks.find(b => b.name === formData.preferredBank);
    const rate = selectedBank?.rate || 8.5;
    
    // Calculate max loan amount based on EMI capacity
    const monthlyRate = rate / (12 * 100);
    const maxLoanAmount = (maxEMI * (Math.pow(1 + monthlyRate, formData.loanTenure) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, formData.loanTenure));
    
    return {
      maxLoanAmount: Math.round(maxLoanAmount),
      maxEMI: Math.round(maxEMI),
      currentEMI: calculateEMI(formData.loanAmount, rate, formData.loanTenure),
      eligibilityRatio: (formData.loanAmount / maxLoanAmount) * 100
    };
  };

  const eligibility = calculateEligibility();

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate loan application submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update buyer with loan application data
      const updatedBuyer = {
        ...buyer,
        financials: {
          ...buyer.financials,
          loanRequired: true,
          loanAmount: formData.loanAmount,
          downPayment: formData.downPayment,
          monthlyIncome: formData.monthlyIncome,
          bankPreference: formData.preferredBank,
          loanStatus: 'applied',
          applicationDate: new Date().toISOString(),
          applicationId: `LA${Date.now()}`,
          eligibilityAmount: eligibility.maxLoanAmount
        }
      };
      
      onUpdateBuyer(updatedBuyer);
      alert('Loan application submitted successfully! You will receive updates on your registered email and phone.');
      onClose();
    } catch (error) {
      console.error('Error submitting loan application:', error);
      alert('Failed to submit loan application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="text-green-600" size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900">Home Loan Application</h2>
                <p className="text-gray-600 mt-0.5">Apply for home loan with best rates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-md"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-md ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`p-1 rounded-md ${
                      isActive 
                        ? 'bg-blue-200' 
                        : isCompleted
                        ? 'bg-green-200'
                        : 'bg-gray-200'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="font-medium">{step.label}</div>
                      <div className="text-[10px]">Step {step.id}</div>
                    </div>
                    {isCompleted && <CheckCircle className="text-green-600" size={14} />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 ${
                      isCompleted ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.applicantPhone}
                    onChange={(e) => handleInputChange('applicantPhone', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.applicantEmail}
                    onChange={(e) => handleInputChange('applicantEmail', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                    placeholder="1234 5678 9012"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Marital Status</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  >
                    {maritalStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Co-applicant */}
              <div className="border-t pt-4">
                <label className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.hasCoApplicant}
                    onChange={(e) => handleInputChange('hasCoApplicant', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-xs font-medium text-gray-700">Add Co-applicant (Spouse/Family member)</span>
                </label>

                {formData.hasCoApplicant && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Co-applicant Name</label>
                      <input
                        type="text"
                        value={formData.coApplicantName}
                        onChange={(e) => handleInputChange('coApplicantName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Relation</label>
                      <select
                        value={formData.coApplicantRelation}
                        onChange={(e) => handleInputChange('coApplicantRelation', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                      >
                        {relations.map((relation) => (
                          <option key={relation.value} value={relation.value}>
                            {relation.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.coApplicantPhone}
                        onChange={(e) => handleInputChange('coApplicantPhone', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number</label>
                      <input
                        type="text"
                        value={formData.coApplicantPAN}
                        onChange={(e) => handleInputChange('coApplicantPAN', e.target.value.toUpperCase())}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Employment Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-900">Employment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  >
                    {employmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Work Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.workExperience}
                    onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Other Income (₹)</label>
                  <input
                    type="number"
                    value={formData.otherIncome}
                    onChange={(e) => handleInputChange('otherIncome', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                    placeholder="Rental, investments, etc."
                  />
                </div>
              </div>

              {/* Co-applicant Employment */}
              {formData.hasCoApplicant && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Co-applicant Employment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Employment Type</label>
                      <select
                        value={formData.coApplicantEmploymentType}
                        onChange={(e) => handleInputChange('coApplicantEmploymentType', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                      >
                        {employmentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={formData.coApplicantCompany}
                        onChange={(e) => handleInputChange('coApplicantCompany', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={formData.coApplicantIncome}
                        onChange={(e) => handleInputChange('coApplicantIncome', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Loan Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-900">Loan Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Property Value (₹)</label>
                    <input
                      type="number"
                      value={formData.propertyValue}
                      onChange={(e) => handleInputChange('propertyValue', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Down Payment (₹)</label>
                    <input
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) => handleInputChange('downPayment', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Loan Tenure (Years)</label>
                    <select
                      value={formData.loanTenure / 12}
                      onChange={(e) => handleInputChange('loanTenure', Number(e.target.value) * 12)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 text-xs"
                    >
                      {[10, 15, 20, 25, 30].map((years) => (
                        <option key={years} value={years}>
                          {years} years
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Eligibility Calculator */}
                <div className="bg-blue-50 rounded-md p-3">
                  <h4 className="font-semibold text-blue-900 mb-2">Loan Eligibility</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Income:</span>
                      <span className="font-bold">{formatCurrency(formData.monthlyIncome + (formData.hasCoApplicant ? formData.coApplicantIncome : 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Max Eligible:</span>
                      <span className="font-bold text-green-600">{formatCurrency(eligibility.maxLoanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Requested:</span>
                      <span className="font-bold">{formatCurrency(formData.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">EMI:</span>
                      <span className="font-bold">{formatCurrency(eligibility.currentEMI)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          eligibility.eligibilityRatio <= 100 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(eligibility.eligibilityRatio, 100)}%` } as CSSProperties}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-700">
                      {eligibility.eligibilityRatio <= 100 ? 
                        'You are eligible for this loan amount' : 
                        'Loan amount exceeds eligibility. Consider reducing amount or adding co-applicant.'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Selection */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Select Bank</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {banks.slice(0, 4).map((bank) => (
                    <div
                      key={bank.name}
                      onClick={() => handleInputChange('preferredBank', bank.name)}
                      className={`border rounded-md p-3 cursor-pointer transition-all ${
                        formData.preferredBank === bank.name
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{bank.name}</h5>
                        <span className="text-green-600 font-bold">{bank.rate}%</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>Processing: {bank.processing}%</div>
                        <div>EMI: {formatCurrency(calculateEMI(formData.loanAmount, bank.rate, formData.loanTenure))}</div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {bank.features.map((feature, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-900">Required Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Income Documents</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'salarySlips', label: 'Last 3 Salary Slips' },
                      { key: 'bankStatements', label: 'Bank Statements (6 months)' },
                      { key: 'itr', label: 'ITR (Last 2 years)' },
                      { key: 'formSixteen', label: 'Form 16' }
                    ].map((doc) => (
                      <label key={doc.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.documents[doc.key as keyof typeof formData.documents]}
                          onChange={(e) => handleInputChange(`documents.${doc.key}`, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs text-gray-700">{doc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Identity Documents</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'panCard', label: 'PAN Card' },
                      { key: 'aadharCard', label: 'Aadhar Card' },
                      { key: 'propertyDocuments', label: 'Property Documents' }
                    ].map((doc) => (
                      <label key={doc.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.documents[doc.key as keyof typeof formData.documents]}
                          onChange={(e) => handleInputChange(`documents.${doc.key}`, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs text-gray-700">{doc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="text-yellow-600 mt-0.5" size={14} />
                  <div>
                    <h4 className="font-medium text-yellow-800">Document Requirements</h4>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      Please ensure all documents are clear, legible, and not older than 3 months. 
                      Digital copies are acceptable for initial application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-900">Review Application</h3>
              
              {/* Application Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Application Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Personal Details</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{formData.applicantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium">{formData.applicantPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium">{formData.applicantEmail}</span>
                      </div>
                      {formData.hasCoApplicant && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Co-applicant:</span>
                          <span className="font-medium">{formData.coApplicantName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Loan Details</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Loan Amount:</span>
                        <span className="font-medium">{formatCurrency(formData.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tenure:</span>
                        <span className="font-medium">{formData.loanTenure / 12} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank:</span>
                        <span className="font-medium">{formData.preferredBank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monthly EMI:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(eligibility.currentEMI)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Eligibility Status */}
              <div className={`rounded-lg p-4 ${
                eligibility.eligibilityRatio <= 100 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {eligibility.eligibilityRatio <= 100 ? (
                    <CheckCircle className="text-green-600" size={18} />
                  ) : (
                    <AlertCircle className="text-red-600" size={18} />
                  )}
                  <h4 className={`font-semibold ${
                    eligibility.eligibilityRatio <= 100 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {eligibility.eligibilityRatio <= 100 ? 'Loan Eligible' : 'Eligibility Exceeded'}
                  </h4>
                                  </div>
                <p className={`text-xs ${
                  eligibility.eligibilityRatio <= 100 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {eligibility.eligibilityRatio <= 100 ? 
                    `Your application meets the eligibility criteria. Maximum eligible amount: ${formatCurrency(eligibility.maxLoanAmount)}` : 
                    `Your requested loan amount exceeds eligibility by ${formatCurrency(formData.loanAmount - eligibility.maxLoanAmount)}. Consider reducing the loan amount.`
                  }
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="border rounded-lg p-3">
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    required
                  />
                  <span className="text-xs text-gray-700">
                    I hereby declare that all the information provided is true and correct to the best of my knowledge. 
                    I agree to the terms and conditions and authorize the bank to verify my details.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-md text-xs font-medium ${
                currentStep === 1
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-xs font-medium"
              >
                Cancel
              </button>
              
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium flex items-center space-x-1"
                >
                  <span>Next</span>
                  <TrendingUp size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || eligibility.eligibilityRatio > 100}
                  className={`px-4 py-2 rounded-md text-xs font-medium flex items-center space-x-1 ${
                    isSubmitting || eligibility.eligibilityRatio > 100
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Clock size={14} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationModal;