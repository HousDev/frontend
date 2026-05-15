
// import { useEffect, useRef, useState } from 'react';
// import { Bot, CheckCircle, Clock, PhoneCall, ArrowLeft, BotMessageSquare } from 'lucide-react';
// import type { WhatsAppConversation, WhatsAppContact, Tag, CrmUser, WhatsAppMessage, ConversationNote } from '../../types';
// import { whatsappAPI } from '@/lib/whatsappApi';
// import { formatDate } from '../../lib/formatters';
// import { notificationStore } from '../../lib/notifications';
// import MessageBubble from './MessageBubble';
// import ChatInput from './ChatInput';
// import ContactInfo from './ContactInfo';
// import { useAuth } from '@/contexts/AuthContext';
// // import { connectSocket } from "@/lib/socket";
// import { io } from 'socket.io-client';



// import whatsapp_bg from '@/assets/images/whatsapp_bg.png';
// function connectSocket(userId: string | number) {
//   return io(import.meta.env.VITE_API_URL || "https://resaleexpert.in", {
//     path: "/socket.io",
//     transports: ["websocket", "polling"],
//     query: { userId: String(userId) },
//     withCredentials: true,
//   });
// }

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
//     onContactInfoOpen,
//     onConversationUpdate,
// }: Props) {
//     const [conversation, setConversation] = useState<WhatsAppConversation | null>(initialConversation);
//     const [messages, setMessages] = useState<any[]>([]);
//     const [notes, setNotes] = useState<ConversationNote[]>([]);
//     const [templates, setTemplates] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const endRef = useRef<HTMLDivElement>(null);
//     const socketRef = useRef<any>(null);
//   const [isSending, setIsSending] = useState(false);
// const [contactPresence, setContactPresence] = useState<{
//     status: 'online' | 'offline';
//     last_seen: string;
// } | null>(null);
// const lastMessageTimeRef = useRef<number>(0);
// const { user } = useAuth();

//     // ✅ Track sent messages to prevent duplicates
//     const sentMessagesRef = useRef<Set<string>>(new Set());

//     // Sync conversation from props
//     useEffect(() => {
//         setConversation(initialConversation);
//     }, [initialConversation]);

//     // ✅ Socket.IO Connection for Real-time Chat
//     useEffect(() => {
//         if (!contact) return;

//         const userId = localStorage.getItem("user")
//             ? JSON.parse(localStorage.getItem("user"))?.id
//             : null;

//         if (!userId) {
//             console.error("❌ No userId found for socket connection");
//             return;
//         }

//         console.log("🔌 [Step 1] Connecting socket for userId:", userId);

//         const socket = connectSocket(userId);
//         socketRef.current = socket;

//         socket.on("connect", () => {
//             console.log("✅ [Step 2] Socket connected successfully, id:", socket.id);
//         });

//         socket.on("disconnect", () => {
//             console.log("❌ [Step 3] Socket disconnected");
//         });

//         console.log("🔌 [Step 4] Joining contact room:", contact.id);
// socket.emit("join_contact_room", `contact:${contact.id}`)

//         // Listen for new messages
//         const handleNewMessage = (data: any) => {
//             console.log("📨 [Step 6] NEW MESSAGE EVENT RECEIVED:", data);
// if (data.direction === 'out' && data.message_type === 'location') return;
//             // ✅ Skip if this is my own message (from socket broadcast)
//             if (data.isOwnMessage === true) {
//                 console.log("⚠️ [Step 7] Skipping own message from socket");
//                 return;
//             }

//             // ✅ Check if this message was just sent by us
//             const messageKey = `${data.contact_id}_${data.text}_${data.timestamp}`;
//             if (sentMessagesRef.current.has(messageKey)) {
//                 console.log("⚠️ [Step 7.5] Skipping message we just sent");
//                 return;
//             }

//             if (data.contact_id !== contact.id) {
//                 console.log(`⚠️ [Step 8] Message for different contact: ${data.contact_id} !== ${contact.id}`);
//                 return;
//             }

//             console.log("✅ [Step 9] Message belongs to current contact, updating UI...");

//             const newMsg = {
//                 id: data.message_id || Date.now(),
//                 direction: data.direction || 'in',
//                 text: data.text,
//                 timestamp: data.timestamp || new Date().toISOString(),
//                 status: data.status || 'delivered',
//                 is_read: false,
//                 sender: data.direction === 'out' ? { name: 'You' } : null
//             };

//             // ✅ Check for duplicate before adding
//             setMessages((prev) => {
//                 const exists = prev.some(m => m.id === newMsg.id || (m.text === newMsg.text && Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 1000));
//                 if (exists) {
//                     console.log("⚠️ [Step 10] Duplicate message, skipping");
//                     return prev;
//                 }
//                 console.log(`✅ [Step 11] Adding new message, total: ${prev.length + 1}`);
//                 return [...prev, newMsg];
//             });

//             // Auto mark as read
//             whatsappAPI.markMessagesAsRead(contact.id).catch(console.error);

//             // Update conversation
//             if (onConversationUpdate && conversation) {
//                 onConversationUpdate({
//                     ...conversation,
//                     last_message: data.text,
//                     last_message_at: new Date().toISOString(),
//                     unread_count: 0
//                 });
//             }
//         };

//         socket.on("chat_update", handleNewMessage);
//         console.log("👂 [Step 12] Listening for 'chat_update' events");

//         // ✅ Listen for real-time message status updates (sent/delivered/read)
// const handleStatusUpdate = (data: { whatsapp_msg_id: string; status: string }) => {
//   console.log("📊 Status update received:", data);
//   setMessages(prev =>
//     prev.map(m =>
//       m.whatsapp_msg_id === data.whatsapp_msg_id
//         ? { ...m, status: data.status }
//         : m
//     )
//   );
// };

// socket.on('message_status_update', handleStatusUpdate);

// // ✅ Online/offline presence
// const handlePresence = (data: { contact_id: string; status: 'online' | 'offline'; last_seen: string }) => {
//     if (String(data.contact_id) === String(contact.id)) {
//         setContactPresence({ status: data.status, last_seen: data.last_seen });
//     }
// };
// socket.on('contact_presence', handlePresence);

// return () => {
//     console.log("🧹 [Step 13] Cleaning up socket for contact:", contact.id);
//     if (socket) {
// socket.emit("leave_contact_room", `contact:${contact.id}`)
//         socket.off("chat_update", handleNewMessage);
//         socket.off("message_status_update", handleStatusUpdate);
//         socket.off("contact_presence", handlePresence);
//         socket.off("connect");
//         socket.off("disconnect");
//     }
// };
//     }, [contact?.id, conversation?.id]);

//     // ✅ Mark messages as read when chat window opens
//     useEffect(() => {
//         if (!conversation || !contact) return;

//         const markAsRead = async () => {
//             try {
//                 await whatsappAPI.markMessagesAsRead(contact.id);
//                 console.log("✅ Messages marked as read for contact:", contact.id);

//                 setMessages(prev => prev.map(msg =>
//                     msg.direction === 'in' ? { ...msg, is_read: true } : msg
//                 ));

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
//                 const msgs = await whatsappAPI.getMessages(contact.id);
//                 console.log('Messages fetched:', msgs?.length || 0);

//                 const formatted: any = (msgs || []).map((msg: any) => ({
//                     id: msg.id,
//                     direction: msg.direction === 'out' ? 'out' : 'in',
//                     text: msg.text,
//                     timestamp: msg.time_sent || msg.timestamp,
//                     status: msg.status,
//                     is_read: msg.is_read || false,
//                     whatsapp_msg_id: msg.whatsapp_msg_id || null,
// sender: msg.direction === 'out'
//     ? { name: msg.sender?.name || msg.sender_name || 'You' }
//     : null,
//             media_url: msg.media_url || null,    // ← ADD
//     media_type: msg.media_type || null,  // ← ADD
//     file_name: msg.file_name || null,
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
//         if (endRef.current) {
//             endRef.current.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [messages]);

//     // Fetch notes
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
//         fetchAllNotes();
//     }, [contact]);
//   // ✅ KEEP THIS ONE

// // In the handleSendMedia function
// const handleSendMedia = async (file: File, caption: string) => {
//     if (!conversation || !contact) return;
//       const now = Date.now();
//     if (now - lastMessageTimeRef.current < 2000) return;
//     lastMessageTimeRef.current = now;

//     if (isSending) return;
//     setIsSending(true);
//     const tempId = `temp_media_${Date.now()}`;
//     const previewUrl = URL.createObjectURL(file);

//     const tempMsg = {
//         id: tempId,
//         direction: 'out',
//         text: caption || '📎 Media',  // ← Show caption or default text
//         timestamp: new Date().toISOString(),
//         status: 'sending',
//         is_read: true,
//         sender: { name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You' },
//         media_url: previewUrl,
//         media_type: file.type,
//         file_name: file.name
//     };

//     setMessages((prev: any) => [...prev, tempMsg]);

//     try {
//         const result: any = await whatsappAPI.sendMediaMessage({
//            contact_id: contact.id,
//   file,
//   caption: caption || '',
//   sender_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim()  // ← ADD
// });
//        setMessages((prev: any) =>
//     prev.map((msg: any) =>
//         msg.id === tempId ? {
//             ...msg,
//             id: result.id,
//             status: 'sent',
//             whatsapp_msg_id: result.whatsapp_msg_id || null,  // ✅ ADD
//             sender: { name: result.sender?.name || msg.sender?.name || 'You' }
//         } : msg
//     )
// );

//     } catch (err) {
//         console.error('Failed to send media', err);
//         setMessages((prev: any) =>
//             prev.map((msg: any) =>
//                 msg.id === tempId ? { ...msg, status: 'failed' } : msg
//             )
//         );
//     }
//     finally {
//         setTimeout(() => setIsSending(false), 2000); // ← ADD THIS
//     }
// };
//     // ✅ Handle send text message - FIXED DUPLICATE ISSUE
//    // ✅ REPLACE THIS ENTIRE FUNCTION (around line 110-160)
// const handleSendText = async (text: string) => {
//     if (!conversation || !contact) return;
    
//     // Add these 3 lines at the VERY TOP of the function
//     const now = Date.now();
//     if (now - lastMessageTimeRef.current < 1000) return;
//     lastMessageTimeRef.current = now;
    
//     // Add this check
//     if (isSending) return;

//     const messageKey = `${contact.id}_${text}_${now}`;
//     if (sentMessagesRef.current.has(messageKey)) return;

//     sentMessagesRef.current.add(messageKey);
//     setIsSending(true);  // ← Add this line

//     const tempId = `temp_${Date.now()}_${Math.random()}`;

//     const formattedMsg = {
//         id: tempId,
//         direction: 'out',
//         text: text,
//         timestamp: new Date().toISOString(),
//         status: 'sending',
//         is_read: true,
//         sender: { name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You' }
//     };

//     setMessages((prev: any) => [...prev, formattedMsg]);

//     try {
//         const newMsg: any = await whatsappAPI.sendMessage({ contact_id: contact.id, text, sender_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() });

//        setMessages((prev: any) =>
//     prev.map((msg: any) =>
//         msg.id === tempId ? {
//             ...msg,
//             id: newMsg.id,
//             status: 'sent',
//             whatsapp_msg_id: newMsg.whatsapp_msg_id || null  // ✅ save for status matching
//         } : msg
//     )
// );

//         setTimeout(() => {
//             sentMessagesRef.current.delete(messageKey);
//             setIsSending(false);  // ← Add this line
//         }, 2000);

//         notificationStore.push(
//             'message',
//             'Message Sent',
//             `Sent to ${contact.name}`,
//             { label: "", page: "" }
//         );

//     } catch (err) {
//         console.error('Failed to send message', err);

//         setMessages((prev: any) =>
//             prev.map((msg: any) =>
//                 msg.id === tempId ? { ...msg, status: 'failed' } : msg
//             )
//         );

//         sentMessagesRef.current.delete(messageKey);
//         setIsSending(false);  // ← Add this line

//         notificationStore.push(
//             'error',
//             'Send Failed',
//             'Could not send message. Try again.',
//             { label: "", page: "" }
//         );
//     }
// };

//     const handleSendTemplate = async (templateName: string, vars: string[]) => {
//         notificationStore.push('info', 'Coming Soon', 'Template feature will be available soon', { label: "", page: "" });
//     };
// // Add this function in ChatWindow.tsx, near the other handle functions
// const handleSendLocation = async (lat: number, lng: number) => {
//     if (!conversation || !contact) return;

//     // Create unique key to prevent duplicates
//     const locationKey = `${contact.id}_location_${Date.now()}`;
    
//     // Create optimistic message for immediate display
//     const tempId = `temp_loc_${Date.now()}_${Math.random()}`;
//     const locationText = `📍 Location: ${lat}, ${lng}`;
     

//      const messageKey = `${contact.id}_${locationText}_${new Date().toISOString().slice(0,19)}`;
//     sentMessagesRef.current.add(messageKey);

//     const tempMsg = {
//         id: tempId,
//         direction: 'out',
//         text: locationText,
//         timestamp: new Date().toISOString(),
//         status: 'sending',
//         is_read: true,
//         sender: { name: 'You' },
//         message_type: 'location',
//     };

//     // ✅ Optimistic update - show immediately in chat
//     setMessages((prev: any) => [...prev, tempMsg]);

//     try {
//         const result: any = await whatsappAPI.sendLocation({
//             contact_id: contact.id,
//             latitude: lat,
//             longitude: lng ,
//             sender_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
//         });

//         // Replace temp message with real one
//         setMessages((prev: any) =>
//             prev.map((msg: any) =>
//                 msg.id === tempId
//                     ? { ...msg, id: result.id || tempId, status: 'sent' }
//                     : msg
//             )
//         );

//         notificationStore.push(
//             'message',
//             'Location Sent',
//             `Location sent to ${contact.name}`,
//             { label: "", page: "" }
//         );
//     } catch (err) {
//         console.error('Failed to send location', err);
        
//         // Mark as failed
//         setMessages((prev: any) =>
//             prev.map((msg: any) =>
//                 msg.id === tempId ? { ...msg, status: 'failed' } : msg
//             )
//         );

//         notificationStore.push(
//             'error',
//             'Send Failed',
//             'Could not send location. Try again.',
//             { label: "", page: "" }
//         );
//     }
// };

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

//     const handleAddNote = async (body: any) => {
//         if (!contact) return;
//         try {
//             await whatsappAPI.addNote(contact.id, user?.id, body);
//             await fetchAllNotes();
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
//         <div className="flex flex-1 min-w-0">
//             <div className="flex flex-col flex-1 min-w-0 ">
//                 {/* Header */}
// <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border-b border-shrink-0 sticky top-0 z-10">
//     {onClose && (
//                         <button
//                             onClick={onClose}
//                             className="p-1 -ml-1 sm:ml-0 rounded-lg hover:bg-gray-100 text-gray-500"
//                         >
//                             <ArrowLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
//                         </button>
//                     )}

//                     <button
//                         onClick={() => onContactInfoOpen?.()}
// className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 border border-[#b7e4c7] rounded-full flex items-center justify-center text-[#075e54] text-xs sm:text-sm font-bold shrink-0 transition-all"                        title="View contact info"
//                     >
// {contact.name
//   ? contact.name
//       .split(' ')
//       .map((word) => word.charAt(0).toUpperCase())
//       .slice(0, 2)
//       .join('')
//   : '?'}                    </button>

//                     <div className="flex-1 min-w-0">
//     <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words sm:truncate">
//         {contact.name}
//     </h3>
//     {contactPresence?.status === 'online' ? (
//         <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
//             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
//             online
//         </p>
//     ) : contactPresence?.last_seen ? (
//         <p className="text-[11px] text-gray-400 truncate">
//             last seen {new Date(contactPresence.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </p>
//     ) : (
//         <p className="text-[11px] sm:text-xs text-gray-400 truncate">{contact.phone}</p>
//     )}
// </div>

//                     <div className="flex items-center gap-1 sm:gap-2">
//                         <button
//                             onClick={toggleBotActive}
//                             title={conversation.bot_active ? 'Disable Bot' : 'Enable Bot'}
//                             className={`p-1.5 sm:p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.bot_active
//                                ? 'bg-[#d9fdd3] text-[#075e54] hover:bg-[#c8f7c5]'
// : 'bg-[#f0f2f5] text-[#667781] hover:bg-[#e4e6e9]'
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
// ? 'bg-[#d9fdd3] text-[#075e54] hover:bg-[#c8f7c5]'
// : 'bg-[#f0f2f5] text-[#667781] hover:bg-[#e4e6e9]'
//                                 }`}
//                         >
//                             {conversation.status === 'resolved' ? <Clock size={15} /> : <CheckCircle size={15} />}
//                             <span className="hidden lg:inline text-xs font-medium">
//                                 {conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
//                             </span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Messages Area */}
// {/* Messages Area */}
// <div
//   className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-1 max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-150px)]"
//   style={{
//     backgroundColor: '#efeae2',
//     backgroundImage: `url(${whatsapp_bg})`,
//     backgroundRepeat: 'repeat',
//     backgroundSize: '412px auto',
//   }}
// >{loading ? (
//                         <div className="flex items-center justify-center h-full">
//                             <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//                         </div>
//                     ) : messages.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
//                             <p className="text-sm">No messages yet</p>
//                             <p className="text-xs mt-1">Send a message to start the conversation</p>
//                         </div>
//                     ) : (
//                         messagesWithSeparators.map(({ msg, showSeparator, dateLabel }, index) => (
//                             <MessageBubble
//                                 key={`${msg.id}-${msg.timestamp}-${index}`}
//                                 message={msg}
//                                 showDateSeparator={showSeparator}
//                                 dateSeparatorLabel={dateLabel}
//                             />
//                         ))
//                     )}
//                     <div ref={endRef} />
//                 </div>

//                 {/* Chat Input */}
//                 <ChatInput
//                     templates={templates}
//                     onSendText={handleSendText}
//                     onSendTemplate={handleSendTemplate}
//                         onSendMedia={handleSendMedia}
// onSendLocation={handleSendLocation}
//                     disabled={conversation.status === 'resolved'}
//                 />
//             </div>

//             {/* Contact Info Sidebar (Desktop) */}
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
import { io } from 'socket.io-client';
import whatsapp_bg from '@/assets/images/whatsapp_bg.png';

function connectSocket(userId: string | number) {
    return io(import.meta.env.VITE_API_URL || "https://resaleexpert.in", {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        query: { userId: String(userId) },
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });
}

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
    const [isSending, setIsSending] = useState(false);
    const [contactPresence, setContactPresence] = useState<{
        status: 'online' | 'offline';
        last_seen: string;
    } | null>(null);
    const lastMessageTimeRef = useRef<number>(0);
    const { user } = useAuth();

    // ✅ Track sent messages to prevent duplicates
    const sentMessagesRef = useRef<Set<string>>(new Set());

    // Sync conversation from props
    useEffect(() => {
        setConversation(initialConversation);
    }, [initialConversation]);

    // ✅ Auto-refresh messages every 3 seconds (fallback for socket issues)
    useEffect(() => {
        if (!contact) return;

        const refreshMessages = async () => {
            try {
                const msgs = await whatsappAPI.getMessages(contact.id);
                const formatted = msgs.map((msg: any) => ({
                    id: msg.id,
                    direction: msg.direction === 'out' ? 'out' : 'in',
                    text: msg.text,
                    timestamp: msg.time_sent || msg.timestamp,
                    status: msg.status,
                    is_read: msg.is_read,
                    sender: msg.direction === 'out' ? { name: msg.sender_name || msg.sender?.name || 'You' } : null,
                    whatsapp_msg_id: msg.whatsapp_msg_id,
                    media_url: msg.media_url || null,       // ← ADD
                    media_type: msg.media_type || null,     // ← ADD
                    file_name: msg.file_name || null,       // ← ADD
                    isInteractive: msg.isInteractive || false,  // ← ADD
                    buttons: msg.buttons || null,
                }));

                setMessages(prev => {
                    // Check if messages changed
                    const prevIds = prev.map(m => m.id).join(',');
                    const newIds = formatted.map(m => m.id).join(',');
                    if (prevIds !== newIds) {
                        console.log('🔄 Auto-refresh: messages updated', formatted.length);
                        return formatted;
                    }
                    return prev;
                });
            } catch (err) {
                console.error('Auto-refresh failed:', err);
            }
        };

        refreshMessages();
        const interval = setInterval(refreshMessages, 3000);

        return () => clearInterval(interval);
    }, [contact?.id]);

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

        console.log("🔌 Connecting socket for userId:", userId);

        const socket = connectSocket(userId);
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("✅ Socket connected successfully, id:", socket.id);
            socket.emit("leave_contact_room", `contact:${contact.id}`);
            setTimeout(() => {
                socket.emit("join_contact_room", `contact:${contact.id}`);
                console.log("✅ Joined room: contact:", contact.id);
            }, 100);
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected, attempting to reconnect...");
        });

        socket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
        });

        // ✅ Handle new messages - IMPROVED DUPLICATE DETECTION
        const handleNewMessage = (data: any) => {
            console.log("📨 NEW MESSAGE RECEIVED:", data);

            if (data.message_type === 'location') {
                console.log("📍 Location message received");
            }

            // Skip if this is my own message
            if (data.isOwnMessage === true) {
                console.log("⚠️ Skipping own message from socket");
                return;
            }

            // Check for duplicate using message key
            const messageKey = `${data.contact_id}_${data.text}_${data.timestamp}`;
            if (sentMessagesRef.current.has(messageKey)) {
                console.log("⚠️ Skipping duplicate message");
                return;
            }

            if (data.contact_id !== contact.id) {
                console.log(`⚠️ Message for different contact: ${data.contact_id} !== ${contact.id}`);
                return;
            }

            console.log("✅ Message belongs to current contact, updating UI...");

            const newMsg = {
                id: data.message_id || Date.now(),
                direction: data.direction || 'in',
                text: data.text,
                timestamp: data.timestamp || new Date().toISOString(),
                status: data.status || 'delivered',
                is_read: data.direction === 'out' ? true : false,
                sender: data.direction === 'out' ? { name: data.sender_name || '🤖 Bot' } : null,
                message_type: data.message_type || 'text',
                isInteractive: data.isInteractive || false,
                buttons: data.buttons || null,
                whatsapp_msg_id: data.whatsapp_msg_id || null
            };

            // ✅ IMPROVED: Better duplicate detection using WhatsApp message ID
            setMessages((prev) => {
                const exists = prev.some(m =>
                    m.id === newMsg.id ||
                    (m.whatsapp_msg_id && m.whatsapp_msg_id === newMsg.whatsapp_msg_id) ||
                    (m.text === newMsg.text &&
                        m.direction === newMsg.direction &&
                        Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 3000)
                );

                if (exists) {
                    console.log("⚠️ Duplicate message, skipping");
                    return prev;
                }
                console.log(`✅ Adding new message, total: ${prev.length + 1}`);
                return [...prev, newMsg];
            });

            // Auto mark as read for incoming messages
            if (data.direction === 'in') {
                whatsappAPI.markMessagesAsRead(contact.id).catch(console.error);
            }

            // Update conversation
            if (onConversationUpdate && conversation) {
                onConversationUpdate({
                    ...conversation,
                    last_message: data.text,
                    last_message_at: new Date().toISOString(),
                    unread_count: data.direction === 'in' ? (conversation.unread_count || 0) + 1 : 0
                });
            }
        };

        socket.on("chat_update", handleNewMessage);

        // ✅ Listen for message status updates
        const handleStatusUpdate = (data: { whatsapp_msg_id: string; status: string }) => {
            console.log("📊 Status update received:", data);
            setMessages(prev =>
                prev.map(m =>
                    m.whatsapp_msg_id === data.whatsapp_msg_id
                        ? { ...m, status: data.status }
                        : m
                )
            );
        };
        socket.on('message_status_update', handleStatusUpdate);

        // ✅ Online/offline presence
        const handlePresence = (data: { contact_id: string; status: 'online' | 'offline'; last_seen: string }) => {
            if (String(data.contact_id) === String(contact.id)) {
                setContactPresence({ status: data.status, last_seen: data.last_seen });
            }
        };
        socket.on('contact_presence', handlePresence);

        return () => {
            console.log("🧹 Cleaning up socket for contact:", contact.id);
            if (socket) {
                socket.emit("leave_contact_room", `contact:${contact.id}`);
                socket.off("chat_update", handleNewMessage);
                socket.off("message_status_update", handleStatusUpdate);
                socket.off("contact_presence", handlePresence);
                socket.off("connect");
                socket.off("disconnect");
                socket.off("connect_error");
                socket.disconnect();
            }
        };
    }, [contact?.id, conversation?.id]);

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
                    whatsapp_msg_id: msg.whatsapp_msg_id || null,
                    sender: msg.direction === 'out'
                        ? { name: msg.sender?.name || msg.sender_name || 'You' }
                        : null,
                    media_url: msg.media_url || null,
                    media_type: msg.media_type || null,
                    file_name: msg.file_name || null,
                    isInteractive: msg.isInteractive || false,   // ← ADD
                    buttons: msg.buttons || null,           
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

    const handleSendMedia = async (file: File, caption: string) => {
        if (!conversation || !contact) return;
        const now = Date.now();
        if (now - lastMessageTimeRef.current < 2000) return;
        lastMessageTimeRef.current = now;

        if (isSending) return;
        setIsSending(true);
        const tempId = `temp_media_${Date.now()}`;
        const previewUrl = URL.createObjectURL(file);

        const tempMsg = {
            id: tempId,
            direction: 'out',
            text: caption || '📎 Media',
            timestamp: new Date().toISOString(),
            status: 'sending',
            is_read: true,
            sender: { name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You' },
            media_url: previewUrl,
            media_type: file.type,
            file_name: file.name
        };

        setMessages((prev: any) => [...prev, tempMsg]);

        try {
            const result: any = await whatsappAPI.sendMediaMessage({
                contact_id: contact.id,
                file,
                caption: caption || '',
                sender_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
            });
            setMessages((prev: any) =>
                prev.map((msg: any) =>
                    msg.id === tempId ? {
                        ...msg,
                        id: result.id,
                        status: 'sent',
                        whatsapp_msg_id: result.whatsapp_msg_id || null
                    } : msg
                )
            );
        } catch (err) {
            console.error('Failed to send media', err);
            setMessages((prev: any) =>
                prev.map((msg: any) =>
                    msg.id === tempId ? { ...msg, status: 'failed' } : msg
                )
            );
        } finally {
            setTimeout(() => setIsSending(false), 2000);
        }
    };

    // ✅ Handle send text message
    const handleSendText = async (text: string) => {
        if (!conversation || !contact) return;

        const now = Date.now();
        if (now - lastMessageTimeRef.current < 1000) return;
        lastMessageTimeRef.current = now;

        if (isSending) return;

        const messageKey = `${contact.id}_${text}_${now}`;
        if (sentMessagesRef.current.has(messageKey)) return;

        sentMessagesRef.current.add(messageKey);
        setIsSending(true);

        const tempId = `temp_${Date.now()}_${Math.random()}`;

        const formattedMsg = {
            id: tempId,
            direction: 'out',
            text: text,
            timestamp: new Date().toISOString(),
            status: 'sending',
            is_read: true,
            sender: { name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You' }
        };

        setMessages((prev: any) => [...prev, formattedMsg]);

        try {
            const newMsg: any = await whatsappAPI.sendMessage({
                contact_id: contact.id,
                text,
                sender_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
            });

            setMessages((prev: any) =>
                prev.map((msg: any) =>
                    msg.id === tempId ? {
                        ...msg,
                        id: newMsg.id,
                        status: 'sent',
                        whatsapp_msg_id: newMsg.whatsapp_msg_id || null
                    } : msg
                )
            );

            setTimeout(() => {
                sentMessagesRef.current.delete(messageKey);
                setIsSending(false);
            }, 2000);

            notificationStore.push(
                'message',
                'Message Sent',
                `Sent to ${contact.name}`,
                { label: "", page: "" }
            );

        } catch (err) {
            console.error('Failed to send message', err);

            setMessages((prev: any) =>
                prev.map((msg: any) =>
                    msg.id === tempId ? { ...msg, status: 'failed' } : msg
                )
            );

            sentMessagesRef.current.delete(messageKey);
            setIsSending(false);

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

    const handleSendLocation = async (lat: number, lng: number) => {
        if (!conversation || !contact) return;

        const tempId = `temp_loc_${Date.now()}_${Math.random()}`;
        const locationText = `📍 Location: ${lat}, ${lng}`;

        const messageKey = `${contact.id}_${locationText}_${new Date().toISOString().slice(0, 19)}`;
        sentMessagesRef.current.add(messageKey);

        const tempMsg = {
            id: tempId,
            direction: 'out',
            text: locationText,
            timestamp: new Date().toISOString(),
            status: 'sending',
            is_read: true,
            sender: { name: 'You' },
            message_type: 'location',
        };

        setMessages((prev: any) => [...prev, tempMsg]);

        try {
            const result: any = await whatsappAPI.sendLocation({
                contact_id: contact.id,
                latitude: lat,
                longitude: lng,
                sender_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
            });

            setMessages((prev: any) =>
                prev.map((msg: any) =>
                    msg.id === tempId
                        ? { ...msg, id: result.id || tempId, status: 'sent' }
                        : msg
                )
            );

            notificationStore.push(
                'message',
                'Location Sent',
                `Location sent to ${contact.name}`,
                { label: "", page: "" }
            );
        } catch (err) {
            console.error('Failed to send location', err);

            setMessages((prev: any) =>
                prev.map((msg: any) =>
                    msg.id === tempId ? { ...msg, status: 'failed' } : msg
                )
            );

            notificationStore.push(
                'error',
                'Send Failed',
                'Could not send location. Try again.',
                { label: "", page: "" }
            );
        }
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
        <div className="flex flex-1 min-w-0">
            <div className="flex flex-col flex-1 min-w-0 ">
                {/* Header */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border-b shrink-0 sticky top-0 z-10">
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
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 border border-[#b7e4c7] rounded-full flex items-center justify-center text-[#075e54] text-xs sm:text-sm font-bold shrink-0 transition-all"
                        title="View contact info"
                    >
                        {contact.name
                            ? contact.name
                                .split(' ')
                                .map((word) => word.charAt(0).toUpperCase())
                                .slice(0, 2)
                                .join('')
                            : '?'}
                    </button>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words sm:truncate">
                            {contact.name}
                        </h3>
                        {contactPresence?.status === 'online' ? (
                            <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                                online
                            </p>
                        ) : contactPresence?.last_seen ? (
                            <p className="text-[11px] text-gray-400 truncate">
                                last seen {new Date(contactPresence.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        ) : (
                            <p className="text-[11px] sm:text-xs text-gray-400 truncate">{contact.phone}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={toggleBotActive}
                            title={conversation.bot_active ? 'Disable Bot' : 'Enable Bot'}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.bot_active
                                ? 'bg-[#d9fdd3] text-[#075e54] hover:bg-[#c8f7c5]'
                                : 'bg-[#f0f2f5] text-[#667781] hover:bg-[#e4e6e9]'
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
                                ? 'bg-[#d9fdd3] text-[#075e54] hover:bg-[#c8f7c5]'
                                : 'bg-[#f0f2f5] text-[#667781] hover:bg-[#e4e6e9]'
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
                <div
                    className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-1 max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-150px)]"
                    style={{
                        backgroundColor: '#efeae2',
                        backgroundImage: `url(${whatsapp_bg})`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '412px auto',
                    }}
                >
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
                    onSendMedia={handleSendMedia}
                    onSendLocation={handleSendLocation}
                    disabled={conversation.status === 'resolved'}
                />
            </div>

            {/* Contact Info Sidebar (Desktop) */}
            <div className="w-60 shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden xl:block">
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