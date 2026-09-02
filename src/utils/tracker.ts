// frontend/src/utils/tracker.ts
import { api } from '@/lib/api';

/**
 * Get or create a permanent guest UUID in localStorage
 * This survives page reloads, tab closes, and browser restarts.
 */
export const getGuestId = (): string => {
  if (typeof window === 'undefined') return '';
  let guestId = localStorage.getItem('app_guest_uuid');
  if (!guestId) {
    guestId = 'gst_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('app_guest_uuid', guestId);
  }
  return guestId;
};

/**
 * Get or create a session UUID in sessionStorage
 * This represents a single continuous browsing session (until tab/browser closes).
 */
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('app_session_uuid');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    sessionStorage.setItem('app_session_uuid', sessionId);
  }
  return sessionId;
};

/**
 * Detect current portal/source from path or user role
 */
export const detectSource = (pathname: string, userRole?: string): string => {
  const p = pathname.toLowerCase();

  if (p.includes('/admin') || p.startsWith('/dashboard/admin')) return 'admin';
  if (p.includes('buyer-dashboard') || p.includes('buyer-account') || p.includes('/buyer')) return 'buyer_portal';
  if (p.includes('seller-dashboard') || p.includes('seller-account') || p.includes('/seller')) return 'seller_portal';
  if (p.includes('owner-dashboard') || p.includes('owner-account') || p.includes('/owner')) return 'owner_portal';
  if (p.includes('tenant-dashboard') || p.includes('tenant-account') || p.includes('/tenant')) return 'tenant_portal';
  if (p.startsWith('/dashboard')) return 'crm_portal';

  if (userRole) {
    const r = userRole.toLowerCase().trim();
    if (r === 'buyer') return 'buyer_portal';
    if (r === 'seller') return 'seller_portal';
    if (r === 'owner') return 'owner_portal';
    if (r === 'tenant') return 'tenant_portal';
  }

  return 'website';
};

export interface TrackEventParams {
  eventType: 'page' | 'property' | 'search' | 'calculator' | 'engagement' | 'portal' | 'auth' | string;
  eventName: string;
  propertyId?: number | null;
  payload?: Record<string, any> | null;
  source?: string;
  pageUrl?: string;
}

/**
 * Non-blocking, fire-and-forget visitor & user event tracker
 */
export const trackEvent = async (params: TrackEventParams): Promise<void> => {
  try {
    if (typeof window === 'undefined') return;

    const guestId = getGuestId();
    const sessionId = getSessionId();
    const currentPath = window.location.pathname + window.location.search;

    let user: any = null;
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) user = JSON.parse(rawUser);
    } catch (e) {
      // Ignore user parsing errors
    }

    const resolvedUserId =
      user?.id ||
      user?.user_id ||
      user?.buyer_id ||
      user?.seller_id ||
      (user?.buyer && user?.buyer?.id) ||
      (user?.seller && user?.seller?.id) ||
      null;

    const userRole = (user?.role || user?.type || '').toLowerCase().trim();

    // ⛔ DO NOT track admin activities
    if (userRole === 'admin' || params.source === 'admin' || window.location.pathname.startsWith('/dashboard/admin') || window.location.pathname.startsWith('/admin')) {
      return;
    }

    const payloadData = {
      guest_id: guestId,
      user_id: resolvedUserId,
      source: params.source || detectSource(window.location.pathname, userRole),
      session_id: sessionId,
      event_type: params.eventType,
      event_name: params.eventName,
      page_url: params.pageUrl || currentPath,
      property_id: params.propertyId || null,
      payload: params.payload || null,
    };

    // Asynchronous non-blocking post
    api.post('/analytics/track-event', payloadData).catch(() => {
      // Fail silently to never interrupt user browsing
    });
  } catch (err) {
    // Fail silently
  }
};

export default {
  getGuestId,
  getSessionId,
  detectSource,
  trackEvent,
};
