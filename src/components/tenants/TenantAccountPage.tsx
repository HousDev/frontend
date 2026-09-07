import React, { useState, useEffect, useMemo } from "react";
import {
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Key,
  BarChart3,
  User,
  MapPin,
  Home,
  Calendar,
  Heart,
  Building,
  X,
  Bed,
  Ruler,
  Sofa,
  Compass,
  Star,
  Info,
  Link2,
  Loader2,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "react-toastify";
import { tenantAPI } from "@/lib/tenantAPI";
import { rentalPropertiesAPI } from "@/lib/rentalPropertiesAPI";
import { tenantFollowupAPI } from "@/lib/tenantFollowupAPI";
import { tenantVisitAPI } from "@/lib/tenantVisitAPI";
import { tenantActivityAPI } from "@/lib/tenantActivityAPI";
import TenantFormModal from "./TenantFormModal";
import TenantVisitModal from "./TenantVisitModal";

// Imported modular tab components
import { Tenant, MatchedProperty } from "./tabs/types";
import TenantSidebar from "./tabs/TenantSidebar";
import TenantDashboardTab from "./tabs/TenantDashboardTab";
import TenantMatchedPropertiesTab from "./tabs/TenantMatchedPropertiesTab";
import TenantLinkedPropertyTab from "./tabs/TenantLinkedPropertyTab";
import TenantDocumentVaultTab from "./tabs/TenantDocumentVaultTab";
import TenantSiteVisitsTab from "./tabs/TenantSiteVisitsTab";
import TenantCalculatorsTab from "./tabs/TenantCalculatorsTab";
import TenantPaymentsTab from "./tabs/TenantPaymentsTab";
import TenantMaintenanceTab from "./tabs/TenantMaintenanceTab";
import TenantEnquiredPropertiesTab from "./tabs/TenantEnquiredPropertiesTab";
import TenantProfileTab from "./tabs/TenantProfileTab";

export type { Tenant };

interface TenantAccountPageProps {
  tenant: Tenant;
  onBack?: () => void;
  onUpdateTenant?: (updated: Tenant) => void;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  "Active Search": {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 size={11} />,
  },
  Interested: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    text: "text-amber-700",
    icon: <AlertCircle size={11} />,
  },
  "Agreement Signed": {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    text: "text-purple-700",
    icon: <Key size={11} />,
  },
  Inactive: {
    bg: "bg-gray-100 text-gray-600 border-gray-200",
    text: "text-gray-500",
    icon: <Clock size={11} />,
  },
};

export default function TenantAccountPage({
  tenant: initialTenant,
  onBack,
  onUpdateTenant,
}: TenantAccountPageProps) {
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  // Modals
  const [showVisitModal, setShowVisitModal] = useState<boolean>(false);
  const [showEmptyFavorites, setShowEmptyFavorites] = useState(false);
  const [selectedShortlistedProperty, setSelectedShortlistedProperty] =
    useState<MatchedProperty | null>(null);
  const [showPropertySidebar, setShowPropertySidebar] =
    useState<boolean>(false);

  // Rent Calculators State
  const [calcMonthlyIncome, setCalcMonthlyIncome] = useState<number>(90000);
  const [calcSecurityMonths] = useState<number>(3);

  // Properties & Timeline Data
  const [allRentalProperties, setAllRentalProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);
  const [, setFollowups] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [, setActivities] = useState<any[]>([]);
  const [linkingId, setLinkingId] = useState<number | string | null>(null);

  // Shortlist state - persists across tabs
  const [shortlistedIds, setShortlistedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [shortlistHydratedFor, setShortlistHydratedFor] = useState<
    number | string | null
  >(null);

  // Load saved shortlist before enabling persistence for this tenant.
  useEffect(() => {
    const saved = localStorage.getItem(`shortlisted_${tenant.id}`);
    setShortlistHydratedFor(null);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShortlistedIds(new Set(parsed));
      } catch (e) {
        console.error("Error loading shortlisted IDs:", e);
        setShortlistedIds(new Set());
      }
    } else {
      setShortlistedIds(new Set());
    }
    setShortlistHydratedFor(tenant.id);
  }, [tenant.id]);

  // Do not let the initial empty state overwrite saved shortlist data.
  useEffect(() => {
    if (shortlistHydratedFor !== tenant.id) return;
    localStorage.setItem(
      `shortlisted_${tenant.id}`,
      JSON.stringify(Array.from(shortlistedIds)),
    );
  }, [shortlistedIds, tenant.id, shortlistHydratedFor]);

  useEffect(() => {
    const savedProfileImage = localStorage.getItem(
      `tenant_profile_image_${initialTenant.id}`,
    );
    setTenant({
      ...initialTenant,
      profile_image: savedProfileImage || initialTenant.profile_image || "",
    });
  }, [initialTenant]);

  const loadRentalProperties = async () => {
    setLoadingProperties(true);
    try {
      const res = await rentalPropertiesAPI.getAll();
      setAllRentalProperties(res || []);
    } catch (err) {
      console.error("Error fetching rental properties:", err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadTimelineData = async () => {
    if (!tenant?.id) return;
    try {
      const [fData, vData, aData] = await Promise.all([
        tenantFollowupAPI.getByTenantId(tenant.id).catch(() => ({ data: [] })),
        tenantVisitAPI.getByTenantId(tenant.id).catch(() => ({ data: [] })),
        tenantActivityAPI.getByTenantId(tenant.id).catch(() => ({ data: [] })),
      ]);
      setFollowups(fData?.data || []);
      setVisits(vData?.data || []);
      setActivities(aData?.data || []);
    } catch (err) {
      console.error("Error loading timeline data:", err);
    }
  };

  useEffect(() => {
    loadRentalProperties();
    loadTimelineData();
  }, [tenant.id]);

  const fmtINR = (val: number | string) => {
    const n = Number(val);
    return n > 0 ? `₹${n.toLocaleString("en-IN")}` : "—";
  };

  const budgetMin = Number(tenant.budget_min) || 0;
  const budgetMax = Number(tenant.budget_max) || 0;

  const matchedProperties = useMemo<MatchedProperty[]>(() => {
    if (!allRentalProperties || allRentalProperties.length === 0) return [];

    const prefBhk = (tenant.preferred_bhk || "").toLowerCase().trim();
    const prefLoc = (tenant.preferred_location || "").toLowerCase().trim();

    return allRentalProperties
      .map((p: any) => {
        let score = 60;
        let reasons: string[] = [];
        const pType = (
          p.property_type_name ||
          p.property_type ||
          p.unit_type ||
          p.title ||
          ""
        ).toLowerCase();

        if (prefBhk && (pType.includes(prefBhk) || prefBhk.includes(pType))) {
          score += 25;
          reasons.push(`${tenant.preferred_bhk} BHK Match`);
        } else {
          reasons.push("Verified Rental Unit");
        }

        const rent = Number(
          p.expected_rent || p.monthly_rent || p.rent || p.price || 0,
        );
        if (rent > 0 && (budgetMin > 0 || budgetMax > 0)) {
          if (rent >= budgetMin && rent <= budgetMax) {
            score += 15;
            reasons.push("Exact Budget Match");
          } else if (rent <= budgetMax * 1.25 && rent >= budgetMin * 0.75) {
            score += 10;
            reasons.push("Near Budget");
          }
        }

        const pLoc = (
          p.location_name ||
          p.society_name ||
          p.address ||
          p.city_name ||
          ""
        ).toLowerCase();
        if (prefLoc && pLoc.includes(prefLoc)) {
          score += 10;
          reasons.push("Location Match");
        }

        return {
          ...p,
          matchScore: Math.min(99, Math.max(60, p.matchScore || score)),
          matchReasons: p.matchReasons || reasons,
        };
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore);
  }, [
    allRentalProperties,
    tenant.preferred_bhk,
    tenant.preferred_location,
    budgetMin,
    budgetMax,
  ]);

  // Get shortlisted properties
  const shortlistedProperties = useMemo(() => {
    return matchedProperties.filter((p) => shortlistedIds.has(p.id));
  }, [matchedProperties, shortlistedIds]);

  const handleLinkProperty = async (prop: MatchedProperty) => {
    try {
      setLinkingId(prop.id);
      const updatedData = {
        rental_property_id: prop.id,
        property_title:
          prop.title || prop.property_type_name || `RENT-${prop.id}`,
        owner_name: prop.seller_name || prop.owner_name || "Landlord",
      };
      await tenantAPI.update(tenant.id, updatedData);
      const updatedTenant = { ...tenant, ...updatedData };
      setTenant(updatedTenant);
      onUpdateTenant?.(updatedTenant);
      toast.success(`Linked property RENT-${prop.id} to ${tenant.name}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to link property");
    } finally {
      setLinkingId(null);
    }
  };

  const handleWhatsApp = () => {
    const phone = (tenant.whatsapp || tenant.phone || "").replace(/\D/g, "");
    if (!phone) {
      toast.error("No phone number available for WhatsApp");
      return;
    }

    let matchedPropsText = "";
    if (matchedProperties && matchedProperties.length > 0) {
      matchedPropsText =
        "\n\nWe found the following matching rental property options for you:\n" +
        matchedProperties
          .slice(0, 3)
          .map((p: MatchedProperty, idx: number) => {
            const title =
              p.title ||
              p.property_type_name ||
              p.unit_type ||
              `Rental Unit #${p.id}`;
            const location =
              p.location_name ||
              p.society_name ||
              p.address ||
              p.location ||
              "";
            const rent = Number(
              p.expected_rent || p.monthly_rent || p.rent || 0,
            );
            const rentStr =
              rent > 0
                ? `₹${rent.toLocaleString("en-IN")}/mo`
                : "Contact for Rent";
            return `${idx + 1}. *${title}*\n   📍 Location: ${location}\n   💰 Rent: ${rentStr}\n   ⭐ Match Score: ${p.matchScore}%`;
          })
          .join("\n\n");
    } else {
      matchedPropsText =
        "\n\nCurrently, we are searching for matching rental properties for you.";
    }

    const message = encodeURIComponent(
      `Hi ${tenant.name},\n\n` +
        `Welcome to your Tenant Account Portal!\n` +
        `Requirement: ${tenant.preferred_bhk || "BHK"} in ${tenant.preferred_location || "preferred location"}.\n` +
        `Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}/mo.` +
        `${matchedPropsText}\n\n` +
        `Best Regards,\nResaleExpert Team`,
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleSharePropertyWhatsApp = (p: MatchedProperty) => {
    const phone = (tenant.whatsapp || tenant.phone || "").replace(/\D/g, "");
    if (!phone) {
      toast.error("No phone number available for WhatsApp");
      return;
    }
    const propTitle =
      p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
    const propLoc =
      p.location_name || p.society_name || p.address || p.location || "";
    const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || 0);
    const rentStr =
      propRent > 0
        ? `₹${propRent.toLocaleString("en-IN")}/mo`
        : "Contact for Rent";

    const message = encodeURIComponent(
      `Hi ${tenant.name},\n\n` +
        `I found a rental property that matches your criteria!\n\n` +
        `🏠 *${propTitle}*\n` +
        `📍 Location: ${propLoc}\n` +
        `💰 Rent: ${rentStr}\n` +
        `⭐ Match Score: ${p.matchScore}%\n\n` +
        `Let me know if you would like to arrange a site visit.\n\n` +
        `Best Regards,\nResaleExpert Team`,
    );

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleCall = (phoneNumber?: string) => {
    const phone = (phoneNumber || tenant.phone || "").replace(/\D/g, "");
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error("No phone number available");
    }
  };

  const handleEmail = () => {
    if (!tenant.email) {
      toast.error("No email address available");
      return;
    }
    const subject = encodeURIComponent(
      `Tenant Portal Summary - ${tenant.name}`,
    );
    const body = encodeURIComponent(
      `Dear ${tenant.name},\n\n` +
        `Here is a summary of your Tenant Account Portal:\n` +
        `Tenant ID: ${tenant.tenant_id}\n` +
        `Preferred BHK: ${tenant.preferred_bhk || "Not specified"}\n` +
        `Preferred Location: ${tenant.preferred_location || "Not specified"}\n` +
        `Monthly Rent Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}/mo\n\n` +
        `Best Regards,\nResaleExpert Team`,
    );
    window.location.href = `mailto:${tenant.email}?subject=${subject}&body=${body}`;
  };

  const handleUpdateTenant = async (formData: any) => {
    try {
      const { profile_image, ...tenantData } = formData;
      await tenantAPI.update(tenant.id, tenantData);
      const updatedTenant = {
        ...tenant,
        ...formData,
        name:
          formData.name ||
          `${formData.first_name || ""} ${formData.last_name || ""}`.trim(),
      };
      if (profile_image) {
        localStorage.setItem(
          `tenant_profile_image_${tenant.id}`,
          profile_image,
        );
      }
      setTenant(updatedTenant);
      onUpdateTenant?.(updatedTenant);
      toast.success("Tenant profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update tenant profile");
    }
  };

  const statusInfo = statusConfig[tenant.status] ?? statusConfig["Inactive"];

  // Get image URL helper
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${process.env.NEXT_PUBLIC_API_URL || ""}${url}`;
  };

  // Open property detail sidebar
  const openPropertySidebar = (property: MatchedProperty) => {
    setSelectedShortlistedProperty(property);
    setShowPropertySidebar(true);
  };

  // Close property detail sidebar
  const closePropertySidebar = () => {
    setShowPropertySidebar(false);
    setSelectedShortlistedProperty(null);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 text-[11px] font-sans antialiased">
      {/* Sidebar Component */}
      <TenantSidebar
        tenant={tenant}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchedCount={matchedProperties.length}
        enquiredCount={
          matchedProperties.length > 0
            ? Math.min(2, matchedProperties.length)
            : 0
        }
        visitsCount={visits.length}
        onBack={onBack}
        showMobileSidebar={showMobileSidebar}
        setShowMobileSidebar={setShowMobileSidebar}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        {/* Compact Header Toolbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <BarChart3 size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base">
                  Tenant Workspace
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${statusInfo.bg}`}
                >
                  {statusInfo.icon}
                  <span>{tenant.status}</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-500 hidden sm:block">
                View matching rental listings, linked property agreement, site
                visits, and rental calculators.
              </p>
            </div>
          </div>

          {/* Action Buttons with Shortlist Count */}
          <div className="flex items-center gap-1.5">
            {/* Favorites Button - Heart outline when 0, filled when > 0 */}
            <button
              onClick={() =>
                shortlistedIds.size > 0
                  ? setActiveTab("favorites")
                  : setShowEmptyFavorites(true)
              }
              className="relative p-1.5 text-gray-700 hover:text-black transition-colors"
              title="View favorite properties"
              aria-label="View favorite properties"
            >
              {/* Always outline heart */}
              <Heart size={22} />

              {/* Red badge only */}
              {shortlistedIds.size > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none border-2 border-white">
                  {shortlistedIds.size}
                </span>
              )}
            </button>

            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-[10px] font-bold text-slate-900 truncate max-w-[120px]">
                {tenant.name ||
                  `${tenant.first_name || ""} ${tenant.last_name || ""}`.trim() ||
                  "Tenant"}
              </span>
            </div>
            <button
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2 pl-1 pr-0 py-1 transition-colors"
              title="Open Profile & Preferences"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                {tenant.profile_image ? (
                  <img
                    src={tenant.profile_image}
                    alt="Tenant profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  `${tenant.first_name || tenant.name?.split(" ")[0] || ""} ${tenant.last_name || tenant.name?.split(" ").slice(1).join(" ") || ""}`.trim() ||
                  "Tenant"
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 scrollbar-custom-vertical">
          {activeTab === "dashboard" && (
            <TenantDashboardTab
              tenant={tenant}
              matchedProperties={matchedProperties}
              loadingProperties={loadingProperties}
              linkingId={linkingId}
              onNavigateTab={setActiveTab}
              onShareWhatsApp={handleSharePropertyWhatsApp}
              onLinkProperty={handleLinkProperty}
              fmtINR={fmtINR}
              budgetMin={budgetMin}
              budgetMax={budgetMax}
            />
          )}

          {activeTab === "matched" && (
            <TenantMatchedPropertiesTab
              matchedProperties={matchedProperties}
              linkingId={linkingId}
              onShareWhatsApp={handleSharePropertyWhatsApp}
              onLinkProperty={handleLinkProperty}
              onSendAllWhatsApp={handleWhatsApp}
              shortlistedIds={shortlistedIds}
              onToggleShortlist={(id) => {
                setShortlistedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              }}
            />
          )}

          {activeTab === "enquired" && (
            <TenantEnquiredPropertiesTab
              enquiredProperties={matchedProperties.slice(0, 2)}
              linkingId={linkingId}
              onShareWhatsApp={handleSharePropertyWhatsApp}
              onLinkProperty={handleLinkProperty}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === "favorites" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  My Favorite Properties
                </h2>
                {shortlistedIds.size > 0 && (
                  <button
                    onClick={() => setActiveTab("matched")}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View All Properties →
                  </button>
                )}
              </div>

              {/* Favorites Content */}
              {shortlistedIds.size === 0 ? (
                // Empty State
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-32 h-32 mb-4 relative">
                      <img
                        src="/img2.jpg"
                        alt="No properties"
                        className="w-full h-full object-contain opacity-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      You Don't Have Any Favorite Properties
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm mb-4">
                      Start exploring properties and click the heart icon to
                      save your favorites here.
                    </p>
                    <button
                      onClick={() => setActiveTab("matched")}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
                    >
                      View Properties
                    </button>
                  </div>
                </div>
              ) : (
                // Shortlisted Properties Grid
                <div className="grid grid-cols-1 gap-3">
                  {shortlistedProperties.map((property) => {
                    const rawPhoto =
                      property.photos?.[0] ??
                      property.images?.[0] ??
                      property.mediaItems?.[0]?.file_path ??
                      null;
                    const photoUrl =
                      typeof rawPhoto === "string"
                        ? rawPhoto
                        : ((rawPhoto as any)?.url ?? null);
                    const img = getImageUrl(photoUrl);
                    const propertyName =
                      property.society_name ||
                      property.title ||
                      `Property #${property.id}`;
                    const location =
                      [property.location_name, property.city_name]
                        .filter(Boolean)
                        .join(", ") || "Location";
                    const price = Number(
                      property.monthly_rent ||
                        property.expected_rent ||
                        property.price ||
                        0,
                    );
                    const phone =
                      property.contact_number ||
                      property.phone ||
                      tenant.phone ||
                      "";

                    return (
                      <div
                        key={property.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-3 flex items-center gap-4 cursor-pointer"
                        onClick={() => openPropertySidebar(property)}
                      >
                        {/* Property Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                          {img ? (
                            <img
                              src={img}
                              alt={propertyName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building size={24} className="text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Property Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {propertyName}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <MapPin
                              size={12}
                              className="text-orange-400 shrink-0"
                            />
                            <span className="truncate">{location}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {price > 0 && (
                              <span className="text-xs font-bold text-green-600">
                                ₹{price.toLocaleString("en-IN")}/mo
                              </span>
                            )}
                            {property.matchScore && (
                              <span className="text-[9px] font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                                {property.matchScore}% Match
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div
                          className="flex items-center gap-1.5 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleCall(phone)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all"
                            aria-label="Call"
                          >
                            <Phone size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleSharePropertyWhatsApp(property)
                            }
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 transition-all"
                            aria-label="WhatsApp"
                          >
                            <SiWhatsapp size={15} />
                          </button>
                          <button
                            onClick={() =>
                              shortlistedIds.size > 0
                                ? setActiveTab("favorites")
                                : setShowEmptyFavorites(true)
                            }
                            className={`relative flex items-center gap-1.5 px-1 py-1 transition-colors ${
                              shortlistedIds.size > 0
                                ? "text-red-600 hover:text-red-700"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                            title="View favorite properties"
                            aria-label="View favorite properties"
                          >
                            <Heart
                              size={18}
                              className={
                                shortlistedIds.size > 0 ? "fill-red-500" : ""
                              }
                            />
                            <span className="text-[10px] font-bold">
                              {shortlistedIds.size}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "linked" && (
            <TenantLinkedPropertyTab tenant={tenant} />
          )}

          {activeTab === "payments" && (
            <TenantPaymentsTab tenant={tenant} fmtINR={fmtINR} />
          )}

          {activeTab === "maintenance" && (
            <TenantMaintenanceTab tenant={tenant} />
          )}

          {activeTab === "documents" && (
            <TenantDocumentVaultTab tenant={tenant} />
          )}

          {activeTab === "visits" && (
            <TenantSiteVisitsTab
              visits={visits}
              onScheduleVisit={() => setShowVisitModal(true)}
            />
          )}

          {activeTab === "calculators" && (
            <TenantCalculatorsTab
              calcMonthlyIncome={calcMonthlyIncome}
              setCalcMonthlyIncome={setCalcMonthlyIncome}
              calcSecurityMonths={calcSecurityMonths}
              budgetMax={budgetMax}
            />
          )}

          {activeTab === "profile" && (
            <TenantFormModal
              isOpen={true}
              mode="edit"
              initialData={tenant}
              onSubmit={handleUpdateTenant}
              inline={true}
            >
              <TenantProfileTab
                tenant={tenant}
                matchedProperties={matchedProperties}
              />
            </TenantFormModal>
          )}
        </main>
      </div>

      {/* Empty Favorites Modal */}
      {showEmptyFavorites && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setShowEmptyFavorites(false)}
        >
          <div
            className="relative w-full max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-white text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-300 px-4 py-2">
              <h2 className="flex-1 text-base font-medium text-gray-900">
                My Favorite Properties
              </h2>
              <button
                onClick={() => setShowEmptyFavorites(false)}
                className="p-1 text-gray-500 hover:text-gray-900"
                aria-label="Close favorite properties"
              >
                <X size={15} />
              </button>
            </div>
            <div className="px-4 pb-4 pt-3">
              <img
                src="/img2.jpg"
                alt="No favorite properties"
                className="mx-auto h-36 w-44 object-contain"
              />
              <p className="mt-2 text-sm font-bold leading-5 text-[#e69a1f]">
                You Don&apos;t Have Any Favorite Properties Or Projects.
              </p>
              <button
                onClick={() => {
                  setShowEmptyFavorites(false);
                  setActiveTab("matched");
                }}
                className="mt-4 rounded-lg border border-slate-400 bg-slate-50 px-8 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                View Properties
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Detail Sidebar */}
      {showPropertySidebar && selectedShortlistedProperty && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={closePropertySidebar}
          />

          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-10">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Info size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Property Details
                    </h2>
                    <p className="text-[10px] text-gray-400">
                      View complete property information
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePropertySidebar}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Property Image */}
              <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                {getImageUrl(
                  selectedShortlistedProperty.photos?.[0] ||
                    selectedShortlistedProperty.images?.[0] ||
                    selectedShortlistedProperty.mediaItems?.[0]?.file_path ||
                    null,
                ) ? (
                  <img
                    src={getImageUrl(
                      selectedShortlistedProperty.photos?.[0] ||
                        selectedShortlistedProperty.images?.[0] ||
                        selectedShortlistedProperty.mediaItems?.[0]
                          ?.file_path ||
                        null,
                    )}
                    alt={selectedShortlistedProperty.society_name || "Property"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building size={48} className="text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-xl font-black">
                    ₹
                    {Number(
                      selectedShortlistedProperty.monthly_rent ||
                        selectedShortlistedProperty.expected_rent ||
                        selectedShortlistedProperty.price ||
                        0,
                    ).toLocaleString("en-IN")}
                    <span className="text-xs font-semibold opacity-80">
                      /mo
                    </span>
                  </p>
                </div>
                {selectedShortlistedProperty.matchScore && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur-sm">
                    <Star size={11} className="fill-white" />
                    {selectedShortlistedProperty.matchScore}% Match
                  </div>
                )}
                <button
                  onClick={() => {
                    setShortlistedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(selectedShortlistedProperty.id)) {
                        next.delete(selectedShortlistedProperty.id);
                      } else {
                        next.add(selectedShortlistedProperty.id);
                      }
                      return next;
                    });
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
                >
                  <Heart
                    size={16}
                    className={
                      shortlistedIds.has(selectedShortlistedProperty.id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }
                  />
                </button>
              </div>

              {/* Property Title & Location */}
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedShortlistedProperty.society_name ||
                    selectedShortlistedProperty.title ||
                    `Property #${selectedShortlistedProperty.id}`}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin size={13} className="text-orange-400 shrink-0" />
                  <span>
                    {[
                      selectedShortlistedProperty.location_name,
                      selectedShortlistedProperty.city_name,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Location"}
                  </span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                  <div className="text-[8px] text-slate-500 uppercase font-semibold">
                    Type
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {selectedShortlistedProperty.property_type_name || "—"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                  <div className="text-[8px] text-slate-500 uppercase font-semibold">
                    Area
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {selectedShortlistedProperty.carpet_area ||
                      selectedShortlistedProperty.builtup_area ||
                      "—"}{" "}
                    sq.ft
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                  <div className="text-[8px] text-slate-500 uppercase font-semibold">
                    Furnishing
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {selectedShortlistedProperty.furnishing || "—"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                  <div className="text-[8px] text-slate-500 uppercase font-semibold">
                    Facing
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {selectedShortlistedProperty.facing || "—"}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-slate-500">Deposit</span>
                  <span className="text-xs font-bold text-slate-800">
                    ₹
                    {Number(
                      (selectedShortlistedProperty as any).security_deposit ||
                        (selectedShortlistedProperty as any).deposit ||
                        Number(
                          selectedShortlistedProperty.monthly_rent ||
                            selectedShortlistedProperty.expected_rent ||
                            selectedShortlistedProperty.price ||
                            0,
                        ) * 2,
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-slate-500">Available</span>
                  <span className="text-xs font-bold text-slate-800">
                    {(selectedShortlistedProperty as any).available_from ||
                      "Immediate"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 col-span-2">
                  <span className="text-[10px] text-slate-500">Tenants</span>
                  <span className="text-xs font-bold text-slate-800">
                    {(selectedShortlistedProperty as any).preferred_tenants ||
                      "Family / Bachelors"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedShortlistedProperty.description && (
                <div>
                  <p className="text-[10px] font-bold text-slate-800 mb-1">
                    Description
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedShortlistedProperty.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() =>
                    handleCall(
                      selectedShortlistedProperty.contact_number ||
                        selectedShortlistedProperty.phone ||
                        tenant.phone,
                    )
                  }
                  className="flex-1 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
                >
                  <Phone size={15} />
                  Call
                </button>
                <button
                  onClick={() =>
                    handleSharePropertyWhatsApp(selectedShortlistedProperty)
                  }
                  className="flex-1 h-10 rounded-xl bg-green-50 border border-green-200 text-green-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-all"
                >
                  <SiWhatsapp size={16} />
                  WhatsApp
                </button>
                <button
                  onClick={() =>
                    handleLinkProperty(selectedShortlistedProperty)
                  }
                  disabled={linkingId === selectedShortlistedProperty.id}
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {linkingId === selectedShortlistedProperty.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <Link2 size={15} />
                      Link Property
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Visit Modal Only */}
      {showVisitModal && (
        <TenantVisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          tenant={tenant}
          onSave={() => loadTimelineData()}
        />
      )}

      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-in.slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
        .animate-in.fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
