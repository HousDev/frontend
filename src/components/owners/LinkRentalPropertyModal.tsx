import React, { useMemo, useState, useEffect } from "react";
import { X, Search, Link2, UserCheck, Plus } from "lucide-react";
import { rentalPropertiesAPI } from "@/lib/rentalPropertiesAPI";

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";

interface LinkRentalPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty?: (properties: any | any[]) => void;
  onLinkProperties?: (properties: any | any[]) => void;
  onUnlinkProperties?: (properties: any | any[]) => void;
  linkingOwner: any;
  onCreatePropertyClick?: () => void;
}

export const LinkRentalPropertyModal: React.FC<LinkRentalPropertyModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty,
  onLinkProperties,
  onUnlinkProperties,
  linkingOwner,
  onCreatePropertyClick,
}) => {
  const linkCallback = onSelectProperty || onLinkProperties;
  const [linkPropertySearch, setLinkPropertySearch] = useState("");
  const [catalogProperties, setCatalogProperties] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchRentalProperties = async () => {
        try {
          setCatalogLoading(true);
          const res = await rentalPropertiesAPI.getProperties();
          if (res && res.success && Array.isArray(res.data)) {
            setCatalogProperties(res.data);
          } else if (res && Array.isArray(res)) {
            setCatalogProperties(res);
          }
        } catch (err) {
          console.error("Failed to load rental properties:", err);
        } finally {
          setCatalogLoading(false);
        }
      };
      fetchRentalProperties();
      setSelectedPropertyIds([]);
    }
  }, [isOpen]);

  const filteredLinkableProperties = useMemo(() => {
    if (!linkingOwner) return [];

    const currentPropertyIds = new Set(
      ((linkingOwner as any)?.properties || []).map((p: any) =>
        String(p.id || p.property_id || p._id || "")
      ).filter(Boolean)
    );

    const q = (linkPropertySearch || "").toLowerCase().trim();
    const qClean = q.replace(/[^a-z0-9]/gi, "");
    const isIdSearch = /^(rent)?\d+$/i.test(qClean);
    const qDigits = q.replace(/\D/g, "");
    const qNum = parseInt(qDigits, 10);

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
        [p.location_name, p.city_name]
          .filter(Boolean)
          .join(", ") ||
        ""
      ).toLowerCase();

      const society = String(p.society_name || p.society || "").toLowerCase();
      const bhk = String(p.unit_type || p.bedrooms || "").toLowerCase();
      const pid = String(p.id || "");

      if (
        title.includes(q) ||
        address.includes(q) ||
        society.includes(q) ||
        bhk.includes(q) ||
        pid.includes(q)
      ) {
        return true;
      }

      if (isIdSearch) {
        if (!isNaN(qNum) && parseInt(pid, 10) === qNum) {
          return true;
        }
      }

      return false;
    });

    return all.sort((a: any, b: any) => {
      const aPid = String(a.id || "");
      const bPid = String(b.id || "");
      const aLinked = currentPropertyIds.has(aPid);
      const bLinked = currentPropertyIds.has(bPid);
      if (aLinked === bLinked) return 0;
      return aLinked ? 1 : -1;
    });
  }, [catalogProperties, linkingOwner, linkPropertySearch]);

  const unlinkedVisibleProperties = useMemo(() => {
    if (!linkingOwner) return [];
    const currentPropertyIds = new Set(
      ((linkingOwner as any)?.properties || []).map((p: any) =>
        String(p.id || p.property_id || p._id || "")
      ).filter(Boolean)
    );
    return filteredLinkableProperties.filter((p: any) => !currentPropertyIds.has(String(p.id || "")));
  }, [filteredLinkableProperties, linkingOwner]);

  const allSelected = unlinkedVisibleProperties.length > 0 && unlinkedVisibleProperties.every(p => selectedPropertyIds.includes(String(p.id)));

  const handleSelectAllToggle = () => {
    if (allSelected) {
      const idsToRemove = unlinkedVisibleProperties.map(p => String(p.id));
      setSelectedPropertyIds(prev => prev.filter(id => !idsToRemove.includes(id)));
    } else {
      const idsToAdd = unlinkedVisibleProperties.map(p => String(p.id));
      setSelectedPropertyIds(prev => {
        const next = [...prev];
        idsToAdd.forEach(id => {
          if (!next.includes(id)) {
            next.push(id);
          }
        });
        return next;
      });
    }
  };

  const handleToggleSelect = (property: any) => {
    const pid = String(property.id || "");
    if (selectedPropertyIds.includes(pid)) {
      setSelectedPropertyIds(prev => prev.filter(x => x !== pid));
    } else {
      setSelectedPropertyIds(prev => [...prev, pid]);
    }
  };

  const toLink = useMemo(() => {
    const linkedIds = new Set(((linkingOwner as any)?.properties || []).map((p: any) => String(p.id || p.property_id || p._id || "")));
    return catalogProperties.filter((p: any) => selectedPropertyIds.includes(String(p.id)) && !linkedIds.has(String(p.id)));
  }, [catalogProperties, selectedPropertyIds, linkingOwner]);

  const toUnlink = useMemo(() => {
    const linkedIds = new Set(((linkingOwner as any)?.properties || []).map((p: any) => String(p.id || p.property_id || p._id || "")));
    return catalogProperties.filter((p: any) => selectedPropertyIds.includes(String(p.id)) && linkedIds.has(String(p.id)));
  }, [catalogProperties, selectedPropertyIds, linkingOwner]);

  const handleBulkLink = () => {
    if (toLink.length > 0 && linkCallback) {
      linkCallback(toLink);
    }
    handleClose();
  };

  const handleBulkUnlink = () => {
    if (toUnlink.length > 0 && onUnlinkProperties) {
      onUnlinkProperties(toUnlink);
    }
    handleClose();
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setLinkPropertySearch("");
    setSelectedPropertyIds([]);
    onClose();
  };

  const ownerName = linkingOwner?.name || "Owner";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
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
              <h3 className="text-sm font-bold text-white">Link Rental Properties to Owner</h3>
              <p className="text-[10px] text-white/70">
                Select one or more properties to associate or dissociate with {ownerName}
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
              placeholder="Search by title, location, unit type, society, rental ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 bg-white border-gray-200"
              autoFocus
            />
          </div>
          <div className="mt-1.5 text-[10px] text-gray-500 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span>Available rental properties to link: {filteredLinkableProperties.length}</span>
              {unlinkedVisibleProperties.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllToggle}
                  className="text-xs font-bold text-[#e67e22] hover:underline flex items-center gap-1"
                >
                  {allSelected ? "Deselect All" : `Select All (${unlinkedVisibleProperties.length})`}
                </button>
              )}
            </div>
            {catalogLoading && <span className="text-orange-500 font-medium">Loading properties...</span>}
          </div>
        </div>

        {/* List of Properties */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
          {filteredLinkableProperties.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500">
              {linkPropertySearch
                ? `No available rental properties match "${linkPropertySearch}"`
                : "No unlinked rental properties available."}
            </div>
          ) : (
            filteredLinkableProperties.map((property: any) => {
              const propType = property.property_type_name && String(property.property_type_name) !== "null" && String(property.property_type_name) !== "undefined" ? property.property_type_name : "";
              
              let unitType = "";
              if (property.bedrooms && String(property.bedrooms) !== "null" && String(property.bedrooms) !== "undefined") {
                unitType = `${property.bedrooms} BHK`;
              } else if (property.unit_type && String(property.unit_type) !== "null" && String(property.unit_type) !== "undefined") {
                unitType = property.unit_type;
              }
              
              const displayTitle = [propType, unitType].map(s => String(s).trim()).filter(Boolean).filter(s => s !== "null" && s !== "undefined").join(" • ") || property.title || "Rental Property";

              const address =
                property.address ||
                [property.location_name, property.city_name]
                  .filter(Boolean)
                  .join(", ") ||
                "Location not specified";
              const rent = property.monthly_rent;
              const photo = property.photos?.[0]?.url || property.photos?.[0];
              const pid = String(property.id || "");
              
              const isAlreadyLinked = Boolean(
                pid &&
                ((linkingOwner as any).properties || []).some(
                  (p: any) => String(p.id || "") === pid
                )
              );

              const isChecked = selectedPropertyIds.includes(pid);

              return (
                <div
                  key={pid}
                  onClick={() => handleToggleSelect(property)}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-shadow bg-white cursor-pointer ${
                    isAlreadyLinked
                      ? isChecked
                        ? "border-red-300 bg-red-50/10 shadow-sm"
                        : "border-emerald-200 bg-emerald-50/20"
                      : isChecked
                      ? "border-orange-300 bg-orange-50/10 shadow-sm"
                      : "border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(property)}
                      onClick={(e) => e.stopPropagation()}
                      className={`h-3.5 w-3.5 rounded border-gray-300 cursor-pointer ${
                        isAlreadyLinked
                          ? "text-red-500 focus:ring-red-500"
                          : "text-orange-500 focus:ring-orange-500"
                      }`}
                    />

                    {photo ? (
                      <img
                        src={photo}
                        alt={displayTitle}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 flex-shrink-0">
                        No Pic
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-gray-900 truncate">
                          {displayTitle}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-100 text-orange-700">
                          RENT-{pid}
                        </span>
                        {isAlreadyLinked && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Linked
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{address}</p>
                      {Number(rent) > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          ₹{Number(rent).toLocaleString("en-IN")}/mo
                        </span>
                      )}
                    </div>
                  </div>

                  {isAlreadyLinked ? (
                    onUnlinkProperties ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlinkProperties(property);
                          handleClose();
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
                        if (linkCallback) {
                          linkCallback(property);
                        }
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
                {selectedPropertyIds.length > 0
                  ? `${toLink.length} to link, ${toUnlink.length} to unlink`
                  : "Create a new rental property?"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="px-3 py-1 text-xs rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                {toLink.length > 0 && (
                  <button
                    onClick={handleBulkLink}
                    className="px-3 py-1 text-xs rounded-lg text-white bg-[#e67e22] hover:bg-[#d35400] font-medium"
                  >
                    <span>Link Selected ({toLink.length})</span>
                  </button>
                )}
                {toUnlink.length > 0 && onUnlinkProperties && (
                  <button
                    onClick={handleBulkUnlink}
                    className="px-3 py-1 text-xs rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium"
                  >
                    <span>Unlink Selected ({toUnlink.length})</span>
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
                  <span>Create Rental</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-[10px] text-gray-500">
                {selectedPropertyIds.length > 0
                  ? `${toLink.length} to link, ${toUnlink.length} to unlink`
                  : "Select checkboxes to link or unlink multiple properties"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-1.5 text-xs rounded-lg border text-gray-600 hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                {toLink.length > 0 && (
                  <button
                    onClick={handleBulkLink}
                    className="px-4 py-1.5 text-xs rounded-lg text-white bg-[#e67e22] hover:bg-[#d35400] font-medium"
                  >
                    <span>Link Selected ({toLink.length})</span>
                  </button>
                )}
                {toUnlink.length > 0 && onUnlinkProperties && (
                  <button
                    onClick={handleBulkUnlink}
                    className="px-4 py-1.5 text-xs rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium"
                  >
                    <span>Unlink Selected ({toUnlink.length})</span>
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

export default LinkRentalPropertyModal;
