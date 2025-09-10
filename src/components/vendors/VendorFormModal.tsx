import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Check,
  Crown,
  Award,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  Shield,
  Star,
  Calendar,
  Briefcase,
  Tag,
  Globe,
  FileText,
  Settings
} from 'lucide-react';

const VendorFormModal = ({ isOpen, onClose, vendor, onSave }: any) => {
  const [formData, setFormData] = useState({
    salutation: 'Mr.',
    name: '',
    businessName: '',
    category: 'plumber',
    countryCode: '+91',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    rating: 4.5,
    experience: 1,
    verified: false,
    reExpertVerified: false,
    reSuggested: false,
    services: [],
    tags: [],
    rateIdea: '',
    portfolio: [],
    description: '',
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '09:00',
      endTime: '18:00',
      weeklyOff: 'Sunday'
    },
    languages: [],
    certifications: [],
    completedProjects: 0,
    responseTime: '1 hour',
    status: 'active'
  });

  const [newService, setNewService] = useState({ name: '', rate: '', unit: 'per sq ft', description: '' });
  const [newTag, setNewTag] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Auto-populate services based on category
  const categoryServices = {
    plumber: [
      { name: 'Pipe Fitting', rate: '₹800-1200', unit: 'per point', description: 'Professional pipe fitting and connection' },
      { name: 'Leak Repair', rate: '₹500-800', unit: 'per repair', description: 'Quick leak detection and repair' },
      { name: 'Bathroom Installation', rate: '₹15000-25000', unit: 'lumpsum', description: 'Complete bathroom plumbing setup' },
      { name: 'Kitchen Plumbing', rate: '₹8000-15000', unit: 'lumpsum', description: 'Kitchen sink and appliance connections' },
      { name: 'Water Tank Installation', rate: '₹3000-5000', unit: 'per tank', description: 'Water tank setup and connection' }
    ],
    tiles: [
      { name: 'Tile Installation', rate: '₹80-150', unit: 'per sq ft', description: 'Professional tile laying and installation' },
      { name: 'Marble Flooring', rate: '₹200-500', unit: 'per sq ft', description: 'Premium marble flooring installation' },
      { name: 'Wall Tiling', rate: '₹60-120', unit: 'per sq ft', description: 'Wall tile installation with perfect alignment' },
      { name: 'Bathroom Tiling', rate: '₹25000-45000', unit: 'lumpsum', description: 'Complete bathroom tiling solution' },
      { name: 'Kitchen Tiling', rate: '₹15000-30000', unit: 'lumpsum', description: 'Kitchen backsplash and flooring' }
    ],
    painter: [
      { name: 'Interior Painting', rate: '₹18-35', unit: 'per sq ft', description: 'Premium interior wall painting' },
      { name: 'Exterior Painting', rate: '₹25-45', unit: 'per sq ft', description: 'Weather resistant exterior painting' },
      { name: 'Texture Work', rate: '₹35-60', unit: 'per sq ft', description: 'Designer texture and pattern work' },
      { name: 'Complete Home Painting', rate: '₹80000-150000', unit: 'lumpsum', description: 'Full home painting package' },
      { name: 'Wood Polishing', rate: '₹40-80', unit: 'per sq ft', description: 'Wood furniture polishing and finishing' }
    ],
    carpenter: [
      { name: 'Custom Furniture', rate: '₹1200-2500', unit: 'per sq ft', description: 'Custom designed furniture making' },
      { name: 'Kitchen Cabinets', rate: '₹800-1800', unit: 'per sq ft', description: 'Modular kitchen cabinet installation' },
      { name: 'Wardrobes', rate: '₹1000-2200', unit: 'per sq ft', description: 'Built-in wardrobe construction' },
      { name: 'Door Installation', rate: '₹3000-8000', unit: 'per door', description: 'Door frame and installation' },
      { name: 'Ceiling Work', rate: '₹150-300', unit: 'per sq ft', description: 'False ceiling and wooden ceiling work' }
    ],
    interior: [
      { name: 'Complete Interior Design', rate: '₹1200-3500', unit: 'per sq ft', description: 'Full interior design and execution' },
      { name: '3D Visualization', rate: '₹15000-35000', unit: 'lumpsum', description: '3D design and visualization' },
      { name: 'Space Planning', rate: '₹50-150', unit: 'per sq ft', description: 'Optimal space utilization planning' },
      { name: 'Furniture Selection', rate: '₹25000-75000', unit: 'lumpsum', description: 'Furniture selection and procurement' },
      { name: 'Lighting Design', rate: '₹200-500', unit: 'per sq ft', description: 'Lighting design and installation' }
    ],
    waterproofing: [
      { name: 'Terrace Waterproofing', rate: '₹45-120', unit: 'per sq ft', description: 'Complete terrace waterproofing solution' },
      { name: 'Bathroom Waterproofing', rate: '₹80-150', unit: 'per sq ft', description: 'Bathroom waterproofing with warranty' },
      { name: 'External Wall Treatment', rate: '₹35-80', unit: 'per sq ft', description: 'External wall waterproofing treatment' },
      { name: 'Basement Waterproofing', rate: '₹100-200', unit: 'per sq ft', description: 'Basement waterproofing and dampproofing' },
      { name: 'Swimming Pool Waterproofing', rate: '₹200-400', unit: 'per sq ft', description: 'Swimming pool waterproofing' }
    ],
    electrician: [
      { name: 'Electrical Wiring', rate: '₹80-150', unit: 'per point', description: 'Complete electrical wiring installation' },
      { name: 'Switch Board Installation', rate: '₹200-500', unit: 'per board', description: 'Electrical switch board setup' },
      { name: 'Fan Installation', rate: '₹300-600', unit: 'per fan', description: 'Ceiling fan installation with wiring' },
      { name: 'Light Fitting', rate: '₹150-400', unit: 'per fitting', description: 'Light fixture installation' },
      { name: 'Home Automation', rate: '₹25000-75000', unit: 'lumpsum', description: 'Smart home automation setup' }
    ]
  };

  // Auto-populate tags based on category
  const categoryTags = {
    plumber: ['24/7 Service', 'Emergency', 'Licensed', 'Insured', 'Warranty', 'Quick Response'],
    tiles: ['Premium Quality', 'Designer Tiles', 'Warranty', 'Installation Included', 'Showroom'],
    painter: ['Asian Paints Dealer', 'Texture Expert', 'Quick Service', 'Warranty', 'Color Consultant'],
    carpenter: ['Custom Work', 'Quality Wood', 'Warranty', 'Design', 'Modular', 'Installation'],
    interior: ['Luxury Design', '3D Design', 'Turnkey', 'Award Winner', 'Consultation', 'Premium'],
    waterproofing: ['10 Year Warranty', 'Chemical Treatment', 'Expert Team', 'Leak Proof', 'Certified'],
    electrician: ['Licensed', 'Safety Certified', '24/7 Service', 'Smart Home', 'Warranty', 'Emergency']
  };

  // Auto-populate languages
  const commonLanguages = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Punjabi'];

  const categories = [
    { id: 'plumber', label: 'Plumber' },
    { id: 'tiles', label: 'Tiles & Flooring' },
    { id: 'painter', label: 'Painter' },
    { id: 'carpenter', label: 'Carpenter' },
    { id: 'interior', label: 'Interior Designer' },
    { id: 'waterproofing', label: 'Water Proofing' },
    { id: 'electrician', label: 'Electrician' }
  ];

  const responseTimeOptions = [
    '30 minutes', '1 hour', '2 hours', '4 hours', '1 day', '2 days'
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const serviceUnits = [
    'per sq ft', 'per point', 'per repair', 'per day', 'per hour', 'lumpsum', 
    'per door', 'per window', 'per room', 'per tank', 'per fan', 'per fitting'
  ];

  useEffect(() => {
    if (vendor) {
      setFormData({
        ...vendor,
        availability: vendor.availability || {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          startTime: '09:00',
          endTime: '18:00',
          weeklyOff: 'Sunday'
        }
      });
      setSameAsPhone(vendor.phone === vendor.whatsapp);
    }
  }, [vendor]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-populate WhatsApp if same as phone
    if (field === 'phone' && sameAsPhone) {
      setFormData(prev => ({ ...prev, whatsapp: value }));
    }
  };

  const handleSameAsPhoneChange = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      services: categoryServices[category as keyof typeof categoryServices] || [],
      tags: categoryTags[category as keyof typeof categoryTags] || [],
      languages: ['Hindi', 'English']
    }));
    
    // Auto-generate description
    generateDescription(category);
  };

  const generateDescription = (category: string) => {
    const descriptions = {
      plumber: 'Professional plumbing services with extensive experience in residential and commercial projects. Specializes in pipe fitting, leak repairs, and complete bathroom installations with 24/7 emergency support.',
      tiles: 'Premium tiles and marble installation services with extensive showroom and quality materials. Expert in luxury flooring solutions with designer collections and professional installation.',
      painter: 'Professional painting services with expertise in interior and exterior painting. Authorized dealer with quality materials and skilled workforce for residential and commercial projects.',
      carpenter: 'Expert carpentry services specializing in custom furniture and modular solutions. Quality craftsmanship with modern designs and professional installation services.',
      interior: 'Professional interior design services with expertise in luxury residential and commercial spaces. Complete design solutions from concept to execution with 3D visualization.',
      waterproofing: 'Professional waterproofing solutions with long-term warranty. Specialized in residential and commercial projects with chemical treatment and expert application.',
      electrician: 'Licensed electrical services with expertise in residential and commercial wiring. Safety certified with experience in modern electrical systems and smart home automation.'
    };
    
    setFormData(prev => ({
      ...prev,
      description: descriptions[category as keyof typeof descriptions] || ''
    }));
  };

  const addService = () => {
    if (newService.name.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { ...newService }]
      }));
      setNewService({ name: '', rate: '', unit: 'per sq ft', description: '' });
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== certification)
    }));
  };

  const handleAvailabilityChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter(d => d !== day)
          : [...prev.availability.days, day]
      }
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter vendor name');
      return;
    }

    if (!formData.businessName.trim()) {
      alert('Please enter business name');
      return;
    }

    if (!formData.phone.trim()) {
      alert('Please enter phone number');
      return;
    }

    if (!formData.email.trim()) {
      alert('Please enter email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const vendorData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // Remove non-digits
        whatsapp: formData.whatsapp.replace(/\D/g, ''), // Remove non-digits
        created_at: vendor?.created_at || new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      await onSave(vendorData);
    } catch (error) {
      console.error('Error saving vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {vendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              <p className="text-gray-600 mt-1">Complete vendor information with services and rates</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="mr-2" size={20} />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salutation</label>
                    <select
                      value={formData.salutation}
                      onChange={(e) => handleInputChange('salutation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter business name"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="mr-2" size={20} />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => handleInputChange('countryCode', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      >
                        <option value="+91">+91 (India)</option>
                        <option value="+1">+1 (USA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (UAE)</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="WhatsApp number"
                        disabled={sameAsPhone}
                      />
                      <button
                        type="button"
                        onClick={() => handleSameAsPhoneChange(!sameAsPhone)}
                        className={`p-2 rounded-lg transition-colors ${
                          sameAsPhone ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}
                        title="Same as phone number"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="vendor@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Shop/Office address"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="mr-2" size={20} />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input
                      type="number"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="5"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completed Projects</label>
                    <input
                      type="number"
                      value={formData.completedProjects}
                      onChange={(e) => handleInputChange('completedProjects', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                    <select
                      value={formData.responseTime}
                      onChange={(e) => handleInputChange('responseTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {responseTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate Idea</label>
                    <input
                      type="text"
                      value={formData.rateIdea}
                      onChange={(e) => handleInputChange('rateIdea', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="₹500-1500 per visit"
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Availability
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            formData.availability.days.includes(day)
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.availability.startTime}
                        onChange={(e) => handleAvailabilityChange('startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.availability.endTime}
                        onChange={(e) => handleAvailabilityChange('endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Off</label>
                      <select
                        value={formData.availability.weeklyOff}
                        onChange={(e) => handleAvailabilityChange('weeklyOff', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {weekDays.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Services with Rate Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Rate Cards</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Service name"
                    />
                    <input
                      type="text"
                      value={newService.rate}
                      onChange={(e) => setNewService({...newService, rate: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Rate (e.g., ₹800-1200)"
                    />
                    <select
                      value={newService.unit}
                      onChange={(e) => setNewService({...newService, unit: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {serviceUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addService}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Service description"
                  />
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {formData.services.map((service: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{service.name}</div>
                            <div className="text-sm text-gray-600">{service.description}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm font-bold text-green-600">{service.rate}</span>
                              <span className="text-xs text-gray-500">{service.unit}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeService(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="mr-2" size={20} />
                  Tags
                </h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add tag (e.g., 24/7 Service)"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        <span className="text-sm">{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="mr-2" size={20} />
                  Languages
                </h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <select
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select language</option>
                      {commonLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addLanguage}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                        <span className="text-sm">{language}</span>
                        <button
                          onClick={() => removeLanguage(language)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="mr-2" size={20} />
                  Certifications
                </h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add certification"
                      onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                    />
                    <button
                      onClick={addCertification}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((certification, index) => (
                      <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                        <span className="text-sm">{certification}</span>
                        <button
                          onClick={() => removeCertification(certification)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2" size={20} />
                  Description
                </h3>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Brief description about the vendor and services..."
                />
              </div>

              {/* Verification Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="mr-2" size={20} />
                  Verification & Status
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => handleInputChange('verified', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Verified Vendor</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.reExpertVerified}
                      onChange={(e) => handleInputChange('reExpertVerified', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Crown className="text-purple-600" size={16} />
                      <span className="text-sm text-gray-700 font-medium">RE Expert Verified</span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.reSuggested}
                      onChange={(e) => handleInputChange('reSuggested', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Award className="text-green-600" size={16} />
                      <span className="text-sm text-gray-700 font-medium">RE Suggested</span>
                    </div>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              All required fields must be filled
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !formData.name.trim() || !formData.businessName.trim() || !formData.phone.trim() || !formData.email.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving...' : vendor ? 'Update Vendor' : 'Save Vendor'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorFormModal;