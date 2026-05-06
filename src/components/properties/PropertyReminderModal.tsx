// import React, { useState } from 'react';
// import { X, Save, Bell, Plus, Trash2, Calendar, Clock, AlertCircle, CheckCircle, User, Target } from 'lucide-react';

// const PropertyReminderModal = ({ isOpen, onClose, property, reminders, onUpdateReminders }: any) => {
//   const [newReminder, setNewReminder] = useState({
//     type: 'stage_progress',
//     title: '',
//     description: '',
//     dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     dueTime: '10:00',
//     priority: 'medium',
//     assignedTo: 'Admin User',
//     recurring: false,
//     recurringType: 'weekly',
//     notificationChannels: ['email', 'whatsapp']
//   });

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   if (!isOpen) return null;

//   const reminderTypes = [
//     { value: 'stage_progress', label: 'Stage Progress', description: 'Follow up on stage completion' },
//     { value: 'weekly_update', label: 'Weekly Update', description: 'Regular status update' },
//     { value: 'photo_video', label: 'Photo/Video Shoot', description: 'Schedule media capture' },
//     { value: 'portal_publish', label: 'Portal Publishing', description: 'Publish on property portals' },
//     { value: 'buyer_followup', label: 'Buyer Follow-up', description: 'Follow up with interested buyers' },
//     { value: 'document_signing', label: 'Document Signing', description: 'Complete document formalities' },
//     { value: 'price_review', label: 'Price Review', description: 'Review and adjust pricing' },
//     { value: 'maintenance', label: 'Maintenance Check', description: 'Property maintenance review' },
//     { value: 'marketing_review', label: 'Marketing Review', description: 'Review marketing performance' },
//     { value: 'custom', label: 'Custom Reminder', description: 'Custom task or reminder' }
//   ];

//   const priorities = [
//     { value: 'urgent', label: 'Urgent', color: 'red' },
//     { value: 'high', label: 'High', color: 'orange' },
//     { value: 'medium', label: 'Medium', color: 'yellow' },
//     { value: 'low', label: 'Low', color: 'green' }
//   ];

//   const recurringTypes = [
//     { value: 'daily', label: 'Daily' },
//     { value: 'weekly', label: 'Weekly' },
//     { value: 'monthly', label: 'Monthly' },
//     { value: 'quarterly', label: 'Quarterly' }
//   ];

//   const assignedUsers = [
//     'Admin User',
//     'Property Manager',
//     'Sales Executive',
//     'Marketing Team'
//   ];

//   const notificationChannels = [
//     { value: 'email', label: 'Email' },
//     { value: 'whatsapp', label: 'WhatsApp' },
//     { value: 'sms', label: 'SMS' },
//     { value: 'push', label: 'Push Notification' }
//   ];

//   const handleInputChange = (field: string, value: any) => {
//     setNewReminder(prev => ({ ...prev, [field]: value }));
//   };

//   const handleChannelToggle = (channel: string) => {
//     setNewReminder(prev => ({
//       ...prev,
//       notificationChannels: prev.notificationChannels.includes(channel)
//         ? prev.notificationChannels.filter(c => c !== channel)
//         : [...prev.notificationChannels, channel]
//     }));
//   };

//   const addReminder = () => {
//     if (!newReminder.title.trim()) {
//       alert('Please enter reminder title');
//       return;
//     }

//     const reminder = {
//       ...newReminder,
//       id: Date.now(),
//       propertyId: property.propertyId,
//       status: 'pending',
//       created_at: new Date().toISOString()
//     };

//     onUpdateReminders([...reminders, reminder]);
//     setNewReminder({
//       type: 'stage_progress',
//       title: '',
//       description: '',
//       dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       dueTime: '10:00',
//       priority: 'medium',
//       assignedTo: 'Admin User',
//       recurring: false,
//       recurringType: 'weekly',
//       notificationChannels: ['email', 'whatsapp']
//     });
//   };

//   const removeReminder = (id: number) => {
//     onUpdateReminders(reminders.filter((r: any) => r.id !== id));
//   };

//   const markReminderComplete = (id: number) => {
//     onUpdateReminders(reminders.map((r: any) => 
//       r.id === id ? { ...r, status: 'completed', completedAt: new Date().toISOString() } : r
//     ));
//   };

//   const getPriorityBadge = (priority: string) => {
//     const config = priorities.find(p => p.value === priority);
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config?.color}-100 text-${config?.color}-700`}>
//         {config?.label}
//       </span>
//     );
//   };

//   const getStatusIcon = (status: string) => {
//     return status === 'completed' ? (
//       <CheckCircle className="text-green-500" size={16} />
//     ) : (
//       <Clock className="text-orange-500" size={16} />
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 bg-red-100 rounded-xl">
//                 <Bell className="text-red-600" size={24} />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Property Reminders</h2>
//                 <p className="text-gray-600 mt-1">{property.title} - Task & Follow-up Management</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 max-h-[75vh] overflow-y-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Left Column - Add New Reminder */}
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Reminder</h3>
//                 <div className="bg-gray-50 rounded-xl p-4 space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Type</label>
//                     <select
//                       value={newReminder.type}
//                       onChange={(e) => handleInputChange('type', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                     >
//                       {reminderTypes.map((type) => (
//                         <option key={type.value} value={type.value}>
//                           {type.label}
//                         </option>
//                       ))}
//                     </select>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {reminderTypes.find(t => t.value === newReminder.type)?.description}
//                     </p>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
//                     <input
//                       type="text"
//                       value={newReminder.title}
//                       onChange={(e) => handleInputChange('title', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                       placeholder="Enter reminder title"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                     <textarea
//                       value={newReminder.description}
//                       onChange={(e) => handleInputChange('description', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                       rows={2}
//                       placeholder="Additional details..."
//                     />
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
//                       <input
//                         type="date"
//                         value={newReminder.dueDate}
//                         onChange={(e) => handleInputChange('dueDate', e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
//                       <input
//                         type="time"
//                         value={newReminder.dueTime}
//                         onChange={(e) => handleInputChange('dueTime', e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//                       <select
//                         value={newReminder.priority}
//                         onChange={(e) => handleInputChange('priority', e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                       >
//                         {priorities.map((priority) => (
//                           <option key={priority.value} value={priority.value}>
//                             {priority.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
//                       <select
//                         value={newReminder.assignedTo}
//                         onChange={(e) => handleInputChange('assignedTo', e.target.value)}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                       >
//                         {assignedUsers.map((user) => (
//                           <option key={user} value={user}>
//                             {user}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
                  
//                   {/* Recurring Options */}
//                   <div>
//                     <label className="flex items-center space-x-3">
//                       <input
//                         type="checkbox"
//                         checked={newReminder.recurring}
//                         onChange={(e) => handleInputChange('recurring', e.target.checked)}
//                         className="rounded border-gray-300 text-red-600 focus:ring-red-500"
//                       />
//                       <span className="text-sm font-medium text-gray-700">Recurring Reminder</span>
//                     </label>
                    
//                     {newReminder.recurring && (
//                       <select
//                         value={newReminder.recurringType}
//                         onChange={(e) => handleInputChange('recurringType', e.target.value)}
//                         className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
//                       >
//                         {recurringTypes.map((type) => (
//                           <option key={type.value} value={type.value}>
//                             {type.label}
//                           </option>
//                         ))}
//                       </select>
//                     )}
//                   </div>
                  
//                   {/* Notification Channels */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
//                     <div className="grid grid-cols-2 gap-2">
//                       {notificationChannels.map((channel) => (
//                         <label key={channel.value} className="flex items-center space-x-2">
//                           <input
//                             type="checkbox"
//                             checked={newReminder.notificationChannels.includes(channel.value)}
//                             onChange={() => handleChannelToggle(channel.value)}
//                             className="rounded border-gray-300 text-red-600 focus:ring-red-500"
//                           />
//                           <span className="text-sm text-gray-700">{channel.label}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
                  
//                   <button
//                     onClick={addReminder}
//                     className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                   >
//                     <Plus size={16} />
//                     <span>Add Reminder</span>
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - Existing Reminders */}
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Reminders</h3>
                
//                 {/* Reminder Statistics */}
//                 <div className="grid grid-cols-3 gap-3 mb-4">
//                   <div className="bg-red-50 rounded-lg p-3 text-center">
//                     <div className="text-lg font-bold text-red-600">
//                       {reminders.filter((r: any) => r.priority === 'urgent' && r.status === 'pending').length}
//                     </div>
//                     <div className="text-xs text-red-700">Urgent</div>
//                   </div>
//                   <div className="bg-orange-50 rounded-lg p-3 text-center">
//                     <div className="text-lg font-bold text-orange-600">
//                       {reminders.filter((r: any) => r.status === 'pending').length}
//                     </div>
//                     <div className="text-xs text-orange-700">Pending</div>
//                   </div>
//                   <div className="bg-green-50 rounded-lg p-3 text-center">
//                     <div className="text-lg font-bold text-green-600">
//                       {reminders.filter((r: any) => r.status === 'completed').length}
//                     </div>
//                     <div className="text-xs text-green-700">Completed</div>
//                   </div>
//                 </div>

//                 {/* Reminders List */}
//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {reminders.map((reminder: any) => (
//                     <div key={reminder.id} className="bg-white border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-start justify-between mb-2">
//                         <div className="flex items-center space-x-2">
//                           {getStatusIcon(reminder.status)}
//                           <div>
//                             <div className="font-medium text-gray-900">{reminder.title}</div>
//                             <div className="text-sm text-gray-600">{reminder.description}</div>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           {reminder.status === 'pending' && (
//                             <button
//                               onClick={() => markReminderComplete(reminder.id)}
//                               className="p-1 text-green-600 hover:bg-green-100 rounded"
//                               title="Mark Complete"
//                             >
//                               <CheckCircle size={14} />
//                             </button>
//                           )}
//                           <button
//                             onClick={() => removeReminder(reminder.id)}
//                             className="p-1 text-red-600 hover:bg-red-100 rounded"
//                             title="Delete"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </div>
                      
//                       <div className="grid grid-cols-2 gap-3 text-sm">
//                         <div>
//                           <span className="text-gray-500">Due:</span>
//                           <span className="font-medium ml-2">{reminder.dueDate} {reminder.dueTime}</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">Assigned:</span>
//                           <span className="font-medium ml-2">{reminder.assignedTo}</span>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center justify-between mt-2">
//                         {getPriorityBadge(reminder.priority)}
//                         <div className="flex items-center space-x-1">
// {(reminder.notificationChannels || []).map((channel: string, index: number) => (                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
//                               {channel}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
                      
//                       {reminder.recurring && (
//                         <div className="mt-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
//                           Recurring: {reminder.recurringType}
//                         </div>
//                       )}
//                     </div>
//                   ))}
                  
//                   {reminders.length === 0 && (
//                     <div className="text-center py-8 text-gray-500">
//                       <Bell className="mx-auto mb-2" size={32} />
//                       <p>No reminders set for this property</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               {reminders.filter((r: any) => r.status === 'pending').length} pending reminders • 
//               {reminders.filter((r: any) => r.priority === 'urgent').length} urgent tasks
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyReminderModal;

import React, { useState } from 'react';
import { X, Save, Bell, Plus, Trash2, Calendar, Clock, AlertCircle, CheckCircle, User, Target, ArrowRight, Tag, Zap, Repeat, MessageCircle, Mail, Smartphone, BellRing } from 'lucide-react';
import { Camera, Globe, Users, FileText, TrendingUp, Wrench, BarChart3 } from 'lucide-react';

// ESALE Theme
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

// Section heading component
const SectionHeading = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1.5" style={{ color: N }}>
        <Icon size={12} style={{ color: O }} />
        {title}
    </h3>
);

// Compact stat card
const StatCard = ({
    icon: Icon,
    label,
    value,
    accent,
}: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    accent: string;
}) => (
    <div
        className="rounded-lg p-2 flex flex-col items-center text-center"
        style={{ background: BG, border: `1px solid ${BD}`, borderTop: `2px solid ${accent}` }}
    >
        <Icon size={14} style={{ color: accent }} />
        <p className="text-sm font-bold mt-1" style={{ color: N }}>{value}</p>
        <p className="text-[8px] font-medium" style={{ color: MU }}>{label}</p>
    </div>
);

const PropertyReminderModal = ({ isOpen, onClose, property, reminders, onUpdateReminders }: any) => {
    const [newReminder, setNewReminder] = useState({
        type: 'stage_progress',
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: '10:00',
        priority: 'medium',
        assignedTo: 'Admin User',
        recurring: false,
        recurringType: 'weekly',
        notificationChannels: ['email', 'whatsapp']
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const reminderTypes = [
        { value: 'stage_progress', label: 'Stage Progress', description: 'Follow up on stage completion' },
        { value: 'weekly_update', label: 'Weekly Update', description: 'Regular status update' },
        { value: 'photo_video', label: 'Photo/Video Shoot', description: 'Schedule media capture' },
        { value: 'portal_publish', label: 'Portal Publishing', description: 'Publish on property portals' },
        { value: 'buyer_followup', label: 'Buyer Follow-up', description: 'Follow up with interested buyers' },
        { value: 'document_signing', label: 'Document Signing', description: 'Complete document formalities' },
        { value: 'price_review', label: 'Price Review', description: 'Review and adjust pricing' },
        { value: 'maintenance', label: 'Maintenance Check', description: 'Property maintenance review' },
        { value: 'marketing_review', label: 'Marketing Review', description: 'Review marketing performance' },
        { value: 'custom', label: 'Custom Reminder', description: 'Custom task or reminder' }
    ];

    const priorities = [
        { value: 'urgent', label: 'Urgent', color: '#ef4444' },
        { value: 'high', label: 'High', color: '#f97316' },
        { value: 'medium', label: 'Medium', color: '#eab308' },
        { value: 'low', label: 'Low', color: '#22c55e' }
    ];

    const recurringTypes = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' }
    ];

    const assignedUsers = [
        'Admin User',
        'Property Manager',
        'Sales Executive',
        'Marketing Team'
    ];

    const notificationChannels = [
        { value: 'email', label: 'Email', icon: Mail },
        { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
        { value: 'sms', label: 'SMS', icon: Smartphone },
        { value: 'push', label: 'Push', icon: BellRing }
    ];

    const handleInputChange = (field: string, value: any) => {
        setNewReminder(prev => ({ ...prev, [field]: value }));
    };

    const handleChannelToggle = (channel: string) => {
        setNewReminder(prev => ({
            ...prev,
            notificationChannels: prev.notificationChannels.includes(channel)
                ? prev.notificationChannels.filter(c => c !== channel)
                : [...prev.notificationChannels, channel]
        }));
    };

    const addReminder = () => {
        if (!newReminder.title.trim()) {
            alert('Please enter reminder title');
            return;
        }

        const reminder = {
            ...newReminder,
            id: Date.now(),
            propertyId: property.propertyId,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        onUpdateReminders([...reminders, reminder]);
        setNewReminder({
            type: 'stage_progress',
            title: '',
            description: '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dueTime: '10:00',
            priority: 'medium',
            assignedTo: 'Admin User',
            recurring: false,
            recurringType: 'weekly',
            notificationChannels: ['email', 'whatsapp']
        });
    };

    const removeReminder = (id: number) => {
        onUpdateReminders(reminders.filter((r: any) => r.id !== id));
    };

    const markReminderComplete = (id: number) => {
        onUpdateReminders(reminders.map((r: any) =>
            r.id === id ? { ...r, status: 'completed', completedAt: new Date().toISOString() } : r
        ));
    };

    const getPriorityBadge = (priority: string) => {
        const config = priorities.find(p => p.value === priority);
        return (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ background: `${config?.color}15`, color: config?.color }}>
                <AlertCircle size={8} className="mr-0.5" />
                {config?.label}
            </span>
        );
    };

    const getStatusIcon = (status: string) => {
        return status === 'completed' ? (
            <CheckCircle size={12} style={{ color: '#22c55e' }} />
        ) : (
            <Clock size={12} style={{ color: O }} />
        );
    };

    const getReminderTypeIcon = (type: string) => {
        const icons: Record<string, any> = {
            stage_progress: Target,
            weekly_update: Bell,
            photo_video: Camera,
            portal_publish: Globe,
            buyer_followup: Users,
            document_signing: FileText,
            price_review: TrendingUp,
            maintenance: Wrench,
            marketing_review: BarChart3,
            custom: Tag
        };
        const Icon = icons[type] || Bell;
        return <Icon size={10} />;
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
            style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
                style={{ border: `1px solid ${BD}` }}
            >
                {/* Header */}
                <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between shrink-0" style={{ background: N }}>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
                            <Bell size={14} style={{ color: O }} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">Property Reminders</h2>
                            <p className="text-[9px] text-white/60">{property?.title || 'Property'} - Task & Follow-up Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: "thin" }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Left Column - Statistics */}
                        <div className="space-y-4">
                            {/* Stats Cards */}
                            <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                                <SectionHeading icon={BarChart3} title="Reminder Overview" />
                                <div className="grid grid-cols-3 gap-2">
                                    <StatCard
                                        icon={AlertCircle}
                                        label="Urgent"
                                        value={reminders.filter((r: any) => r.priority === 'urgent' && r.status === 'pending').length}
                                        accent="#ef4444"
                                    />
                                    <StatCard
                                        icon={Clock}
                                        label="Pending"
                                        value={reminders.filter((r: any) => r.status === 'pending').length}
                                        accent={O}
                                    />
                                    <StatCard
                                        icon={CheckCircle}
                                        label="Completed"
                                        value={reminders.filter((r: any) => r.status === 'completed').length}
                                        accent="#22c55e"
                                    />
                                </div>
                            </div>

                            {/* Create New Reminder Form */}
                            <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                                <SectionHeading icon={Plus} title="Create New Reminder" />

                                <div className="space-y-3">
                                    {/* Reminder Type */}
                                    <div>
                                        <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>Reminder Type</label>
                                        <select
                                            value={newReminder.type}
                                            onChange={(e) => handleInputChange('type', e.target.value)}
                                            className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            style={{ borderColor: BD, background: 'white' }}
                                        >
                                            {reminderTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[8px] mt-0.5" style={{ color: MU }}>
                                            {reminderTypes.find(t => t.value === newReminder.type)?.description}
                                        </p>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>Title</label>
                                        <input
                                            type="text"
                                            value={newReminder.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            style={{ borderColor: BD, background: 'white' }}
                                            placeholder="Enter reminder title"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>Description</label>
                                        <textarea
                                            value={newReminder.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                                            style={{ borderColor: BD, background: 'white' }}
                                            rows={2}
                                            placeholder="Additional details..."
                                        />
                                    </div>

                                    {/* Due Date & Time */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>Due Date</label>
                                            <input
                                                type="date"
                                                value={newReminder.dueDate}
                                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                                className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                style={{ borderColor: BD, background: 'white' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>Due Time</label>
                                            <input
                                                type="time"
                                                value={newReminder.dueTime}
                                                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                                                className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                style={{ borderColor: BD, background: 'white' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Priority & Assigned To */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>Priority</label>
                                            <select
                                                value={newReminder.priority}
                                                onChange={(e) => handleInputChange('priority', e.target.value)}
                                                className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                style={{ borderColor: BD, background: 'white' }}
                                            >
                                                {priorities.map((priority) => (
                                                    <option key={priority.value} value={priority.value}>
                                                        {priority.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>Assigned To</label>
                                            <select
                                                value={newReminder.assignedTo}
                                                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                                                className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                style={{ borderColor: BD, background: 'white' }}
                                            >
                                                {assignedUsers.map((user) => (
                                                    <option key={user} value={user}>
                                                        {user}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Recurring */}
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={newReminder.recurring}
                                                onChange={(e) => handleInputChange('recurring', e.target.checked)}
                                                className="rounded border-gray-300 focus:ring-orange-500"
                                                style={{ accentColor: O }}
                                            />
                                            <span className="text-[10px] font-medium" style={{ color: N }}>Recurring Reminder</span>
                                        </label>
                                        {newReminder.recurring && (
                                            <select
                                                value={newReminder.recurringType}
                                                onChange={(e) => handleInputChange('recurringType', e.target.value)}
                                                className="w-full mt-2 border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                style={{ borderColor: BD, background: 'white' }}
                                            >
                                                {recurringTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Notification Channels */}
                                    <div>
                                        <label className="block text-[9px] font-medium mb-1.5" style={{ color: MU }}>Notification Channels</label>
                                        <div className="flex flex-wrap gap-2">
                                            {notificationChannels.map((channel) => {
                                                const Icon = channel.icon;
                                                const isSelected = newReminder.notificationChannels.includes(channel.value);
                                                return (
                                                    <button
                                                        key={channel.value}
                                                        type="button"
                                                        onClick={() => handleChannelToggle(channel.value)}
                                                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium transition-all ${isSelected
                                                            ? 'text-white'
                                                            : 'bg-white text-gray-600 border'
                                                            }`}
                                                        style={isSelected ? { background: O } : { borderColor: BD }}
                                                    >
                                                        <Icon size={9} />
                                                        {channel.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Add Button */}
                                    <button
                                        onClick={addReminder}
                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:opacity-90"
                                        style={{ background: O, color: 'white' }}
                                    >
                                        <Plus size={12} />
                                        Add Reminder
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Existing Reminders */}
                        <div className="space-y-4">
                            <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                                <SectionHeading icon={Bell} title="Active Reminders" />

                                {/* Reminders List */}
                                <div className="space-y-2 max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                                    {reminders.length > 0 ? (
                                        reminders.map((reminder: any) => (
                                            <div
                                                key={reminder.id}
                                                className="bg-white rounded-lg p-2.5 transition-all hover:shadow-sm"
                                                style={{ border: `1px solid ${BD}` }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                                        <div className="mt-0.5">
                                                            {getStatusIcon(reminder.status)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-[10px] font-medium truncate" style={{ color: N }}>
                                                                    {reminder.title}
                                                                </span>
                                                                {getPriorityBadge(reminder.priority)}
                                                            </div>
                                                            {reminder.description && (
                                                                <p className="text-[9px] mt-0.5" style={{ color: MU }}>
                                                                    {reminder.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                <div className="flex items-center gap-0.5">
                                                                    <Calendar size={8} style={{ color: MU }} />
                                                                    <span className="text-[8px]" style={{ color: MU }}>{reminder.dueDate}</span>
                                                                </div>
                                                                <div className="flex items-center gap-0.5">
                                                                    <Clock size={8} style={{ color: MU }} />
                                                                    <span className="text-[8px]" style={{ color: MU }}>{reminder.dueTime}</span>
                                                                </div>
                                                                <div className="flex items-center gap-0.5">
                                                                    <User size={8} style={{ color: MU }} />
                                                                    <span className="text-[8px]" style={{ color: MU }}>{reminder.assignedTo}</span>
                                                                </div>
                                                            </div>
                                                            {reminder.recurring && (
                                                                <div className="flex items-center gap-0.5 mt-1">
                                                                    <Repeat size={8} style={{ color: '#8b5cf6' }} />
                                                                    <span className="text-[8px]" style={{ color: '#8b5cf6' }}>
                                                                        Recurring: {reminder.recurringType}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {(reminder.notificationChannels || []).length > 0 && (
                                                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                                    <span className="text-[7px]" style={{ color: MU }}>Notify via:</span>
                                                                    {(reminder.notificationChannels || []).map((channel: string, idx: number) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] font-medium"
                                                                            style={{ background: `${O}10`, color: O }}
                                                                        >
                                                                            {channel === 'email' && <Mail size={6} />}
                                                                            {channel === 'whatsapp' && <MessageCircle size={6} />}
                                                                            {channel === 'sms' && <Smartphone size={6} />}
                                                                            {channel === 'push' && <BellRing size={6} />}
                                                                            {channel}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {reminder.status === 'pending' && (
                                                            <button
                                                                onClick={() => markReminderComplete(reminder.id)}
                                                                className="p-1 rounded transition-colors hover:bg-green-100"
                                                                title="Mark Complete"
                                                            >
                                                                <CheckCircle size={12} style={{ color: '#22c55e' }} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => removeReminder(reminder.id)}
                                                            className="p-1 rounded transition-colors hover:bg-red-100"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} style={{ color: '#ef4444' }} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Bell size={24} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-[9px]" style={{ color: MU }}>No reminders set for this property</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                                <SectionHeading icon={Zap} title="Quick Stats" />
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px]" style={{ color: MU }}>Completion Rate</span>
                                        <span className="text-[10px] font-bold" style={{ color: O }}>
                                            {reminders.length > 0
                                                ? Math.round((reminders.filter((r: any) => r.status === 'completed').length / reminders.length) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px]" style={{ color: MU }}>Avg. Response Time</span>
                                        <span className="text-[10px] font-bold" style={{ color: N }}>2.5 days</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px]" style={{ color: MU }}>On-Time Completion</span>
                                        <span className="text-[10px] font-bold" style={{ color: N }}>85%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-5 py-2.5 border-t flex items-center justify-between shrink-0" style={{ borderColor: BD, background: BG }}>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${reminders.filter((r: any) => r.status === 'pending').length > 0 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className="text-[9px]" style={{ color: MU }}>
                            {reminders.filter((r: any) => r.status === 'pending').length} pending •
                            {reminders.filter((r: any) => r.priority === 'urgent').length} urgent tasks
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:opacity-80"
                        style={{ border: `1px solid ${BD}`, color: N }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Import missing icons at the top

export default PropertyReminderModal;