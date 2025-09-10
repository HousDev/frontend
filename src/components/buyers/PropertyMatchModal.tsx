import React, { useEffect, useMemo, useState } from "react";
import {
  X, Target, Search, Filter, Star, Building, MapPin, Eye,
  Bookmark, Send, Phone, MessageCircle, Calendar
} from "lucide-react";
import { useProperties } from "@/hooks/properties"; // <- adjust if needed

type PropertyMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  buyer: any;
};

const PropertyMatchModal: React.FC<PropertyMatchModalProps> = ({ isOpen, onClose, buyer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [budgetTolerancePct, setBudgetTolerancePct] = useState<number>(0); // optional ±% widen

  const {
    properties,
    loadingProps,
    propsError,
    fetchProperties,
    utils,
  } = useProperties({ autoLog: false });

  const {
    makeItem,
    isWithinBuyerBudget,
    formatCurrency,
    norm,
    toArr,
  } = utils;

  // modal खुलते ही refresh (optional; hook already auto-fetches on mount)
  useEffect(() => {
    if (isOpen) fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);


  // server data → normalized items
  const items = useMemo(() => {
    return Array.isArray(properties) ? properties.map((p) => makeItem(p, buyer)) : [];
  }, [properties, buyer, makeItem]);

  // ----- buyer-based filter helpers -----
  const buyerMin = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? 0);
  const buyerMax = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? 0);
  const hasBuyerMin = Number.isFinite(buyerMin) && buyerMin > 0;
  const hasBuyerMax = Number.isFinite(buyerMax) && buyerMax > 0;

  const req = buyer?.requirements || {};
  const reqLocs = toArr(req.preferredLocations).map(norm);
  const reqUnits = toArr(req.unitTypes).map(norm);
  const reqFurn = norm(req.furnishing);
  const reqType = norm(req.propertyType);

  // Optional: widen budget window by ±%
  const lower = hasBuyerMin ? Math.floor(buyerMin * (1 - budgetTolerancePct / 100)) : 0;
  const upper = hasBuyerMax ? Math.ceil(buyerMax * (1 + budgetTolerancePct / 100)) : Number.POSITIVE_INFINITY;
  const budgetMatchesWithTol = (price: number) => price >= lower && price <= upper;


  // text search
  const q = norm(searchTerm);

  const filtered = useMemo(() => {
    return items
      .filter((it) => {
        const price = Number(it.price || 0);

        // 1) Budget (hard)
        if (hasBuyerMin && price < buyerMin) return false;
        if (hasBuyerMax && price > buyerMax) return false;

        // 1b) tolerance
        if (budgetTolerancePct > 0 && !budgetMatchesWithTol(price)) return false;

        // 2) Location
        if (reqLocs.length) {
          const addr = norm(it.address);
          const locHit = reqLocs.some((loc) => addr.includes(loc));
          if (!locHit) return false;
        }

        // 3) Unit Types
        if (reqUnits.length) {
          const sz = norm(it.size);
          const unitHit = reqUnits.some((u) => sz.includes(u));
          if (!unitHit) return false;
        }

        // 4) Furnishing (optional)
        if (reqFurn) {
          const reasonsBlob = (it.reasons || []).join(" ").toLowerCase();
          if (reasonsBlob.includes(reqFurn)) {
            it.matchScore = Math.min(100, (it.matchScore || 80) + 5);
          }
        }

        // 5) PropertyType (commented out for now)
        // if (reqType) {
        //   const title = norm(it.title);
        //   const reasonsBlob = (it.reasons || []).join(" ").toLowerCase();
        //   if (!title.includes(reqType) && !reasonsBlob.includes(reqType)) {
        //     return false;
        //   }
        // }

        // 6) Text search
        if (q) {
          const hay = `${norm(it.title)} ${norm(it.address)} ${norm(it.seller)} ${norm(
            it.statusText
          )} ${norm(it.size)}`;
          if (!hay.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // primary: matchScore desc
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;

        // secondary: closeness to mid budget
        if (hasBuyerMin && hasBuyerMax) {
          const mid = (buyerMin + buyerMax) / 2;
          const da = Math.abs((a.price || 0) - mid);
          const db = Math.abs((b.price || 0) - mid);
          if (da !== db) return da - db;
        }

        // tertiary: price asc
        return (a.price || 0) - (b.price || 0);
      });
  }, [
    items,
    buyer,
    reqLocs,
    reqUnits,
    reqFurn,
    reqType,
    q,
    budgetTolerancePct,
    lower,
    upper,
    hasBuyerMin,
    hasBuyerMax,
    buyerMin,
    buyerMax,
  ]);



  const handlePropertySelection = (id: string) =>
    setSelectedProperties((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSendToSelected = () => {
    if (!selectedProperties.length) {
      alert("Please select properties to send to buyer");
      return;
    }
    const selected = filtered.filter((p) => selectedProperties.includes(p.id));
    console.log("Sending to buyer:", selected);
    alert(`${selectedProperties.length} properties sent to ${buyer?.name || "buyer"}.`);
    setSelectedProperties([]);
  };

  const handleContactSeller = (it: any) => {
    const clean = String(it.sellerPhone || "").replace(/\D/g, "");
    if (!clean) return;
    const msg = `Hi ${it.seller || "there"}, ${buyer?.name || "buyer"} is interested in your property "${it.title}". Budget: ${formatCurrency(buyerMin)} - ${formatCurrency(buyerMax)}. Can we schedule a visit?`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!isOpen || !buyer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="text-purple-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Property Matching</h2>
                <p className="text-gray-600 text-xs">Find perfect properties for {buyer?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white hover:bg-gray-50 shadow">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Buyer summary */}
          <div className="bg-purple-50 rounded-lg p-3 mb-4">
            <h3 className="font-semibold text-purple-900 mb-2 text-xs">
              BUYER REQUIREMENTS
            </h3>

            {/* ✅ sab ek row me flex se */}
            <div className="flex flex-wrap gap-4 text-xs items-center">
              <div>
                <span className="text-purple-600">Budget:</span>
                <span className="font-bold text-purple-900 ml-1">
                  {formatCurrency(buyerMin)} - {formatCurrency(buyerMax)}
                </span>
              </div>

              <div>
                <span className="text-purple-600">Unit Types:</span>
                <span className="font-bold text-purple-900 ml-1">
                  {Array.isArray(buyer?.requirements?.unitTypes) &&
                    buyer.requirements.unitTypes.length > 0
                    ? buyer.requirements.unitTypes.join(", ")
                    : "—"}
                </span>
              </div>

              <div>
                <span className="text-purple-600">Locations:</span>
                <span className="font-bold text-purple-900 ml-1">
                  {toArr(buyer?.requirements?.preferredLocations).slice(0, 2).join(", ") ||
                    "—"}
                  {toArr(buyer?.requirements?.preferredLocations).length > 2 &&
                    ` +${toArr(buyer?.requirements?.preferredLocations).length - 2}`}
                </span>
              </div>

              {/* ✅ ab yeh bhi ek row ka item ban gaya */}
              <div className="flex items-center gap-2 text-[11px] text-purple-800">
                <span>Budget tolerance (±%)</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  className="w-14 px-2 py-1 border border-purple-200 rounded"
                  value={budgetTolerancePct}
                  onChange={(e) =>
                    setBudgetTolerancePct(
                      Math.max(0, Math.min(50, Number(e.target.value) || 0))
                    )
                  }
                />
              </div>
            </div>




          </div>


          {/* ✅ Stats + Search/Actions Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-shrink-0">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600">Perfect Match</p>
                    <p className="text-lg font-bold text-green-900">
                      {filtered.filter((p) => p.matchScore >= 90).length}
                    </p>
                  </div>
                  <Target className="text-green-600" size={18} />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600">Good Match</p>
                    <p className="text-lg font-bold text-blue-900">
                      {filtered.filter((p) => p.matchScore >= 80 && p.matchScore < 90).length}
                    </p>
                  </div>
                  <Star className="text-blue-600" size={18} />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-600">Total Found</p>
                    <p className="text-lg font-bold text-purple-900">{filtered.length}</p>
                  </div>
                  <Eye className="text-purple-600" size={18} />
                </div>
              </div>
            </div>

            {/* Search + Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs"
                />
              </div>

              {/* Filters Button */}
              <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-xs">
                <Filter size={14} />
                <span>Filters</span>
              </button>

              {/* Send Button */}
              {selectedProperties.length > 0 && (
                <button
                  onClick={handleSendToSelected}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs"
                >
                  <Send size={14} />
                  <span>Send {selectedProperties.length}</span>
                </button>
              )}
            </div>
          </div>





          {/* Loading / Error */}
          {loadingProps && (
            <div className="text-center py-8 text-xs text-gray-600">Loading properties…</div>
          )}
          {propsError && !loadingProps && (
            <div className="text-center py-8 text-xs text-red-600">{propsError}</div>
          )}

          {/* List */}
          {!loadingProps && !propsError && (
            <>
              <div className="space-y-3">
                {filtered.map((it) => (
                  <div key={it.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(it.id)}
                          onChange={() => handlePropertySelection(it.id)}
                          className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />

                        <div className="w-20 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {it.photo ? (
                            <img
                              src={it.photo}
                              alt={it.title}
                              className="w-full h-full object-cover"
                              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                            />
                          ) : null}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-base truncate">{it.title}</h4>
                              <div className="flex items-center gap-1 text-gray-600 mt-0.5 text-xs">
                                <MapPin size={12} />
                                <span className="truncate">{it.address || "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div
                                  className={`px-2 py-0.5 rounded-full border text-xs font-bold ${it.matchScore >= 90
                                    ? "text-green-600 bg-green-100 border-green-200"
                                    : it.matchScore >= 80
                                      ? "text-blue-600 bg-blue-100 border-blue-200"
                                      : it.matchScore >= 70
                                        ? "text-orange-600 bg-orange-100 border-orange-200"
                                        : "text-red-600 bg-red-100 border-red-200"
                                    }`}
                                >
                                  {it.matchScore}% Match
                                </div>

                                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  {it.statusText}
                                </span>
                              </div>

                            </div>
                            <div className="text-right pl-2">
                              <div className="text-lg font-bold text-green-600">{formatCurrency(it.price)}</div>
                              <div className="text-xs text-gray-500">{it.size}</div>
                            </div>
                          </div>

                          {/* Quick attributes */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                            <div className="truncate">
                              <span className="text-gray-500">Floor:</span>
                              <span className="font-medium ml-0.5">{it.floorLine || "—"}</span>
                            </div>
                            <div className="truncate">
                              <span className="text-gray-500">Facing:</span>
                              <span className="font-medium ml-0.5">{it.facing}</span>
                            </div>
                            <div className="truncate">
                              <span className="text-gray-500">Parking:</span>
                              <span className="font-medium ml-0.5">{it.parking || "—"}</span>
                            </div>
                            <div className="truncate">
                              <span className="text-gray-500">Possession:</span>
                              <span className="font-medium ml-0.5">{it.possession}</span>
                            </div>
                          </div>

                          {/* Why it matches */}
                          {!!it.reasons?.length && (
                            <div className="mb-3">
                              <div className="text-xs text-gray-500 mb-1">Why it matches:</div>
                              <div className="flex flex-wrap gap-1">
                                {it.reasons.slice(0, 5).map((r: string, idx: number) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Seller */}
                          <div className="mb-3 p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="truncate">
                                <div className="text-xs font-medium text-gray-900 truncate">Seller: {it.seller}</div>
                                <div className="text-xs text-gray-600 truncate">{it.sellerPhone || "—"}</div>
                              </div>
                              {it.sellerPhone && (
                                <button
                                  onClick={() => handleContactSeller(it)}
                                  className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs"
                                >
                                  <MessageCircle size={10} />
                                  <span>Contact</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center flex-wrap gap-1.5">
                            <button className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs">
                              <Calendar size={12} />
                              <span>Visit</span>
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs">
                              <Bookmark size={12} />
                              <span>Shortlist</span>
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs">
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                            {it.sellerPhone && (
                              <button
                                onClick={() => handleContactSeller(it)}
                                className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs"
                              >
                                <Phone size={12} />
                                <span>Call</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <Building className="mx-auto text-gray-300 mb-3" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No matching properties found</h3>
                  <p className="text-gray-500 text-xs">
                    Adjust the search or widen the budget tolerance.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {filtered.length} properties found • {selectedProperties.length} selected
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-xs">
                Close
              </button>
              {selectedProperties.length > 0 && (
                <button
                  onClick={handleSendToSelected}
                  className="flex items-center gap-1 px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs"
                >
                  <Send size={14} />
                  <span>Send to Buyer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMatchModal;
