import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Edit,
  Trash2,
  Share2,
  Heart,
  Eye,
  Phone,
  Mail,
  Star,
  Building,
  User,
  TrendingUp,
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// restore leadsAPI import (was commented out in your pasted file)
import { propertiesAPI } from '@/lib/propertiesAPI';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';
import { leadsAPI } from '@/lib/api';
import { getImageUrl, DEFAULT_PROPERTY_IMAGE, DEFAULT_PROPERTY_IMAGES } from '@/lib/helpers';

interface PropertyDetail {
  id: string;
  title: string;
  type: string;
  status: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  lot_size?: number;
  year_built?: number;
  address: string;
  location: string;
  description: string;
  images: string[];
  features: string[];
  amenities: string[];
  listing_agent: string;
  listing_agent_contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  created_at?: string;
  updated_at?: string;
  views?: number;
  favorites?: number;
  inquiries?: number;
  is_featured?: boolean;
  virtual_tour_url?: string;
  floor_plans?: string[];
  nearby_schools?: string[];
  property_tax?: number;
  hoa_fees?: number;
}

interface PropertyInquiry {
  id: string;
  lead_name: string;
  lead_email: string;
  lead_phone?: string;
  message: string;
  inquiry_date: string;
  status: string;
}

interface PropertyAnalytics {
  daily_views?: number[];
  weekly_views?: number;
  monthly_views?: number;
  total_inquiries?: number;
  conversion_rate?: number;
  average_time_on_page?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  [k: string]: any;
}

const PropertyDetailPage: React.FC = () => {
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [analytics, setAnalytics] = useState<PropertyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'inquiries' | 'analytics'>('overview');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchPropertyDetails();
    fetchPropertyInquiries();
    fetchPropertyAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPropertyDetails = async () => {
    if (!id) return;
    try {
      const response = (await propertiesAPI.getProperty(id)) as ApiResponse<PropertyDetail>;
      if (response?.success && response.data) {
        setProperty(response.data);
      } else {
        toast.error('Property not found');
        setProperty(null);
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to load property details');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyInquiries = async () => {
    if (!id) return;
    // guard in case leadsAPI is not available in some builds
    if (typeof leadsAPI?.getLeads !== 'function') {
      console.warn('leadsAPI.getLeads not available');
      return;
    }
    try {
      const response = (await leadsAPI.getLeads({ property_id: id })) as ApiResponse<PropertyInquiry[]>;
      if (response?.success && Array.isArray(response.data)) {
        setInquiries(response.data);
      }
    } catch (error) {
      console.error('Error fetching property inquiries:', error);
    }
  };

  const fetchPropertyAnalytics = async () => {
    if (!id) return;
    try {
      const response = (await propertiesAPI.getPropertyAnalytics(id)) as ApiResponse<PropertyAnalytics>;
      if (response?.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching property analytics:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    try {
      await propertiesAPI.updateProperty(id, { status: newStatus });
      setProperty((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success('Property status updated successfully');
    } catch (error) {
      console.error('Error updating property status:', error);
      toast.error('Failed to update property status');
    }
  };

  const handleDeleteProperty = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await propertiesAPI.deleteProperty(id);
        toast.success('Property deleted successfully');
        navigate('/dashboard/properties');
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'rented':
        return 'bg-purple-100 text-purple-800';
      case 'off_market':
      case 'off market':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatArea = (area: number = 0) => {
    return new Intl.NumberFormat('en-US').format(area);
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been deleted.</p>
          <Link to="/dashboard/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const rawImg = (property as any)?.photos || (property as any)?.images || (property as any)?.photoUrls;
  let parsedImages: string[] = [];
  if (Array.isArray(rawImg) && rawImg.length > 0) {
    parsedImages = rawImg.map((x: any) => typeof x === 'string' ? x : x?.url).filter(Boolean);
  } else if (typeof rawImg === 'string' && rawImg.trim()) {
    try {
      const parsed = JSON.parse(rawImg);
      if (Array.isArray(parsed)) parsedImages = parsed;
      else parsedImages = [rawImg];
    } catch {
      parsedImages = [rawImg];
    }
  }
  const images = parsedImages.length > 0 ? parsedImages.map(img => getImageUrl(img)) : DEFAULT_PROPERTY_IMAGES.map(img => getImageUrl(img));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/properties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              {property.is_featured && (
                <div className="bg-yellow-500 text-white p-1 rounded-full">
                  <Star className="h-5 w-5" />
                </div>
              )}
            </div>
            <p className="text-gray-600 mt-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
          <Link to={`/dashboard/properties/${id}/edit`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDeleteProperty}
            className="flex items-center space-x-2 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Property Images */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative h-96">
          <img
            src={getImageUrl(images[currentImageIndex]) || DEFAULT_PROPERTY_IMAGE}
            alt={property.title}
            onError={(e) => { e.currentTarget.src = '/property.png'; }}
            className="w-full h-full object-cover cursor-pointer"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(property.status)}`}>
              {property.status || 'Draft'}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
              {property.views || 0} views
            </div>
            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
              {property.favorites || 0} ♥
            </div>
          </div>
        </div>
      </div>

      {/* Price and Key Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(property.price)}</div>
            <select
              value={property.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="off_market">Off Market</option>
            </select>
          </div>
          <div className="flex space-x-4">
            {property.virtual_tour_url && (
              <Button variant="outline" className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Virtual Tour</span>
              </Button>
            )}
            <Button className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>View on Website</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Bed className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{property.bedrooms}</span>
            </div>
            <p className="text-sm text-gray-600">Bedrooms</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Bath className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{property.bathrooms}</span>
            </div>
            <p className="text-sm text-gray-600">Bathrooms</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Square className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{formatArea(property.area)}</span>
            </div>
            <p className="text-sm text-gray-600">Sq Ft</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{property.year_built ?? 'N/A'}</span>
            </div>
            <p className="text-sm text-gray-600">Year Built</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inquiries' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inquiries ({inquiries.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-medium">{property.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lot Size:</span>
                      <span className="font-medium">{property.lot_size ? `${formatArea(property.lot_size)} sqft` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Tax:</span>
                      <span className="font-medium">{formatCurrency(property.property_tax ?? 0)}/year</span>
                    </div>
                    {property.hoa_fees != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">HOA Fees:</span>
                        <span className="font-medium">{formatCurrency(property.hoa_fees!)}/month</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Listing Agent</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {(property.listing_agent_contact?.name?.charAt(0) ?? property.listing_agent?.charAt(0) ?? 'A').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{property.listing_agent_contact?.name || property.listing_agent}</p>
                        <p className="text-sm text-gray-600">Listing Agent</p>
                      </div>
                    </div>
                    {property.listing_agent_contact && (
                      <div className="space-y-2">
                        {property.listing_agent_contact.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{property.listing_agent_contact.email}</span>
                          </div>
                        )}
                        {property.listing_agent_contact.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{property.listing_agent_contact.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {inquiry.lead_name?.charAt(0)?.toUpperCase() ?? 'L'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{inquiry.lead_name}</p>
                            <p className="text-sm text-gray-600">{inquiry.lead_email}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{inquiry.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(inquiry.inquiry_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {inquiry.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No inquiries yet</p>
                  <p className="text-sm text-gray-400 mt-1">Inquiries will appear here when potential buyers show interest</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analytics ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{analytics.weekly_views ?? 0}</div>
                      <div className="text-sm text-gray-600">Weekly Views</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{analytics.monthly_views ?? 0}</div>
                      <div className="text-sm text-gray-600">Monthly Views</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{analytics.total_inquiries ?? 0}</div>
                      <div className="text-sm text-gray-600">Total Inquiries</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{analytics.conversion_rate ?? 0}%</div>
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Insights</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Time on Page:</span>
                        <span className="font-medium">{analytics.average_time_on_page ?? 0} seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">View-to-Inquiry Rate:</span>
                        <span className="font-medium">{analytics.conversion_rate ?? 0}%</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics data not available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
