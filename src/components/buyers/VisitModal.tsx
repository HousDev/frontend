// src/components/visits/VisitModal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Save, Calendar, User, Star, Phone, MessageCircle, Building, RefreshCw, Clock } from 'lucide-react';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { visitsAPI } from '@/lib/visitsAPI';
import { useAuth } from '@/contexts/AuthContext';

/* ------------------ Types ------------------ */
export interface PropertyItem {
  id: string | number;

  // visibility (support many shapes)
  is_public?: 0 | 1 | boolean | 'true' | 'false' | '1' | '0' | 'public' | 'private';
  visibility?: string | number | boolean;
  isPublic?: boolean;

  // master/meta
  property_type_name?: string;
  property_type?: string;
  unit_type?: string;
  property_subtype_name?: string;
  property_subtype?: string;
  subtype?: string;

  // location
  society_name?: string;
  society?: string;
  title?: string;
  address?: string;
  location?: string;
  area?: string;

  // seller/contact
  seller_id?: string | number;
  owner_id?: string | number;
  contact_id?: string | number;
  seller_name?: string;
  owner_name?: string;
  contact_name?: string;
  seller_phone?: string;
  owner_phone?: string;
  contact_phone?: string;
  phone?: string;
  seller_email?: string;
  owner_email?: string;
  contact_email?: string;

  // optional courtesy fields
  seller_salutation?: 'Mr' | 'Ms' | 'Mrs' | 'Mx' | 'Dr' | string;
}

export interface Visit {
  id?: string | number;
  property: string;
  propertyId: string | number;
  date: string;
  time: string;
  duration: string;
  visitType: string;
  accompaniedBy: string[];
  sellerPresent: boolean;
  sellerName: string;
  sellerPhone: string;
  feedback: string;
  rating: number;
  outcome: string;
  nextAction: string;
  concerns: string;
  positives: string;
  revisitRequired: boolean;
  revisitDate: string;
  revisitTime: string;
  remarks: string;
  status: string;

  // enriched
  sellerId?: string | number;
  sellerEmail?: string;
  sellerSalutation?: string;

  buyerId?: string | number;
  buyerName?: string;
  created_at?: string;
  updated_at?: string;
}

type VisitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  visit?: any;
  onSave: (data: Visit) => Promise<void> | void;
  buyer: { id: string | number; name: string };
};

/* ------------------ Small constants used in UI ------------------ */
const visitTypes = [
  { value: 'site_visit', label: 'Site Visit', description: 'Visit the property in person' },
  { value: 'virtual_tour', label: 'Virtual Tour', description: 'Video / photos walkthrough' },
  { value: 'inspection', label: 'Inspection', description: 'Detailed inspection visit' },
];

const durations = ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes'];
const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];

/* ------------------ Helpers ------------------ */
const s = (v: any) => (v == null ? '' : String(v).trim());
const toUpper = (v?: string) => s(v).toUpperCase();
const cleanDigits = (phone: string) => phone.replace(/\D/g, '');

const getUserId = (u: any): number | null => {
  const val = u?.id ?? u?.user_id ?? u?._id ?? null;
  return val != null ? Number(val) : null;
};
const getUserName = (u: any): string => s(u?.name || u?.fullName || u?.username || '');
const getUserEmail = (u: any): string => s(u?.email || u?.mail || '');

const isPublicFlag = (raw: unknown): boolean => {
  if (raw === true || raw === 1) return true;
  if (raw === false || raw === 0 || raw == null) return false;
  const t = String(raw).toLowerCase();
  return t === '1' || t === 'true' || t === 'public' || t === 'yes';
};

/** Format like: REX00{paddedId}. Adjust pad width here if you want */
const formatPropertyCode = (id: string | number) => {
  const n = String(id ?? '');
  return n ? `REX00${n.padStart(3, '0')}` : '';
};

/** Safely build title */
const buildCompositeTitle = (p: PropertyItem) => {
  const propertyType = s(p.property_type_name || p.property_type);
  const unitType = toUpper(p.unit_type);
  const subtype = s(p.property_subtype_name || p.property_subtype || p.subtype);
  const society = s(p.society_name || p.society);
  const leftParts = [propertyType, unitType, subtype].filter(Boolean).join(' ');
  const withSociety = society ? `${leftParts} (${society})` : leftParts;
  return withSociety || s(p.title) || 'Property';
};

const buildAddress = (p: PropertyItem) =>
  s(p.address) || [s(p.location), s(p.area)].filter(Boolean).join(', ');

/** Resolve seller fields */
const getSellerId = (p: PropertyItem) => p.seller_id ?? p.owner_id ?? p.contact_id ?? undefined;
const getSellerName = (p: PropertyItem) => s(p.seller_name || p.owner_name || p.contact_name);
const getSellerPhone = (p: PropertyItem) => s(p.seller_phone || p.owner_phone || p.contact_phone || p.phone);
const getSellerEmail = (p: PropertyItem) => s(p.seller_email || p.owner_email || p.contact_email);
const getSellerSalutation = (p: PropertyItem) => s(p.seller_salutation);

export const parseDurationToMinutes = (d?: string) => {
  if (!d) return 60;
  const m = d.match(/\d+/);
  return m ? Math.max(1, parseInt(m[0], 10)) : 60;
};

/** 24h "HH:mm" normalizer */
const formatHHMM = (t?: string) => {
  if (!t) return '';
  const m = String(t).match(/(\d{1,2}):(\d{2})/);
  if (!m) return '';
  const hh = String(Math.min(23, Math.max(0, Number(m[1])))).padStart(2, '0');
  const mm = String(Math.min(59, Math.max(0, Number(m[2])))).padStart(2, '0');
  return `${hh}:${mm}`;
};

/** add :ss if missing */
const ensureSeconds = (t?: string) => {
  const hhmm = formatHHMM(t);
  return hhmm ? `${hhmm}:00` : '';
};

/** Server expects "YYYY-MM-DD HH:mm:ss" (no timezone) */
export const combineToDateTime = (date: string, time?: string) => {
  const hhmmss = ensureSeconds(time || '10:00');
  return `${date} ${hhmmss}`;
};

/** TIMEZONE-SAFE splitter
 * - If ISO with 'T' or 'Z' → use Date() and convert to local parts
 * - Else try to parse "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD"
 */
const splitDateTime = (dt?: string) => {
  if (!dt) return { date: '', time: '' };

  const str = String(dt).trim();

  // ISO path (e.g., "2025-11-07T09:30:00.000Z" or "2025-11-07T09:30:00")
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(+d)) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const mi = pad(d.getMinutes());
      return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
    }
  }

  // SQL path "YYYY-MM-DD HH:mm:ss" or just date
  const m = str.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, y, mo, d, hh = '00', mi = '00'] = m;
    return { date: `${y}-${mo}-${d}`, time: `${hh}:${mi}` };
  }

  // very last fallback (split by space)
  const [date, timeRaw] = str.split(' ');
  const time = (timeRaw || '').slice(0, 5);
  return { date: s(date), time: s(time) };
};

/** Convert minutes → "xx minutes" (fallback 60) */
const minutesToLabel = (mins?: any) => {
  const n = Number(mins);
  return Number.isFinite(n) && n > 0 ? `${n} minutes` : '60 minutes';
};

/* ---------- NEW: SAME TIME FORMAT LOGIC AS NOTIFICATION PANEL ---------- */
/** Backend sometimes sends IST time but with "Z" suffix (means UTC).
 *  If so, parse as UTC and then add +5:30 to get correct IST local.
 */
const parseDbTimestampToDate = (ts?: string | null): Date => {
  if (!ts) return new Date(NaN);
  const str = String(ts);

  if (str.endsWith('Z')) {
    const utcDate = new Date(str);
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    return new Date(utcDate.getTime() + IST_OFFSET);
  }

  if (/[tT]|\+/.test(str)) return new Date(str);

  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  }

  return new Date(str);
};

const formatAbsoluteLocal = (date: Date) => {
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${month} ${day}, ${year}, ${hours}:${minStr} ${ampm}`;
};

const formatRelative = (timestamp?: string | null) => {
  const when = parseDbTimestampToDate(timestamp ?? '');
  if (Number.isNaN(when.getTime())) return 'Unknown time';
  const diffMin = Math.floor((Date.now() - when.getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD}d ago`;
};

const formatStamp = (ts?: string | null) => {
  const d = parseDbTimestampToDate(ts ?? '');
  return `${formatAbsoluteLocal(d)} · ${formatRelative(ts ?? '')}`;
};
/* ---------------------------------------------------------------------- */

/** Build server payload (parent visit) */
export const buildApiPayloadFromVisit = (
  visitData: Visit,
  executiveId?: number | null,
  fallbackSellerId?: number | null
) => {
  const payload: any = {
    buyer_id: Number(visitData.buyerId),
    buyer_name: visitData.buyerName || '',

    seller_id:
      visitData.sellerId != null
        ? Number(visitData.sellerId)
        : fallbackSellerId ?? null,

    property_id: Number(visitData.propertyId),
    property_title: visitData.property || '',
    executive_id: executiveId ?? null,

    visit_datetime: combineToDateTime(visitData.date, visitData.time),
    duration_minutes: parseDurationToMinutes(visitData.duration),
    visit_type: visitData.visitType || 'site_visit',

    seller_present: visitData.sellerPresent ? 1 : 0,
    seller_name: visitData.sellerName || null,
    seller_phone: visitData.sellerPhone ? cleanDigits(visitData.sellerPhone) : null,

    accompanied_by: Array.isArray(visitData.accompaniedBy) ? visitData.accompaniedBy : [],
    feedback: visitData.feedback || null,
    rating: typeof visitData.rating === 'number' ? visitData.rating : 3,
    outcome: visitData.outcome || null,
    next_action: visitData.nextAction || null,
    concerns: visitData.concerns || null,
    positives: visitData.positives || null,
    remarks: visitData.remarks || null,
    status: visitData.status || 'scheduled',

    meta: {
      seller_email: visitData.sellerEmail || null,
      seller_salutation: visitData.sellerSalutation || null,
      created_from_ui: 'VisitModal',
    },
  };

  return payload;
};

/* ------------------ NORMALIZER ------------------ */
const normalizeVisit = (raw: any, buyer: { id: string | number; name: string }): Visit => {
  if (!raw) {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: undefined,
      property: '',
      propertyId: '',
      date: today,
      time: '10:00',
      duration: '60 minutes',
      visitType: 'site_visit',
      accompaniedBy: [],
      sellerPresent: false,
      sellerName: '',
      sellerPhone: '-',
      feedback: '',
      rating: 3,
      outcome: '',
      nextAction: '',
      concerns: '',
      positives: '',
      revisitRequired: false,
      revisitDate: '',
      revisitTime: '15:00',
      remarks: '',
      status: 'scheduled',
      buyerId: buyer.id,
      buyerName: buyer.name,
      created_at: undefined,
      updated_at: undefined,
      sellerId: undefined,
      sellerEmail: '',
      sellerSalutation: '',
    };
  }

  const toUI = (obj: any): Visit => {
    const visitDT = obj.visit_datetime || obj.datetime;
    const splitV = splitDateTime(visitDT);

    // parent-कॉलम में revisit न हुआ तो खाली रहने दो; बाद में revisits fetch होकर prefill करेंगे
    const rDate = s(obj.revisitDate ?? obj.revisit_date);
    const rTime =
      s(obj.revisitTime ?? obj.revisit_time) ||
      (obj.revisit_datetime ? splitDateTime(obj.revisit_datetime).time : '');

    return {
      id: obj.id ?? obj.visit_id ?? obj._id,
      property: s(obj.property || obj.property_title),
      propertyId: String(obj.propertyId ?? obj.property_id ?? ''),
      date: s(obj.date) || splitV.date || new Date().toISOString().slice(0, 10),
      time: s(obj.time) || splitV.time || '10:00',
      duration: s(obj.duration) || minutesToLabel(obj.duration_minutes),
      visitType: s(obj.visitType || obj.visit_type || 'site_visit'),
      accompaniedBy: Array.isArray(obj.accompaniedBy ?? obj.accompanied_by)
        ? (obj.accompaniedBy ?? obj.accompanied_by)
        : [],
      sellerPresent:
        typeof obj.sellerPresent === 'boolean'
          ? obj.sellerPresent
          : Number(obj.seller_present) === 1,
      sellerName: s(obj.sellerName ?? obj.seller_name),
      sellerPhone: s(obj.sellerPhone ?? obj.seller_phone ?? '-'),
      feedback: s(obj.feedback),
      rating: typeof obj.rating === 'number' ? obj.rating : Number(obj.rating) || 3,
      outcome: s(obj.outcome),
      nextAction: s(obj.nextAction ?? obj.next_action),
      concerns: s(obj.concerns),
      positives: s(obj.positives),
      revisitRequired:
        typeof obj.revisitRequired === 'boolean'
          ? obj.revisitRequired
          : Boolean(obj.revisit_date || obj.revisit_datetime),
      revisitDate: rDate,
      revisitTime: rTime || '15:00',
      remarks: s(obj.remarks),
      status: s(obj.status) || 'scheduled',
      buyerId: obj.buyerId ?? obj.buyer_id ?? buyer.id,
      buyerName: s(obj.buyerName ?? obj.buyer_name) || buyer.name,
      created_at: obj.created_at,
      updated_at: obj.updated_at,
      sellerId: obj.sellerId ?? obj.seller_id,
      sellerEmail: s(obj.sellerEmail ?? obj.seller_email ?? obj?.meta?.seller_email),
      sellerSalutation: s(obj.sellerSalutation ?? obj?.meta?.seller_salutation),
    };
  };

  return toUI(raw);
};

/* ------------------ Component ------------------ */
const VisitModal: React.FC<VisitModalProps> = ({ isOpen, onClose, visit, onSave, buyer }) => {
  const { user } = useAuth();
  const executiveId = getUserId(user);
  const executiveName = getUserName(user);
  const executiveEmail = getUserEmail(user);

  const normalized = useMemo(() => normalizeVisit(visit, buyer), [visit, buyer]);

  const [formData, setFormData] = useState<Partial<Visit>>(normalized);

  // revisits list for the current parent visit (edit mode)
  const [revisits, setRevisits] = useState<any[]>([]);
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(normalized);
    hydratedFromOptionsRef.current = false;
  }, [isOpen, normalized]);

  const [newAccompany, setNewAccompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [propsError, setPropsError] = useState<string | null>(null);

  const hydratedFromOptionsRef = useRef(false);

  /* ------------------ Effects ------------------ */
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    (async () => {
      setLoadingProps(true);
      setPropsError(null);
      try {
        const res = await propertiesAPI.getProperties();
        const list: PropertyItem[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        const onlyPublic = (list ?? []).filter((p) =>
          isPublicFlag(p.is_public ?? p.visibility ?? p.isPublic)
        );

        if (isMounted) setProperties(onlyPublic);
      } catch (err) {
        console.error('Error fetching properties:', err);
        if (isMounted) setPropsError('Could not load properties');
      } finally {
        if (isMounted) setLoadingProps(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Load revisits when editing an existing parent visit
  useEffect(() => {
    const parentId = visit?.id ?? visit?.visit_id ?? visit?._id;
    if (!isOpen || !parentId) return;

    let mounted = true;
    (async () => {
      try {
        setRevLoading(true);
        setRevError(null);
        const data = await visitsAPI.getRevisitsByVisit(parentId);
        const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        if (!mounted) return;
        setRevisits(arr);

        // ✅ Prefill parent revisit fields from latest revisit (timezone-safe)
        if (arr.length) {
          // pick latest by revisit_datetime || (date + time)
          const withKey = arr.map((r: any) => {
            const { date, time } = splitDateTime(r.revisit_datetime || `${r.revisit_date ?? ''} ${r.revisit_time ?? ''}`);
            return { raw: r, key: `${date} ${ensureSeconds(time)}`.trim(), date, time };
          }).filter(x => x.date);

          withKey.sort((a, b) => a.key.localeCompare(b.key));
          const latest = withKey[withKey.length - 1];

          if (latest?.date) {
            setFormData(prev => ({
              ...prev,
              revisitRequired: true,
              revisitDate: latest.date,
              revisitTime: latest.time || '15:00'
            }));
          }
        }
      } catch (e) {
        console.error('Failed to load revisits', e);
        if (mounted) setRevError('Failed to load revisits');
      } finally {
        if (mounted) setRevLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isOpen, visit]);

  /* ------------------ Derived options ------------------ */
  const dropdownOptions = useMemo(
    () =>
      properties.map((p) => {
        const id = String(p.id ?? '');
        const code = id ? formatPropertyCode(id) : '';
        const compositeTitle = buildCompositeTitle(p);
        const address = buildAddress(p);
        const sellerId = getSellerId(p);
        const seller = getSellerName(p);
        const sellerPhone = getSellerPhone(p);
        const sellerEmail = getSellerEmail(p);
        const sellerSalutation = getSellerSalutation(p);
        return {
          id,
          code,
          title: compositeTitle,
          address,
          sellerId,
          seller,
          sellerPhone,
          sellerEmail,
          sellerSalutation,
        };
      }),
    [properties]
  );

  /* ---------- Auto-hydrate title + seller fields ---------- */
  useEffect(() => {
    if (hydratedFromOptionsRef.current) return;
    if (!dropdownOptions.length) return;

    const pid = String(formData.propertyId || '');
    if (!pid) return;

    const opt = dropdownOptions.find((o) => o.id === pid);
    if (!opt) return;

    const currentlyHasLabel = s(formData.property);
    const shouldEnrichSeller =
      !s(formData.sellerName) ||
      !s(formData.sellerPhone) ||
      formData.sellerId == null ||
      !s(formData.sellerEmail) ||
      !s(formData.sellerSalutation);

    const display = opt.code ? `[${opt.code}] ${opt.title}` : opt.title;

    setFormData((prev) => ({
      ...prev,
      property: currentlyHasLabel || display,
      propertyId: opt.id,
      sellerName: shouldEnrichSeller ? (opt.seller || s(prev.sellerName || '')) : prev.sellerName,
      sellerPhone: shouldEnrichSeller ? (opt.sellerPhone || s(prev.sellerPhone || '')) : prev.sellerPhone,
      sellerId: shouldEnrichSeller ? (opt.sellerId ?? prev.sellerId) : prev.sellerId,
      sellerEmail: shouldEnrichSeller ? (opt.sellerEmail || s(prev.sellerEmail || '')) : prev.sellerEmail,
      sellerSalutation: shouldEnrichSeller ? (opt.sellerSalutation || s(prev.sellerSalutation || '')) : prev.sellerSalutation,
    }));

    hydratedFromOptionsRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownOptions, formData.propertyId]);

  /* ------------------ Handlers ------------------ */
  const handleInputChange = <K extends keyof Visit>(field: K, value: Visit[K]) => {
    // normalize time inputs to "HH:mm"
    if (field === 'time' || field === 'revisitTime') {
      value = formatHHMM(String(value || '')) as Visit[K];
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertySelect = (propertyId: string) => {
    const opt = dropdownOptions.find((o) => o.id === propertyId);
    if (!opt) {
      setFormData((prev) => ({
        ...prev,
        property: '',
        propertyId: '',
        sellerName: '',
        sellerPhone: '',
        sellerId: undefined,
        sellerEmail: '',
        sellerSalutation: '',
      }));
      return;
    }
    const display = opt.code ? `[${opt.code}] ${opt.title}` : opt.title;
    setFormData((prev) => ({
      ...prev,
      property: display,
      propertyId: opt.id,
      sellerName: opt.seller || s(prev.sellerName || ''),
      sellerPhone: opt.sellerPhone || s(prev.sellerPhone || ''),
      sellerId: opt.sellerId ?? prev.sellerId,
      sellerEmail: opt.sellerEmail || s(prev.sellerEmail || ''),
      sellerSalutation: opt.sellerSalutation || s(prev.sellerSalutation || ''),
    }));
  };

  const addAccompany = () => {
    const val = newAccompany.trim();
    const current = (formData.accompaniedBy as string[]) || [];
    if (val && !current.includes(val)) {
      setFormData((prev) => ({ ...prev, accompaniedBy: [...current, val] }));
      setNewAccompany('');
    }
  };

  const removeAccompany = (person: string) => {
    const current = (formData.accompaniedBy as string[]) || [];
    setFormData((prev) => ({ ...prev, accompaniedBy: current.filter((p) => p !== person) }));
  };

  const buildVisitPayload = (): Visit => {
    const idFinal = visit?.id ?? visit?.visit_id ?? visit?._id ?? formData.id ?? Date.now();
    return {
      property: (formData.property as string) || '',
      propertyId: (formData.propertyId as string) || '',
      date: (formData.date as string) || new Date().toISOString().split('T')[0],
      time: formatHHMM(formData.time as string) || '10:00',
      duration: (formData.duration as string) || '60 minutes',
      visitType: (formData.visitType as string) || 'site_visit',
      accompaniedBy: (formData.accompaniedBy as string[]) || [],
      sellerPresent: (formData.sellerPresent as boolean) ?? false,
      sellerName: (formData.sellerName as string) || '',
      sellerPhone: (formData.sellerPhone as string) || '-',
      feedback: (formData.feedback as string) || '',
      rating: (formData.rating as number) ?? 3,
      outcome: (formData.outcome as string) || '',
      nextAction: (formData.nextAction as string) || '',
      concerns: (formData.concerns as string) || '',
      positives: (formData.positives as string) || '',
      revisitRequired: (formData.revisitRequired as boolean) ?? false,
      revisitDate: (formData.revisitDate as string) || '',
      revisitTime: formatHHMM(formData.revisitTime as string) || '15:00',
      remarks: (formData.remarks as string) || '',
      status: (formData.status as string) || 'scheduled',
      id: idFinal,
      buyerId: formData.buyerId ?? buyer.id,
      buyerName: formData.buyerName ?? buyer.name,

      sellerId: formData.sellerId,
      sellerEmail: formData.sellerEmail,
      sellerSalutation: formData.sellerSalutation,

      created_at: visit?.created_at ?? formData.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const pickVisitId = (result: any, fallback?: any) =>
    result?.id ??
    result?.visit_id ??
    result?.data?.id ??
    result?.data?.visit_id ??
    result?.insertId ??
    result?.data?.insertId ??
    fallback ??
    null;

  const createChildRevisitIfNeeded = async (parentVisitId: any, visitData: Visit) => {
    if (!visitData.revisitRequired) return;
    if (!visitData.revisitDate && !visitData.revisitTime) return;

    const payload = {
      revisit_date: visitData.revisitDate || undefined,
      revisit_time: ensureSeconds(visitData.revisitTime) || undefined,
      duration_minutes: parseDurationToMinutes(visitData.duration),
      accompanied_by: Array.isArray(visitData.accompaniedBy) ? visitData.accompaniedBy : [],
      status: 'scheduled',
      remarks: visitData.remarks || null,
      executive_id: executiveId ?? null,
      meta: {
        created_from_ui: 'VisitModal.revisit',
        buyer_id: visitData.buyerId ?? null,
        property_id: visitData.propertyId ?? null,
      },
    } as const;

    await visitsAPI.createRevisit(parentVisitId, payload);

    try {
      const data = await visitsAPI.getRevisitsByVisit(parentVisitId);
      const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setRevisits(arr);
    } catch {/* ignore */}
  };

  const handleSave = async () => {
    if (!formData.propertyId || !String(formData.propertyId).trim()) {
      alert('Please select a property');
      return;
    }
    if (!formData.date) {
      alert('Please select visit date');
      return;
    }

    setIsSubmitting(true);
    try {
      const visitData = buildVisitPayload();
      const payload = buildApiPayloadFromVisit(
        visitData,
        executiveId,
        visitData.sellerId != null ? Number(visitData.sellerId) : null
      );

      let parentId: any = visit?.id ?? visit?.visit_id ?? visit?._id ?? null;

      if (parentId) {
        await visitsAPI.updateVisit(parentId, payload);
      } else {
        const created = await visitsAPI.createVisit(payload);
        parentId = pickVisitId(created);
      }

      await createChildRevisitIfNeeded(parentId, visitData);

      await Promise.resolve(onSave(visitData));
      onClose();
    } catch (error) {
      console.error('Error saving visit:', error);
      alert('Failed to save visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const salutation = s(formData.sellerSalutation);
  const sellerNameWithSalutation =
    (salutation ? `${salutation} ` : '') + s(formData.sellerName);

  // Build stamps
  const createdStamp = formData.created_at ? formatStamp(formData.created_at) : null;
  const updatedStamp = formData.updated_at ? formatStamp(formData.updated_at) : null;
  const plannedStamp = formatStamp(combineToDateTime(String(formData.date || ''), String(formData.time || '')));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[100vh] overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {normalized.id ? 'Edit Visit' : 'Schedule Visit'}
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                For {buyer.name}
                {executiveName ? (
                  <span className="ml-1 text-gray-500">
                    • Scheduled by {executiveName}
                    {executiveEmail ? ` (${executiveEmail})` : ''}
                  </span>
                ) : null}
              </p>
              {/* NEW: show created/updated timestamps like notifications */}
              <div className="flex flex-wrap gap-2 mt-1">
                {createdStamp && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    <Clock size={11} /> Created: {createdStamp}
                  </span>
                )}
                {updatedStamp && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    <Clock size={11} /> Updated: {updatedStamp}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-3 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left */}
            <div className="space-y-3">
              {/* Property Selection */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                  <Building className="mr-1" size={14} />
                  Property Selection
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Select Property <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={String(formData.propertyId || '')}
                      onChange={(e) => handlePropertySelect(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                      disabled={loadingProps || !!propsError}
                    >
                      <option value="">
                        {loadingProps
                          ? 'Loading properties...'
                          : propsError
                          ? 'Failed to load'
                          : 'Choose property to visit'}
                      </option>
                      {dropdownOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code ? `[${p.code}] ` : ''}{p.title}
                          {p.address ? ` - ${p.address}` : ''}
                        </option>
                      ))}
                    </select>
                    {propsError && (
                      <p className="text[11px] text-red-600 mt-1">{propsError}</p>
                    )}
                  </div>

                  {formData.property && (
                    <div className="p-2 text-xs bg-green-50 border border-green-200 rounded-md">
                      <div className="font-medium text-green-900 flex items-center gap-2">
                        {formData.propertyId ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-600 text-white text-[11px]">
                            {formatPropertyCode(String(formData.propertyId))}
                          </span>
                        ) : null}
                        <span>{formData.property}</span>
                      </div>
                      {!!sellerNameWithSalutation.trim() && (
                        <div className="text-green-700">
                          Seller: {sellerNameWithSalutation}
                          {formData.sellerId ? (
                            <span className="ml-1 text-green-800/70">[ID: {String(formData.sellerId)}]</span>
                          ) : null}
                        </div>
                      )}
                      {!!formData.sellerPhone && (
                        <div className="text-green-700">Contact: {formData.sellerPhone}</div>
                      )}
                      {!!formData.sellerEmail && (
                        <div className="text-green-700">Email: {formData.sellerEmail}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Visit Type */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Visit Type</h3>
                <div className="grid grid-cols-1 gap-2">
                  {visitTypes.map((type) => {
                    const isSelected = formData.visitType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('visitType', type.value as Visit['visitType'])}
                        className={`p-2 text-xs rounded-md border transition-all text-left ${
                          isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-gray-600">{type.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accompanied By */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Accompanied By</h3>
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={newAccompany}
                      onChange={(e) => setNewAccompany(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="Add person (e.g., Wife, Father, Friend)"
                      onKeyDown={(e) => e.key === 'Enter' && addAccompany()}
                    />
                    <button
                      onClick={addAccompany}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(formData.accompaniedBy || []).map((person: string, index: number) => (
                      <div
                        key={`${person}-${index}`}
                        className="flex items-center space-x-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full"
                      >
                        <span>{person}</span>
                        <button
                          onClick={() => removeAccompany(person)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-3">
              {/* Schedule Details */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                  <Calendar className="mr-1" size={14} />
                  Schedule Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={String(formData.date || '')}
                      onChange={(e) => handleInputChange('date', e.target.value as Visit['date'])}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={String(formData.time || '')}
                      onChange={(e) => handleInputChange('time', e.target.value as Visit['time'])}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      value={String(formData.duration || '')}
                      onChange={(e) => handleInputChange('duration', e.target.value as Visit['duration'])}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      {durations.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* NEW: schedule preview stamp like notifications */}
                {formData.date ? (
                  <div className="mt-2 text-[11px] text-gray-600 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
                    <Clock size={11} />
                    Planned: {plannedStamp}
                  </div>
                ) : null}
              </div>

              {/* Seller Information */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                  <User className="mr-1" size={14} />
                  Seller Information
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.sellerPresent)}
                      onChange={(e) => handleInputChange('sellerPresent', e.target.checked as Visit['sellerPresent'])}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xs text-gray-700 font-medium">Seller will be present</span>
                  </label>

                  {formData.sellerPresent && (
                    <div className="grid grid-cols-1 gap-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Seller Name</label>
                          <input
                            type="text"
                            value={String(formData.sellerName || '')}
                            onChange={(e) => handleInputChange('sellerName', e.target.value as Visit['sellerName'])}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="Seller name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Seller Phone</label>
                          <input
                            type="tel"
                            value={String(formData.sellerPhone || '')}
                            onChange={(e) => handleInputChange('sellerPhone', e.target.value as Visit['sellerPhone'])}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Seller Email</label>
                          <input
                            type="email"
                            value={String(formData.sellerEmail || '')}
                            onChange={(e) => handleInputChange('sellerEmail', e.target.value as Visit['sellerEmail'])}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            placeholder="name@example.com"
                          />
                        </div>
                      </div>

                      {!!formData.sellerId && (
                        <div className="text-[11px] text-gray-600">
                          Seller ID: <span className="font-medium">{String(formData.sellerId)}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        <a
                          href={formData.sellerPhone ? `tel:${cleanDigits(String(formData.sellerPhone))}` : '#'}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Phone size={12} />
                          <span>Call</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const when = `${formData.date} at ${formData.time || '10:00'}`;
                            const msg = `Hi ${sellerNameWithSalutation || 'there'}, ${buyer.name} would like to visit your property ${formData.property || ''} on ${when}. Please confirm availability. — ${executiveName || 'Executive'}${executiveEmail ? ` (${executiveEmail})` : ''}`;
                            const phone = cleanDigits(String(formData.sellerPhone || ''));
                            if (!phone) return;
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback (only when completed) */}
              {formData.status === 'completed' && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">Visit Feedback</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Overall Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleInputChange('rating', star as Visit['rating'])}
                            className={`p-0.5 rounded ${star <= (formData.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            <Star size={16} className={star <= (formData.rating || 0) ? 'fill-current' : ''} />
                          </button>
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          {formData.rating === 5
                            ? 'Excellent'
                            : formData.rating === 4
                            ? 'Good'
                            : formData.rating === 3
                            ? 'Average'
                            : formData.rating === 2
                            ? 'Poor'
                            : 'Very Poor'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
                      <textarea
                        value={String(formData.feedback || '')}
                        onChange={(e) => handleInputChange('feedback', e.target.value as Visit['feedback'])}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={2}
                        placeholder="Overall feedback about the property visit..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">What they liked</label>
                      <textarea
                        value={String(formData.positives || '')}
                        onChange={(e) => handleInputChange('positives', e.target.value as Visit['positives'])}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={1}
                        placeholder="Positive aspects they mentioned..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Concerns/Issues</label>
                      <textarea
                        value={String(formData.concerns || '')}
                        onChange={(e) => handleInputChange('concerns', e.target.value as Visit['concerns'])}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={1}
                        placeholder="Any concerns or issues they raised..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Outcome</label>
                      <textarea
                        value={String(formData.outcome || '')}
                        onChange={(e) => handleInputChange('outcome', e.target.value as Visit['outcome'])}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={1}
                        placeholder="Final outcome of the visit..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Next Action</label>
                      <textarea
                        value={String(formData.nextAction || '')}
                        onChange={(e) => handleInputChange('nextAction', e.target.value as Visit['nextAction'])}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        rows={1}
                        placeholder="What should be done next..."
                      />
                    </div>

                    {/* REVISIT */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.revisitRequired)}
                          onChange={(e) => handleInputChange('revisitRequired', e.target.checked as Visit['revisitRequired'])}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </label>

                      {formData.revisitRequired && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Revisit Date</label>
                            <input
                              type="date"
                              value={String(formData.revisitDate || '')}
                              onChange={(e) => handleInputChange('revisitDate', e.target.value as Visit['revisitDate'])}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Revisit Time</label>
                            <input
                              type="time"
                              value={String(formatHHMM(formData.revisitTime || '15:00'))}
                              onChange={(e) => handleInputChange('revisitTime', e.target.value as Visit['revisitTime'])}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Visit Status</label>
                <select
                  value={String(formData.status || '')}
                  onChange={(e) => handleInputChange('status', e.target.value as Visit['status'])}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Additional Remarks</label>
                <textarea
                  value={String(formData.remarks || '')}
                  onChange={(e) => handleInputChange('remarks', e.target.value as Visit['remarks'])}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  rows={2}
                  placeholder="Any additional notes about the visit..."
                />
              </div>

              {/* Revisits list (Edit mode) */}
              {(visit?.id || visit?.visit_id || visit?._id) && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-semibold text-gray-900 flex items-center">
                      <RefreshCw className="mr-1" size={14} />
                      Revisits
                    </h3>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setRevLoading(true);
                          const parentId = visit?.id ?? visit?.visit_id ?? visit?._id;
                          const data = await visitsAPI.getRevisitsByVisit(parentId);
                          const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                          setRevisits(arr);
                        } catch {
                          setRevError('Failed to refresh');
                        } finally {
                          setRevLoading(false);
                        }
                      }}
                      className="text[11px] px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-md p-2 bg-white">
                    {revLoading ? (
                      <div className="text-[11px] text-gray-500 flex items-center"><Clock className="mr-1" size={12}/>Loading revisits…</div>
                    ) : revError ? (
                      <div className="text-[11px] text-red-600">{revError}</div>
                    ) : revisits.length === 0 ? (
                      <div className="text-[11px] text-gray-500">No revisits yet.</div>
                    ) : (
                      <ul className="space-y-1">
                        {revisits.map((rv) => {
                          // Combine to a single timestamp for stamp formatting
                          const rawTs =
                            rv.revisit_datetime ||
                            (rv.revisit_date ? `${rv.revisit_date} ${ensureSeconds(rv.revisit_time || '15:00')}` : '');
                          const stamp = formatStamp(rawTs);
                          const status = s(rv.status || 'scheduled');
                          return (
                            <li key={rv.id ?? rv.revisit_id ?? rawTs} className="text-[11px] text-gray-700 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                <Clock size={11} /> {stamp}
                              </span>
                              <span className="px-1 rounded bg-gray-100 text-gray-700">{status}</span>
                              {rv.remarks ? <span className="text-gray-500">— {rv.remarks}</span> : null}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Visit will be added to buyer activity timeline</div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !formData.propertyId || !formData.date}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={12} />
                <span>{isSubmitting ? 'Saving...' : normalized.id ? 'Update' : 'Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitModal;
