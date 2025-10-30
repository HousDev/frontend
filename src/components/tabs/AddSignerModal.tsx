import React, { useMemo, useState } from "react";
import { X, Plus, Trash2, ChevronDown } from "lucide-react";

type PartyRole = "Buyer" | "Seller" | "Custom";

export interface NewSigner {
  role: PartyRole | string;
  name: string;
  email: string;
  phone: string;
  reason?: string;
  index?: number;
  identifierType?: "email" | "phone";
}

export interface SignBox {
  llx: number;
  lly: number;
  urx: number;
  ury: number;
}

type PageNumber = string;

type CoordEntry = {
  page: PageNumber;
  llx: number;
  lly: number;
  urx: number;
  ury: number;
};

export default function AddSignerModal({
  isOpen,
  onClose,
  onSave,
  defaultRole = "Custom",
  defaultIndex,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signer: NewSigner, coordsForSigner: Record<PageNumber, SignBox[]>) => void;
  defaultRole?: PartyRole;
  defaultIndex?: number;
}) {
  const [role, setRole] = useState<PartyRole>(defaultRole);
  const [customRoleName, setCustomRoleName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifierType, setIdentifierType] = useState<"email" | "phone">("email");
  const [reason, setReason] = useState(
    defaultRole === "Buyer"
      ? "Please sign as Buyer"
      : defaultRole === "Seller"
      ? "Please sign as Seller"
      : "Please sign"
  );

  // index now fixed, not editable
  const index = defaultIndex ?? 0;

  const [coords, setCoords] = useState<CoordEntry[]>([
    { page: "1", llx: 100, lly: 100, urx: 200, ury: 140 },
  ]);

  const identifier = useMemo(() => {
    if (identifierType === "email") return email.trim();
    return phone.trim();
  }, [email, phone, identifierType]);

  const addCoord = () => {
    setCoords((p) => [
      ...p,
      { page: String(Number(p[p.length - 1]?.page || "1") + 1), llx: 100, lly: 100, urx: 200, ury: 140 },
    ]);
  };

  const updateCoord = (i: number, patch: Partial<CoordEntry>) => {
    setCoords((p) => p.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  const removeCoord = (i: number) => {
    setCoords((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    if (!identifier) {
      alert("Provide either Email OR Phone for the signer.");
      return;
    }

    const boxed: Record<PageNumber, SignBox[]> = {};
    coords.forEach((c) => {
      const pg = String(c.page || "1");
      if (!boxed[pg]) boxed[pg] = [];
      boxed[pg].push({
        llx: Number(c.llx),
        lly: Number(c.lly),
        urx: Number(c.urx),
        ury: Number(c.ury),
      });
    });

    const signer: NewSigner = {
      role: role === "Custom" && customRoleName.trim() ? customRoleName.trim() : role,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      reason,
      index,
      identifierType,
    };

    onSave(signer, boxed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">Add Custom Signer</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Role & Custom Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Role</label>
              <select
                value={role}
                onChange={(e) => {
                  const r = e.target.value as PartyRole;
                  setRole(r);
                  setReason(
                    r === "Buyer"
                      ? "Please sign as Buyer"
                      : r === "Seller"
                      ? "Please sign as Seller"
                      : "Please sign"
                  );
                }}
                className="w-full border rounded px-2 py-1.5 text-sm"
              >
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {role === "Custom" && (
              <div>
                <label className="text-xs text-gray-600">Custom Role Name</label>
                <input
                  value={customRoleName}
                  onChange={(e) => setCustomRoleName(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="e.g. Executive, Admin"
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-gray-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="Full name"
            />
          </div>

          {/* Identifier Type */}
          <div>
            <label className="text-xs text-gray-600">Use as Identifier</label>
            <div className="relative">
              <select
                value={identifierType}
                onChange={(e) => setIdentifierType(e.target.value as "email" | "phone")}
                className="w-full border rounded px-2 py-1.5 text-sm appearance-none"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Selected identifier: <strong>{identifier || "—"}</strong>
            </div>
          </div>

          {/* Conditional Input */}
          {identifierType === "email" && (
            <div>
              <label className="text-xs text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="email@example.com"
              />
            </div>
          )}

          {identifierType === "phone" && (
            <div>
              <label className="text-xs text-gray-600">Phone (+CCXXXXXXXXXX)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="+9198xxxxxxx"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-xs text-gray-600">Reason</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="Reason for signing"
            />
          </div>

          {/* Coordinates table */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Coordinates for this signer</label>
              <button
                onClick={addCoord}
                className="px-2 py-1 text-xs border rounded flex items-center gap-1 hover:bg-gray-50"
              >
                <Plus size={14} /> Add row
              </button>
            </div>

            <div className="mt-2 border rounded">
              <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-t">
                <div>Page</div>
                <div>LLX</div>
                <div>LLY</div>
                <div>URX</div>
                <div>URY</div>
              </div>

              {coords.map((c, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 px-3 py-2 items-center border-t">
                  <input
                    value={c.page}
                    onChange={(e) => updateCoord(i, { page: e.target.value })}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={c.llx}
                    onChange={(e) => updateCoord(i, { llx: Number(e.target.value) })}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={c.lly}
                    onChange={(e) => updateCoord(i, { lly: Number(e.target.value) })}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={c.urx}
                    onChange={(e) => updateCoord(i, { urx: Number(e.target.value) })}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={c.ury}
                      onChange={(e) => updateCoord(i, { ury: Number(e.target.value) })}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                    <button
                      onClick={() => removeCoord(i)}
                      className="p-1 text-red-600 border rounded hover:bg-red-50"
                      title="Remove row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-gray-500 mt-2">
              Pages must be strings: "1", "2"… • Units in PDF points.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Save signer
          </button>
        </div>
      </div>
    </div>
  );
}
