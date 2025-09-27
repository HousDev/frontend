import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Building,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  Bell,
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { activitiesAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string;
  lead_id?: string;
  property_id?: string;
  lead_name?: string;
  property_title?: string;
  scheduled_at: string;
  completed_at?: string;
  created_at: string;
  created_by: string;
  due_date?: string;
  notes?: string;
}

const ActivitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'task',
    title: '',
    description: '',
    priority: 'medium',
    scheduled_at: '',
    lead_id: '',
    property_id: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    fetchActivities();
  }, [searchTerm, statusFilter, typeFilter, priorityFilter, dateFilter]);


  
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (dateFilter !== 'all') {
        const today = new Date();
        switch (dateFilter) {
          case 'today':
            params.date = today.toISOString().split('T')[0];
            break;
          case 'this_week':
            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
            params.date_from = weekStart.toISOString().split('T')[0];
            break;
          case 'overdue':
            params.overdue = true;
            break;
        }
      }
      
      const response = await activitiesAPI.getActivities(params);
      if (response.success) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      // toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    try {
      const activityData = {
        ...newActivity,
        assigned_to: user?.id,
        lead_id: newActivity.lead_id || undefined,
        property_id: newActivity.property_id || undefined,
      };
      
      await activitiesAPI.createActivity(activityData);
      toast.success('Activity created successfully');
      setNewActivity({
        type: 'task',
        title: '',
        description: '',
        priority: 'medium',
        scheduled_at: '',
        lead_id: '',
        property_id: '',
      });
      setShowAddActivity(false);
      fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity');
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await activitiesAPI.updateActivity(activityId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      toast.success('Activity marked as completed');
      fetchActivities();
    } catch (error) {
      console.error('Error completing activity:', error);
      toast.error('Failed to complete activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activitiesAPI.deleteActivity(activityId);
        toast.success('Activity deleted successfully');
        fetchActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
        toast.error('Failed to delete activity');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'viewing':
        return <Building className="h-4 w-4" />;
      case 'follow_up':
        return <Bell className="h-4 w-4" />;
      case 'note':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const isOverdue = (scheduledAt: string) => {
    return new Date(scheduledAt) < new Date() && !activities.find(a => a.id === scheduledAt)?.completed_at;
  };

  const getUpcomingActivities = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.scheduled_at);
      return activityDate >= today && activityDate <= tomorrow && activity.status !== 'completed';
    });
  };

  const getOverdueActivities = () => {
    return activities.filter(activity => 
      isOverdue(activity.scheduled_at) && activity.status !== 'completed'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your tasks, meetings, and follow-ups
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex space-x-1">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 sm:flex-none"
              >
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex-1 sm:flex-none"
              >
                Calendar
              </Button>
            </div>
            <Button
              onClick={() => setShowAddActivity(true)}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Activity</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {getOverdueActivities().length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800 font-medium text-sm sm:text-base">
                You have {getOverdueActivities().length} overdue activities!
              </span>
            </div>
          </div>
        )}

        {getUpcomingActivities().length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2">
              <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-blue-800 font-medium text-sm sm:text-base">
                You have {getUpcomingActivities().length} activities due today/tomorrow
              </span>
            </div>
          </div>
        )}

        {/* Add Activity Modal */}
        {showAddActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Activity</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddActivity(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="task">Task</option>
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="viewing">Property Viewing</option>
                    <option value="follow_up">Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
                    placeholder="Activity title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base resize-none"
                    placeholder="Activity description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newActivity.priority}
                    onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date/Time</label>
                  <input
                    type="datetime-local"
                    value={newActivity.scheduled_at}
                    onChange={(e) => setNewActivity({ ...newActivity, scheduled_at: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <Button
                    onClick={handleAddActivity}
                    disabled={!newActivity.title || !newActivity.description}
                    className="flex-1 order-1 sm:order-none"
                  >
                    Create Activity
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddActivity(false)}
                    className="flex-1 order-2 sm:order-none"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            
            {/* Filter Toggle for Mobile */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Filters */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Types</option>
                <option value="task">Task</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="viewing">Viewing</option>
                <option value="follow_up">Follow-up</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 sm:p-6 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                        <div className="mt-1 flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col space-y-2">
                            <div className="flex flex-wrap items-start gap-2">
                              <h3 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                                {activity.title}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(activity.status)}`}>
                                  {activity.status || 'Pending'}
                                </span>
                                {activity.priority && (
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 whitespace-nowrap ${getPriorityColor(activity.priority)}`}>
                                    {activity.priority.toUpperCase()}
                                  </span>
                                )}
                                {isOverdue(activity.scheduled_at) && activity.status !== 'completed' && (
                                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded whitespace-nowrap">
                                    OVERDUE
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm sm:text-base break-words">{activity.description}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="break-words">{new Date(activity.scheduled_at).toLocaleString()}</span>
                              </div>
                              {activity.lead_name && (
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                  <span className="break-words">Lead: {activity.lead_name}</span>
                                </div>
                              )}
                              {activity.property_title && (
                                <div className="flex items-center space-x-1">
                                  <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                  <span className="break-words">Property: {activity.property_title}</span>
                                </div>
                              )}
                              <span className="break-words">Created by {activity.created_by}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2 sm:items-end lg:items-center flex-shrink-0">
                        {activity.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteActivity(activity.id)}
                            className="flex items-center space-x-1 text-xs sm:text-sm flex-1 sm:flex-none lg:flex-1 xl:flex-none min-w-0"
                          >
                            <CheckCircle className="h-3 w-3 flex-shrink-0" />
                            <span className="hidden xs:inline truncate">Complete</span>
                            <span className="xs:hidden">✓</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1 text-xs sm:text-sm flex-1 sm:flex-none lg:flex-1 xl:flex-none min-w-0"
                        >
                          <Edit className="h-3 w-3 flex-shrink-0" />
                          <span className="hidden xs:inline truncate">Edit</span>
                          <span className="xs:hidden">✏️</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-800 flex items-center justify-center p-2 min-w-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try adjusting your search criteria'
                      : 'Get started by creating your first activity'}
                  </p>
                  <Button
                    onClick={() => setShowAddActivity(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create First Activity</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;