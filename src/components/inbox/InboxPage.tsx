// import { useState, useEffect, useCallback } from 'react';
// import { whatsappAPI } from '@/lib/whatsappApi';
// import { useConversations, useContactDetail, useConversationDetail } from '../../hooks/useInbox';
// import { useLeads, useTags, useCrmUsers } from '../../hooks/useLeads';
// import type { InboxFilter } from '../../hooks/useInbox';
// import type { WhatsAppConversation } from '../../types';
// import ConversationList from './ConversationList';
// import ChatWindow from './ChatWindow';
// import { connectSocket } from "@/lib/socket";
// import ContactInfo from './ContactInfo';
// import { ArrowLeft } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';


// // Mobile view states
// type MobileView = 'list' | 'chat'| 'contact';;

// export default function InboxPage() {
//     const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
//     const [filter, setFilter] = useState<InboxFilter>('all');
//     const [search, setSearch] = useState('');
//     const [users, setUsers] = useState<any>([]);
//     const [allTags, setAllTags] = useState<any>([]);
// const [notes, setNotes] = useState<any[]>([]);
// const { user } = useAuth();



//     // ✅ Mobile view state: 'list' or 'chat'
//     const [mobileView, setMobileView] = useState<MobileView>('list');

//     const { conversations, loading, refresh, updateConversationLocally }: any = useConversations(filter, search);
//     const { conversation: liveConversation } = useConversationDetail(selectedConvId);
//     const selectedConv = liveConversation || conversations.find((c) => c.id === selectedConvId) || null;
//     const { contact, setContact } = useContactDetail(selectedConv?.contact_id || null);
//     const { tags } = useTags();
//     const { users: crmUsers } = useCrmUsers();
//     const { addTag, removeTag, assignTo, updateStage } = useLeads();

//     // Load users and tags on mount
//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 const [usersData, tagsData]: any = await Promise.all([
//                     whatsappAPI.getUsers(),
//                     whatsappAPI.getTags()
//                 ]);
//                 console.log("user data for contact", usersData)
//                 setUsers(usersData.data || []);
//                 setAllTags(tagsData || []);
//             } catch (err) {
//                 console.error('Failed to load users/tags', err);
//             }
//         };
//         loadData();
//     }, []);

//     useEffect(() => {
//         const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))?.id : null;

//         if (!userId) {
//             console.error("❌ No userId");
//             return;
//         }

//         const socket = connectSocket(userId);

//         socket.on("chat_update", (data) => {
//             console.log("🔥 REALTIME EVENT:", data);

//             const { contact_id, text } = data;

//             updateConversationLocally(`conv_${contact_id}`, (prev: any) => {
//                 if (!prev) return prev;
//                 return {
//                     ...prev,
//                     last_message: text,
//                     last_contact_time: new Date(),
//                     unread_count:
//                         selectedConv?.contact_id === contact_id
//                             ? 0
//                             : (prev.unread_count || 0) + 1,
//                 };
//             });

//             if (selectedConv?.contact_id === contact_id) {
//                 refresh();
//             }
//         });

//         return () => {
//             socket.off("chat_update");
//         };
//     }, [selectedConv, updateConversationLocally, refresh]);

//     // ✅ On conversation select: set id + switch mobile to chat view
//     const handleSelectConversation = useCallback((conv: WhatsAppConversation) => {
//         setSelectedConvId(conv.id);
//         if (conv.unread_count > 0) {
//             updateConversationLocally(conv.id, { unread_count: 0 });
//         }
//         setMobileView('chat'); // ✅ switch to chat on mobile
//     }, [updateConversationLocally]);

//     // ✅ On back from chat: go back to list on mobile
//     const handleBackToList = useCallback(() => {
//         setMobileView('list');
//     }, []);

//     const handleUpdateStage = useCallback(async (stage: string) => {
//         if (!contact) return;
//         await updateStage(contact.id, stage as any);
//         setContact((prev) => prev ? { ...prev, stage: stage as typeof prev.stage } : null);
//     }, [contact, updateStage, setContact]);

//     const handleAssign = useCallback(async (userId: string) => {
//         if (!contact) return;
//         await assignTo(contact.id, userId);
//         const user = users.find((u) => u.id == userId) || null;
//         setContact((prev) => prev ? { ...prev, assigned_to: userId, assigned_user: user } : null);
//     }, [contact, users, assignTo, setContact]);

//     const handleAddTag = useCallback(async (tagId: string) => {
//         if (!contact) return;
//         await addTag(contact.id, tagId);
//         const tag = allTags.find((t) => t.id == tagId);
//         if (tag) {
//             setContact((prev) =>
//                 prev ? { ...prev, tags: [...(prev.tags || []), tag] } : null
//             );
//         }
//     }, [contact, allTags, addTag, setContact]);

//     const handleRemoveTag = useCallback(async (tagId: string) => {
//         if (!contact) return;
//         await removeTag(contact.id, tagId);
//         setContact((prev) =>
//             prev ? { ...prev, tags: (prev.tags || []).filter((t) => t.id != tagId) } : null
//         );
//     }, [contact, removeTag, setContact]);

//     const handleConversationUpdate = useCallback((updatedConversation: WhatsAppConversation) => {
//         console.log("🔄 Updating conversation:", updatedConversation);
//         updateConversationLocally(updatedConversation.id, updatedConversation);
//     }, [updateConversationLocally]);
// const fetchAllNotes = useCallback(async () => {
//     if (!contact) return;
//     try {
//         const notesData: any = await whatsappAPI.getContactNotes(contact.id);
//         setNotes(notesData);
//     } catch (err) {
//         console.error('Failed to fetch notes', err);
//     }
// }, [contact]);

// useEffect(() => {
//     fetchAllNotes();
// }, [contact]);

// const handleAddNote = useCallback(async (body: any) => {
//     if (!contact) return;
//     try {
//         await whatsappAPI.addNote(contact.id, user?.id, body);
//         await fetchAllNotes();
//     } catch (err) {
//         console.error('Failed to add note', err);
//     }
// }, [contact, fetchAllNotes]);
//     return (
//         <>
//             {/* ── DESKTOP: show both side by side (unchanged) ── */}
//             <div className="hidden xl:flex h-full overflow-hidden bg-white ">
//                 <ConversationList
//                     conversations={conversations}
//                     loading={loading}
//                     selectedId={selectedConv?.id || null}
//                     filter={filter}
//                     search={search}
//                     onSelect={handleSelectConversation}
//                     onFilterChange={setFilter}
//                     onSearchChange={setSearch}
//                     onRefresh={refresh}
//                 />
//                 <ChatWindow
//                     conversation={selectedConv}
//                     contact={contact}
//                     users={users}
//                     allTags={allTags}
//                     onUpdateStage={handleUpdateStage}
//                     onAssign={handleAssign}
//                     onAddTag={handleAddTag}
//                     onRemoveTag={handleRemoveTag}
//                     onConversationUpdate={handleConversationUpdate}
//                 />
//             </div>

//             {/* ── MOBILE: show one view at a time ── */}
//             <div className="xl:hidden flex h-full overflow-hidden bg-white">

//                 {/* MOBILE — Conversation List */}
//                 {mobileView === 'list' && (
//                     <div className="flex flex-col w-full h-full">
//                         <ConversationList
//                             conversations={conversations}
//                             loading={loading}
//                             selectedId={selectedConv?.id || null}
//                             filter={filter}
//                             search={search}
//                             onSelect={handleSelectConversation}
//                             onFilterChange={setFilter}
//                             onSearchChange={setSearch}
//                             onRefresh={refresh}
//                         />
//                     </div>
//                 )}

//                 {/* MOBILE — Chat Window (full screen) */}
//                 {mobileView === 'chat' && (
//                     <div className="flex flex-col w-full h-full">
//                         <ChatWindow
//                             conversation={selectedConv}
//                             contact={contact}
//                             users={users}
//                             allTags={allTags}
//                             onUpdateStage={handleUpdateStage}
//                             onAssign={handleAssign}
//                             onAddTag={handleAddTag}
//                             onRemoveTag={handleRemoveTag}
//                             onConversationUpdate={handleConversationUpdate}
//                             onClose={handleBackToList}
//                             onContactInfoOpen={() => setMobileView('contact')}
//                         />
//                     </div>
//                 )}


//                 {/* ✅ ADD THIS new block */}
// {mobileView === 'contact' && (
//     <div className="flex flex-col w-full h-full">
//         {/* Header */}
//         <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
//             <button
//                 onClick={() => setMobileView('chat')}
//                 className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
//             >
//                 <ArrowLeft size={18} />
//             </button>
//             <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
//                 {contact?.name?.charAt(0)?.toUpperCase() || '?'}
//             </div>
//             <div>
//                 <p className="text-sm font-semibold text-gray-900">{contact?.name}</p>
//                 <p className="text-xs text-gray-400">Contact Info</p>
//             </div>
//         </div>
//         {/* Contact Info */}
//         <div className="flex-1 overflow-y-auto">
//             <ContactInfo
//                 contact={contact}
//                 users={users}
//                 allTags={allTags}
//                 onUpdateStage={handleUpdateStage}
//                 onAssign={handleAssign}
//                 onAddTag={handleAddTag}
//                 onRemoveTag={handleRemoveTag}
//                 onUpdateNotes={async () => {}}
//                 conversationNotes={notes}
// onAddNote={handleAddNote}
// fetchAllNotes={fetchAllNotes}
//             />
//         </div>
//     </div>
// )}

//             </div>
//         </>
//     );
// }

import { useState, useEffect, useCallback } from 'react';
import { whatsappAPI } from '@/lib/whatsappApi';
import { useConversations, useContactDetail, useConversationDetail } from '../../hooks/useInbox';
import { useLeads, useTags, useCrmUsers } from '../../hooks/useLeads';
import type { InboxFilter } from '../../hooks/useInbox';
import type { WhatsAppConversation } from '../../types';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { connectSocket } from "@/lib/socket";
import ContactInfo from './ContactInfo';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationStore } from '../../lib/notifications';

// Mobile view states
type MobileView = 'list' | 'chat' | 'contact';

export default function InboxPage() {
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [filter, setFilter] = useState<InboxFilter>('all');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any>([]);
    const [allTags, setAllTags] = useState<any>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const { user } = useAuth();

    // Mobile view state
    const [mobileView, setMobileView] = useState<MobileView>('list');

    const { conversations, loading, refresh, updateConversationLocally }: any = useConversations(filter, search);
    const { conversation: liveConversation } = useConversationDetail(selectedConvId);
    const selectedConv = liveConversation || conversations.find((c) => c.id === selectedConvId) || null;
    const { contact, setContact } = useContactDetail(selectedConv?.contact_id || null);
    const { tags } = useTags();
    const { users: crmUsers } = useCrmUsers();
    const { addTag, removeTag, assignTo, updateStage } = useLeads();

    // Load users and tags on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersData, tagsData]: any = await Promise.all([
                    whatsappAPI.getUsers(),
                    whatsappAPI.getTags()
                ]);
                console.log("user data for contact", usersData);
                setUsers(usersData.data || []);
                setAllTags(tagsData || []);
            } catch (err) {
                console.error('Failed to load users/tags', err);
            }
        };
        loadData();
    }, []);

    // Socket connection for real-time updates
    useEffect(() => {
        const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))?.id : null;

        if (!userId) {
            console.error("❌ No userId");
            return;
        }

        const socket = connectSocket(userId);

        socket.on("chat_update", (data) => {
            console.log("🔥 REALTIME EVENT:", data);

            const { contact_id, text, direction } = data;

            // ✅ Show notification for incoming messages
            if (direction === 'in') {
                const contactInfo = conversations.find(c => c.contact_id === contact_id)?.contact;
                const contactName = contactInfo?.name || contactInfo?.phone || 'Customer';

                notificationStore.push(
                    'message',
                    'New WhatsApp Message',
                    `${contactName}: ${text.substring(0, 40)}${text.length > 40 ? '...' : ''}`,
                    { label: 'View', page: 'inbox', contact_id: contact_id } as any
                );
            }

            // Update conversation list
            updateConversationLocally(`conv_${contact_id}`, (prev: any) => {
                if (!prev) return prev;
                const currentUnread = prev.unread_count || 0;
                return {
                    ...prev,
                    last_message: text,
                    last_contact_time: new Date(),
                    unread_count: direction === 'in' ? currentUnread + 1 : 0,
                };
            });

            // Refresh if current chat is open
            if (selectedConv?.contact_id === contact_id) {
                refresh();
            }
        });

        return () => {
            socket.off("chat_update");
            socket.disconnect();
        };
    }, [selectedConv, updateConversationLocally, refresh, conversations]);

    // On conversation select
    const handleSelectConversation = useCallback((conv: WhatsAppConversation) => {
        setSelectedConvId(conv.id);
        if (conv.unread_count > 0) {
            updateConversationLocally(conv.id, { unread_count: 0 });
        }
        setMobileView('chat');
    }, [updateConversationLocally]);

    // On back from chat
    const handleBackToList = useCallback(() => {
        setMobileView('list');
    }, []);

    const handleUpdateStage = useCallback(async (stage: string) => {
        if (!contact) return;
        await updateStage(contact.id, stage as any);
        setContact((prev) => prev ? { ...prev, stage: stage as typeof prev.stage } : null);
    }, [contact, updateStage, setContact]);

    const handleAssign = useCallback(async (userId: string) => {
        if (!contact) return;
        await assignTo(contact.id, userId);
        const user = users.find((u) => u.id == userId) || null;
        setContact((prev) => prev ? { ...prev, assigned_to: userId, assigned_user: user } : null);
    }, [contact, users, assignTo, setContact]);

    const handleAddTag = useCallback(async (tagId: string) => {
        if (!contact) return;
        await addTag(contact.id, tagId);
        const tag = allTags.find((t) => t.id == tagId);
        if (tag) {
            setContact((prev) =>
                prev ? { ...prev, tags: [...(prev.tags || []), tag] } : null
            );
        }
    }, [contact, allTags, addTag, setContact]);

    const handleRemoveTag = useCallback(async (tagId: string) => {
        if (!contact) return;
        await removeTag(contact.id, tagId);
        setContact((prev) =>
            prev ? { ...prev, tags: (prev.tags || []).filter((t) => t.id != tagId) } : null
        );
    }, [contact, removeTag, setContact]);

    const handleConversationUpdate = useCallback((updatedConversation: WhatsAppConversation) => {
        console.log("🔄 Updating conversation:", updatedConversation);
        updateConversationLocally(updatedConversation.id, updatedConversation);
    }, [updateConversationLocally]);

    const fetchAllNotes = useCallback(async () => {
        if (!contact) return;
        try {
            const notesData: any = await whatsappAPI.getContactNotes(contact.id);
            setNotes(notesData);
        } catch (err) {
            console.error('Failed to fetch notes', err);
        }
    }, [contact]);

    useEffect(() => {
        fetchAllNotes();
    }, [contact]);

    const handleAddNote = useCallback(async (body: any) => {
        if (!contact) return;
        try {
            await whatsappAPI.addNote(contact.id, user?.id, body);
            await fetchAllNotes();
        } catch (err) {
            console.error('Failed to add note', err);
        }
    }, [contact, fetchAllNotes]);

    return (
        <>
            {/* DESKTOP: show both side by side */}
            <div className="hidden xl:flex h-full overflow-hidden bg-white">
                <ConversationList
                    conversations={conversations}
                    loading={loading}
                    selectedId={selectedConv?.id || null}
                    filter={filter}
                    search={search}
                    onSelect={handleSelectConversation}
                    onFilterChange={setFilter}
                    onSearchChange={setSearch}
                    onRefresh={refresh}
                />
                <ChatWindow
                    conversation={selectedConv}
                    contact={contact}
                    users={users}
                    allTags={allTags}
                    onUpdateStage={handleUpdateStage}
                    onAssign={handleAssign}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    onConversationUpdate={handleConversationUpdate}
                />
            </div>

            {/* MOBILE: show one view at a time */}
            <div className="xl:hidden flex h-full overflow-hidden bg-white">

                {/* MOBILE — Conversation List */}
                {mobileView === 'list' && (
                    <div className="flex flex-col w-full h-full">
                        <ConversationList
                            conversations={conversations}
                            loading={loading}
                            selectedId={selectedConv?.id || null}
                            filter={filter}
                            search={search}
                            onSelect={handleSelectConversation}
                            onFilterChange={setFilter}
                            onSearchChange={setSearch}
                            onRefresh={refresh}
                        />
                    </div>
                )}

                {/* MOBILE — Chat Window */}
                {mobileView === 'chat' && (
                    <div className="flex flex-col w-full h-full">
                        <ChatWindow
                            conversation={selectedConv}
                            contact={contact}
                            users={users}
                            allTags={allTags}
                            onUpdateStage={handleUpdateStage}
                            onAssign={handleAssign}
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTag}
                            onConversationUpdate={handleConversationUpdate}
                            onClose={handleBackToList}
                            onContactInfoOpen={() => setMobileView('contact')}
                        />
                    </div>
                )}

                {/* MOBILE — Contact Info */}
                {mobileView === 'contact' && (
                    <div className="flex flex-col w-full h-full">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
                            <button
                                onClick={() => setMobileView('chat')}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {contact?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{contact?.name}</p>
                                <p className="text-xs text-gray-400">Contact Info</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ContactInfo
                                contact={contact}
                                users={users}
                                allTags={allTags}
                                onUpdateStage={handleUpdateStage}
                                onAssign={handleAssign}
                                onAddTag={handleAddTag}
                                onRemoveTag={handleRemoveTag}
                                onUpdateNotes={async () => { }}
                                conversationNotes={notes}
                                onAddNote={handleAddNote}
                                fetchAllNotes={fetchAllNotes}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}