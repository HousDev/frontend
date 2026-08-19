import React, { useEffect, useState } from "react";
import { X, Save, Phone, Mail, MapPin, Users, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import ownerFollowupAPI from "@/lib/ownerFollowupAPI";

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";

export const FOLLOWUP_TYPES = [
  { value: "Phone Call", Icon: Phone, color: "text-blue-500" },
  { value: "WhatsApp", Icon: FaWhatsapp, color: "text-green-500" },
  { value: "Email", Icon: Mail, color: "text-indigo-500" },
  { value: "Site Visit", Icon: MapPin, color: "text-orange-500" },
  { value: "Meeting", Icon: Users, color: "text-purple-500" },
  { value: "Other", Icon: MessageSquare, color: "text-gray-500" },
] as const;

interface OwnerFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: number | string;
  onSave: () => void;
  initialFollowup?: any;
}

export const OwnerFollowupModal: React.FC<OwnerFollowupModalProps> = ({
  isOpen,
  onClose,
  ownerId,
  onSave,
  initialFollowup,
}) => {
  const [formData, setFormData] = useState({
    followupType: "Phone Call",
    notes: "",
    followupDate: "",
    status: "pending",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialFollowup) {
      // Format date to local YYYY-MM-DDTHH:MM for datetime-local input
      let formattedDate = "";
      if (initialFollowup.followup_date || initialFollowup.followupDate) {
        const d = new Date(initialFollowup.followup_date || initialFollowup.followupDate);
        if (!isNaN(d.getTime())) {
          const tzoffset = d.getTimezoneOffset() * 60000;
          formattedDate = new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
        }
      }
      setFormData({
        followupType: initialFollowup.followup_type || initialFollowup.followupType || "Phone Call",
        notes: initialFollowup.notes || "",
        followupDate: formattedDate,
        status: initialFollowup.status || "pending",
      });
    } else {
      const tzoffset = new Date().getTimezoneOffset() * 60000;
      const nowString = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
      setFormData({
        followupType: "Phone Call",
        notes: "",
        followupDate: nowString,
        status: "pending",
      });
    }
  }, [initialFollowup, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.followupDate) {
      toast.error("Please select a followup date and time");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ownerId,
        followupType: formData.followupType,
        notes: formData.notes,
        followupDate: new Date(formData.followupDate).toISOString(),
        status: formData.status,
      };

      if (initialFollowup?.id) {
        await ownerFollowupAPI.update(initialFollowup.id, payload);
        toast.success("Follow-up updated successfully");
      } else {
        await ownerFollowupAPI.create(payload);
        toast.success("Follow-up created successfully");
      }
      onSave();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save follow-up");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden text-xs" style={{ border: `1px solid ${BD}` }}>
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between text-white bg-[#0f2b3d]">
          <h3 className="text-xs font-bold">{initialFollowup ? "Edit Follow-up" : "Add New Follow-up"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-gray-50 flex-1">
          {/* Followup Type Buttons */}
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Followup Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {FOLLOWUP_TYPES.map((t) => {
                const isSelected = formData.followupType === t.value;
                const IconComponent = t.Icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setFormData(p => ({ ...p, followupType: t.value }))}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all bg-white hover:shadow-sm ${
                      isSelected ? "border-orange-500 ring-1 ring-orange-500" : "border-gray-200"
                    }`}
                  >
                    <IconComponent size={14} className={t.color} />
                    <span className="text-[9px] font-medium text-gray-700">{t.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={formData.followupDate}
              onChange={(e) => setFormData(p => ({ ...p, followupDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-orange-500 bg-white"
            />
          </div>

          {/* Status Select */}
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs bg-white focus:ring-1 focus:ring-orange-500"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Notes / Remark</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Write follow-up notes here..."
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-orange-500 h-24 bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex justify-end gap-3" style={{ background: "#f8fafc" }}>
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold rounded-lg border hover:bg-gray-50 transition-colors text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-1.5 text-xs font-semibold rounded-lg text-white shadow-md hover:bg-orange-600 transition-colors bg-[#e67e22] disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerFollowupModal;
