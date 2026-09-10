import { Plus, Check, X } from "lucide-react";
import { useState } from "react";
import type { MasterOption } from "@/lib/useMasterData";

type Props = {
  value: string;
  options: MasterOption[];
  onChange: (value: string) => void;
  onAdd: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const VendorMasterSelect = ({
  value,
  options,
  onChange,
  onAdd,
  placeholder = "Select",
  className = "",
  disabled = false,
}: Props) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const next = draft.trim();
    if (!next || saving) return;
    setSaving(true);
    try {
      await onAdd(next);
      setDraft("");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {adding ? (
        <>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="New option"
            className="w-full px-2.5 py-[7px] bg-[#FBF9F5] border border-[#E3DECF] rounded-[7px] text-[13px] text-[#1B1F2A] focus:outline-none focus:ring-[3px] focus:border-[#A97142] focus:ring-[#A97142]/15"
          />
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0E3658] text-white flex items-center justify-center"
            title="Save to Common Master"
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setDraft("");
            }}
            className="flex-shrink-0 w-7 h-7 rounded-full border border-[#E3DECF] text-[#8A8375] flex items-center justify-center"
          >
            <X size={13} />
          </button>
        </>
      ) : (
        <>
          <select
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-[7px] bg-[#FBF9F5] border border-[#E3DECF] rounded-[7px] text-[13px] text-[#1B1F2A] focus:outline-none focus:ring-[3px] focus:border-[#A97142] focus:ring-[#A97142]/15"
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0E3658] text-white flex items-center justify-center"
            title="Add to Common Master"
          >
            <Plus size={13} />
          </button>
        </>
      )}
    </div>
  );
};

export default VendorMasterSelect;
