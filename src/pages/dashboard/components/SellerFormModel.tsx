// src/pages/dashboard/components/SellerFormModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

type Lead = {
  id: string;
  salutation?: string;
  name?: string;
  phone?: string;
  whatsapp_number?: string;
  email?: string;
  city?: string;
  state?: string;
  location?: string;
  lead_source?: string;
  lead_type?: string;
  priority?: string;
  status?: string;
  stage?: string;
  created_at?: string;
  created_by?: string;
  last_contact?: string;
  last_contacted_by?: string;
  updated_at?: string;
  is_active?: boolean | null;
  assigned_executive?: string;
};

interface SellerFormModalProps {
  lead: Lead;
  followups?: any[];
  onClose?: () => void;
  onTransferSuccess?: (transferredSeller: any) => void;
  isOpen?: boolean;
}

const noop = () => {};

const SellerFormModal: React.FC<SellerFormModalProps> = ({
  lead,
  followups = [],
  onClose = noop,
  onTransferSuccess,
  isOpen = true,
}) => {
  // form state with defaults derived from lead
  const [formData, setFormData] = useState<any>({
    salutation: "",
    name: "",
    phone: "",
    whatsapp_number: "",
    email: "",
    city: "",
    state: "",
    location: "",
    lead_source: "",
    lead_type: "",
    priority: "",
    status: "",
    stage: "",
    created_at: "",
    created_by: "",
    last_contact: "",
    last_contacted_by: "",
    updated_at: "",
    is_active: true,
    assigned_executive: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // initialize from lead whenever it changes
  useEffect(() => {
    if (!lead) return;
    setFormData({
      salutation: lead.salutation ?? "",
      name: lead.name ?? "",
      phone: lead.phone ?? "",
      whatsapp_number: lead.whatsapp_number ?? "",
      email: lead.email ?? "",
      city: lead.city ?? "",
      state: lead.state ?? "",
      location: lead.location ?? "",
      lead_source: lead.lead_source ?? "",
      lead_type: lead.lead_type ?? "",
      priority: lead.priority ?? "",
      status: lead.status ?? "",
      stage: lead.stage ?? "",
      created_at: lead.created_at ?? "",
      created_by: lead.created_by ?? "",
      last_contact: lead.last_contact ?? "",
      last_contacted_by: lead.last_contacted_by ?? "",
      updated_at: (lead as any).updated_at ?? "",
      is_active: (lead as any).is_active != null ? !!(lead as any).is_active : true,
      assigned_executive: (lead as any).assigned_executive ?? "",
      id: lead.id ?? "",
    });
  }, [lead]);

  useEffect(() => {
    if (followups && followups.length) {
      console.log("Seller Followups:", followups);
    }
  }, [followups]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? !!checked : value,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name || String(formData.name).trim().length < 2) errs.name = "Name is required";
    if (!formData.phone || String(formData.phone).trim().length < 6) errs.phone = "Valid phone required";
    // additional validation rules can be added here
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // In this modal we only prepare data and call the parent's success handler.
      // If you need to call an API here, do it and await the response.
      const payload = {
        ...formData,
        leadId: lead?.id,
        transferred_at: new Date().toISOString(),
      };

      console.log("Seller transfer payload:", payload);

      // call success callback if provided
      onTransferSuccess?.(payload);

      // close modal
      onClose?.();
    } catch (err) {
      console.error("Seller transfer failed:", err);
      // optionally set a user-visible error state / toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!isOpen} onClose={() => onClose?.()} title="Transfer to Seller" width="max-w-3xl">
      <form onSubmit={handleSubmit} className="p-4 space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600">Salutation</label>
            <input name="salutation" value={formData.salutation} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-600">Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
            {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600">Phone *</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
            {errors.phone && <div className="text-red-600 text-xs mt-1">{errors.phone}</div>}
          </div>

          <div>
            <label className="block text-xs text-gray-600">WhatsApp</label>
            <input name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Email</label>
            <input name="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600">State</label>
            <input name="state" value={formData.state} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">City</label>
            <input name="city" value={formData.city} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Location</label>
            <input name="location" value={formData.location} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600">Lead Source</label>
            <input name="lead_source" value={formData.lead_source} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Lead Type</label>
            <input name="lead_type" value={formData.lead_type} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs">
              <option value="">Select</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600">Stage</label>
            <input name="stage" value={formData.stage} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Status</label>
            <input name="status" value={formData.status} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Assigned Executive</label>
            <input name="assigned_executive" value={formData.assigned_executive} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
          <div>
            <label className="block text-xs text-gray-600">Created At</label>
            <input name="created_at" value={formData.created_at} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Updated At</label>
            <input name="updated_at" value={formData.updated_at} onChange={handleChange} className="w-full border rounded px-2 h-8 text-xs" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="is_active" name="is_active" type="checkbox" checked={!!formData.is_active} onChange={handleChange} />
          <label htmlFor="is_active" className="text-xs text-gray-700">Active</label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="px-3 py-1 bg-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Transfer to Seller"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SellerFormModal;
