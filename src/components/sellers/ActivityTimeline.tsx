import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Eye, 
  MessageCircle, 
  Mail, 
  FileText, 
  Handshake,
  Target,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  Edit,
  Trash2,
  Send,
  Download,
  Share,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Bot,
  Zap,
  Crown,
  Gem,
  Flame,
  Sparkles,
  Settings,
  Camera,
  Shield,
  X,
  Save
} from 'lucide-react';

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const ActivityTimeline = ({ seller }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  const activities = [
    {
      id: 1,
      type: 'property_visit',
      title: 'Property Visit Completed',
      description: 'Site visit conducted for Skyline Towers property',
      timestamp: '2025-01-12T14:30:00Z',
      priority: 'high',
      status: 'completed',
      property: 'Skyline Towers, Andheri West',
      visitor: 'Interested Family',
      visitType: 'initial_inspection',
      details: {
        duration: '45 minutes',
        areasVisited: ['Living room', 'All bedrooms', 'Kitchen', 'Balcony'],
        feedback: 'Very impressed with the layout and amenities',
        rating: 4.5,
        concerns: ['Parking space', 'Price negotiation'],
        nextSteps: 'Follow up for final decision',
        followupDate: '2025-01-15',
        visitOutcome: 'positive'
      },
      remarks: 'Potential buyer showed genuine interest, family liked the property layout'
    },
    {
      id: 2,
      type: 'property_revisit',
      title: 'Property Revisit Scheduled',
      description: 'Second visit arranged for Green Valley Villa',
      timestamp: '2025-01-11T16:00:00Z',
      priority: 'medium',
      status: 'scheduled',
      property: 'Green Valley Villa, Pune',
      visitor: 'Previous Visitor',
      visitType: 'detailed_inspection',
      details: {
        scheduledDate: '2025-01-16',
        scheduledTime: '10:00 AM',
        purpose: 'Technical inspection with family',
        previousVisitDate: '2025-01-08',
        previousFeedback: 'Liked the property, wants detailed inspection',
        specialRequests: ['Structural inspection', 'Legal document review'],
        accompaniedBy: 'Family members and technical expert'
      },
      remarks: 'Serious buyer, second visit indicates strong interest'
    },
    {
      id: 3,
      type: 'property_inquiry',
      title: 'Property Inquiry Received',
      description: 'New inquiry received for Metro Heights property',
      timestamp: '2025-01-10T11:15:00Z',
      priority: 'high',
      status: 'new',
      property: 'Metro Heights, Andheri East',
      visitor: 'Potential Investor',
      visitType: 'inquiry',
      details: {
        inquirySource: 'Website',
        interestLevel: 'High',
        budgetRange: '₹1.6Cr - ₹1.8Cr',
        requirements: ['2BHK', 'Investment purpose', 'Good rental yield'],
        timeSpent: '12 minutes',
        pagesViewed: 8,
        followupRequired: true,
        nextAction: 'Schedule property visit'
      },
      remarks: 'Investment-focused inquiry, showed detailed interest in rental potential'
    },
    {
      id: 4,
      type: 'property_maintenance',
      title: 'Property Maintenance Completed',
      description: 'Scheduled maintenance work completed for property preparation',
      timestamp: '2025-01-09T10:00:00Z',
      priority: 'medium',
      status: 'completed',
      property: 'Skyline Towers, Andheri West',
      visitor: 'Maintenance Team',
      visitType: 'maintenance',
      details: {
        workType: 'Pre-sale preparation',
        duration: '4 hours',
        workCompleted: ['Deep cleaning', 'Minor repairs', 'Touch-up painting'],
        cost: '₹8,500',
        vendor: 'Premium Maintenance Services',
        qualityRating: 4.8,
        nextMaintenance: '2025-04-09'
      },
      remarks: 'Property now market-ready, excellent condition for showcasing'
    },
    {
      id: 5,
      type: 'property_photography',
      title: 'Professional Photography Session',
      description: 'Professional photos and video shoot completed',
      timestamp: '2025-01-08T15:30:00Z',
      priority: 'low',
      status: 'completed',
      property: 'Green Valley Villa, Pune',
      visitor: 'Photography Team',
      visitType: 'photography',
      details: {
        sessionDuration: '3 hours',
        photosCount: 45,
        videosCount: 3,
        areasCovers: ['Exterior', 'All rooms', 'Garden', 'Amenities'],
        photographer: 'Premium Photography Services',
        deliveryDate: '2025-01-10',
        cost: '₹15,000',
        qualityRating: 4.9
      },
      remarks: 'Excellent quality photos captured, property looks stunning in images'
    },
    {
      id: 6,
      type: 'property_inspection',
      title: 'Property Inspection Conducted',
      description: 'Technical inspection completed for property assessment',
      timestamp: '2025-01-07T09:00:00Z',
      priority: 'medium',
      status: 'completed',
      property: 'Metro Heights, Andheri East',
      visitor: 'Technical Inspector',
      visitType: 'technical_inspection',
      details: {
        inspectorName: 'Certified Property Inspector',
        duration: '2 hours',
        areasInspected: ['Structure', 'Electrical', 'Plumbing', 'Fixtures'],
        overallRating: 8.5,
        issues: ['Minor electrical work needed', 'Bathroom tile replacement'],
        recommendations: ['Complete minor repairs before listing', 'Get electrical safety certificate'],
        estimatedRepairCost: '₹25,000',
        marketReadiness: 'Good with minor improvements'
      },
      remarks: 'Property in good condition, minor improvements will enhance market appeal'
    }
  ];

  const activityTypes = [
    { value: 'all', label: 'All Activities', count: activities.length, icon: Activity },
    { value: 'property_visit', label: 'Visits', count: activities.filter(a => a.type === 'property_visit').length, icon: Eye },
    { value: 'property_revisit', label: 'Revisits', count: activities.filter(a => a.type === 'property_revisit').length, icon: Eye },
    { value: 'property_inquiry', label: 'Inquiries', count: activities.filter(a => a.type === 'property_inquiry').length, icon: Users },
    { value: 'property_maintenance', label: 'Maintenance', count: activities.filter(a => a.type === 'property_maintenance').length, icon: Settings },
    { value: 'property_photography', label: 'Photography', count: activities.filter(a => a.type === 'property_photography').length, icon: Camera }
  ];

  const timePeriods = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesType;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property_visit': return <Eye size={14} style={{ color: O }} />;
      case 'property_revisit': return <Eye size={14} style={{ color: O }} />;
      case 'property_inquiry': return <Users size={14} style={{ color: O }} />;
      case 'property_maintenance': return <Settings size={14} style={{ color: O }} />;
      case 'property_photography': return <Camera size={14} style={{ color: O }} />;
      case 'property_inspection': return <Shield size={14} style={{ color: O }} />;
      default: return <Activity size={14} style={{ color: O }} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuickAction = (action: string, activity: any) => {
    switch (action) {
      case 'schedule':
        alert('Follow-up scheduling functionality');
        break;
      case 'update':
        alert('Activity update functionality');
        break;
      case 'notes':
        const notes = prompt('Add notes for this activity:');
        if (notes) {
          alert('Notes added successfully');
        }
        break;
      default:
    }
  };

  return (
    <div className="p-0 sm:p-0 lg:p-0 space-y-4 ">
      {/* Header */}
    <div className="flex items-center justify-between gap-2">
  
  {/* LEFT TEXT */}
  <div className="min-w-0">
    <h2
      className="text-sm sm:text-base font-bold truncate"
      style={{ color: N }}
    >
      Activity Timeline
    </h2>
    <p
      className="text-[9px] sm:text-[10px] truncate"
      style={{ color: MU }}
    >
      Complete history of property interactions
    </p>
  </div>

  {/* BUTTON */}
  <button
    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium text-white transition-all hover:opacity-80 whitespace-nowrap"
    style={{ background: O }}
  >
    <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
    <span>Add Activity</span>
  </button>

</div>

      {/* Filters - Desktop remains same, mobile compact */}
      <div className="bg-white rounded-lg p-3 sm:p-4" style={{ border: `1px solid ${BD}` }}>
        <div className="space-y-2.5 sm:space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2" size={14} style={{ color: MU }} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border rounded-lg text-[11px] sm:text-xs focus:outline-none focus:ring-1"
              style={{ borderColor: BD }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-[11px] sm:text-xs focus:outline-none focus:ring-1 bg-white"
              style={{ borderColor: BD }}
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} ({type.count})
                </option>
              ))}
            </select>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-[11px] sm:text-xs focus:outline-none focus:ring-1 bg-white"
              style={{ borderColor: BD }}
            >
              {timePeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {activityTypes.map((type) => {
              const Icon = type.icon;
              const isActive = filterType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-lg transition-colors text-[9px] sm:text-[10px] ${isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={isActive ? { background: O } : {}}
                >
                  <Icon size={10} className="sm:w-[12px] sm:h-[12px]" />
                  <span className="overflow-x">{type.label}</span>
                  <span className="px-1 py-0.5 rounded-full text-[7px] sm:text-[8px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}">
                    {type.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Timeline - Mobile compact */}
      <div className="space-y-2 sm:space-y-3">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow-2xs hover:shadow-xs transition-all" style={{ border: `1px solid ${BD}`, borderLeftWidth: '3px sm:4px', borderLeftColor: O }}>
            <div className="p-2 sm:p-2.5">
              {/* Activity Header - Mobile: stacked, Desktop: row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ background: `${O}10` }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                      <h3 className="text-[10px] sm:text-[11px] font-semibold truncate" style={{ color: N }}>{activity.title}</h3>
                      <span className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-medium ${
                        activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                        activity.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {activity.priority}
                      </span>
                      <span className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-medium ${
                        activity.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        activity.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] mb-1 sm:mb-1.5 line-clamp-1" style={{ color: MU }}>{activity.description}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[8px] sm:text-[9px]" style={{ color: MU }}>
                      <span className="flex items-center gap-0.5 sm:gap-1"><Calendar size={8} className="sm:w-[9px] sm:h-[9px]" />{formatTimestamp(activity.timestamp)}</span>
                      <span className="flex items-center gap-0.5 sm:gap-1"><Building size={8} className="sm:w-[9px] sm:h-[9px]" /><span className="truncate max-w-[100px] sm:max-w-[140px]">{activity.property}</span></span>
                      <span className="flex items-center gap-0.5 sm:gap-1"><User size={8} className="sm:w-[9px] sm:h-[9px]" />{activity.visitor}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                    className="p-1 sm:p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                    style={{ background: BG }}
                  >
                    {expandedActivity === activity.id ? <ChevronDown size={12} className="sm:w-[14px] sm:h-[14px]" style={{ color: MU }} /> : <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px]" style={{ color: MU }} />}
                  </button>
                  <div className="relative group">
                    <button className="p-1 sm:p-1.5 rounded-lg transition-colors hover:bg-gray-100" style={{ background: BG }}>
                      <MoreHorizontal size={12} className="sm:w-[14px] sm:h-[14px]" style={{ color: MU }} />
                    </button>
                    <div className="absolute right-0 top-7 sm:top-8 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-32 sm:w-40" style={{ borderColor: BD }}>
                      <div className="p-1">
                        <button onClick={() => handleQuickAction('schedule', activity)} className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 text-[8px] sm:text-[9px] text-gray-700 hover:bg-gray-100 rounded"><Calendar size={10} className="sm:w-[12px] sm:h-[12px]" /><span>Schedule</span></button>
                        <button onClick={() => handleQuickAction('update', activity)} className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 text-[8px] sm:text-[9px] text-gray-700 hover:bg-gray-100 rounded"><Edit size={10} className="sm:w-[12px] sm:h-[12px]" /><span>Update</span></button>
                        <button onClick={() => handleQuickAction('notes', activity)} className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 text-[8px] sm:text-[9px] text-gray-700 hover:bg-gray-100 rounded"><FileText size={10} className="sm:w-[12px] sm:h-[12px]" /><span>Notes</span></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary - Mobile compact */}
              <div className="rounded-lg p-2 sm:p-2.5 mb-2 sm:mb-2.5" style={{ background: BG }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[9px] sm:text-[10px]">
                  <div><div className="text-[6px] sm:text-[7px] uppercase mb-0.5" style={{ color: MU }}>Visitor</div><div className="font-medium text-[9px] sm:text-[10px]" style={{ color: N }}>{activity.visitor}</div><div className="text-[8px] sm:text-[9px] capitalize" style={{ color: MU }}>{activity.visitType.replace('_', ' ')}</div></div>
                  <div><div className="text-[6px] sm:text-[7px] uppercase mb-0.5" style={{ color: MU }}>Date</div><div className="font-medium text-[9px] sm:text-[10px]" style={{ color: N }}>{formatTimestamp(activity.timestamp).split(',')[0]}</div><div className="text-[8px] sm:text-[9px]" style={{ color: MU }}>{formatTimestamp(activity.timestamp).split(',')[1]}</div></div>
                  <div><div className="text-[6px] sm:text-[7px] uppercase mb-0.5" style={{ color: MU }}>Status</div><div className="font-medium capitalize text-[9px] sm:text-[10px]" style={{ color: N }}>{activity.status}</div><div className="text-[8px] sm:text-[9px]" style={{ color: MU }}>{activity.priority} priority</div></div>
                </div>
                {activity.remarks && (
                  <div className="mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t" style={{ borderColor: BD }}>
                    <div className="text-[6px] sm:text-[7px] uppercase mb-0.5" style={{ color: MU }}>Remarks</div>
                    <div className="text-[8px] sm:text-[9px] line-clamp-2" style={{ color: MU }}>{activity.remarks}</div>
                  </div>
                )}
              </div>

              {/* Expanded Details - Mobile compact */}
              {expandedActivity === activity.id && (
                <div className="space-y-2 sm:space-y-2.5 mt-2 sm:mt-2.5">
                  <div className="rounded-lg p-2 sm:p-2.5" style={{ background: `${O}5`, border: `1px solid ${O}15` }}>
                    <h4 className="text-[8px] sm:text-[9px] font-semibold mb-1.5 sm:mb-2" style={{ color: O }}>Visit Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[8px] sm:text-[9px]">
                      {Object.entries(activity.details).slice(0, 4).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium" style={{ color: O }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).slice(0, 15)}:</span>
                          <div className="mt-0.5" style={{ color: MU }}>
                            {Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-0.5 mt-0.5">{value.slice(0, 2).map((item, idx) => (<span key={idx} className="px-1 py-0.5 rounded-full text-[7px]" style={{ background: `${O}10`, color: O }}>{item}</span>))}{value.length > 2 && <span className="text-[7px]">+{value.length-2}</span>}</div>
                            ) : (typeof value === 'string' || typeof value === 'number') ? (value.toString().slice(0, 30) + (value.toString().length > 30 ? '...' : '')) : (value?.toString()?.slice(0, 30))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activity.type === 'property_visit' && (
                    <div className="rounded-lg p-2 sm:p-2.5" style={{ background: `${O}5`, border: `1px solid ${O}15` }}>
                      <h4 className="text-[8px] sm:text-[9px] font-semibold mb-1.5 sm:mb-2" style={{ color: O }}>Visit Outcome</h4>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <div><span className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Rating:</span><div className="flex items-center gap-0.5 mt-0.5">{Array.from({ length: 5 }, (_, i) => (<Star key={i} size={8} className="sm:w-[9px] sm:h-[9px]" style={i < Math.floor(activity.details.rating) ? { color: '#eab308', fill: '#eab308' } : { color: BD }} />))}</div></div>
                        <div><span className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Outcome:</span><div className="text-[8px] sm:text-[9px] font-medium capitalize mt-0.5" style={{ color: O }}>{activity.details.visitOutcome}</div></div>
                      </div>
                    </div>
                  )}

                  {activity.type === 'property_revisit' && (
                    <div className="rounded-lg p-2 sm:p-2.5" style={{ background: `${O}5`, border: `1px solid ${O}15` }}>
                      <h4 className="text-[8px] sm:text-[9px] font-semibold mb-1.5 sm:mb-2" style={{ color: O }}>Revisit Info</h4>
                      <div className="space-y-0.5 text-[8px] sm:text-[9px]">
                        <div className="flex justify-between"><span style={{ color: MU }}>Previous:</span><span className="font-medium" style={{ color: N }}>{activity.details.previousVisitDate}</span></div>
                        <div className="flex justify-between"><span style={{ color: MU }}>Scheduled:</span><span className="font-medium" style={{ color: N }}>{activity.details.scheduledDate}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="bg-white rounded-lg p-6 sm:p-8 text-center" style={{ border: `1px solid ${BD}` }}>
          <Activity size={28} className="sm:w-[32px] sm:h-[32px] mx-auto mb-2 sm:mb-3" style={{ color: MU }} />
          <h3 className="text-[10px] sm:text-[11px] font-semibold mb-0.5 sm:mb-1" style={{ color: N }}>No activities found</h3>
          <p className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;