import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Save, Calendar, User, Star, Phone, MessageCircle, Building
} from 'lucide-react';
import { propertiesAPI } from '@/lib/propertiesAPI';

/* ------------------ Types ------------------ */
export interface PropertyItem {
  id: string | number;
  property_type_name?: string;
  property_type?: string;
  unit_type?: string;
  society_name?: string;
  society?: string;
  title?: string;
  address?: string;
  location?: string;
  area?: string;
  seller_name?: string;
  owner_name?: string;
  contact_name?: string;
  seller_phone?: string;
  owner_phone?: string;
  contact_phone?: string;
  phone?: string;
}

export interface Visit {
  id?: string | number;
  property: string;
  propertyId: string | number;
  date: string;
  time: string;
  duration: string;
  visitType: string;
  accompaniedBy: string[];
  sellerPresent: boolean;
  sellerName: string;
  sellerPhone: string;
  feedback: string;
  rating: number;
  outcome: string;
  nextAction: string;
  concerns: string;
  positives: string;
  revisitRequired: boolean;
  revisitDate: string;
  remarks: string;
  status: string;
  buyerId?: string | number;
  buyerName?: string;
  created_at?: string;
  updated_at?: string;
}

type VisitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  visit?: Visit;
  onSave: (data: Visit) => Promise<void> | void;
  buyer: { id: string | number; name: string };
};

/* ------------------ Small constants used in UI ------------------ */
const visitTypes = [
  { value: 'site_visit', label: 'Site Visit', description: 'Visit the property in person' },
  { value: 'virtual_tour', label: 'Virtual Tour', description: 'Video / photos walkthrough' },
  { value: 'inspection', label: 'Inspection', description: 'Detailed inspection visit' },
];

const durations = ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes'];

const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];

/* ------------------ Component ------------------ */
const VisitModal: React.FC<VisitModalProps> = ({ isOpen, onClose, visit, onSave, buyer }) => {
  // Keep form as Partial<Visit> internally to avoid forcing every field to exist up-front.
  const [formData, setFormData] = useState<Partial<Visit>>({
    property: visit?.property || '',
    propertyId: visit?.propertyId ? String(visit.propertyId) : '',
    date: visit?.date || new Date().toISOString().split('T')[0],
    time: visit?.time || '10:00',
    duration: visit?.duration || '60 minutes',
    visitType: visit?.visitType || 'site_visit',
    accompaniedBy: visit?.accompaniedBy || [],
    sellerPresent: visit?.sellerPresent ?? false,
    sellerName: visit?.sellerName || '',
    sellerPhone: visit?.sellerPhone || '-',
    feedback: visit?.feedback || '',
    rating: visit?.rating ?? 3,
    outcome: visit?.outcome || '',
    nextAction: visit?.nextAction || '',
    concerns: visit?.concerns || '',
    positives: visit?.positives || '',
    revisitRequired: visit?.revisitRequired ?? false,
    revisitDate: visit?.revisitDate || '',
    remarks: visit?.remarks || '',
    status: visit?.status || 'scheduled',
    id: visit?.id,
    buyerId: visit?.buyerId,
    buyerName: visit?.buyerName,
    created_at: visit?.created_at,
    updated_at: visit?.updated_at,
  });

  // Sync when visit prop changes (edit mode)
  useEffect(() => {
    setFormData({
      property: visit?.property || '',
      propertyId: visit?.propertyId ? String(visit.propertyId) : '',
      date: visit?.date || new Date().toISOString().split('T')[0],
      time: visit?.time || '10:00',
      duration: visit?.duration || '60 minutes',
      visitType: visit?.visitType || 'site_visit',
      accompaniedBy: visit?.accompaniedBy || [],
      sellerPresent: visit?.sellerPresent ?? false,
      sellerName: visit?.sellerName || '',
      sellerPhone: visit?.sellerPhone || '-',
      feedback: visit?.feedback || '',
      rating: visit?.rating ?? 3,
      outcome: visit?.outcome || '',
      nextAction: visit?.nextAction || '',
      concerns: visit?.concerns || '',
      positives: visit?.positives || '',
      revisitRequired: visit?.revisitRequired ?? false,
      revisitDate: visit?.revisitDate || '',
      remarks: visit?.remarks || '',
      status: visit?.status || 'scheduled',
      id: visit?.id,
      buyerId: visit?.buyerId,
      buyerName: visit?.buyerName,
      created_at: visit?.created_at,
      updated_at: visit?.updated_at,
    });
  }, [visit]);

  const [newAccompany, setNewAccompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [propsError, setPropsError] = useState<string | null>(null);

  /* ------------------ Effects ------------------ */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingProps(true);
      setPropsError(null);
      try {
        const res = await propertiesAPI.getProperties();
        const list: PropertyItem[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        if (isMounted) setProperties(list ?? []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        if (isMounted) setPropsError('Could not load properties');
      } finally {
        if (isMounted) setLoadingProps(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  /* ------------------ Helpers ------------------ */
  // generic input change for fields that exist on Visit -- store into Partial<Visit>
  const handleInputChange = <K extends keyof Visit>(field: K, value: Visit[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // dropdown options derived from properties
  const dropdownOptions = useMemo(
    () =>
      properties.map((p) => ({
        id: String(p.id ?? ''),
        title:
          [p.property_type_name || p.property_type || '', p.unit_type?.toUpperCase()].filter(Boolean).join(' ') ||
          p.title ||
          'Property',
        address: p.address || p.location || p.area || '',
        seller: p.seller_name || p.owner_name || p.contact_name || '',
        sellerPhone: p.seller_phone || p.owner_phone || p.contact_phone || p.phone || '',
      })),
    [properties]
  );

  const handlePropertySelect = (propertyId: string) => {
    const opt = dropdownOptions.find((o) => o.id === propertyId);
    if (!opt) {
      setFormData((prev) => ({ ...prev, property: '', propertyId: '', sellerName: '', sellerPhone: '' }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      property: opt.title,
      propertyId: opt.id,
      sellerName: opt.seller || (prev.sellerName as string),
      sellerPhone: opt.sellerPhone || (prev.sellerPhone as string),
    }));
  };

  const addAccompany = () => {
    const val = newAccompany.trim();
    const current = formData.accompaniedBy || [];
    if (val && !current.includes(val)) {
      setFormData((prev) => ({ ...prev, accompaniedBy: [...current, val] }));
      setNewAccompany('');
    }
  };

  const removeAccompany = (person: string) => {
    const current = formData.accompaniedBy || [];
    setFormData((prev) => ({ ...prev, accompaniedBy: current.filter((p) => p !== person) }));
  };

  // Build a full Visit payload from partial form data before saving
  const buildVisitPayload = (): Visit => {
    return {
      property: (formData.property as string) || '',
      propertyId: (formData.propertyId as string) || '',
      date: (formData.date as string) || new Date().toISOString().split('T')[0],
      time: (formData.time as string) || '10:00',
      duration: (formData.duration as string) || '60 minutes',
      visitType: (formData.visitType as string) || 'site_visit',
      accompaniedBy: (formData.accompaniedBy as string[]) || [],
      sellerPresent: (formData.sellerPresent as boolean) ?? false,
      sellerName: (formData.sellerName as string) || '',
      sellerPhone: (formData.sellerPhone as string) || '-',
      feedback: (formData.feedback as string) || '',
      rating: (formData.rating as number) ?? 3,
      outcome: (formData.outcome as string) || '',
      nextAction: (formData.nextAction as string) || '',
      concerns: (formData.concerns as string) || '',
      positives: (formData.positives as string) || '',
      revisitRequired: (formData.revisitRequired as boolean) ?? false,
      revisitDate: (formData.revisitDate as string) || '',
      remarks: (formData.remarks as string) || '',
      status: (formData.status as string) || 'scheduled',
      id: visit?.id ?? formData.id ?? Date.now(),
      buyerId: buyer.id,
      buyerName: buyer.name,
      created_at: visit?.created_at ?? formData.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const handleSave = async () => {
    // ensure property selected and date set
    if (!formData.propertyId || !(String(formData.propertyId).trim())) {
      alert('Please select a property');
      return;
    }
    if (!formData.date) {
      alert('Please select visit date');
      return;
    }

    setIsSubmitting(true);
    try {
      const visitData = buildVisitPayload();
      await onSave(visitData);
    } catch (error) {
      console.error('Error saving visit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {visit ? 'Edit Visit' : 'Schedule Visit'}
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">For {buyer.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-3 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left */}
            <div className="space-y-3">
              {/* Property Selection (dynamic) */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                  <Building className="mr-1" size={14} />
                  Property Selection
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Select Property <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={String(formData.propertyId || '')}
                      onChange={(e) => handlePropertySelect(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                      disabled={loadingProps || !!propsError}
                    >
                      <option value="">
                        {loadingProps ? 'Loading properties...' : propsError ? 'Failed to load' : 'Choose property to visit'}
                      </option>
                      {dropdownOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} {p.address ? `- ${p.address}` : ''}
                        </option>
                      ))}
                    </select>
                    {propsError && (
                      <p className="text-[11px] text-red-600 mt-1">{propsError}</p>
                    )}
                  </div>

                  {formData.property && (
                    <div className="p-2 text-xs bg-green-50 border border-green-200 rounded-md">
                      <div className="font-medium text-green-900">{formData.property}</div>
                      {!!formData.sellerName && (
                        <div className="text-green-700">Seller: {formData.sellerName}</div>
                      )}
                      {!!formData.sellerPhone && (
                        <div className="text-green-700">Contact: {formData.sellerPhone}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Visit Type */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Visit Type</h3>
                <div className="grid grid-cols-1 gap-2">
                  {visitTypes.map((type) => {
                    const isSelected = formData.visitType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('visitType', type.value)}
                        className={`p-2 text-xs rounded-md border transition-all text-left ${
                          isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-gray-600">{type.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accompanied By */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Accompanied By</h3>
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={newAccompany}
                      onChange={(e) => setNewAccompany(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="Add person (e.g., Wife, Father, Friend)"
                      onKeyDown={(e) => e.key === 'Enter' && addAccompany()}
                    />
                    <button
                      onClick={addAccompany}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(formData.accompaniedBy || []).map((person: string, index: number) => (
                      <div
                        key={`${person}-${index}`}
                        className="flex items-center space-x-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full"
                      >
                        <span>{person}</span>
                        <button
                          onClick={() => removeAccompany(person)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-3">
              {/* Schedule Details */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                  <Calendar className="mr-1" size={14} />
                  Schedule Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={String(formData.date || '')}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={String(formData.time || '')}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      value={String(formData.duration || '')}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      {durations.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                  <User className="mr-1" size={14} />
                  Seller Information
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.sellerPresent)}
                      onChange={(e) => handleInputChange('sellerPresent', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xs text-gray-700 font-medium">Seller will be present</span>
                  </label>

                  {formData.sellerPresent && (
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Seller Name</label>
                        <input
                          type="text"
                          value={String(formData.sellerName || '')}
                          onChange={(e) => handleInputChange('sellerName', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                          placeholder="Seller name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Seller Phone</label>
                        <input
                          type="tel"
                          value={String(formData.sellerPhone || '')}
                          onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="flex space-x-1">
                        <a
                          href={formData.sellerPhone ? `tel:${formData.sellerPhone}` : '#'}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Phone size={12} />
                          <span>Call</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const message = `Hi ${formData.sellerName || ''}, ${buyer.name} would like to visit your property ${formData.property || ''} on ${formData.date} at ${formData.time}. Please confirm availability.`;
                            const phone = (String(formData.sellerPhone || '')).replace(/\D/g, '');
                            if (!phone) return;
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback (only when completed) */}
              {formData.status === 'completed' && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">Visit Feedback</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Overall Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleInputChange('rating', star)}
                            className={`p-0.5 rounded ${star <= (formData.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            <Star size={16} className={star <= (formData.rating || 0) ? 'fill-current' : ''} />
                          </button>
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          {formData.rating === 5
                            ? 'Excellent'
                            : formData.rating === 4
                              ? 'Good'
                              : formData.rating === 3
                                ? 'Average'
                                : formData.rating === 2
                                  ? 'Poor'
                                  : 'Very Poor'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
                      <textarea
                        value={String(formData.feedback || '')}
                        onChange={(e) => handleInputChange('feedback', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={2}
                        placeholder="Overall feedback about the property visit..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">What they liked</label>
                      <textarea
                        value={String(formData.positives || '')}
                        onChange={(e) => handleInputChange('positives', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={1}
                        placeholder="Positive aspects they mentioned..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Concerns/Issues</label>
                      <textarea
                        value={String(formData.concerns || '')}
                        onChange={(e) => handleInputChange('concerns', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={1}
                        placeholder="Any concerns or issues they raised..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Outcome</label>
                      <textarea
                        value={String(formData.outcome || '')}
                        onChange={(e) => handleInputChange('outcome', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={1}
                        placeholder="Final outcome of the visit..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Next Action</label>
                      <textarea
                        value={String(formData.nextAction || '')}
                        onChange={(e) => handleInputChange('nextAction', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={1}
                        placeholder="What should be done next..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.revisitRequired)}
                          onChange={(e) => handleInputChange('revisitRequired', e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs text-gray-700 font-medium">Revisit required</span>
                      </label>

                      {formData.revisitRequired && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Revisit Date</label>
                          <input
                            type="date"
                            value={String(formData.revisitDate || '')}
                            onChange={(e) => handleInputChange('revisitDate', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Visit Status</label>
                <select
                  value={String(formData.status || '')}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Additional Remarks</label>
                <textarea
                  value={String(formData.remarks || '')}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  rows={2}
                  placeholder="Any additional notes about the visit..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Visit will be added to buyer activity timeline</div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !formData.propertyId || !formData.date}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={12} />
                <span>{isSubmitting ? 'Saving...' : visit ? 'Update' : 'Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitModal;
