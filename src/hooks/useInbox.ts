// src/hooks/useInbox.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { whatsappAPI } from '../lib/whatsappApi';
import type {
  WhatsAppConversation,
  WhatsAppMessage,
  ConversationNote,
  WhatsAppContact,
} from '../types';
import { useAuth } from '@/contexts/AuthContext';

export type InboxFilter = 'all' | 'unread' | 'new' | 'assigned' | 'buyer' | 'seller';

// ---------- useConversations Hook (Uses Real Backend) ----------
export function useConversations(filter: InboxFilter, search: string) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<any>(null);
  const { user } = useAuth()

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch contacts from backend
      const contacts = await whatsappAPI.getContacts();
      
      // Build conversations from contacts
      const convs = await Promise.all(
        (contacts || []).map(async (contact: any) => {
          let lastMsg = null;
          try {
            const msgs = await whatsappAPI.getMessages(contact.id);
            if (msgs && msgs.length) {
              lastMsg = msgs[msgs.length - 1];
            }
          } catch (e) {
            console.error('Failed to fetch messages for contact', contact.id, e);
          }
          
          return {
            id: contact.id,
            contact_id: contact.id,
            contact: contact,
            status: 'open',
            unread_count: 0,
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
else if (filter === 'new') {
  filtered = filtered.filter((c) => c.contact?.is_new === true);
}
else if (filter === 'assigned') {
  filtered = filtered.filter((c) => c.assigned_to);
}
else if (filter === 'buyer') {
  filtered = filtered.filter((c) => c.contact?.type === 'buyer');
}
else if (filter === 'seller') {
  filtered = filtered.filter((c) => c.contact?.type === 'seller');
}
else {
  filtered = convs;
}

      // Apply search
      if (search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.contact?.name?.toLowerCase().includes(s) ||
            c.contact?.phone?.toLowerCase().includes(s)
        );
      }

      setConversations(filtered);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchConversations();

    // Poll for updates every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchConversations();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchConversations]);

  const updateConversationLocally = useCallback((id: string, patch: Partial<WhatsAppConversation>) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  return { conversations, loading, refresh: fetchConversations, updateConversationLocally };
}

// ---------- useMessages Hook (Uses Real Backend) ----------
export function useMessages(contactId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<any>(null);

  const fetchMessages = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const msgs = await whatsappAPI.getMessages(contactId);
      // Format messages for frontend compatibility
      const formatted = (msgs || []).map((msg: any) => ({
        id: msg.id,
        conversation_id: `conv_${msg.contact_id}`,
        direction: msg.direction === 'out' ? 'out' : 'in',
        message_type: 'text',
        body: msg.text,
        text: msg.text,
        status: msg.is_read ? 'read' : 'delivered',
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

    // Poll for new messages every 3 seconds
    intervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [contactId, fetchMessages]);

  const markRead = useCallback(async () => {
    if (!contactId) return;
    // Will implement when backend supports mark as read
    console.log('Mark read - to be implemented');
  }, [contactId]);

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
    // Notes will be implemented when backend is ready
    setNotes([]);
  }, [conversationId]);

  const addNote = useCallback(async (body: string) => {
    if (!conversationId || !body.trim()) return;
    try {
      // Extract contact_id from conversationId (since conversationId = contactId in our setup)
      await whatsappAPI.addNote(conversationId, user.id, body);
      const newNote: any = {
        id: `note_${Date.now()}`,
        conversation_id: conversationId,
        body: body.trim(),
        author: { id: 'current', name: 'You' },
        created_at: new Date().toISOString(),
      };
      setNotes((prev) => [...prev, newNote]);
    } catch (err) {
      console.error('Failed to add note', err);
    }
  }, [conversationId]);

  return { notes, addNote };
}

// ---------- useSendMessage Hook (Uses Real Backend) ----------
export function useSendMessage() {
  const sendTextMessage = useCallback(
    async (conversationId: string, contactId: string, phone: string, text: string) => {
      try {
        const result:any = await whatsappAPI.sendMessage({ contact_id: contactId, text });
        const newMessage: any = {
          id: result.id || `msg_${Date.now()}`,
          conversation_id: conversationId,
          direction: 'outbound',
          message_type: 'text',
          body: text,
          text: text,
          status: 'sent',
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
      // Will implement when backend supports templates
      console.log('Send template - to be implemented');
      return { success: false, message: null };
    },
    []
  );

  return { sendTextMessage, sendTemplate };
}

// ---------- useContactDetail Hook (Uses Real Backend) ----------
export function useContactDetail(contactId: string | null) {
  const [contact, setContact] = useState<WhatsAppContact | null>(null);

  useEffect(() => {
  if (!contactId) {
    setContact(null);
    return;
  }

  const fetchContact = async () => {
    try {
      const data:any = await whatsappAPI.getContactById(contactId);
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
    // Since we don't have conversations table, fetch contact and build conversation
    whatsappAPI.getContactById(conversationId).then((contact:any) => {
      if (contact) {
        setConversation({
          id: contact.id,
          contact_id: contact.id,
          contact: contact,
          status: 'open',
          unread_count: 0,
          last_message: contact.last_message || '',
          last_message_at: contact.last_contact_time || contact.created_at,
          bot_active: false,
          flow_id: null,
          current_step_index: 0,
          assigned_to: contact.assigned_to || null,
          created_at: contact.created_at,
          updated_at: contact.updated_at || contact.created_at,
        });
      }
    }).catch(console.error);
  }, [conversationId]);

  return { conversation, setConversation };
}