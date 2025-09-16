// src/components/ContactMessagesManagement.jsx
import React, { useState, useEffect } from 'react';
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
    IndianRupee,
    Home,
    User,
    Star,
    Reply,
    MoreHorizontal,
    Send,
    ArrowLeft,
    Download,
    Timer,
    MessageSquare
} from 'lucide-react';
import { contactsAPI } from '@/lib/contactsAPI'; // adjust path if needed

const ContactMessagesManagement = () => {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // array of ids currently being updated (status/reply/star)
    const [updatingIds, setUpdatingIds] = useState([]);

    const messagesPerPage = 10;

    // helper: add/remove id to updatingIds
    const addUpdating = (id) => setUpdatingIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    const removeUpdating = (id) => setUpdatingIds(prev => prev.filter(x => x !== id));
    const isUpdating = (id) => updatingIds.includes(id);

    // small normalizer to keep state shape consistent
    const normalizeMessage = (m) => ({
        id: m.id ?? m._id ?? m.contactId,
        name: m.name ?? m.fullName ?? '—',
        email: m.email ?? '',
        phone: m.phone ?? '',
        subject: m.subject ?? 'No subject',
        message: m.message ?? '',
        // propertyType: m.propertyType ?? m.type ?? '',
        propertyType: m.propertyType ?? m.property_type ?? m.type ?? '',
        budget: m.budget ?? m.price ?? '',
        status: m.status ?? 'new',
        priority: m.priority ?? 'low',
        timestamp: m.timestamp ?? m.createdAt ?? new Date().toISOString(),
        isStarred: !!(m.isStarred ?? m.is_starred ?? false),
        assignedTo: m.assignedTo ?? m.assigned_to ?? null,
        replies: Array.isArray(m.replies) ? m.replies : (m.replies ? [m.replies] : [])
    });

    // Fetch contacts from API
    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await contactsAPI.getContacts();
            const list = Array.isArray(data) ? data : (data?.data || []);
            const normalized = list.map(normalizeMessage);
            setMessages(normalized);
            setFilteredMessages(normalized);
        } catch (err) {
            console.error("Failed to fetch contacts", err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter messages whenever search / status / messages change
    useEffect(() => {
        let filtered = messages.filter(message => {
            const s = searchTerm.trim().toLowerCase();
            const matchesSearch =
                !s ||
                (message.name && message.name.toLowerCase().includes(s)) ||
                (message.email && message.email.toLowerCase().includes(s)) ||
                (message.subject && message.subject.toLowerCase().includes(s)) ||
                (message.message && message.message.toLowerCase().includes(s));

            const matchesStatus = statusFilter === 'all' || message.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setFilteredMessages(filtered);
        setCurrentPage(1);
    }, [messages, searchTerm, statusFilter]);

    // Pagination logic
    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
    const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
    const totalPages = Math.max(1, Math.ceil(filteredMessages.length / messagesPerPage));

    // Status config (counts derived from messages state)
    const statusCounts = {
        new: messages.filter(m => m.status === 'new').length,
        replied: messages.filter(m => m.status === 'replied').length,
        'in-progress': messages.filter(m => m.status === 'in-progress').length,
        resolved: messages.filter(m => m.status === 'resolved').length
    };

    // Enhanced status configuration with better colors and icons
    const statusConfig = {
        new: {
            color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 shadow-sm',
            dotColor: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-l-blue-500',
            label: 'New',
            count: statusCounts.new,
            icon: AlertCircle,
            description: 'Awaiting review'
        },
        replied: {
            color: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm',
            dotColor: 'bg-emerald-500',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-l-emerald-500',
            label: 'Replied',
            count: statusCounts.replied,
            icon: Reply,
            description: 'Response sent'
        },
        'in-progress': {
            color: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200 shadow-sm',
            dotColor: 'bg-amber-500',
            bgColor: 'bg-amber-50',
            borderColor: 'border-l-amber-500',
            label: 'In Progress',
            count: statusCounts['in-progress'],
            icon: Timer,
            description: 'Being processed'
        },
        resolved: {
            color: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200 shadow-sm',
            dotColor: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            borderColor: 'border-l-purple-500',
            label: 'Resolved',
            count: statusCounts.resolved,
            icon: CheckCircle,
            description: 'Successfully closed'
        }
    };

    const priorityColors = {
        high: 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-sm',
        medium: 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-sm',
        low: 'border-l-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-sm'
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    };

    // Generic optimistic patch + fallback refetch (still useful for non-status updates)
    const patchAndSetMessage = async (messageId, patch) => {
        // optimistic UI update
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, ...patch } : m));
        try {
            await contactsAPI.updateContact(messageId, patch);
        } catch (err) {
            console.error('Failed to persist contact update', err);
            await fetchMessages();
        }
    };

    // NEW: update status using dedicated API (contactsAPI.updateStatus)
    const updateMessageStatus = async (messageId, newStatus) => {
        // optimistic update locally
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: newStatus } : m));
        if (selectedMessage && selectedMessage.id === messageId) {
            setSelectedMessage(prev => ({ ...prev, status: newStatus }));
        }

        addUpdating(messageId);
        try {
            const resp = await contactsAPI.updateStatus(messageId, newStatus);
            // if backend returns updated object, sync to it
            if (resp && (resp.id || resp._id || resp.contactId)) {
                const updated = normalizeMessage(resp);
                setMessages(prev => prev.map(m => m.id === messageId ? updated : m));
                if (selectedMessage && selectedMessage.id === messageId) {
                    setSelectedMessage(updated);
                }
            }
        } catch (err) {
            console.error('Failed to update status', err);
            // revert by re-fetching authoritative data
            await fetchMessages();
        } finally {
            removeUpdating(messageId);
        }
    };

    // Toggle star: use generic updateContact (fallback ok)
    const toggleStar = async (messageId) => {
        const target = messages.find(m => m.id === messageId);
        const newStar = !target?.isStarred;
        // optimistic
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStarred: newStar } : m));
        if (selectedMessage && selectedMessage.id === messageId) {
            setSelectedMessage(prev => ({ ...prev, isStarred: newStar }));
        }

        addUpdating(messageId);
        try {
            // backend field name may be is_starred or isStarred; updateContact will attempt PUT/PATCH
            await contactsAPI.updateContact(messageId, { isStarred: newStar });
        } catch (err) {
            console.error('Failed to persist star toggle', err);
            await fetchMessages();
        } finally {
            removeUpdating(messageId);
        }
    };

    // NEW: add reply using dedicated API contactsAPI.addReply (fallback to updateContact if necessary)
    const handleReply = async () => {
        if (!replyText.trim() || !selectedMessage) return;

        const newReply = {
            id: Date.now(),
            message: replyText.trim(),
            timestamp: new Date().toISOString(),
            sender: 'Agent'
        };

        // optimistic update locally
        setMessages(prev => prev.map(m => m.id === selectedMessage.id ? {
            ...m,
            status: 'replied',
            replies: [...(m.replies || []), newReply]
        } : m));
        setSelectedMessage(prev => prev ? ({ ...prev, status: 'replied', replies: [...(prev.replies || []), newReply] }) : prev);
        setReplyText('');

        addUpdating(selectedMessage.id);
        try {
            // Preferred: use addReply endpoint (returns updated contact)
            const resp = await contactsAPI.addReply(selectedMessage.id, { message: newReply.message, sender: newReply.sender });
            if (resp && (resp.id || resp._id || resp.contactId)) {
                const updated = normalizeMessage(resp);
                setMessages(prev => prev.map(m => m.id === selectedMessage.id ? updated : m));
                setSelectedMessage(updated);
            } else {
                // fallback: some APIs return minimal ack, so attempt to PATCH replies array explicitly
                try {
                    await contactsAPI.updateContact(selectedMessage.id, {
                        replies: [...(selectedMessage.replies || []), newReply],
                        status: 'replied'
                    });
                } catch (e) {
                    // ignore here, will be handled by outer catch
                }
            }
        } catch (err) {
            console.error('Failed to persist reply', err);
            // fallback: re-fetch authoritative state
            await fetchMessages();
            // if detail open, re-open selected from fresh list
            const fresh = messages.find(m => m.id === selectedMessage.id);
            if (fresh) setSelectedMessage(fresh);
        } finally {
            removeUpdating(selectedMessage.id);
        }
    };

    const assignAgent = async (messageId, agentName) => {
        patchAndSetMessage(messageId, { assignedTo: agentName });
        if (selectedMessage && selectedMessage.id === messageId) {
            setSelectedMessage(prev => ({ ...prev, assignedTo: agentName }));
        }
    };

    // Detail view open fetch fresh single message (optional)
    const openDetail = async (message) => {
        try {
            const data = await contactsAPI.getContactById(message.id);
            const m = data && (data.id || data._id || data.contactId) ? data : message;
            setSelectedMessage(normalizeMessage(m));
            setShowDetail(true);
        } catch (err) {
            console.warn('Could not fetch single contact, opening cached version', err);
            setSelectedMessage(message);
            setShowDetail(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <RefreshCw className="animate-spin mx-auto text-blue-500" size={48} />
                    <p className="mt-4 text-gray-700 font-medium">Loading messages...</p>
                    <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <XCircle size={48} className="text-red-500 mx-auto" />
                    <p className="mt-4 text-red-700 font-medium">{error}</p>
                    <p className="text-sm text-gray-500 mt-1">Something went wrong while loading your messages</p>
                    <button
                        onClick={fetchMessages}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Detail view
    if (showDetail && selectedMessage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Detail Header */}
                <div className="bg-white shadow-lg border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Message Details</h1>
                                    <p className="text-sm text-gray-500">From: {selectedMessage.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => toggleStar(selectedMessage.id)}
                                    disabled={isUpdating(selectedMessage.id)}
                                    className={`p-2 rounded-xl transition-all duration-200 ${selectedMessage.isStarred
                                        ? 'text-yellow-500 bg-yellow-50 border border-yellow-200'
                                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 border border-gray-200'
                                        }`}
                                >
                                    <Star size={20} fill={selectedMessage.isStarred ? 'currentColor' : 'none'} />
                                </button>
                                <select
                                    value={selectedMessage.status}
                                    onChange={(e) => updateMessageStatus(selectedMessage.id, e.target.value)}
                                    disabled={isUpdating(selectedMessage.id)}
                                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white shadow-sm"
                                >
                                    <option value="new">New</option>
                                    <option value="replied">Replied</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Message Header */}
                        <div className={`p-6 border-b ${statusConfig[selectedMessage.status]?.bgColor || 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedMessage.subject}</h2>
                                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <User size={16} />
                                            <span className="font-medium">{selectedMessage.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Mail size={16} />
                                            <span>{selectedMessage.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Phone size={16} />
                                            <span>{selectedMessage.phone}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock size={16} />
                                            <span>{formatDate(selectedMessage.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`px-4 py-2 rounded-xl text-sm font-medium ${statusConfig[selectedMessage.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${statusConfig[selectedMessage.status]?.dotColor || 'bg-gray-400'}`}></div>
                                            <span>{statusConfig[selectedMessage.status]?.label || selectedMessage.status}</span>
                                        </div>
                                    </span>
                                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${selectedMessage.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                                            selectedMessage.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                'bg-green-100 text-green-800 border border-green-200'
                                        }`}>
                                        {selectedMessage.priority} priority
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Requirements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Home className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Property Type</p>
                                        <p className="font-semibold text-gray-900">{selectedMessage.propertyType || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <IndianRupee className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Budget</p>
                                        <p className="font-semibold text-gray-900">{selectedMessage.budget || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <User className="text-purple-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Assigned To</p>
                                        <p className="font-semibold text-gray-900">{selectedMessage.assignedTo || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Original Message */}
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Message</h3>
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                                <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
                            </div>
                        </div>

                        {/* Replies */}
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversation</h3>

                            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                                <div className="space-y-6 mb-8">
                                    {selectedMessage.replies.map((reply, index) => (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white text-sm font-semibold">A</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                                    <p className="text-gray-900">{reply.message}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 font-medium">{formatDate(reply.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Form */}
                            <div className="border-t pt-6">
                                <div className="flex space-x-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white text-sm font-semibold">You</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply here..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                                            rows={4}
                                            disabled={isUpdating(selectedMessage.id)}
                                        />
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => window.open(`tel:${selectedMessage.phone}`)}
                                                    className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-xl transition-all duration-200 border border-green-200"
                                                >
                                                    <Phone size={16} />
                                                    <span>Call</span>
                                                </button>
                                                <button
                                                    onClick={() => window.open(`mailto:${selectedMessage.email}`)}
                                                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-blue-200"
                                                >
                                                    <Mail size={16} />
                                                    <span>Email</span>
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleReply}
                                                disabled={!replyText.trim() || isUpdating(selectedMessage.id)}
                                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
                                            >
                                                <Send size={16} />
                                                <span>{isUpdating(selectedMessage.id) ? 'Sending...' : 'Send Reply'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                <MessageCircle className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
                                <p className="text-sm text-gray-500">Manage all contact form submissions</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={fetchMessages}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            >
                                <RefreshCw size={20} />
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200">
                                <Download size={18} />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 lg:grid-cols-5">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Messages</p>
                                <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
                                <p className="text-xs text-gray-500 mt-1">All inquiries</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                                <MessageCircle className="text-white" size={28} />
                            </div>
                        </div>
                    </div>

                    {Object.entries(statusConfig).map(([status, config]) => {
                        const IconComponent = config.icon;
                        return (
                            <div key={status} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">{config.label}</p>
                                        <p className="text-3xl font-bold text-gray-900">{config.count}</p>
                                        <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${config.bgColor} border ${config.color.includes('border-blue') ? 'border-blue-200' : config.color.includes('border-emerald') ? 'border-emerald-200' : config.color.includes('border-amber') ? 'border-amber-200' : 'border-purple-200'}`}>
                                        <IconComponent size={28} className={config.color.includes('text-blue') ? 'text-blue-600' : config.color.includes('text-emerald') ? 'text-emerald-600' : config.color.includes('text-amber') ? 'text-amber-600' : 'text-purple-600'} />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${config.dotColor}`}
                                            style={{ width: `${messages.length > 0 ? (config.count / messages.length) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex-1 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm font-medium"
                            >
                                <option value="all">All Status</option>
                                <option value="new">New Messages</option>
                                <option value="replied">Replied</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="divide-y divide-gray-200">
                        {currentMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 ${priorityColors[message.priority] || 'border-l-gray-300 bg-white'}`}
                                onClick={() => openDetail(message)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">{message.name}</h3>
                                            <span className={`px-3 py-1 rounded-xl text-xs font-medium ${statusConfig[message.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                                <div className="flex items-center space-x-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[message.status]?.dotColor || 'bg-gray-400'}`}></div>
                                                    <span>{statusConfig[message.status]?.label || message.status}</span>
                                                </div>
                                            </span>
                                            {message.isStarred && (
                                                <Star size={16} className="text-yellow-500" fill="currentColor" />
                                            )}
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${message.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                    message.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                        'bg-green-100 text-green-700 border border-green-200'
                                                }`}>
                                                {message.priority}
                                            </span>
                                        </div>

                                        <h4 className="text-base font-medium text-gray-800 mb-3 truncate">{message.subject}</h4>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{message.message}</p>

                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <Mail size={14} />
                                                <span>{message.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Phone size={14} />
                                                <span>{message.phone}</span>
                                            </div>
                                            {message.propertyType && (
                                                <div className="flex items-center space-x-2">
                                                    <Home size={14} />
                                                    <span>{message.propertyType}</span>
                                                </div>
                                            )}
                                            {message.assignedTo && (
                                                <div className="flex items-center space-x-2">
                                                    <User size={14} />
                                                    <span>Assigned to {message.assignedTo}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-3 ml-6">
                                        <span className="text-sm text-gray-500 font-medium">{formatDate(message.timestamp)}</span>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`tel:${message.phone}`);
                                                }}
                                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200 border border-green-200"
                                            >
                                                <Phone size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`mailto:${message.email}`);
                                                }}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-200 border border-blue-200"
                                            >
                                                <Mail size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleStar(message.id);
                                                }}
                                                className={`p-2 rounded-xl transition-all duration-200 border ${message.isStarred
                                                    ? 'text-yellow-500 bg-yellow-100 border-yellow-200'
                                                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 border-gray-200'
                                                    }`}
                                            >
                                                <Star size={16} fill={message.isStarred ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                        {message.replies && message.replies.length > 0 && (
                                            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                <MessageSquare size={12} />
                                                <span>{message.replies.length} replies</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{indexOfFirstMessage + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(indexOfLastMessage, filteredMessages.length)}</span> of{' '}
                                        <span className="font-medium">{filteredMessages.length}</span> messages
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${currentPage === page
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactMessagesManagement;

