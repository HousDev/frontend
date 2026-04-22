// // src/components/inbox/ChatWindow.tsx
// import { useEffect, useRef, useState } from 'react';
// import { Bot, CheckCircle, Clock, PhoneCall, ArrowLeft, ChevronRight, Activity, BotMessageSquare } from 'lucide-react';
// import type { WhatsAppConversation, WhatsAppContact, Tag, CrmUser } from '../../types';
// import { useMessages, useNotes, useSendMessage } from '../../hooks/useInbox';
// import { useTemplates } from '../../hooks/useTemplate';
// import { formatDate } from '../../lib/formatters';
// import { MOCK_FLOWS } from '../../lib/mockData';
// import MessageBubble from './MessageBubble';

// import ContactInfo from './ContactInfo';
// import ChatInput from './ChatInput';


// interface Props {
//     conversation: WhatsAppConversation | null;
//     contact: WhatsAppContact | null;
//     users: CrmUser[];
//     allTags: Tag[];
//     onUpdateStage: (stage: string) => void;
//     onAssign: (userId: string) => void;
//     onAddTag: (tagId: string) => void;
//     onRemoveTag: (tagId: string) => void;
//     onClose?: () => void;
//     // Optional callback to notify parent about conversation changes (e.g., after toggling bot/resolved)
//     onConversationUpdate?: (updatedConversation: WhatsAppConversation) => void;
// }

// export default function ChatWindow({
//     conversation: initialConversation,
//     contact,
//     users,
//     allTags,
//     onUpdateStage,
//     onAssign,
//     onAddTag,
//     onRemoveTag,
//     onClose,
//     onConversationUpdate,
// }: Props) {
//     // Local state for conversation to allow optimistic updates
//     const [conversation, setConversation] = useState<WhatsAppConversation | null>(initialConversation);
//     const { messages, loading, markRead } = useMessages(conversation?.id || null);
//     const { notes, addNote } = useNotes(conversation?.id || null);
//     const { sendTextMessage, sendTemplate } = useSendMessage();
//     const { templates } = useTemplates();
//     const endRef = useRef<HTMLDivElement>(null);
//     const [flowStepCount, setFlowStepCount] = useState<number | null>(null);

//     // Sync local conversation when prop changes
//     useEffect(() => {
//         setConversation(initialConversation);
//     }, [initialConversation]);

//     // Scroll to bottom on new messages
//     useEffect(() => {
//         endRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     // Mark conversation as read when opened
//     useEffect(() => {
//         if (conversation) markRead();
//     }, [conversation?.id]);

//     // Fetch flow step count from mock data
//     useEffect(() => {
//         if (!conversation?.flow_id) {
//             setFlowStepCount(null);
//             return;
//         }
//         const flow = MOCK_FLOWS.find(f => f.id === conversation.flow_id);
//         const stepCount = flow?.steps?.length || 0;
//         setFlowStepCount(stepCount);
//     }, [conversation?.flow_id]);

//     const handleSendText = async (text: string) => {
//         if (!conversation || !contact) return;
//         await sendTextMessage(conversation.id, contact.id, contact.phone, text);
//     };

//     const handleSendTemplate = async (templateName: string, vars: string[]) => {
//         if (!conversation || !contact) return;
//         await sendTemplate(conversation.id, contact.id, contact.phone, templateName, vars);
//     };

//     // Toggle bot active – update local state and notify parent
//     const toggleBotActive = async () => {
//         if (!conversation) return;
//         const updated = { ...conversation, bot_active: !conversation.bot_active };
//         setConversation(updated);
//         if (onConversationUpdate) onConversationUpdate(updated);
//         // Simulate API delay
//         await new Promise(resolve => setTimeout(resolve, 200));
//     };

//     // Toggle resolved status – update local state and notify parent
//     const toggleResolved = async () => {
//         if (!conversation) return;
//         const newStatus = conversation.status === 'resolved' ? 'open' : 'resolved';
//         const updated = { ...conversation, status: newStatus };
//         setConversation(updated);
//         if (onConversationUpdate) onConversationUpdate(updated);
//         await new Promise(resolve => setTimeout(resolve, 200));
//     };

//     // Update contact notes (calls the parent's onUpdateNotes? The original used supabase directly,
//     // but we already have onUpdateNotes passed down to ContactInfo. However, the parent component
//     // (InboxPage) does not pass onUpdateNotes. In the original, this function was called from
//     // ContactInfo via onUpdateNotes prop. We'll keep the same pattern: we'll define a handler
//     // that simulates the update and calls the parent if needed, but since the parent doesn't have
//     // a refresh mechanism, we'll just simulate and rely on local state.
//     // Actually, ContactInfo already receives onUpdateNotes as a prop; the parent (InboxPage) passes it.
//     // But in the original ChatWindow, it defines handleUpdateNotes and passes it to ContactInfo.
//     // We'll keep that but replace supabase with a simulated delay and assume the parent will refresh.
//     // For simplicity, we'll just simulate and do nothing else – the parent will re-fetch eventually.
//     const handleUpdateNotes = async (updatedNotes: string) => {
//         if (!contact) return;
//         await new Promise(resolve => setTimeout(resolve, 300));
//         // In a real app, you would update the contact in the parent state or via a callback.
//         // Since we don't have a direct way, we'll rely on the parent's refresh (if any).
//         // For now, we'll just log or ignore – the notes are not stored in the contact object in this mock.
//         console.log('Notes updated:', updatedNotes);
//     };

//     if (!conversation || !contact) {
//         return (
//             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
//                 <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                     <PhoneCall size={28} className="text-gray-400" />
//                 </div>
//                 <p className="text-lg font-medium text-gray-500">Select a conversation</p>
//                 <p className="text-sm text-gray-400 mt-1">Choose from the list to start messaging</p>
//             </div>
//         );
//     }

//     const showBotProgress =
//         conversation.bot_active &&
//         conversation.flow_id &&
//         flowStepCount !== null &&
//         flowStepCount > 0;

//     const botProgressPercent = showBotProgress
//         ? Math.min(100, Math.round(((conversation.current_step_index + 1) / flowStepCount) * 100))
//         : 0;

//     let lastDate = '';
//     const messagesWithSeparators = messages.map((msg) => {
//         const msgDate = formatDate(msg.timestamp);
//         const showSeparator = msgDate !== lastDate;
//         lastDate = msgDate;
//         return { msg, showSeparator, dateLabel: msgDate };
//     });

//     return (
//         <div className="flex flex-1 min-w-0 h-full">
//             <div className="flex flex-col flex-1 min-w-0 h-full">
//                 <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
//                     {onClose && (
//                         <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
//                             <ArrowLeft size={18} />
//                         </button>
//                     )}

//                     <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
//                         {contact.name?.charAt(0)?.toUpperCase() || '?'}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                         <h3 className="font-semibold text-gray-900 text-sm truncate">{contact.name}</h3>
//                         <p className="text-xs text-gray-400 truncate">{contact.phone}</p>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={toggleBotActive}
//                             title={conversation.bot_active ? 'Disable Bot' : 'Enable Bot'}
//                             className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.bot_active
//                                     ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
//                                     : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
//                                 }`}
//                         >
//                             {conversation.bot_active ? <Bot size={15} /> : <BotMessageSquare size={15} />}
//                             <span className="hidden lg:inline text-xs font-medium">
//                                 {conversation.bot_active ? 'Bot On' : 'Bot Off'}
//                             </span>
//                         </button>

//                         <button
//                             onClick={toggleResolved}
//                             title={conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
//                             className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.status === 'resolved'
//                                     ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
//                                     : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
//                                 }`}
//                         >
//                             {conversation.status === 'resolved' ? <Clock size={15} /> : <CheckCircle size={15} />}
//                             <span className="hidden lg:inline text-xs font-medium">
//                                 {conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
//                             </span>
//                         </button>
//                     </div>
//                 </div>

//                 {showBotProgress && (
//                     <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
//                         <Activity size={13} className="text-blue-500 shrink-0" />
//                         <div className="flex-1 min-w-0">
//                             <div className="flex items-center justify-between mb-1">
//                                 <span className="text-xs text-blue-700 font-medium">Bot Flow Active</span>
//                                 <span className="text-xs text-blue-500">
//                                     Step {conversation.current_step_index + 1} / {flowStepCount}
//                                 </span>
//                             </div>
//                             <div className="w-full bg-blue-200 rounded-full h-1">
//                                 <div
//                                     className="bg-blue-500 h-1 rounded-full transition-all duration-500"
//                                     style={{ width: `${botProgressPercent}%` }}
//                                 />
//                             </div>
//                         </div>
//                         <ChevronRight size={13} className="text-blue-400 shrink-0" />
//                     </div>
//                 )}

//                 <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-0.5">
//                     {loading ? (
//                         <div className="flex items-center justify-center h-full">
//                             <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//                         </div>
//                     ) : messages.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
//                             <p className="text-sm">No messages yet</p>
//                         </div>
//                     ) : (
//                         messagesWithSeparators.map(({ msg, showSeparator, dateLabel }) => (
//                             <MessageBubble
//                                 key={msg.id}
//                                 message={msg}
//                                 showDateSeparator={showSeparator}
//                                 dateSeparatorLabel={dateLabel}
//                             />
//                         ))
//                     )}
//                     <div ref={endRef} />
//                 </div>

//                 <ChatInput
//                     templates={templates}
//                     onSendText={handleSendText}
//                     onSendTemplate={handleSendTemplate}
//                     disabled={conversation.status === 'resolved'}
//                 />
//             </div>

//             <div className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden xl:block">
//                 <ContactInfo
//                     contact={contact}
//                     users={users}
//                     allTags={allTags}
//                     onUpdateStage={onUpdateStage}
//                     onAssign={onAssign}
//                     onAddTag={onAddTag}
//                     onRemoveTag={onRemoveTag}
//                     onUpdateNotes={handleUpdateNotes}
//                     conversationNotes={notes}
//                     onAddNote={addNote}
//                 />
//             </div>
//         </div>
//     );
// }



// import { useEffect, useRef, useState } from 'react';
// import { Bot, CheckCircle, Clock, PhoneCall, ArrowLeft, ChevronRight, Activity, BotMessageSquare } from 'lucide-react';
// import type { WhatsAppConversation, WhatsAppContact, Tag, CrmUser, WhatsAppMessage, ConversationNote } from '../../types';
// import { whatsappAPI } from '@/lib/whatsappApi';
// import { formatDate } from '../../lib/formatters';
// import { notificationStore } from '../../lib/notifications';
// import MessageBubble from './MessageBubble';
// import ChatInput from './ChatInput';
// import ContactInfo from './ContactInfo';

// interface Props {
//     conversation: WhatsAppConversation | null;
//     contact: WhatsAppContact | null;
//     users: CrmUser[];
//     allTags: Tag[];
//     onUpdateStage: (stage: string) => void;
//     onAssign: (userId: string) => void;
//     onAddTag: (tagId: string) => void;
//     onRemoveTag: (tagId: string) => void;
//     onClose?: () => void;
//     onConversationUpdate?: (updatedConversation: WhatsAppConversation) => void;
// }

// export default function ChatWindow({
//     conversation: initialConversation,
//     contact,
//     users,
//     allTags,
//     onUpdateStage,
//     onAssign,
//     onAddTag,
//     onRemoveTag,
//     onClose,
//     onConversationUpdate,
// }: Props) {
//     const [conversation, setConversation] = useState<WhatsAppConversation | null>(initialConversation);
//     const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
//     const [notes, setNotes] = useState<ConversationNote[]>([]);
//     const [templates, setTemplates] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [flowStepCount, setFlowStepCount] = useState<number | null>(null);
//     const endRef = useRef<HTMLDivElement>(null);

//     // Sync conversation from props
//     useEffect(() => {
//         setConversation(initialConversation);
//     }, [initialConversation]);

//     // Fetch messages when conversation changes
//     useEffect(() => {
//         if (!conversation || !contact) {
//             setMessages([]);
//             return;
//         }
//         const fetchMessages = async () => {
//             setLoading(true);
//             try {
//                 // Try fetching by conversation.id first
//                 let msgs = await whatsappAPI.getMessages(conversation.id);
//                 console.log('Messages by conversation.id:', msgs);

//                 // If empty, try by contact.id (some APIs use contact ID)
//                 if (!msgs || msgs.length === 0) {
//                     msgs = await whatsappAPI.getMessages(contact.id);
//                     console.log('Messages by contact.id:', msgs);
//                 }

//                 // Normalise each message to match MessageBubble expectations
//                 const normalised:any = (msgs || []).map((msg: any) => ({
//                     id: msg.id || Math.random().toString(),
//                     direction: msg.direction || (msg.from === contact.phone ? 'inbound' : 'outbound'),
//                     text: msg.text || msg.body || '',
//                     timestamp: msg.timestamp || msg.created_at || msg.sent_at || new Date().toISOString(),
//                     status: msg.status || 'delivered',
//                     sender: msg.sender || null,
//                 })).filter(msg => msg.text); // ignore empty messages

//                 setMessages(normalised);

//                 // Mark conversation as read (if API supports)
//                 // if (whatsappAPI.markConversationRead) {
//                     // await whatsappAPI.markConversationRead(conversation.id);
//                 // }
//             } catch (err) {
//                 console.error('Failed to fetch messages', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchMessages();

       
//     }, [conversation?.id, contact]);

//     // Fetch notes for this conversation
//     useEffect(() => {
//         if (!conversation) {
//             setNotes([]);
//             return;
//         }
//         const fetchNotes = async () => {
//             try {
//                 // const notesData = await whatsappAPI.getNotes(conversation.id);
//                 // setNotes(notesData);
//             } catch (err) {
//                 console.error('Failed to fetch notes', err);
//             }
//         };
//         fetchNotes();
//     }, [conversation?.id]);

//     // Fetch templates for the chat input
//     useEffect(() => {
//         const fetchTemplates = async () => {
//             try {
//                 const tpls = await whatsappAPI.getTemplates();
//                 setTemplates(tpls);
//             } catch (err) {
//                 console.error('Failed to fetch templates', err);
//             }
//         };
//         fetchTemplates();
//     }, []);

//     // Scroll to bottom when messages change
//     useEffect(() => {
//         endRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     // Get flow step count (if needed)
//     useEffect(() => {
//         if (!conversation?.flow_id) {
//             setFlowStepCount(null);
//             return;
//         }
//         const fetchFlowSteps = async () => {
//             try {
//                 // const steps = await whatsappAPI.getFlowSteps(conversation.flow_id);
//                 // setFlowStepCount(steps.length);
//             } catch (err) {
//                 console.error('Failed to fetch flow steps', err);
//             }
//         };
//         fetchFlowSteps();
//     }, [conversation?.flow_id]);

//     const handleSendText = async (text: string) => {
//         if (!conversation || !contact) return;
//         try {
//             const newMsg = await whatsappAPI.sendMessage({ contact_id: contact.id, text });
//             // Normalise the new message
//             const normalisedMsg:any = {
//                 id: newMsg.id || Date.now().toString(),
//                 direction: 'out',
//                 text: newMsg.text || newMsg.body || text,
//                 timestamp: newMsg.timestamp || newMsg.created_at || newMsg.sent_at || new Date().toISOString(),
//                 status: newMsg.status || 'sent',
//                 sender: newMsg.sender || null,
//             };
//             setMessages(prev => [...prev, normalisedMsg]);
//             notificationStore.push('message', 'Message Sent', `Sent to ${contact.name}`, {label:"",page:""});
//         } catch (err) {
//             console.error('Failed to send message', err);
//             notificationStore.push('error', 'Send Failed', 'Could not send message. Try again.', { label: "", page: "" });
//         }
//     };

//     const handleSendTemplate = async (templateName: string, vars: string[]) => {
//         if (!conversation || !contact) return;
//         try {
//             // const newMsg = await whatsappAPI.sendTemplate({
//             //     contact_id: contact.id,
//             //     template_name: templateName,
//             //     variables: vars,
//             // });
//             // const normalisedMsg = {
//             //     id: newMsg.id || Date.now().toString(),
//             //     direction: 'outbound',
//             //     text: newMsg.text || newMsg.body || `Template: ${templateName}`,
//             //     timestamp: newMsg.timestamp || newMsg.created_at || newMsg.sent_at || new Date().toISOString(),
//             //     status: newMsg.status || 'sent',
//             //     sender: newMsg.sender || null,
//             // };
//             // setMessages(prev => [...prev, normalisedMsg]);
//             notificationStore.push('message', 'Template Sent', `Template "${templateName}" sent to ${contact.name}`, { label: "", page: "" });
//         } catch (err) {
//             console.error('Failed to send template', err);
//             notificationStore.push('error', 'Send Failed', 'Could not send template. Try again.', { label: "", page: "" });
//         }
//     };

//     const toggleBotActive = async () => {
//         if (!conversation) return;
//         const updated = { ...conversation, bot_active: !conversation.bot_active };
//         try {
//             // await whatsappAPI.updateConversation(conversation.id, { bot_active: updated.bot_active });
//             setConversation(updated);
//             onConversationUpdate?.(updated);
//         } catch (err) {
//             console.error('Failed to toggle bot', err);
//             notificationStore.push('error', 'Update Failed', 'Could not toggle bot status.', { label: "", page: "" });
//         }
//     };

//     const toggleResolved = async () => {
//         if (!conversation) return;
//         const newStatus = conversation.status === 'resolved' ? 'open' : 'resolved';
//         const updated:any = { ...conversation, status: newStatus };
//         try {
//             // await whatsappAPI.updateConversation(conversation.id, { status: newStatus });
//             setConversation(updated);
//             onConversationUpdate?.(updated);
//         } catch (err) {
//             console.error('Failed to toggle resolved', err);
//             notificationStore.push('error', 'Update Failed', 'Could not change conversation status.', { label: "", page: "" });
//         }
//     };

//     const handleAddNote = async (body: string) => {
//         if (!conversation) return;
//         try {
//             const newNote = await whatsappAPI.addNote(conversation.id, body);
//             setNotes(prev => [...prev, newNote]);
//         } catch (err) {
//             console.error('Failed to add note', err);
//             notificationStore.push('error', 'Note Failed', 'Could not add internal note.', { label: "", page: "" });
//         }
//     };

//     if (!conversation || !contact) {
//         return (
//             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
//                 <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                     <PhoneCall size={28} className="text-gray-400" />
//                 </div>
//                 <p className="text-lg font-medium text-gray-500">Select a conversation</p>
//                 <p className="text-sm text-gray-400 mt-1">Choose from the list to start messaging</p>
//             </div>
//         );
//     }

//     const showBotProgress = conversation.bot_active && conversation.flow_id && flowStepCount !== null && flowStepCount > 0;
//     const botProgressPercent = showBotProgress
//         ? Math.min(100, Math.round(((conversation.current_step_index + 1) / flowStepCount) * 100))
//         : 0;

//     let lastDate = '';
//     const messagesWithSeparators = messages.map((msg) => {
//         const msgDate = formatDate(msg.timestamp);
//         const showSeparator = msgDate !== lastDate;
//         lastDate = msgDate;
//         return { msg, showSeparator, dateLabel: msgDate };
//     });

//     return (
//         <div className="flex flex-1 min-w-0 h-full">
//             <div className="flex flex-col flex-1 min-w-0 h-full">
//                 <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
//                     {onClose && (
//                         <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
//                             <ArrowLeft size={18} />
//                         </button>
//                     )}

//                     <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
//                         {contact.name?.charAt(0)?.toUpperCase() || '?'}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                         <h3 className="font-semibold text-gray-900 text-sm truncate">{contact.name}</h3>
//                         <p className="text-xs text-gray-400 truncate">{contact.phone}</p>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={toggleBotActive}
//                             title={conversation.bot_active ? 'Disable Bot' : 'Enable Bot'}
//                             className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.bot_active
//                                 ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
//                                 : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
//                                 }`}
//                         >
//                             {conversation.bot_active ? <Bot size={15} /> : <BotMessageSquare size={15} />}
//                             <span className="hidden lg:inline text-xs font-medium">
//                                 {conversation.bot_active ? 'Bot On' : 'Bot Off'}
//                             </span>
//                         </button>

//                         <button
//                             onClick={toggleResolved}
//                             title={conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
//                             className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.status === 'resolved'
//                                 ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
//                                 : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
//                                 }`}
//                         >
//                             {conversation.status === 'resolved' ? <Clock size={15} /> : <CheckCircle size={15} />}
//                             <span className="hidden lg:inline text-xs font-medium">
//                                 {conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
//                             </span>
//                         </button>
//                     </div>
//                 </div>

//                 {showBotProgress && (
//                     <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
//                         <Activity size={13} className="text-blue-500 shrink-0" />
//                         <div className="flex-1 min-w-0">
//                             <div className="flex items-center justify-between mb-1">
//                                 <span className="text-xs text-blue-700 font-medium">Bot Flow Active</span>
//                                 <span className="text-xs text-blue-500">
//                                     Step {conversation.current_step_index + 1} / {flowStepCount}
//                                 </span>
//                             </div>
//                             <div className="w-full bg-blue-200 rounded-full h-1">
//                                 <div
//                                     className="bg-blue-500 h-1 rounded-full transition-all duration-500"
//                                     style={{ width: `${botProgressPercent}%` }}
//                                 />
//                             </div>
//                         </div>
//                         <ChevronRight size={13} className="text-blue-400 shrink-0" />
//                     </div>
//                 )}

//                 <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-0.5">
//                     {loading ? (
//                         <div className="flex items-center justify-center h-full">
//                             <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//                         </div>
//                     ) : messages.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
//                             <p className="text-sm">No messages yet</p>
//                         </div>
//                     ) : (
//                         messagesWithSeparators.map(({ msg, showSeparator, dateLabel }) => (
//                             <MessageBubble
//                                 key={msg.id}
//                                 message={msg}
//                                 showDateSeparator={showSeparator}
//                                 dateSeparatorLabel={dateLabel}
//                             />
//                         ))
//                     )}
//                     <div ref={endRef} />
//                 </div>

//                 <ChatInput
//                     templates={templates}
//                     onSendText={handleSendText}
//                     onSendTemplate={handleSendTemplate}
//                     disabled={conversation.status === 'resolved'}
//                 />
//             </div>

//             <div className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden xl:block">
//                 <ContactInfo
//                     contact={contact}
//                     users={users}
//                     allTags={allTags}
//                     onUpdateStage={onUpdateStage}
//                     onAssign={onAssign}
//                     onAddTag={onAddTag}
//                     onRemoveTag={onRemoveTag}
//                     onUpdateNotes={async (updatedNotes) => {
//                         try {
//                             await whatsappAPI.updateContact(contact.id, { notes: updatedNotes });
//                         } catch (err) {
//                             console.error('Failed to update notes', err);
//                         }
//                     }}
//                     conversationNotes={notes}
//                     onAddNote={handleAddNote}
//                 />
//             </div>
//         </div>
//     );
// }

import { useEffect, useRef, useState } from 'react';
import { Bot, CheckCircle, Clock, PhoneCall, ArrowLeft, ChevronRight, Activity, BotMessageSquare } from 'lucide-react';
import type { WhatsAppConversation, WhatsAppContact, Tag, CrmUser, WhatsAppMessage, ConversationNote } from '../../types';
import { whatsappAPI } from '@/lib/whatsappApi';
import { formatDate } from '../../lib/formatters';
import { notificationStore } from '../../lib/notifications';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ContactInfo from './ContactInfo';

interface Props {
    conversation: WhatsAppConversation | null;
    contact: WhatsAppContact | null;
    users: CrmUser[];
    allTags: Tag[];
    onUpdateStage: (stage: string) => void;
    onAssign: (userId: string) => void;
    onAddTag: (tagId: string) => void;
    onRemoveTag: (tagId: string) => void;
    onClose?: () => void;
    onConversationUpdate?: (updatedConversation: WhatsAppConversation) => void;
}

export default function ChatWindow({
    conversation: initialConversation,
    contact,
    users,
    allTags,
    onUpdateStage,
    onAssign,
    onAddTag,
    onRemoveTag,
    onClose,
    onConversationUpdate,
}: Props) {
    const [conversation, setConversation] = useState<WhatsAppConversation | null>(initialConversation);
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const [notes, setNotes] = useState<ConversationNote[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    // Sync conversation from props
    useEffect(() => {
        setConversation(initialConversation);
    }, [initialConversation]);

    // Fetch messages when conversation changes
    useEffect(() => {
        if (!conversation || !contact) {
            setMessages([]);
            return;
        }
        const fetchMessages = async () => {
            setLoading(true);
            try {
                // Use contact.id (not conversation.id) as per your backend
                const msgs = await whatsappAPI.getMessages(contact.id);
                console.log('Messages fetched:', msgs);

                // Format messages for MessageBubble component
                const formatted:any = (msgs || []).map((msg: any) => ({
                    id: msg.id,
                    direction: msg.direction === 'out' ? 'out' : 'in',
                    text: msg.text,
                    timestamp: msg.timestamp,
                    status: msg.status,
                    sender: msg.direction === 'out' ? { name: 'You' } : null
                }));

                setMessages(formatted);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [conversation?.id, contact]);

    // Fetch templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const tpls = await whatsappAPI.getTemplates();
                setTemplates(tpls);
            } catch (err) {
                console.error('Failed to fetch templates', err);
            }
        };
        fetchTemplates();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendText = async (text: string) => {
        if (!conversation || !contact) return;
        try {
            const newMsg = await whatsappAPI.sendMessage({ contact_id: contact.id, text });
            const formattedMsg = {
                id: newMsg.id || Date.now(),
                direction: 'out',
                text: text,
                timestamp: new Date().toISOString(),
                status: 'sent',
                sender: { name: 'You' }
            };
            setMessages((prev:any) => [...prev, formattedMsg]);
            notificationStore.push('message', 'Message Sent', `Sent to ${contact.name}`, { label: "", page: "" });
        } catch (err) {
            console.error('Failed to send message', err);
            notificationStore.push('error', 'Send Failed', 'Could not send message. Try again.', { label: "", page: "" });
        }
    };

    const handleSendTemplate = async (templateName: string, vars: string[]) => {
        // Will implement when backend supports templates
        notificationStore.push('info', 'Coming Soon', 'Template feature will be available soon', { label: "", page: "" });
    };

    const toggleBotActive = async () => {
        if (!conversation) return;
        const updated = { ...conversation, bot_active: !conversation.bot_active };
        setConversation(updated);
        onConversationUpdate?.(updated);
    };

    const toggleResolved = async () => {
        if (!conversation) return;
        const newStatus = conversation.status === 'resolved' ? 'open' : 'resolved';
        const updated:any = { ...conversation, status: newStatus };
        setConversation(updated);
        onConversationUpdate?.(updated);
    };

    const handleAddNote = async (body: string) => {
        if (!contact) return;
        try {
            await whatsappAPI.addNote(contact.id, body);
            setNotes((prev:any) => [...prev, { id: Date.now(), body, created_at: new Date().toISOString() }]);
            notificationStore.push('success', 'Note Added', 'Internal note saved', { label: "", page: "" });
        } catch (err) {
            console.error('Failed to add note', err);
            notificationStore.push('error', 'Note Failed', 'Could not add internal note.', {label:"",page:""});
        }
    };

    if (!conversation || !contact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <PhoneCall size={28} className="text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-500">Select a conversation</p>
                <p className="text-sm text-gray-400 mt-1">Choose from the list to start messaging</p>
            </div>
        );
    }

    let lastDate = '';
    const messagesWithSeparators = messages.map((msg) => {
        const msgDate = formatDate(msg.timestamp);
        console.log(msgDate,lastDate)
        const showSeparator = msgDate !== lastDate;
        lastDate = msgDate;
        console.log("debug : ",showSeparator,msgDate,msg)
        return { msg, showSeparator, dateLabel: msgDate };
    });

    return (
        <div className="flex flex-1 min-w-0 h-full">
            <div className="flex flex-col flex-1 min-w-0 h-full">
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
                    {onClose && (
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                            <ArrowLeft size={18} />
                        </button>
                    )}

                    <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {contact.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{contact.name}</h3>
                        <p className="text-xs text-gray-400 truncate">{contact.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleBotActive}
                            title={conversation.bot_active ? 'Disable Bot' : 'Enable Bot'}
                            className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.bot_active
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {conversation.bot_active ? <Bot size={15} /> : <BotMessageSquare size={15} />}
                            <span className="hidden lg:inline text-xs font-medium">
                                {conversation.bot_active ? 'Bot On' : 'Bot Off'}
                            </span>
                        </button>

                        <button
                            onClick={toggleResolved}
                            title={conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
                            className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {conversation.status === 'resolved' ? <Clock size={15} /> : <CheckCircle size={15} />}
                            <span className="hidden lg:inline text-xs font-medium">
                                {conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-0.5">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p className="text-sm">No messages yet</p>
                        </div>
                    ) : (
                        messagesWithSeparators.map(({ msg, showSeparator, dateLabel }) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                showDateSeparator={showSeparator}
                                dateSeparatorLabel={dateLabel}
                            />
                        ))
                    )}
                    <div ref={endRef} />
                </div>

                <ChatInput
                    templates={templates}
                    onSendText={handleSendText}
                    onSendTemplate={handleSendTemplate}
                    disabled={conversation.status === 'resolved'}
                />
            </div>

            <div className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden xl:block">
                <ContactInfo
                    contact={contact}
                    users={users}
                    allTags={allTags}
                    onUpdateStage={onUpdateStage}
                    onAssign={onAssign}
                    onAddTag={onAddTag}
                    onRemoveTag={onRemoveTag}
                    onUpdateNotes={async (updatedNotes) => {
                        try {
                            await whatsappAPI.updateContact(contact.id, { notes: updatedNotes });
                        } catch (err) {
                            console.error('Failed to update notes', err);
                        }
                    }}
                    conversationNotes={notes}
                    onAddNote={handleAddNote}
                />
            </div>
        </div>
    );
}