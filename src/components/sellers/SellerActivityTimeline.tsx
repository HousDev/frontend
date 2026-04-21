import React, { useState } from "react";
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
  Home,
} from "lucide-react";

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const SellerActivityTimeline = ({ seller }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Seller-focused activities (no buyer contact details)
  const activities = [
    {
      id: 1,
      type: "call",
      title: "Follow-up Call Completed",
      description: "Called regarding property inquiry and requirements",
      timestamp: "2025-01-12T14:30:00Z",
      priority: "high",
      status: "completed",
      property: "Skyline Towers, Andheri West",
      stage: "property_hunting",
      duration: "15 minutes",
      outcome: "Positive response, interested in visiting property",
      nextAction: "Schedule property visit",
      executedBy: "Admin User",
      remarks: "Buyer showed genuine interest, ready to visit this weekend",
    },
    {
      id: 2,
      type: "meeting",
      title: "Property Discussion Meeting",
      description: "Detailed discussion about property features and pricing",
      timestamp: "2025-01-11T16:00:00Z",
      priority: "medium",
      status: "completed",
      property: "Green Valley Villa, Pune",
      stage: "negotiation",
      duration: "45 minutes",
      outcome: "Price negotiation initiated, buyer interested",
      nextAction: "Prepare counter offer",
      executedBy: "Admin User",
      remarks: "Productive meeting, buyer understands property value",
    },
    {
      id: 3,
      type: "email",
      title: "Property Details Shared",
      description: "Sent comprehensive property information via email",
      timestamp: "2025-01-10T11:15:00Z",
      priority: "medium",
      status: "completed",
      property: "Metro Heights, Andheri East",
      stage: "initial_contact",
      duration: "10 minutes",
      outcome: "Information shared successfully",
      nextAction: "Wait for buyer response",
      executedBy: "Admin User",
      remarks: "Sent detailed brochure and floor plans",
    },
    {
      id: 4,
      type: "whatsapp",
      title: "WhatsApp Communication",
      description: "Quick discussion about property availability",
      timestamp: "2025-01-09T10:00:00Z",
      priority: "low",
      status: "completed",
      property: "Skyline Towers, Andheri West",
      stage: "initial_contact",
      duration: "5 minutes",
      outcome: "Confirmed property availability",
      nextAction: "Schedule detailed discussion",
      executedBy: "Admin User",
      remarks: "Quick response to buyer query",
    },
    {
      id: 5,
      type: "presentation",
      title: "Property Presentation",
      description: "Detailed property presentation with market analysis",
      timestamp: "2025-01-08T15:30:00Z",
      priority: "high",
      status: "completed",
      property: "Green Valley Villa, Pune",
      stage: "requirement_gathering",
      duration: "1 hour",
      outcome: "Buyer impressed with property features",
      nextAction: "Arrange site visit",
      executedBy: "Admin User",
      remarks: "Comprehensive presentation covering all aspects",
    },
    {
      id: 6,
      type: "follow_up",
      title: "Scheduled Follow-up",
      description: "Regular follow-up on property interest",
      timestamp: "2025-01-07T09:00:00Z",
      priority: "medium",
      status: "completed",
      property: "Metro Heights, Andheri East",
      stage: "property_hunting",
      duration: "20 minutes",
      outcome: "Maintained buyer interest",
      nextAction: "Continue regular follow-ups",
      executedBy: "Admin User",
      remarks: "Buyer still evaluating options",
    },
  ];

  const activityTypes = [
    { value: "all", label: "All Activities", count: activities.length },
    {
      value: "call",
      label: "Calls",
      count: activities.filter((a) => a.type === "call").length,
    },
    {
      value: "meeting",
      label: "Meetings",
      count: activities.filter((a) => a.type === "meeting").length,
    },
    {
      value: "email",
      label: "Emails",
      count: activities.filter((a) => a.type === "email").length,
    },
    {
      value: "whatsapp",
      label: "WhatsApp",
      count: activities.filter((a) => a.type === "whatsapp").length,
    },
    {
      value: "presentation",
      label: "Presentations",
      count: activities.filter((a) => a.type === "presentation").length,
    },
  ];

  const timePeriods = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || activity.type === filterType;
    return matchesSearch && matchesType;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone size={12} style={{ color: O }} />;
      case "meeting":
        return <Users size={12} style={{ color: O }} />;
      case "email":
        return <Mail size={12} style={{ color: O }} />;
      case "whatsapp":
        return <MessageCircle size={12} style={{ color: O }} />;
      case "presentation":
        return <FileText size={12} style={{ color: O }} />;
      case "follow_up":
        return <Bell size={12} style={{ color: O }} />;
      default:
        return <Activity size={12} style={{ color: O }} />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "call":
        return "bg-blue-100 text-blue-700";
      case "meeting":
        return "bg-green-100 text-green-700";
      case "email":
        return "bg-purple-100 text-purple-700";
      case "whatsapp":
        return "bg-green-100 text-green-700";
      case "presentation":
        return "bg-orange-100 text-orange-700";
      case "follow_up":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return `border-l-${O.replace("#", "")} bg-red-50`;
      case "medium":
        return `border-l-${O.replace("#", "")} bg-orange-50`;
      case "low":
        return `border-l-${O.replace("#", "")} bg-green-50`;
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    setShowActivityModal(false);
    setEditingActivity(null);
    alert("Activity saved successfully!");
  };

  const handleQuickAction = (action: string, activity: any) => {
    switch (action) {
      case "schedule":
        alert("Follow-up scheduling functionality");
        break;
      case "update":
        handleEditActivity(activity);
        break;
      case "notes":
        const notes = prompt("Add notes for this activity:");
        if (notes) {
          alert("Notes added successfully");
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-1 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold" style={{ color: N }}>
            Activity Timeline
          </h2>
          <p className="text-[9px]" style={{ color: MU }}>
            Track all communications and interactions
          </p>
        </div>
        <button
          onClick={handleAddActivity}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-medium text-white transition-all hover:opacity-80"
          style={{ background: O }}
        >
          <Plus size={12} />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="rounded-lg p-2 bg-blue-100" >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-600">Total Activities</p>
              <p className="text-sm font-bold text-gray-600">
                {activities.length}
              </p>
            </div>
            <Activity size={14} className="text-gray-600" />
          </div>
          <div className="text-[9px] text-gray-600 mt-0.5">
            All interactions
          </div>
        </div>
        <div className="rounded-lg p-2 bg-violet-100" >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-600">This Week</p>
              <p className="text-sm font-bold text-gray-600">
                {
                  activities.filter((a) => {
                    const activityDate = new Date(a.timestamp);
                    const weekAgo = new Date(
                      Date.now() - 7 * 24 * 60 * 60 * 1000,
                    );
                    return activityDate >= weekAgo;
                  }).length
                }
              </p>
            </div>
            <TrendingUp size={14} className="text-gray-800" />
          </div>
          <div className="text-[9px] text-gray-800 mt-0.5">
            Recent activities
          </div>
        </div>
        <div className="rounded-lg p-2 bg-red-100" >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-800">High Priority</p>
              <p className="text-sm font-bold text-gray-800">
                {activities.filter((a) => a.priority === "high").length}
              </p>
            </div>
            <Target size={14} className="text-gray-800" />
          </div>
          <div className="text-[9px] text-gray-800/70 mt-0.5">Important tasks</div>
        </div>
        <div className="rounded-lg p-2 bg-gray-100" >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-800">Avg Response</p>
              <p className="text-sm font-bold text-gray-800">2.5h</p>
            </div>
            <Clock size={14} className="text-gray-800" />
          </div>
          <div className="text-[9px] text-gray-800 mt-0.5">Response time</div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-lg p-2.5"
        style={{ background: "white", border: `1px solid ${BD}` }}
      >
        <div className="space-y-2">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2"
              style={{ color: MU }}
            />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-[10px] focus:outline-none focus:ring-1"
              style={{ borderColor: BD }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2 py-1.5 border rounded-lg text-[10px] focus:outline-none focus:ring-1"
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
              className="px-2 py-1.5 border rounded-lg text-[10px] focus:outline-none focus:ring-1"
              style={{ borderColor: BD }}
            >
              {timePeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            {activityTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-[10px] ${filterType === type.value ? "text-white" : "text-gray-600 hover:bg-gray-100"}`}
                style={filterType === type.value ? { background: O } : {}}
              >
                <span>{type.label}</span>
                <span
                  className={`px-1 py-0 rounded-full text-[7px] ${filterType === type.value ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {type.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-2">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all`}
            style={{
              borderLeftColor: O,
              border: `1px solid ${BD}`,
              borderLeftWidth: "4px",
            }}
          >
            <div className="p-2.5">
              {/* Activity Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{ background: `${O}10` }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <h3
                        className="text-[10px] font-semibold truncate"
                        style={{ color: N }}
                      >
                        {activity.title}
                      </h3>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getActivityTypeColor(activity.type)}`}
                      >
                        {activity.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${activity.priority === "high" ? "bg-red-100 text-red-700" : activity.priority === "medium" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}
                      >
                        {activity.priority}
                      </span>
                    </div>
                    <p className="text-[9px] mb-1" style={{ color: MU }}>
                      {activity.description}
                    </p>
                    <div
                      className="flex flex-wrap gap-2 text-[8px] font-medium"
                      style={{ color: MU }}
                    >
                      <span className="flex items-center gap-0.5">
                        <Calendar size={7} />
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Building size={7} />
                        <span className="truncate max-w-[120px]">
                          {activity.property}
                        </span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock size={7} />
                        {activity.duration}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <User size={7} />
                        {activity.executedBy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() =>
                      setExpandedActivity(
                        expandedActivity === activity.id ? null : activity.id,
                      )
                    }
                    className="p-1 rounded"
                    style={{ background: BG }}
                  >
                    {expandedActivity === activity.id ? (
                      <ChevronDown size={12} style={{ color: MU }} />
                    ) : (
                      <ChevronRight size={12} style={{ color: MU }} />
                    )}
                  </button>
                  <div className="relative group">
                    <button className="p-1 rounded" style={{ background: BG }}>
                      <MoreHorizontal size={12} style={{ color: MU }} />
                    </button>
                    <div
                      className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-36"
                      style={{ borderColor: BD }}
                    >
                      <div className="p-1">
                        <button
                          onClick={() => handleQuickAction("update", activity)}
                          className="w-full flex items-center gap-1.5 px-2 py-1 text-[7px] text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Edit size={10} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            handleQuickAction("schedule", activity)
                          }
                          className="w-full flex items-center gap-1.5 px-2 py-1 text-[7px] text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Calendar size={10} />
                          <span>Follow-up</span>
                        </button>
                        <button
                          onClick={() => handleQuickAction("notes", activity)}
                          className="w-full flex items-center gap-1.5 px-2 py-1 text-[7px] text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <FileText size={10} />
                          <span>Notes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="rounded-lg p-2 mb-2" style={{ background: BG }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[8px]">
                  <div>
                    <div className="text-[8px] font-medium uppercase" style={{ color: MU }}>
                      Stage
                    </div>
                    <div className="font-medium" style={{ color: N }}>
                      {activity.stage
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-medium uppercase" style={{ color: MU }}>
                      Outcome
                    </div>
                    <div className="font-medium" style={{ color: N }}>
                      {activity.outcome}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-medium uppercase" style={{ color: MU }}>
                      Next Action
                    </div>
                    <div className="font-medium" style={{ color: N }}>
                      {activity.nextAction}
                    </div>
                  </div>
                </div>
                {activity.remarks && (
                  <div
                    className="mt-2 pt-2 border-t"
                    style={{ borderColor: BD }}
                  >
                    <div
                      className="text-[8px] uppercase mb-0.5"
                      style={{ color: MU }}
                    >
                      Remarks
                    </div>
                    <div className="text-[9px]" style={{ color: MU }}>
                      {activity.remarks}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedActivity === activity.id && (
                <div className="space-y-2 mt-2">
                  <div
                    className="rounded-lg p-2"
                    style={{ background: `${O}5`, border: `1px solid ${O}15` }}
                  >
                    <h4
                      className="text-[8px] font-semibold mb-1.5"
                      style={{ color: O }}
                    >
                      Activity Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[7px]">
                      <div>
                        <span className="font-medium" style={{ color: O }}>
                          Type:
                        </span>{" "}
                        <span style={{ color: MU }}>
                          {activity.type.replace("_", " ")}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium" style={{ color: O }}>
                          Duration:
                        </span>{" "}
                        <span style={{ color: MU }}>{activity.duration}</span>
                      </div>
                      <div>
                        <span className="font-medium" style={{ color: O }}>
                          Stage:
                        </span>{" "}
                        <span style={{ color: MU }}>
                          {activity.stage
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium" style={{ color: O }}>
                          Status:
                        </span>{" "}
                        <span style={{ color: MU }}>{activity.status}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium" style={{ color: O }}>
                          Property:
                        </span>{" "}
                        <span style={{ color: MU }}>{activity.property}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{ background: `${N}5`, border: `1px solid ${N}15` }}
                  >
                    <h4
                      className="text-[8px] font-semibold mb-1.5"
                      style={{ color: N }}
                    >
                      Activity Outcome
                    </h4>
                    <div className="space-y-1 text-[7px]">
                      <div>
                        <span className="font-medium" style={{ color: N }}>
                          Outcome:
                        </span>{" "}
                        <span style={{ color: MU }}>{activity.outcome}</span>
                      </div>
                      <div>
                        <span className="font-medium" style={{ color: N }}>
                          Next Action:
                        </span>{" "}
                        <span style={{ color: MU }}>{activity.nextAction}</span>
                      </div>
                      {activity.remarks && (
                        <div>
                          <span className="font-medium" style={{ color: N }}>
                            Remarks:
                          </span>{" "}
                          <span style={{ color: MU }}>{activity.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <button
                  onClick={() => handleQuickAction("update", activity)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[7px] font-medium text-white transition-all hover:opacity-80"
                  style={{ background: O }}
                >
                  <Edit size={10} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleQuickAction("schedule", activity)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[7px] font-medium transition-all"
                  style={{ background: `${O}10`, color: O }}
                >
                  <Calendar size={10} />
                  <span className="hidden sm:inline">Follow-up</span>
                </button>
                <button
                  onClick={() => handleQuickAction("notes", activity)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[7px] font-medium transition-all"
                  style={{ background: `${O}10`, color: O }}
                >
                  <FileText size={10} />
                  <span className="hidden sm:inline">Notes</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div
          className="rounded-lg p-6 text-center"
          style={{ background: "white", border: `1px solid ${BD}` }}
        >
          <Activity size={28} className="mx-auto mb-2" style={{ color: MU }} />
          <h3 className="text-[9px] font-semibold mb-0.5" style={{ color: N }}>
            No activities found
          </h3>
          <p className="text-[8px]" style={{ color: MU }}>
            Try adjusting your search or filter criteria
          </p>
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
    type: activity?.type || "call",
    title: activity?.title || "",
    description: activity?.description || "",
    property: activity?.property || "",
    stage: activity?.stage || "initial_contact",
    duration: activity?.duration || "30 minutes",
    outcome: activity?.outcome || "",
    nextAction: activity?.nextAction || "",
    executedBy: activity?.executedBy || "Admin User",
    remarks: activity?.remarks || "",
    priority: activity?.priority || "medium",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activityTypes = [
    { value: "call", label: "Phone Call", icon: Phone },
    { value: "meeting", label: "Meeting", icon: Users },
    { value: "email", label: "Email", icon: Mail },
    { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { value: "presentation", label: "Presentation", icon: FileText },
    { value: "follow_up", label: "Follow-up", icon: Bell },
  ];

  const stages = [
    { value: "initial_contact", label: "Initial Contact" },
    { value: "requirement_gathering", label: "Requirement Gathering" },
    { value: "property_hunting", label: "Property Hunting" },
    { value: "negotiation", label: "Negotiation" },
    { value: "documentation", label: "Documentation" },
    { value: "deal_closure", label: "Deal Closure" },
  ];

  const durations = [
    "5 minutes",
    "10 minutes",
    "15 minutes",
    "30 minutes",
    "45 minutes",
    "1 hour",
    "1.5 hours",
    "2 hours",
    "3 hours",
  ];
  const priorities = [
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
  ];

  const handleInputChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Please enter activity title");
      return;
    }
    if (!formData.outcome.trim()) {
      alert("Please enter activity outcome");
      return;
    }
    setIsSubmitting(true);
    try {
      const activityData = {
        ...formData,
        id: activity?.id || Date.now(),
        timestamp: activity?.timestamp || new Date().toISOString(),
        status: "completed",
        created_at: activity?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await onSave(activityData);
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2"
      style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ border: `1px solid ${BD}` }}
      >
        {/* Header */}
        <div
          className="px-4 py-2.5 flex items-center justify-between shrink-0"
          style={{ background: N }}
        >
          <div>
            <h2 className="text-sm font-bold text-white">
              {activity ? "Edit Activity" : "Add New Activity"}
            </h2>
            <p className="text-[8px] text-white/70">
              Record seller interaction and outcomes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Activity Type */}
          <div>
            <label
              className="block text-[9px] font-semibold uppercase mb-1"
              style={{ color: MU }}
            >
              Activity Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {activityTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange("type", type.value)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all text-[8px] ${isSelected ? "border-orange-300 bg-orange-50 text-orange-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                  >
                    <Icon size={10} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label
                className="block text-[8px] font-medium mb-0.5"
                style={{ color: MU }}
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
                placeholder="Brief title"
              />
            </div>
            <div>
              <label
                className="block text-[8px] font-medium mb-0.5"
                style={{ color: MU }}
              >
                Property
              </label>
              <input
                type="text"
                value={formData.property}
                onChange={(e) => handleInputChange("property", e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
                placeholder="Property name"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-[8px] font-medium mb-0.5"
              style={{ color: MU }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
              style={{ borderColor: BD }}
              rows={2}
              placeholder="Detailed description..."
            />
          </div>

          {/* Duration, Stage, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label
                className="block text-[8px] font-medium mb-0.5"
                style={{ color: MU }}
              >
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
              >
                {durations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-[8px] font-medium mb-0.5"
                style={{ color: MU }}
              >
                Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleInputChange("stage", e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
              >
                {stages.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-[8px] font-medium mb-0.5"
                style={{ color: MU }}
              >
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Outcome and Next Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label
                className="block text-[8px] font-medium mb-0.5"
                style={{ color: MU }}
              >
                Outcome <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.outcome}
                onChange={(e) => handleInputChange("outcome", e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
                rows={2}
                placeholder="What was achieved?"
              />
            </div>
            <div>
              <label
                className="block text-[8px] font-medium mb-0.5"
                style={{ color: MU }}
              >
                Next Action
              </label>
              <textarea
                value={formData.nextAction}
                onChange={(e) =>
                  handleInputChange("nextAction", e.target.value)
                }
                className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
                rows={2}
                placeholder="What next?"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label
              className="block text-[8px] font-medium mb-0.5"
              style={{ color: MU }}
            >
              Detailed Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              className="w-full px-2 py-1.5 border rounded-lg text-[8px] focus:outline-none focus:ring-1"
              style={{ borderColor: BD }}
              rows={2}
              placeholder="Detailed notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 border-t flex flex-wrap items-center justify-between gap-2 shrink-0"
          style={{ borderColor: BD, background: BG }}
        >
          <div className="text-[7px]" style={{ color: MU }}>
            Activity will be added to seller timeline
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-[8px] font-medium rounded-lg transition-all hover:bg-gray-50"
              style={{ border: `1px solid ${BD}`, color: N }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                isSubmitting ||
                !formData.title.trim() ||
                !formData.outcome.trim()
              }
              className="flex items-center gap-1 px-2.5 py-1 text-[8px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: O }}
            >
              <Save size={10} />
              <span>
                {isSubmitting ? "Saving..." : activity ? "Update" : "Save"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerActivityTimeline;
