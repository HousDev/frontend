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
// import { connectSocket } from "@/lib/socket";

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
//     onContactInfoOpen?: () => void;
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
//        onContactInfoOpen,
//     onConversationUpdate,
// }: Props) {
//     const [conversation, setConversation] = useState<WhatsAppConversation | null>(initialConversation);
//     const [messages, setMessages] = useState<any[]>([]);
//     const [notes, setNotes] = useState<ConversationNote[]>([]);
//     const [templates, setTemplates] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const endRef = useRef<HTMLDivElement>(null);
//     const { user } = useAuth()

//     // Sync conversation from props
//     useEffect(() => {
//         setConversation(initialConversation);
//     }, [initialConversation]);

//     useEffect(() => {
//         if (!contact) return;

//         const userId = localStorage.getItem("user")
//             ? JSON.parse(localStorage.getItem("user"))?.id
//             : null;

//         if (!userId) return;

//         const socket = connectSocket(userId);

//         const handleNewMessage = (data: any) => {
//             console.log("🔥 NEW MESSAGE:", data);

//             if (data.contact_id !== contact.id) return;

//             const newMsg = {
//                 id: Date.now(),
//                 direction: 'in',
//                 text: data.text,
//                 timestamp: new Date().toISOString(),
//                 status: 'delivered',
//                 is_read: false,
//             };

//             setMessages((prev) => [...prev, newMsg]);
//         };

//         socket.on("chat_update", handleNewMessage);

//         return () => {
//             socket.off("chat_update", handleNewMessage);
//         };
//     }, [contact]);
//     // ✅ Mark messages as read when chat window opens
//     useEffect(() => {
//         if (!conversation || !contact) return;

//         const markAsRead = async () => {
//             try {
//                 await whatsappAPI.markMessagesAsRead(contact.id);
//                 console.log("✅ Messages marked as read for contact:", contact.id);

//                 // Update local messages to mark them as read
//                 setMessages(prev => prev.map(msg =>
//                     msg.direction === 'in' ? { ...msg, is_read: true } : msg
//                 ));

//                 // Update conversation unread count in parent
//                 if (onConversationUpdate) {
//                     onConversationUpdate({ ...conversation, unread_count: 0 });
//                 }
//             } catch (err) {
//                 console.error("Failed to mark messages as read:", err);
//             }
//         };

//         markAsRead();
//     }, [conversation?.id, contact?.id]);

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
//                 const formatted: any = (msgs || []).map((msg: any) => ({
//                     id: msg.id,
//                     direction: msg.direction === 'out' ? 'out' : 'in',
//                     text: msg.text,
//                     timestamp: msg.time_sent || msg.timestamp,
//                     status: msg.status,
//                     is_read: msg.is_read || false,
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
//     if (!conversation || !contact) return;
//     try {
//         const newMsg: any = await whatsappAPI.sendMessage({ contact_id: contact.id, text });

//         const formattedMsg = {
//             id: newMsg.id || Date.now(),
//             direction: 'out',
//             text: text,
//             timestamp: new Date().toISOString(),
//             status: 'sent',
//             is_read: true,
//             sender: { name: 'You' }
//         };

//         setMessages((prev: any) => [...prev, formattedMsg]);

//         // ✅ ADD THIS (only here, nowhere else)
//         notificationStore.push(
//             'message',
//             'Message Sent',
//             `Sent to ${contact.name}`,
//             { label: "", page: "" }
//         );

//     } catch (err) {
//         console.error('Failed to send message', err);

//         notificationStore.push(
//             'error',
//             'Send Failed',
//             'Could not send message. Try again.',
//             { label: "", page: "" }
//         );
//     }
// };

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
//         const updated: any = { ...conversation, status: newStatus };
//         setConversation(updated);
//         onConversationUpdate?.(updated);
//     };

//     const fetchAllNotes = async () => {
//         if (!contact) return;
//         try {
//             const notesData: any = await whatsappAPI.getContactNotes(contact.id);
//             setNotes(notesData);
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
//             await whatsappAPI.addNote(contact.id, user?.id, body);
//             await fetchAllNotes(); // Refresh notes after adding
//             notificationStore.push('success', 'Note Added', 'Internal note saved', { label: "", page: "" });
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
// <div className="flex items-center gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-white border-b border-gray-200 shrink-0">                    {onClose && (
//                        <button
//   onClick={onClose}
//   className="p-1 -ml-1 sm:ml-0 rounded-lg hover:bg-gray-100 text-gray-500"
// >
//   <ArrowLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
// </button>
//                     )}

//                    <button
//     onClick={() => onContactInfoOpen?.()}
// className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0 xl:cursor-default"
//  title="View contact info"
// >
//     {contact.name?.charAt(0)?.toUpperCase() || '?'}
// </button>

//                     <div className="flex-1 min-w-0">
//                         <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words sm:truncate">{contact.name}</h3>
//                         <p className="text-[11px] sm:text-xs text-gray-400 truncate">{contact.phone}</p>
//                     </div>

// <div className="flex items-center gap-1 sm:gap-2">                        <button
//                             onClick={toggleBotActive}
//                             title={conversation.bot_active ? 'Disable Bot' : 'Enable Bot'}
//                             className={`p-1.5 sm:p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.bot_active
//                                 ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
//                                 : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
//                                 }`}
//                         >
//                             {conversation.bot_active ? <Bot className="w-4 h-4 sm:w-[15px] sm:h-[15px]" /> : <BotMessageSquare size={15} />}
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

// <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-4 bg-gray-50 space-y-0.5 max-h-[calc(100vh-140px)] sm:max-h-none">                    {loading ? (
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
import { Bot, CheckCircle, Clock, PhoneCall, ArrowLeft, BotMessageSquare } from 'lucide-react';
import type { WhatsAppConversation, WhatsAppContact, Tag, CrmUser, WhatsAppMessage, ConversationNote } from '../../types';
import { whatsappAPI } from '@/lib/whatsappApi';
import { formatDate } from '../../lib/formatters';
import { notificationStore } from '../../lib/notifications';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ContactInfo from './ContactInfo';
import { useAuth } from '@/contexts/AuthContext';
import { connectSocket } from "@/lib/socket";

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
    onContactInfoOpen?: () => void;
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
    onContactInfoOpen,
    onConversationUpdate,
}: Props) {
    const [conversation, setConversation] = useState<WhatsAppConversation | null>(initialConversation);
    const [messages, setMessages] = useState<any[]>([]);
    const [notes, setNotes] = useState<ConversationNote[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);
    const { user } = useAuth();

    // ✅ Track sent messages to prevent duplicates
    const sentMessagesRef = useRef<Set<string>>(new Set());

    // Sync conversation from props
    useEffect(() => {
        setConversation(initialConversation);
    }, [initialConversation]);

    // ✅ Socket.IO Connection for Real-time Chat
    useEffect(() => {
        if (!contact) return;

        const userId = localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user"))?.id
            : null;

        if (!userId) {
            console.error("❌ No userId found for socket connection");
            return;
        }

        console.log("🔌 [Step 1] Connecting socket for userId:", userId);

        const socket = connectSocket(userId);
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("✅ [Step 2] Socket connected successfully, id:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("❌ [Step 3] Socket disconnected");
        });

        console.log("🔌 [Step 4] Joining contact room:", contact.id);
        socket.emit("join_contact_room", contact.id);

        // Listen for new messages
        const handleNewMessage = (data: any) => {
            console.log("📨 [Step 6] NEW MESSAGE EVENT RECEIVED:", data);

            // ✅ Skip if this is my own message (from socket broadcast)
            if (data.isOwnMessage === true) {
                console.log("⚠️ [Step 7] Skipping own message from socket");
                return;
            }

            // ✅ Check if this message was just sent by us
            const messageKey = `${data.contact_id}_${data.text}_${data.timestamp}`;
            if (sentMessagesRef.current.has(messageKey)) {
                console.log("⚠️ [Step 7.5] Skipping message we just sent");
                return;
            }

            if (data.contact_id !== contact.id) {
                console.log(`⚠️ [Step 8] Message for different contact: ${data.contact_id} !== ${contact.id}`);
                return;
            }

            console.log("✅ [Step 9] Message belongs to current contact, updating UI...");
            // ✅ Show notification only for received messages
            if (String(data.direction).trim().toLowerCase() === "in") {

                console.log("🔥 PUSHING NOTIFICATION");

                notificationStore.push(
                    "message",
                    `New Message from ${contact?.name || "Customer"}`,
                    data.text || "You received a new message",
                    {
                        label: "Open Chat",
                        page: "/whatsapp"
                    }
                );

            }
            const newMsg = {
                id: data.message_id || Date.now(),
                direction: data.direction || 'in',
                text: data.text,
                timestamp: data.timestamp || new Date().toISOString(),
                status: data.status || 'delivered',
                is_read: false,
                sender: data.direction === 'out' ? { name: 'You' } : null
            };

            // ✅ Check for duplicate before adding
            setMessages((prev) => {
                const exists = prev.some(m => m.id === newMsg.id || (m.text === newMsg.text && Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 1000));
                if (exists) {
                    console.log("⚠️ [Step 10] Duplicate message, skipping");
                    return prev;
                }
                console.log(`✅ [Step 11] Adding new message, total: ${prev.length + 1}`);
                return [...prev, newMsg];
            });

            // Auto mark as read
            whatsappAPI.markMessagesAsRead(contact.id).catch(console.error);

            // Update conversation
            if (onConversationUpdate && conversation) {
                onConversationUpdate({
                    ...conversation,
                    last_message: data.text,
                    last_message_at: new Date().toISOString(),
                    unread_count: 0
                });
            }
        };

        socket.on("chat_update", handleNewMessage);
        console.log("👂 [Step 12] Listening for 'chat_update' events");

        return () => {
            console.log("🧹 [Step 13] Cleaning up socket for contact:", contact.id);
            if (socket) {
                socket.emit("leave_contact_room", contact.id);
                socket.off("chat_update", handleNewMessage);
                socket.off("connect");
                socket.off("disconnect");
            }
        };
    }, [contact?.id]);

    // ✅ Mark messages as read when chat window opens
    useEffect(() => {
        if (!conversation || !contact) return;

        const markAsRead = async () => {
            try {
                await whatsappAPI.markMessagesAsRead(contact.id);
                console.log("✅ Messages marked as read for contact:", contact.id);

                setMessages(prev => prev.map(msg =>
                    msg.direction === 'in' ? { ...msg, is_read: true } : msg
                ));

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
                const msgs = await whatsappAPI.getMessages(contact.id);
                console.log('Messages fetched:', msgs?.length || 0);

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
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Fetch notes
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
        fetchAllNotes();
    }, [contact]);

    // ✅ Handle send text message - FIXED DUPLICATE ISSUE
    const handleSendText = async (text: string) => {
        if (!conversation || !contact) return;

        // ✅ Create unique key for this message to prevent duplicates
        const messageKey = `${contact.id}_${text}_${Date.now()}`;

        // ✅ Prevent duplicate sends
        if (sentMessagesRef.current.has(messageKey)) {
            console.log("⚠️ Duplicate send prevented for:", messageKey);
            return;
        }

        sentMessagesRef.current.add(messageKey);

        const tempId = `temp_${Date.now()}_${Math.random()}`;

        const formattedMsg = {
            id: tempId,
            direction: 'out',
            text: text,
            timestamp: new Date().toISOString(),
            status: 'sending',
            is_read: true,
            sender: { name: 'You' }
        };

        // ✅ Optimistic update
        setMessages((prev: any) => [...prev, formattedMsg]);

        try {
            const newMsg: any = await whatsappAPI.sendMessage({ contact_id: contact.id, text });

            // ✅ Replace temp message with real message
            setMessages((prev: any) =>
                prev.map((msg: any) =>
                    msg.id === tempId
                        ? { ...msg, id: newMsg.id, status: 'sent' }
                        : msg
                )
            );

            // ✅ Remove from tracking after delay
            setTimeout(() => {
                sentMessagesRef.current.delete(messageKey);
            }, 1000);

            // notificationStore.push(
            //     'message',
            //     'Message Sent',
            //     `Sent to ${contact.name}`,
            //     { label: "", page: "" }
            // );

            

        } catch (err) {
            console.error('Failed to send message', err);

            setMessages((prev: any) =>
                prev.map((msg: any) =>
                    msg.id === tempId
                        ? { ...msg, status: 'failed' }
                        : msg
                )
            );

            sentMessagesRef.current.delete(messageKey);

            notificationStore.push(
                'error',
                'Send Failed',
                'Could not send message. Try again.',
                { label: "", page: "" }
            );
        }
    };

    const handleSendTemplate = async (templateName: string, vars: string[]) => {
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

    const handleAddNote = async (body: any) => {
        if (!contact) return;
        try {
            await whatsappAPI.addNote(contact.id, user?.id, body);
            await fetchAllNotes();
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
                {/* Header */}
                <div className="flex items-center gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-white border-b border-gray-200 shrink-0">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 -ml-1 sm:ml-0 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        </button>
                    )}

                    <button
                        onClick={() => onContactInfoOpen?.()}
                        className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0 xl:cursor-default"
                        title="View contact info"
                    >
                        {contact.name?.charAt(0)?.toUpperCase() || '?'}
                    </button>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words sm:truncate">{contact.name}</h3>
                        <p className="text-[11px] sm:text-xs text-gray-400 truncate">{contact.phone}</p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={toggleBotActive}
                            title={conversation.bot_active ? 'Disable Bot' : 'Enable Bot'}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.bot_active
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {conversation.bot_active ? <Bot className="w-4 h-4 sm:w-[15px] sm:h-[15px]" /> : <BotMessageSquare size={15} />}
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

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-4 bg-gray-50 space-y-0.5 max-h-[calc(100vh-140px)] sm:max-h-none">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p className="text-sm">No messages yet</p>
                            <p className="text-xs mt-1">Send a message to start the conversation</p>
                        </div>
                    ) : (
                        messagesWithSeparators.map(({ msg, showSeparator, dateLabel }, index) => (
                            <MessageBubble
                                key={`${msg.id}-${msg.timestamp}-${index}`}
                                message={msg}
                                showDateSeparator={showSeparator}
                                dateSeparatorLabel={dateLabel}
                            />
                        ))
                    )}
                    <div ref={endRef} />
                </div>

                {/* Chat Input */}
                <ChatInput
                    templates={templates}
                    onSendText={handleSendText}
                    onSendTemplate={handleSendTemplate}
                    disabled={conversation.status === 'resolved'}
                />
            </div>

            {/* Contact Info Sidebar (Desktop) */}
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