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
  Shield
} from 'lucide-react';

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
    { value: 'all', label: 'All Activities', count: activities.length },
    { value: 'property_visit', label: 'Visits', count: activities.filter(a => a.type === 'property_visit').length },
    { value: 'property_revisit', label: 'Revisits', count: activities.filter(a => a.type === 'property_revisit').length },
    { value: 'property_inquiry', label: 'Inquiries', count: activities.filter(a => a.type === 'property_inquiry').length },
    { value: 'property_maintenance', label: 'Maintenance', count: activities.filter(a => a.type === 'property_maintenance').length },
    { value: 'property_photography', label: 'Photography', count: activities.filter(a => a.type === 'property_photography').length }
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
      case 'property_visit': return <Eye className="text-green-600" size={16} />;
      case 'property_revisit': return <Eye className="text-blue-600" size={16} />;
      case 'property_inquiry': return <Users className="text-blue-600" size={16} />;
      case 'property_maintenance': return <Settings className="text-orange-600" size={16} />;
      case 'property_photography': return <Camera className="text-purple-600" size={16} />;
      case 'property_inspection': return <Shield className="text-indigo-600" size={16} />;
      default: return <Activity className="text-gray-600" size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-orange-500 bg-orange-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6 pt-0
">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Activity Timeline</h2>
          <p className="text-xs text-gray-600 mt-1">Complete history of property interactions</p>
        </div>
        <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
          <Plus size={14} />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              {timePeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {filteredActivities.map((activity, index) => (
          <div key={activity.id} className={`bg-white rounded-lg border-l-4 ${getPriorityColor(activity.priority)} shadow-sm hover:shadow-md transition-all`}>
            <div className="p-3 sm:p-4">
              {/* Activity Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{activity.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                          activity.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {activity.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          activity.status === 'active' ? 'bg-orange-100 text-orange-700' :
                          activity.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 text-xs">{activity.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={10} />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building size={10} />
                        <span className="truncate">{activity.property}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User size={10} />
                        <span>{activity.visitor}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {expandedActivity === activity.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <div className="relative group">
                    <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-48">
                      <div className="p-2">
                        <button
                          onClick={() => handleQuickAction('schedule', activity)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Calendar size={12} />
                          <span>Schedule Follow-up</span>
                        </button>
                        <button
                          onClick={() => handleQuickAction('update', activity)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Edit size={12} />
                          <span>Update Activity</span>
                        </button>
                        <button
                          onClick={() => handleQuickAction('notes', activity)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <FileText size={12} />
                          <span>Add Notes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Visitor</div>
                    <div className="font-medium text-gray-900 text-xs">{activity.visitor}</div>
                    <div className="text-xs text-gray-600">{activity.visitType.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</div>
                    <div className="font-medium text-gray-900 text-xs">{formatTimestamp(activity.timestamp).split(',')[0]}</div>
                    <div className="text-xs text-gray-600">{formatTimestamp(activity.timestamp).split(',')[1]}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
                    <div className="font-medium text-gray-900 capitalize text-xs">{activity.status}</div>
                    <div className="text-xs text-gray-600">{activity.priority} priority</div>
                  </div>
                </div>
                {activity.remarks && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Remarks</div>
                    <div className="text-xs text-gray-700">{activity.remarks}</div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedActivity === activity.id && (
                <div className="space-y-3">
                  {/* Activity Details */}
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <h4 className="font-semibold text-indigo-900 mb-3 text-xs">Visit Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {Object.entries(activity.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-indigo-700 font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                          </span>
                          <div className="text-indigo-800 mt-1">
                            {Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-1">
                                {value.map((item, index) => (
                                  <span key={index} className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span>{value?.toString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Actions */}
                  {activity.type === 'property_visit' && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-semibold text-green-900 mb-3 text-xs">Visit Outcome</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-green-700">Rating:</span>
                          <div className="flex items-center space-x-1 mt-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < Math.floor(activity.details.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                              />
                            ))}
                            <span className="text-xs font-medium ml-2">{activity.details.rating}/5</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-green-700">Outcome:</span>
                          <div className="text-xs font-medium text-green-900 mt-1 capitalize">{activity.details.visitOutcome}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activity.type === 'property_revisit' && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-900 mb-3 text-xs">Revisit Information</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Previous Visit:</span>
                          <span className="font-medium text-blue-900">{activity.details.previousVisitDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Scheduled:</span>
                          <span className="font-medium text-blue-900">{activity.details.scheduledDate} at {activity.details.scheduledTime}</span>
                        </div>
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
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Activity className="mx-auto text-gray-300 mb-4" size={36} />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">No activities found</h3>
          <p className="text-xs text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;