// src/hooks/useLeads.ts
import { useState, useEffect, useCallback } from 'react';
import type { WhatsAppContact, ContactStage, Tag, CrmUser } from '../types';

// ---------- Mock Data ----------
const mockTags: any = [
  { id: 't1', name: 'Hot Lead', color: '#EF4444' },
  { id: 't2', name: 'Buyer', color: '#3B82F6' },
  { id: 't3', name: 'Seller', color: '#10B981' },
  { id: 't4', name: 'Investor', color: '#8B5CF6' },
  { id: 't5', name: 'VIP', color: '#F59E0B' },
];

const mockUsers: any = [
  { id: 'u1', name: 'Ravi Patil', email: 'ravi@company.com', role: 'admin', is_active: true },
  { id: 'u2', name: 'Neha Kulkarni', email: 'neha@company.com', role: 'sales', is_active: true },
  { id: 'u3', name: 'Suresh Deshpande', email: 'suresh@company.com', role: 'pre_sales', is_active: false },
];

const mockContacts: any= [
  {
    id: 'c1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    stage: 'Qualified',
    email: 'rahul@email.com',
    preferred_location: 'Wakad, Pune',
    budget_min: 5000000,
    budget_max: 8000000,
    property_type: 'Apartment',
    source: 'WhatsApp',
    assigned_to: 'u1',
    notes: 'Interested in 2BHK',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    tags: [mockTags[0], mockTags[1]],
  },
  {
    id: 'c2',
    name: 'Priya Mehta',
    phone: '+91 87654 32109',
    stage: 'New',
    email: 'priya@email.com',
    preferred_location: 'Baner, Pune',
    budget_min: 3000000,
    budget_max: 5000000,
    property_type: 'Villa',
    source: 'Facebook',
    assigned_to: null,
    notes: '',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    tags: [mockTags[2]],
  },
  {
    id: 'c3',
    name: 'Amit Patel',
    phone: '+91 76543 21098',
    stage: 'Site Visit',
    email: 'amit@email.com',
    preferred_location: 'Hinjewadi, Pune',
    budget_min: 7000000,
    budget_max: 12000000,
    property_type: 'Apartment',
    source: 'Instagram',
    assigned_to: 'u2',
    notes: 'Needs parking',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    tags: [mockTags[1]],
  },
  {
    id: 'c4',
    name: 'Sneha Joshi',
    phone: '+91 65432 10987',
    stage: 'Contacted',
    email: '',
    preferred_location: 'Kothrud, Pune',
    budget_min: 4000000,
    budget_max: 6000000,
    property_type: 'Plot',
    source: 'WhatsApp',
    assigned_to: 'u1',
    notes: '',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: [],
  },
];

// In‑memory store for contacts (will be mutated)
let contactsStore: WhatsAppContact[] = JSON.parse(JSON.stringify(mockContacts));
let nextContactId = 5;

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- useLeads Hook ----------
export function useLeads(search = '', tagFilter: string[] = [], stageFilter: ContactStage[] = []) {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    await delay(300);

    let filtered = [...contactsStore];

    // Apply search (name or phone)
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(s) || c.phone.toLowerCase().includes(s)
      );
    }

    // Apply stage filter
    if (stageFilter.length > 0) {
      filtered = filtered.filter((c) => stageFilter.includes(c.stage));
    }

    // Apply tag filter (must have ALL selected tags)
    if (tagFilter.length > 0) {
      filtered = filtered.filter((c) =>
        tagFilter.every((tf) => c.tags?.some((t) => t.id === tf))
      );
    }

    setContacts(filtered);
    setLoading(false);
  }, [search, tagFilter.join(','), stageFilter.join(',')]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const updateStage = useCallback(async (contactId: string, stage: ContactStage) => {
    await delay(300);
    const index = contactsStore.findIndex((c) => c.id === contactId);
    if (index !== -1) {
      contactsStore[index] = { ...contactsStore[index], stage, updated_at: new Date().toISOString() };
      await fetchContacts(); // refresh the list
    }
  }, [fetchContacts]);

  const assignTo = useCallback(async (contactId: string, userId: string) => {
    await delay(300);
    const index = contactsStore.findIndex((c) => c.id === contactId);
    if (index !== -1) {
      contactsStore[index] = { ...contactsStore[index], assigned_to: userId, updated_at: new Date().toISOString() };
      await fetchContacts();
    }
  }, [fetchContacts]);

  const addTag = useCallback(async (contactId: string, tagId: string) => {
    await delay(300);
    const tag = mockTags.find((t) => t.id === tagId);
    if (!tag) return;
    const index = contactsStore.findIndex((c) => c.id === contactId);
    if (index !== -1) {
      const currentTags = contactsStore[index].tags || [];
      if (!currentTags.some((t) => t.id === tagId)) {
        contactsStore[index] = {
          ...contactsStore[index],
          tags: [...currentTags, tag],
          updated_at: new Date().toISOString(),
        };
        await fetchContacts();
      }
    }
  }, [fetchContacts]);

  const removeTag = useCallback(async (contactId: string, tagId: string) => {
    await delay(300);
    const index = contactsStore.findIndex((c) => c.id === contactId);
    if (index !== -1) {
      const currentTags = contactsStore[index].tags || [];
      contactsStore[index] = {
        ...contactsStore[index],
        tags: currentTags.filter((t) => t.id !== tagId),
        updated_at: new Date().toISOString(),
      };
      await fetchContacts();
    }
  }, [fetchContacts]);

  const updateContact = useCallback(async (contactId: string, updates: Partial<WhatsAppContact>) => {
    await delay(300);
    const index = contactsStore.findIndex((c) => c.id === contactId);
    if (index !== -1) {
      contactsStore[index] = {
        ...contactsStore[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await fetchContacts();
    }
  }, [fetchContacts]);

  const createContact = useCallback(async (contact: Partial<WhatsAppContact>) => {
    await delay(300);
    const newContact: any = {
      id: `c${nextContactId++}`,
      name: contact.name || '',
      phone: contact.phone || '',
      stage: contact.stage || 'New',
      email: contact.email,
      preferred_location: contact.preferred_location,
      budget_min: contact.budget_min,
      budget_max: contact.budget_max,
      property_type: contact.property_type,
      source: contact.source || 'manual',
      assigned_to: contact.assigned_to || null,
      notes: contact.notes || '',
      created_at: new Date().toISOString(),
      tags: [],
    };
    contactsStore = [newContact, ...contactsStore];
    await fetchContacts();
    return newContact;
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    refresh: fetchContacts,
    updateStage,
    assignTo,
    addTag,
    removeTag,
    updateContact,
    createContact, // added for completeness
  };
}

// ---------- useTags Hook ----------
export function useTags() {
  const [tags, setTags] = useState<Tag[]>(mockTags);

  const createTag = useCallback(async (name: string, color: string) => {
    await delay(300);
    const newTag: any = {
      id: `t${Date.now()}`,
      name,
      color,
    };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  }, []);

  return { tags, createTag };
}

// ---------- useCrmUsers Hook ----------
export function useCrmUsers() {
  const [users, setUsers] = useState<CrmUser[]>(mockUsers.filter((u) => u.is_active));

  // Simulate fetching (no real async needed, but keep the hook shape)
  useEffect(() => {
    // Already set in state
  }, []);

  return { users };
}