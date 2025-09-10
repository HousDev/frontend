import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  CheckCircle,
  X,
  Eye,
  MoreHorizontal,
  Award,
  Clock,
  Users,
  Wrench,
  Palette,
  Hammer,
  Home,
  Droplets,
  Zap,
  Settings,
  Grid,
  List,
  Download,
  Upload,
  Send,
  Check,
  Crown,
  Verified,
} from 'lucide-react';
import VendorFormModal from '../../components/vendors/VendorFormModal';

type Service = {
  name: string;
  rate: string;
  unit: string;
  description?: string;
};

type Availability = {
  days: string[];
  startTime: string;
  endTime: string;
  weeklyOff: string;
};

export type Vendor = {
  id: number;
  salutation?: string;
  name: string;
  businessName?: string;
  category: string;
  countryCode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  rating?: number;
  experience?: number;
  verified?: boolean;
  reExpertVerified?: boolean;
  reSuggested?: boolean;
  services: Service[];
  tags: string[];
  rateIdea?: string;
  portfolio?: string[];
  description?: string;
  availability?: Availability;
  languages?: string[];
  certifications?: string[];
  completedProjects?: number;
  responseTime?: string;
  created_at?: string;
  lastActive?: string;
  status?: 'active' | 'inactive' | string;
};

type Category = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  count: number;
  color: string; // color key used in colorClassMap
};

const categories: Category[] = [
  { id: 'all', label: 'All Vendors', icon: Settings, count: 28, color: 'blue' },
  { id: 'plumber', label: 'Plumber', icon: Wrench, count: 5, color: 'blue' },
  { id: 'tiles', label: 'Tiles & Flooring', icon: Home, count: 4, color: 'green' },
  { id: 'painter', label: 'Painter', icon: Palette, count: 6, color: 'purple' },
  { id: 'carpenter', label: 'Carpenter', icon: Hammer, count: 4, color: 'orange' },
  { id: 'interior', label: 'Interior Designer', icon: Home, count: 5, color: 'pink' },
  { id: 'waterproofing', label: 'Water Proofing', icon: Droplets, count: 2, color: 'cyan' },
  { id: 'electrician', label: 'Electrician', icon: Zap, count: 2, color: 'yellow' },
];

// Map of color keys to actual Tailwind class names (safe, static strings)
const colorClassMap: Record<
  string,
  { bg: string; text: string; pillBg: string; iconText?: string }
> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', pillBg: 'bg-blue-200', iconText: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-700', pillBg: 'bg-green-200', iconText: 'text-green-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', pillBg: 'bg-purple-200', iconText: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', pillBg: 'bg-orange-200', iconText: 'text-orange-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', pillBg: 'bg-pink-200', iconText: 'text-pink-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', pillBg: 'bg-cyan-200', iconText: 'text-cyan-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', pillBg: 'bg-yellow-200', iconText: 'text-yellow-600' },
  // fallback
  default: { bg: 'bg-gray-100', text: 'text-gray-700', pillBg: 'bg-gray-200', iconText: 'text-gray-600' },
};

const VendorDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showVendorForm, setShowVendorForm] = useState<boolean>(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 1,
      salutation: 'Mr.',
      name: 'Rajesh Kumar',
      businessName: 'Rajesh Plumbing Services',
      category: 'plumber',
      countryCode: '+91',
      phone: '9876543210',
      whatsapp: '9876543210',
      email: 'rajesh.plumber@email.com',
      address: 'Shop 15, Andheri West, Mumbai',
      rating: 4.8,
      experience: 12,
      verified: true,
      reExpertVerified: true,
      reSuggested: true,
      services: [
        { name: 'Pipe Fitting', rate: '₹800-1200', unit: 'per point', description: 'Professional pipe fitting and connection' },
        { name: 'Leak Repair', rate: '₹500-800', unit: 'per repair', description: 'Quick leak detection and repair' },
        { name: 'Bathroom Installation', rate: '₹15000-25000', unit: 'lumpsum', description: 'Complete bathroom plumbing setup' },
        { name: 'Kitchen Plumbing', rate: '₹8000-15000', unit: 'lumpsum', description: 'Kitchen sink and appliance connections' },
      ],
      tags: ['24/7 Service', 'Emergency', 'Licensed', 'Insured', 'Warranty'],
      rateIdea: '₹500-1500 per visit',
      portfolio: [
        'https://images.pexels.com/photos/1129019/pexels-photo-1129019.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      ],
      description: 'Professional plumbing services with 12+ years experience. Specializes in residential and commercial plumbing solutions with 24/7 emergency support.',
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        startTime: '08:00',
        endTime: '20:00',
        weeklyOff: 'Sunday',
      },
      languages: ['Hindi', 'English', 'Marathi'],
      certifications: ['Licensed Plumber', 'Safety Certified', 'Insurance Approved'],
      completedProjects: 450,
      responseTime: '30 minutes',
      created_at: '2025-01-01',
      lastActive: '2025-01-12',
      status: 'active',
    },
    {
      id: 2,
      salutation: 'Mr.',
      name: 'Suresh Patel',
      businessName: 'Premium Tiles & Marble',
      category: 'tiles',
      countryCode: '+91',
      phone: '8765432109',
      whatsapp: '8765432109',
      email: 'premium.tiles@email.com',
      address: 'Showroom 5, Bandra East, Mumbai',
      rating: 4.9,
      experience: 15,
      verified: true,
      reExpertVerified: true,
      reSuggested: true,
      services: [
        { name: 'Tile Installation', rate: '₹80-150', unit: 'per sq ft', description: 'Professional tile laying and installation' },
        { name: 'Marble Flooring', rate: '₹200-500', unit: 'per sq ft', description: 'Premium marble flooring installation' },
        { name: 'Wall Tiling', rate: '₹60-120', unit: 'per sq ft', description: 'Wall tile installation with perfect alignment' },
        { name: 'Bathroom Tiling', rate: '₹25000-45000', unit: 'lumpsum', description: 'Complete bathroom tiling solution' },
      ],
      tags: ['Premium Quality', 'Designer Tiles', '5 Year Warranty', 'Installation Included'],
      rateIdea: '₹80-300 per sq ft',
      portfolio: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1129019/pexels-photo-1129019.jpeg?auto=compress&cs=tinysrgb&w=400',
      ],
      description: 'Premium tiles and marble installation with designer collections. Expert in luxury flooring solutions with extensive showroom and quality materials.',
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        startTime: '09:00',
        endTime: '19:00',
        weeklyOff: 'Sunday',
      },
      languages: ['Hindi', 'English', 'Gujarati'],
      certifications: ['Certified Installer', 'Quality Assured', 'Showroom Partner'],
      completedProjects: 320,
      responseTime: '1 hour',
      created_at: '2025-01-02',
      lastActive: '2025-01-11',
      status: 'active',
    },
    {
      id: 3,
      salutation: 'Mr.',
      name: 'Amit Sharma',
      businessName: 'Color Magic Painters',
      category: 'painter',
      countryCode: '+91',
      phone: '7654321098',
      whatsapp: '7654321098',
      email: 'colormagic@email.com',
      address: 'Office 12, Powai, Mumbai',
      rating: 4.7,
      experience: 8,
      verified: true,
      reExpertVerified: false,
      reSuggested: false,
      services: [
        { name: 'Interior Painting', rate: '₹18-35', unit: 'per sq ft', description: 'Premium interior wall painting' },
        { name: 'Exterior Painting', rate: '₹25-45', unit: 'per sq ft', description: 'Weather resistant exterior painting' },
        { name: 'Texture Work', rate: '₹35-60', unit: 'per sq ft', description: 'Designer texture and pattern work' },
        { name: 'Complete Home Painting', rate: '₹80000-150000', unit: 'lumpsum', description: 'Full home painting package' },
      ],
      tags: ['Asian Paints Dealer', 'Texture Expert', 'Quick Service', '2 Year Warranty'],
      rateIdea: '₹18-45 per sq ft',
      portfolio: ['https://images.pexels.com/photos/1129019/pexels-photo-1129019.jpeg?auto=compress&cs=tinysrgb&w=400'],
      description: 'Professional painting services with expertise in interior and exterior painting. Asian Paints authorized dealer with quality materials and skilled workforce.',
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        startTime: '08:00',
        endTime: '18:00',
        weeklyOff: 'Sunday',
      },
      languages: ['Hindi', 'English'],
      certifications: ['Asian Paints Certified', 'Color Consultant'],
      completedProjects: 280,
      responseTime: '2 hours',
      created_at: '2025-01-03',
      lastActive: '2025-01-10',
      status: 'active',
    },
  ]);

  const filteredVendors = vendors.filter((vendor) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      vendor.name.toLowerCase().includes(term) ||
      (vendor.businessName && vendor.businessName.toLowerCase().includes(term)) ||
      vendor.services.some((service) => service.name.toLowerCase().includes(term)) ||
      vendor.tags.some((tag) => tag.toLowerCase().includes(term));

    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddVendor = () => {
    setEditingVendor(null);
    setShowVendorForm(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowVendorForm(true);
  };

  const handleDeleteVendor = (vendorId: number) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    }
  };

  const handleSaveVendor = (vendorData: Vendor) => {
    if (editingVendor) {
      setVendors((prev) => prev.map((v) => (v.id === editingVendor.id ? { ...vendorData, id: editingVendor.id } : v)));
    } else {
      const nextId = vendors.length > 0 ? Math.max(...vendors.map((v) => v.id)) + 1 : 1;
      const newVendor = { ...vendorData, id: nextId };
      setVendors((prev) => [...prev, newVendor]);
    }
    setShowVendorForm(false);
    setEditingVendor(null);
  };

  const handleToggleREExpertVerified = (vendorId: number) => {
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, reExpertVerified: !v.reExpertVerified } : v)));
  };

  const handleToggleRESuggested = (vendorId: number) => {
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, reSuggested: !v.reSuggested } : v)));
  };

  const handleWhatsApp = (phone?: string, name?: string) => {
    if (!phone) return;
    const message = `Hi ${name || 'there'}, I found your contact through ResaleExpert. I would like to discuss my requirements.`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = (email?: string, name?: string) => {
    if (!email) return;
    const subject = 'Inquiry from ResaleExpert';
    const body = `Hi ${name || 'there'},\n\nI found your contact through ResaleExpert. I would like to discuss my requirements.\n\nBest regards`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleSendToSellerAccount = () => {
    if (selectedVendors.length === 0) {
      alert('Please select vendors to send');
      return;
    }

    const selectedVendorData = vendors.filter((v) => selectedVendors.includes(v.id));
    // This would integrate with the seller account page
    console.log('Sending vendors to seller account:', selectedVendorData);
    alert(`${selectedVendors.length} vendors sent to seller account directory`);
    setSelectedVendors([]);
  };

  const handleVendorSelection = (vendorId: number) => {
    setSelectedVendors((prev) => (prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]));
  };

  const getCategoryIcon = (categoryId: string): React.ComponentType<any> => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.icon ?? Settings;
  };

  const getCategoryColorKey = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.color ?? 'default';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Directory</h1>
              <p className="text-gray-600 mt-1">Manage trusted vendors and service providers</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {selectedVendors.length > 0 && (
              <button
                onClick={handleSendToSellerAccount}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send size={16} />
                <span>Send to Seller ({selectedVendors.length})</span>
              </button>
            )}
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Upload size={16} />
              <span>Import</span>
            </button>
            <button onClick={handleAddVendor} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-6">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {categories.map((categoryItem) => {
              const Icon = categoryItem.icon;
              const colorKey = categoryItem.color;
              const colorClasses = colorClassMap[colorKey] ?? colorClassMap.default;
              const isActive = selectedCategory === categoryItem.id;

              return (
                <button
                  key={categoryItem.id}
                  onClick={() => setSelectedCategory(categoryItem.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${isActive ? `${colorClasses.bg} ${colorClasses.text} border ${colorClasses.pillBg}` : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{categoryItem.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? colorClasses.pillBg : 'bg-gray-200'}`}>{categoryItem.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search vendors, services, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
                <Grid size={16} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
                <List size={16} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
          {filteredVendors.map((vendor) => {
            const CategoryIcon = getCategoryIcon(vendor.category);
            const categoryColorKey = getCategoryColorKey(vendor.category);
            const colorClasses = colorClassMap[categoryColorKey] ?? colorClassMap.default;
            const isSelected = selectedVendors.includes(vendor.id);

            return (
              <div
                key={vendor.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                {/* Selection Checkbox */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked={isSelected} onChange={() => handleVendorSelection(vendor.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <div className={`${colorClasses.bg} p-2 rounded-lg`}>
                        <CategoryIcon className={colorClasses.iconText ?? 'text-gray-600'} size={20} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {vendor.verified && (
                        <CheckCircle
                          className="text-blue-500"
                          size={16}
                          role="img"
                          aria-label="Verified"
                        />
                      )}

                      {vendor.reExpertVerified && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                          <Crown className="text-white" size={12} />
                          <span className="text-white text-xs font-bold">RE EXPERT</span>
                        </div>
                      )}
                      {vendor.reSuggested && (
                        <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                          <span className="text-white text-xs font-bold">RE SUGGESTED</span>
                        </div>
                      )}
                      <div className="relative group">
                        <button className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal size={16} />
                        </button>
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-48">
                          <div className="p-1">
                            <button onClick={() => handleEditVendor(vendor)} className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                              <Edit size={14} />
                              <span>Edit Vendor</span>
                            </button>
                            <button onClick={() => handleToggleREExpertVerified(vendor.id)} className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                              <Crown size={14} />
                              <span>{vendor.reExpertVerified ? 'Remove RE Expert' : 'Make RE Expert'}</span>
                            </button>
                            <button onClick={() => handleToggleRESuggested(vendor.id)} className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                              <Award size={14} />
                              <span>{vendor.reSuggested ? 'Remove RE Suggested' : 'Make RE Suggested'}</span>
                            </button>
                            <button onClick={() => handleDeleteVendor(vendor.id)} className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded w-full text-left">
                              <Trash2 size={14} />
                              <span>Delete Vendor</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1">
                    {vendor.salutation} {vendor.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{vendor.businessName}</p>

                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-500" size={14} />
                      <span className="text-sm font-medium">{vendor.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{vendor.experience} years</span>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                    <MapPin size={12} />
                    <span className="truncate">{vendor.address}</span>
                  </div>

                  <div className="text-sm font-medium text-green-600 mb-3">{vendor.rateIdea}</div>

                  {/* Availability */}
                  <div className="text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock size={10} />
                      <span>
                        {vendor.availability?.startTime} - {vendor.availability?.endTime}
                      </span>
                    </div>
                    <div>Weekly Off: {vendor.availability?.weeklyOff}</div>
                  </div>
                </div>

                {/* Services with Rate Cards */}
                <div className="p-4 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Services & Rates</h4>
                  <div className="space-y-2">
                    {vendor.services.slice(0, 2).map((service, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            <div className="text-xs text-gray-600">{service.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">{service.rate}</div>
                            <div className="text-xs text-gray-500">{service.unit}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {vendor.services.length > 2 && <div className="text-xs text-gray-500 text-center">+{vendor.services.length - 2} more services</div>}
                  </div>
                </div>

                {/* Tags */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {vendor.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className={`px-2 py-1 ${colorClasses.pillBg} ${colorClasses.text} rounded-full text-xs font-medium`}>
                        {tag}
                      </span>
                    ))}
                    {vendor.tags.length > 3 && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">+{vendor.tags.length - 3}</span>}
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="p-4">
                  <div className="flex space-x-2">
                    <button onClick={() => handleWhatsApp(vendor.whatsapp, vendor.name)} className="flex-1 flex items-center justify-center space-x-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <MessageCircle size={14} />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </button>
                    <button onClick={() => handleEmail(vendor.email, vendor.name)} className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Mail size={14} />
                      <span className="text-sm font-medium">Email</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>{vendor.completedProjects} projects</span>
                    <span>Response: {vendor.responseTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <VendorFormModal
          isOpen={showVendorForm}
          onClose={() => {
            setShowVendorForm(false);
            setEditingVendor(null);
          }}
          vendor={editingVendor}
          onSave={handleSaveVendor}
        />
      )}
    </div>
  );
};

export default VendorDirectoryPage;
