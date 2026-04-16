import React, { useState, useEffect } from 'react';
import {
  X, Save, Target, AlertCircle, CheckCircle, Pause, Trophy,
  MessageCircle, Clock, Calendar, User, DollarSign,
  IndianRupeeIcon
} from 'lucide-react';

import { masterDataAPI } from '@/lib/mastersAPI';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { HiCurrencyRupee } from 'react-icons/hi2';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

type Option = { value: string; label: string };

type Property = {
  id: string | number;
  title: string;
  status: string;
  budget: number | string;
  propertyId?: string;
};
type Props = {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onStatusUpdate?: (status: string, remarks: string, formData: any) => Promise<void> | void;
};

type FormState = {
  status: string;
  remarks: string;
  updateReason: string;
  effectiveDate: string;
  updatedBy: string;
  notifyParties: boolean;
  priceAdjustment: boolean;
  newPrice: number | '';
};

const EMPTY_FORM = (property?: Property | null): FormState => ({
  status: property?.status || '',
  remarks: '',
  updateReason: '',
  effectiveDate: new Date().toISOString().slice(0, 16),
  updatedBy: '',
  notifyParties: true,
  priceAdjustment: false,
  newPrice: property?.budget ? Number(property.budget) : 0
});

const PropertyStatusUpdateModal: React.FC<Props> = ({ isOpen, onClose, property, onStatusUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM(property ?? null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState<{
    propertyStatus: Option[];
    roles: Option[];
    updateReasons: Option[];
  }>({
    propertyStatus: [],
    roles: [],
    updateReasons: []
  });

  const [pressedStatus, setPressedStatus] = useState<string | null>(null);

  const currentProperty: Property = property ?? { id: '', title: '', status: '', budget: 0 };

  const normalizeStatusToLabel = (status: string, options: Option[]) => {
    if (!status) return '';
    const byValue = options.find(o => o.value === status)?.label;
    if (byValue) return byValue;
    const byLabel = options.find(o => o.label === status)?.label;
    return byLabel || status;
  };

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propertyMasterTypes, commonMasterTypes] = await Promise.all([
        masterDataAPI.getAllMasterTypes('property'),
        masterDataAPI.getAllMasterTypes('common')
      ]);

      const allMasterTypes = [...propertyMasterTypes, ...commonMasterTypes];

      const masterValues = await Promise.all(
        allMasterTypes.map((masterType: any) => masterDataAPI.getMasterValues(masterType.id))
      );

      const organizedData: Record<string, Option[]> = {};
      allMasterTypes.forEach((masterType: any, index: number) => {
        const values = masterValues[index] || [];
        organizedData[masterType.name.toLowerCase()] = values.map((item: any) => ({
          value: String(item.id),
          label: item.value || item.name || 'Unknown'
        }));
      });

      setMasterOptions({
        propertyStatus: organizedData['property status'] || [],
        roles: organizedData['role'] || [],
        updateReasons: organizedData['update reason'] || []
      });

    } catch (err: any) {
      console.error('Failed to load master data:', err);
      setError(`Failed to load dropdown options: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMasterData().catch(() => { });
      setFormData(prev => ({
        ...EMPTY_FORM(property ?? null),
        notifyParties: prev.notifyParties ?? true
      }));
    } else {
      setFormData(EMPTY_FORM(property ?? null));
      setError(null);
    }
  }, [isOpen, property]);

  useEffect(() => {
    if (!isOpen) return;
    if (masterOptions.roles.length > 0 || masterOptions.propertyStatus.length > 0) {
      setFormData(prev => {
        const updated: FormState = { ...prev };

        if (!prev.updatedBy && masterOptions.roles.length > 0) {
          updated.updatedBy = masterOptions.roles[0].label;
        } else if (prev.updatedBy) {
          const roleLabel = masterOptions.roles.find(r => r.value === prev.updatedBy)?.label;
          if (roleLabel) updated.updatedBy = roleLabel;
        }

        if (prev.status) {
          const normalized = normalizeStatusToLabel(prev.status, masterOptions.propertyStatus);
          if (normalized) updated.status = normalized;
        } else if (masterOptions.propertyStatus.length > 0) {
          updated.status = masterOptions.propertyStatus[0].label;
        }

        if (prev.updateReason) {
          const rr = masterOptions.updateReasons.find(r => r.value === prev.updateReason)?.label;
          if (rr) updated.updateReason = rr;
        }

        return updated;
      });
    }
  }, [isOpen, masterOptions]);

  const getStatusConfig = (statusValue: string) => {
    const statusConfigMap: Record<string, any> = {
      'Available': {
        color: '#10b981',
        description: 'Ready for sale',
        icon: CheckCircle,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      },
      'Under Negotiation': {
        color: '#f59e0b',
        description: 'Active discussions',
        icon: MessageCircle,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      },
      'On Hold': {
        color: '#64748b',
        description: 'Temporarily paused',
        icon: Pause,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      },
      'Finalization': {
        color: '#8b5cf6',
        description: 'Deal closing',
        icon: Target,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      },
      'Sold': {
        color: '#ef4444',
        description: 'Successfully sold',
        icon: Trophy,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      }
    };
    return statusConfigMap[statusValue] || {
      color: MU,
      description: 'Status',
      icon: AlertCircle,
      bg: `${N}05`,
      border: `${N}15`,
      selectedBg: `${O}10`,
      selectedBorder: O,
    };
  };

  const statusOptions = masterOptions.propertyStatus.map(s => {
    const cfg = getStatusConfig(s.label);
    return { ...s, ...cfg };
  });

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDropdownChange = (field: keyof Pick<FormState, 'status' | 'updatedBy' | 'updateReason'>) => (value: string) => {
    let selectedLabel = value;
    switch (field) {
      case 'status':
        selectedLabel = masterOptions.propertyStatus.find(opt => opt.value === value)?.label || value;
        break;
      case 'updatedBy':
        selectedLabel = masterOptions.roles.find(opt => opt.value === value)?.label || value;
        break;
      case 'updateReason':
        selectedLabel = masterOptions.updateReasons.find(opt => opt.value === value)?.label || value;
        break;
    }
    setFormData(prev => ({ ...prev, [field]: selectedLabel }));
  };

  const handleSave = async () => {
    if (!formData.updateReason) {
      toast.error('Please select update reason');
      return;
    }

    if (!formData.remarks.trim()) {
      toast.error('Please provide remarks for status update');
      return;
    }

    if (formData.priceAdjustment && (formData.newPrice === '' || Number(formData.newPrice) <= 0)) {
      toast.error('Please enter a valid new price for price adjustment');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiPayload: any = {
        status: formData.status,
        remarks: formData.remarks,
        updateReason: formData.updateReason,
        updatedBy: formData.updatedBy,
        effectiveDate: formData.effectiveDate,
        notifyParties: formData.notifyParties,
        priceAdjustment: formData.priceAdjustment
      };

      if (formData.priceAdjustment) {
        apiPayload.newPrice = Number(formData.newPrice);
      }

      const response = await propertiesAPI.updateStatus(String(currentProperty.id), apiPayload);

      if (response?.success) {
        if (onStatusUpdate) {
          await onStatusUpdate(formData.status, formData.remarks, formData);
        }
        toast.success('Property status updated successfully!');
        onClose();
      } else {
        toast.error(response?.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error(err?.response?.data?.error || err?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount?: number | string | null): string => {
    if (amount == null || amount === '') return '—';
    const n = typeof amount === 'string' ? Number(amount.replace(/[,₹\s]|(Cr|L)/gi, '')) : Number(amount);
    if (Number.isNaN(n)) return '—';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const currentStatusConfig = getStatusConfig(currentProperty.status);
  const CurrentIcon = currentStatusConfig.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div>
            <h2 className="text-sm font-bold text-white">Update Property Status</h2>
            <p className="text-[10px] text-white/70">{currentProperty.title}</p>
            {currentProperty.propertyId && (
              <p className="text-[9px] text-white/50">ID: {currentProperty.propertyId}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" style={{ borderColor: O, borderTopColor: 'transparent' }} />
              <span className="ml-2 text-[11px]" style={{ color: MU }}>Loading...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg p-2 text-[10px]" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <p>{error}</p>
              <button onClick={fetchMasterData} className="mt-1 text-[9px] underline">Retry</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Current Status */}
              <div className="rounded-lg p-2" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
                <h3 className="text-[9px] font-semibold mb-1" style={{ color: MU }}>Current Status</h3>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded" style={{ background: `${currentStatusConfig.color}15` }}>
                    <CurrentIcon size={12} style={{ color: currentStatusConfig.color }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold" style={{ color: N }}>{currentProperty.status}</div>
                    <div className="text-[9px]" style={{ color: MU }}>{currentStatusConfig.description}</div>
                  </div>
                </div>
              </div>

              {/* Status Selection Cards */}
              <div>
                <h3 className="text-[9px] font-semibold mb-1.5" style={{ color: MU }}>Select New Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
             {statusOptions.length > 0 ? statusOptions.map((status) => {
  const StatusIcon = status.icon;
  const isSelected = formData.status === status.value || formData.status === status.label;
  
  // Different highlight colors for different statuses
  const getHighlightColor = () => {
    if (!isSelected) return '';
    switch (status.label) {
      case 'Available':
        return '#10b981'; // Green
      case 'Sold':
        return '#ef4444'; // Red
      case 'Under Negotiation':
        return '#f59e0b'; // Amber
      case 'On Hold':
        return '#64748b'; // Gray
      case 'Finalization':
        return '#8b5cf6'; // Purple
      default:
        return O; // Default Orange
    }
  };
  
  const highlightColor = getHighlightColor();

  return (
    <button
      key={status.value}
      onClick={() => handleDropdownChange('status')(status.value)}
      type="button"
      className={`rounded-lg p-1.5 text-center transition-all hover:shadow-sm ${isSelected ? 'ring-2 shadow-md' : ''}`}
      style={{
        background: isSelected ? `${highlightColor}15` : `${N}05`,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="p-0.5 rounded" style={{ background: `${status.color}15` }}>
          <StatusIcon size={10} style={{ color: isSelected ? highlightColor : status.color }} />
        </div>
        <div className="text-[9px] font-semibold" style={{ color: isSelected ? highlightColor : N }}>
          {status.label}
        </div>
        <div className="text-[7px]" style={{ color: isSelected ? highlightColor : MU }}>
          {status.description}
        </div>
      </div>
    </button>
  );
}) : (
  <div className="col-span-full text-center py-2 text-[10px]" style={{ color: MU }}>No status options available</div>
)}
                </div>
              </div>

              {/* Update Details */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Update Reason <span className="text-red-400">*</span></label>
                    <select
                      value={masterOptions.updateReasons.find(opt => opt.label === formData.updateReason)?.value || ''}
                      onChange={(e) => handleDropdownChange('updateReason')(e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                      required
                    >
                      <option value="">Select reason</option>
                      {masterOptions.updateReasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>{reason.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>
                      <Calendar size={10} className="inline mr-0.5" /> Effective Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.effectiveDate}
                      onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Remarks <span className="text-red-400">*</span></label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1 resize-none"
                    style={{ borderColor: BD }}
                    rows={2}
                    placeholder="Provide detailed remarks..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>
                      <User size={10} className="inline mr-0.5" /> Updated By <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={masterOptions.roles.find(opt => opt.label === formData.updatedBy)?.value || ''}
                      onChange={(e) => handleDropdownChange('updatedBy')(e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                      required
                    >
                      <option value="">Select role</option>
                      {masterOptions.roles.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-1.5 cursor-pointer ">
                      <input
                        type="checkbox"
                        checked={formData.priceAdjustment}
                        onChange={(e) => handleInputChange('priceAdjustment', e.target.checked)}
                        className="rounded w-3 h-3" style={{ accentColor: O }}
                      />
                      <span className="text-[12px] font-medium" style={{ color: MU }}>
                        <IndianRupeeIcon size={13} className="inline mr-0.5 text-green-950" /> Adjust Price
                      </span>
                    </label>
                  </div>
                </div>

                {formData.priceAdjustment && (
                  <div className="rounded-lg p-2" style={{ background: `${O}05`, border: `1px solid ${O}20` }}>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>New Price (₹)</label>
                    <input
                      type="number"
                      value={formData.newPrice}
                      onChange={(e) => handleInputChange('newPrice', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                      placeholder="Enter new price"
                    />
                    <div className="mt-1 text-[9px] p-1 rounded" style={{ background: BG }}>
                      <strong>Current:</strong> {formatCurrency(currentProperty.budget)} → <strong>New:</strong> {formatCurrency(formData.newPrice as number | '')}
                    </div>
                  </div>
                )}

                <div className="rounded-lg p-1.5" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
                  <label className="flex items-start gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifyParties}
                      onChange={(e) => handleInputChange('notifyParties', e.target.checked)}
                      className="rounded w-3 h-3 mt-0.5" style={{ accentColor: O }}
                    />
                    <div>
                      <span className="text-[10px] font-medium" style={{ color: N }}>Notify all interested parties</span>
                      <p className="text-[8px]" style={{ color: MU }}>Seller, buyers, and team will be notified</p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: BD, background: BG }}>
          <div className="flex items-center gap-1 text-[9px]" style={{ color: MU }}>
            <Clock size={10} />
            <span>Recorded in timeline</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={onClose} className="px-2 py-1 text-[10px] border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !formData.updateReason || !formData.remarks.trim() || !formData.updatedBy || loading}
              className="px-2 py-1 text-[10px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: O }}
            >
              <Save size={10} />
              <span>{isSubmitting ? 'Updating...' : 'Update'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyStatusUpdateModal;


