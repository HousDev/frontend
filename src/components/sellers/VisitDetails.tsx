import React, { useState } from 'react';
import { 
  Eye, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Star, 
  Phone, 
  MessageCircle, 
  Mail,
  Plus,
  Filter,
  Search,
  Download,
  Share,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  Award,
  Building,
  Camera,
  Video,
  FileText,
  Send,
  Bell,
  Settings,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

import ActivityTimeline from './ActivityTimeline';

const VisitDetails = ({ seller }: any) => {
  const [activeView, setActiveView] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [expandedVisit, setExpandedVisit] = useState<number | null>(null);

  const visits = [
    {
      id: 1,
      type: 'scheduled',
      property: {
        id: 'PROP001',
        title: 'Luxury 3BHK Apartment',
        address: 'Skyline Towers, Andheri West, Mumbai',
        image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      visitor: {
        name: 'Amit Patel',
        phone: '+91 98765 11111',
        email: 'amit.patel@email.com',
        budget: '₹2.2Cr - ₹2.6Cr',
        source: 'Website',
        previousVisits: 0
      },
      schedule: {
        date: '2025-01-15',
        time: '14:00',
        duration: '1 hour',
        purpose: 'Property inspection',
        accompaniedBy: ['Spouse', 'Father'],
        specialRequests: ['Parking space inspection', 'Amenities tour']
      },
      status: 'confirmed',
      priority: 'high',
      notes: 'First-time visitor, very interested buyer',
      createdAt: '2025-01-12T10:30:00Z'
    },
    {
      id: 2,
      type: 'completed',
      property: {
        id: 'PROP002',
        title: 'Premium Villa with Garden',
        address: 'Green Valley Society, Pune',
        image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      visitor: {
        name: 'Priya Shah',
        phone: '+91 87654 32109',
        email: 'priya.shah@email.com',
        budget: '₹3.8Cr - ₹4.5Cr',
        source: 'Referral',
        previousVisits: 1
      },
      schedule: {
        date: '2025-01-11',
        time: '16:00',
        duration: '45 minutes',
        purpose: 'Family visit',
        accompaniedBy: ['Spouse', 'Children'],
        actualDuration: '1 hour 15 minutes'
      },
      feedback: {
        rating: 4.5,
        positives: ['Excellent garden space', 'Good natural light', 'Peaceful location', 'Quality construction'],
        concerns: ['Price slightly high', 'Distance from main road', 'Limited public transport'],
        overallImpression: 'Very positive, considering purchase',
        nextSteps: 'Family discussion, decision by weekend',
        followupDate: '2025-01-16',
        conversionProbability: 75
      },
      status: 'completed',
      priority: 'high',
      notes: 'Excellent visit, high conversion potential',
      createdAt: '2025-01-10T14:00:00Z'
    },
    {
      id: 3,
      type: 'completed',
      property: {
        id: 'PROP001',
        title: 'Luxury 3BHK Apartment',
        address: 'Skyline Towers, Andheri West, Mumbai',
        image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      visitor: {
        name: 'Rohit Gupta',
        phone: '+91 76543 21098',
        email: 'rohit.gupta@email.com',
        budget: '₹2.0Cr - ₹2.4Cr',
        source: 'Social Media',
        previousVisits: 0
      },
      schedule: {
        date: '2025-01-10',
        time: '11:00',
        duration: '30 minutes',
        purpose: 'Quick inspection',
        accompaniedBy: [],
        actualDuration: '25 minutes'
      },
      feedback: {
        rating: 3.5,
        positives: ['Good location', 'Decent amenities'],
        concerns: ['Price too high', 'Small rooms', 'Noise from main road'],
        overallImpression: 'Not convinced, looking for alternatives',
        nextSteps: 'Will compare with other options',
        followupDate: '2025-01-20',
        conversionProbability: 25
      },
      status: 'completed',
      priority: 'low',
      notes: 'Low conversion probability, price sensitive',
      createdAt: '2025-01-09T09:00:00Z'
    },
    {
      id: 4,
      type: 'cancelled',
      property: {
        id: 'PROP002',
        title: 'Premium Villa with Garden',
        address: 'Green Valley Society, Pune',
        image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      visitor: {
        name: 'Neha Sharma',
        phone: '+91 65432 10987',
        email: 'neha.sharma@email.com',
        budget: '₹3.5Cr - ₹4.0Cr',
        source: 'Advertisement',
        previousVisits: 0
      },
      schedule: {
        date: '2025-01-09',
        time: '10:00',
        duration: '1 hour',
        purpose: 'Detailed inspection',
        accompaniedBy: ['Spouse'],
        cancellationReason: 'Emergency came up',
        cancellationTime: '2025-01-09T08:30:00Z'
      },
      status: 'cancelled',
      priority: 'medium',
      notes: 'Rescheduling requested for next week',
      createdAt: '2025-01-08T16:00:00Z'
    }
  ];

  const viewTypes = [
    { id: 'upcoming', label: 'Upcoming', count: visits.filter(v => v.type === 'scheduled').length },
    { id: 'completed', label: 'Completed', count: visits.filter(v => v.type === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: visits.filter(v => v.type === 'cancelled').length },
    { id: 'all', label: 'All Visits', count: visits.length }
  ];

  const properties = [
    { id: 'all', label: 'All Properties' },
    { id: 'PROP001', label: 'Skyline Towers' },
    { id: 'PROP002', label: 'Green Valley Villa' }
  ];

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.visitor.phone.includes(searchTerm);
    
    const matchesView = activeView === 'all' || 
                       (activeView === 'upcoming' && visit.type === 'scheduled') ||
                       (activeView === 'completed' && visit.type === 'completed') ||
                       (activeView === 'cancelled' && visit.type === 'cancelled');
    
    const matchesProperty = selectedProperty === 'all' || visit.property.id === selectedProperty;
    
    return matchesSearch && matchesView && matchesProperty;
  });

  const getVisitStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="text-green-500" size={16} />;
      case 'completed': return <CheckCircle className="text-blue-500" size={16} />;
      case 'cancelled': return <AlertCircle className="text-red-500" size={16} />;
      case 'rescheduled': return <Clock className="text-orange-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getVisitStatusBadge = (status: string) => {
    const statusConfig = {
      'confirmed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
      'completed': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      'rescheduled': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Rescheduled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const handleVisitAction = (action: string, visit: any) => {
    switch (action) {
      case 'call':
        window.open(`tel:${visit.visitor.phone}`);
        break;
      case 'whatsapp':
        const message = `Hi ${visit.visitor.name}, regarding your visit to ${visit.property.title} scheduled for ${formatDate(visit.schedule.date)} at ${formatTime(visit.schedule.time)}. Looking forward to meeting you!`;
        window.open(`https://wa.me/${visit.visitor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'reschedule':
        console.log('Reschedule visit:', visit.id);
        alert('Reschedule visit functionality');
        break;
      case 'cancel':
        console.log('Cancel visit:', visit.id);
        if (window.confirm('Are you sure you want to cancel this visit?')) {
          alert('Visit cancelled successfully');
        }
        break;
      case 'complete':
        console.log('Mark visit as completed:', visit.id);
        alert('Visit marked as completed');
        break;
      default:
        console.log('Action:', action, visit);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Visits</h2>
          <p className="text-gray-600 mt-1">Manage property visits and track visitor feedback</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus size={16} />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Visit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Visits</p>
              <p className="text-2xl font-bold">{visits.length}</p>
            </div>
            <Eye size={24} className="text-blue-200" />
          </div>
          <div className="text-blue-100 text-xs mt-2">+3 this week</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{visits.filter(v => v.type === 'completed').length}</p>
            </div>
            <CheckCircle size={24} className="text-green-200" />
          </div>
          <div className="text-green-100 text-xs mt-2">85% completion rate</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Avg Rating</p>
              <p className="text-2xl font-bold">4.2</p>
            </div>
            <Star size={24} className="text-orange-200" />
          </div>
          <div className="text-orange-100 text-xs mt-2">+0.3 from last month</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Conversion</p>
              <p className="text-2xl font-bold">65%</p>
            </div>
            <Target size={24} className="text-purple-200" />
          </div>
          <div className="text-purple-100 text-xs mt-2">Above average</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search visits by visitor name, property, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.label}
                </option>
              ))}
            </select>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mt-4">
          <div className="flex space-x-1">
            {viewTypes.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === view.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">{view.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeView === view.id ? 'bg-blue-200' : 'bg-gray-200'
                }`}>
                  {view.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {filteredVisits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="p-6">
              {/* Visit Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={visit.property.image}
                    alt={visit.property.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{visit.property.title}</h3>
                      {getVisitStatusBadge(visit.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        visit.priority === 'high' ? 'bg-red-100 text-red-700' :
                        visit.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {visit.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <MapPin size={14} />
                      <span className="text-sm">{visit.property.address}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{formatDate(visit.schedule.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{formatTime(visit.schedule.time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{visit.schedule.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {expandedVisit === visit.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className="relative group">
                    <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-48">
                      <div className="p-2">
                        {visit.type === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleVisitAction('call', visit)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <Phone size={14} />
                              <span>Call Visitor</span>
                            </button>
                            <button
                              onClick={() => handleVisitAction('whatsapp', visit)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <MessageCircle size={14} />
                              <span>Send Reminder</span>
                            </button>
                            <button
                              onClick={() => handleVisitAction('reschedule', visit)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              <Calendar size={14} />
                              <span>Reschedule</span>
                            </button>
                            <button
                              onClick={() => handleVisitAction('cancel', visit)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={14} />
                              <span>Cancel Visit</span>
                            </button>
                          </>
                        )}
                        {visit.type === 'completed' && (
                          <>
                            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                              <FileText size={14} />
                              <span>View Report</span>
                            </button>
                            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                              <Share size={14} />
                              <span>Share Feedback</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visitor Information */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{visit.visitor.name}</div>
                      <div className="text-sm text-gray-600">{visit.visitor.phone}</div>
                      <div className="text-sm text-gray-600">{visit.visitor.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{visit.visitor.budget}</div>
                    <div className="text-xs text-gray-500">Budget Range</div>
                    <div className="text-xs text-blue-600 mt-1">Source: {visit.visitor.source}</div>
                  </div>
                </div>
              </div>

              {/* Visit Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-600 uppercase tracking-wider mb-1">Date & Time</div>
                  <div className="font-semibold text-blue-900">{formatDate(visit.schedule.date)}</div>
                  <div className="text-sm text-blue-700">{formatTime(visit.schedule.time)}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-600 uppercase tracking-wider mb-1">Duration</div>
                  <div className="font-semibold text-green-900">{visit.schedule.duration}</div>
                  {visit.schedule.actualDuration && (
                    <div className="text-sm text-green-700">Actual: {visit.schedule.actualDuration}</div>
                  )}
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-xs text-purple-600 uppercase tracking-wider mb-1">Purpose</div>
                  <div className="font-semibold text-purple-900">{visit.schedule.purpose}</div>
                  {visit.schedule.accompaniedBy.length > 0 && (
                    <div className="text-sm text-purple-700">+{visit.schedule.accompaniedBy.length} others</div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedVisit === visit.id && (
                <div className="space-y-4">
                  {/* Accompanied By */}
                  {visit.schedule.accompaniedBy.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Accompanied By:</div>
                      <div className="flex flex-wrap gap-2">
                        {visit.schedule.accompaniedBy.map((person: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {person}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Requests */}
                  {visit.schedule.specialRequests && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-yellow-700 mb-2">Special Requests:</div>
                      <div className="flex flex-wrap gap-2">
                        {visit.schedule.specialRequests.map((request: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            {request}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visit Feedback (for completed visits) */}
                  {visit.feedback && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">Visit Feedback</h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(visit.feedback.rating)}
                          </div>
                          <span className="text-sm font-bold text-blue-900">{visit.feedback.rating}/5</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-medium text-green-700 mb-2">What they liked:</div>
                          <div className="space-y-1">
                            {visit.feedback.positives.map((positive: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="text-green-500" size={12} />
                                <span className="text-sm text-green-800">{positive}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-red-700 mb-2">Concerns raised:</div>
                          <div className="space-y-1">
                            {visit.feedback.concerns.map((concern: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <AlertCircle className="text-red-500" size={12} />
                                <span className="text-sm text-red-800">{concern}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-blue-700">Overall Impression:</div>
                          <div className="text-sm text-blue-800 mt-1">{visit.feedback.overallImpression}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-blue-700">Next Steps:</div>
                          <div className="text-sm text-blue-800 mt-1">{visit.feedback.nextSteps}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-blue-700">Follow-up Date:</div>
                            <div className="text-sm text-blue-800">{formatDate(visit.feedback.followupDate)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{visit.feedback.conversionProbability}%</div>
                            <div className="text-xs text-green-700">Conversion Probability</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Details */}
                  {visit.type === 'cancelled' && visit.schedule.cancellationReason && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-red-700 mb-1">Cancellation Reason:</div>
                      <div className="text-sm text-red-800">{visit.schedule.cancellationReason}</div>
                      <div className="text-xs text-red-600 mt-1">
                        Cancelled on: {new Date(visit.schedule.cancellationTime).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 mt-4">
                {visit.type === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleVisitAction('call', visit)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Phone size={14} />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => handleVisitAction('whatsapp', visit)}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle size={14} />
                      <span>Remind</span>
                    </button>
                    <button
                      onClick={() => handleVisitAction('complete', visit)}
                      className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <CheckCircle size={14} />
                      <span>Mark Complete</span>
                    </button>
                  </>
                )}
                {visit.type === 'completed' && (
                  <>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                      <FileText size={14} />
                      <span>View Report</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                      <Send size={14} />
                      <span>Follow Up</span>
                    </button>
                  </>
                )}
                {visit.type === 'cancelled' && (
                  <button
                    onClick={() => handleVisitAction('reschedule', visit)}
                    className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Calendar size={14} />
                    <span>Reschedule</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVisits.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Eye className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No visits found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;