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
  Save,
  Bell,
  Eye,
  MapPin,
  Home
} from 'lucide-react';

const SellerActivityTimeline = ({ seller }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Seller-focused activities (no buyer contact details)
  const activities = [
    {
      id: 1,
      type: 'call',
      title: 'Follow-up Call Completed',
      description: 'Called regarding property inquiry and requirements',
      timestamp: '2025-01-12T14:30:00Z',
      priority: 'high',
      status: 'completed',
      property: 'Skyline Towers, Andheri West',
      stage: 'property_hunting',
      duration: '15 minutes',
      outcome: 'Positive response, interested in visiting property',
      nextAction: 'Schedule property visit',
      executedBy: 'Admin User',
      remarks: 'Buyer showed genuine interest, ready to visit this weekend'
    },
    {
      id: 2,
      type: 'meeting',
      title: 'Property Discussion Meeting',
      description: 'Detailed discussion about property features and pricing',
      timestamp: '2025-01-11T16:00:00Z',
      priority: 'medium',
      status: 'completed',
      property: 'Green Valley Villa, Pune',
      stage: 'negotiation',
      duration: '45 minutes',
      outcome: 'Price negotiation initiated, buyer interested',
      nextAction: 'Prepare counter offer',
      executedBy: 'Admin User',
      remarks: 'Productive meeting, buyer understands property value'
    },
    {
      id: 3,
      type: 'email',
      title: 'Property Details Shared',
      description: 'Sent comprehensive property information via email',
      timestamp: '2025-01-10T11:15:00Z',
      priority: 'medium',
      status: 'completed',
      property: 'Metro Heights, Andheri East',
      stage: 'initial_contact',
      duration: '10 minutes',
      outcome: 'Information shared successfully',
      nextAction: 'Wait for buyer response',
      executedBy: 'Admin User',
      remarks: 'Sent detailed brochure and floor plans'
    },
    {
      id: 4,
      type: 'whatsapp',
      title: 'WhatsApp Communication',
      description: 'Quick discussion about property availability',
      timestamp: '2025-01-09T10:00:00Z',
      priority: 'low',
      status: 'completed',
      property: 'Skyline Towers, Andheri West',
      stage: 'initial_contact',
      duration: '5 minutes',
      outcome: 'Confirmed property availability',
      nextAction: 'Schedule detailed discussion',
      executedBy: 'Admin User',
      remarks: 'Quick response to buyer query'
    },
    {
      id: 5,
      type: 'presentation',
      title: 'Property Presentation',
      description: 'Detailed property presentation with market analysis',
      timestamp: '2025-01-08T15:30:00Z',
      priority: 'high',
      status: 'completed',
      property: 'Green Valley Villa, Pune',
      stage: 'requirement_gathering',
      duration: '1 hour',
      outcome: 'Buyer impressed with property features',
      nextAction: 'Arrange site visit',
      executedBy: 'Admin User',
      remarks: 'Comprehensive presentation covering all aspects'
    },
    {
      id: 6,
      type: 'follow_up',
      title: 'Scheduled Follow-up',
      description: 'Regular follow-up on property interest',
      timestamp: '2025-01-07T09:00:00Z',
      priority: 'medium',
      status: 'completed',
      property: 'Metro Heights, Andheri East',
      stage: 'property_hunting',
      duration: '20 minutes',
      outcome: 'Maintained buyer interest',
      nextAction: 'Continue regular follow-ups',
      executedBy: 'Admin User',
      remarks: 'Buyer still evaluating options'
    }
  ];

  const activityTypes = [
    { value: 'all', label: 'All Activities', count: activities.length },
    { value: 'call', label: 'Calls', count: activities.filter(a => a.type === 'call').length },
    { value: 'meeting', label: 'Meetings', count: activities.filter(a => a.type === 'meeting').length },
    { value: 'email', label: 'Emails', count: activities.filter(a => a.type === 'email').length },
    { value: 'whatsapp', label: 'WhatsApp', count: activities.filter(a => a.type === 'whatsapp').length },
    { value: 'presentation', label: 'Presentations', count: activities.filter(a => a.type === 'presentation').length }
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
      case 'call': return <Phone className="text-blue-600" size={16} />;
      case 'meeting': return <Users className="text-green-600" size={16} />;
      case 'email': return <Mail className="text-purple-600" size={16} />;
      case 'whatsapp': return <MessageCircle className="text-green-600" size={16} />;
      case 'presentation': return <FileText className="text-orange-600" size={16} />;
      case 'follow_up': return <Bell className="text-blue-600" size={16} />;
      default: return <Activity className="text-gray-600" size={16} />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-700';
      case 'meeting': return 'bg-green-100 text-green-700';
      case 'email': return 'bg-purple-100 text-purple-700';
      case 'whatsapp': return 'bg-green-100 text-green-700';
      case 'presentation': return 'bg-orange-100 text-orange-700';
      case 'follow_up': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
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

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleSaveActivity = (activityData: any) => {
    console.log('Saving activity:', activityData);
    setShowActivityModal(false);
    setEditingActivity(null);
    alert('Activity saved successfully!');
  };

  const handleQuickAction = (action: string, activity: any) => {
    switch (action) {
      case 'schedule':
        console.log('Schedule follow-up for:', activity.property);
        alert('Follow-up scheduling functionality');
        break;
      case 'update':
        handleEditActivity(activity);
        break;
      case 'notes':
        const notes = prompt('Add notes for this activity:');
        if (notes) {
          console.log('Adding notes:', notes);
          alert('Notes added successfully');
        }
        break;
      default:
        console.log('Action:', action, activity);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6 pt-0
">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Activity Timeline</h2>
          <p className="text-xs text-gray-600 mt-1">Track all communications and interactions</p>
        </div>
        <button
          onClick={handleAddActivity}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
        >
          <Plus size={14} />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Activities</p>
              <p className="text-sm sm:text-base font-bold">{activities.length}</p>
            </div>
            <Activity size={18} className="text-blue-200" />
          </div>
          <div className="text-blue-100 text-xs mt-1">All interactions</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">This Week</p>
              <p className="text-sm sm:text-base font-bold">{activities.filter(a => {
                const activityDate = new Date(a.timestamp);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return activityDate >= weekAgo;
              }).length}</p>
            </div>
            <TrendingUp size={18} className="text-green-200" />
          </div>
          <div className="text-green-100 text-xs mt-1">Recent activities</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">High Priority</p>
              <p className="text-sm sm:text-base font-bold">{activities.filter(a => a.priority === 'high').length}</p>
            </div>
            <Target size={18} className="text-purple-200" />
          </div>
          <div className="text-purple-100 text-xs mt-1">Important tasks</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Avg Response</p>
              <p className="text-sm sm:text-base font-bold">2.5h</p>
            </div>
            <Clock size={18} className="text-orange-200" />
          </div>
          <div className="text-orange-100 text-xs mt-1">Response time</div>
        </div>
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

          {/* Activity Type Tabs */}
          <div className="mt-2">
            <div className="flex space-x-1 overflow-x-auto pb-1">
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-xs ${
                    filterType === type.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{type.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    filterType === type.value ? 'bg-blue-200' : 'bg-gray-200'
                  }`}>
                    {type.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                          {activity.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                          activity.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {activity.priority}
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
                        <Clock size={10} />
                        <span>{activity.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User size={10} />
                        <span>{activity.executedBy}</span>
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
                          onClick={() => handleQuickAction('update', activity)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Edit size={12} />
                          <span>Edit Activity</span>
                        </button>
                        <button
                          onClick={() => handleQuickAction('schedule', activity)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Calendar size={12} />
                          <span>Schedule Follow-up</span>
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
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stage</div>
                    <div className="font-medium text-gray-900 text-xs">{activity.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Outcome</div>
                    <div className="font-medium text-gray-900 text-xs">{activity.outcome}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next Action</div>
                    <div className="font-medium text-gray-900 text-xs">{activity.nextAction}</div>
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
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-900 mb-3 text-xs">Activity Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-blue-700 font-medium">Type:</span>
                        <span className="text-blue-800 ml-2 capitalize">{activity.type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Duration:</span>
                        <span className="text-blue-800 ml-2">{activity.duration}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Stage:</span>
                        <span className="text-blue-800 ml-2">{activity.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Status:</span>
                        <span className="text-blue-800 ml-2 capitalize">{activity.status}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-blue-700 font-medium">Property:</span>
                        <span className="text-blue-800 ml-2">{activity.property}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Outcome */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-semibold text-green-900 mb-3 text-xs">Activity Outcome</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-green-700 font-medium">Outcome:</span>
                        <div className="text-xs text-green-800 mt-1">{activity.outcome}</div>
                      </div>
                      <div>
                        <span className="text-xs text-green-700 font-medium">Next Action:</span>
                        <div className="text-xs text-green-800 mt-1">{activity.nextAction}</div>
                      </div>
                      {activity.remarks && (
                        <div>
                          <span className="text-xs text-green-700 font-medium">Remarks:</span>
                          <div className="text-xs text-green-800 mt-1">{activity.remarks}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  onClick={() => handleQuickAction('update', activity)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  <Edit size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleQuickAction('schedule', activity)}
                  className="flex items-center space-x-1 px-2 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                >
                  <Calendar size={12} />
                  <span className="hidden sm:inline">Follow-up</span>
                </button>
                <button
                  onClick={() => handleQuickAction('notes', activity)}
                  className="flex items-center space-x-1 px-2 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs"
                >
                  <FileText size={12} />
                  <span className="hidden sm:inline">Add Notes</span>
                </button>
              </div>
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

      {/* Activity Modal */}
      {showActivityModal && (
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
          }}
          activity={editingActivity}
          onSave={handleSaveActivity}
        />
      )}
    </div>
  );
};

// Activity Modal Component
const ActivityModal = ({ isOpen, onClose, activity, onSave }: any) => {
  const [formData, setFormData] = useState({
    type: activity?.type || 'call',
    title: activity?.title || '',
    description: activity?.description || '',
    property: activity?.property || '',
    stage: activity?.stage || 'initial_contact',
    duration: activity?.duration || '30 minutes',
    outcome: activity?.outcome || '',
    nextAction: activity?.nextAction || '',
    executedBy: activity?.executedBy || 'Admin User',
    remarks: activity?.remarks || '',
    priority: activity?.priority || 'medium'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activityTypes = [
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'meeting', label: 'Meeting', icon: Users },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { value: 'presentation', label: 'Presentation', icon: FileText },
    { value: 'follow_up', label: 'Follow-up', icon: Bell }
  ];

  const stages = [
    { value: 'initial_contact', label: 'Initial Contact' },
    { value: 'requirement_gathering', label: 'Requirement Gathering' },
    { value: 'property_hunting', label: 'Property Hunting' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'deal_closure', label: 'Deal Closure' }
  ];

  const durations = [
    '5 minutes', '10 minutes', '15 minutes', '30 minutes', '45 minutes', 
    '1 hour', '1.5 hours', '2 hours', '3 hours'
  ];

  const priorities = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter activity title');
      return;
    }

    if (!formData.outcome.trim()) {
      alert('Please enter activity outcome');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const activityData = {
        ...formData,
        id: activity?.id || Date.now(),
        timestamp: activity?.timestamp || new Date().toISOString(),
        status: 'completed',
        created_at: activity?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await onSave(activityData);
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {activity ? 'Edit Activity' : 'Add New Activity'}
              </h2>
              <p className="text-xs text-gray-600 mt-1">Record seller interaction and outcomes</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Activity Type */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Activity Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activityTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-all text-xs ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Activity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  placeholder="Brief title of the activity"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Property</label>
                <input
                  type="text"
                  value={formData.property}
                  onChange={(e) => handleInputChange('property', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  placeholder="Property name or address"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
              rows={3}
              placeholder="Detailed description of the activity..."
            />
          </div>

          {/* Duration, Stage, Priority */}
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                >
                  {durations.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                >
                  {stages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Outcome and Next Action */}
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Outcome <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  rows={2}
                  placeholder="What was achieved in this activity?"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Next Action</label>
                <textarea
                  value={formData.nextAction}
                  onChange={(e) => handleInputChange('nextAction', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  rows={2}
                  placeholder="What should be done next?"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
              rows={3}
              placeholder="Detailed notes about the activity, client response, concerns, etc."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Activity will be added to seller timeline
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !formData.title.trim() || !formData.outcome.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                <Save size={14} />
                <span>{isSubmitting ? 'Saving...' : activity ? 'Update Activity' : 'Save Activity'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerActivityTimeline;