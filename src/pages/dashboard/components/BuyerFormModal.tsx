// src/pages/BuyerFormModal.tsx
import Modal from "@/components/ui/Modal";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BuyerFormModalProps {
  lead: any;
  onClose: () => void;
}

const BuyerFormModal: React.FC<BuyerFormModalProps> = ({ lead, onClose }) => {
  const [showUnitTypeDropdown, setShowUnitTypeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const unitTypeButtonRef = React.useRef<HTMLButtonElement>(null);
  const locationButtonRef = React.useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState({
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
    lead_priority: "",
    status: "",
    stage: "",
    assigned_agent: "",
    created_at: "",
    created_by: "",
    last_contact: "",
    last_contacted_by: "",
    // Buyer specific fields
    budget_range: "",
    preferred_unit_type: [],
    preferred_location: [],
    property_subtype: "",
    assign_to_buyer_agent: "",
    buyer_remark: "",
    updated_at: "",
    buyer_lead_status: "New"
  });

  // Initialize form data from lead prop
  useEffect(() => {
    if (lead) {
      setFormData({
        salutation: lead.salutation || "",
        name: lead.name || "",
        phone: lead.phone || "",
        whatsapp_number: lead.whatsapp_number || "",
        email: lead.email || "",
        city: lead.city || "",
        state: lead.state || "",
        location: lead.location || "",
        lead_source: lead.lead_source || "",
        lead_type: lead.lead_type || "",
        lead_priority: lead.lead_priority || "",
        status: lead.status || "",
        stage: lead.stage || "",
        assigned_agent: lead.assigned_agent || "",
        created_at: lead.created_at || new Date().toISOString(),
        created_by: lead.created_by || "",
        last_contact: lead.last_contact || "",
        last_contacted_by: lead.last_contacted_by || "",
        budget_range: lead.budget_range || "",
        preferred_unit_type: lead.preferred_unit_type || [],
        preferred_location: lead.preferred_location || [],
        property_subtype: lead.property_subtype || "",
        assign_to_buyer_agent: lead.assign_to || "",
        buyer_remark: lead.buyer_remark || "",
        updated_at: lead.updated_at || "",
        buyer_lead_status: "New"
      });
    }
  }, [lead]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[name] || [];
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];

      return { ...prev, [name]: updatedArray };
    });
  };

  const handleAgentAssignment = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      assign_to_buyer_agent: value,
      // Don't change the status here - keep original status
    }));
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      buyer_remark: value
    }));
  };

  const handleUnitTypeToggle = () => {
    setShowLocationDropdown(false); // Close other dropdown
    setShowUnitTypeDropdown(!showUnitTypeDropdown);
  };

  const handleLocationToggle = () => {
    setShowUnitTypeDropdown(false); // Close other dropdown
    setShowLocationDropdown(!showLocationDropdown);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      updated_at: new Date().toISOString(), // Set current timestamp on submit
      buyer_lead_status: "New" // Always set to "New" on submit
    };
    console.log("🚀 Buyer Form Submitted:", submissionData);
    toast.success("Buyer information saved successfully!");
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Buyer Form" width="max-w-2xl">
      <div className="text-xs">
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Basic Details - Non-editable fields */}
          {/* First Row - Read-only */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
            {/* Salutation */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Salutation
              </label>
              <input
                type="text"
                name="salutation"
                value={formData.salutation}
                readOnly
                className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Name */}
            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                readOnly
                className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1">
            <div>
              <label className="block font-medium">WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
            
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-3 gap-1">
            <div>
              <label className="block font-medium">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Lead Details - Non-editable */}
          <div className="grid grid-cols-3 gap-1">
            <div>
              <label className="block font-medium">Lead Source</label>
              <input
                type="text"
                name="lead_source"
                value={formData.lead_source}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium">Lead Type</label>
              <input
                type="text"
                name="lead_type"
                value={formData.lead_type}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium">Status</label>
              <input
                type="text"
                name="status"
                value={formData.status}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Buyer Specific - Editable fields in new order */}
          <div className="grid grid-cols-3 gap-1">
            <div>
              <label className="block font-medium">Property Subtype</label>
              <select
                name="property_subtype"
                value={formData.property_subtype}
                onChange={handleChange}
                className="w-full border p-1 rounded"
              >
                <option value="">Select Property</option>
                <option value="Apartment">Apartment</option>
                <option value="Row House">Row House</option>
                <option value="Plot">Plot</option>
              </select>
            </div>
            <div>
              <label className="block font-medium">Budget Range</label>
              <select
                name="budget_range"
                value={formData.budget_range}
                onChange={handleChange}
                className="w-full border p-1 rounded"
              >
                <option value="">Select Budget</option>
                <option value="0-50L">0-50 Lakhs</option>
                <option value="50L-1Cr">50L-1 Cr</option>
                <option value="1Cr-2Cr">1Cr-2 Cr</option>
                <option value="2Cr+">2Cr+</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-green-700">Assign To (Buyer Agent)</label>
              <select
                name="assign_to_buyer_agent"
                value={formData.assign_to_buyer_agent}
                onChange={handleAgentAssignment}
                className="w-full border p-1 rounded border-green-500"
              >
                <option value="">Select Agent</option>
                <option value="Agent1">Agent 1</option>
                <option value="Agent2">Agent 2</option>
                <option value="Agent3">Agent 3</option>
              </select>
            </div>
          </div>

          {/* Preferred Unit Type and Location - 2 per row */}
          <div className="grid grid-cols-2 gap-1">
            {/* Preferred Unit Type - Dropdown with Checkboxes */}
            <div className="relative">
              <label className="block font-medium mb-1">Preferred Unit Type</label>
              <div className="relative">
                <button
                  ref={unitTypeButtonRef}
                  type="button"
                  onClick={handleUnitTypeToggle}
                  className="w-full border p-1 rounded text-left bg-white flex justify-between items-center text-xs"
                >
                  <div className="flex flex-wrap gap-1">
                    {formData.preferred_unit_type?.length > 0 ? (
                      formData.preferred_unit_type.map((item) => (
                        <span key={item} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {item}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange("preferred_unit_type", item);
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span>Select Unit Types</span>
                    )}
                  </div>
                  <span className="text-gray-500 ml-2">▼</span>
                </button>

                {showUnitTypeDropdown && unitTypeButtonRef.current && (
                  <div
                    className="bg-white border rounded shadow-lg"
                    style={{
                      position: 'fixed',
                      zIndex: 9999,
                      top: unitTypeButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
                      left: unitTypeButtonRef.current.getBoundingClientRect().left + window.scrollX,
                      width: unitTypeButtonRef.current.getBoundingClientRect().width
                    }}
                  >
                    {["1BHK", "2BHK", "3BHK", "Villa"].map((unitType) => (
                      <label key={unitType} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferred_unit_type?.includes(unitType)}
                          onChange={() => handleCheckboxChange("preferred_unit_type", unitType)}
                          className="mr-2 h-3 w-3"
                        />
                        <span className="text-xs">{unitType}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preferred Location */}
            {/* Preferred Location */}
            <div className="relative">
              <label className="block font-medium mb-1">Preferred Location</label>
              <div className="relative">
                <button
                  ref={locationButtonRef}
                  type="button"
                  onClick={handleLocationToggle}
                  className="w-full border p-1 rounded text-left bg-white flex justify-between items-center text-xs"
                >
                  <div className="flex flex-wrap gap-1">
                    {formData.preferred_location?.length > 0 ? (
                      formData.preferred_location.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          {item}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange("preferred_location", item);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCheckboxChange("preferred_location", item);
                              }
                            }}
                            className="ml-1 text-green-600 hover:text-green-800 cursor-pointer"
                            aria-label={`Remove ${item}`}
                          >
                            ×
                          </span>
                        </span>
                      ))
                    ) : (
                      <span>Select Locations</span>
                    )}
                  </div>
                  <span className="text-gray-500 ml-2">▼</span>
                </button>

                {showLocationDropdown && locationButtonRef.current && (
                  <div
                    className="bg-white border rounded shadow-lg max-h-40 overflow-y-auto"
                    style={{
                      position: 'fixed',
                      zIndex: 9999,
                      top: locationButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
                      left: locationButtonRef.current.getBoundingClientRect().left + window.scrollX,
                      width: locationButtonRef.current.getBoundingClientRect().width
                    }}
                  >
                    {[
                      "Hinjewadi",
                      "Baner",
                      "Wakad",
                      "Pune",
                      "Mumbai",
                      "Bangalore",
                      "Kharadi",
                      "Magarpatta",
                      "Koregaon Park"
                    ].map((location) => (
                      <label key={location} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferred_location?.includes(location)}
                          onChange={() => handleCheckboxChange("preferred_location", location)}
                          className="mr-2 h-3 w-3"
                        />
                        <span className="text-xs">{location}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Remark field */}
          <div>
            <label className="block font-medium">Buyer Remark</label>
            <textarea
              name="buyer_remark"
              value={formData.buyer_remark}
              onChange={handleRemarkChange}
              className="w-full border p-1 rounded"
              rows={3}
              placeholder="Add any buyer remarks here..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-300 rounded text-xs">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs">
              Save
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BuyerFormModal;