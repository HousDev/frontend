import React, { useMemo, useState } from "react";
import { X, Search, Link2, UserCheck, Plus } from "lucide-react";
import { useProperties } from "@/hooks/properties";
import { getImageUrl } from "@/lib/helpers";

// ESALE/RESALE Theme Colors matching other components
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";

interface LinkPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty: (property: any) => void;
  onUnlinkProperty?: (property: any) => void;
  linkingSeller: any; // The seller object (or formData) to check already linked properties
  onCreatePropertyClick?: () => void; // Optional callback for "Create Property" footer action
}

export const LinkPropertyModal: React.FC<LinkPropertyModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty,
  onUnlinkProperty,
  linkingSeller,
  onCreatePropertyClick,
}) => {
  const [linkPropertySearch, setLinkPropertySearch] = useState("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const {
    properties: catalogProperties = [],
    loadingProps: catalogLoading,
    utils,
  } = useProperties({ autoLog: false });

  const filteredLinkableProperties = useMemo(() => {
    if (!linkingSeller) return [];

    // Resolve already linked properties by checking against different ID patterns
    const currentPropertyIds = new Set(
      ((linkingSeller as any).properties || []).map((p: any) =>
        String(p.id || p.property_id || p._id || p._pid || "")
      ).filter(Boolean)
    );

    const q = (linkPropertySearch || "").toLowerCase().trim();
    const qClean = q.replace(/[^a-z0-9]/gi, "");

    // Check if user is searching for property ID specifically (digits only or rex + digits)
    const isIdSearch = /^(rex)?\d+$/i.test(qClean);

    const qDigits = q.replace(/\D/g, "");
    const qNum = parseInt(qDigits, 10);
    const qTrimmed = qDigits.replace(/^0+/, "");

    const all = (catalogProperties || []).filter((p: any) => {
      if (!q) return true;

      const title = String(
        p.title ||
        p.property_type_name ||
        p.unit_type ||
        p.property_type ||
        ""
      ).toLowerCase();

      const address = String(
        p.address ||
        [p.location_name || p.locality_name, p.city_name || p.city]
          .filter(Boolean)
          .join(", ") ||
        ""
      ).toLowerCase();

      const society = String(p.society_name || p.society || "").toLowerCase();
      const bhk = String(p.unit_type || p.unitType || p.bhk || p.configuration || p.bhk_label || p.unit_types || "").toLowerCase();
      const subtype = String(p.property_subtype_name || p.property_sub_type || p.property_subtype || p.subtype || "").toLowerCase();
      const pid = String(p.id || p.property_id || p._id || "");
      const repId = String(
        p.propertyId || p.rep_id || p._rxpBadge || ""
      ).toLowerCase();

      const pidDigits = pid.replace(/\D/g, "");
      const pidNum = parseInt(pidDigits, 10);
      const pidTrimmed = pidDigits.replace(/^0+/, "");
      const pidClean = pid.replace(/[^a-z0-9]/gi, "");
      const repIdClean = repId.replace(/[^a-z0-9]/gi, "");

      // 1. Direct text matching
      if (
        title.includes(q) ||
        address.includes(q) ||
        society.includes(q) ||
        bhk.includes(q) ||
        subtype.includes(q) ||
        pid.toLowerCase().includes(q) ||
        repId.includes(q)
      ) {
        return true;
      }

      // If it's an ID search, perform strict numeric/trimmed matches on property ID
      if (isIdSearch) {
        // 2. Alphanumeric clean match (e.g. 'rex0388' vs '388' or 'rex388') - ensuring not empty
        if (
          qClean &&
          ((pidClean && pidClean.includes(qClean)) ||
            (repIdClean && repIdClean.includes(qClean)))
        ) {
          return true;
        }

        // 3. Number comparison ignoring leading zeros ('0388' === 388)
        if (!isNaN(qNum) && !isNaN(pidNum) && qNum === pidNum) {
          return true;
        }

        // 4. Trimmed digit match - ensuring not empty
        if (
          qTrimmed &&
          pidTrimmed &&
          pidTrimmed.includes(qTrimmed)
        ) {
          return true;
        }
      }

      return false;
    });

    // Sort unlinked properties first, then already linked ones
    return all.sort((a: any, b: any) => {
      const aPid = String(a.id || a.property_id || a._id || "");
      const bPid = String(b.id || b.property_id || b._id || "");
      const aLinked = currentPropertyIds.has(aPid);
      const bLinked = currentPropertyIds.has(bPid);
      if (aLinked === bLinked) return 0;
      return aLinked ? 1 : -1;
    });
  }, [catalogProperties, linkingSeller, linkPropertySearch]);

  if (!isOpen) return null;

  const handleClose = () => {
    setLinkPropertySearch("");
    setSelectedPropertyIds([]);
    onClose();
  };

  const handleToggleSelect = (property: any) => {
    const pid = String(property.id || property.property_id || property._id);
    setSelectedPropertyIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const sellerName = linkingSeller?.name || "Seller";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ border: `1px solid ${BD}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between bg-[#0f2b3d]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#e67e22]/20">
              <Link2 size={15} className="text-[#e67e22]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Link Property to Seller</h3>
              <p className="text-[10px] text-white/70">
                Select one or more existing properties to associate with {sellerName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={linkPropertySearch}
              onChange={(e) => setLinkPropertySearch(e.target.value)}
              placeholder="Search by title, location, unit type, society, property ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white border-gray-200"
              autoFocus
            />
          </div>
          <div className="mt-1.5 text-[10px] text-gray-500 flex justify-between">
            <span>Available properties to link: {filteredLinkableProperties.length}</span>
            {catalogLoading && <span className="text-orange-500 font-medium">Loading properties...</span>}
          </div>
        </div>

        {/* List of Properties */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
          {filteredLinkableProperties.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500">
              {linkPropertySearch
                ? `No available properties match "${linkPropertySearch}"`
                : "No unlinked properties available in catalog."}
            </div>
          ) : (
            filteredLinkableProperties.map((property: any) => {
              const propType = property.property_type_name || property.property_type || "";
              const unitType = property.unit_type || property.bhk || property.configuration || "";
              const subtype = property.property_subtype_name || property.property_sub_type || property.property_subtype || property.subtype || "";

              const pid = String(property.id || property.property_id || property._id || "");
              const formattedRexId = property.propertyId || `REX${String(pid).padStart(4, "0")}`;

              // Clean title: "Commercial 5BHK Flat" in a straight line, space separated
              const mainTitle = [propType, unitType, subtype].map(s => String(s).trim()).filter(Boolean).join(" ");
              // If no real title data at all, show the REX ID as placeholder
              const displayTitle = mainTitle || property.title || formattedRexId;

              // Address — suppress "Location not specified" for empty properties, show nothing instead
              const address =
                (utils?.addressFrom ? utils.addressFrom(property) : null) ||
                property.address ||
                [property.location_name || property.locality_name, property.city_name || property.city]
                  .filter(Boolean)
                  .join(", ") ||
                "";

              // Resolve price
              const price = utils?.priceFrom
                ? utils.priceFrom(property)
                : (property.price || property.budget || property.final_price || property.expected_price || 0);

              // Resolve photo — pick first available, run through getImageUrl for relative paths
              const rawPhoto = utils?.photoFrom
                ? utils.photoFrom(property)
                : (property.photos?.[0]?.url || (typeof property.photos?.[0] === 'string' ? property.photos?.[0] : null) || property.photo || property.image || "");
              const photo = getImageUrl(rawPhoto) || null;

              const isAlreadyLinked = Boolean(
                pid &&
                ((linkingSeller as any).properties || []).some(
                  (p: any) => String(p.id || p.property_id || p._id || p._pid || "") === pid
                )
              );

              const isChecked = selectedPropertyIds.includes(pid);

              return (
                <div
                  key={pid}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-shadow bg-white ${isAlreadyLinked
                      ? "border-emerald-200 bg-emerald-50/20"
                      : isChecked
                        ? "border-orange-300 bg-orange-50/10 shadow-sm"
                        : "border-gray-200 hover:shadow-sm"
                    }`}
                  onClick={() => {
                    if (!isAlreadyLinked) {
                      handleToggleSelect(property);
                    }
                  }}
                  style={{ cursor: isAlreadyLinked ? "default" : "pointer" }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Checkbox for Multi-select */}
                    {!isAlreadyLinked && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(property)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                      />
                    )}
                    {photo ? (
                      <img
                        src={photo}
                        alt={displayTitle}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).nextElementSibling as HTMLElement)?.classList?.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 flex-shrink-0 ${photo ? 'hidden' : ''}`}>
                      No Pic
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-gray-900 truncate">
                          {displayTitle}
                        </span>
                        {pid && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-100 text-orange-700">
                            {formattedRexId}
                          </span>
                        )}
                        {isAlreadyLinked && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Linked to this Seller
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{address}</p>
                      {Number(price) > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          ₹{Number(price).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {isAlreadyLinked ? (
                    onUnlinkProperty ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlinkProperty(property);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-red-700 bg-red-100 border border-red-200 hover:bg-red-200 flex-shrink-0 transition-colors"
                      >
                        <X size={12} className="text-red-500" />
                        <span>Unlink</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-emerald-700 bg-emerald-100 border border-emerald-200 cursor-default flex-shrink-0"
                      >
                        <UserCheck size={12} />
                        <span>Linked</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProperty(property);
                        handleClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-sm transition-all hover:opacity-90 flex-shrink-0 bg-[#e67e22]"
                    >
                      <Link2 size={12} />
                      <span>Link</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 border-t flex items-center justify-between text-xs"
          style={{ background: BG, borderColor: BD }}
        >
          {onCreatePropertyClick ? (
            <>
              <span className="text-[10px] text-gray-500">
                Want to create a new property instead?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="px-3 py-1 text-xs rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                {selectedPropertyIds.length > 0 && (
                  <button
                    onClick={() => {
                      const toSelect = filteredLinkableProperties.filter((p: any) =>
                        selectedPropertyIds.includes(String(p.id || p.property_id || p._id))
                      );
                      onSelectProperty(toSelect);
                      handleClose();
                    }}
                    className="px-3 py-1 text-xs rounded-lg text-white bg-[#e67e22] hover:bg-[#d35400] font-medium"
                  >
                    <span>Link Selected ({selectedPropertyIds.length})</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleClose();
                    onCreatePropertyClick();
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium"
                >
                  <Plus size={11} />
                  <span>Create Property</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-[10px] text-gray-500">
                {selectedPropertyIds.length > 0
                  ? `${selectedPropertyIds.length} properties selected`
                  : "Select checkbox next to property to link multiple"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-1.5 text-xs rounded-lg border text-gray-600 hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                {selectedPropertyIds.length > 0 && (
                  <button
                    onClick={() => {
                      const toSelect = filteredLinkableProperties.filter((p: any) =>
                        selectedPropertyIds.includes(String(p.id || p.property_id || p._id))
                      );
                      onSelectProperty(toSelect);
                      handleClose();
                    }}
                    className="px-4 py-1.5 text-xs rounded-lg text-white bg-[#e67e22] hover:bg-[#d35400] font-medium"
                  >
                    <span>Link Selected ({selectedPropertyIds.length})</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkPropertyModal;
