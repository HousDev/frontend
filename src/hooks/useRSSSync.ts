import { useState, useEffect, useCallback } from 'react';
import { RSSSource, BlogPost } from '../types/blog';
import RSSParser from '@/pages/utils/rssParser';


export const useRSSSync = (sources: RSSSource[], onNewPosts: (posts: BlogPost[]) => void) => {
  const [syncingStatus, setSyncingStatus] = useState<{ [key: string]: boolean }>({});
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());

  const syncSingleSource = useCallback(async (source: RSSSource): Promise<BlogPost[]> => {
    if (!source.active) return [];

    setSyncingStatus(prev => ({ ...prev, [source.id]: true }));

    try {
      const posts = await RSSParser.fetchAndParseFeed(
        source.url, 
        source.name, 
        source.category
      );

      // If auto-publish is enabled, set status to published
      const processedPosts = posts.map(post => ({
        ...post,
        status: source.autoPublish ? 'published' as const : 'draft' as const,
        publishedAt: source.autoPublish ? new Date().toISOString() : ''
      }));

      return processedPosts;
    } catch (error) {
      console.error(`Error syncing RSS source ${source.name}:`, error);
      return [];
    } finally {
      setSyncingStatus(prev => ({ ...prev, [source.id]: false }));
    }
  }, []);

  const syncAllSources = useCallback(async (sources: RSSSource[]): Promise<void> => {
    const activeSources = sources.filter(source => source.active);
    let allNewPosts: BlogPost[] = [];

    for (const source of activeSources) {
      const newPosts = await syncSingleSource(source);
      allNewPosts = [...allNewPosts, ...newPosts];
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (allNewPosts.length > 0) {
      onNewPosts(allNewPosts);
      setLastSyncTime(new Date().toISOString());
    }
  }, [syncSingleSource, onNewPosts]);

  const scheduleAutoSync = useCallback((frequency: 'hourly' | 'daily' | 'weekly') => {
    const intervals = {
      hourly: 60 * 60 * 1000,      // 1 hour
      daily: 24 * 60 * 60 * 1000,  // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000 // 1 week
    };

    const interval = setInterval(() => {
      syncAllSources(sources);
    }, intervals[frequency]);

    return () => clearInterval(interval);
  }, [sources, syncAllSources]);

  // Auto-sync on component mount for active sources
  useEffect(() => {
    const activeSources = sources.filter(source => source.active);
    if (activeSources.length > 0) {
      // Check if we should sync (if last sync was more than 1 hour ago)
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const shouldSync = activeSources.some(source => source.lastSync < hourAgo);
      
      if (shouldSync) {
        syncAllSources(activeSources);
      }
    }
  }, [sources, syncAllSources]);

  return {
    syncingStatus,
    lastSyncTime,
    syncSingleSource,
    syncAllSources,
    scheduleAutoSync
  };
};

export default useRSSSync;