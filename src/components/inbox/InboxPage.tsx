// // src/components/inbox/InboxPage.tsx
// import { useState, useCallback } from 'react';
// import { useConversations, useContactDetail, useConversationDetail } from '../../hooks/useInbox';
// import { useLeads, useTags, useCrmUsers } from '../../hooks/useLeads';
// import type { InboxFilter } from '../../hooks/useInbox';
// import type { WhatsAppConversation } from '../../types';
// import ConversationList from './ConversationList';
// import ChatWindow from './ChatWindow';

// export default function InboxPage() {
//     const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
//     const [filter, setFilter] = useState<InboxFilter>('all');
//     const [search, setSearch] = useState('');

//     const { conversations, loading, refresh, updateConversationLocally } = useConversations(filter, search);
//     const { conversation: liveConversation } = useConversationDetail(selectedConvId);
//     const selectedConv = liveConversation || conversations.find((c) => c.id === selectedConvId) || null;

//     const { contact, setContact } = useContactDetail(selectedConv?.contact_id || null);
//     const { tags: allTags } = useTags();
//     const { users } = useCrmUsers();
//     const { addTag, removeTag, assignTo, updateStage } = useLeads(); // ← now using updateStage

//     const handleSelectConversation = useCallback((conv: WhatsAppConversation) => {
//         setSelectedConvId(conv.id);
//         if (conv.unread_count > 0) {
//             updateConversationLocally(conv.id, { unread_count: 0 });
//         }
//     }, [updateConversationLocally]);

//     // Replaced direct supabase call with the mock updateStage from useLeads
//     const handleUpdateStage = useCallback(
//         async (stage: string) => {
//             if (!contact) return;
//             await updateStage(contact.id, stage as any);
//             setContact((prev) => prev ? { ...prev, stage: stage as typeof prev.stage } : null);
//         },
//         [contact, updateStage, setContact]
//     );

//     const handleAssign = useCallback(
//         async (userId: string) => {
//             if (!contact) return;
//             await assignTo(contact.id, userId);
//             const user = users.find((u) => u.id === userId) || null;
//             setContact((prev) => prev ? { ...prev, assigned_to: userId, assigned_user: user } : null);
//         },
//         [contact, users, assignTo, setContact]
//     );

//     const handleAddTag = useCallback(
//         async (tagId: string) => {
//             if (!contact) return;
//             await addTag(contact.id, tagId);
//             const tag = allTags.find((t) => t.id === tagId);
//             if (tag) {
//                 setContact((prev) =>
//                     prev ? { ...prev, tags: [...(prev.tags || []), tag] } : null
//                 );
//             }
//         },
//         [contact, allTags, addTag, setContact]
//     );

//     const handleRemoveTag = useCallback(
//         async (tagId: string) => {
//             if (!contact) return;
//             await removeTag(contact.id, tagId);
//             setContact((prev) =>
//                 prev ? { ...prev, tags: (prev.tags || []).filter((t) => t.id !== tagId) } : null
//             );
//         },
//         [contact, removeTag, setContact]
//     );

//     return (
//         <div className="flex h-full overflow-hidden bg-white">
//             <ConversationList
//                 conversations={conversations}
//                 loading={loading}
//                 selectedId={selectedConv?.id || null}
//                 filter={filter}
//                 search={search}
//                 onSelect={handleSelectConversation}
//                 onFilterChange={setFilter}
//                 onSearchChange={setSearch}
//                 onRefresh={refresh}
//             />

//             <ChatWindow
//                 conversation={selectedConv}
//                 contact={contact}
//                 users={users}
//                 allTags={allTags}
//                 onUpdateStage={handleUpdateStage}
//                 onAssign={handleAssign}
//                 onAddTag={handleAddTag}
//                 onRemoveTag={handleRemoveTag}
//             />
//         </div>
//     );
// }// src/components/inbox/InboxPage.tsx
// import { useState, useEffect, useCallback } from 'react';
// import { whatsappAPI } from '@/lib/whatsappApi';
// import type { WhatsAppConversation, WhatsAppContact, WhatsAppMessage } from '@/types';
// import ConversationList from './ConversationList';
// import ChatWindow from './ChatWindow';

// export default function InboxPage() {
//     const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
//     const [contacts, setContacts] = useState<any>([]);
//     const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
//     const [selectedContact, setSelectedContact] = useState<any>(null);
//     const [filter, setFilter] = useState<'all' | 'unread' | 'assigned' | 'resolved'>('all');
//     const [search, setSearch] = useState('');
//     const [loading, setLoading] = useState(true);

//     // Load all contacts on mount
//     useEffect(() => {
//         const loadContacts = async () => {
//             try {
//                 const res:any = await whatsappAPI.getContacts();
//                 if (Array.isArray(res)) setContacts(res);
//             } catch (err) {
//                 console.error('Failed to load contacts', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         loadContacts();
//     }, []);

//     // Build conversation list from contacts (since API may not return conversations directly)
//     // In a real app you'd have a separate endpoint for conversations.
//     // Here we simulate by using the contact list and fetching last messages.
//     useEffect(() => {
//         console.log("first")
//         const buildConversations = async () => {
//             if (contacts.length === 0) return;
//             const convs: WhatsAppConversation[] = [];
//             for (const contact of contacts) {
//                 // Fetch last message for each contact (you might have a better way)
//                 let lastMsg = null;
//                 try {
//                     const msgs = await whatsappAPI.getMessages(contact.id);
//                     if (msgs && msgs.length) lastMsg = msgs[msgs.length - 1];
//                 } catch (e) { }
//                 convs.push({
//                     id: contact.id, // using contact id as conversation id for simplicity
//                     contact_id: contact.id,
//                     contact: contact,
//                     status: 'open', // default
//                     unread_count: 0, // you'd get this from API
//                     last_message: lastMsg?.body || '',
//                     last_message_at: lastMsg?.timestamp || contact.created_at,
//                     bot_active: false,
//                     flow_id: null,
//                     current_step_index: 0,
//                     assigned_to: contact.assigned_to || null,
//                     created_at: contact.created_at,
//                     updated_at: contact.created_at,
//                 });
//             }
//             setConversations(convs);
//         };
//         buildConversations();
//     }, [contacts]);

//     // Filter conversations locally (or you could send filter to API)
//     const filteredConversations = conversations.filter((conv) => {
//         const contact = conv.contact;
//         if (filter === 'unread') return conv.unread_count > 0 && conv.status !== 'resolved';
//         if (filter === 'assigned') return conv.assigned_to && conv.status !== 'resolved';
//         if (filter === 'resolved') return conv.status === 'resolved';
//         if (search.trim()) {
//             const s = search.toLowerCase();
//             return contact.name.toLowerCase().includes(s) || contact.phone.toLowerCase().includes(s);
//         }
//         return conv.status !== 'resolved';
//     });

//     const handleSelectConversation = useCallback(async (conv: WhatsAppConversation) => {
//         setSelectedConvId(conv.id);
//         setSelectedContact(conv.contact);
//         // Mark as read (optional – you can call an API to reset unread count)
//         if (conv.unread_count > 0) {
//             // await whatsappAPI.markConversationRead(conv.id);
//             setConversations(prev =>
//                 prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
//             );
//         }
//     }, []);

//     const handleUpdateStage = useCallback(async (stage: string) => {
//         if (!selectedContact) return;
//         try {
//             await whatsappAPI.updateContact(selectedContact.id, { stage });
//             setSelectedContact(prev => prev ? { ...prev, stage } : null);
//             setContacts(prev =>
//                 prev.map(c => c.id === selectedContact.id ? { ...c, stage } : c)
//             );
//         } catch (err) {
//             console.error('Failed to update stage', err);
//         }
//     }, [selectedContact]);

//     const handleAssign = useCallback(async (userId: string) => {
//         if (!selectedContact) return;
//         try {
//             await whatsappAPI.updateContact(selectedContact.id, { assigned_to: userId });
//             setSelectedContact(prev => prev ? { ...prev, assigned_to: userId } : null);
//             setContacts(prev =>
//                 prev.map(c => c.id === selectedContact.id ? { ...c, assigned_to: userId } : c)
//             );
//         } catch (err) {
//             console.error('Failed to assign user', err);
//         }
//     }, [selectedContact]);

//     const handleAddTag = useCallback(async (tagId: string) => {
//         if (!selectedContact) return;
//         try {
//             // await whatsappAPI.addTagToContact(selectedContact.id, tagId);
//             // const newTag = MOCK_TAGS.find(t => t.id === tagId); // you need to fetch tags from API or have a store
//             // if (newTag) {
//             //     setSelectedContact(prev =>
//             //         prev ? { ...prev, tags: [...(prev.tags || []), newTag] } : null
//             //     );
//             //     setContacts(prev =>
//             //         prev.map(c => c.id === selectedContact.id ? { ...c, tags: [...(c.tags || []), newTag] } : c)
//             //     );
//             // }
//         } catch (err) {
//             console.error('Failed to add tag', err);
//         }
//     }, [selectedContact]);

//     const handleRemoveTag = useCallback(async (tagId: string) => {
//         if (!selectedContact) return;
//         try {
//             // await whatsappAPI.removeTagFromContact(selectedContact.id, tagId);
//             // setSelectedContact(prev =>
//             //     prev ? { ...prev, tags: (prev.tags || []).filter(t => t.id !== tagId) } : null
//             // );
//             // setContacts(prev =>
//             //     prev.map(c => c.id === selectedContact.id ? { ...c, tags: (c.tags || []).filter(t => t.id !== tagId) } : c)
//             // );
//         } catch (err) {
//             console.error('Failed to remove tag', err);
//         }
//     }, [selectedContact]);

//     // You also need to pass `onAddNote` etc. – for now, we'll provide dummy functions
//     // In a real app, you'd implement them via API.

//     return (
//         <div className="flex h-full overflow-hidden bg-white">
//             <ConversationList
//                 conversations={filteredConversations}
//                 loading={loading}
//                 selectedId={selectedConvId}
//                 filter={filter}
//                 search={search}
//                 onSelect={handleSelectConversation}
//                 onFilterChange={setFilter}
//                 onSearchChange={setSearch}
//                 onRefresh={() => window.location.reload()}
//             />

//             <ChatWindow
//                 conversation={selectedConvId ? conversations.find(c => c.id === selectedConvId) || null : null}
//                 contact={selectedContact}
//                 users={[]} // you need to fetch users from API or have a separate hook
//                 allTags={[]} // fetch tags from API
//                 onUpdateStage={handleUpdateStage}
//                 onAssign={handleAssign}
//                 onAddTag={handleAddTag}
//                 onRemoveTag={handleRemoveTag}
//             />
//         </div>
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

export default function InboxPage() {
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [filter, setFilter] = useState<InboxFilter>('all');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any>([]);
    const [allTags, setAllTags] = useState<any>([]);

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
                const [usersData, tagsData] = await Promise.all([
                    whatsappAPI.getUsers(),
                    whatsappAPI.getTags()
                ]);
                setUsers(usersData || []);
                setAllTags(tagsData || []);
            } catch (err) {
                console.error('Failed to load users/tags', err);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))?.id : null;

        if (!userId) {
            console.error("❌ No userId");
            return;
        }

        const socket = connectSocket(userId);

        socket.on("chat_update", (data) => {
            console.log("🔥 REALTIME EVENT:", data);

            const { contact_id, text } = data;

            // ✅ 1. Update conversation list
            updateConversationLocally(`conv_${contact_id}`, (prev: any) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    last_message: text,
                    last_contact_time: new Date(),
                    unread_count:
                        selectedConv?.contact_id === contact_id
                            ? 0
                            : (prev.unread_count || 0) + 1,
                };
            });

            // ✅ 2. If current chat open → refresh messages
            if (selectedConv?.contact_id === contact_id) {
                refresh(); // or better: refetch messages only
            }
        });

        return () => {
            socket.off("chat_update");
        };
    }, [selectedConv, updateConversationLocally, refresh]);

    const handleSelectConversation = useCallback((conv: WhatsAppConversation) => {
        setSelectedConvId(conv.id);
        if (conv.unread_count > 0) {
            updateConversationLocally(conv.id, { unread_count: 0 });
        }
    }, [updateConversationLocally]);

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

    return (
        <div className="flex h-full overflow-hidden bg-white">
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
            />
        </div>
    );
}