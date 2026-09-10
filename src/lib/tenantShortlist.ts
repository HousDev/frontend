import { tenantAPI } from '@/lib/tenantAPI';

const BASE_SHORTLIST_KEY = 'tenant_shortlisted_properties';

export function getShortlistStorageKey(): string {
  try {
    const rawUser = localStorage.getItem('user');
    const rawVerified = localStorage.getItem('verified_tenant');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      const identifier = user.id || user.email || user.username || 'tenant';
      return `${BASE_SHORTLIST_KEY}_${identifier}`;
    }
    if (rawVerified) {
      const v = JSON.parse(rawVerified);
      const identifier = v.email || v.phone || 'verified';
      return `${BASE_SHORTLIST_KEY}_${identifier}`;
    }
    return BASE_SHORTLIST_KEY;
  } catch {
    return BASE_SHORTLIST_KEY;
  }
}

export interface ShortlistedRentalProperty {
  id: number | string;
  slug?: string;
  title: string;
  society_name?: string;
  location?: string;
  city?: string;
  unit_type?: string;
  monthly_rent?: number;
  security_deposit?: number;
  carpet_area?: number | string;
  furnishing_status?: string;
  cover_image?: string;
  photos?: string[] | any[];
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  owner_whatsapp?: string;
  shortlisted_at: string;
}

// Background sync helper to persist shortlist to backend database
async function syncShortlistToDatabase(list: ShortlistedRentalProperty[]) {
  try {
    const rawUser = localStorage.getItem('user');
    const rawVerified = localStorage.getItem('verified_tenant');
    const u = rawUser ? JSON.parse(rawUser) : null;
    const v = rawVerified ? JSON.parse(rawVerified) : null;
    const tenantIdentifier = u?.tenant_id || u?.id || u?.email || v?.email || v?.phone;

    if (tenantIdentifier) {
      await tenantAPI.update(tenantIdentifier, {
        shortlisted_properties: list
      });
    }
  } catch (e) {
    // Silent fail gracefully on network or offline
  }
}

export function getTenantShortlist(): ShortlistedRentalProperty[] {
  try {
    const key = getShortlistStorageKey();
    const userSpecific = key ? localStorage.getItem(key) : null;
    const baseFallback = localStorage.getItem(BASE_SHORTLIST_KEY);

    const raw = userSpecific || baseFallback;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isTenantShortlisted(propertyId: number | string | null | undefined): boolean {
  if (!propertyId) return false;
  const list = getTenantShortlist();
  return list.some((p) => String(p.id) === String(propertyId));
}

export function saveTenantShortlist(property: any): boolean {
  if (!property || !property.id) return false;
  const key = getShortlistStorageKey() || BASE_SHORTLIST_KEY;

  let list: ShortlistedRentalProperty[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    }
  } catch {}

  const exists = list.some((p) => String(p.id) === String(property.id));
  if (exists) return false;

  let cover = property.cover_image || property.property_image || property.image || property.main_image || '/property.png';
  if (Array.isArray(property.photos) && property.photos.length > 0) {
    const first = property.photos[0];
    cover = typeof first === 'object' && first?.url ? first.url : first;
  }

  const newEntry: ShortlistedRentalProperty = {
    id: property.id,
    slug: property.slug || `rent-${property.id}`,
    title: property.title || (property.society_name ? `${property.unit_type || '2 BHK'} in ${property.society_name}` : `Rental Home #${property.id}`),
    society_name: property.society_name || '',
    location: property.location || property.locality || property.location_name || 'Pune',
    city: property.city || property.city_name || 'Pune',
    unit_type: property.unit_type || '2 BHK',
    monthly_rent: Number(property.monthly_rent || property.expected_rent || property.price || 0),
    security_deposit: Number(property.security_deposit || property.deposit || 0),
    carpet_area: property.carpet_area || property.square_feet || 900,
    furnishing_status: property.furnishing_status || property.furnishing || 'Semi-Furnished',
    cover_image: cover,
    photos: property.photos || [cover],
    owner_name: property.owner_name || property.owner?.name || 'Property Owner',
    owner_phone: property.owner_phone || property.owner?.phone || '',
    owner_email: property.owner_email || property.owner?.email || '',
    owner_whatsapp: property.owner_whatsapp || property.owner?.whatsapp || '',
    shortlisted_at: new Date().toISOString(),
  };

  list.unshift(newEntry);
  localStorage.setItem(key, JSON.stringify(list));

  // Also sync with user and tenant specific shortlisted ID sets
  try {
    const rawUser = localStorage.getItem('user');
    const u = rawUser ? JSON.parse(rawUser) : null;
    const uid = u?.id || u?.tenant_id;
    if (uid) {
      const idKey = `shortlisted_${uid}`;
      const existingIds = localStorage.getItem(idKey);
      const parsedIds = existingIds ? JSON.parse(existingIds) : [];
      if (!parsedIds.includes(property.id)) {
        parsedIds.unshift(property.id);
        localStorage.setItem(idKey, JSON.stringify(parsedIds));
      }
    }
  } catch {}

  // Sync to database
  syncShortlistToDatabase(list);

  try {
    window.dispatchEvent(new CustomEvent('tenant_shortlist_updated', { detail: { propertyId: property.id, action: 'add' } }));
  } catch {}

  return true;
}

export function removeTenantShortlist(propertyId: number | string): boolean {
  if (!propertyId) return false;
  const key = getShortlistStorageKey() || BASE_SHORTLIST_KEY;
  const list = getTenantShortlist();
  const filtered = list.filter((p) => String(p.id) !== String(propertyId));
  localStorage.setItem(key, JSON.stringify(filtered));

  try {
    const rawUser = localStorage.getItem('user');
    const u = rawUser ? JSON.parse(rawUser) : null;
    const uid = u?.id || u?.tenant_id;
    if (uid) {
      const idKey = `shortlisted_${uid}`;
      const existingIds = localStorage.getItem(idKey);
      const parsedIds = existingIds ? JSON.parse(existingIds) : [];
      const updatedIds = parsedIds.filter((id: any) => String(id) !== String(propertyId));
      localStorage.setItem(idKey, JSON.stringify(updatedIds));
    }
  } catch {}

  // Sync updated list to database
  syncShortlistToDatabase(filtered);

  try {
    window.dispatchEvent(new CustomEvent('tenant_shortlist_updated', { detail: { propertyId, action: 'remove' } }));
  } catch {}

  return true;
}

export function toggleTenantShortlist(property: any): boolean {
  if (!property || !property.id) return false;
  if (isTenantShortlisted(property.id)) {
    removeTenantShortlist(property.id);
    return false; // now unshortlisted
  } else {
    saveTenantShortlist(property);
    return true; // now shortlisted
  }
}

// -------------------------------------------------------------
// Tenant Enquiries Persistence Helpers & DB Sync
// -------------------------------------------------------------
const BASE_ENQUIRIES_KEY = 'tenant_enquired_properties';

export function getEnquiryStorageKey(): string {
  try {
    const rawUser = localStorage.getItem('user');
    const rawVerified = localStorage.getItem('verified_tenant');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      const identifier = user.id || user.email || user.username || 'tenant';
      return `${BASE_ENQUIRIES_KEY}_${identifier}`;
    }
    if (rawVerified) {
      const v = JSON.parse(rawVerified);
      const identifier = v.email || v.phone || 'verified';
      return `${BASE_ENQUIRIES_KEY}_${identifier}`;
    }
    return BASE_ENQUIRIES_KEY;
  } catch {
    return BASE_ENQUIRIES_KEY;
  }
}

export function getTenantEnquiries(): any[] {
  try {
    const key = getEnquiryStorageKey();
    const userSpecific = key ? localStorage.getItem(key) : null;
    const baseFallback = localStorage.getItem(BASE_ENQUIRIES_KEY);

    const raw = userSpecific || baseFallback;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isTenantEnquired(propertyId: number | string | null | undefined): boolean {
  if (!propertyId) return false;
  const list = getTenantEnquiries();
  return list.some((p) => String(p.id) === String(propertyId));
}

// Background sync for enquiries to database
async function syncEnquiryToDatabase(list: any[]) {
  try {
    const rawUser = localStorage.getItem('user');
    const rawVerified = localStorage.getItem('verified_tenant');
    const u = rawUser ? JSON.parse(rawUser) : null;
    const v = rawVerified ? JSON.parse(rawVerified) : null;
    const tenantIdentifier = u?.tenant_id || u?.id || u?.email || v?.email || v?.phone;

    if (tenantIdentifier) {
      await tenantAPI.update(tenantIdentifier, {
        enquired_properties: list
      });
    }
  } catch (e) {
    // Silent fail gracefully on network or offline
  }
}

export function saveTenantEnquiry(property: any, notes?: string): boolean {
  if (!property || !property.id) return false;
  const key = getEnquiryStorageKey() || BASE_ENQUIRIES_KEY;

  let list: any[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    }
  } catch {}

  const exists = list.some((p) => String(p.id) === String(property.id));
  if (exists) return false;

  let cover = property.cover_image || property.property_image || property.image || property.main_image || '/property.png';
  if (Array.isArray(property.photos) && property.photos.length > 0) {
    const first = property.photos[0];
    cover = typeof first === 'object' && first?.url ? first.url : first;
  }

  const newEntry = {
    ...property,
    id: property.id,
    slug: property.slug || `rent-${property.id}`,
    title: property.title || (property.society_name ? `${property.unit_type || '2 BHK'} in ${property.society_name}` : `Rental Property #${property.id}`),
    location_name: property.location_name || property.location || property.locality || 'Pune',
    city_name: property.city_name || property.city || 'Pune',
    unit_type: property.unit_type || '2 BHK',
    monthly_rent: Number(property.monthly_rent || property.expected_rent || property.price || 0),
    enquired_at: new Date().toISOString(),
    status: 'Enquiry Received',
    notes: notes || 'Enquired via Rental Property page',
    cover_image: cover,
  };

  list.unshift(newEntry);
  localStorage.setItem(key, JSON.stringify(list));
  if (key !== BASE_ENQUIRIES_KEY) {
    try {
      const baseRaw = localStorage.getItem(BASE_ENQUIRIES_KEY);
      let baseList = baseRaw ? JSON.parse(baseRaw) : [];
      if (Array.isArray(baseList) && !baseList.some((p: any) => String(p.id) === String(property.id))) {
        baseList.unshift(newEntry);
        localStorage.setItem(BASE_ENQUIRIES_KEY, JSON.stringify(baseList));
      }
    } catch {}
  }

  // Sync to database
  syncEnquiryToDatabase(list);

  try {
    window.dispatchEvent(new CustomEvent('tenant_enquiries_updated', { detail: { propertyId: property.id, action: 'add' } }));
  } catch {}

  return true;
}
