// src/pages/dashboard/SellerDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Eye,
  Heart,
  TrendingUp,
  Calendar,
  Users,
  ArrowRight,
  Plus,
  DollarSign,
  MapPin,
  Camera,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI } from "@/lib/api";
import { leadsAPI } from "@/lib/leadAPI";
import { propertiesAPI } from "@/lib/propertiesAPI";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "@/hooks/useToast";

interface SellerStats {
  my_properties?: {
    total_properties?: number;
    active_listings?: number;
    pending_approval?: number;
    sold_properties?: number;
  };
  property_performance?: {
    total_views?: number;
    total_inquiries?: number;
    average_price?: number;
    highest_interest?: string;
  };
  market_insights?: {
    market_trend?: string;
    avg_days_on_market?: number;
    price_recommendation?: string;
  };
}

const emptySellerStats: SellerStats = {
  my_properties: {
    total_properties: 0,
    active_listings: 0,
    pending_approval: 0,
    sold_properties: 0,
  },
  property_performance: {
    total_views: 0,
    total_inquiries: 0,
    average_price: 0,
    highest_interest: "",
  },
  market_insights: {
    market_trend: "Stable",
    avg_days_on_market: 0,
    price_recommendation: "Market Rate",
  },
};

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SellerStats>(emptySellerStats);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [interestedBuyers, setInterestedBuyers] = useState<any[]>([]);
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

    const parseResp = (r: any) => {
      if (!r) return null;
      if (typeof r !== "object") return null;
      return r.data ?? r;
    };

    const fetchSellerData = async () => {
      if (isMounted) setLoading(true);

      // 1) Try seller stats endpoint
      let sellerPayload: any = null;
      try {
        const resp = await dashboardAPI.getSellerStats().catch((e: any) => {
          console.warn("dashboardAPI.getSellerStats error:", e);
          return null;
        });
        sellerPayload = parseResp(resp);

        if (sellerPayload?.success === false) {
          console.warn("getSellerStats returned success:false ->", sellerPayload.message ?? sellerPayload);
          sellerPayload = null;
        }
      } catch (err) {
        console.warn("Error calling dashboardAPI.getSellerStats:", err);
        sellerPayload = null;
      }

      // 2) If seller payload valid, normalize and set
      if (sellerPayload && (sellerPayload.my_properties || sellerPayload.property_performance || sellerPayload.market_insights)) {
        const normalized: SellerStats = {
          my_properties: {
            total_properties: sellerPayload.my_properties?.total_properties ?? sellerPayload.total_properties ?? sellerPayload.properties_count ?? emptySellerStats.my_properties!.total_properties,
            active_listings: sellerPayload.my_properties?.active_listings ?? sellerPayload.active_listings ?? 0,
            pending_approval: sellerPayload.my_properties?.pending_approval ?? 0,
            sold_properties: sellerPayload.my_properties?.sold_properties ?? sellerPayload.sold_properties ?? 0,
          },
          property_performance: {
            total_views: sellerPayload.property_performance?.total_views ?? sellerPayload.total_views ?? 0,
            total_inquiries: sellerPayload.property_performance?.total_inquiries ?? sellerPayload.total_inquiries ?? 0,
            average_price: sellerPayload.property_performance?.average_price ?? sellerPayload.average_price ?? 0,
            highest_interest: sellerPayload.property_performance?.highest_interest ?? sellerPayload.highest_interest ?? "",
          },
          market_insights: {
            market_trend: sellerPayload.market_insights?.market_trend ?? sellerPayload.market_trend ?? emptySellerStats.market_insights!.market_trend,
            avg_days_on_market: sellerPayload.market_insights?.avg_days_on_market ?? sellerPayload.avg_days_on_market ?? 0,
            price_recommendation: sellerPayload.market_insights?.price_recommendation ?? sellerPayload.price_recommendation ?? emptySellerStats.market_insights!.price_recommendation,
          },
        };
        if (isMounted) setStats(normalized);
      } else {
        // 3) Fallback: fetch property list + leads to derive totals and show recent items
        console.warn("seller stats endpoint missing/unexpected shape — falling back to list-based totals");
        try {
          const [propsResp, buyersResp] = await Promise.all([
            propertiesAPI.getProperties({ seller_id: user?.id, limit: 5 }).catch((e: any) => { console.warn("propertiesAPI.getProperties error", e); return null; }),
            leadsAPI.getLeads({ interested_in: 'property', seller_id: user?.id, limit: 5 }).catch((e: any) => { console.warn("leadsAPI.getLeads error", e); return null; }),
          ]);
          const propsData = parseResp(propsResp);
          const propsArray = Array.isArray(propsData) ? propsData : Array.isArray(propsData?.rows) ? propsData.rows : null;

          const buyersData = parseResp(buyersResp);
          const buyersArray = Array.isArray(buyersData) ? buyersData : Array.isArray(buyersData?.rows) ? buyersData.rows : null;

          if (isMounted) {
            if (Array.isArray(propsArray)) {
              setMyProperties(propsArray);
              setStats(prev => ({
                ...prev,
                my_properties: {
                  ...prev.my_properties,
                  total_properties: propsArray.length,
                  active_listings: propsArray.filter(p => (p.status ?? "").toLowerCase() === "active").length,
                },
              }));
            }
            if (Array.isArray(buyersArray)) {
              setInterestedBuyers(buyersArray);
              setStats(prev => ({
                ...prev,
                property_performance: {
                  ...prev.property_performance,
                  total_inquiries: buyersArray.length,
                },
              }));
            }
          }
        } catch (err) {
          console.warn("Fallback list-based totals failed:", err);
          showErrorOnce("Failed to load seller dashboard data");
        }
      }

      // 4) Ensure recent properties and buyers are set (try again if needed)
      try {
        const [propsRespFull, buyersRespFull] = await Promise.all([
          propertiesAPI.getProperties({ seller_id: user?.id, limit: 5 }).catch((e: any) => { console.warn("propertiesAPI.getProperties error", e); return null; }),
          leadsAPI.getLeads({ interested_in: 'property', seller_id: user?.id, limit: 5 }).catch((e: any) => { console.warn("leadsAPI.getLeads error", e); return null; }),
        ]);

        const propsData = parseResp(propsRespFull);
        const propsArray = Array.isArray(propsData) ? propsData : Array.isArray(propsData?.rows) ? propsData.rows : null;
        if (Array.isArray(propsArray) && isMounted) setMyProperties(propsArray);

        const buyersData = parseResp(buyersRespFull);
        const buyersArray = Array.isArray(buyersData) ? buyersData : Array.isArray(buyersData?.rows) ? buyersData.rows : null;
        if (Array.isArray(buyersArray) && isMounted) setInterestedBuyers(buyersArray);
      } catch (err) {
        console.warn("Error fetching recent lists:", err);
      }

      if (isMounted) setLoading(false);
    };

    if (user) {
      fetchSellerData().catch(e => {
        console.error("fetchSellerData top-level error:", e);
        if (isMounted) {
          setLoading(false);
          showErrorOnce("Failed to load seller dashboard data");
        }
      });
    } else {
      // no auth yet -> stop spinner
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getPropertyStatusColor = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return "-";
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name ?? "Seller"}!</h1>
          <p className="text-gray-600 mt-1">Manage your property listings and track buyer interest</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/dashboard/properties">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>List Property</span>
            </Button>
          </Link>
          <Link to="/dashboard/analytics">
            <Button variant="outline" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Market Analysis</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Property Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Properties</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.my_properties?.total_properties ?? 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Building className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats?.my_properties?.active_listings ?? 0} active listings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.property_performance?.total_views ?? 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Across all properties</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.property_performance?.total_inquiries ?? 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Interested buyers</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sold</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.my_properties?.sold_properties ?? 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Properties sold</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Properties */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Recent Properties</h3>
            <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {myProperties.length > 0 ? (
              myProperties.map((property) => (
                <div key={property.id ?? JSON.stringify(property)} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{property.title ?? "Untitled"}</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location ?? property.address ?? "-"}
                    </p>
                    <p className="text-sm font-medium text-green-600">{formatPrice(property.price)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPropertyStatusColor(property.status)}`}>
                      {property.status ?? "Draft"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{property.views ?? 0} views</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No properties listed yet</p>
                <Link to="/dashboard/properties">
                  <Button className="mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    List Your First Property
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Interested Buyers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Interested Buyers</h3>
            <Link to="/dashboard/leads" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {interestedBuyers.length > 0 ? (
              interestedBuyers.map((buyer) => (
                <div key={buyer.id ?? JSON.stringify(buyer)} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {((buyer.first_name?.[0] ?? "") + (buyer.last_name?.[0] ?? "")).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{buyer.first_name} {buyer.last_name}</p>
                      <p className="text-sm text-gray-600">{buyer.email ?? "-"}</p>
                      {buyer.budget && <p className="text-xs text-gray-500">Budget: {formatPrice(buyer.budget)}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Interested</span>
                    <p className="text-xs text-gray-500 mt-1">{safeDate(buyer.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No interested buyers yet</p>
                <p className="text-sm text-gray-400 mt-1">Buyers will appear here when they show interest in your properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/dashboard/properties">
            <Button className="w-full justify-start"><Plus className="h-4 w-4 mr-2" /> Add New Property</Button>
          </Link>
          <Link to="/dashboard/properties">
            <Button variant="outline" className="w-full justify-start"><Eye className="h-4 w-4 mr-2" /> View Properties</Button>
          </Link>
          <Link to="/dashboard/leads">
            <Button variant="outline" className="w-full justify-start"><Users className="h-4 w-4 mr-2" /> View Inquiries</Button>
          </Link>
          <Link to="/dashboard/analytics">
            <Button variant="outline" className="w-full justify-start"><TrendingUp className="h-4 w-4 mr-2" /> Market Analysis</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
