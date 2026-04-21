// src/hooks/useAnalytics.ts
import { useState, useEffect } from 'react';
import type { AnalyticsOverview } from '../types';
import { MOCK_ANALYTICS, MOCK_MESSAGE_VOLUME, MOCK_CAMPAIGN_STATS } from '../lib/mockData';

export function useAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaignStats, setCampaignStats] = useState<
    { name: string; sent: number; delivered: number; read: number; failed: number }[]
  >([]);
  const [messageVolume, setMessageVolume] = useState<
    { date: string; inbound: number; outbound: number }[]
  >([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Set overview from mock data
      setOverview(MOCK_ANALYTICS);

      // Set campaign stats from mock data
      setCampaignStats(MOCK_CAMPAIGN_STATS.map(stat => ({
        name: stat.name,
        sent: stat.sent,
        delivered: stat.delivered,
        read: stat.read,
        failed: stat.failed,
      })));

      // Set message volume from mock data
      setMessageVolume(MOCK_MESSAGE_VOLUME);

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  return { overview, loading, campaignStats, messageVolume };
}