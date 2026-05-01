// import { useEffect, useRef, useState } from 'react';
// import { Bot, CheckCircle, Clock, PhoneCall, ArrowLeft, ChevronRight, Activity, BotMessageSquare } from 'lucide-react';
// import type { WhatsAppConversation, WhatsAppContact, Tag, CrmUser, WhatsAppMessage, ConversationNote } from '../../types';
// import { whatsappAPI } from '@/lib/whatsappApi';
// import { formatDate } from '../../lib/formatters';
// import { notificationStore } from '../../lib/notifications';
// import MessageBubble from './MessageBubble';
// import ChatInput from './ChatInput';
// import ContactInfo from './ContactInfo';
// import { useAuth } from '@/contexts/AuthContext';

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
//     const endRef = useRef<HTMLDivElement>(null);
//     const { user } = useAuth()

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
//                 // Use contact.id (not conversation.id) as per your backend
//                 const msgs = await whatsappAPI.getMessages(contact.id);
//                 console.log('Messages fetched:', msgs);

//                 // Format messages for MessageBubble component
//                 const formatted:any = (msgs || []).map((msg: any) => ({
//                     id: msg.id,
//                     direction: msg.direction === 'out' ? 'out' : 'in',
//                     text: msg.text,
//                     timestamp: msg.timestamp,
//                     status: msg.status,
//                     sender: msg.direction === 'out' ? { name: 'You' } : null
//                 }));

//                 setMessages(formatted);
//             } catch (err) {
//                 console.error('Failed to fetch messages', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchMessages();
//     }, [conversation?.id, contact]);

//     // Fetch templates on mount
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

//     const handleSendText = async (text: string) => {
//         if (!conversation || !contact) return;
//         try {
//             const newMsg:any = await whatsappAPI.sendMessage({ contact_id: contact.id, text });
//             const formattedMsg = {
//                 id: newMsg.id || Date.now(),
//                 direction: 'out',
//                 text: text,
//                 timestamp: new Date().toISOString(),
//                 status: 'sent',
//                 sender: { name: 'You' }
//             };
//             setMessages((prev:any) => [...prev, formattedMsg]);
//             notificationStore.push('message', 'Message Sent', `Sent to ${contact.name}`, { label: "", page: "" });
//         } catch (err) {
//             console.error('Failed to send message', err);
//             notificationStore.push('error', 'Send Failed', 'Could not send message. Try again.', { label: "", page: "" });
//         }
//     };

//     const handleSendTemplate = async (templateName: string, vars: string[]) => {
//         // Will implement when backend supports templates
//         notificationStore.push('info', 'Coming Soon', 'Template feature will be available soon', { label: "", page: "" });
//     };

//     const toggleBotActive = async () => {
//         if (!conversation) return;
//         const updated = { ...conversation, bot_active: !conversation.bot_active };
//         setConversation(updated);
//         onConversationUpdate?.(updated);
//     };

//     const toggleResolved = async () => {
//         if (!conversation) return;
//         const newStatus = conversation.status === 'resolved' ? 'open' : 'resolved';
//         const updated:any = { ...conversation, status: newStatus };
//         setConversation(updated);
//         onConversationUpdate?.(updated);
//     };

//     const fetchAllNotes = async () => {
//         console.log("firlksafjkdjflksdjflksjdflsjdflkst", contact)
//         if (!contact) return;
//         try {
//             const notes: any = await whatsappAPI.getContactNotes(contact.id);
//             console.log("notes for contact : ", notes)
//             setNotes(notes);
//         } catch (err) {
//             console.error('Failed to fetch notes', err);
//         }
//     };



//     useEffect(() => {
//         fetchAllNotes()
//     }, [contact]);



//     const handleAddNote = async (body: any) => {
//         if (!contact) return;
//         try {
//             await whatsappAPI.addNote(contact.id, user.id, body);
//             setNotes((prev:any) => [...prev, { id: Date.now(), body, created_at: new Date().toISOString() }]);
//             notificationStore.push('success', 'Note Added', 'Internal note saved', { label: "", page: "" });
//         } catch (err) {
//             console.error('Failed to add note', err);
//             notificationStore.push('error', 'Note Failed', 'Could not add internal note.', {label:"",page:""});
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

//     let lastDate = '';
//     const messagesWithSeparators = messages.map((msg) => {
//         const msgDate = formatDate(msg.timestamp);
//         console.log(msgDate,lastDate)
//         const showSeparator = msgDate !== lastDate;
//         lastDate = msgDate;
//         console.log("debug : ",showSeparator,msgDate,msg)
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
//                     fetchAllNotes={fetchAllNotes}
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
import { useAuth } from '@/contexts/AuthContext';

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
    const { user } = useAuth()

    // Sync conversation from props
    useEffect(() => {
        setConversation(initialConversation);
    }, [initialConversation]);

    // ✅ Mark messages as read when chat window opens
    useEffect(() => {
        if (!conversation || !contact) return;

        const markAsRead = async () => {
            try {
                await whatsappAPI.markMessagesAsRead(contact.id);
                console.log("✅ Messages marked as read for contact:", contact.id);

                // Update local messages to mark them as read
                setMessages(prev => prev.map(msg =>
                    msg.direction === 'in' ? { ...msg, is_read: true } : msg
                ));

                // Update conversation unread count in parent
                if (onConversationUpdate) {
                    onConversationUpdate({ ...conversation, unread_count: 0 });
                }
            } catch (err) {
                console.error("Failed to mark messages as read:", err);
            }
        };

        markAsRead();
    }, [conversation?.id, contact?.id]);

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
                const formatted: any = (msgs || []).map((msg: any) => ({
                    id: msg.id,
                    direction: msg.direction === 'out' ? 'out' : 'in',
                    text: msg.text,
                    timestamp: msg.time_sent || msg.timestamp,
                    status: msg.status,
                    is_read: msg.is_read || false,
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
            const newMsg: any = await whatsappAPI.sendMessage({ contact_id: contact.id, text });
            const formattedMsg = {
                id: newMsg.id || Date.now(),
                direction: 'out',
                text: text,
                timestamp: new Date().toISOString(),
                status: 'sent',
                is_read: true,
                sender: { name: 'You' }
            };
            setMessages((prev: any) => [...prev, formattedMsg]);
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
        const updated: any = { ...conversation, status: newStatus };
        setConversation(updated);
        onConversationUpdate?.(updated);
    };

    const fetchAllNotes = async () => {
        if (!contact) return;
        try {
            const notesData: any = await whatsappAPI.getContactNotes(contact.id);
            setNotes(notesData);
        } catch (err) {
            console.error('Failed to fetch notes', err);
        }
    };

    useEffect(() => {
        fetchAllNotes()
    }, [contact]);

    const handleAddNote = async (body: any) => {
        if (!contact) return;
        try {
            await whatsappAPI.addNote(contact.id, user?.id, body);
            await fetchAllNotes(); // Refresh notes after adding
            notificationStore.push('success', 'Note Added', 'Internal note saved', { label: "", page: "" });
        } catch (err) {
            console.error('Failed to add note', err);
            notificationStore.push('error', 'Note Failed', 'Could not add internal note.', { label: "", page: "" });
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
        const showSeparator = msgDate !== lastDate;
        lastDate = msgDate;
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
                    fetchAllNotes={fetchAllNotes}
                />
            </div>
        </div>
    );
}