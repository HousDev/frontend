// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { X, Save, User, Phone, MapPin, Building, Star, Trash2, Home, Handshake, Search } from 'lucide-react';
// import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
// import { useProperties } from '@/hooks/properties';
// import { FaWhatsapp } from 'react-icons/fa';
// import DOBStepCalendar from '../ui/DOBStepCalendar';
// import { usersAPI } from '@/lib/api';
// import { useAuth } from '@/contexts/AuthContext';


// /* --------------------------------- Utils --------------------------------- */

// const DEBUG = true; // flip to false in prod

// // Normalize a string for comparison (spaces/underscores/case-insensitive)
// const norm = (v: any) =>
//   String(v ?? '')
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, '_');

// // Find the correct option value from a masters array given some incoming value
// const resolveOptionValue = (options: any[], incoming: string | undefined | null) => {
//   if (!incoming) return '';
//   const target = norm(incoming);
//   const hit = (options || []).find((o: any) => norm(o.value ?? o.label) === target);
//   return hit ? (hit.value ?? hit.label) : (incoming || '');
// };

// // Convert "initial_contact" => "Initial Contact"
// const titleizeUnderscore = (v?: string | null) =>
//   (v ?? '')
//     .split('_')
//     .filter(Boolean)
//     .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
//     .join(' ');

// const pick = (...vals: any[]) => vals.find((x) => x !== undefined && x !== null && String(x).trim() !== '');

// const getPropertyId = (p: any) => String(p.property_id ?? p.id ?? p._id ?? ''); // raw id string

// /** Build composite title: PropertyType + UnitType + PropertySubtype — SocietyName */
// const composePropertyTitle = (p: any) => {
//   // Enhanced property type extraction with better field priority
//   const propertyType = pick(
//     p.property_type_name,
//     p.property_type,
//     p.type,
//     p.category,
//     p.type_name,
//     p.propertyType
//   ) ?? '';

//   const unitType = pick(
//     p.unit_type,
//     p.unitType,
//     p.unit_type_name,
//     p.flat_type,
//     p.configuration,
//     p.bhk,
//     p.bhk_label
//   ) ?? '';

//   const subType = pick(
//     p.property_subtype_name,
//     p.property_sub_type,
//     p.property_subtype,
//     p.subtype,
//     p.propertySubType,
//     p.segment,
//     p.property_subtype_name
//   ) ?? '';

//   const society = pick(
//     p.society_name,
//     p.society,
//     p.project_name,
//     p.societyName,
//     p.project,
//     p.location_name
//   ) ?? '';

//   // Build the title parts
//   const parts = [propertyType, unitType, subType]
//     .map((s: any) => String(s || '').trim())
//     .filter(Boolean);

//   const left = parts.length ? parts.join('  ') : (p.title || 'Property');
//   const withSociety = society ? `${left} — ${String(society).trim()}` : left;

//   if (withSociety) return withSociety;
//   const fallback = p.title || p.society_name || p.name || p.location_name;
//   return fallback ? String(fallback) : 'Property';
// };

// const formatRxpId = (p: any) => {
//   const id = getPropertyId(p);
//   return id ? `REX ${id}` : '';
// };

// // Make a MiniProperty[] out of any property-ish array — composite title, explicit PID & RXP badge
// const adaptProperties = (arr: any[]): MiniProperty[] =>
//   (Array.isArray(arr) ? arr : []).map((p: any) => {
//     const pid = getPropertyId(p);
//     // Create a unique ID to prevent duplicates
//     const uniqueId = pid || `P-${Math.random().toString(36).slice(2, 11)}`;

//     const base: MiniProperty = {
//       id: uniqueId, // Use unique ID to prevent duplicates
//       title: composePropertyTitle(p),
//       address:
//         p.address ||
//         [p.location_name || p.locality_name, p.city_name || p.city].filter(Boolean).join(', '),
//       price: p.budget ?? p.price ?? p.expected_price ?? '',
//       size: p.carpet_area ?? p.area ?? p.super_builtup_area ?? '',
//       image:
//         p.image || p.photo || (Array.isArray(p.photos) ? p.photos[0]?.url || p.photos[0] : ''),
//       _rxpBadge: formatRxpId(p),
//       _pid: pid, // 👈 explicit raw id kept
//       _rawProperty: p, // Keep raw property data for debugging
//     };

//     if (DEBUG) {
//       // eslint-disable-next-line no-console
//       console.log('[adaptProperties] RAW → BASE', p, base);
//     }
//     return base;
//   });

// const adaptCoSellers = (arr: any[]): CoSeller[] =>
//   (Array.isArray(arr) ? arr : []).map((cs: any) => ({
//     id: Number(cs.id ?? cs.coSeller_id ?? cs._id) || undefined,
//     seller_id: Number(cs.seller_id ?? cs.parent_id) || undefined,
//     coSeller_salutation: cs.coSeller_salutation ?? cs.salutation ?? 'Mr.',
//     coSeller_name: cs.coSeller_name ?? cs.name ?? '',
//     coSeller_phone: cs.coSeller_phone ?? cs.phone ?? '',
//     coSeller_whatsapp: cs.coSeller_whatsapp ?? cs.whatsapp ?? '',
//     coSeller_email: cs.coSeller_email ?? cs.email ?? '',
//     coSeller_dob: cs.coSeller_dob ?? cs.dob ?? '',
//     coSeller_sameAsPhone: Boolean(cs.coSeller_sameAsPhone ?? cs.sameAsPhone),
//     coSeller_relation: cs.coSeller_relation ?? cs.relation ?? '',
//   }));

// const toBool = (v: any) => {
//   if (typeof v === 'boolean') return v;
//   if (v == null) return false;
//   const s = String(v).trim().toLowerCase();
//   return s === '1' || s === 'true' || s === 'yes' || s === 'y';
// };

// const isEmpty = (s?: string | null) => !String(s ?? '').trim();

// /* ---------------------------------- Types --------------------------------- */

// type Nullable<T> = T | null | undefined;

// type CoSeller = {
//   id?: number;
//   seller_id?: number;
//   coSeller_salutation?: string;
//   coSeller_name?: string;
//   coSeller_phone?: string;
//   coSeller_whatsapp?: string;
//   coSeller_email?: string;
//   coSeller_dob?: string;
//   coSeller_sameAsPhone?: boolean;
//   coSeller_relation?: string;
// };

// type MiniProperty = {
//   id: string;
//   title: string;
//   address?: string;
//   price?: number | string;
//   size?: string | number;
//   image?: string;
//   /** internal badge text like "RXP 123" */
//   _rxpBadge?: string;
//   /** raw property id (string) for explicit display and debugging */
//   _pid?: string;
//   /** raw property data for debugging */
//   _rawProperty?: any;
// };

// export type Seller = {
//   id?: number;
//   salutation?: string;
//   name?: string;
//   phone?: string;
//   whatsapp?: string;
//   email?: string;
//   state?: string;
//   city?: string;
//   location?: string;
//   stage?: string;
//   leadType?: string;
//   priority?: string;
//   status?: string;
//   properties?: MiniProperty[];
//   coSellers?: CoSeller[];
//   notes?: string;
//   seller_dob?: string;
//   countryCode?: string;
//   assigned_to?: string | number;
//   assigned_to_name?: string;
//   created_at?: string;
//   updated_at?: string;
//   lastActivity?: string;
//   visits?: number;
//   notifications?: number;
//   source?: string;
// };

// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
//   seller?: Seller | null;
//   onSave: (data: Seller) => Promise<void> | void;
// };

// /* ------------------------------ Date helpers ------------------------------ */

// const TODAY = new Date();
// const pad2 = (n: number) => String(n).padStart(2, '0');
// const toISODate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
// const EIGHTEEN_YEARS_BACK = new Date(
//   TODAY.getFullYear() - 18,
//   TODAY.getMonth(),
//   TODAY.getDate()
// );
// const ISO_18Y_BACK = toISODate(EIGHTEEN_YEARS_BACK);

// const numberToINR = (v: any) => {
//   const n = typeof v === 'string' ? Number(v) : v;
//   if (n == null || Number.isNaN(n) || n === '') return '';
//   return n.toLocaleString('en-IN');
// };

// /* ------------------------------ Adapt incoming ----------------------------- */

// const adaptIncomingSellerToForm = (
//   s: any,
//   leadStageOptions: any[],
//   leadPriorityOpts: any[],
//   leadStatusOptions: any[],
//   leadSourceOptions: any[]
// ): Seller => {
//   if (!s) {
//     return {
//       salutation: 'Mr.',
//       seller_dob: ISO_18Y_BACK,
//       countryCode: '+91',
//       properties: [],
//       coSellers: [],
//       source: '',
//     };
//   }

//   const stageValue = resolveOptionValue(
//     leadStageOptions,
//     s.stage?.includes('_') ? titleizeUnderscore(s.stage) : s.stage
//   );

//   const priorityValue = resolveOptionValue(leadPriorityOpts, s.priority);
//   const statusValue = resolveOptionValue(leadStatusOptions, s.status);
//   const sourceValue = resolveOptionValue(leadSourceOptions, s.source);

//   return {
//     id: Number(s.id ?? s.seller_id ?? s._id),
//     salutation: s.salutation ?? 'Mr.',
//     name: s.name ?? '',
//     phone: s.phone ?? '',
//     whatsapp: s.whatsapp ?? '',
//     email: s.email ?? '',
//     state: s.state ?? '',
//     city: s.city ?? '',
//     location: s.location ?? '',

//     stage: stageValue || '',
//     leadType: s.leadType ?? s.lead_type ?? '',
//     priority: priorityValue || '',
//     status: statusValue || '',
//     source: sourceValue || '',

//     assigned_to: s.assigned_to ?? s.assigned_to_id ?? '',
//     assigned_to_name: s.assigned_to_name ?? s.assigned ?? '',

//     notes: s.notes ?? '',
//     seller_dob: s.seller_dob ?? s.dob ?? ISO_18Y_BACK,
//     created_at: s.created_at,
//     updated_at: s.updated_at,
//     lastActivity: s.lastActivity,
//     visits: s.visits,
//     notifications: s.notifications,

//     properties: adaptProperties(s.properties),
//     coSellers: adaptCoSellers(s.coSellers ?? s.cosellers),
//   };
// };

// /* -------------------------------- Component -------------------------------- */

// const SellerFormModal: React.FC<Props> = ({ isOpen, onClose, seller, onSave }) => {
//   const { user } = useAuth();
//   // ---------- state ----------
//   const [formData, setFormData] = useState<Seller>({
//     salutation: 'Mr.',
//     name: '',
//     phone: '',
//     whatsapp: '',
//     email: '',
//     state: '',
//     city: '',
//     location: '',
//     stage: '',
//     leadType: '',
//     priority: '',
//     status: '',
//     properties: [],
//     coSellers: [],
//     notes: '',
//     seller_dob: ISO_18Y_BACK,
//     countryCode: '+91',
//     assigned_to: '',
//     assigned_to_name: '',
//     source: '',
//   });

//   const [sameWhatsapp, setSameWhatsapp] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showPropertySelector, setShowPropertySelector] = useState(false);
//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
//   const [phoneCountryData, setPhoneCountryData] = useState<any>(null);
//   const [salesUsers, setSalesUsers] = useState<any[]>([]);
//   const [propertySearchQuery, setPropertySearchQuery] = useState(''); // New state for property search

//   // ---------- masters ----------
//   useEffect(() => {
//     if (!isOpen) return;
//     let alive = true;
//     (async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(['common', 'seller', 'lead']);
//         if (!alive) return;
//         setMasters(data || {});
//       } catch (e) {
//         console.error('Error fetching master options:', e);
//       } finally {
//         setMasterLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [isOpen]);

//   // ---------- executives ----------
//   useEffect(() => {
//     if (!isOpen) return;
//     let alive = true;
//     (async () => {
//       try {
//         // Format function for executive name
//         const formatExecutiveName = (user: any): string => {
//           const firstName = user?.first_name || user?.firstName || '';
//           const lastName = user?.last_name || user?.lastName || '';
//           const fullName = `${firstName} ${lastName}`.trim();

//           if (fullName) return fullName;
//           if (user?.name) return user.name;
//           if (user?.username) return user.username;
//           if (user?.email) return user.email.split('@')[0];
//           return 'Sales Executive';
//         };

//         // Try multiple methods to get sales executives
//         let executivesData: any[] = [];

//         // Method 1: Try getSalesExecutives if available
//         try {
//           if (usersAPI.getSalesExecutives) {
//             const res = await usersAPI.getSalesExecutives();
//             if (res && (Array.isArray(res) || res.items || res.data)) {
//               executivesData = Array.isArray(res) ? res : (res.items || res.data || []);
//             }
//           }
//         } catch (err) {
//           console.log('getSalesExecutives failed, trying next method...');
//         }

//         // Method 2: Try getAllUsers and filter
//         if (executivesData.length === 0 && usersAPI.getAllUsers) {
//           const allUsers = await usersAPI.getAllUsers();
//           const usersArray = Array.isArray(allUsers) ? allUsers : (allUsers?.data || []);

//           executivesData = usersArray.filter((user: any) => {
//             const department = String(user?.department || '').toLowerCase();
//             const role = String(user?.role || '').toLowerCase();
//             return department.includes('sales') && role.includes('executive');
//           });
//         }

//         // Format the executives
//         const formattedExecutives = executivesData.map((user: any) => ({
//           id: user.id || user.userId || user._id,
//           name: formatExecutiveName(user),
//           first_name: user.first_name || user.firstName || '',
//           last_name: user.last_name || user.lastName || '',
//           email: user.email || '',
//           phone: user.phone || user.mobile || '',
//           department: user.department || 'Sales',
//           role: user.role || 'Sales Executive',
//         }));

//         if (!alive) return;
//         setSalesUsers(formattedExecutives);
//       } catch (e) {
//         console.error('Error fetching sales users:', e);
//         setSalesUsers([]);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [isOpen]);

//   // ---------- properties ----------
//   const { fetchProperties, properties, loadingProps } = useProperties({ autoLog: false });
//   const fetchedOnceRef = useRef(false);

//   useEffect(() => {
//     if (!isOpen || fetchedOnceRef.current) return;
//     fetchedOnceRef.current = true;
//     fetchProperties()
//       .then(() => {
//         if (DEBUG) console.log('[SellerFormModal] fetchProperties called');
//       })
//       .catch(console.error);
//   }, [isOpen, fetchProperties]);

//   useEffect(() => {
//     if (!isOpen) fetchedOnceRef.current = false;
//   }, [isOpen]);

//   // ---------- masters helpers ----------
//   const salutationOptions = masters['salutation'] || [
//     { value: 'Mr.', label: 'Mr.' },
//     { value: 'Mrs.', label: 'Mrs.' },
//     { value: 'Ms.', label: 'Ms.' },
//     { value: 'Dr.', label: 'Dr.' },
//   ];
//   const stateOptions = masters['state'] || [];
//   const cityOptions = masters['city'] || [];
//   const leadStageOptions = masters['Seller lead stage'] || masters['seller lead stage'] || [];
//   const leadTypeOptions = masters['lead type'] || [];
//   const leadPriorityOpts = masters['lead priority'] || [];
//   const leadStatusOptions = masters['Seller lead Status'] || masters['seller lead status'] || [];
//   const leadSourceOptions = masters['lead source'] || masters['Lead Source'] || [];

//   // ---------- initialize form when open/seller or masters change ----------
//   useEffect(() => {
//     if (!isOpen) return;
//     const next = adaptIncomingSellerToForm(
//       seller,
//       leadStageOptions,
//       leadPriorityOpts,
//       leadStatusOptions,
//       leadSourceOptions
//     );
//     setFormData(next);

//     if (DEBUG) {
//       console.log('[SellerFormModal] Incoming seller → FormData', seller, next);
//     }

//     // set Same-as-phone checkbox if whatsapp matches local number of phone
//     if (next.phone) {
//       const raw = String(next.phone);
//       const last10 = raw.replace(/\D/g, '').slice(-10);
//       const wa = String(next.whatsapp ?? '').replace(/\D/g, '');
//       setSameWhatsapp(!!wa && (wa === last10 || wa === raw.replace(/^\+?91/, ''))); // heuristic
//     } else {
//       setSameWhatsapp(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     isOpen,
//     seller?.id,
//     leadStageOptions?.length,
//     leadPriorityOpts?.length,
//     leadStatusOptions?.length,
//     leadSourceOptions?.length,
//   ]);

//   /* --------------------- Properties: show only public & free --------------------- */
//   const availableProperties: MiniProperty[] = useMemo(() => {
//     if (!Array.isArray(properties) || !properties.length) return [];

//     const result = properties
//       .filter((p: any) => {
//         const publicOk = toBool(p.is_public ?? p.isPublic ?? p.public);
//         const unassigned = !(p.seller_id ?? p.sellerId ?? p.owner_seller_id);
//         return publicOk && unassigned;
//       })
//       .slice(0, 50)
//       .map((p: any) => adaptProperties([p])[0]);

//     if (DEBUG) {
//       console.log('[SellerFormModal] availableProperties', result);
//     }
//     return result;
//   }, [properties]);

//   // Filter properties based on search query
//   const filteredAvailableProperties = useMemo(() => {
//     if (!propertySearchQuery.trim()) return availableProperties;

//     const query = propertySearchQuery.toLowerCase().trim();
//     return availableProperties.filter((property) => {
//       const searchableFields = [
//         property.title || '',
//         property.address || '',
//         property._rxpBadge || '',
//         property._pid || '',
//         // Also search in raw property data if needed
//         property._rawProperty?.society_name || '',
//         property._rawProperty?.project_name || '',
//         property._rawProperty?.location_name || '',
//         property._rawProperty?.locality_name || '',
//       ];

//       return searchableFields.some(field =>
//         field.toLowerCase().includes(query)
//       );
//     });
//   }, [availableProperties, propertySearchQuery]);

//   const filteredCities = useMemo(
//     () => cityOptions.filter((c: any) => !formData.state || c.parentValue === formData.state),
//     [cityOptions, formData.state]
//   );

//   const locationOptions: MasterOption[] = masters['location'] || [];
//   const filteredLocations = useMemo(() => {
//     return locationOptions.filter((l: any) => {
//       if (formData.city && l.parentValue === formData.city) return true;
//       if (!formData.city && formData.state && l.grandParentValue === formData.state) return true;
//       return !formData.state && !formData.city;
//     });
//   }, [locationOptions, formData.city, formData.state]);

//   if (!isOpen) return null;

//   /* --------------------------------- helpers -------------------------------- */

//   const handleInputChange = useCallback(
//     (field: keyof Seller, value: any) => setFormData((prev) => ({ ...prev, [field]: value })),
//     []
//   );

//   const extractLocalNumber = (fullNumber: string, countryData: any) => {
//     if (!countryData || !fullNumber) return '';
//     const dialCode: string = countryData.dialCode || '';
//     const trimmed = fullNumber.replace(/^\+/, '');
//     return trimmed.startsWith(dialCode) ? trimmed.slice(dialCode.length) : trimmed;
//   };

//   const toggleSameWhatsapp = useCallback(() => {
//     setSameWhatsapp((prev) => {
//       const next = !prev;
//       if (next && formData.phone && phoneCountryData) {
//         const localNumber = extractLocalNumber(String(formData.phone), phoneCountryData);
//         setFormData((p) => ({ ...p, whatsapp: localNumber }));
//       }
//       return next;
//     });
//   }, [formData.phone, phoneCountryData]);

//   const handlePhoneChange = useCallback(
//     (value: string, countryData?: any) => {
//       setPhoneCountryData(countryData);
//       setFormData((prev) => {
//         const updated: Seller = { ...prev, phone: value };
//         if (sameWhatsapp && countryData) {
//           updated.whatsapp = extractLocalNumber(String(value), countryData);
//         }
//         return updated;
//       });
//     },
//     [sameWhatsapp]
//   );

//   const handleWhatsappChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) =>
//       setFormData((prev) => ({ ...prev, whatsapp: e.target.value })),
//     []
//   );

//   const handlePropertySelection = useCallback(
//     (propertyId: string) => {
//       const property = availableProperties.find((p) => String(p.id) === String(propertyId));
//       if (DEBUG) console.log('[SellerFormModal] handlePropertySelection', propertyId, property);
//       if (!property) return;

//       // Check if property already exists to prevent duplicates
//       const existingProperty = (formData.properties || []).find((p) => String(p.id) === String(propertyId));
//       if (existingProperty) {
//         console.warn('[SellerFormModal] Property already added:', propertyId);
//         setShowPropertySelector(false);
//         return;
//       }

//       setFormData((prev) => ({
//         ...prev,
//         properties: [...(prev.properties || []), { ...property, id: String(property.id) }],
//       }));
//       setShowPropertySelector(false);
//       setPropertySearchQuery(''); // Clear search when closing
//     },
//     [availableProperties, formData.properties]
//   );

//   const removeProperty = useCallback(
//     (propertyId: string) => {
//       if (DEBUG) console.log('[SellerFormModal] removeProperty', propertyId);
//       setFormData((prev) => ({
//         ...prev,
//         properties: (prev.properties || []).filter((p) => String(p.id) !== String(propertyId)),
//       }));
//     },
//     []
//   );

//   const addCoSeller = useCallback(() => {
//     setFormData((prev) => ({
//       ...prev,
//       coSellers: [
//         ...(prev.coSellers || []),
//         {
//           coSeller_salutation: 'Mr.',
//           coSeller_name: '',
//           coSeller_phone: '',
//           coSeller_whatsapp: '',
//           coSeller_email: '',
//           coSeller_dob: '',
//           coSeller_sameAsPhone: false,
//           coSeller_relation: '',
//         },
//       ],
//     }));
//   }, []);

//   const updateCoSeller = useCallback((index: number, field: keyof CoSeller, value: any) => {
//     setFormData((prev) => ({
//       ...prev,
//       coSellers: (prev.coSellers || []).map((cs, i) => (i === index ? { ...cs, [field]: value } : cs)),
//     }));
//   }, []);

//   const removeCoSeller = useCallback((index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       coSellers: (prev.coSellers || []).filter((_, i) => i !== index),
//     }));
//   }, []);

//   const handleCoSellerPhoneChange = useCallback(
//     (index: number, value: string, countryData?: any) => {
//       setFormData((prev) => ({
//         ...prev,
//         coSellers: (prev.coSellers || []).map((cs, i) => {
//           if (i !== index) return cs;
//           const updated: CoSeller = { ...cs, coSeller_phone: value };
//           if (cs.coSeller_sameAsPhone && countryData) {
//             updated.coSeller_whatsapp = extractLocalNumber(String(value), countryData);
//           }
//           return updated;
//         }),
//       }));
//     },
//     []
//   );

//   const toggleCoSellerSameAsPhone = useCallback((index: number, checked: boolean) => {
//     setFormData((prev) => ({
//       ...prev,
//       coSellers: (prev.coSellers || []).map((cs, i) => {
//         if (i !== index) return cs;
//         const updated: CoSeller = { ...cs, coSeller_sameAsPhone: checked };
//         if (checked && cs.coSeller_phone) {
//           const phoneStr = String(cs.coSeller_phone);
//           updated.coSeller_whatsapp = phoneStr.length > 10 ? phoneStr.slice(-10) : phoneStr;
//         }
//         return updated;
//       }),
//     }));
//   }, []);

//   /* ----------------- Age calc & validation (based on seller_dob) ---------------- */
//   const age = useMemo(() => {
//     const iso = formData.seller_dob;
//     if (!iso) return 0;
//     const d = new Date(iso);
//     let a = TODAY.getFullYear() - d.getFullYear();
//     const m = TODAY.getMonth() - d.getMonth();
//     if (m < 0 || (m === 0 && TODAY.getDate() < d.getDate())) a--;
//     return a;
//   }, [formData.seller_dob]);

//   const ageError = age < 18 ? 'Seller must be at least 18 years old' : '';

//   /* ----------------------------------- save ----------------------------------- */

//   const onlyDigits = (s: string) => (s || '').replace(/\D/g, '');

//   const isValidEmail = (s?: string) =>
//     isEmpty(s) ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));

//   const handleSave = useCallback(async () => {
//     if (isEmpty(formData.name)) return alert('Please enter seller name');
//     if (isEmpty(formData.phone)) return alert('Please enter phone number');
//     if (!isValidEmail(formData.email)) return alert('Please enter a valid email');
//     if (age < 18) return alert('Seller must be at least 18 years old');

//     setIsSubmitting(true);
//     try {
//       const cosellers = (formData.coSellers || []).map((cs: any) => ({
//         id: cs.id ?? undefined,
//         seller_id: formData.id ? Number(formData.id) : undefined,
//         salutation: cs.coSeller_salutation || 'Mr.',
//         name: (cs.coSeller_name || '').trim(),
//         phone: onlyDigits(cs.coSeller_phone || ''),
//         whatsapp: onlyDigits(cs.coSeller_whatsapp || ''),
//         email: (cs.coSeller_email || '').trim(),
//         relation: cs.coSeller_relation || '',
//         dob: cs.coSeller_dob || '',
//       }));

//       const uiCoSellers = (formData.coSellers || []).map((cs: any) => ({
//         id: cs.id ?? undefined,
//         coSeller_salutation: cs.coSeller_salutation || 'Mr.',
//         coSeller_name: (cs.coSeller_name || '').trim(),
//         coSeller_phone: onlyDigits(cs.coSeller_phone || ''),
//         coSeller_whatsapp: onlyDigits(cs.coSeller_whatsapp || ''),
//         coSeller_email: (cs.coSeller_email || '').trim(),
//         coSeller_dob: cs.coSeller_dob || '',
//         coSeller_sameAsPhone: !!cs.coSeller_sameAsPhone,
//         coSeller_relation: cs.coSeller_relation || '',
//       }));

//       const nowIso = new Date().toISOString();
//       // 🔥 AUTO ASSIGN SELLER TO EXECUTIVE
//       const assignedToFinal =
//         formData.assigned_to ||
//         (user?.role?.toLowerCase().includes('executive') ? user.id : '');

//       const sellerData: Seller & { cosellers: any[] } = {
//         ...formData,

//         phone: onlyDigits(String(formData.phone || '')),
//         whatsapp: onlyDigits(formData.whatsapp || ''),
//         email: (formData.email || '').trim(),

//         assigned_to: assignedToFinal,           // 🔥 AUTO ASSIGN
//         assigned_to_name:
//           formData.assigned_to_name ||
//           (assignedToFinal && user
//             ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
//             : ''),

//         coSellers: uiCoSellers,
//         cosellers,
//       };


//       if (DEBUG) console.log('[SellerFormModal] onSave payload', sellerData);

//       await onSave?.(sellerData);
//     } catch (e) {
//       console.error('Error preparing seller:', e);
//       alert('Failed to save seller');
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [age, formData, onSave]);

//   /* ----------------------------------- UI ------------------------------------ */

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">{seller ? 'Edit Seller' : 'Add New Seller'}</h2>
//               <p className="text-sm text-gray-600 mt-1">Enter Seller information and property details</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="group p-2.5 rounded-xl bg-white hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl border hover:border-red-200"
//               aria-label="Close"
//             >
//               <X size={18} className="text-gray-600 group-hover:text-red-500 transition-colors" />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="p-6 max-h-[70vh] overflow-y-auto">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             {/* MAIN */}
//             <main className="md:col-span-2 space-y-6">
//               {/* Basic Info */}
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
//                   <User className="mr-2" size={16} /> Seller — Basic Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//                   <div className="md:col-span-1">
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Salutation *</label>
//                     <select
//                       value={formData.salutation || 'Mr.'}
//                       onChange={(e) => handleInputChange('salutation', e.target.value)}
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       {salutationOptions.map((opt: any) => (
//                         <option key={opt.value ?? opt.label} value={opt.value ?? opt.label}>
//                           {opt.label ?? opt.value}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="md:col-span-3">
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
//                     <input
//                       type="text"
//                       value={formData.name || ''}
//                       onChange={(e) => handleInputChange('name', e.target.value)}
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter full name"
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="mt-3">
//                   <DOBStepCalendar
//                     value={formData.seller_dob || ISO_18Y_BACK}
//                     onChange={(iso) => setFormData((prev) => ({ ...prev, seller_dob: iso }))}
//                     label="Date of Birth"
//                     required
//                     max={ISO_18Y_BACK}
//                     placeholder="Select your date of birth"
//                     size="sm"
//                   />
//                 </div>
//               </div>

//               {/* Contact */}
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
//                   <Phone className="mr-2" size={16} /> Seller — Contact Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
//                     <PhoneInput
//                       country="in"
//                       value={formData.phone || ''}
//                       onChange={handlePhoneChange as any}
//                       inputProps={{ name: 'phone', required: true, autoFocus: false }}
//                       inputClass="!w-full !h-9 !text-xs"
//                       containerClass="!w-full"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       WhatsApp Number{' '}
//                       <span className="ml-2 inline-flex items-center">
//                         <input type="checkbox" checked={sameWhatsapp} onChange={toggleSameWhatsapp} className="mr-1" />
//                         <span className="text-xs text-gray-500">Same as phone</span>
//                       </span>
//                     </label>
//                     <div className="relative">
//                       <FaWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-base pointer-events-none" />
//                       <input
//                         type="tel"
//                         inputMode="tel"
//                         placeholder="Enter WhatsApp number"
//                         value={formData.whatsapp || ''}
//                         onChange={handleWhatsappChange}
//                         disabled={sameWhatsapp}
//                         className="w-full pl-9 pr-2 py-2 border rounded-lg text-xs disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="mt-3">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
//                   <input
//                     type="email"
//                     value={formData.email || ''}
//                     onChange={(e) => handleInputChange('email', e.target.value)}
//                     className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Enter email address"
//                   />
//                 </div>
//               </div>
//             </main>

//             {/* RIGHT SIDEBAR */}
//             <aside className="md:col-span-2 space-y-6 text-xs">
//               {/* Location */}
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
//                   <MapPin className="mr-2" size={16} /> Location Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   {/* State */}
//                   {stateOptions.length ? (
//                     <select
//                       value={formData.state || ''}
//                       onChange={(e) => {
//                         const newState = e.target.value;
//                         handleInputChange('state', newState);
//                         if (newState !== formData.state) {
//                           handleInputChange('city', '');
//                           handleInputChange('location', '');
//                         }
//                       }}
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">Select State</option>
//                       {stateOptions.map((s: any) => (
//                         <option key={s.value ?? s.label} value={s.value ?? s.label}>
//                           {s.label ?? s.value}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     <input
//                       type="text"
//                       value={formData.state || ''}
//                       onChange={(e) => handleInputChange('state', e.target.value)}
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="State"
//                     />
//                   )}

//                   {/* City */}
//                   {filteredCities.length || cityOptions.length ? (
//                     <select
//                       value={formData.city || ''}
//                       onChange={(e) => {
//                         const newCity = e.target.value;
//                         handleInputChange('city', newCity);
//                         if (newCity !== formData.city) {
//                           handleInputChange('location', '');
//                         }
//                       }}
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">Select City</option>
//                       {(filteredCities.length ? filteredCities : cityOptions).map((c: any) => (
//                         <option key={c.value ?? c.label} value={c.value ?? c.label}>
//                           {c.label ?? c.value}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     <input
//                       type="text"
//                       value={formData.city || ''}
//                       onChange={(e) => handleInputChange('city', e.target.value)}
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="City"
//                     />
//                   )}

//                   {/* Location */}
//                   {filteredLocations.length || locationOptions.length ? (
//                     <select
//                       value={formData.location || ''}
//                       onChange={(e) => handleInputChange('location', e.target.value)}
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">Select Location</option>
//                       {(filteredLocations.length ? filteredLocations : locationOptions).map(
//                         (l: any) => (
//                           <option key={l.value ?? l.label} value={l.value ?? l.label}>
//                             {l.label ?? l.value}
//                           </option>
//                         )
//                       )}
//                     </select>
//                   ) : (
//                     <input
//                       type="text"
//                       value={formData.location || ''}
//                       onChange={(e) => handleInputChange('location', e.target.value)}
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Location/Area"
//                     />
//                   )}
//                 </div>
//               </div>

//               {/* Lead Details */}
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
//                   <Star className="mr-2" size={16} /> Lead Details
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
//                     <select
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       value={formData.source || ''}
//                       onChange={(e) => handleInputChange('source', e.target.value)}
//                     >
//                       <option value="">Select source</option>
//                       {leadSourceOptions.map((o: any) => (
//                         <option key={o.value ?? o.label} value={o.value ?? o.label}>
//                           {o.label ?? o.value}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Lead Stage</label>
//                     <select
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       value={formData.stage || ''}
//                       onChange={(e) => handleInputChange('stage', e.target.value)}
//                     >
//                       <option value="">Select stage</option>
//                       {leadStageOptions.map((o: any) => (
//                         <option key={o.value ?? o.label} value={o.value ?? o.label}>
//                           {o.label ?? o.value}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Lead Type</label>
//                     <select
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       value={formData.leadType || ''}
//                       onChange={(e) => handleInputChange('leadType', e.target.value)}
//                     >
//                       <option value="">Select type</option>
//                       {leadTypeOptions.map((o: any) => (
//                         <option key={o.value ?? o.label} value={o.value ?? o.label}>
//                           {o.label ?? o.value}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
//                     <select
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       value={formData.priority || ''}
//                       onChange={(e) => handleInputChange('priority', e.target.value)}
//                     >
//                       <option value="">Select priority</option>
//                       {leadPriorityOpts.map((o: any) => (
//                         <option key={o.value ?? o.label} value={o.value ?? o.label}>
//                           {o.label ?? o.value}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
//                     <select
//                       className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       value={formData.status || ''}
//                       onChange={(e) => handleInputChange('status', e.target.value)}
//                     >
//                       <option value="">Select status</option>
//                       {leadStatusOptions.map((o: any) => (
//                         <option key={o.value ?? o.label} value={o.value ?? o.label}>
//                           {o.label ?? o.value}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Assigned Executive */}
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Executive</label>
//                 <select
//                   className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                   value={String(formData.assigned_to || '')}
//                   onChange={(e) => {
//                     const id = e.target.value;
//                     const exec = salesUsers.find((u) => String(u.id) === String(id));
//                     handleInputChange('assigned_to', id);
//                     handleInputChange(
//                       'assigned_to_name',
//                       exec ? exec.name : ''
//                     );
//                   }}
//                 >
//                   <option value="">Select Sales Executive</option>
//                   {salesUsers.map((user: any) => (
//                     <option key={user.id} value={user.id}>
//                       {user.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </aside>
//           </div>

//           {/* Properties */}
//           <div className="mt-6">
//             <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
//               <Building className="mr-2" size={16} /> Properties (Only Public & Unassigned)
//             </h3>
//             <div className="space-y-2">
//               {(formData.properties || []).map((property) => (
//                 <div
//                   key={property.id}
//                   className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:shadow-md"
//                 >
//                   {property.image ? (
//                     <img src={property.image} alt={property.title} className="w-16 h-16 object-cover rounded-lg" />
//                   ) : (
//                     <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
//                       No Image
//                     </div>
//                   )}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2">
//                       <div className="font-medium text-gray-900 truncate">{property.title}</div>
//                       {property._rxpBadge && (
//                         <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 border border-blue-200">
//                           {property._rxpBadge}
//                         </span>
//                       )}

//                     </div>
//                     <div className="text-[11px] text-gray-600 truncate">{property.address}</div>
//                     {property.price && (
//                       <div className="text-[12px] text-green-600 font-semibold">
//                         ₹ {numberToINR(property.price)}
//                       </div>
//                     )}
//                     {property.size && <div className="text-[11px] text-gray-500">{property.size} sq.ft</div>}
//                   </div>
//                   <button
//                     onClick={() => removeProperty(property.id)}
//                     className="group p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200"
//                     aria-label="Remove property"
//                   >
//                     <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
//                   </button>
//                 </div>
//               ))}
//               <div className="flex justify-center">
//                 <button
//                   onClick={() => setShowPropertySelector(true)}
//                   disabled={loadingProps}
//                   className="group flex items-center justify-center space-x-2 w-fit px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-full hover:bg-emerald-500 hover:text-white transition-all duration-300 font-medium disabled:opacity-50"
//                 >
//                   <Home size={18} className="group-hover:scale-110 transition-transform" />
//                   <span>{loadingProps ? 'Loading...' : 'Add Property'}</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Co-Sellers */}
//           <div className="mt-6">
//             <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
//               <User className="mr-2" size={16} /> Co-Sellers (Optional)
//             </h3>
//             <div className="space-y-3">
//               {(formData.coSellers || []).map((coSeller, index) => (
//                 <div key={`coseller-${index}`} className="p-3 border rounded-lg">
//                   <div className="space-y-2">
//                     {/* Row 1 */}
//                     <div className="grid grid-cols-[100px_1fr_1fr] gap-2">
//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1">Salutation *</label>
//                         <select
//                           value={coSeller.coSeller_salutation || 'Mr.'}
//                           onChange={(e) => updateCoSeller(index, 'coSeller_salutation', e.target.value)}
//                           className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           {salutationOptions.map((opt: any) => (
//                             <option key={opt.value ?? opt.label} value={opt.value ?? opt.label}>
//                               {opt.label ?? opt.value}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-[10px] font-medium text-gray-700 mb-1">Full Name</label>
//                         <input
//                           type="text"
//                           value={coSeller.coSeller_name || ''}
//                           onChange={(e) => updateCoSeller(index, 'coSeller_name', e.target.value)}
//                           className="w-full h-7 px-1 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Co-Seller full name"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-[10px] font-medium text-gray-700 mb-1">Email Address</label>
//                         <input
//                           type="email"
//                           value={coSeller.coSeller_email || ''}
//                           onChange={(e) => updateCoSeller(index, 'coSeller_email', e.target.value)}
//                           className="w-full h-7 px-1 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Email address"
//                         />
//                       </div>
//                     </div>

//                     {/* Row 2 */}
//                     <div className="grid grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-[10px] font-medium text-gray-700 mb-1">Phone</label>
//                         <PhoneInput
//                           country="in"
//                           value={coSeller.coSeller_phone || ''}
//                           onChange={(value, countryData) =>
//                             handleCoSellerPhoneChange(index, value as string, countryData)
//                           }
//                           inputProps={{ name: `coSeller-phone-${index}`, autoFocus: false }}
//                           inputClass="!w-full !h-7 !text-[10px]"
//                           containerClass="!w-full"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                           <FaWhatsapp className="text-green-500" size={10} /> WhatsApp Number
//                           <input
//                             type="checkbox"
//                             checked={!!coSeller.coSeller_sameAsPhone}
//                             onChange={(e) => toggleCoSellerSameAsPhone(index, e.target.checked)}
//                             className="ml-1 scale-75"
//                           />
//                           <span className="text-[9px] text-gray-500">Same as phone</span>
//                         </label>
//                         <input
//                           type="tel"
//                           value={coSeller.coSeller_whatsapp || ''}
//                           onChange={(e) => updateCoSeller(index, 'coSeller_whatsapp', e.target.value)}
//                           disabled={!!coSeller.coSeller_sameAsPhone}
//                           className="w-full h-7 px-1 border rounded text-[10px] disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="WhatsApp Number"
//                         />
//                       </div>
//                     </div>

//                     {/* Row 3: DOB + Relation + Delete */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1 grid grid-cols-2 gap-3">
//                         <div>
//                           <DOBStepCalendar
//                             value={coSeller.coSeller_dob || ''}
//                             onChange={(iso) => updateCoSeller(index, 'coSeller_dob', iso)}
//                             label="Date of Birth"
//                             placeholder="Select date of birth"
//                             size="sm"
//                             max={ISO_18Y_BACK}
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-[10px] font-medium text-gray-700 mb-1">
//                             Relation to Seller
//                           </label>
//                           <input
//                             type="text"
//                             value={coSeller.coSeller_relation || ''}
//                             onChange={(e) => updateCoSeller(index, 'coSeller_relation', e.target.value)}
//                             className="w-full h-9 px-2 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                             placeholder="e.g., Spouse, Brother, Partner"
//                           />
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => removeCoSeller(index)}
//                         className="ml-3 group px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200 hover:shadow-sm"
//                         aria-label="Remove co-seller"
//                       >
//                         <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               <div className="flex justify-center">
//                 <button
//                   onClick={addCoSeller}
//                   className="group flex items-center justify-center space-x-2 w-fit px-4 py-2 border-2 border-purple-500 text-purple-600 rounded-full hover:bg-purple-500 hover:text-white transition-all duration-300 font-medium"
//                 >
//                   <Handshake size={18} className="group-hover:scale-110 transition-transform" />
//                   <span>Add Co-Seller</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="mt-6">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
//             <textarea
//               value={formData.notes || ''}
//               onChange={(e) => handleInputChange('notes', e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//               rows={3}
//               placeholder="Additional notes about the Seller..."
//             />
//           </div>

//           {/* Validation hint */}
//           {ageError && (
//             <div className="mt-2 text-[12px] text-red-600">
//               {ageError}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               {masterLoading && <span className="ml-2">• Loading master data…</span>}
//             </div>
//             <div className="flex items-center justify-end space-x-3">
//               <button
//                 onClick={onClose}
//                 className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
//               >
//                 <span>Cancel</span>
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={
//                   isSubmitting || isEmpty(formData.name) || isEmpty(formData.phone) || !!ageError
//                 }
//                 className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Save size={16} />
//                 <span>{isSubmitting ? 'Saving...' : seller ? 'Update Seller' : 'Save Seller'}</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Property Selector Modal */}
//         {showPropertySelector && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
//             <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
//               <div className="p-4 border-b flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">Select Property</h3>
//                 <button
//                   onClick={() => {
//                     setShowPropertySelector(false);
//                     setPropertySearchQuery(''); // Clear search when closing
//                   }}
//                   className="group p-2 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
//                   aria-label="Close property selector"
//                 >
//                   <X size={20} className="text-gray-600 group-hover:text-red-500 transition-colors" />
//                 </button>
//               </div>

//               {/* Search Bar */}
//               <div className="p-4 border-b">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                   <input
//                     type="text"
//                     value={propertySearchQuery}
//                     onChange={(e) => setPropertySearchQuery(e.target.value)}
//                     placeholder="Search properties by title, address, RXP ID..."
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     autoFocus
//                   />
//                 </div>
//                 <div className="mt-2 text-sm text-gray-500">
//                   Found {filteredAvailableProperties.length} properties
//                 </div>
//               </div>

//               <div className="p-4 max-h-96 overflow-y-auto space-y-3">
//                 {filteredAvailableProperties.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     {propertySearchQuery ?
//                       `No properties found for "${propertySearchQuery}"` :
//                       "No public, unassigned properties available."}
//                   </div>
//                 ) : (
//                   filteredAvailableProperties.map((property) => (
//                     <button
//                       key={property.id}
//                       onClick={() => handlePropertySelection(property.id)}
//                       className="group w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-md transform hover:scale-[1.01]"
//                     >
//                       {property.image ? (
//                         <img src={property.image} alt={property.title} className="w-16 h-16 object-cover rounded-lg" />
//                       ) : (
//                         <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
//                           No Image
//                         </div>
//                       )}
//                       <div className="flex-1 min-w-0 text-left">
//                         <div className="flex items-center gap-2">
//                           <div className="font-medium truncate">{property.title}</div>
//                           {property._rxpBadge && (
//                             <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 border border-blue-200">
//                               {property._rxpBadge}
//                             </span>
//                           )}

//                         </div>
//                         <div className="text-sm text-gray-600 truncate">{property.address}</div>
//                         {property.price ? (
//                           <div className="text-xs text-green-600 font-semibold">
//                             ₹ {Number(property.price).toLocaleString('en-IN')}
//                           </div>
//                         ) : null}
//                         {property._pid && (
//                           <div className="text-xs text-gray-500 mt-1">ID: {property._pid}</div>
//                         )}
//                       </div>
//                     </button>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SellerFormModal;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Save, User, Phone, MapPin, Building, Star, Trash2, Home, Handshake, Search, Briefcase, Mail, Calendar, Award, Flag, Users, CreditCard, FileText } from 'lucide-react';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useProperties } from '@/hooks/properties';
import { FaWhatsapp } from 'react-icons/fa';
import DOBStepCalendar from '../ui/DOBStepCalendar';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

/* --------------------------------- Utils --------------------------------- */
const DEBUG = true;

const norm = (v: any) =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

const resolveOptionValue = (options: any[], incoming: string | undefined | null) => {
  if (!incoming) return '';
  const target = norm(incoming);
  const hit = (options || []).find((o: any) => norm(o.value ?? o.label) === target);
  return hit ? (hit.value ?? hit.label) : (incoming || '');
};

const titleizeUnderscore = (v?: string | null) =>
  (v ?? '')
    .split('_')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

const pick = (...vals: any[]) => vals.find((x) => x !== undefined && x !== null && String(x).trim() !== '');

const getPropertyId = (p: any) => String(p.property_id ?? p.id ?? p._id ?? '');

const composePropertyTitle = (p: any) => {
  const propertyType = pick(p.property_type_name, p.property_type, p.type, p.category, p.type_name, p.propertyType) ?? '';
  const unitType = pick(p.unit_type, p.unitType, p.unit_type_name, p.flat_type, p.configuration, p.bhk, p.bhk_label) ?? '';
  const subType = pick(p.property_subtype_name, p.property_sub_type, p.property_subtype, p.subtype, p.propertySubType, p.segment, p.property_subtype_name) ?? '';
  const society = pick(p.society_name, p.society, p.project_name, p.societyName, p.project, p.location_name) ?? '';

  const parts = [propertyType, unitType, subType].map((s: any) => String(s || '').trim()).filter(Boolean);
  const left = parts.length ? parts.join('  ') : (p.title || 'Property');
  const withSociety = society ? `${left} — ${String(society).trim()}` : left;
  if (withSociety) return withSociety;
  const fallback = p.title || p.society_name || p.name || p.location_name;
  return fallback ? String(fallback) : 'Property';
};

const formatRxpId = (p: any) => {
  const id = getPropertyId(p);
  return id ? `REX ${id}` : '';
};

const adaptProperties = (arr: any[]): MiniProperty[] =>
  (Array.isArray(arr) ? arr : []).map((p: any) => {
    const pid = getPropertyId(p);
    const uniqueId = pid || `P-${Math.random().toString(36).slice(2, 11)}`;
    return {
      id: uniqueId,
      title: composePropertyTitle(p),
      address: p.address || [p.location_name || p.locality_name, p.city_name || p.city].filter(Boolean).join(', '),
      price: p.budget ?? p.price ?? p.expected_price ?? '',
      size: p.carpet_area ?? p.area ?? p.super_builtup_area ?? '',
      image: p.image || p.photo || (Array.isArray(p.photos) ? p.photos[0]?.url || p.photos[0] : ''),
      _rxpBadge: formatRxpId(p),
      _pid: pid,
      _rawProperty: p,
    };
  });

const adaptCoSellers = (arr: any[]): CoSeller[] =>
  (Array.isArray(arr) ? arr : []).map((cs: any) => ({
    id: Number(cs.id ?? cs.coSeller_id ?? cs._id) || undefined,
    seller_id: Number(cs.seller_id ?? cs.parent_id) || undefined,
    coSeller_salutation: cs.coSeller_salutation ?? cs.salutation ?? 'Mr.',
    coSeller_name: cs.coSeller_name ?? cs.name ?? '',
    coSeller_phone: cs.coSeller_phone ?? cs.phone ?? '',
    coSeller_whatsapp: cs.coSeller_whatsapp ?? cs.whatsapp ?? '',
    coSeller_email: cs.coSeller_email ?? cs.email ?? '',
    coSeller_dob: cs.coSeller_dob ?? cs.dob ?? '',
    coSeller_sameAsPhone: Boolean(cs.coSeller_sameAsPhone ?? cs.sameAsPhone),
    coSeller_relation: cs.coSeller_relation ?? cs.relation ?? '',
  }));

const toBool = (v: any) => {
  if (typeof v === 'boolean') return v;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'y';
};

const isEmpty = (s?: string | null) => !String(s ?? '').trim();

/* ---------------------------------- Types --------------------------------- */
type Nullable<T> = T | null | undefined;

type CoSeller = {
  id?: number;
  seller_id?: number;
  coSeller_salutation?: string;
  coSeller_name?: string;
  coSeller_phone?: string;
  coSeller_whatsapp?: string;
  coSeller_email?: string;
  coSeller_dob?: string;
  coSeller_sameAsPhone?: boolean;
  coSeller_relation?: string;
};

type MiniProperty = {
  id: string;
  title: string;
  address?: string;
  price?: number | string;
  size?: string | number;
  image?: string;
  _rxpBadge?: string;
  _pid?: string;
  _rawProperty?: any;
};

export type Seller = {
  id?: number;
  salutation?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  state?: string;
  city?: string;
  location?: string;
  stage?: string;
  leadType?: string;
  priority?: string;
  status?: string;
  properties?: MiniProperty[];
  coSellers?: CoSeller[];
  notes?: string;
  seller_dob?: string;
  countryCode?: string;
  assigned_to?: string | number;
  assigned_to_name?: string;
  created_at?: string;
  updated_at?: string;
  lastActivity?: string;
  visits?: number;
  notifications?: number;
  source?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  seller?: Seller | null;
  onSave: (data: Seller) => Promise<void> | void;
};

// Form Field Component
const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
}> = ({ label, required, children, icon, error }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
      {icon && <span className="text-orange-500">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[8px] mt-0.5">{error}</p>}
  </div>
);

/* ------------------------------ Date helpers ------------------------------ */
const TODAY = new Date();
const pad2 = (n: number) => String(n).padStart(2, '0');
const toISODate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const EIGHTEEN_YEARS_BACK = new Date(TODAY.getFullYear() - 18, TODAY.getMonth(), TODAY.getDate());
const ISO_18Y_BACK = toISODate(EIGHTEEN_YEARS_BACK);

const numberToINR = (v: any) => {
  const n = typeof v === 'string' ? Number(v) : v;
  if (n == null || Number.isNaN(n) || n === '') return '';
  return n.toLocaleString('en-IN');
};

/* ------------------------------ Adapt incoming ----------------------------- */
const adaptIncomingSellerToForm = (
  s: any,
  leadStageOptions: any[],
  leadPriorityOpts: any[],
  leadStatusOptions: any[],
  leadSourceOptions: any[]
): Seller => {
  if (!s) {
    return {
      salutation: 'Mr.',
      seller_dob: ISO_18Y_BACK,
      countryCode: '+91',
      properties: [],
      coSellers: [],
      source: '',
    };
  }

  const stageValue = resolveOptionValue(leadStageOptions, s.stage?.includes('_') ? titleizeUnderscore(s.stage) : s.stage);
  const priorityValue = resolveOptionValue(leadPriorityOpts, s.priority);
  const statusValue = resolveOptionValue(leadStatusOptions, s.status);
  const sourceValue = resolveOptionValue(leadSourceOptions, s.source);

  return {
    id: Number(s.id ?? s.seller_id ?? s._id),
    salutation: s.salutation ?? 'Mr.',
    name: s.name ?? '',
    phone: s.phone ?? '',
    whatsapp: s.whatsapp ?? '',
    email: s.email ?? '',
    state: s.state ?? '',
    city: s.city ?? '',
    location: s.location ?? '',
    stage: stageValue || '',
    leadType: s.leadType ?? s.lead_type ?? '',
    priority: priorityValue || '',
    status: statusValue || '',
    source: sourceValue || '',
    assigned_to: s.assigned_to ?? s.assigned_to_id ?? '',
    assigned_to_name: s.assigned_to_name ?? s.assigned ?? '',
    notes: s.notes ?? '',
    seller_dob: s.seller_dob ?? s.dob ?? ISO_18Y_BACK,
    created_at: s.created_at,
    updated_at: s.updated_at,
    lastActivity: s.lastActivity,
    visits: s.visits,
    notifications: s.notifications,
    properties: adaptProperties(s.properties),
    coSellers: adaptCoSellers(s.coSellers ?? s.cosellers),
  };
};

/* -------------------------------- Component -------------------------------- */
const SellerFormModal: React.FC<Props> = ({ isOpen, onClose, seller, onSave }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<Seller>({
    salutation: 'Mr.',
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    state: '',
    city: '',
    location: '',
    stage: '',
    leadType: '',
    priority: '',
    status: '',
    properties: [],
    coSellers: [],
    notes: '',
    seller_dob: ISO_18Y_BACK,
    countryCode: '+91',
    assigned_to: '',
    assigned_to_name: '',
    source: '',
  });

  const [sameWhatsapp, setSameWhatsapp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [phoneCountryData, setPhoneCountryData] = useState<any>(null);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    (async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'seller', 'lead']);
        if (!alive) return;
        setMasters(data || {});
      } catch (e) {
        console.error('Error fetching master options:', e);
      } finally {
        setMasterLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    (async () => {
      try {
        const formatExecutiveName = (user: any): string => {
          const firstName = user?.first_name || user?.firstName || '';
          const lastName = user?.last_name || user?.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
          if (fullName) return fullName;
          if (user?.name) return user.name;
          if (user?.username) return user.username;
          if (user?.email) return user.email.split('@')[0];
          return 'Sales Executive';
        };

        let executivesData: any[] = [];

        try {
          if (usersAPI.getSalesExecutives) {
            const res = await usersAPI.getSalesExecutives();
            if (res && (Array.isArray(res) || res.items || res.data)) {
              executivesData = Array.isArray(res) ? res : (res.items || res.data || []);
            }
          }
        } catch (err) { console.log('getSalesExecutives failed'); }

        if (executivesData.length === 0 && usersAPI.getAllUsers) {
          const allUsers = await usersAPI.getAllUsers();
          const usersArray = Array.isArray(allUsers) ? allUsers : (allUsers?.data || []);
          executivesData = usersArray.filter((user: any) => {
            const department = String(user?.department || '').toLowerCase();
            const role = String(user?.role || '').toLowerCase();
            return department.includes('sales') && role.includes('executive');
          });
        }

        const formattedExecutives = executivesData.map((user: any) => ({
          id: user.id || user.userId || user._id,
          name: formatExecutiveName(user),
          first_name: user.first_name || user.firstName || '',
          last_name: user.last_name || user.lastName || '',
          email: user.email || '',
          phone: user.phone || user.mobile || '',
          department: user.department || 'Sales',
          role: user.role || 'Sales Executive',
        }));

        if (!alive) return;
        setSalesUsers(formattedExecutives);
      } catch (e) {
        console.error('Error fetching sales users:', e);
        setSalesUsers([]);
      }
    })();
    return () => { alive = false; };
  }, [isOpen]);

  const { fetchProperties, properties, loadingProps } = useProperties({ autoLog: false });
  const fetchedOnceRef = useRef(false);

  useEffect(() => {
    if (!isOpen || fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;
    fetchProperties().catch(console.error);
  }, [isOpen, fetchProperties]);

  useEffect(() => {
    if (!isOpen) fetchedOnceRef.current = false;
  }, [isOpen]);

  const salutationOptions = masters['salutation'] || [{ value: 'Mr.', label: 'Mr.' }, { value: 'Mrs.', label: 'Mrs.' }, { value: 'Ms.', label: 'Ms.' }, { value: 'Dr.', label: 'Dr.' }];
  const stateOptions = masters['state'] || [];
  const cityOptions = masters['city'] || [];
  const leadStageOptions = masters['Seller lead stage'] || masters['seller lead stage'] || [];
  const leadTypeOptions = masters['lead type'] || [];
  const leadPriorityOpts = masters['lead priority'] || [];
  const leadStatusOptions = masters['Seller lead Status'] || masters['seller lead status'] || [];
  const leadSourceOptions = masters['lead source'] || masters['Lead Source'] || [];

  useEffect(() => {
    if (!isOpen) return;
    const next = adaptIncomingSellerToForm(seller, leadStageOptions, leadPriorityOpts, leadStatusOptions, leadSourceOptions);
    setFormData(next);

    if (next.phone) {
      const raw = String(next.phone);
      const last10 = raw.replace(/\D/g, '').slice(-10);
      const wa = String(next.whatsapp ?? '').replace(/\D/g, '');
      setSameWhatsapp(!!wa && (wa === last10 || wa === raw.replace(/^\+?91/, '')));
    } else {
      setSameWhatsapp(false);
    }
  }, [isOpen, seller?.id, leadStageOptions?.length, leadPriorityOpts?.length, leadStatusOptions?.length, leadSourceOptions?.length]);

  const availableProperties: MiniProperty[] = useMemo(() => {
    if (!Array.isArray(properties) || !properties.length) return [];
    return properties
      .filter((p: any) => toBool(p.is_public ?? p.isPublic ?? p.public) && !(p.seller_id ?? p.sellerId ?? p.owner_seller_id))
      .slice(0, 50)
      .map((p: any) => adaptProperties([p])[0]);
  }, [properties]);

  const filteredAvailableProperties = useMemo(() => {
    if (!propertySearchQuery.trim()) return availableProperties;
    const query = propertySearchQuery.toLowerCase().trim();
    return availableProperties.filter((property) => {
      const searchableFields = [property.title || '', property.address || '', property._rxpBadge || '', property._pid || ''];
      return searchableFields.some(field => field.toLowerCase().includes(query));
    });
  }, [availableProperties, propertySearchQuery]);

  const filteredCities = useMemo(() => cityOptions.filter((c: any) => !formData.state || c.parentValue === formData.state), [cityOptions, formData.state]);
  const locationOptions: MasterOption[] = masters['location'] || [];
  const filteredLocations = useMemo(() => locationOptions.filter((l: any) => {
    if (formData.city && l.parentValue === formData.city) return true;
    if (!formData.city && formData.state && l.grandParentValue === formData.state) return true;
    return !formData.state && !formData.city;
  }), [locationOptions, formData.city, formData.state]);

  if (!isOpen) return null;

  const handleInputChange = useCallback((field: keyof Seller, value: any) => setFormData((prev) => ({ ...prev, [field]: value })), []);
  const extractLocalNumber = (fullNumber: string, countryData: any) => {
    if (!countryData || !fullNumber) return '';
    const dialCode: string = countryData.dialCode || '';
    const trimmed = fullNumber.replace(/^\+/, '');
    return trimmed.startsWith(dialCode) ? trimmed.slice(dialCode.length) : trimmed;
  };

  const toggleSameWhatsapp = useCallback(() => {
    setSameWhatsapp((prev) => {
      const next = !prev;
      if (next && formData.phone && phoneCountryData) {
        const localNumber = extractLocalNumber(String(formData.phone), phoneCountryData);
        setFormData((p) => ({ ...p, whatsapp: localNumber }));
      }
      return next;
    });
  }, [formData.phone, phoneCountryData]);

  const handlePhoneChange = useCallback((value: string, countryData?: any) => {
    setPhoneCountryData(countryData);
    setFormData((prev) => {
      const updated: Seller = { ...prev, phone: value };
      if (sameWhatsapp && countryData) updated.whatsapp = extractLocalNumber(String(value), countryData);
      return updated;
    });
  }, [sameWhatsapp]);

  const handleWhatsappChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value })), []);
  const handlePropertySelection = useCallback((propertyId: string) => {
    const property = availableProperties.find((p) => String(p.id) === String(propertyId));
    if (!property) return;
    const existingProperty = (formData.properties || []).find((p) => String(p.id) === String(propertyId));
    if (existingProperty) {
      setShowPropertySelector(false);
      return;
    }
    setFormData((prev) => ({ ...prev, properties: [...(prev.properties || []), { ...property, id: String(property.id) }] }));
    setShowPropertySelector(false);
    setPropertySearchQuery('');
  }, [availableProperties, formData.properties]);

  const removeProperty = useCallback((propertyId: string) => {
    setFormData((prev) => ({ ...prev, properties: (prev.properties || []).filter((p) => String(p.id) !== String(propertyId)) }));
  }, []);

  const addCoSeller = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      coSellers: [...(prev.coSellers || []), { coSeller_salutation: 'Mr.', coSeller_name: '', coSeller_phone: '', coSeller_whatsapp: '', coSeller_email: '', coSeller_dob: '', coSeller_sameAsPhone: false, coSeller_relation: '' }],
    }));
  }, []);

  const updateCoSeller = useCallback((index: number, field: keyof CoSeller, value: any) => {
    setFormData((prev) => ({ ...prev, coSellers: (prev.coSellers || []).map((cs, i) => (i === index ? { ...cs, [field]: value } : cs)) }));
  }, []);

  const removeCoSeller = useCallback((index: number) => {
    setFormData((prev) => ({ ...prev, coSellers: (prev.coSellers || []).filter((_, i) => i !== index) }));
  }, []);

  const handleCoSellerPhoneChange = useCallback((index: number, value: string, countryData?: any) => {
    setFormData((prev) => ({
      ...prev,
      coSellers: (prev.coSellers || []).map((cs, i) => {
        if (i !== index) return cs;
        const updated: CoSeller = { ...cs, coSeller_phone: value };
        if (cs.coSeller_sameAsPhone && countryData) updated.coSeller_whatsapp = extractLocalNumber(String(value), countryData);
        return updated;
      }),
    }));
  }, []);

  const toggleCoSellerSameAsPhone = useCallback((index: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      coSellers: (prev.coSellers || []).map((cs, i) => {
        if (i !== index) return cs;
        const updated: CoSeller = { ...cs, coSeller_sameAsPhone: checked };
        if (checked && cs.coSeller_phone) updated.coSeller_whatsapp = String(cs.coSeller_phone).length > 10 ? String(cs.coSeller_phone).slice(-10) : String(cs.coSeller_phone);
        return updated;
      }),
    }));
  }, []);

  const age = useMemo(() => {
    const iso = formData.seller_dob;
    if (!iso) return 0;
    const d = new Date(iso);
    let a = TODAY.getFullYear() - d.getFullYear();
    const m = TODAY.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && TODAY.getDate() < d.getDate())) a--;
    return a;
  }, [formData.seller_dob]);

  const ageError = age < 18 ? 'Seller must be at least 18 years old' : '';

  const onlyDigits = (s: string) => (s || '').replace(/\D/g, '');
  const isValidEmail = (s?: string) => isEmpty(s) ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));

  const handleSave = useCallback(async () => {
    if (isEmpty(formData.name)) return alert('Please enter seller name');
    if (isEmpty(formData.phone)) return alert('Please enter phone number');
    if (!isValidEmail(formData.email)) return alert('Please enter a valid email');
    if (age < 18) return alert('Seller must be at least 18 years old');

    setIsSubmitting(true);
    try {
      const cosellers = (formData.coSellers || []).map((cs: any) => ({
        id: cs.id ?? undefined,
        seller_id: formData.id ? Number(formData.id) : undefined,
        salutation: cs.coSeller_salutation || 'Mr.',
        name: (cs.coSeller_name || '').trim(),
        phone: onlyDigits(cs.coSeller_phone || ''),
        whatsapp: onlyDigits(cs.coSeller_whatsapp || ''),
        email: (cs.coSeller_email || '').trim(),
        relation: cs.coSeller_relation || '',
        dob: cs.coSeller_dob || '',
      }));

      const uiCoSellers = (formData.coSellers || []).map((cs: any) => ({
        id: cs.id ?? undefined,
        coSeller_salutation: cs.coSeller_salutation || 'Mr.',
        coSeller_name: (cs.coSeller_name || '').trim(),
        coSeller_phone: onlyDigits(cs.coSeller_phone || ''),
        coSeller_whatsapp: onlyDigits(cs.coSeller_whatsapp || ''),
        coSeller_email: (cs.coSeller_email || '').trim(),
        coSeller_dob: cs.coSeller_dob || '',
        coSeller_sameAsPhone: !!cs.coSeller_sameAsPhone,
        coSeller_relation: cs.coSeller_relation || '',
      }));

      const assignedToFinal = formData.assigned_to || (user?.role?.toLowerCase().includes('executive') ? user.id : '');

      const sellerData: Seller & { cosellers: any[] } = {
        ...formData,
        phone: onlyDigits(String(formData.phone || '')),
        whatsapp: onlyDigits(formData.whatsapp || ''),
        email: (formData.email || '').trim(),
        assigned_to: assignedToFinal,
        assigned_to_name: formData.assigned_to_name || (assignedToFinal && user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''),
        coSellers: uiCoSellers,
        cosellers,
      };

      await onSave?.(sellerData);
    } catch (e) {
      console.error('Error preparing seller:', e);
      alert('Failed to save seller');
    } finally {
      setIsSubmitting(false);
    }
  }, [age, formData, onSave, user]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <User size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{seller ? 'Edit Seller' : 'Add New Seller'}</h2>
              <p className="text-[9px] text-white/70">Enter seller information and property details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Basic Info */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><User size={10} style={{ color: O }} /> Basic Information</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="col-span-1">
                    <FormField label="Salutation" required>
                      <select value={formData.salutation || 'Mr.'} onChange={(e) => handleInputChange('salutation', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                        {salutationOptions.map((opt: any) => (<option key={opt.value ?? opt.label} value={opt.value ?? opt.label}>{opt.label ?? opt.value}</option>))}
                      </select>
                    </FormField>
                  </div>
                  <div className="col-span-3">
                    <FormField label="Full Name" required>
                      <input type="text" value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="Enter full name" />
                    </FormField>
                  </div>
                </div>
                <div className="mt-2">
                  <FormField label="Date of Birth" required icon={<Calendar size={7} />}>
                    <DOBStepCalendar value={formData.seller_dob || ISO_18Y_BACK} onChange={(iso) => setFormData((prev) => ({ ...prev, seller_dob: iso }))} label="" required max={ISO_18Y_BACK} placeholder="Select date of birth" size="sm" />
                  </FormField>
                </div>
              </div>

              {/* Contact Info */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Phone size={10} style={{ color: O }} /> Contact Information</h3>
                <div className="space-y-2">
                  <FormField label="Phone Number" required>
                    <PhoneInput country="in" value={formData.phone || ''} onChange={handlePhoneChange as any} inputProps={{ name: 'phone', required: true }} inputClass="!w-full !h-7 !text-[10px] !rounded-lg" containerClass="!w-full" />
                  </FormField>
                  <div>
                    <label className="flex items-center gap-1.5 text-[9px] mb-1" style={{ color: MU }}>
                      <FaWhatsapp className="text-green-500" size={9} /> WhatsApp Number
                      <div className="ml-auto flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={sameWhatsapp} onChange={toggleSameWhatsapp} className="sr-only" />
                          <span className={`w-5 h-2.5 rounded-full relative transition-colors ${sameWhatsapp ? 'bg-orange-500' : 'bg-gray-300'}`}>
                            <span className={`absolute top-0.5 left-0.5 bg-white w-1.5 h-1.5 rounded-full transition-transform ${sameWhatsapp ? 'translate-x-2.5' : 'translate-x-0'}`} />
                          </span>
                          <span className="ml-1 text-[7px]" style={{ color: MU }}>{sameWhatsapp ? 'Same' : 'Different'}</span>
                        </label>
                      </div>
                    </label>
                    <input type="tel" value={formData.whatsapp || ''} onChange={handleWhatsappChange} disabled={sameWhatsapp} className="w-full border rounded-lg px-2 py-1.5 text-[10px] disabled:bg-gray-100 focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="WhatsApp number" />
                  </div>
                  <FormField label="Email Address" icon={<Mail size={7} />}>
                    <input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="Enter email address" />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Location */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><MapPin size={10} style={{ color: O }} /> Location</h3>
                <div className="grid grid-cols-1 gap-1.5">
                  <FormField label="State">
                    {stateOptions.length ? (
                      <select value={formData.state || ''} onChange={(e) => { handleInputChange('state', e.target.value); handleInputChange('city', ''); handleInputChange('location', ''); }} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                        <option value="">Select State</option>
                        {stateOptions.map((s: any) => (<option key={s.value ?? s.label} value={s.value ?? s.label}>{s.label ?? s.value}</option>))}
                      </select>
                    ) : (<input type="text" value={formData.state || ''} onChange={(e) => handleInputChange('state', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="State" />)}
                  </FormField>
                  <FormField label="City">
                    {filteredCities.length || cityOptions.length ? (
                      <select value={formData.city || ''} onChange={(e) => { handleInputChange('city', e.target.value); handleInputChange('location', ''); }} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                        <option value="">Select City</option>
                        {(filteredCities.length ? filteredCities : cityOptions).map((c: any) => (<option key={c.value ?? c.label} value={c.value ?? c.label}>{c.label ?? c.value}</option>))}
                      </select>
                    ) : (<input type="text" value={formData.city || ''} onChange={(e) => handleInputChange('city', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="City" />)}
                  </FormField>
                  <FormField label="Location/Area">
                    {filteredLocations.length || locationOptions.length ? (
                      <select value={formData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                        <option value="">Select Location</option>
                        {(filteredLocations.length ? filteredLocations : locationOptions).map((l: any) => (<option key={l.value ?? l.label} value={l.value ?? l.label}>{l.label ?? l.value}</option>))}
                      </select>
                    ) : (<input type="text" value={formData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="Location/Area" />)}
                  </FormField>
                </div>
              </div>

              {/* Lead Details */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Star size={10} style={{ color: O }} /> Lead Details</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <FormField label="Lead Source">
                    <select value={formData.source || ''} onChange={(e) => handleInputChange('source', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                      <option value="">Select source</option>
                      {leadSourceOptions.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </FormField>
                  <FormField label="Lead Stage">
                    <select value={formData.stage || ''} onChange={(e) => handleInputChange('stage', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                      <option value="">Select stage</option>
                      {leadStageOptions.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </FormField>
                  <FormField label="Lead Type">
                    <select value={formData.leadType || ''} onChange={(e) => handleInputChange('leadType', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                      <option value="">Select type</option>
                      {leadTypeOptions.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </FormField>
                  <FormField label="Priority" icon={<Flag size={7} />}>
                    <select value={formData.priority || ''} onChange={(e) => handleInputChange('priority', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                      <option value="">Select priority</option>
                      {leadPriorityOpts.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </FormField>
                  <FormField label="Status" icon={<Award size={7} />}>
                    <select value={formData.status || ''} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                      <option value="">Select status</option>
                      {leadStatusOptions.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </FormField>
                  <div className="col-span-2">
                    <FormField label="Assigned Executive" icon={<User size={7} />}>
                      <select value={String(formData.assigned_to || '')} onChange={(e) => { const id = e.target.value; const exec = salesUsers.find((u) => String(u.id) === String(id)); handleInputChange('assigned_to', id); handleInputChange('assigned_to_name', exec ? exec.name : ''); }} className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                        <option value="">Select Sales Executive</option>
                        {salesUsers.map((user: any) => (<option key={user.id} value={user.id}>{user.name}</option>))}
                      </select>
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Properties */}
          <div className="mt-3 rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
            <h3 className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Building size={10} style={{ color: O }} /> Properties</h3>
            <div className="space-y-2">
              {(formData.properties || []).map((property) => (
                <div key={property.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'white', border: `1px solid ${BD}` }}>
                  {property.image ? (<img src={property.image} alt={property.title} className="w-12 h-12 object-cover rounded-lg" />) : (<div className="w-12 h-12 rounded-lg flex items-center justify-center text-[8px]" style={{ background: BG, color: MU }}>No Image</div>)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1"><div className="font-medium text-[9px] truncate">{property.title}</div>{property._rxpBadge && (<span className="px-1 py-0.25 rounded-full text-[7px]" style={{ background: `${O}15`, color: O }}>{property._rxpBadge}</span>)}</div>
                    <div className="text-[7px] truncate" style={{ color: MU }}>{property.address}</div>
                    {property.price && <div className="text-[8px] font-semibold" style={{ color: O }}>₹ {numberToINR(property.price)}</div>}
                  </div>
                  <button onClick={() => removeProperty(property.id)} className="p-1 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}><Trash2 size={10} /></button>
                </div>
              ))}
              <button onClick={() => setShowPropertySelector(true)} disabled={loadingProps} className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-[9px] font-medium transition-all hover:opacity-80" style={{ background: `${O}10`, color: O }}>
                <Home size={10} /> {loadingProps ? 'Loading...' : 'Add Property'}
              </button>
            </div>
          </div>

          {/* Co-Sellers */}
          <div className="mt-3 rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
            <h3 className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Users size={10} style={{ color: O }} /> Co-Sellers</h3>
            <div className="space-y-2">
              {(formData.coSellers || []).map((coSeller, index) => (
                <div key={`coseller-${index}`} className="p-2 rounded-lg" style={{ background: 'white', border: `1px solid ${BD}` }}>
                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Salutation">
                      <select value={coSeller.coSeller_salutation || 'Mr.'} onChange={(e) => updateCoSeller(index, 'coSeller_salutation', e.target.value)} className="w-full border rounded-lg px-1.5 py-1 text-[8px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }}>
                        {salutationOptions.map((opt: any) => (<option key={opt.value ?? opt.label} value={opt.value ?? opt.label}>{opt.label ?? opt.value}</option>))}
                      </select>
                    </FormField>
                    <FormField label="Full Name">
                      <input type="text" value={coSeller.coSeller_name || ''} onChange={(e) => updateCoSeller(index, 'coSeller_name', e.target.value)} className="w-full border rounded-lg px-1.5 py-1 text-[8px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="Full name" />
                    </FormField>
                    <FormField label="Email">
                      <input type="email" value={coSeller.coSeller_email || ''} onChange={(e) => updateCoSeller(index, 'coSeller_email', e.target.value)} className="w-full border rounded-lg px-1.5 py-1 text-[8px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="Email" />
                    </FormField>
                    <FormField label="Phone">
                      <PhoneInput country="in" value={coSeller.coSeller_phone || ''} onChange={(value, countryData) => handleCoSellerPhoneChange(index, value as string, countryData)} inputProps={{ autoFocus: false }} inputClass="!w-full !h-7 !text-[8px] !rounded-lg" containerClass="!w-full" />
                    </FormField>
                    <FormField label="WhatsApp">
                      <div className="flex items-center gap-1"><input type="checkbox" checked={!!coSeller.coSeller_sameAsPhone} onChange={(e) => toggleCoSellerSameAsPhone(index, e.target.checked)} className="accent-orange-500" /><span className="text-[7px]" style={{ color: MU }}>Same as phone</span></div>
                      <input type="tel" value={coSeller.coSeller_whatsapp || ''} onChange={(e) => updateCoSeller(index, 'coSeller_whatsapp', e.target.value)} disabled={!!coSeller.coSeller_sameAsPhone} className="w-full border rounded-lg px-1.5 py-1 text-[8px] disabled:bg-gray-100 focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="WhatsApp" />
                    </FormField>
                    <FormField label="Relation">
                      <input type="text" value={coSeller.coSeller_relation || ''} onChange={(e) => updateCoSeller(index, 'coSeller_relation', e.target.value)} className="w-full border rounded-lg px-1.5 py-1 text-[8px] focus:outline-none focus:ring-1 bg-white" style={{ borderColor: BD }} placeholder="e.g., Spouse" />
                    </FormField>
                    <div className="flex items-end">
                      <button onClick={() => removeCoSeller(index)} className="p-1 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#dc2626' }}><Trash2 size={10} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addCoSeller} className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-[9px] font-medium transition-all hover:opacity-80" style={{ background: `${O}10`, color: O }}>
                <Handshake size={10} /> Add Co-Seller
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-3">
            <FormField label="Notes" icon={<FileText size={7} />}>
              <textarea value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-[9px] focus:outline-none focus:ring-1 bg-white resize-none" style={{ borderColor: BD }} rows={2} placeholder="Additional notes about the Seller..." />
            </FormField>
          </div>

          {ageError && <div className="text-[9px] text-red-500 mt-1">{ageError}</div>}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="text-[7px]" style={{ color: MU }}/>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1 text-[8px] font-medium rounded-lg transition-all hover:bg-gray-50" style={{ border: `1px solid ${BD}`, color: N }}>Cancel</button>
            <button onClick={handleSave} disabled={isSubmitting || isEmpty(formData.name) || isEmpty(formData.phone) || !!ageError} className="flex items-center gap-1 px-3 py-1 text-[8px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50" style={{ background: O }}>
              <Save size={10} /> {isSubmitting ? 'Saving...' : seller ? 'Update Seller' : 'Save Seller'}
            </button>
          </div>
        </div>
      </div>

      {/* Property Selector Modal */}
      {showPropertySelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
              <h3 className="text-sm font-bold text-white">Select Property</h3>
              <button onClick={() => { setShowPropertySelector(false); setPropertySearchQuery(''); }} className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"><X size={16} /></button>
            </div>
            <div className="p-3 border-b" style={{ borderColor: BD }}>
              <div className="relative"><Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} /><input type="text" value={propertySearchQuery} onChange={(e) => setPropertySearchQuery(e.target.value)} placeholder="Search properties by title, address, RXP ID..." className="w-full pl-7 pr-3 py-1.5 text-[10px] border rounded-lg focus:outline-none focus:ring-1" style={{ borderColor: BD }} autoFocus /></div>
              <div className="mt-1 text-[8px]" style={{ color: MU }}>Found {filteredAvailableProperties.length} properties</div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredAvailableProperties.length === 0 ? (<div className="text-center py-6 text-[9px]" style={{ color: MU }}>{propertySearchQuery ? `No properties found for "${propertySearchQuery}"` : "No public, unassigned properties available."}</div>) : (
                filteredAvailableProperties.map((property) => (
                  <button key={property.id} onClick={() => handlePropertySelection(property.id)} className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all hover:shadow-md" style={{ border: `1px solid ${BD}`, background: BG }}>
                    {property.image ? (<img src={property.image} alt={property.title} className="w-12 h-12 object-cover rounded-lg" />) : (<div className="w-12 h-12 rounded-lg flex items-center justify-center text-[8px]" style={{ background: BG, color: MU }}>No Image</div>)}
                    <div className="flex-1 min-w-0"><div className="flex items-center gap-1"><div className="font-medium text-[9px] truncate">{property.title}</div>{property._rxpBadge && (<span className="px-1 py-0.25 rounded-full text-[7px]" style={{ background: `${O}15`, color: O }}>{property._rxpBadge}</span>)}</div>
                    <div className="text-[7px] truncate" style={{ color: MU }}>{property.address}</div>{property.price && (<div className="text-[8px] font-semibold" style={{ color: O }}>₹ {Number(property.price).toLocaleString('en-IN')}</div>)}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerFormModal;