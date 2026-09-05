// src/lib/tenantShortlist.ts

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
  return true;
}

export function removeTenantShortlist(propertyId: number | string): boolean {
  if (!propertyId) return false;
  const key = getShortlistStorageKey() || BASE_SHORTLIST_KEY;
  const list = getTenantShortlist();
  const filtered = list.filter((p) => String(p.id) !== String(propertyId));
  localStorage.setItem(key, JSON.stringify(filtered));
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

