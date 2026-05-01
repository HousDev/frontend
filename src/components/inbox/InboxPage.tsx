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
                const [usersData, tagsData]: any = await Promise.all([
                    whatsappAPI.getUsers(),
                    whatsappAPI.getTags()
                ]);
                console.log("usre data for conata", usersData)
                setUsers(usersData.data || []);
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