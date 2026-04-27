// // src/hooks/useInbox.ts
// import { useState, useEffect, useCallback, useRef } from 'react';
// import type {
//   WhatsAppConversation,
//   WhatsAppMessage,
//   ConversationNote,
//   WhatsAppContact,
// } from '../types';

// export type InboxFilter = 'all' | 'unread' | 'assigned' | 'resolved';

// // ---------- Mock Data ----------
// const mockContacts:any = [
//   {
//     id: 'c1',
//     name: 'Rahul Sharma',
//     phone: '+91 98765 43210',
//     stage: 'Qualified',
//     email: 'rahul@email.com',
//     preferred_location: 'Wakad, Pune',
//     budget_min: 5000000,
//     budget_max: 8000000,
//     property_type: 'Apartment',
//     source: 'WhatsApp',
//     assigned_to: 'u1',
//     notes: 'Interested in 2BHK',
//     created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
//     tags: [{ id: 't1', name: 'Hot Lead', color: '#EF4444' }, { id: 't2', name: 'Buyer', color: '#3B82F6' }],
//   },
//   {
//     id: 'c2',
//     name: 'Priya Mehta',
//     phone: '+91 87654 32109',
//     stage: 'New',
//     email: 'priya@email.com',
//     preferred_location: 'Baner, Pune',
//     budget_min: 3000000,
//     budget_max: 5000000,
//     property_type: 'Villa',
//     source: 'Facebook',
//     assigned_to: null,
//     notes: '',
//     created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
//     tags: [{ id: 't3', name: 'Seller', color: '#10B981' }],
//   },
//   {
//     id: 'c3',
//     name: 'Amit Patel',
//     phone: '+91 76543 21098',
//     stage: 'Site Visit',
//     email: 'amit@email.com',
//     preferred_location: 'Hinjewadi, Pune',
//     budget_min: 7000000,
//     budget_max: 12000000,
//     property_type: 'Apartment',
//     source: 'Instagram',
//     assigned_to: 'u2',
//     notes: 'Needs parking',
//     created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
//     tags: [{ id: 't2', name: 'Buyer', color: '#3B82F6' }],
//   },
//   {
//     id: 'c4',
//     name: 'Sneha Joshi',
//     phone: '+91 65432 10987',
//     stage: 'Contacted',
//     email: '',
//     preferred_location: 'Kothrud, Pune',
//     budget_min: 4000000,
//     budget_max: 6000000,
//     property_type: 'Plot',
//     source: 'WhatsApp',
//     assigned_to: 'u1',
//     notes: '',
//     created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
//     tags: [],
//   },
// ];

// const mockConversations: WhatsAppConversation[] = [
//   {
//     id: 'conv1',
//     contact_id: 'c1',
//     contact: mockContacts[0],
//     status: 'open',
//     unread_count: 3,
//     last_message: 'When can we schedule a site visit?',
//     last_message_at: new Date(Date.now() - 1800000).toISOString(),
//     bot_active: false,
//     flow_id: null,
//     current_step_index: 0,
//     assigned_to: 'u1',
//     created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
//     updated_at: new Date(Date.now() - 1800000).toISOString(),
//   },
//   {
//     id: 'conv2',
//     contact_id: 'c2',
//     contact: mockContacts[1],
//     status: 'open',
//     unread_count: 0,
//     last_message: 'Thank you for the information!',
//     last_message_at: new Date(Date.now() - 3600000 * 2).toISOString(),
//     bot_active: true,
//     flow_id: 'flow1',
//     current_step_index: 1,
//     assigned_to: null,
//     created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
//     updated_at: new Date(Date.now() - 7200000).toISOString(),
//   },
//   {
//     id: 'conv3',
//     contact_id: 'c3',
//     contact: mockContacts[2],
//     status: 'open',
//     unread_count: 1,
//     last_message: 'Can you share the brochure?',
//     last_message_at: new Date(Date.now() - 3600000 * 5).toISOString(),
//     bot_active: false,
//     flow_id: null,
//     current_step_index: 0,
//     assigned_to: 'u2',
//     created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
//     updated_at: new Date(Date.now() - 18000000).toISOString(),
//   },
//   {
//     id: 'conv4',
//     contact_id: 'c4',
//     contact: mockContacts[3],
//     status: 'resolved',
//     unread_count: 0,
//     last_message: 'I will get back to you soon.',
//     last_message_at: new Date(Date.now() - 86400000).toISOString(),
//     bot_active: false,
//     flow_id: null,
//     current_step_index: 0,
//     assigned_to: 'u1',
//     created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
//     updated_at: new Date(Date.now() - 86400000).toISOString(),
//   },
// ];

// const mockMessages: any = {
//   conv1: [
//     { id: 'm1', conversation_id: 'conv1', direction: 'inbound', message_type: 'text', body: 'Hi, I am interested in 2BHK apartments in Wakad.', status: 'read', timestamp: new Date(Date.now() - 7200000).toISOString(), sender: null },
//     { id: 'm2', conversation_id: 'conv1', direction: 'outbound', message_type: 'text', body: 'Hello Rahul! Great to hear from you. We have some excellent properties in Wakad within your budget.', status: 'read', timestamp: new Date(Date.now() - 7000000).toISOString(), sender: { id: 'u1', name: 'Ravi Patil' } },
//     { id: 'm3', conversation_id: 'conv1', direction: 'inbound', message_type: 'text', body: 'What is the price range?', status: 'read', timestamp: new Date(Date.now() - 3600000).toISOString(), sender: null },
//     { id: 'm4', conversation_id: 'conv1', direction: 'outbound', message_type: 'text', body: 'We have options from ₹55L to ₹80L. All RERA approved projects.', status: 'delivered', timestamp: new Date(Date.now() - 3500000).toISOString(), sender: { id: 'u1', name: 'Ravi Patil' } },
//     { id: 'm5', conversation_id: 'conv1', direction: 'inbound', message_type: 'text', body: 'When can we schedule a site visit?', status: 'delivered', timestamp: new Date(Date.now() - 1800000).toISOString(), sender: null },
//   ],
//   conv2: [
//     { id: 'm6', conversation_id: 'conv2', direction: 'inbound', message_type: 'text', body: 'Hello, I want to sell my villa in Baner.', status: 'read', timestamp: new Date(Date.now() - 86400000).toISOString(), sender: null },
//     { id: 'm7', conversation_id: 'conv2', direction: 'outbound', message_type: 'template', body: 'Hi Priya, Thank you for choosing us to sell your property! We have 10,000+ verified buyers actively looking in Baner.', template_name: 'seller_welcome', status: 'read', timestamp: new Date(Date.now() - 86300000).toISOString(), sender: null },
//     { id: 'm8', conversation_id: 'conv2', direction: 'inbound', message_type: 'text', body: 'Thank you for the information!', status: 'read', timestamp: new Date(Date.now() - 7200000).toISOString(), sender: null },
//   ],
//   conv3: [
//     { id: 'm9', conversation_id: 'conv3', direction: 'inbound', message_type: 'text', body: 'I am looking for 3BHK in Hinjewadi.', status: 'read', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), sender: null },
//     { id: 'm10', conversation_id: 'conv3', direction: 'outbound', message_type: 'text', body: 'Hi Amit! We have great options in Hinjewadi IT Park area.', status: 'read', timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(), sender: { id: 'u2', name: 'Neha Kulkarni' } },
//     { id: 'm11', conversation_id: 'conv3', direction: 'inbound', message_type: 'text', body: 'Can you share the brochure?', status: 'delivered', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), sender: null },
//   ],
//   conv4: [
//     { id: 'm12', conversation_id: 'conv4', direction: 'inbound', message_type: 'text', body: 'Looking for a plot in Kothrud.', status: 'read', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), sender: null },
//     { id: 'm13', conversation_id: 'conv4', direction: 'outbound', message_type: 'text', body: 'We have several plot options in Kothrud. Let me share details.', status: 'read', timestamp: new Date(Date.now() - 86400000 * 3 + 1800000).toISOString(), sender: { id: 'u1', name: 'Ravi Patil' } },
//     { id: 'm14', conversation_id: 'conv4', direction: 'inbound', message_type: 'text', body: 'I will get back to you soon.', status: 'read', timestamp: new Date(Date.now() - 86400000).toISOString(), sender: null },
//   ],
// };

// // In‑memory stores
// let conversationsStore = [...mockConversations];
// let messagesStore: Record<string, WhatsAppMessage[]> = JSON.parse(JSON.stringify(mockMessages));
// let notesStore: Record<string, ConversationNote[]> = {};

// // ---------- useConversations Hook ----------
// export function useConversations(filter: InboxFilter, search: string) {
//   const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const intervalRef = useRef<any>(null);

//   const fetchConversations = useCallback(async () => {
//     setLoading(true);
//     // Simulate network delay
//     await new Promise((resolve) => setTimeout(resolve, 300));

//     let filtered = [...conversationsStore];

//     // Apply filter
//     if (filter === 'unread') {
//       filtered = filtered.filter((c) => c.unread_count > 0 && c.status !== 'resolved');
//     } else if (filter === 'assigned') {
//       filtered = filtered.filter((c) => c.assigned_to && c.status !== 'resolved');
//     } else if (filter === 'resolved') {
//       filtered = filtered.filter((c) => c.status === 'resolved');
//     } else {
//       filtered = filtered.filter((c) => c.status !== 'resolved');
//     }

//     // Apply search
//     if (search.trim()) {
//       const s = search.toLowerCase();
//       filtered = filtered.filter(
//         (c) =>
//           c.contact?.name?.toLowerCase().includes(s) ||
//           c.contact?.phone?.toLowerCase().includes(s)
//       );
//     }

//     setConversations(filtered);
//     setLoading(false);
//   }, [filter, search]);

//   useEffect(() => {
//     fetchConversations();

//     // Simulate real‑time updates (every 5 seconds)
//     intervalRef.current = setInterval(() => {
//       fetchConversations();
//     }, 5000);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [fetchConversations]);

//   const updateConversationLocally = useCallback((id: string, patch: Partial<WhatsAppConversation>) => {
//     const index = conversationsStore.findIndex((c) => c.id === id);
//     if (index !== -1) {
//       conversationsStore[index] = { ...conversationsStore[index], ...patch };
//       setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
//     }
//   }, []);

//   return { conversations, loading, refresh: fetchConversations, updateConversationLocally };
// }

// // ---------- useMessages Hook ----------
// export function useMessages(conversationId: string | null) {
//   const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
//   const [loading, setLoading] = useState(false);
//   const intervalRef = useRef<any>(null);

//   const fetchMessages = useCallback(async () => {
//     if (!conversationId) return;
//     setLoading(true);
//     await new Promise((resolve) => setTimeout(resolve, 200));
//     const convMessages = messagesStore[conversationId] || [];
//     setMessages(convMessages);
//     setLoading(false);
//   }, [conversationId]);

//   useEffect(() => {
//     if (!conversationId) {
//       setMessages([]);
//       return;
//     }
//     fetchMessages();

//     // Poll for new messages every 2 seconds (simulate real‑time)
//     intervalRef.current = setInterval(() => {
//       fetchMessages();
//     }, 2000);

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [conversationId, fetchMessages]);

//   const markRead = useCallback(async () => {
//     if (!conversationId) return;
//     await new Promise((resolve) => setTimeout(resolve, 100));
//     const convIndex = conversationsStore.findIndex((c) => c.id === conversationId);
//     if (convIndex !== -1 && conversationsStore[convIndex].unread_count > 0) {
//       conversationsStore[convIndex].unread_count = 0;
//     }
//   }, [conversationId]);

//   return { messages, loading, refresh: fetchMessages, markRead };
// }

// // ---------- useNotes Hook ----------
// export function useNotes(conversationId: string | null) {
//   const [notes, setNotes] = useState<ConversationNote[]>([]);

//   useEffect(() => {
//     if (!conversationId) {
//       setNotes([]);
//       return;
//     }
//     // Load notes from store
//     const convNotes = notesStore[conversationId] || [];
//     setNotes(convNotes);
//   }, [conversationId]);

//   const addNote = useCallback(
//     async (body: string) => {
//       if (!conversationId || !body.trim()) return;
//       await new Promise((resolve) => setTimeout(resolve, 200));
//       const newNote: any = {
//         id: `note_${Date.now()}`,
//         conversation_id: conversationId,
//         body: body.trim(),
//         author: { id: 'u1', name: 'Current User' },
//         created_at: new Date().toISOString(),
//       };
//       if (!notesStore[conversationId]) notesStore[conversationId] = [];
//       notesStore[conversationId].push(newNote);
//       setNotes((prev) => [...prev, newNote]);
//     },
//     [conversationId]
//   );

//   return { notes, addNote };
// }

// // ---------- useSendMessage Hook ----------
// export function useSendMessage() {
//   const sendTextMessage = useCallback(
//     async (conversationId: string, contactId: string, phone: string, text: string) => {
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       const newMessage: any = {
//         id: `msg_${Date.now()}`,
//         conversation_id: conversationId,
//         direction: 'outbound',
//         message_type: 'text',
//         body: text,
//         status: 'sent',
//         timestamp: new Date().toISOString(),
//         sender: { id: 'u1', name: 'You' },
//       };
//       if (!messagesStore[conversationId]) messagesStore[conversationId] = [];
//       messagesStore[conversationId].push(newMessage);

//       // Update conversation's last message
//       const convIndex = conversationsStore.findIndex((c) => c.id === conversationId);
//       if (convIndex !== -1) {
//         conversationsStore[convIndex].last_message = text;
//         conversationsStore[convIndex].last_message_at = new Date().toISOString();
//       }
//       return { success: true, message: newMessage };
//     },
//     []
//   );

//   const sendTemplate = useCallback(
//     async (conversationId: string, contactId: string, phone: string, templateName: string, vars: string[]) => {
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       const body = `Template: ${templateName} with vars: ${vars.join(', ')}`;
//       const newMessage: any = {
//         id: `msg_${Date.now()}`,
//         conversation_id: conversationId,
//         direction: 'outbound',
//         message_type: 'template',
//         body,
//         template_name: templateName,
//         status: 'sent',
//         timestamp: new Date().toISOString(),
//         sender: { id: 'u1', name: 'You' },
//       };
//       if (!messagesStore[conversationId]) messagesStore[conversationId] = [];
//       messagesStore[conversationId].push(newMessage);

//       const convIndex = conversationsStore.findIndex((c) => c.id === conversationId);
//       if (convIndex !== -1) {
//         conversationsStore[convIndex].last_message = body;
//         conversationsStore[convIndex].last_message_at = new Date().toISOString();
//       }
//       return { success: true, message: newMessage };
//     },
//     []
//   );

//   return { sendTextMessage, sendTemplate };
// }

// // ---------- useContactDetail Hook ----------
// export function useContactDetail(contactId: string | null) {
//   const [contact, setContact] = useState<WhatsAppContact | null>(null);

//   useEffect(() => {
//     if (!contactId) {
//       setContact(null);
//       return;
//     }
//     const found = mockContacts.find((c) => c.id === contactId);
//     setContact(found || null);
//   }, [contactId]);

//   return { contact, setContact };
// }

// // ---------- useConversationDetail Hook ----------
// export function useConversationDetail(conversationId: string | null) {
//   const [conversation, setConversation] = useState<WhatsAppConversation | null>(null);

//   useEffect(() => {
//     if (!conversationId) {
//       setConversation(null);
//       return;
//     }
//     const found = conversationsStore.find((c) => c.id === conversationId);
//     setConversation(found || null);
//   }, [conversationId]);

//   return { conversation, setConversation };
// }

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

export type InboxFilter = 'all' | 'unread' | 'assigned' | 'resolved';

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
      
      // Apply filter
      let filtered = convs;
      if (filter === 'unread') {
        filtered = filtered.filter((c) => c.unread_count > 0 && c.status !== 'resolved');
      } else if (filter === 'assigned') {
        filtered = filtered.filter((c) => c.assigned_to && c.status !== 'resolved');
      } else if (filter === 'resolved') {
        filtered = filtered.filter((c) => c.status === 'resolved');
      } else {
        filtered = filtered.filter((c) => c.status !== 'resolved');
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