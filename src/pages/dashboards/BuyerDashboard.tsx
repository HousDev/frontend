// src/pages/dashboard/BuyerDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Heart,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  ArrowRight,
  Plus,
  Filter,
  Bookmark,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, leadsAPI } from "@/lib/api";
import { propertiesAPI } from "@/lib/propertiesAPI";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "@/hooks/useToast";

interface BuyerStats {
  saved_properties?: number;
  viewed_properties?: number;
  scheduled_viewings?: number;
  budget_range?: { min?: number; max?: number };
  search_criteria?: { location?: string; property_type?: string; bedrooms?: number };
  recommendations?: number;
}

const emptyStats: BuyerStats = {
  saved_properties: 0,
  viewed_properties: 0,
  scheduled_viewings: 0,
  budget_range: { min: 0, max: 0 },
  search_criteria: { location: "", property_type: "", bedrooms: 0 },
  recommendations: 0,
};

const parseResp = (r: any) => {
  if (!r) return null;
  if (typeof r !== "object") return null;
  // axios-like shape
  if (r.data !== undefined) return r.data;
  return r;
};

const getPropertyTypeIcon = (type?: string) => {
  switch ((type || "").toLowerCase()) {
    case "apartment":
      return "🏢";
    case "house":
      return "🏠";
    case "condo":
      return "🏘️";
    case "townhouse":
      return "🏡";
    default:
      return "🏢";
  }
};

const formatPrice = (price?: number) => {
  if (price === null || price === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
};

const safeDate = (s?: string | null) => {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<BuyerStats>(emptyStats);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<any[]>([]);
  const [upcomingViewings, setUpcomingViewings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let shownToast = false;
    const showErrorOnce = (msg: string) => {
      if (!shownToast) {
        toast.error(msg);
        shownToast = true;
      }
    };

    const fetchBuyerData = async () => {
      if (isMounted) setLoading(true);

      // 1) Try primary stats endpoint
      let buyerPayload: any = null;
      try {
        const resp = await dashboardAPI.getBuyerStats().catch((e: any) => {
          console.warn("dashboardAPI.getBuyerStats error:", e);
          return null;
        });
        buyerPayload = parseResp(resp);
        // if explicit success:false treat as missing
        if (buyerPayload?.success === false) {
          console.warn("getBuyerStats returned success:false", buyerPayload.message ?? buyerPayload);
          buyerPayload = null;
        }
      } catch (err) {
        console.warn("Error calling getBuyerStats:", err);
        buyerPayload = null;
      }

      // 2) Try list endpoints in parallel (we'll use them both for data and fallbacks)
      let savedResp: any = null;
      let recommendedResp: any = null;
      let viewingsResp: any = null;

      try {
        const [sResp, rResp, vResp] = await Promise.all([
          propertiesAPI.getSavedProperties?.().catch((e: any) => { console.warn("propertiesAPI.getSavedProperties error", e); return null; }),
          propertiesAPI.getRecommendedProperties?.().catch((e: any) => { console.warn("propertiesAPI.getRecommendedProperties error", e); return null; }),
          leadsAPI.getScheduledViewings?.().catch((e: any) => { console.warn("leadsAPI.getScheduledViewings error", e); return null; }),
        ]);

        savedResp = parseResp(sResp);
        recommendedResp = parseResp(rResp);
        viewingsResp = parseResp(vResp);
      } catch (err) {
        console.warn("Error fetching lists in parallel:", err);
      }

      // 3) If primary stats available and has fields, normalize and use
      if (buyerPayload && (buyerPayload.saved_properties !== undefined || buyerPayload.viewed_properties !== undefined || buyerPayload.scheduled_viewings !== undefined || buyerPayload.budget_range !== undefined)) {
        const normalized: BuyerStats = {
          saved_properties: buyerPayload.saved_properties ?? buyerPayload.savedProperties ?? buyerPayload.saved ?? emptyStats.saved_properties,
          viewed_properties: buyerPayload.viewed_properties ?? buyerPayload.viewedProperties ?? buyerPayload.viewed ?? emptyStats.viewed_properties,
          scheduled_viewings: buyerPayload.scheduled_viewings ?? buyerPayload.scheduledViewings ?? buyerPayload.viewings ?? emptyStats.scheduled_viewings,
          budget_range: buyerPayload.budget_range ?? buyerPayload.budgetRange ?? emptyStats.budget_range,
          search_criteria: buyerPayload.search_criteria ?? buyerPayload.searchCriteria ?? emptyStats.search_criteria,
          recommendations: buyerPayload.recommendations ?? buyerPayload.recommended_count ?? emptyStats.recommendations,
        };
        if (isMounted) setStats((prev) => ({ ...prev, ...normalized }));
      } else {
        // 4) Fallback: derive totals from lists or endpoints if stats not present
        console.warn("buyer stats endpoint missing/unexpected — using list-based fallbacks");
        try {
          if (savedResp) {
            const savedArr = Array.isArray(savedResp) ? savedResp : Array.isArray(savedResp.data) ? savedResp.data : null;
            if (Array.isArray(savedArr) && isMounted) {
              setSavedProperties(savedArr.slice(0, 4));
              setStats((prev) => ({ ...prev, saved_properties: savedArr.length }));
            }
          }
          if (recommendedResp) {
            const recArr = Array.isArray(recommendedResp) ? recommendedResp : Array.isArray(recommendedResp.data) ? recommendedResp.data : null;
            if (Array.isArray(recArr) && isMounted) {
              setRecommendedProperties(recArr.slice(0, 4));
              setStats((prev) => ({ ...prev, recommendations: recArr.length }));
            }
          }
          if (viewingsResp) {
            const viewArr = Array.isArray(viewingsResp) ? viewingsResp : Array.isArray(viewingsResp.data) ? viewingsResp.data : null;
            if (Array.isArray(viewArr) && isMounted) {
              setUpcomingViewings(viewArr.slice(0, 5));
              setStats((prev) => ({ ...prev, scheduled_viewings: viewArr.length }));
            }
          }
        } catch (err) {
          console.warn("Fallback computation failed:", err);
          showErrorOnce("Failed to load buyer dashboard data");
        }
      }

      // 5) Ensure lists are set (try again if they were null earlier)
      try {
        if (!savedProperties.length) {
          const sResp2 = await propertiesAPI.getSavedProperties?.().catch((e: any) => { console.warn("saved props retry error", e); return null; });
          const sData = parseResp(sResp2);
          const savedArr2 = Array.isArray(sData) ? sData : Array.isArray(sData?.data) ? sData.data : null;
          if (Array.isArray(savedArr2) && isMounted) {
            setSavedProperties(savedArr2.slice(0, 4));
            setStats((prev) => ({ ...prev, saved_properties: savedArr2.length }));
          }
        }

        if (!recommendedProperties.length) {
          const rResp2 = await propertiesAPI.getRecommendedProperties?.().catch((e: any) => { console.warn("recommended props retry error", e); return null; });
          const rData = parseResp(rResp2);
          const recArr2 = Array.isArray(rData) ? rData : Array.isArray(rData?.data) ? rData.data : null;
          if (Array.isArray(recArr2) && isMounted) {
            setRecommendedProperties(recArr2.slice(0, 4));
            setStats((prev) => ({ ...prev, recommendations: recArr2.length }));
          }
        }

        if (!upcomingViewings.length) {
          const vResp2 = await leadsAPI.getScheduledViewings?.().catch((e: any) => { console.warn("viewings retry error", e); return null; });
          const vData = parseResp(vResp2);
          const viewArr2 = Array.isArray(vData) ? vData : Array.isArray(vData?.data) ? vData.data : null;
          if (Array.isArray(viewArr2) && isMounted) {
            setUpcomingViewings(viewArr2.slice(0, 5));
            setStats((prev) => ({ ...prev, scheduled_viewings: viewArr2.length }));
          }
        }
      } catch (err) {
        console.warn("Retry lists failed:", err);
      }

      if (isMounted) setLoading(false);
    };

    if (user) {
      fetchBuyerData().catch((e) => {
        console.error("fetchBuyerData top-level error:", e);
        showErrorOnce("Failed to load buyer dashboard data");
        if (isMounted) setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Home, {user?.first_name ?? "User"}!</h1>
          <p className="text-gray-600 mt-1">Discover properties that match your preferences</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/dashboard/properties">
            <Button className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search Properties</span>
            </Button>
          </Link>
          <Link to="/dashboard/activities">
            <Button variant="outline" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule Viewing</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Preferences Alert */}
      {stats?.search_criteria && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <span className="text-blue-800 font-medium">
                Your search: {stats.search_criteria?.bedrooms ?? 0}+ bedrooms in {stats.search_criteria?.location ?? "anywhere"}
              </span>
              <span className="text-blue-600 ml-2">({stats.recommendations ?? 0} new matches)</span>
            </div>
            <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saved Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.saved_properties ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">In your favorites</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties Viewed</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.viewed_properties ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Building className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Total properties explored</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled Viewings</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.scheduled_viewings ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Upcoming appointments</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Range</p>
              <p className="text-lg font-bold text-gray-900">
                {stats?.budget_range ? `${formatPrice(stats.budget_range?.min)} - ${formatPrice(stats.budget_range?.max)}` : "Not set"}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Your price range</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Properties */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-red-500" />
              Saved Properties
            </h3>
            <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedProperties.length > 0 ? (
              savedProperties.map((property) => (
                <div key={property.id ?? JSON.stringify(property)} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 flex items-center justify-center">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl">{getPropertyTypeIcon(property.type)}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm">{property.title ?? "Untitled"}</h4>
                    <p className="text-xs text-gray-600 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location ?? property.address ?? "-"}
                    </p>
                    <p className="text-sm font-bold text-green-600 mt-2">{formatPrice(property.price)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No saved properties yet</p>
                <Link to="/dashboard/properties">
                  <Button className="mt-3">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Properties */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Recommended for You
            </h3>
            <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedProperties.length > 0 ? (
              recommendedProperties.map((property) => (
                <div key={property.id ?? JSON.stringify(property)} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 flex items-center justify-center relative">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl">{getPropertyTypeIcon(property.type)}</span>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        {property.match_score ?? 95}% Match
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm">{property.title ?? "Untitled"}</h4>
                    <p className="text-xs text-gray-600 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location ?? property.address ?? "-"}
                    </p>
                    <p className="text-sm font-bold text-green-600 mt-2">{formatPrice(property.price)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recommendations yet</p>
                <p className="text-sm text-gray-400 mt-1">Update your preferences to get personalized recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Viewings */}
      {upcomingViewings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Upcoming Viewings
            </h3>
            <Link to="/dashboard/activities" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingViewings.map((viewing) => (
              <div key={viewing.id ?? JSON.stringify(viewing)} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{viewing.property_title ?? "Property Viewing"}</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {viewing.location ?? viewing.address ?? "-"}
                    </p>
                    <p className="text-sm text-blue-600">{safeDate(viewing.scheduled_at ?? viewing.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">Confirmed</span>
                  {viewing.agent_name && <p className="text-xs text-gray-500 mt-1">Agent: {viewing.agent_name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/dashboard/properties">
            <Button className="w-full justify-start"><Search className="h-4 w-4 mr-2" /> Search Properties</Button>
          </Link>
          <Link to="/dashboard/properties">
            <Button variant="outline" className="w-full justify-start"><Filter className="h-4 w-4 mr-2" /> Refine Search</Button>
          </Link>
          <Link to="/dashboard/activities">
            <Button variant="outline" className="w-full justify-start"><Calendar className="h-4 w-4 mr-2" /> Schedule Viewing</Button>
          </Link>
          <Link to="/dashboard/properties">
            <Button variant="outline" className="w-full justify-start"><Heart className="h-4 w-4 mr-2" /> View Saved</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
