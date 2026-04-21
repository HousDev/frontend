import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin,
  Award,
  Shield,
  CheckCircle,
  Clock,
  Wrench,
  Palette,
  Hammer,
  Home,
  Droplets,
  Zap,
  Settings,
  Plus,
  Send,
  Download,
  Share,
  Eye,
  Edit,
  Trash2,
  Crown,
  Gem,
  Verified,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  User,
  Building,
  DollarSign
} from 'lucide-react';

const VendorDirectory = ({ seller }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [showRecommended, setShowRecommended] = useState(true);

  const categories = [
    { id: 'all', label: 'All', icon: Settings, count: 28 },
    { id: 'plumber', label: 'Plumber', icon: Wrench, count: 5 },
    { id: 'painter', label: 'Painter', icon: Palette, count: 6 },
    { id: 'electrician', label: 'Electrician', icon: Zap, count: 4 },
    { id: 'carpenter', label: 'Carpenter', icon: Hammer, count: 4 },
    { id: 'tiles', label: 'Tiles', icon: Home, count: 4 },
    { id: 'waterproofing', label: 'Waterproof', icon: Droplets, count: 3 },
    { id: 'interior', label: 'Interior', icon: Home, count: 2 }
  ];

  const vendors = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      businessName: 'Rajesh Plumbing Services',
      category: 'plumber',
      phone: '9876543210',
      whatsapp: '9876543210',
      email: 'rajesh.plumber@email.com',
      address: 'Shop 15, Andheri West, Mumbai',
      rating: 4.8,
      experience: 12,
      verified: true,
      reExpertRecommended: true,
      completedProjects: 450,
      responseTime: '30 min',
      availability: 'Available',
      services: [
        { name: 'Pipe Fitting', rate: '₹800-1200', unit: 'per point' },
        { name: 'Leak Repair', rate: '₹500-800', unit: 'per repair' },
        { name: 'Bathroom Installation', rate: '₹15000-25000', unit: 'lumpsum' }
      ],
      tags: ['24/7', 'Emergency', 'Licensed', 'Insured', 'Warranty'],
      portfolio: [
        'https://images.pexels.com/photos/1129019/pexels-photo-1129019.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200'
      ],
      reviews: [
        { rating: 5, comment: 'Excellent work', client: 'Amit S.' },
        { rating: 5, comment: 'Quick response', client: 'Priya M.' }
      ],
      pricing: {
        hourlyRate: '₹500-800',
        minimumCharge: '₹1000',
        emergencyRate: '₹1200-1500'
      }
    },
    {
      id: 2,
      name: 'Suresh Patel',
      businessName: 'Premium Tiles & Marble',
      category: 'tiles',
      phone: '8765432109',
      whatsapp: '8765432109',
      email: 'premium.tiles@email.com',
      address: 'Showroom 5, Bandra East, Mumbai',
      rating: 4.9,
      experience: 15,
      verified: true,
      reExpertRecommended: true,
      completedProjects: 320,
      responseTime: '1 hour',
      availability: 'Available',
      services: [
        { name: 'Tile Installation', rate: '₹80-150', unit: 'per sq ft' },
        { name: 'Marble Flooring', rate: '₹200-500', unit: 'per sq ft' },
        { name: 'Bathroom Tiling', rate: '₹25000-45000', unit: 'lumpsum' }
      ],
      tags: ['Premium', 'Designer', '5 Year Warranty', 'Installation'],
      portfolio: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200'
      ],
      reviews: [
        { rating: 5, comment: 'Beautiful tile work', client: 'Rohit K.' }
      ],
      pricing: {
        materialCost: 'Varies by selection',
        laborCost: '₹80-150 per sq ft',
        designConsultation: '₹2000-5000'
      }
    },
    {
      id: 3,
      name: 'Meena Sharma',
      businessName: 'Creative Paint Solutions',
      category: 'painter',
      phone: '7654321098',
      whatsapp: '7654321098',
      email: 'creative.paint@email.com',
      address: 'Unit 12, Malad East, Mumbai',
      rating: 4.7,
      experience: 8,
      verified: true,
      reExpertRecommended: false,
      completedProjects: 200,
      responseTime: '2 hours',
      availability: 'Available',
      services: [
        { name: 'Interior Painting', rate: '₹15-25', unit: 'per sq ft' },
        { name: 'Exterior Painting', rate: '₹20-30', unit: 'per sq ft' },
        { name: 'Texture & Design', rate: '₹35-50', unit: 'per sq ft' }
      ],
      tags: ['Eco-Friendly', 'Asian Paints', 'Design', 'Color Matching'],
      portfolio: [
        'https://images.pexels.com/photos/1129019/pexels-photo-1129019.jpeg?auto=compress&cs=tinysrgb&w=200'
      ],
      reviews: [
        { rating: 5, comment: 'Amazing colors', client: 'Neha R.' }
      ],
      pricing: {
        materialCost: 'Premium paints included',
        laborCost: '₹15-50 per sq ft',
        designConsultation: 'Free'
      }
    },
    {
      id: 4,
      name: 'Vivek Electricals',
      businessName: 'Spark Pro Solutions',
      category: 'electrician',
      phone: '6543210987',
      whatsapp: '6543210987',
      email: 'spark.pro@email.com',
      address: 'Shop 8, Powai, Mumbai',
      rating: 4.6,
      experience: 10,
      verified: true,
      reExpertRecommended: true,
      completedProjects: 280,
      responseTime: '1 hour',
      availability: 'Busy',
      services: [
        { name: 'Wiring Installation', rate: '₹40-60', unit: 'per point' },
        { name: 'Smart Home Setup', rate: '₹10000-25000', unit: 'lumpsum' },
        { name: 'MCB & Distribution', rate: '₹5000-15000', unit: 'lumpsum' }
      ],
      tags: ['Smart Home', 'Safety', '24/7', 'IoT'],
      portfolio: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/1129019/pexels-photo-1129019.jpeg?auto=compress&cs=tinysrgb&w=200'
      ],
      reviews: [
        { rating: 5, comment: 'Excellent smart home', client: 'Raj K.' }
      ],
      pricing: {
        hourlyRate: '₹800-1200',
        minimumCharge: '₹1500',
        emergencyRate: '₹1500-2000'
      }
    }
  ];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.services.some(service => service.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesRecommended = !showRecommended || vendor.reExpertRecommended;
    
    return matchesSearch && matchesCategory && matchesRecommended;
  });

  const handleVendorSelection = (vendorId: number) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleContactVendor = (vendor: any, method: string) => {
    switch (method) {
      case 'call':
        window.open(`tel:+91${vendor.phone}`);
        break;
      case 'whatsapp':
        const message = `Hi ${vendor.name}, I found your contact through ResaleExpert. I need ${vendor.category} services for my property. Please share your availability and rates.`;
        window.open(`https://wa.me/91${vendor.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        const subject = 'Service Inquiry from ResaleExpert';
        const body = `Dear ${vendor.name},\n\nI found your contact through ResaleExpert platform. I need ${vendor.category} services for my property.\n\nPlease share your availability and detailed quotation.\n\nProperty Details:\n- Location: ${seller?.location || 'Mumbai'}, ${seller?.city || 'Mumbai'}\n- Type: Residential\n\nLooking forward to your response.\n\nBest regards,\n${seller?.name || 'Property Owner'}`;
        window.open(`mailto:${vendor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        break;
    }
  };

  const sendToSelectedVendors = () => {
    if (selectedVendors.length === 0) {
      alert('Please select vendors to contact');
      return;
    }
    
    const selectedVendorData = vendors.filter(v => selectedVendors.includes(v.id));
  
    alert(`Inquiry sent to ${selectedVendors.length} vendors. They will contact you within 24 hours.`);
    setSelectedVendors([]);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Settings;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-3 sm:space-y-4  pb-4 sm:pb-6 pt-0">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
  
  {/* LEFT CONTENT */}
  <div className="min-w-0 flex-1">
    <h2 className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
      Vendor Directory
    </h2>

    <p className="text-[10px] sm:text-sm text-gray-600 mt-0.5 leading-tight max-w-[180px] sm:max-w-none">
      Trusted service providers for property maintenance
    </p>
  </div>

  {/* RIGHT BUTTONS */}
  <div className="flex items-center gap-1.5 flex-shrink-0">
    
    {selectedVendors.length > 0 && (
      <button
        onClick={sendToSelectedVendors}
        className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] sm:text-[11px] font-medium whitespace-nowrap"
      >
        <Send size={12} />
        <span className="hidden sm:inline">
          Contact ({selectedVendors.length})
        </span>
        <span className="sm:hidden">
          {selectedVendors.length}
        </span>
      </button>
    )}

    <button className="flex items-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[10px] sm:text-[11px] font-medium whitespace-nowrap">
      <Plus size={12} />
      <span className="hidden sm:inline">Request</span>
      <span className="sm:hidden">Req</span>
    </button>

  </div>
</div>
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-2.5">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
            <div className="flex flex-row items-center justify-between gap-2">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showRecommended}
                  onChange={(e) => setShowRecommended(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] text-gray-700">RE Only</span>
              </label>
              <button className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-[11px]">
                <Download size={11} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Category Tabs - Wrap on mobile */}
          <div className="mt-2.5">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-[10px] font-medium ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={10} />
                    <span>{category.label}</span>
                    <span className={`px-1 py-0 rounded-full text-[9px] ${selectedCategory === category.id ? 'bg-blue-200' : 'bg-gray-200'}`}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredVendors.map((vendor) => {
            const CategoryIcon = getCategoryIcon(vendor.category);
            const isSelected = selectedVendors.includes(vendor.id);
            
            return (
              <div key={vendor.id} className={`bg-white rounded-lg border-2 transition-all hover:shadow-md ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                {/* Compact Vendor Header */}
                <div className="p-2.5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleVendorSelection(vendor.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="p-1 bg-blue-100 rounded">
                        <CategoryIcon className="text-blue-600" size={12} />
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {vendor.verified && (
                        <div className="flex items-center gap-0.5 px-1 py-0.5 bg-green-100 text-green-700 rounded-full">
                          <CheckCircle size={8} />
                          <span className="text-[9px] font-bold">V</span>
                        </div>
                      )}
                      {vendor.reExpertRecommended && (
                        <div className="flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                          <Crown className="text-white" size={8} />
                          <span className="text-white text-[9px] font-bold">RE</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xs font-bold text-gray-900 mb-0.5 truncate">{vendor.name}</h3>
                  <p className="text-[10px] text-gray-600 mb-1.5 truncate">{vendor.businessName}</p>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5 text-[10px]">
                    <div className="flex items-center gap-0.5">
                      <Star className="text-yellow-500 fill-current" size={9} />
                      <span className="font-medium">{vendor.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600">{vendor.experience}y</span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="text-gray-600 hidden sm:inline">{vendor.completedProjects}p</span>
                  </div>
                  
                  <div className="flex items-center gap-0.5 text-[10px] text-gray-600 mb-1.5">
                    <MapPin size={9} className="flex-shrink-0" />
                    <span className="truncate">{vendor.address.split(',')[0]}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-1 py-0.5 rounded-full text-[9px] font-medium ${
                      vendor.availability === 'Available' ? 'bg-green-100 text-green-700' :
                      vendor.availability === 'Busy' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {vendor.availability === 'Available' ? 'Avail' : vendor.availability === 'Busy' ? 'Busy' : 'Off'}
                    </span>
                    <span className="text-[9px] text-blue-600">Resp: {vendor.responseTime}</span>
                  </div>
                </div>

                {/* Compact Services */}
                <div className="p-2.5 border-b border-gray-100">
                  <h4 className="text-[10px] font-medium text-gray-700 mb-1.5">Services</h4>
                  <div className="space-y-1">
                    {vendor.services.slice(0, 2).map((service, index) => (
                      <div key={index} className="bg-gray-50 rounded p-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-medium text-gray-900 truncate flex-1">{service.name}</span>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[9px] font-bold text-green-600">{service.rate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {vendor.services.length > 2 && (
                      <div className="text-[8px] text-gray-500 text-center">
                        +{vendor.services.length - 2} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Tags */}
                <div className="p-2.5 border-b border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {vendor.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px] font-medium">
                        {tag}
                      </span>
                    ))}
                    {vendor.tags.length > 3 && (
                      <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[8px]">
                        +{vendor.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Compact Portfolio */}
                {vendor.portfolio.length > 0 && (
                  <div className="p-2.5 border-b border-gray-100">
                    <h4 className="text-[10px] font-medium text-gray-700 mb-1">Portfolio</h4>
                    <div className="flex gap-1">
                      {vendor.portfolio.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Work ${index + 1}`}
                          className="w-10 h-8 object-cover rounded"
                        />
                      ))}
                      {vendor.portfolio.length > 3 && (
                        <div className="w-10 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-[8px] text-gray-500">+{vendor.portfolio.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compact Contact Actions */}
                <div className="p-2.5">
                  <div className="grid grid-cols-3 gap-1 mb-1.5">
                    <button
                      onClick={() => handleContactVendor(vendor, 'call')}
                      className="flex items-center justify-center gap-0.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-[9px] font-medium"
                    >
                      <Phone size={8} />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => handleContactVendor(vendor, 'whatsapp')}
                      className="flex items-center justify-center gap-0.5 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-[9px] font-medium"
                    >
                      <MessageCircle size={8} />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleContactVendor(vendor, 'email')}
                      className="flex items-center justify-center gap-0.5 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-[9px] font-medium"
                    >
                      <Mail size={8} />
                      <span>Email</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] text-gray-500">
                    <span>Response: {vendor.responseTime}</span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-[9px]">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Service Request Summary */}
        {selectedVendors.length > 0 && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-2.5">
            <h3 className="text-xs font-semibold text-blue-900 mb-2">Request Summary</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded p-1.5 text-center">
                <div className="text-sm font-bold text-blue-600">{selectedVendors.length}</div>
                <div className="text-[9px] text-blue-700">Vendors</div>
              </div>
              <div className="bg-white rounded p-1.5 text-center">
                <div className="text-sm font-bold text-green-600">
                  {selectedVendors.reduce((total, id) => {
                    const vendor = vendors.find(v => v.id === id);
                    return total + (vendor?.services.length || 0);
                  }, 0)}
                </div>
                <div className="text-[9px] text-green-700">Services</div>
              </div>
              <div className="bg-white rounded p-1.5 text-center">
                <div className="text-sm font-bold text-purple-600">
                  {(selectedVendors.reduce((total, id) => {
                    const vendor = vendors.find(v => v.id === id);
                    return total + (vendor?.rating || 0);
                  }, 0) / selectedVendors.length).toFixed(1)}
                </div>
                <div className="text-[9px] text-purple-700">Rating</div>
              </div>
            </div>
          </div>
        )}

        {filteredVendors.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Users className="mx-auto text-gray-300 mb-2" size={24} />
            <h3 className="text-xs font-semibold text-gray-900 mb-1">No vendors found</h3>
            <p className="text-[10px] text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDirectory;