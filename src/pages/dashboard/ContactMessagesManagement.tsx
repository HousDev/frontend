



// src/components/ContactMessagesManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Eye,
  Phone,
  Mail,
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Home,
  User,
  Star,
  Reply,
  MoreHorizontal,
  Send,
  Download,
  Timer,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  Building,
  Loader2,
  Filter,
  SlidersHorizontal,
  IndianRupeeIcon
} from 'lucide-react';
import { contactsAPI } from '@/lib/contactsAPI';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

// Resale Theme Colors
const RESALE = {
  navy: '#0f2b3d',
  navyLight: '#f0f4f8',
  navyDark: '#0c3854',
  orange: '#e87722',
  orangeLight: '#f39c12',
  orangeDark: '#d35400',
};

// Status Configuration
const statusConfig = {
  new: {
    color: 'bg-blue-100 text-blue-800',
    dotColor: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    label: 'New',
    icon: AlertCircle,
  },
  replied: {
    color: 'bg-emerald-100 text-emerald-800',
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    label: 'Replied',
    icon: Reply,
  },
  'in-progress': {
    color: 'bg-amber-100 text-amber-800',
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    label: 'In Progress',
    icon: Timer,
  },
  resolved: {
    color: 'bg-purple-100 text-purple-800',
    dotColor: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    label: 'Resolved',
    icon: CheckCircle,
  },
};

// Priority Configuration
const priorityConfig = {
  high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High', icon: '🔥' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium', icon: '⚡' },
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low', icon: '🌱' },
};

// Message Detail Modal Component (Center Popup)
const MessageDetailModal = ({ isOpen, onClose, message, onUpdate, onStarToggle }) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState(message);
  const modalRef = useRef(null);

  useEffect(() => {
    setLocalMessage(message);
    setReplyText('');
  }, [message]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleStarClick = async () => {
    if (onStarToggle) {
      await onStarToggle(localMessage.id);
      setLocalMessage(prev => ({ ...prev, isStarred: !prev.isStarred }));
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await contactsAPI.addReply(localMessage.id, { message: replyText.trim(), sender: 'Agent' });
      setLocalMessage(prev => ({
        ...prev,
        status: 'replied',
        replies: [...(prev.replies || []), { message: replyText.trim(), timestamp: new Date().toISOString(), sender: 'Agent' }]
      }));
      setReplyText('');
      toast.success('Reply sent successfully');
      if (onUpdate) onUpdate(localMessage.id, { status: 'replied' });
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen || !localMessage) return null;

  const StatusIcon = statusConfig[localMessage.status]?.icon || AlertCircle;
  const priority = priorityConfig[localMessage.priority] || priorityConfig.low;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,43,61,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
        style={{ border: `1px solid ${RESALE.navyLight}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — title left, star + close right */}
        <div
          className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ background: RESALE.navy, borderBottom: `1px solid ${RESALE.navyDark}` }}
        >
          {/* Left: title */}
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">Message Details</h2>
            <p className="text-[11px] text-white/60">From: {localMessage.name}</p>
          </div>

          {/* Right: star + close */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleStarClick}
              className={`p-1.5 rounded-lg transition-all ${localMessage.isStarred ? 'text-yellow-400 bg-yellow-400/20' : 'text-white/50 hover:text-yellow-400 hover:bg-white/10'}`}
              title="Favourite"
            >
              <Star size={15} fill={localMessage.isStarred ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: RESALE.navyLight }}>

          {/* Sender + Subject + Status + Property — single card */}
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100">
            {/* Top row: subject + badges */}
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-gray-900 leading-tight">{localMessage.subject}</h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[localMessage.status]?.color}`}>
                  <StatusIcon size={9} /> {statusConfig[localMessage.status]?.label}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}>
                  {priority.icon} {priority.label}
                </span>
              </div>
            </div>

            {/* Contact row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1"><User size={11} /> {localMessage.name}</span>
              <span className="flex items-center gap-1"><Mail size={11} /> {localMessage.email}</span>
              <span className="flex items-center gap-1"><Phone size={11} /> {localMessage.phone}</span>
              <span className="flex items-center gap-1"><Calendar size={11} /> {formatDateTime(localMessage.timestamp)}</span>
            </div>

            {/* Property row — only if present */}
            {(localMessage.propertyType || localMessage.budget) && (
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100 mt-1">
                {localMessage.propertyType && (
                  <div className="flex items-center gap-1.5">
                    <Building size={12} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">Type</p>
                      <p className="text-xs font-medium text-gray-700">{localMessage.propertyType}</p>
                    </div>
                  </div>
                )}
                {localMessage.budget && (
                  <div className="flex items-center gap-1.5">
                    <IndianRupeeIcon size={12} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400">Budget</p>
                      <p className="text-xs font-medium text-gray-700">{localMessage.budget}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Original Message + Conversation + Reply — single card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Original Message */}
            <div className="p-3.5 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <MessageCircle size={11} style={{ color: RESALE.orange }} /> Original Message
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{localMessage.message}</p>
            </div>

            {/* Replies — only if any */}
            {localMessage.replies && localMessage.replies.length > 0 && (
              <div className="p-3.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Reply size={11} style={{ color: RESALE.orange }} /> Conversation ({localMessage.replies.length})
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {localMessage.replies.map((reply, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${RESALE.orange}20` }}>
                        <span className="text-[10px] font-bold" style={{ color: RESALE.orange }}>A</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-orange-50 rounded-lg px-3 py-2 border" style={{ borderColor: `${RESALE.orange}25` }}>
                          <p className="text-xs text-gray-700">{reply.message}</p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(reply.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply form */}
            <div className="p-3.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Send size={11} style={{ color: RESALE.orange }} /> Send Reply
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => window.open(`tel:${localMessage.phone}`)}
                    className="px-2.5 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                  >
                    <Phone size={11} /> Call
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${localMessage.email}`)}
                    className="px-2.5 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Mail size={11} /> Email
                  </button>
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-medium text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                  style={{ background: RESALE.orange }}
                >
                  {isSubmitting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                  {isSubmitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
// Main Component
const ContactMessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [colSearch, setColSearch] = useState({
    name: "",
    contact: "",
    subject: "",
    message: "",
    propertyType: "",
    status: "",
  });

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
const [filterState, setFilterState] = useState({
  status: 'all',
  priority: 'all',
  dateFrom: '',
  dateTo: '',
  propertyType: ''
});

  const normalizeMessage = (m) => ({
    id: m.id ?? m._id ?? m.contactId,
    name: m.name ?? m.fullName ?? '—',
    email: m.email ?? '',
    phone: m.phone ?? '',
    subject: m.subject ?? 'No subject',
    message: m.message ?? '',
    propertyType: m.propertyType ?? m.property_type ?? m.type ?? '',
    budget: m.budget ?? m.price ?? '',
    status: m.status ?? 'new',
    priority: m.priority ?? 'low',
    timestamp: m.timestamp ?? m.createdAt ?? new Date().toISOString(),
    isStarred: !!(m.isStarred ?? m.is_starred ?? false),
    assignedTo: m.assignedTo ?? m.assigned_to ?? null,
    replies: Array.isArray(m.replies) ? m.replies : (m.replies ? [m.replies] : [])
  });

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactsAPI.getContacts();
      const list = Array.isArray(data) ? data : (data?.data || []);
      const normalized = list.map(normalizeMessage);
      setMessages(normalized);
      setFilteredMessages(normalized);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = messages.filter(message => {
      const s = searchTerm.trim().toLowerCase();
      const matchesSearch = !s ||
        (message.name && message.name.toLowerCase().includes(s)) ||
        (message.email && message.email.toLowerCase().includes(s)) ||
        (message.subject && message.subject.toLowerCase().includes(s)) ||
        (message.message && message.message.toLowerCase().includes(s));

      const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
      
      // Sidebar filters
      const matchesFilterStatus = filterState.status === 'all' || message.status === filterState.status;
      const matchesFilterPriority = filterState.priority === 'all' || message.priority === filterState.priority;
      const matchesPropertyType = !filterState.propertyType || (message.propertyType && message.propertyType.toLowerCase().includes(filterState.propertyType.toLowerCase()));
      
      // Date range filter
      let matchesDateRange = true;
      if (filterState.dateFrom && filterState.dateTo) {
        const msgDate = new Date(message.timestamp).getTime();
        const fromDate = new Date(filterState.dateFrom).getTime();
        const toDate = new Date(filterState.dateTo).getTime();
        matchesDateRange = msgDate >= fromDate && msgDate <= toDate;
      } else if (filterState.dateFrom) {
        matchesDateRange = new Date(message.timestamp).getTime() >= new Date(filterState.dateFrom).getTime();
      } else if (filterState.dateTo) {
        matchesDateRange = new Date(message.timestamp).getTime() <= new Date(filterState.dateTo).getTime();
      }
      
      const cs = colSearch;
      const matchesColSearch = 
        (!cs.name || (message.name?.toLowerCase().includes(cs.name.toLowerCase()))) &&
        (!cs.contact || (message.email?.toLowerCase().includes(cs.contact.toLowerCase()) || 
                         message.phone?.includes(cs.contact))) &&
        (!cs.subject || (message.subject?.toLowerCase().includes(cs.subject.toLowerCase()))) &&
        (!cs.message || (message.message?.toLowerCase().includes(cs.message.toLowerCase()))) &&
        (!cs.propertyType || (message.propertyType?.toLowerCase().includes(cs.propertyType.toLowerCase()))) &&
        (!cs.status || (message.status?.toLowerCase().includes(cs.status.toLowerCase())));

      return matchesSearch && matchesStatus && matchesFilterStatus && matchesFilterPriority && matchesPropertyType && matchesDateRange && matchesColSearch;
    });

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredMessages(filtered);
    setCurrentPage(1);
  }, [messages, searchTerm, statusFilter, colSearch, filterState]);

const indexOfLastMessage = currentPage * itemsPerPage;
const indexOfFirstMessage = indexOfLastMessage - itemsPerPage;
const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
const totalPages = Math.max(1, Math.ceil(filteredMessages.length / itemsPerPage));

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  const allOnPageSelected = currentMessages.length > 0 && currentMessages.every(m => selectedIds.includes(m.id));
  const toggleSelectAllCurrent = () => {
    if (allOnPageSelected) {
      const idsOnPage = new Set(currentMessages.map(m => m.id));
      setSelectedIds(prev => prev.filter(id => !idsOnPage.has(id)));
    } else {
      const newIds = currentMessages.map(m => m.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.info('No messages selected for deletion.');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedIds.length} message(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, delete ${selectedIds.length} message(s)!`,
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-4 py-2 bg-red-600 text-white rounded-lg mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white rounded-lg mx-1',
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    const ids = selectedIds.map(id => String(id));
    const prevMessages = [...messages];
    try {
      setMessages(prev => prev.filter(m => !ids.includes(String(m.id))));
      setSelectedIds([]);
      await Promise.all(ids.map(id => contactsAPI.deleteContact(id)));
      toast.success(`${ids.length} message(s) deleted successfully`);
    } catch (err) {
      setMessages(prevMessages);
      toast.error('Failed to delete messages');
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: newStatus.status || newStatus } : m));
    try {
      await contactsAPI.updateStatus(messageId, newStatus.status || newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
      await fetchMessages();
    }
  };

  const toggleStar = async (messageId) => {
    const target = messages.find(m => m.id === messageId);
    const newStar = !target?.isStarred;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStarred: newStar } : m));
    try {
      await contactsAPI.updateContact(messageId, { isStarred: newStar });
    } catch (err) {
      console.error('Failed to persist star toggle', err);
      await fetchMessages();
    }
  };

  const openDetailModal = async (message) => {
    try {
      const data = await contactsAPI.getContactById(message.id);
      const m = data && (data.id || data._id || data.contactId) ? data : message;
      setSelectedMessage(normalizeMessage(m));
      setShowDetailModal(true);
    } catch (err) {
      setSelectedMessage(message);
      setShowDetailModal(true);
    }
  };

  const exportData = () => {
    const rows = selectedIds.length ? messages.filter(m => selectedIds.includes(m.id)) : filteredMessages;
    if (!rows.length) {
      toast.info('No messages to export');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Property Type', 'Budget', 'Status', 'Priority', 'Date', 'Replies'];
    const csvLines = [headers.join(',')];

    rows.forEach(m => {
      csvLines.push([
        `"${m.id}"`,
        `"${m.name}"`,
        `"${m.email}"`,
        `"${m.phone}"`,
        `"${m.subject.replace(/"/g, '""')}"`,
        `"${m.message?.replace(/"/g, '""') || ''}"`,
        `"${m.propertyType || ''}"`,
        `"${m.budget || ''}"`,
        `"${m.status}"`,
        `"${m.priority}"`,
        `"${new Date(m.timestamp).toLocaleString()}"`,
        m.replies?.length || 0
      ].join(','));
    });

    const blob = new Blob(["\uFEFF" + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} messages`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setColSearch({ name: "", contact: "", subject: "", message: "", propertyType: "", status: "" });
    setSelectedIds([]);
  };
  const resetSidebarFilters = () => {
  setFilterState({
    status: 'all',
    priority: 'all',
    dateFrom: '',
    dateTo: '',
    propertyType: ''
  });
};

 const formatDate = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  
  // Check if dates are valid before arithmetic
  if (isNaN(d.getTime()) || isNaN(now.getTime())) {
    return 'Invalid date';
  }
  
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return `Today ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

  const statusCounts = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    replied: messages.filter(m => m.status === 'replied').length,
    'in-progress': messages.filter(m => m.status === 'in-progress').length,
    resolved: messages.filter(m => m.status === 'resolved').length,
  };

  // Filter Sidebar Component (add this before the main return)
const FilterSidebar = ({ isOpen, onClose, filters, setFilters, onReset }) => {
  if (!isOpen) return null;

  const N = "#0f2b3d";
  const O = "#e67e22";
  const BD = "#e2e8f0";

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 500,
    color: N,
    marginBottom: 4,
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "5px 8px",
    border: `1px solid ${BD}`,
    borderRadius: 6,
    fontSize: 11,
    color: N,
    background: "#fff",
    cursor: "pointer",
    outline: "none",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "5px 8px",
    border: `1px solid ${BD}`,
    borderRadius: 6,
    fontSize: 11,
    color: N,
    background: "#fff",
    outline: "none",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Responsive width style */}
      <style>{`
        .filter-sidebar-panel {
          width: 280px;
        }
        @media (min-width: 640px) {
          .filter-sidebar-panel {
            width: 400px;
          }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{ background: "rgba(15,43,61,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="filter-sidebar-panel absolute right-0 top-0 h-full flex flex-col"
        style={{
          background: "#f8fafc",
          boxShadow: "-4px 0 32px rgba(15,43,61,0.18)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: N, borderBottom: `1px solid ${BD}` }}
        >
          <div className="flex items-center gap-2">
            <Filter size={15} color={O} />
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                letterSpacing: "0.02em",
                margin: 0,
              }}
            >
              Filter Messages
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={selectStyle}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="replied">Replied</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label style={labelStyle}>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              style={selectStyle}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Date From</label>
              <div style={{ position: "relative" }}>
                <Calendar
                  size={11}
                  color={O}
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: 24 }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Date To</label>
              <div style={{ position: "relative" }}>
                <Calendar
                  size={11}
                  color={O}
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: 24 }}
                />
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label style={labelStyle}>Property Type</label>
            <input
              type="text"
              placeholder="Search property type..."
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${BD}`, background: "#f8fafc" }}
        >
          <button
            onClick={onReset}
            style={{
              flex: 1,
              padding: "7px",
              fontSize: 11,
              fontWeight: 500,
              border: `1px solid ${O}`,
              borderRadius: 6,
              background: "#fff",
              color: O,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "7px",
              fontSize: 11,
              fontWeight: 500,
              background: N,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: RESALE.navyLight }}>
        <div className="text-center bg-white p-6 rounded-xl shadow-lg">
          <RefreshCw className="animate-spin mx-auto" size={40} style={{ color: RESALE.orange }} />
          <p className="mt-3 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: RESALE.navyLight }}>
        <div className="text-center bg-white p-6 rounded-xl shadow-lg">
          <XCircle size={40} className="text-red-500 mx-auto" />
          <p className="mt-3 text-red-600">{error}</p>
          <button onClick={fetchMessages} className="mt-4 px-4 py-2 text-white rounded-lg" style={{ background: RESALE.orange }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <>
     <style>
        {`
          .scrollbar-custom {
            scrollbar-width: thin;
            scrollbar-color: #e67e22 #e5e7eb;
          }
          .scrollbar-custom::-webkit-scrollbar {
            height: 4px;
          }
          .scrollbar-custom::-webkit-scrollbar-track {
            background: #e5e7eb;
            border-radius: 10px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb {
            background: #e67e22;
            border-radius: 10px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: #d35400;
          }
          .scrollbar-custom-vertical {
            scrollbar-width: thin;
            scrollbar-color: #e67e22 #e5e7eb;
          }
          .scrollbar-custom-vertical::-webkit-scrollbar {
            width: 4px;
          }
          .scrollbar-custom-vertical::-webkit-scrollbar-track {
            background: #e5e7eb;
            border-radius: 10px;
          }
          .scrollbar-custom-vertical::-webkit-scrollbar-thumb {
            background: #e67e22;
            border-radius: 10px;
          }
          .scrollbar-custom-vertical::-webkit-scrollbar-thumb:hover {
            background: #d35400;
          }
              /* ✅ Column divider lines */
  table tbody td {
    border-right: 1px solid rgba(209, 213, 219, 0.5);
  }
  table tbody td:last-child {
    border-right: none;
  }
  table thead th {
    border-right: 1px solid rgba(209, 213, 219, 0.4);
  }
  table thead th:last-child {
    border-right: none;
  }

        `}
      </style>
    <div style={{ backgroundColor: RESALE.navyLight }}>
      <div className="px-3 sm:px-2 md:px-2 py-2 sm:py-2">
        
        

        {/* Stats Cards */}
       <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-2 sm:mb-2 sticky top-0 z-10">
  
  {/* Total */}
  <div className="bg-white rounded-lg sm:rounded-xl px-3 py-2 sm:p-3 border border-gray-200 shadow-sm">
    <p className="text-[11px] sm:text-xs text-gray-500 leading-none mb-1">
      Total
    </p>
    <p className="text-lg sm:text-xl font-bold text-gray-900 leading-none">
      {statusCounts.total}
    </p>
  </div>

  {Object.entries(statusConfig).map(([status, config]) => (
    <div
      key={status}
      className="bg-white rounded-lg sm:rounded-xl px-3 py-2 sm:p-3 border border-gray-200 shadow-sm"
    >
      <p className="text-[11px] sm:text-xs text-gray-500 leading-none mb-1 truncate">
        {config.label}
      </p>

      <p
        className="text-lg sm:text-xl font-bold leading-none"
        style={{
          color:
            status === 'new'
              ? '#2563eb'
              : status === 'replied'
              ? '#059669'
              : status === 'in-progress'
              ? '#d97706'
              : '#7c3aed',
        }}
      >
        {statusCounts[status]}
      </p>
    </div>
  ))}
</div>

      

    {/* Tabs + Actions */}
<div className="flex flex-col gap-2 mb-2">

  {/* ───────── DESKTOP VIEW ───────── */}
  <div className="hidden sm:flex items-center gap-2">

    {/* Tabs */}
    <div className="flex items-center gap-1 overflow-x-auto flex-1 pb-1 scrollbar-hide">

      {/* All */}
      <button
        onClick={() => setStatusFilter('all')}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
          statusFilter === 'all'
            ? 'bg-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        style={statusFilter === 'all' ? { color: RESALE.orange } : {}}
      >
        All ({statusCounts.total})
      </button>

      {/* Status Tabs */}
      {Object.entries(statusConfig).map(([status, config]) => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            statusFilter === status
              ? 'bg-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={statusFilter === status ? { color: RESALE.orange } : {}}
        >
          {config.label} ({statusCounts[status]})
        </button>
      ))}
    </div>

    {/* Desktop Selected Bar */}
    {selectedIds.length > 0 && (
      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
        
        <span
          className="text-[11px] font-semibold whitespace-nowrap"
          style={{ color: RESALE.orange }}
        >
          Selected: {selectedIds.length}
        </span>

        <button
          onClick={handleBulkDelete}
          className="px-2 py-1 text-[11px] bg-red-600 text-white rounded-md hover:bg-red-700 whitespace-nowrap"
        >
          Delete
        </button>

        <button
          onClick={() => setSelectedIds([])}
          className="px-2 py-1 text-[11px] border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 whitespace-nowrap"
        >
          Clear
        </button>
      </div>
    )}

    {/* Desktop Actions */}
    <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">

      {/* Filter */}
      <button
        onClick={() => setShowFilterSidebar(true)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
      >
        <SlidersHorizontal size={13} />
        <span>Filter</span>
      </button>

      {/* Export */}
      <button
        onClick={exportData}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
      >
        <Download size={13} />
        <span>Export</span>
      </button>

      {/* Refresh */}
      <button
        onClick={fetchMessages}
        className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  </div>

  {/* ───────── MOBILE VIEW ───────── */}

  {/* Row 1 → Tabs only */}
  <div className="flex sm:hidden items-center overflow-x-auto gap-1 pb-1 scrollbar-hide">

    {/* All */}
    <button
      onClick={() => setStatusFilter('all')}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
        statusFilter === 'all'
          ? 'bg-white shadow-sm'
          : 'text-gray-600'
      }`}
      style={statusFilter === 'all' ? { color: RESALE.orange } : {}}
    >
      All ({statusCounts.total})
    </button>

    {/* Status Tabs */}
    {Object.entries(statusConfig).map(([status, config]) => (
      <button
        key={status}
        onClick={() => setStatusFilter(status)}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
          statusFilter === status
            ? 'bg-white shadow-sm'
            : 'text-gray-600'
        }`}
        style={statusFilter === status ? { color: RESALE.orange } : {}}
      >
        {config.label} ({statusCounts[status]})
      </button>
    ))}
  </div>

  {/* Row 2 → Selected + Actions */}
  <div className="flex sm:hidden items-center justify-between gap-2">

    {/* Left Side */}
    <div className="flex items-center gap-1.5">

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">

          {/* Selected Count */}
          <span
            className="text-[11px] font-semibold whitespace-nowrap"
            style={{ color: RESALE.orange }}
          >
            Sele: {selectedIds.length}
          </span>

          {/* Delete */}
          <button
            onClick={handleBulkDelete}
            className="px-2 py-1 text-[11px] bg-red-600 text-white rounded-md whitespace-nowrap"
          >
            Delete
          </button>

          {/* Clear */}
          <button
            onClick={() => setSelectedIds([])}
            className="px-2 py-1 text-[11px] border border-gray-300 text-gray-600 rounded-md whitespace-nowrap"
          >
            Clear
          </button>
        </div>
      )}
    </div>

    {/* Right Side */}
    <div className="flex items-center gap-1.5 ml-auto">

      {/* Filter */}
      <button
        onClick={() => setShowFilterSidebar(true)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg whitespace-nowrap"
      >
        <SlidersHorizontal size={13} />
        <span>Filter</span>
      </button>

      {/* Export */}
      <button
        onClick={exportData}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg whitespace-nowrap"
      >
        <Download size={13} />
        <span>Export</span>
      </button>

      {/* Refresh */}
      <button
        onClick={fetchMessages}
        className="p-1.5 bg-white border border-gray-200 rounded-lg"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  </div>
</div>

        {/* Main Table - Horizontal Scroll on Mobile */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-300 overflow-hidden h-full">
  
  {/* OUTER: controls max-height + vertical scroll - DYNAMIC HEIGHT */}
  <div
    className="scrollbar-custom-vertical"
    style={{
      overflowY: 'auto',
      overflowX: 'auto',
      maxHeight: window.innerWidth < 640
        ? selectedIds.length > 0 ? 'calc(100vh - 390px)' : 'calc(100vh - 390px)'
        : selectedIds.length > 0 ? 'calc(100vh - 240px)' : 'calc(100vh - 240px)',
    }}
  >
    <table
      className="w-full"
      style={{ minWidth: '1000px', borderCollapse: 'separate', borderSpacing: 0 }}
    >
      {/* THEAD: sticky so it never scrolls away */}
      <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
        
        {/* ROW 1: Column Headers */}
        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
          <th className="w-6 px-2 py-1.5 text-center bg-gray-50">
            <input
              type="checkbox"
              checked={allOnPageSelected && currentMessages.length > 0}
              onChange={toggleSelectAllCurrent}
              className="rounded border-gray-300 focus:ring-orange-500 w-3 h-3"
            />
          </th>
          <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">FROM</th>
          <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">CONTACT</th>
          <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">SUBJECT</th>
          <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">MESSAGE</th>
          <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">PROPERTY</th>
          <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">STATUS</th>
          <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">DATE</th>
          <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">ACTIONS</th>
        </tr>

        {/* ROW 2: Column Search */}
        <tr className="bg-gray-100">
          <th className="px-2 py-0.5 bg-gray-100" />
          <th className="px-1.5 py-0.5 bg-gray-100">
            <input
              type="text"
              placeholder="Search name..."
              value={colSearch.name}
              onChange={e => setColSearch(p => ({ ...p, name: e.target.value }))}
              className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
            />
          </th>
          <th className="px-1.5 py-0.5 bg-gray-100">
            <input
              type="text"
              placeholder="Search email/phone..."
              value={colSearch.contact}
              onChange={e => setColSearch(p => ({ ...p, contact: e.target.value }))}
              className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
            />
          </th>
          <th className="px-1.5 py-0.5 bg-gray-100">
            <input
              type="text"
              placeholder="Search subject..."
              value={colSearch.subject}
              onChange={e => setColSearch(p => ({ ...p, subject: e.target.value }))}
              className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
            />
          </th>
          <th className="px-1.5 py-0.5 bg-gray-100">
            <input
              type="text"
              placeholder="Search message..."
              value={colSearch.message}
              onChange={e => setColSearch(p => ({ ...p, message: e.target.value }))}
              className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
            />
          </th>
          <th className="px-1.5 py-0.5 bg-gray-100">
            <input
              type="text"
              placeholder="Search property..."
              value={colSearch.propertyType}
              onChange={e => setColSearch(p => ({ ...p, propertyType: e.target.value }))}
              className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
            />
          </th>
          <th className="px-1.5 py-0.5 bg-gray-100">
            <input
              type="text"
              placeholder="Search status..."
              value={colSearch.status}
              onChange={e => setColSearch(p => ({ ...p, status: e.target.value }))}
              className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
            />
          </th>
          <th className="px-1.5 py-0.5 bg-gray-100" />
          <th className="px-1.5 py-0.5 bg-gray-100" />
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-100">
        {currentMessages.map((message) => {
          const priority = priorityConfig[message.priority] || priorityConfig.low;
          const status = statusConfig[message.status] || statusConfig.new;
          const StatusIcon = status.icon;

          return (
            <tr key={message.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDetailModal(message)}>

              {/* Checkbox */}
              <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(message.id)}
                  onChange={() => toggleSelect(message.id)}
                  className="rounded border-gray-300 focus:ring-orange-500 w-3 h-3"
                />
               </td>

              {/* FROM */}
              <td className="px-2 py-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-medium flex-shrink-0 shadow-sm" style={{ backgroundColor: RESALE.orange }}>
                    {message.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-[11px] truncate max-w-[80px]">{message.name}</div>
                    {message.isStarred && <Star size={8} className="text-yellow-500" fill="currentColor" />}
                  </div>
                </div>
              </td>

              {/* CONTACT */}
              <td className="px-2 py-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Mail size={9} className="text-gray-400 flex-shrink-0" />
                    <span className="text-[9px] text-gray-600 truncate max-w-[100px]">{message.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={9} className="text-gray-400 flex-shrink-0" />
                    <span className="text-[9px] text-gray-600 truncate max-w-[100px]">{message.phone}</span>
                  </div>
                </div>
              </td>

              {/* SUBJECT */}
              <td className="px-2 py-2">
                <div className="text-[10px] font-medium text-gray-800 truncate max-w-[120px]">{message.subject}</div>
              </td>

              {/* MESSAGE */}
              <td className="px-2 py-2">
                <div className="text-[9px] text-gray-600 line-clamp-2">{message.message}</div>
                {message.replies?.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5 text-[8px] text-gray-400">
                    <MessageSquare size={8} /><span>{message.replies.length} replies</span>
                  </div>
                )}
              </td>

              {/* PROPERTY */}
              <td className="px-2 py-2">
                <div className="space-y-0.5">
                  <div className="text-[9px]"><span className="text-gray-500">Type:</span> <span className="font-medium">{message.propertyType || '—'}</span></div>
                  <div className="text-[9px]"><span className="text-gray-500">Budget:</span> <span className="text-green-600">{message.budget || '—'}</span></div>
                </div>
              </td>

              {/* STATUS & PRIORITY */}
              <td className="px-2 py-2">
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${status.color}`}>
                    <StatusIcon size={8} /> {status.label}
                  </span>
                  <span className={`inline-flex items-center gap-0.9 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${priority.bg} ${priority.text} block`}>
                    {priority.label}
                  </span>
                </div>
              </td>

              {/* DATE */}
              <td className="px-2 py-2">
                <div className="text-[9px] text-gray-500 whitespace-nowrap">{formatDate(message.timestamp)}</div>
              </td>

              {/* ACTIONS */}
              <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 flex-nowrap">
                  <select
                    value={message.status}
                    onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="px-1 py-0.5 text-[9px] border rounded focus:ring-1 focus:ring-orange-500 bg-white"
                    style={{ borderColor: '#e2e8f0' }}
                  >
                    <option value="new">New</option>
                    <option value="replied">Replied</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <button onClick={() => openDetailModal(message)} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="View">
                    <Eye size={11} />
                  </button>

                  <button onClick={() => window.open(`tel:${message.phone}`)} className="p-1 text-green-600 hover:bg-green-100 rounded" title="Call">
                    <Phone size={11} />
                  </button>

                  <button onClick={() => window.open(`mailto:${message.email}`)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Email">
                    <Mail size={11} />
                  </button>

                  <button onClick={() => toggleStar(message.id)} className={`p-1 rounded ${message.isStarred ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}>
                    <Star size={11} fill={message.isStarred ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}

        {currentMessages.length === 0 && (
          <tr>
            <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
              No messages found. Try adjusting your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  {filteredMessages.length > 0 && (
    <div className="px-2 sm:px-3 py-2 border-t border-gray-100 bg-white">
      
      {/* MOBILE */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="text-[10px] text-gray-500 text-center">
          Showing {indexOfFirstMessage + 1}–{Math.min(indexOfLastMessage, filteredMessages.length)} of {filteredMessages.length}
        </div>
        <div className="flex items-center justify-between gap-2">
          {selectedIds.length === 0 && (
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
              className="min-w-[90px] px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white"
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
          )}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex justify-end min-w-max">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-gray-300 disabled:opacity-50">
                  <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`px-2 py-1 rounded text-xs ${currentPage === page ? "bg-orange-500 text-white" : "border border-gray-300"}`}>
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-1 text-xs">...</span>}
                  {totalPages > 5 && (
                    <button onClick={() => setCurrentPage(totalPages)} className="px-2 py-1 rounded text-xs border border-gray-300">
                      {totalPages}
                    </button>
                  )}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded border border-gray-300 disabled:opacity-50">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-gray-500 whitespace-nowrap">
            Showing {indexOfFirstMessage + 1}–{Math.min(indexOfLastMessage, filteredMessages.length)} of {filteredMessages.length}
          </div>
          {selectedIds.length === 0 && (
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
              className="px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white"
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-gray-300 disabled:opacity-50">
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button key={page} onClick={() => setCurrentPage(page)} className={`px-2 py-1 rounded text-xs ${currentPage === page ? "bg-orange-500 text-white" : "border border-gray-300"}`}>
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-1 text-xs">...</span>}
            {totalPages > 5 && (
              <button onClick={() => setCurrentPage(totalPages)} className="px-2 py-1 rounded text-xs border border-gray-300">
                {totalPages}
              </button>
            )}
          </div>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded border border-gray-300 disabled:opacity-50">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )}
</div>
      </div>

{/* Filter Sidebar */}
<FilterSidebar
  isOpen={showFilterSidebar}
  onClose={() => setShowFilterSidebar(false)}
  filters={filterState}
  setFilters={setFilterState}
  onReset={resetSidebarFilters}
/>
      {/* Message Detail Modal - Center Popup */}
      <MessageDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        message={selectedMessage}
        onUpdate={updateMessageStatus}
        onStarToggle={toggleStar}
      />
    </div>
    </>
  );
};

export default ContactMessagesManagement;