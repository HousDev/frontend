// src/hooks/useInbox.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { whatsappAPI } from '../lib/whatsappApi';
import type {
  WhatsAppConversation,
  WhatsAppMessage,
  ConversationNote,
  WhatsAppContact,
  CrmUser,
} from '../types';
import { useAuth } from '@/contexts/AuthContext';

export type InboxFilter = 'all' | 'unread' | 'assigned' | 'buyer' | 'seller';

interface FormattedConversation {
  id: string;
  contact_id: number;
  contact: any;
  status: string;
  unread_count: number;
  last_message: string;
  last_message_at: string;
  bot_active: boolean;
  flow_id: null;
  current_step_index: number;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface FormattedMessage {
  id: number;
  conversation_id: string;
  direction: string;
  message_type: string;
  body: string;
  text: string;
  status: string;
  is_read: boolean;
  timestamp: string;
  sender: { id: string; name: string } | null;
}

interface FormattedNote {
  id: number;
  conversation_id: string;
  body: string;
  author: { id: number | null; name: string };
  created_at: string;
}

// ---------- useConversations Hook ----------
export function useConversations(filter: InboxFilter, search: string) {
  const [conversations, setConversations] = useState<FormattedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const contacts = await whatsappAPI.getContacts();
      
      const convs = await Promise.all(
        (contacts || []).map(async (contact: any) => {
          let lastMsg = null;
          let unreadCount = 0;
          
          try {
            const msgs = await whatsappAPI.getMessages(contact.id);
            if (msgs && msgs.length) {
              lastMsg = msgs[msgs.length - 1];
              unreadCount = msgs.filter((m: any) => 
                m.direction === 'in' && m.is_read === 0
              ).length;
            }
          } catch (e) {
            console.error('Failed to fetch messages for contact', contact.id, e);
          }
          
          return {
            id: `conv_${contact.id}`,
            contact_id: contact.id,
            contact: contact,
            status: 'open',
            unread_count: unreadCount,
            last_message: lastMsg?.text || contact.last_message || '',
            last_message_at: lastMsg?.time_sent || contact.last_contact_time || contact.created_at || new Date().toISOString(),
            bot_active: false,
            flow_id: null,
            current_step_index: 0,
            assigned_to: contact.assigned_to || null,
            created_at: contact.created_at,
            updated_at: contact.updated_at || contact.created_at,
          };
        })
      );
      
      let filtered = convs;

      if (filter === 'unread') {
        filtered = filtered.filter((c) => c.unread_count > 0);
      }
      else if (filter === 'assigned') {
        filtered = filtered.filter((c) => c.assigned_to);
      }
      else if (filter === 'buyer') {
        filtered = filtered.filter((c) => {
          const tags = c.contact?.tags || [];
          return tags.some((t: any) => t.name?.toLowerCase() === 'buyer');
        });
      }
      else if (filter === 'seller') {
        filtered = filtered.filter((c) => {
          const tags = c.contact?.tags || [];
          return tags.some((t: any) => t.name?.toLowerCase() === 'seller');
        });
      }

      if (search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.contact?.name?.toLowerCase().includes(s) ||
            c.contact?.phone?.toLowerCase().includes(s)
        );
      }

      filtered.sort((a, b) => {
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });

      setConversations(filtered);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchConversations();

    intervalRef.current = setInterval(() => {
      fetchConversations();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchConversations]);

  const updateConversationLocally = useCallback((id: string, patch: Partial<FormattedConversation>) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  return { conversations, loading, refresh: fetchConversations, updateConversationLocally };
}

// ---------- useMessages Hook ----------
export function useMessages(contactId: string | null) {
  const [messages, setMessages] = useState<FormattedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const msgs = await whatsappAPI.getMessages(contactId);
      const formatted = (msgs || []).map((msg: any) => ({
        id: msg.id,
        conversation_id: `conv_${msg.contact_id}`,
        direction: msg.direction === 'out' ? 'out' : 'in',
        message_type: 'text',
        body: msg.text,
        text: msg.text,
        status: msg.is_read ? 'read' : 'delivered',
        is_read: msg.is_read || false,
        timestamp: msg.time_sent,
        sender: msg.direction === 'out' ? { id: 'current', name: 'You' } : null
      }));
      setMessages(formatted);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    if (!contactId) {
      setMessages([]);
      return;
    }
    fetchMessages();

    intervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [contactId, fetchMessages]);

  const markRead = useCallback(async () => {
    if (!contactId) return;
    try {
      await whatsappAPI.markMessagesAsRead(contactId);
      await fetchMessages();
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [contactId, fetchMessages]);

  return { messages, loading, refresh: fetchMessages, markRead };
}

// ---------- useNotes Hook ----------
export function useNotes(conversationId: string | null) {
  const [notes, setNotes] = useState<ConversationNote[]>([]);
  const { user } = useAuth()

  useEffect(() => {
    if (!conversationId) {
      setNotes([]);
      return;
    }
    
    const fetchNotes = async () => {
      try {
        const notesData = await whatsappAPI.getContactNotes(conversationId);
        const formattedNotes: ConversationNote[] = (notesData || []).map((note: any) => ({
          id: note.id,
          conversation_id: conversationId,
          body: note.note,
          author_id: note.author_id || null,
          author_name: note.author_name || 'System',
          created_at: note.created_at,
          updated_at: note.updated_at,
        }));
        setNotes(formattedNotes);
      } catch (err) {
        console.error('Failed to fetch notes', err);
      }
    };
    
    fetchNotes();
  }, [conversationId]);

  const addNote = useCallback(async (body: string) => {
    if (!conversationId || !body.trim()) return;
    try {
      await whatsappAPI.addNote(conversationId, user?.id, body);
      // Refresh notes after adding
      const notesData = await whatsappAPI.getContactNotes(conversationId);
      const formattedNotes: ConversationNote[] = (notesData || []).map((note: any) => ({
        id: note.id,
        conversation_id: conversationId,
        body: note.note,
        author_id: note.author_id || null,
        author_name: note.author_name || 'System',
        created_at: note.created_at,
        updated_at: note.updated_at,
      }));
      setNotes(formattedNotes);
    } catch (err) {
      console.error('Failed to add note', err);
    }
  }, [conversationId, user]);

  return { notes, addNote };
}

// ---------- useSendMessage Hook ----------
export function useSendMessage() {
  const sendTextMessage = useCallback(
    async (conversationId: string, contactId: string, phone: string, text: string) => {
      try {
        const result: any = await whatsappAPI.sendMessage({ contact_id: contactId, text });
        const newMessage = {
          id: result.id || `msg_${Date.now()}`,
          conversation_id: conversationId,
          direction: 'out',
          message_type: 'text',
          body: text,
          text: text,
          status: 'sent',
          is_read: true,
          timestamp: new Date().toISOString(),
          sender: { id: 'current', name: 'You' },
        };
        return { success: true, message: newMessage };
      } catch (err) {
        console.error('Failed to send message', err);
        throw err;
      }
    },
    []
  );

  const sendTemplate = useCallback(
    async (conversationId: string, contactId: string, phone: string, templateName: string, vars: string[]) => {
      console.log('Send template - to be implemented');
      return { success: false, message: null };
    },
    []
  );

  return { sendTextMessage, sendTemplate };
}

// ---------- useContactDetail Hook ----------
export function useContactDetail(contactId: string | null) {
  const [contact, setContact] = useState<WhatsAppContact | null>(null);

  useEffect(() => {
    if (!contactId) {
      setContact(null);
      return;
    }

    const fetchContact = async () => {
      try {
        const data: any = await whatsappAPI.getContactById(contactId);
        setContact(data);
      } catch (error) {
        console.error("Error fetching contact:", error);
      }
    };

    fetchContact();
  }, [contactId]);

  return { contact, setContact };
}

// ---------- useConversationDetail Hook ----------
export function useConversationDetail(conversationId: string | null) {
  const [conversation, setConversation] = useState<WhatsAppConversation | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      return;
    }
    
    const fetchConversation = async () => {
      try {
        // ✅ FIX: Remove "conv_" prefix
        const cleanId = conversationId.replace("conv_", "");
        const contact = await whatsappAPI.getContactById(cleanId);
        
        if (contact) {
          let unreadCount = 0;
          try {
            const msgs = await whatsappAPI.getMessages(contact.id);
            unreadCount = msgs.filter((m: any) => 
              m.direction === 'in' && m.is_read === 0
            ).length;
          } catch (e) {
            console.error('Failed to get unread count', e);
          }
          
          setConversation({
            id: `conv_${contact.id}`,
            contact_id: String(contact.id),
            contact: contact as unknown as WhatsAppContact,
            status: 'open',
            unread_count: unreadCount,
            last_message: contact.last_message || '',
            last_message_at: contact.last_contact_time || (contact as any).created_at || new Date().toISOString(),
            bot_active: false,
            flow_id: null,
            current_step_index: 0,
            assigned_to: contact.assigned_to || null,
            created_at: (contact as any).created_at || new Date().toISOString(),
            updated_at: (contact as any).updated_at || (contact as any).created_at || new Date().toISOString(),
          } as WhatsAppConversation);
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };
    
    fetchConversation();
  }, [conversationId]);

  return { conversation, setConversation };
}