// src/hooks/useCampaigns.ts
import { useState, useEffect, useCallback } from 'react';
import type { Campaign, CampaignLog } from '../types';
import { MOCK_CAMPAIGNS, MOCK_CONTACTS } from '../lib/mockData';
import { notificationStore } from '../lib/notifications';

// In‑memory stores
let campaignsStore: Campaign[] = JSON.parse(JSON.stringify(MOCK_CAMPAIGNS));
let logsStore: CampaignLog[] = [];

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    await delay(300);
    setCampaigns([...campaignsStore]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = useCallback(async (campaign: Partial<Campaign>) => {
    await delay(400);
    const newCampaign: Campaign = {
      id: `camp${Date.now()}`,
      name: campaign.name || '',
      template_id: campaign.template_id || '',
      template: campaign.template || null,
      status: campaign.status || 'draft',
      total_contacts: campaign.total_contacts || 0,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      failed_count: 0,
      scheduled_at: campaign.scheduled_at || null,
      filters: campaign.filters || {},
      created_at: new Date().toISOString(),
    } as Campaign;
    campaignsStore = [newCampaign, ...campaignsStore];
    setCampaigns([...campaignsStore]);
    notificationStore.push('campaign', 'Campaign Created', `"${newCampaign.name}" saved as draft.`,  {label:"",page:""});
    return { data: newCampaign, error: null };
  }, []);

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    await delay(300);
    const index = campaignsStore.findIndex(c => c.id === id);
    if (index !== -1) {
      campaignsStore[index] = {
        ...campaignsStore[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setCampaigns([...campaignsStore]);
      return { data: campaignsStore[index], error: null };
    }
    return { data: null, error: new Error('Campaign not found') };
  }, []);

  const launchCampaign = useCallback(async (id: string) => {
    await delay(800);
    const campaign = campaignsStore.find(c => c.id === id);
    if (!campaign) return { error: 'Campaign not found' };

    // Simulate sending messages to matched contacts
    const matchedContacts = MOCK_CONTACTS.filter(contact => {
      // Apply filters (simplified for mock)
      const filters = campaign.filters;
      if (filters.stage?.length && !filters.stage.includes(contact.stage)) return false;
      if (filters.location && !contact.preferred_location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.property_type && contact.property_type !== filters.property_type) return false;
      if (filters.tags?.length && !filters.tags.every(tagId => contact.tags?.some(t => t.id === tagId))) return false;
      return true;
    });

    const total = matchedContacts.length;
    const sent = total;
    const delivered = Math.floor(total * 0.95);
    const read = Math.floor(delivered * 0.8);
    const failed = total - sent;

    // Update campaign stats
    const index = campaignsStore.findIndex(c => c.id === id);
    if (index !== -1) {
      campaignsStore[index] = {
        ...campaignsStore[index],
        status: 'running',
        total_contacts: total,
        sent_count: sent,
        delivered_count: delivered,
        read_count: read,
        failed_count: failed,
      };
      setCampaigns([...campaignsStore]);
    }

    // Create logs for each contact (simulate)
    const newLogs: CampaignLog[] = matchedContacts.map(contact => ({
      id: `log_${Date.now()}_${contact.id}`,
      campaign_id: id,
      contact_id: contact.id,
      contact: contact,
      status: 'sent',
      error_message: null,
      created_at: new Date().toISOString(),
    }));
    logsStore = [...newLogs, ...logsStore];

    notificationStore.push('campaign', 'Campaign Launched', `"${campaign.name}" is now running.`,  {label:"",page:""});
    return { success: true };
  }, []);

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    launchCampaign,
    refresh: fetchCampaigns,
  };
}

export function useCampaignLogs(campaignId: string | null) {
  const [logs, setLogs] = useState<CampaignLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      await delay(300);
      const filtered = logsStore.filter(log => log.campaign_id === campaignId);
      setLogs(filtered);
      setLoading(false);
    };

    fetchLogs();

    // Simulate real‑time updates (poll every 5 seconds)
    const interval = setInterval(() => {
      const filtered = logsStore.filter(log => log.campaign_id === campaignId);
      setLogs(filtered);
    }, 5000);

    return () => clearInterval(interval);
  }, [campaignId]);

  return { logs, loading };
}