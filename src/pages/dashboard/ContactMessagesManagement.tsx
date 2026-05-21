

// // src/components/ContactMessagesManagement.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Search,
//   Eye,
//   Phone,
//   Mail,
//   Calendar,
//   Clock,
//   MessageCircle,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   RefreshCw,
//   IndianRupee,
//   Home,
//   User,
//   Star,
//   Reply,
//   MoreHorizontal,
//   Send,
//   ArrowLeft,
//   Download,
//   Timer,
//   MessageSquare
// } from 'lucide-react';
// import { contactsAPI } from '@/lib/contactsAPI'; // adjust path if needed

// const ContactMessagesManagement = () => {
//   const [messages, setMessages] = useState([]);
//   const [filteredMessages, setFilteredMessages] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const [showDetail, setShowDetail] = useState(false);
//   const [replyText, setReplyText] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // multi-select state
//   const [selectedIds, setSelectedIds] = useState([]);

//   // array of ids currently being updated (status/reply/star)
//   const [updatingIds, setUpdatingIds] = useState([]);

//   const messagesPerPage = 10;

//   // helper: add/remove id to updatingIds
//   const addUpdating = (id) => setUpdatingIds(prev => (prev.includes(id) ? prev : [...prev, id]));
//   const removeUpdating = (id) => setUpdatingIds(prev => prev.filter(x => x !== id));
//   const isUpdating = (id) => updatingIds.includes(id);

//   // small normalizer to keep state shape consistent
//   const normalizeMessage = (m) => ({
//     id: m.id ?? m._id ?? m.contactId,
//     name: m.name ?? m.fullName ?? '—',
//     email: m.email ?? '',
//     phone: m.phone ?? '',
//     subject: m.subject ?? 'No subject',
//     message: m.message ?? '',
//     // propertyType: m.propertyType ?? m.type ?? '',
//     propertyType: m.propertyType ?? m.property_type ?? m.type ?? '',
//     budget: m.budget ?? m.price ?? '',
//     status: m.status ?? 'new',
//     priority: m.priority ?? 'low',
//     timestamp: m.timestamp ?? m.createdAt ?? new Date().toISOString(),
//     isStarred: !!(m.isStarred ?? m.is_starred ?? false),
//     assignedTo: m.assignedTo ?? m.assigned_to ?? null,
//     replies: Array.isArray(m.replies) ? m.replies : (m.replies ? [m.replies] : [])
//   });

//   // Fetch contacts from API
//   const fetchMessages = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await contactsAPI.getContacts();
//       const list = Array.isArray(data) ? data : (data?.data || []);
//       const normalized = list.map(normalizeMessage);
//       setMessages(normalized);
//       setFilteredMessages(normalized);
//       // clear selection on hard refresh
//       setSelectedIds([]);
//     } catch (err) {
//       console.error("Failed to fetch contacts", err);
//       setError('Failed to load messages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Filter messages whenever search / status / messages change
//   useEffect(() => {
//     let filtered = messages.filter(message => {
//       const s = searchTerm.trim().toLowerCase();
//       const matchesSearch =
//         !s ||
//         (message.name && message.name.toLowerCase().includes(s)) ||
//         (message.email && message.email.toLowerCase().includes(s)) ||
//         (message.subject && message.subject.toLowerCase().includes(s)) ||
//         (message.message && message.message.toLowerCase().includes(s));

//       const matchesStatus = statusFilter === 'all' || message.status === statusFilter;

//       return matchesSearch && matchesStatus;
//     });

//     filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

//     setFilteredMessages(filtered);
//     setCurrentPage(1);
//   }, [messages, searchTerm, statusFilter]);

//   // Pagination logic
//   const indexOfLastMessage = currentPage * messagesPerPage;
//   const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
//   const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
//   const totalPages = Math.max(1, Math.ceil(filteredMessages.length / messagesPerPage));

//   // selection helpers
//   const isSelected = (id) => selectedIds.includes(id);
//   const toggleSelect = (id) => {
//     setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   };
//   const allOnPageSelected = currentMessages.length > 0 && currentMessages.every(m => selectedIds.includes(m.id));
//   const toggleSelectAllCurrent = () => {
//     if (allOnPageSelected) {
//       // deselect only those on current page
//       const idsOnPage = new Set(currentMessages.map(m => m.id));
//       setSelectedIds(prev => prev.filter(id => !idsOnPage.has(id)));
//     } else {
//       // add all on current page
//       const newIds = currentMessages.map(m => m.id);
//       setSelectedIds(prev => Array.from(new Set([...prev, ...newIds])));
//     }
//   };

//   // Status config (counts derived from messages state)
//   const statusCounts = {
//     new: messages.filter(m => m.status === 'new').length,
//     replied: messages.filter(m => m.status === 'replied').length,
//     'in-progress': messages.filter(m => m.status === 'in-progress').length,
//     resolved: messages.filter(m => m.status === 'resolved').length
//   };

//   // Enhanced status configuration with better colors and icons
//   const statusConfig = {
//     new: {
//       color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 shadow-sm',
//       dotColor: 'bg-blue-500',
//       bgColor: 'bg-blue-50',
//       borderColor: 'border-l-blue-500',
//       label: 'New',
//       count: statusCounts.new,
//       icon: AlertCircle,
//       description: 'Awaiting review'
//     },
//     replied: {
//       color: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm',
//       dotColor: 'bg-emerald-500',
//       bgColor: 'bg-emerald-50',
//       borderColor: 'border-l-emerald-500',
//       label: 'Replied',
//       count: statusCounts.replied,
//       icon: Reply,
//       description: 'Response sent'
//     },
//     'in-progress': {
//       color: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200 shadow-sm',
//       dotColor: 'bg-amber-500',
//       bgColor: 'bg-amber-50',
//       borderColor: 'border-l-amber-500',
//       label: 'In Progress',
//       count: statusCounts['in-progress'],
//       icon: Timer,
//       description: 'Being processed'
//     },
//     resolved: {
//       color: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200 shadow-sm',
//       dotColor: 'bg-purple-500',
//       bgColor: 'bg-purple-50',
//       borderColor: 'border-l-purple-500',
//       label: 'Resolved',
//       count: statusCounts.resolved,
//       icon: CheckCircle,
//       description: 'Successfully closed'
//     }
//   };

//   const priorityColors = {
//     high: 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-sm',
//     medium: 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-sm',
//     low: 'border-l-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-sm'
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffTime = Math.abs(now.getTime() - date.getTime());
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//     if (diffDays === 0) {
//       return 'Today ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
//     } else if (diffDays === 1) {
//       return 'Yesterday';
//     } else if (diffDays < 7) {
//       return `${diffDays} days ago`;
//     } else {
//       return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
//     }
//   };

//   // CSV export
//   const exportData = () => {
//     const rows = (selectedIds.length
//       ? messages.filter(m => selectedIds.includes(m.id))
//       : filteredMessages);

//     if (!rows.length) {
//       // nothing to export
//       console.warn('No rows to export');
//       return;
//     }

//     const headers = [
//       'id', 'name', 'email', 'phone', 'subject', 'message',
//       'propertyType', 'budget', 'status', 'priority',
//       'timestamp', 'assignedTo', 'isStarred', 'repliesCount'
//     ];

//     const csvLines = [];
//     csvLines.push(headers.join(','));

//     const esc = (v) => {
//       if (v === null || v === undefined) return '';
//       const s = String(v).replace(/"/g, '""');
//       // wrap in quotes if contains comma, quote, or newline
//       return /[",\n]/.test(s) ? `"${s}"` : s;
//     };

//     rows.forEach(m => {
//       csvLines.push([
//         esc(m.id),
//         esc(m.name),
//         esc(m.email),
//         esc(m.phone),
//         esc(m.subject),
//         esc(m.message),
//         esc(m.propertyType || ''),
//         esc(m.budget || ''),
//         esc(m.status),
//         esc(m.priority),
//         esc(m.timestamp),
//         esc(m.assignedTo || ''),
//         esc(m.isStarred ? 'yes' : 'no'),
//         esc((m.replies?.length || 0))
//       ].join(','));
//     });

//     // Use BOM so Excel opens UTF-8 correctly
//     const blob = new Blob(
//       ["\uFEFF" + csvLines.join('\n')],
//       { type: 'text/csv;charset=utf-8;' }
//     );
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
//     a.href = url;
//     a.download = `contact-messages-${selectedIds.length ? 'selected' : 'filtered'}-${ts}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   // Generic optimistic patch + fallback refetch (still useful for non-status updates)
//   const patchAndSetMessage = async (messageId, patch) => {
//     setMessages(prev => prev.map(m => m.id === messageId ? { ...m, ...patch } : m));
//     try {
//       await contactsAPI.updateContact(messageId, patch);
//     } catch (err) {
//       console.error('Failed to persist contact update', err);
//       await fetchMessages();
//     }
//   };

//   // NEW: update status using dedicated API (contactsAPI.updateStatus)
//   const updateMessageStatus = async (messageId, newStatus) => {
//     setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: newStatus } : m));
//     if (selectedMessage && selectedMessage.id === messageId) {
//       setSelectedMessage(prev => ({ ...prev, status: newStatus }));
//     }

//     addUpdating(messageId);
//     try {
//       const resp = await contactsAPI.updateStatus(messageId, newStatus);
//       if (resp && (resp.id || resp._id || resp.contactId)) {
//         const updated = normalizeMessage(resp);
//         setMessages(prev => prev.map(m => m.id === messageId ? updated : m));
//         if (selectedMessage && selectedMessage.id === messageId) {
//           setSelectedMessage(updated);
//         }
//       }
//     } catch (err) {
//       console.error('Failed to update status', err);
//       await fetchMessages();
//     } finally {
//       removeUpdating(messageId);
//     }
//   };

//   // Toggle star
//   const toggleStar = async (messageId) => {
//     const target = messages.find(m => m.id === messageId);
//     const newStar = !target?.isStarred;
//     setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStarred: newStar } : m));
//     if (selectedMessage && selectedMessage.id === messageId) {
//       setSelectedMessage(prev => ({ ...prev, isStarred: newStar }));
//     }

//     addUpdating(messageId);
//     try {
//       await contactsAPI.updateContact(messageId, { isStarred: newStar });
//     } catch (err) {
//       console.error('Failed to persist star toggle', err);
//       await fetchMessages();
//     } finally {
//       removeUpdating(messageId);
//     }
//   };

//   // Add reply
//   const handleReply = async () => {
//     if (!replyText.trim() || !selectedMessage) return;

//     const newReply = {
//       id: Date.now(),
//       message: replyText.trim(),
//       timestamp: new Date().toISOString(),
//       sender: 'Agent'
//     };

//     setMessages(prev => prev.map(m => m.id === selectedMessage.id ? {
//       ...m,
//       status: 'replied',
//       replies: [...(m.replies || []), newReply]
//     } : m));
//     setSelectedMessage(prev => prev ? ({ ...prev, status: 'replied', replies: [...(prev.replies || []), newReply] }) : prev);
//     setReplyText('');

//     addUpdating(selectedMessage.id);
//     try {
//       const resp = await contactsAPI.addReply(selectedMessage.id, { message: newReply.message, sender: newReply.sender });
//       if (resp && (resp.id || resp._id || resp.contactId)) {
//         const updated = normalizeMessage(resp);
//         setMessages(prev => prev.map(m => m.id === selectedMessage.id ? updated : m));
//         setSelectedMessage(updated);
//       } else {
//         try {
//           await contactsAPI.updateContact(selectedMessage.id, {
//             replies: [...(selectedMessage.replies || []), newReply],
//             status: 'replied'
//           });
//         } catch { }
//       }
//     } catch (err) {
//       console.error('Failed to persist reply', err);
//       await fetchMessages();
//       const fresh = messages.find(m => m.id === selectedMessage.id);
//       if (fresh) setSelectedMessage(fresh);
//     } finally {
//       removeUpdating(selectedMessage.id);
//     }
//   };

//   const assignAgent = async (messageId, agentName) => {
//     patchAndSetMessage(messageId, { assignedTo: agentName });
//     if (selectedMessage && selectedMessage.id === messageId) {
//       setSelectedMessage(prev => ({ ...prev, assignedTo: agentName }));
//     }
//   };

//   // Detail view open fetch fresh single message (optional)
//   const openDetail = async (message) => {
//     try {
//       const data = await contactsAPI.getContactById(message.id);
//       const m = data && (data.id || data._id || data.contactId) ? data : message;
//       setSelectedMessage(normalizeMessage(m));
//       setShowDetail(true);
//     } catch (err) {
//       console.warn('Could not fetch single contact, opening cached version', err);
//       setSelectedMessage(message);
//       setShowDetail(true);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
//           <RefreshCw className="animate-spin mx-auto text-blue-500" size={48} />
//           <p className="mt-4 text-gray-700 font-medium">Loading messages...</p>
//           <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
//           <XCircle size={48} className="text-red-500 mx-auto" />
//           <p className="mt-4 text-red-700 font-medium">{error}</p>
//           <p className="text-sm text-gray-500 mt-1">Something went wrong while loading your messages</p>
//           <button
//             onClick={fetchMessages}
//             className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Detail view
//   if (showDetail && selectedMessage) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         {/* Detail Header */}
//         <div className="bg-white shadow-lg border-b border-gray-200">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between h-16">
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={() => setShowDetail(false)}
//                   className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
//                 >
//                   <ArrowLeft size={20} />
//                 </button>
//                 <div>
//                   <h1 className="text-xl font-bold text-gray-900">Message Details</h1>
//                   <p className="text-sm text-gray-500">From: {selectedMessage.name}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <button
//                   onClick={() => toggleStar(selectedMessage.id)}
//                   disabled={isUpdating(selectedMessage.id)}
//                   className={`p-2 rounded-xl transition-all duration-200 ${selectedMessage.isStarred
//                     ? 'text-yellow-500 bg-yellow-50 border border-yellow-200'
//                     : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 border border-gray-200'
//                     }`}
//                 >
//                   <Star size={20} fill={selectedMessage.isStarred ? 'currentColor' : 'none'} />
//                 </button>
//                 <select
//                   value={selectedMessage.status}
//                   onChange={(e) => updateMessageStatus(selectedMessage.id, e.target.value)}
//                   disabled={isUpdating(selectedMessage.id)}
//                   className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white shadow-sm"
//                 >
//                   <option value="new">New</option>
//                   <option value="replied">Replied</option>
//                   <option value="in-progress">In Progress</option>
//                   <option value="resolved">Resolved</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//             {/* Message Header */}
//             <div className={`p-6 border-b ${statusConfig[selectedMessage.status]?.bgColor || 'bg-gray-50'}`}>
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedMessage.subject}</h2>
//                   <div className="flex items-center space-x-6 text-sm text-gray-600">
//                     <div className="flex items-center space-x-2">
//                       <User size={16} />
//                       <span className="font-medium">{selectedMessage.name}</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Mail size={16} />
//                       <span>{selectedMessage.email}</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Phone size={16} />
//                       <span>{selectedMessage.phone}</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Clock size={16} />
//                       <span>{formatDate(selectedMessage.timestamp)}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <span className={`px-4 py-2 rounded-xl text-sm font-medium ${statusConfig[selectedMessage.status]?.color || 'bg-gray-100 text-gray-700'}`}>
//                     <div className="flex items-center space-x-2">
//                       <div className={`w-2 h-2 rounded-full ${statusConfig[selectedMessage.status]?.dotColor || 'bg-gray-400'}`}></div>
//                       <span>{statusConfig[selectedMessage.status]?.label || selectedMessage.status}</span>
//                     </div>
//                   </span>
//                   <span className={`px-3 py-1 text-xs rounded-full font-medium ${selectedMessage.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
//                     selectedMessage.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
//                       'bg-green-100 text-green-800 border border-green-200'
//                     }`}>
//                     {selectedMessage.priority} priority
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Property Details */}
//             <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Requirements</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-blue-100">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Home className="text-blue-600" size={20} />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 font-medium">Property Type</p>
//                     <p className="font-semibold text-gray-900">{selectedMessage.propertyType || '—'}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-green-100">
//                   <div className="p-2 bg-green-100 rounded-lg">
//                     <IndianRupee className="text-green-600" size={20} />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 font-medium">Budget</p>
//                     <p className="font-semibold text-gray-900">{selectedMessage.budget || '—'}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-purple-100">
//                   <div className="p-2 bg-purple-100 rounded-lg">
//                     <User className="text-purple-600" size={20} />
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 font-medium">Assigned To</p>
//                     <p className="font-semibold text-gray-900">{selectedMessage.assignedTo || 'Unassigned'}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Original Message */}
//             <div className="p-6 border-b">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Message</h3>
//               <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
//                 <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
//               </div>
//             </div>

//             {/* Replies */}
//             <div className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversation</h3>

//               {selectedMessage.replies && selectedMessage.replies.length > 0 && (
//                 <div className="space-y-6 mb-8">
//                   {selectedMessage.replies.map((reply, index) => (
//                     <div key={index} className="flex items-start space-x-4">
//                       <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
//                         <span className="text-white text-sm font-semibold">A</span>
//                       </div>
//                       <div className="flex-1">
//                         <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
//                           <p className="text-gray-900">{reply.message}</p>
//                         </div>
//                         <p className="text-xs text-gray-500 mt-2 font-medium">{formatDate(reply.timestamp)}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Reply Form */}
//               <div className="border-t pt-6">
//                 <div className="flex space-x-4">
//                   <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
//                     <span className="text-white text-sm font-semibold">You</span>
//                   </div>
//                   <div className="flex-1 space-y-4">
//                     <textarea
//                       value={replyText}
//                       onChange={(e) => setReplyText(e.target.value)}
//                       placeholder="Type your reply here..."
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
//                       rows={4}
//                       disabled={isUpdating(selectedMessage.id)}
//                     />
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center space-x-4">
//                         <button
//                           onClick={() => window.open(`tel:${selectedMessage.phone}`)}
//                           className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-xl transition-all duration-200 border border-green-200"
//                         >
//                           <Phone size={16} />
//                           <span>Call</span>
//                         </button>
//                         <button
//                           onClick={() => window.open(`mailto:${selectedMessage.email}`)}
//                           className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-blue-200"
//                         >
//                           <Mail size={16} />
//                           <span>Email</span>
//                         </button>
//                       </div>
//                       <button
//                         onClick={handleReply}
//                         disabled={!replyText.trim() || isUpdating(selectedMessage.id)}
//                         className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
//                       >
//                         <Send size={16} />
//                         <span>{isUpdating(selectedMessage.id) ? 'Sending...' : 'Send Reply'}</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // List view
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
//       {/* Header */}
//       <div className="bg-white shadow-md border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 sm:grid-cols-2 items-center h-16 gap-4">
//             {/* Left Section */}
           

//             {/* Right Section */}
//             <div className="flex items-center justify-end space-x-2">
//               {/* Select page master checkbox */}
//               <label className="flex items-center gap-2 mr-2 text-sm text-gray-700">
//                 <input
//                   type="checkbox"
//                   className="h-4 w-4 rounded border-gray-300"
//                   checked={allOnPageSelected}
//                   onChange={toggleSelectAllCurrent}
//                 />
//                 <span>Select page</span>
//               </label>

//               {/* selection count (if any) */}
//               {selectedIds.length > 0 && (
//                 <span className="px-2 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 mr-2">
//                   {selectedIds.length} selected
//                 </span>
//               )}

//               {/* Refresh */}
//               <button
//                 onClick={fetchMessages}
//                 className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                 aria-label="Refresh Messages"
//               >
//                 <RefreshCw size={20} />
//               </button>

//               {/* Export */}
//               <button
//                 onClick={exportData}
//                 className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors duration-200"
//               >
//                 <Download size={18} />
//                 <span>Export</span>
//               </button>
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="max-w-7xl mx-auto   py-6 sm:py-8 mt-6">

//         {/* ===== Stats ===== */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
//           <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Messages</p>
//                 <p className="text-2xl sm:text-3xl font-bold text-gray-900">{messages.length}</p>
//                 <p className="text-[11px] sm:text-xs text-gray-500 mt-1">All inquiries</p>
//               </div>
//               <div className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
//                 <MessageCircle className="text-white" size={24} />
//               </div>
//             </div>
//           </div>

//           {Object.entries(statusConfig).map(([status, config]) => {
//             const IconComponent = config.icon;
//             return (
//               <div key={status} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
//                 <div className="flex items-center justify-between">
//                   <div className="min-w-0">
//                     <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{config.label}</p>
//                     <p className="text-2xl sm:text-3xl font-bold text-gray-900">{config.count}</p>
//                     <p className="text-[11px] sm:text-xs text-gray-500 mt-1 truncate">{config.description}</p>
//                   </div>
//                   <div
//                     className={`p-2.5 sm:p-3 rounded-xl ${config.bgColor} border ${config.color.includes('border-blue') ? 'border-blue-200'
//                         : config.color.includes('border-emerald') ? 'border-emerald-200'
//                           : config.color.includes('border-amber') ? 'border-amber-200'
//                             : 'border-purple-200'
//                       }`}
//                   >
//                     <IconComponent
//                       size={24}
//                       className={
//                         config.color.includes('text-blue') ? 'text-blue-600'
//                           : config.color.includes('text-emerald') ? 'text-emerald-600'
//                             : config.color.includes('text-amber') ? 'text-amber-600'
//                               : 'text-purple-600'
//                       }
//                     />
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
//                     <div
//                       className={`h-1.5 sm:h-2 rounded-full ${config.dotColor}`}
//                       style={{ width: `${messages.length > 0 ? (config.count / messages.length) * 100 : 0}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* ===== Filters ===== */}
//         <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
//             <div className="sm:col-span-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                 <input
//                   type="text"
//                   placeholder="Search messages..."
//                   className="w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm font-medium text-sm"
//               >
//                 <option value="all">All Status</option>
//                 <option value="new">New Messages</option>
//                 <option value="replied">Replied</option>
//                 <option value="in-progress">In Progress</option>
//                 <option value="resolved">Resolved</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* ===== Messages List ===== */}
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
//           <div className="divide-y divide-gray-200">
//             {currentMessages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 ${priorityColors[message.priority] || 'border-l-gray-300 bg-white'}`}
//                 onClick={() => openDetail(message)}
//               >
//                 {/* Top section becomes stacked on small screens */}
//                 <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
//                   {/* Left + row checkbox */}
//                   <div className="flex items-start gap-3 flex-1 min-w-0">
//                     <input
//                       type="checkbox"
//                       className="mt-1 h-4 w-4 rounded border-gray-300"
//                       checked={isSelected(message.id)}
//                       onChange={(e) => {
//                         e.stopPropagation();
//                         toggleSelect(message.id);
//                       }}
//                       onClick={(e) => e.stopPropagation()}
//                     />

//                     <div className="flex-1 min-w-0">
//                       <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
//                         <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[60%] sm:max-w-none">
//                           {message.name}
//                         </h3>

//                         <span className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-medium ${statusConfig[message.status]?.color || 'bg-gray-100 text-gray-700'}`}>
//                           <span className="inline-flex items-center gap-1">
//                             <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[message.status]?.dotColor || 'bg-gray-400'}`} />
//                             {statusConfig[message.status]?.label || message.status}
//                           </span>
//                         </span>

//                         {message.isStarred && (
//                           <Star size={14} className="text-yellow-500" fill="currentColor" />
//                         )}

//                         <span
//                           className={`px-2 py-0.5 text-[11px] sm:text-xs rounded-full font-medium ${message.priority === 'high'
//                               ? 'bg-red-100 text-red-700 border border-red-200'
//                               : message.priority === 'medium'
//                                 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
//                                 : 'bg-green-100 text-green-700 border border-green-200'
//                             }`}
//                         >
//                           {message.priority}
//                         </span>
//                       </div>

//                       <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-2 sm:mb-3 truncate">
//                         {message.subject}
//                       </h4>

//                       <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">
//                         {message.message}
//                       </p>

//                       {/* Meta row wraps on small screens */}
//                       <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
//                         <div className="inline-flex items-center gap-1.5 min-w-0">
//                           <Mail size={14} />
//                           <span className="truncate">{message.email}</span>
//                         </div>
//                         <div className="inline-flex items-center gap-1.5">
//                           <Phone size={14} />
//                           <span>{message.phone}</span>
//                         </div>
//                         {message.propertyType && (
//                           <div className="inline-flex items-center gap-1.5">
//                             <Home size={14} />
//                             <span>{message.propertyType}</span>
//                           </div>
//                         )}
//                         {message.assignedTo && (
//                           <div className="inline-flex items-center gap-1.5">
//                             <User size={14} />
//                             <span>Assigned to {message.assignedTo}</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right (actions/time) */}
//                   <div className="flex md:flex-col items-center md:items-end justify-between gap-3 md:gap-2">
//                     <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
//                       {formatDate(message.timestamp)}
//                     </span>

//                     <div className="flex flex-wrap items-center gap-2 justify-end">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           window.open(`tel:${message.phone}`);
//                         }}
//                         className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200 border border-green-200"
//                       >
//                         <Phone size={16} />
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           window.open(`mailto:${message.email}`);
//                         }}
//                         className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-200 border border-blue-200"
//                       >
//                         <Mail size={16} />
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           toggleStar(message.id);
//                         }}
//                         className={`p-2 rounded-xl transition-all duration-200 border ${message.isStarred
//                             ? 'text-yellow-500 bg-yellow-100 border-yellow-200'
//                             : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 border-gray-200'
//                           }`}
//                       >
//                         <Star size={16} fill={message.isStarred ? 'currentColor' : 'none'} />
//                       </button>
//                     </div>

//                     {message.replies && message.replies.length > 0 && (
//                       <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
//                         <MessageSquare size={12} />
//                         <span>{message.replies.length} replies</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* ===== Pagination ===== */}
//           {totalPages > 1 && (
//             <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                 <p className="text-xs sm:text-sm text-gray-700">
//                   Showing <span className="font-medium">{indexOfFirstMessage + 1}</span> to{' '}
//                   <span className="font-medium">{Math.min(indexOfLastMessage, filteredMessages.length)}</span> of{' '}
//                   <span className="font-medium">{filteredMessages.length}</span> messages
//                 </p>

//                 <div className="flex flex-wrap items-center gap-2">
//                   <button
//                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
//                   >
//                     Previous
//                   </button>

//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                     <button
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`px-2.5 sm:px-3 py-2 text-sm rounded-lg transition-all duration-200 ${currentPage === page
//                           ? 'bg-blue-600 text-white shadow'
//                           : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
//                         }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className="px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//     </div>
//   );
// };

// export default ContactMessagesManagement;



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
  const messagesPerPage = 10;

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

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / messagesPerPage));

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold" style={{ color: RESALE.navy }}>Filter Messages</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="replied">Replied</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <input
                type="text"
                placeholder="Search property type..."
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: RESALE.orange }}
            >
              Apply Filters
            </button>
          </div>
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
    <div style={{ backgroundColor: RESALE.navyLight }}>
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        
        

        {/* Stats Cards */}
       <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-5 sticky top-0 z-10">
  
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

        {/* Search and Bulk Delete Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search messages by name, email, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm bg-white"
            />
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-semibold" style={{ color: RESALE.orange }}>
                Selected: {selectedIds.length}
              </span>
              <button onClick={handleBulkDelete} className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete
              </button>
              <button onClick={() => setSelectedIds([])} className="px-3 py-1 text-xs border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Tabs Row with Filter Button */}
       <div className="flex flex-wrap items-center gap-2 mb-4">
  
  {/* Left Tabs */}
<div className="flex items-center gap-1 overflow-x-auto md:flex-wrap md:overflow-visible pb-1 scrollbar-hide">
      <button
      onClick={() => setStatusFilter('all')}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
        statusFilter === 'all'
          ? 'bg-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      style={statusFilter === 'all' ? { color: RESALE.orange } : {}}
    >
      All ({statusCounts.total})
    </button>

    {Object.entries(statusConfig).map(([status, config]) => (
      <button
        key={status}
        onClick={() => setStatusFilter(status)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
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

  {/* Right Buttons */}
  <div className="flex items-center gap-2 ml-auto">
   <button onClick={() => setShowFilterSidebar(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
  <SlidersHorizontal size={14} /> Filter
</button>

    <button
      onClick={exportData}
      className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
    >
      <Download size={14} /> Export
    </button>

    <button
      onClick={fetchMessages}
      className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
    >
      <RefreshCw size={16} />
    </button>
  </div>
</div>

        {/* Main Table - Horizontal Scroll on Mobile */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
  <div className="overflow-x-auto overflow-y-auto max-h-[250px] sm:max-h-[380px]">
    <table className="w-full text-sm table-fixed" style={{ minWidth: '900px' }}>
      <colgroup>
        <col style={{ width: '36px' }} />        {/* checkbox */}
        <col style={{ width: '130px' }} />       {/* FROM */}
        <col style={{ width: '150px' }} />       {/* CONTACT */}
        <col style={{ width: '110px' }} />       {/* SUBJECT */}
        <col style={{ width: '160px' }} />       {/* MESSAGE */}
        <col style={{ width: '120px' }} />       {/* PROPERTY */}
        <col style={{ width: '120px' }} />       {/* STATUS */}
        <col style={{ width: '100px' }} />       {/* DATE */}
        <col style={{ width: '180px' }} />       {/* ACTIONS */}
      </colgroup>

      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr>
          <th className="px-2 py-3 text-left w-8">
            <input
              type="checkbox"
              checked={allOnPageSelected && currentMessages.length > 0}
              onChange={toggleSelectAllCurrent}
              className="rounded border-gray-300 focus:ring-orange-500"
            />
          </th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">FROM</th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">CONTACT</th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">SUBJECT</th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">MESSAGE</th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">PROPERTY</th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">STATUS</th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE</th>
          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
        </tr>

        {/* Column Search Row */}
        <tr className="bg-gray-100">
          <th className="px-2 py-1.5"></th>
          <th className="px-2 py-1.5">
            <input type="text" placeholder="Search..." value={colSearch.name} onChange={e => setColSearch(p => ({ ...p, name: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" />
          </th>
          <th className="px-2 py-1.5">
            <input type="text" placeholder="Search..." value={colSearch.contact} onChange={e => setColSearch(p => ({ ...p, contact: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" />
          </th>
          <th className="px-2 py-1.5">
            <input type="text" placeholder="Search..." value={colSearch.subject} onChange={e => setColSearch(p => ({ ...p, subject: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" />
          </th>
          <th className="px-2 py-1.5">
            <input type="text" placeholder="Search..." value={colSearch.message} onChange={e => setColSearch(p => ({ ...p, message: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" />
          </th>
          <th className="px-2 py-1.5">
            <input type="text" placeholder="Search..." value={colSearch.propertyType} onChange={e => setColSearch(p => ({ ...p, propertyType: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" />
          </th>
          <th className="px-2 py-1.5">
            <input type="text" placeholder="Search..." value={colSearch.status} onChange={e => setColSearch(p => ({ ...p, status: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" />
          </th>
          <th className="px-2 py-1.5"></th>
          <th className="px-2 py-1.5"></th>
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
              <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(message.id)}
                  onChange={() => toggleSelect(message.id)}
                  className="rounded border-gray-300 focus:ring-orange-500"
                />
              </td>

              {/* FROM */}
              <td className="px-2 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: RESALE.orange }}>
                    {message.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-xs truncate">{message.name}</div>
                    {message.isStarred && <Star size={9} className="text-yellow-500" fill="currentColor" />}
                  </div>
                </div>
              </td>

              {/* CONTACT */}
              <td className="px-2 py-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Mail size={11} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 truncate">{message.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={11} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 truncate">{message.phone}</span>
                  </div>
                </div>
              </td>

              {/* SUBJECT */}
              <td className="px-2 py-3">
                <div className="text-xs font-medium text-gray-800 truncate">{message.subject}</div>
              </td>

              {/* MESSAGE */}
              <td className="px-2 py-3">
                <div className="text-xs text-gray-600 line-clamp-2">{message.message}</div>
                {message.replies?.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                    <MessageSquare size={9} /><span>{message.replies.length} replies</span>
                  </div>
                )}
              </td>

              {/* PROPERTY */}
              <td className="px-2 py-3">
                <div className="space-y-0.5">
                  <div className="text-xs"><span className="text-gray-500">Type:</span> <span className="font-medium">{message.propertyType || '—'}</span></div>
                  <div className="text-xs"><span className="text-gray-500">Budget:</span> <span className="text-green-600">{message.budget || '—'}</span></div>
                </div>
              </td>

              {/* STATUS */}
              <td className="px-2 py-3">
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    <StatusIcon size={9} /> {status.label}
                  </span>
                  <span className={`inline-flex items-center gap-0.9 px-1.5 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}>
                    {priority.label}
                  </span>
                </div>
              </td>

              {/* DATE */}
              <td className="px-2 py-3">
                <div className="text-xs text-gray-500 whitespace-nowrap">{formatDate(message.timestamp)}</div>
              </td>

              {/* ACTIONS — all in one row, no wrapping */}
              <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 flex-nowrap">
                  {/* Status Dropdown */}
                  <select
                    value={message.status}
                    onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="px-1.5 py-1 text-xs border rounded-lg focus:ring-1 focus:ring-orange-500 bg-white"
                    style={{ borderColor: '#e2e8f0', maxWidth: '85px' }}
                  >
                    <option value="new">New</option>
                    <option value="replied">Replied</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  {/* View */}
                  <button onClick={() => openDetailModal(message)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg flex-shrink-0" title="View">
                    <Eye size={13} />
                  </button>

                  {/* Call */}
                  <button onClick={() => window.open(`tel:${message.phone}`)} className="p-1 text-green-600 hover:bg-green-100 rounded-lg flex-shrink-0" title="Call">
                    <Phone size={13} />
                  </button>

                  {/* Email */}
                  <button onClick={() => window.open(`mailto:${message.email}`)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg flex-shrink-0" title="Email">
                    <Mail size={13} />
                  </button>

                  {/* Star */}
                  <button onClick={() => toggleStar(message.id)} className={`p-1 rounded-lg flex-shrink-0 ${message.isStarred ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}>
                    <Star size={13} fill={message.isStarred ? 'currentColor' : 'none'} />
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
    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
      <div className="text-[11px] sm:text-xs text-gray-500">
        Showing {indexOfFirstMessage + 1}–{Math.min(indexOfLastMessage, filteredMessages.length)} of {filteredMessages.length}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-1 sm:p-2 text-gray-600 disabled:opacity-50 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1 sm:p-2 text-gray-600 disabled:opacity-50 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight size={15} />
        </button>
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
  );
};

export default ContactMessagesManagement;