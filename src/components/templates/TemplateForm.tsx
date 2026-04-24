// import { useState, useEffect, useMemo, useRef } from 'react';
// import {
//     X, Plus, Trash2, Lightbulb, Eye, CreditCard as Edit3, Smartphone,
//     Image, FileText as FileDoc, Video, Type, Home, Users, Search,
//     ChevronRight, Upload, MapPin, LayoutGrid, Tag, Phone, Link,
//     Lock, AlertCircle, Save, Send, RotateCcw,
// } from 'lucide-react';
// import type { Template, TemplateCategory, TemplateHeaderType, TemplateType, TemplateButton, CarouselCard } from '../../types';

// interface Props {
//     template: Template | null;
//     onSubmit: (data: Partial<Template>) => Promise<void>;
//     onClose: () => void;
// }

// const CATEGORIES: { value: TemplateCategory; label: string; desc: string; color: string }[] = [
//     { value: 'MARKETING', label: 'Marketing', desc: 'Promotions & offers', color: 'bg-orange-50 text-orange-700 border-orange-200' },
//     { value: 'UTILITY', label: 'Utility', desc: 'Updates & alerts', color: 'bg-blue-50 text-blue-700 border-blue-200' },
//     { value: 'AUTHENTICATION', label: 'Auth', desc: 'OTPs & verification', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
// ];

// const LANGUAGES = [
//     { value: 'en', label: 'English' },
//     { value: 'hi', label: 'Hindi' },
//     { value: 'mr', label: 'Marathi' },
//     { value: 'gu', label: 'Gujarati' },
//     { value: 'te', label: 'Telugu' },
//     { value: 'ta', label: 'Tamil' },
// ];

// const TEMPLATE_TYPES_FOR: Record<TemplateCategory, { value: TemplateType; label: string; icon: React.ElementType; desc: string }[]> = {
//     MARKETING: [
//         { value: 'TEXT', label: 'Text', icon: Type, desc: 'Text only message' },
//         { value: 'IMAGE', label: 'Image', icon: Image, desc: 'Message with image header' },
//         { value: 'VIDEO', label: 'Video', icon: Video, desc: 'Message with video header' },
//         { value: 'DOCUMENT', label: 'Document', icon: FileDoc, desc: 'Message with document header' },
//         { value: 'LOCATION', label: 'Location', icon: MapPin, desc: 'Message with location' },
//         { value: 'CAROUSEL', label: 'Carousel', icon: LayoutGrid, desc: 'Multiple cards (Marketing only)' },
//         { value: 'LIMITED_TIME_OFFER', label: 'Limited Time Offer', icon: Tag, desc: 'LTO with expiry (Marketing only)' },
//     ],
//     UTILITY: [
//         { value: 'TEXT', label: 'Text', icon: Type, desc: 'Text only message' },
//         { value: 'IMAGE', label: 'Image', icon: Image, desc: 'Message with image header' },
//         { value: 'VIDEO', label: 'Video', icon: Video, desc: 'Message with video header' },
//         { value: 'DOCUMENT', label: 'Document', icon: FileDoc, desc: 'Message with document header' },
//         { value: 'LOCATION', label: 'Location', icon: MapPin, desc: 'Message with location' },
//     ],
//     AUTHENTICATION: [
//         { value: 'TEXT', label: 'Text', icon: Type, desc: 'OTP / code only' },
//     ],
// };

// const HEADER_TYPES_FOR: Record<TemplateType, TemplateHeaderType | null> = {
//     TEXT: null,
//     IMAGE: 'IMAGE',
//     VIDEO: 'VIDEO',
//     DOCUMENT: 'DOCUMENT',
//     LOCATION: null,
//     CAROUSEL: null,
//     LIMITED_TIME_OFFER: null,
// };

// type ButtonMode = 'NONE' | 'QUICK_REPLY' | 'CTA' | 'ALL';

// type SuggestionGroup = 'buyer' | 'seller' | 'general' | 'marketing';

// const SUGGESTIONS: {
//     label: string; group: SuggestionGroup; category: TemplateCategory;
//     name: string; templateType: TemplateType; headerText: string; body: string; footer: string;
//     buttons: Pick<TemplateButton, 'type' | 'text' | 'url'>[];
//     sampleValues: string[];
// }[] = [
//         {
//             label: 'Buyer Welcome', group: 'buyer', category: 'UTILITY', name: 'buyer_welcome',
//             templateType: 'TEXT', headerText: 'Welcome, Property Seeker!',
//             body: 'Hi {{1}},\n\nThank you for your interest in buying a property with us!\n\nWe have hundreds of verified properties across {{2}} matching your needs.\n\nOur expert team is ready to help you find your dream home.',
//             footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'View Properties' }, { type: 'QUICK_REPLY', text: 'Talk to Agent' }],
//             sampleValues: ['Rahul', 'Pune'],
//         },
//         {
//             label: 'Buyer Budget Qualify', group: 'buyer', category: 'UTILITY', name: 'buyer_budget_qualify',
//             templateType: 'TEXT', headerText: '',
//             body: 'Hi {{1}},\n\nTo help you find the perfect property, we need a few details:\n\n📍 *Preferred Location:* {{2}}\n💰 *Budget Range:* {{3}}\n🏠 *Property Type:* {{4}}\n\nBased on this, we\'ll shortlist the best options for you!',
//             footer: 'Our team will call you within 24 hrs', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, proceed' }, { type: 'QUICK_REPLY', text: 'Change details' }],
//             sampleValues: ['Rahul', 'Wakad', '60L - 1.2Cr', 'Apartment'],
//         },
//         {
//             label: 'Property Shortlist', group: 'buyer', category: 'MARKETING', name: 'property_shortlist',
//             templateType: 'IMAGE', headerText: '',
//             body: 'Hi {{1}},\n\nWe\'ve shortlisted *{{2}} properties* based on your requirements!\n\n🏠 *Area:* {{3}}\n💰 *Budget:* {{4}}\n\n*Top Pick:* {{5}}\n📍 {{6}}\n\nWould you like to schedule a site visit?',
//             footer: 'T&C apply', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, Book Visit' }, { type: 'QUICK_REPLY', text: 'More Options' }, { type: 'URL', text: 'View All', url: 'https://example.com' }],
//             sampleValues: ['Rahul', '5', 'Wakad', '₹80L', 'Tamara Uprise 3BHK', 'Rahatani, Pune'],
//         },
//         {
//             label: 'Site Visit Confirmation', group: 'buyer', category: 'UTILITY', name: 'site_visit_confirmation',
//             templateType: 'TEXT', headerText: 'Site Visit Confirmed!',
//             body: 'Hi {{1}},\n\nYour site visit has been confirmed!\n\n🏠 *Property:* {{2}}\n📍 *Location:* {{3}}\n📅 *Date:* {{4}}\n⏰ *Time:* {{5}}\n\n👤 *Agent:* {{6}} — {{7}}\n\nPlease carry a valid ID proof.',
//             footer: 'Reply CANCEL to cancel', buttons: [{ type: 'QUICK_REPLY', text: 'Confirm' }, { type: 'QUICK_REPLY', text: 'Reschedule' }],
//             sampleValues: ['Rahul', 'Tamara Uprise', 'Rahatani, Pune', '25 Apr 2026', '11:00 AM', 'Priya Shah', '+91 98765 43210'],
//         },
//         {
//             label: 'Seller Welcome', group: 'seller', category: 'UTILITY', name: 'seller_welcome',
//             templateType: 'TEXT', headerText: 'Sell Your Property Fast!',
//             body: 'Hi {{1}},\n\nThank you for choosing us to sell your property!\n\nWe have *10,000+ verified buyers* actively looking in {{2}}.\n\nOur team will help you:\n✅ Get the best price\n✅ Handle all documentation\n✅ Close deal in 30 days',
//             footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'List My Property' }, { type: 'QUICK_REPLY', text: 'Know More' }],
//             sampleValues: ['Suresh', 'Baner'],
//         },
//         {
//             label: 'Seller Valuation Report', group: 'seller', category: 'UTILITY', name: 'seller_valuation',
//             templateType: 'DOCUMENT', headerText: '',
//             body: 'Hi {{1}},\n\nYour *Free Property Valuation Report* is ready!\n\n🏠 *Property:* {{2}}, {{3}}\n💰 *Estimated Market Value:* ₹{{4}} – ₹{{5}}\n📈 *Area Price Trend:* {{6}}\n\nOur expert can help you maximize your selling price.',
//             footer: 'Valid for 30 days', buttons: [{ type: 'QUICK_REPLY', text: 'Talk to Expert' }, { type: 'QUICK_REPLY', text: 'List Now' }],
//             sampleValues: ['Suresh', '3BHK Apartment', 'Baner', '92L', '1.05Cr', 'Rising +12% YoY'],
//         },
//         {
//             label: 'New Property Launch', group: 'marketing', category: 'MARKETING', name: 'new_property_launch',
//             templateType: 'IMAGE', headerText: '',
//             body: '🎉 *Exclusive Launch Alert!*\n\nHi {{1}},\n\nWe\'re excited to announce the launch of *{{2}}* in {{3}}!\n\n🏗️ *{{4}} BHK* flats starting from *₹{{5}}*\n📅 *Pre-launch offer ends:* {{6}}\n\n💎 Early bird discount: {{7}}%',
//             footer: 'Limited units available', buttons: [{ type: 'URL', text: 'Book Now', url: 'https://example.com' }, { type: 'QUICK_REPLY', text: 'Know More' }],
//             sampleValues: ['Rahul', 'Tamara Uprise', 'Rahatani, Pune', '2,3,4', '87.96L', '30 Apr 2026', '5'],
//         },
//         {
//             label: 'OTP Verification', group: 'general', category: 'AUTHENTICATION', name: 'otp_verification',
//             templateType: 'TEXT', headerText: '',
//             body: '{{1}} is your verification code for {{2}}.\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.',
//             footer: "If you didn't request this, ignore.", buttons: [],
//             sampleValues: ['123456', 'ResaleExpert CRM'],
//         },
//     ];

// const GROUP_LABELS: Record<SuggestionGroup, string> = {
//     buyer: 'Buyer', seller: 'Seller', general: 'General', marketing: 'Marketing',
// };
// const GROUP_COLORS: Record<SuggestionGroup, string> = {
//     buyer: 'bg-blue-50 text-blue-700', seller: 'bg-emerald-50 text-emerald-700',
//     general: 'bg-gray-100 text-gray-600', marketing: 'bg-orange-50 text-orange-700',
// };
// const GROUP_ICONS: Record<SuggestionGroup, React.ElementType> = {
//     buyer: Home, seller: Users, general: FileDoc, marketing: Image,
// };

// const COUNTRY_CODES = [
//     { code: '+91', label: 'IN +91' },
//     { code: '+1', label: 'US +1' },
//     { code: '+44', label: 'UK +44' },
//     { code: '+971', label: 'UAE +971' },
//     { code: '+61', label: 'AU +61' },
//     { code: '+65', label: 'SG +65' },
// ];

// function extractVariables(body: string): number[] {
//     const matches = body.match(/\{\{(\d+)\}\}/g) || [];
//     const nums = [...new Set(matches.map((m) => parseInt(m.replace(/[^0-9]/g, ''))))].sort((a, b) => a - b);
//     return nums;
// }

// type FormState = {
//     name: string;
//     category: TemplateCategory;
//     language: string;
//     template_type: TemplateType;
//     header_text: string;
//     header_media_url: string;
//     body: string;
//     footer: string;
//     buttons: TemplateButton[];
//     sample_values: Record<number, string>;
//     button_mode: ButtonMode;
//     // Location fields
//     location_name: string;
//     location_address: string;
//     location_lat: string;
//     location_lng: string;
//     // Carousel
//     carousel_cards: CarouselCard[];
//     // Limited Time Offer
//     lto_has_expiry: boolean;
//     lto_expiration_date: string;
//     lto_coupon_code: string;
// };

// const emptyForm: FormState = {
//     name: '', category: 'MARKETING', language: 'en',
//     template_type: 'TEXT', header_text: '', header_media_url: '',
//     body: '', footer: '', buttons: [], sample_values: {},
//     button_mode: 'NONE',
//     location_name: '', location_address: '', location_lat: '', location_lng: '',
//     carousel_cards: [],
//     lto_has_expiry: false, lto_expiration_date: '', lto_coupon_code: '',
// };

// function templateToForm(t: Template): FormState {
//     const vars = extractVariables(t.body);
//     const sv: Record<number, string> = {};
//     if (t.variables) t.variables.forEach((v, i) => { sv[i + 1] = v; });

//     let buttonMode: ButtonMode = 'NONE';
//     const buttons: TemplateButton[] = t.buttons || [];
//     const hasQR = buttons.some((b) => b.type === 'QUICK_REPLY');
//     const hasCTA = buttons.some((b) => b.type !== 'QUICK_REPLY');
//     if (hasQR && hasCTA) buttonMode = 'ALL';
//     else if (hasQR) buttonMode = 'QUICK_REPLY';
//     else if (hasCTA) buttonMode = 'CTA';

//     return {
//         name: t.name,
//         category: t.category,
//         language: t.language,
//         template_type: t.template_type || 'TEXT',
//         header_text: t.header_text || '',
//         header_media_url: t.header_media_url || '',
//         body: t.body,
//         footer: t.footer || '',
//         buttons,
//         sample_values: vars.reduce((acc, n) => ({ ...acc, [n]: sv[n] || '' }), {} as Record<number, string>),
//         button_mode: buttonMode,
//         location_name: '', location_address: '', location_lat: '', location_lng: '',
//         carousel_cards: t.carousel_cards || [],
//         lto_has_expiry: t.lto_has_expiry || false,
//         lto_expiration_date: t.lto_expiration_time_ms
//             ? new Date(t.lto_expiration_time_ms).toISOString().slice(0, 16)
//             : '',
//         lto_coupon_code: t.lto_coupon_code || '',
//     };
// }

// // Mock media upload function (replaces Supabase)
// async function mockMediaUpload(file: File): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//             // Simulate network delay
//             setTimeout(() => {
//                 resolve(reader.result as string);
//             }, 500);
//         };
//         reader.onerror = reject;
//         reader.readAsDataURL(file);
//     });
// }

// // ── Body editor with formatting toolbar + auto-increment variable insertion ──
// function BodyEditor({
//     value, onChange, sampleValues, onSampleChange, variables, isApproved,
// }: {
//     value: string;
//     onChange: (v: string) => void;
//     sampleValues: Record<number, string>;
//     onSampleChange: (n: number, v: string) => void;
//     variables: number[];
//     isApproved: boolean;
// }) {
//     const textareaRef = useRef<HTMLTextAreaElement>(null);

//     const wrap = (open: string, close: string) => {
//         const el = textareaRef.current;
//         if (!el) return;
//         const start = el.selectionStart;
//         const end = el.selectionEnd;
//         const selected = value.slice(start, end);
//         const newVal = value.slice(0, start) + open + selected + close + value.slice(end);
//         onChange(newVal);
//         setTimeout(() => {
//             el.focus();
//             el.setSelectionRange(start + open.length, end + open.length);
//         }, 0);
//     };

//     const insertVar = () => {
//         const el = textareaRef.current;
//         if (!el) return;
//         const nextNum = variables.length > 0 ? Math.max(...variables) + 1 : 1;
//         const tag = `{{${nextNum}}}`;
//         const pos = el.selectionStart;
//         const newVal = value.slice(0, pos) + tag + value.slice(pos);
//         onChange(newVal);
//         setTimeout(() => { el.focus(); el.setSelectionRange(pos + tag.length, pos + tag.length); }, 0);
//     };

//     return (
//         <div>
//             <div className="flex items-center justify-between mb-1.5">
//                 <label className="text-xs font-semibold text-gray-600">Message Body <span className="text-rose-500">*</span></label>
//                 <span className="text-[10px] text-gray-400">{value.length}/1024</span>
//             </div>

//             {/* Compact toolbar */}
//             <div className="flex items-center gap-1 mb-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
//                 <button type="button" onClick={() => wrap('*', '*')} title="Bold (*text*)"
//                     className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">B</button>
//                 <button type="button" onClick={() => wrap('_', '_')} title="Italic (_text_)"
//                     className="px-2 py-1 text-xs italic text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">I</button>
//                 <button type="button" onClick={() => wrap('~', '~')} title="Strikethrough (~text~)"
//                     className="px-2 py-1 text-xs line-through text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">S</button>
//                 <div className="w-px h-4 bg-gray-200 mx-0.5" />
//                 <button type="button" onClick={insertVar}
//                     className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
//                     <span>+</span>
//                     <span className="font-mono">{`{{${variables.length > 0 ? Math.max(...variables) + 1 : 1}}}`}</span>
//                 </button>
//                 <span className="text-[9px] text-gray-400 ml-1">auto-inserts next variable</span>
//             </div>

//             <textarea
//                 ref={textareaRef}
//                 rows={6}
//                 value={value}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full border border-gray-200 rounded-b-xl rounded-t-none px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
//                 placeholder={`Hello {{1}}, we have a great property for you in {{2}}.`}
//                 maxLength={1024}
//             />

//             {/* Sample values — only if variables exist */}
//             {variables.length > 0 && (
//                 <div className="mt-2 border border-amber-200 rounded-xl overflow-hidden">
//                     <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
//                         <p className="text-[10px] font-semibold text-amber-800">Sample Values <span className="font-normal text-amber-600">(required for Meta review)</span></p>
//                     </div>
//                     <div className="px-3 py-2 space-y-1.5">
//                         {variables.map((n) => (
//                             <div key={n} className="flex items-center gap-2">
//                                 <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded w-10 text-center shrink-0">{`{{${n}}}`}</span>
//                                 <input
//                                     value={sampleValues[n] || ''}
//                                     onChange={(e) => onSampleChange(n, e.target.value)}
//                                     placeholder={`Sample for {{${n}}}`}
//                                     disabled={isApproved}
//                                     className="flex-1 border border-amber-100 bg-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50"
//                                 />
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // ── Explore Library panel ──────────────────────────────────────────────────
// function ExploreLibrary({
//     filteredSuggestions, suggestionFilter, setSuggestionFilter,
//     suggestionSearch, setSuggestionSearch, onUse, isApproved,
// }: {
//     filteredSuggestions: typeof SUGGESTIONS;
//     suggestionFilter: SuggestionGroup | 'all';
//     setSuggestionFilter: (v: SuggestionGroup | 'all') => void;
//     suggestionSearch: string;
//     setSuggestionSearch: (v: string) => void;
//     onUse: (s: typeof SUGGESTIONS[0]) => void;
//     isApproved: boolean;
// }) {
//     const [previewSuggestion, setPreviewSuggestion] = useState<typeof SUGGESTIONS[0] | null>(null);

//     const SIDEBAR_ITEMS: { id: SuggestionGroup | 'all'; label: string; icon: React.ElementType }[] = [
//         { id: 'all', label: 'All Templates', icon: FileDoc },
//         { id: 'buyer', label: 'Buyer', icon: Home },
//         { id: 'seller', label: 'Seller', icon: Users },
//         { id: 'general', label: 'General', icon: FileDoc },
//         { id: 'marketing', label: 'Marketing', icon: Image },
//     ];

//     return (
//         <div className="flex flex-1 min-h-0 overflow-hidden">
//             {/* Sidebar */}
//             <div className="w-44 border-r border-gray-100 shrink-0 bg-gray-50/50 overflow-y-auto py-2">
//                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">Categories</p>
//                 {SIDEBAR_ITEMS.map((item) => {
//                     const Icon = item.icon;
//                     const isActive = suggestionFilter === item.id;
//                     return (
//                         <button key={item.id} onClick={() => setSuggestionFilter(item.id)}
//                             className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left transition-colors relative ${isActive ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 hover:bg-gray-100'
//                                 }`}>
//                             {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-r" />}
//                             <Icon size={14} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
//                             {item.label}
//                             <span className={`ml-auto text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'text-gray-300'}`}>
//                                 {SUGGESTIONS.filter((s) => item.id === 'all' || s.group === item.id).length}
//                             </span>
//                         </button>
//                     );
//                 })}
//             </div>

//             {/* Main panel */}
//             <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//                 <div className="px-4 py-3 border-b border-gray-100 shrink-0">
//                     <div className="relative">
//                         <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                         <input value={suggestionSearch} onChange={(e) => setSuggestionSearch(e.target.value)}
//                             placeholder="Search templates…"
//                             className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
//                     </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-4">
//                     {filteredSuggestions.length === 0 ? (
//                         <div className="text-center py-12 text-gray-400">
//                             <Lightbulb size={24} className="mx-auto mb-2 opacity-30" />
//                             <p className="text-sm">No templates found</p>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {filteredSuggestions.map((s) => (
//                                 <div key={s.name} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all bg-white flex flex-col">
//                                     <div className="p-4 flex-1">
//                                         {/* Tags row */}
//                                         <div className="flex items-center gap-1.5 flex-wrap mb-2">
//                                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${GROUP_COLORS[s.group]}`}>
//                                                 {GROUP_LABELS[s.group]}
//                                             </span>
//                                             <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{s.templateType}</span>
//                                             <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-semibold ${s.category === 'MARKETING' ? 'bg-orange-50 text-orange-600' :
//                                                     s.category === 'UTILITY' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
//                                                 }`}>{s.category}</span>
//                                         </div>

//                                         <p className="font-bold text-gray-900 text-sm mb-1">{s.label}</p>
//                                         <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 whitespace-pre-line">
//                                             {s.body.replace(/\{\{(\d+)\}\}/g, (_, n) => s.sampleValues[Number(n) - 1] ? `[${s.sampleValues[Number(n) - 1]}]` : `[var${n}]`)}
//                                         </p>

//                                         {/* Variable pills */}
//                                         {s.sampleValues.length > 0 && (
//                                             <div className="flex flex-wrap gap-1 mt-2">
//                                                 {s.sampleValues.slice(0, 3).map((v, i) => (
//                                                     <span key={i} className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-mono border border-amber-100">
//                                                         {`{{${i + 1}}}`}={v}
//                                                     </span>
//                                                 ))}
//                                                 {s.sampleValues.length > 3 && <span className="text-[9px] text-gray-400">+{s.sampleValues.length - 3}</span>}
//                                             </div>
//                                         )}

//                                         {/* Button pills */}
//                                         {s.buttons.length > 0 && (
//                                             <div className="flex flex-wrap gap-1 mt-1.5">
//                                                 {s.buttons.map((b, i) => (
//                                                     <span key={i} className="text-[10px] px-2 py-0.5 border border-blue-100 text-blue-600 bg-blue-50 rounded-full">{b.text}</span>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Footer actions */}
//                                     <div className="border-t border-gray-100 px-3 py-2.5 bg-gray-50/50 flex items-center gap-2">
//                                         <span className="text-[10px] text-gray-400 font-mono flex-1 truncate">{s.name}</span>
//                                         <button
//                                             onClick={() => setPreviewSuggestion(s)}
//                                             className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
//                                         >
//                                             <Eye size={11} /> View
//                                         </button>
//                                         <button
//                                             onClick={() => { onUse(s); }}
//                                             disabled={isApproved}
//                                             className="flex items-center gap-1 text-[11px] font-semibold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 shrink-0"
//                                         >
//                                             Use Template <ChevronRight size={10} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Preview mini-modal */}
//             {previewSuggestion && (
//                 <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl"
//                     onClick={() => setPreviewSuggestion(null)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-6 overflow-hidden"
//                         onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
//                             <div>
//                                 <p className="font-bold text-sm text-gray-900">{previewSuggestion.label}</p>
//                                 <p className="text-[10px] text-gray-400 font-mono">{previewSuggestion.name}</p>
//                             </div>
//                             <button onClick={() => setPreviewSuggestion(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
//                                 <X size={16} />
//                             </button>
//                         </div>
//                         <div className="p-4">
//                             <div className="rounded-xl p-3" style={{ background: '#e5ddd5' }}>
//                                 <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-xs ml-auto">
//                                     <div className="px-3 pt-3 pb-2">
//                                         <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
//                                             {previewSuggestion.body.replace(/\{\{(\d+)\}\}/g, (_, n) =>
//                                                 previewSuggestion.sampleValues[Number(n) - 1] ? `[${previewSuggestion.sampleValues[Number(n) - 1]}]` : `[var${n}]`
//                                             )}
//                                         </p>
//                                         <p className="text-[9px] text-gray-300 text-right mt-1">10:30 AM</p>
//                                     </div>
//                                     {previewSuggestion.buttons.length > 0 && (
//                                         <div className="border-t border-gray-100">
//                                             {previewSuggestion.buttons.map((btn, i) => (
//                                                 <div key={i} className={`text-center text-xs font-semibold text-blue-500 py-2 ${i > 0 ? 'border-t border-gray-100' : ''}`}>{btn.text}</div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => { onUse(previewSuggestion); setPreviewSuggestion(null); }}
//                                 disabled={isApproved}
//                                 className="w-full mt-3 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors"
//                             >
//                                 Use This Template
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default function TemplateForm({ template, onSubmit, onClose }: Props) {
//     const [form, setForm] = useState<FormState>(emptyForm);
//     const [saving, setSaving] = useState(false);
//     const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'explore'>(template ? 'edit' : 'explore');
//     const [suggestionFilter, setSuggestionFilter] = useState<SuggestionGroup | 'all'>('all');
//     const [suggestionSearch, setSuggestionSearch] = useState('');
//     const [uploadingMedia, setUploadingMedia] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const isApproved = template?.status === 'APPROVED';

//     useEffect(() => {
//         if (template) {
//             setForm(templateToForm(template));
//             setActiveTab('edit');
//         }
//     }, [template]);

//     const handleCategoryChange = (cat: TemplateCategory) => {
//         const validTypes = TEMPLATE_TYPES_FOR[cat].map((t) => t.value);
//         setForm((p) => ({
//             ...p,
//             category: cat,
//             template_type: validTypes.includes(p.template_type) ? p.template_type : 'TEXT',
//         }));
//     };

//     const handleTemplateTypeChange = (tt: TemplateType) => {
//         setForm((p) => ({
//             ...p,
//             template_type: tt,
//             header_media_url: '',
//             header_text: '',
//         }));
//     };

//     const applySuggestion = (s: typeof SUGGESTIONS[0]) => {
//         const vars = extractVariables(s.body);
//         const sv = vars.reduce((acc, n, i) => ({ ...acc, [n]: s.sampleValues[i] || '' }), {} as Record<number, string>);
//         const hasQR = s.buttons.some((b) => b.type === 'QUICK_REPLY');
//         const hasCTA = s.buttons.some((b) => b.type !== 'QUICK_REPLY');
//         let buttonMode: ButtonMode = 'NONE';
//         if (hasQR && hasCTA) buttonMode = 'ALL';
//         else if (hasQR) buttonMode = 'QUICK_REPLY';
//         else if (hasCTA) buttonMode = 'CTA';
//         setForm((p) => ({
//             ...p,
//             name: s.name,
//             category: s.category,
//             template_type: s.templateType,
//             header_text: s.headerText,
//             header_media_url: '',
//             body: s.body,
//             footer: s.footer,
//             buttons: s.buttons as TemplateButton[],
//             sample_values: sv,
//             button_mode: buttonMode,
//         }));
//         setActiveTab('edit');
//     };

//     const handleBodyChange = (newBody: string) => {
//         const vars = extractVariables(newBody);
//         setForm((p) => {
//             const sv = { ...p.sample_values };
//             Object.keys(sv).forEach((k) => {
//                 if (!vars.includes(Number(k))) delete sv[Number(k)];
//             });
//             vars.forEach((n) => { if (!(n in sv)) sv[n] = ''; });
//             return { ...p, body: newBody, sample_values: sv };
//         });
//     };

//     const handleMediaUpload = async (file: File) => {
//         if (!file) return;
//         setUploadingMedia(true);
//         setUploadProgress(10);
//         try {
//             setUploadProgress(40);
//             const dataUrl = await mockMediaUpload(file);
//             setUploadProgress(80);
//             setForm((p) => ({ ...p, header_media_url: dataUrl }));
//             setUploadProgress(100);
//         } finally {
//             setUploadingMedia(false);
//             setTimeout(() => setUploadProgress(0), 800);
//         }
//     };

//     // Buttons helpers
//     const quickReplies = form.buttons.filter((b) => b.type === 'QUICK_REPLY');
//     const ctaButtons = form.buttons.filter((b) => b.type !== 'QUICK_REPLY');
//     const urlCtaCount = ctaButtons.filter((b) => b.type === 'URL').length;
//     const phoneCtaCount = ctaButtons.filter((b) => b.type === 'PHONE_NUMBER').length;
//     const copyCodeCount = ctaButtons.filter((b) => b.type === 'COPY_CODE').length;

//     const canAddQuickReply = quickReplies.length < 10;
//     const canAddUrlCta = urlCtaCount < 2;
//     const canAddPhoneCta = phoneCtaCount < 1;
//     const canAddCopyCode = copyCodeCount < 1;

//     const addQuickReply = () => {
//         if (!canAddQuickReply) return;
//         setForm((p) => ({ ...p, buttons: [...p.buttons, { type: 'QUICK_REPLY', text: '' }] }));
//     };

//     const addCta = (type: 'URL' | 'PHONE_NUMBER' | 'COPY_CODE') => {
//         setForm((p) => {
//             let newBtn: TemplateButton;
//             if (type === 'URL') newBtn = { type: 'URL', text: '', url: '' };
//             else if (type === 'PHONE_NUMBER') newBtn = { type: 'PHONE_NUMBER', text: '', country_code: '+91', phone_number: '' };
//             else newBtn = { type: 'COPY_CODE', text: 'Copy Code', coupon_code: '' };
//             return { ...p, buttons: [...p.buttons, newBtn] };
//         });
//     };

//     const removeButton = (i: number) => setForm((p) => ({ ...p, buttons: p.buttons.filter((_, idx) => idx !== i) }));

//     const updateButton = (i: number, patch: Partial<TemplateButton>) => {
//         setForm((p) => ({
//             ...p,
//             buttons: p.buttons.map((b, idx) => idx === i ? { ...b, ...patch } : b),
//         }));
//     };

//     const addCarouselCard = () => {
//         if (form.carousel_cards.length >= 10) return;
//         setForm((p) => ({
//             ...p,
//             carousel_cards: [
//                 ...p.carousel_cards,
//                 { header_type: 'IMAGE', header_url: '', body: '', buttons: [] },
//             ],
//         }));
//     };

//     const updateCarouselCard = (i: number, patch: Partial<CarouselCard>) => {
//         setForm((p) => ({
//             ...p,
//             carousel_cards: p.carousel_cards.map((c, idx) => idx === i ? { ...c, ...patch } : c),
//         }));
//     };

//     const removeCarouselCard = (i: number) => {
//         setForm((p) => ({ ...p, carousel_cards: p.carousel_cards.filter((_, idx) => idx !== i) }));
//     };

//     const handleSaveDraft = async () => {
//         if (!form.name.trim() || !form.body.trim()) return;
//         setSaving(true);
//         await onSubmit(buildPayload('DRAFT'));
//         setSaving(false);
//     };

//     const handleSubmitToMeta = async () => {
//         if (!form.name.trim() || !form.body.trim()) return;
//         setSaving(true);
//         await onSubmit(buildPayload('PENDING'));
//         setSaving(false);
//     };

//     const buildPayload = (status: 'DRAFT' | 'PENDING'): Partial<Template> => {
//         const vars = extractVariables(form.body);
//         const ht = HEADER_TYPES_FOR[form.template_type];
//         return {
//             name: form.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
//             category: form.category,
//             language: form.language,
//             template_type: form.template_type,
//             header_type: ht,
//             header_text: ht === 'TEXT' ? (form.header_text || null) : null,
//             header_media_url: ht && ht !== 'TEXT' ? (form.header_media_url || null) : null,
//             body: form.body,
//             footer: form.footer || null,
//             buttons: form.buttons.length > 0 ? form.buttons : null,
//             variables: vars.length > 0 ? vars.map((n) => form.sample_values[n] || '') : null,
//             carousel_cards: form.template_type === 'CAROUSEL' ? (form.carousel_cards.length > 0 ? form.carousel_cards : null) : null,
//             lto_has_expiry: form.template_type === 'LIMITED_TIME_OFFER' ? form.lto_has_expiry : false,
//             lto_expiration_time_ms: form.template_type === 'LIMITED_TIME_OFFER' && form.lto_has_expiry && form.lto_expiration_date
//                 ? new Date(form.lto_expiration_date).getTime()
//                 : null,
//             lto_coupon_code: form.template_type === 'LIMITED_TIME_OFFER' ? (form.lto_coupon_code || null) : null,
//             status,
//         };
//     };

//     const variables = useMemo(() => extractVariables(form.body), [form.body]);
//     const cat = CATEGORIES.find((c) => c.value === form.category);
//     const templateTypes = TEMPLATE_TYPES_FOR[form.category];

//     const filteredSuggestions = SUGGESTIONS.filter((s) => {
//         const matchesGroup = suggestionFilter === 'all' || s.group === suggestionFilter;
//         const matchesSearch = !suggestionSearch || s.label.toLowerCase().includes(suggestionSearch.toLowerCase()) || s.body.toLowerCase().includes(suggestionSearch.toLowerCase());
//         return matchesGroup && matchesSearch;
//     });

//     const renderBodyPreview = () => {
//         if (!form.body) return <span className="text-gray-400 italic">Message body...</span>;
//         return form.body.replace(/\{\{(\d+)\}\}/g, (_, n) => {
//             const val = form.sample_values[Number(n)];
//             return val ? val : `[${n}]`;
//         });
//     };

//     const headerType = HEADER_TYPES_FOR[form.template_type];

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">

//                 {/* Header */}
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
//                     <div className="flex items-center gap-3">
//                         <div>
//                             <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
//                                 {template ? 'Edit Template' : 'New Template Message'}
//                                 {isApproved && (
//                                     <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
//                                         <Lock size={10} /> Approved — Read Only
//                                     </span>
//                                 )}
//                                 {template?.status === 'DRAFT' && (
//                                     <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-full">
//                                         Draft
//                                     </span>
//                                 )}
//                                 {template?.status === 'REJECTED' && (
//                                     <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full">
//                                         <AlertCircle size={10} /> Rejected
//                                     </span>
//                                 )}
//                             </h2>
//                             <p className="text-xs text-gray-400 mt-0.5">WhatsApp Business Message Template</p>
//                         </div>
//                     </div>
//                     <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
//                         <X size={18} />
//                     </button>
//                 </div>

//                 {/* Rejection reason banner */}
//                 {template?.rejection_reason && (
//                     <div className="flex items-start gap-3 px-6 py-3 bg-red-50 border-b border-red-100">
//                         <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
//                         <div>
//                             <p className="text-xs font-semibold text-red-700">Rejection Reason:</p>
//                             <p className="text-xs text-red-600 mt-0.5">{template.rejection_reason}</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Tabs */}
//                 <div className="flex border-b border-gray-100 px-6 shrink-0 bg-gray-50/50">
//                     {(['explore', 'edit', 'preview'] as const).map((tab) => (
//                         <button
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
//                                 }`}
//                         >
//                             {tab === 'explore' && <Lightbulb size={13} />}
//                             {tab === 'edit' && <Edit3 size={13} />}
//                             {tab === 'preview' && <Smartphone size={13} />}
//                             {tab === 'explore' ? 'Explore Library' : tab === 'edit' ? 'Edit' : 'Preview'}
//                         </button>
//                     ))}
//                 </div>

//                 <div className="flex flex-1 min-h-0 relative">
//                     {/* ───── EXPLORE TAB ───── */}
//                     {activeTab === 'explore' && (
//                         <ExploreLibrary
//                             filteredSuggestions={filteredSuggestions}
//                             suggestionFilter={suggestionFilter}
//                             setSuggestionFilter={setSuggestionFilter}
//                             suggestionSearch={suggestionSearch}
//                             setSuggestionSearch={setSuggestionSearch}
//                             onUse={applySuggestion}
//                             isApproved={isApproved}
//                         />
//                     )}

//                     {/* ───── EDIT TAB ───── */}
//                     {activeTab === 'edit' && (
//                         <div className="flex flex-1 min-h-0">
//                             <div className={`flex-1 overflow-y-auto p-6 space-y-5 ${isApproved ? 'opacity-80 pointer-events-none select-none' : ''}`}>

//                                 {isApproved && (
//                                     <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
//                                         <Lock size={13} />
//                                         This template is approved by Meta and cannot be edited.
//                                     </div>
//                                 )}

//                                 {/* Template Category */}
//                                 <div>
//                                     <label className="text-xs font-semibold text-gray-600 block mb-1">Template Category *</label>
//                                     <p className="text-[10px] text-gray-400 mb-2">Your template should fall under one of these categories.</p>
//                                     <div className="grid grid-cols-3 gap-2">
//                                         {CATEGORIES.map((c) => (
//                                             <button key={c.value} onClick={() => handleCategoryChange(c.value)}
//                                                 className={`p-3 rounded-xl border-2 text-left transition-all ${form.category === c.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
//                                                 <p className="text-xs font-semibold text-gray-800">{c.label}</p>
//                                                 <p className="text-[10px] text-gray-400 mt-0.5">{c.desc}</p>
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* Template Language */}
//                                 <div>
//                                     <label className="text-xs font-semibold text-gray-600 block mb-1">Template Language *</label>
//                                     <select value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
//                                         className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
//                                         {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
//                                     </select>
//                                 </div>

//                                 {/* Template Name */}
//                                 <div>
//                                     <label className="text-xs font-semibold text-gray-600 block mb-1">Template Name *</label>
//                                     <p className="text-[10px] text-gray-400 mb-1.5">Lowercase alphanumeric and underscores only. e.g. buyer_welcome</p>
//                                     <input
//                                         className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
//                                         value={form.name}
//                                         onChange={(e) => setForm((p) => ({ ...p, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
//                                         placeholder="e.g. buyer_welcome"
//                                     />
//                                 </div>

//                                 {/* Template Type */}
//                                 <div>
//                                     <label className="text-xs font-semibold text-gray-600 block mb-1">Template Type *</label>
//                                     <p className="text-[10px] text-gray-400 mb-2">Select the format of your template message.</p>
//                                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
//                                         {templateTypes.map((tt) => {
//                                             const Icon = tt.icon;
//                                             return (
//                                                 <button
//                                                     key={tt.value}
//                                                     onClick={() => handleTemplateTypeChange(tt.value)}
//                                                     className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${form.template_type === tt.value
//                                                             ? 'border-emerald-500 bg-emerald-50'
//                                                             : 'border-gray-200 hover:border-gray-300'
//                                                         }`}
//                                                 >
//                                                     <Icon size={14} className={form.template_type === tt.value ? 'text-emerald-600' : 'text-gray-400'} />
//                                                     <div>
//                                                         <p className="text-xs font-semibold text-gray-800 leading-tight">{tt.label}</p>
//                                                     </div>
//                                                 </button>
//                                             );
//                                         })}
//                                     </div>
//                                 </div>

//                                 {/* Header Text (TEXT type) */}
//                                 {form.template_type === 'TEXT' && (
//                                     <div>
//                                         <label className="text-xs font-semibold text-gray-600 block mb-1">
//                                             Header Text <span className="text-gray-400 font-normal">(Optional)</span>
//                                         </label>
//                                         <input
//                                             className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                             value={form.header_text}
//                                             onChange={(e) => setForm((p) => ({ ...p, header_text: e.target.value }))}
//                                             placeholder="e.g. Site Visit Confirmed!"
//                                             maxLength={60}
//                                         />
//                                         <p className="text-[10px] text-gray-400 mt-1 text-right">{form.header_text.length}/60</p>
//                                     </div>
//                                 )}

//                                 {/* Media Upload / URL (IMAGE / VIDEO / DOCUMENT) */}
//                                 {(form.template_type === 'IMAGE' || form.template_type === 'VIDEO' || form.template_type === 'DOCUMENT') && (
//                                     <div>
//                                         <label className="text-xs font-semibold text-gray-600 block mb-1">
//                                             {form.template_type === 'IMAGE' ? 'Header Image' : form.template_type === 'VIDEO' ? 'Header Video' : 'Header Document'}
//                                         </label>
//                                         <p className="text-[10px] text-gray-400 mb-2">
//                                             Upload a file or paste a URL. This is used as the header media sample for Meta review.
//                                         </p>
//                                         <div className="flex gap-2">
//                                             <input
//                                                 className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                                 value={form.header_media_url}
//                                                 onChange={(e) => setForm((p) => ({ ...p, header_media_url: e.target.value }))}
//                                                 placeholder={
//                                                     form.template_type === 'IMAGE' ? 'https://example.com/image.jpg' :
//                                                         form.template_type === 'VIDEO' ? 'https://example.com/video.mp4' :
//                                                             'https://example.com/document.pdf'
//                                                 }
//                                             />
//                                             <button
//                                                 onClick={() => fileInputRef.current?.click()}
//                                                 disabled={uploadingMedia}
//                                                 className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shrink-0"
//                                             >
//                                                 <Upload size={14} />
//                                                 {uploadingMedia ? `${uploadProgress}%` : 'Upload'}
//                                             </button>
//                                             <input
//                                                 ref={fileInputRef}
//                                                 type="file"
//                                                 className="hidden"
//                                                 accept={
//                                                     form.template_type === 'IMAGE' ? 'image/*' :
//                                                         form.template_type === 'VIDEO' ? 'video/*' :
//                                                             '.pdf,.doc,.docx'
//                                                 }
//                                                 onChange={(e) => {
//                                                     const file = e.target.files?.[0];
//                                                     if (file) handleMediaUpload(file);
//                                                 }}
//                                             />
//                                         </div>
//                                         {uploadProgress > 0 && uploadProgress < 100 && (
//                                             <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                                                 <div
//                                                     className="h-full bg-emerald-500 rounded-full transition-all duration-300"
//                                                     style={{ width: `${uploadProgress}%` }}
//                                                 />
//                                             </div>
//                                         )}
//                                         {form.template_type === 'IMAGE' && form.header_media_url && (
//                                             <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-28">
//                                                 <img src={form.header_media_url} alt="preview" className="w-full h-full object-cover"
//                                                     onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
//                                             </div>
//                                         )}
//                                         <p className="text-[10px] text-gray-400 mt-1">
//                                             {form.template_type === 'IMAGE' && 'JPG, PNG or WEBP (max 5MB)'}
//                                             {form.template_type === 'VIDEO' && 'MP4 format (max 16MB)'}
//                                             {form.template_type === 'DOCUMENT' && 'PDF format (max 100MB)'}
//                                         </p>
//                                     </div>
//                                 )}

//                                 {/* Location Fields */}
//                                 {form.template_type === 'LOCATION' && (
//                                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
//                                         <p className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
//                                             <MapPin size={13} /> Location Header
//                                         </p>
//                                         <div className="grid grid-cols-2 gap-2">
//                                             <div>
//                                                 <label className="text-[10px] font-medium text-gray-600 block mb-1">Place Name</label>
//                                                 <input value={form.location_name} onChange={(e) => setForm((p) => ({ ...p, location_name: e.target.value }))}
//                                                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
//                                                     placeholder="e.g. Tamara Uprise" />
//                                             </div>
//                                             <div>
//                                                 <label className="text-[10px] font-medium text-gray-600 block mb-1">Address</label>
//                                                 <input value={form.location_address} onChange={(e) => setForm((p) => ({ ...p, location_address: e.target.value }))}
//                                                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
//                                                     placeholder="e.g. Rahatani, Pune" />
//                                             </div>
//                                             <div>
//                                                 <label className="text-[10px] font-medium text-gray-600 block mb-1">Latitude</label>
//                                                 <input value={form.location_lat} onChange={(e) => setForm((p) => ({ ...p, location_lat: e.target.value }))}
//                                                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
//                                                     placeholder="18.5861" />
//                                             </div>
//                                             <div>
//                                                 <label className="text-[10px] font-medium text-gray-600 block mb-1">Longitude</label>
//                                                 <input value={form.location_lng} onChange={(e) => setForm((p) => ({ ...p, location_lng: e.target.value }))}
//                                                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
//                                                     placeholder="73.7785" />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Limited Time Offer Fields */}
//                                 {form.template_type === 'LIMITED_TIME_OFFER' && (
//                                     <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
//                                         <p className="text-xs font-semibold text-orange-800 flex items-center gap-1.5">
//                                             <Tag size={13} /> Limited Time Offer Settings
//                                         </p>
//                                         <div>
//                                             <label className="text-[10px] font-medium text-gray-600 block mb-1">Coupon Code <span className="text-gray-400">(max 15 chars)</span></label>
//                                             <input
//                                                 value={form.lto_coupon_code}
//                                                 onChange={(e) => setForm((p) => ({ ...p, lto_coupon_code: e.target.value.slice(0, 15) }))}
//                                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white font-mono"
//                                                 placeholder="SALE20"
//                                                 maxLength={15}
//                                             />
//                                             <p className="text-right text-[10px] text-gray-400 mt-0.5">{form.lto_coupon_code.length}/15</p>
//                                         </div>
//                                         <div className="flex items-center gap-3">
//                                             <label className="flex items-center gap-2 cursor-pointer">
//                                                 <div
//                                                     onClick={() => setForm((p) => ({ ...p, lto_has_expiry: !p.lto_has_expiry }))}
//                                                     className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.lto_has_expiry ? 'bg-orange-500' : 'bg-gray-200'}`}
//                                                 >
//                                                     <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.lto_has_expiry ? 'translate-x-4' : ''}`} />
//                                                 </div>
//                                                 <span className="text-xs font-medium text-gray-700">Offer has expiry date</span>
//                                             </label>
//                                         </div>
//                                         {form.lto_has_expiry && (
//                                             <div>
//                                                 <label className="text-[10px] font-medium text-gray-600 block mb-1">Expiry Date & Time</label>
//                                                 <input
//                                                     type="datetime-local"
//                                                     value={form.lto_expiration_date}
//                                                     onChange={(e) => setForm((p) => ({ ...p, lto_expiration_date: e.target.value }))}
//                                                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
//                                                 />
//                                             </div>
//                                         )}
//                                     </div>
//                                 )}

//                                 {/* Carousel Builder */}
//                                 {form.template_type === 'CAROUSEL' && (
//                                     <div className="space-y-3">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="text-xs font-semibold text-gray-600">Carousel Cards</p>
//                                                 <p className="text-[10px] text-gray-400 mt-0.5">Add up to 10 cards. Each card can have an image/video header, body text, and buttons.</p>
//                                             </div>
//                                             <button
//                                                 onClick={addCarouselCard}
//                                                 disabled={form.carousel_cards.length >= 10}
//                                                 className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 disabled:opacity-40 transition-colors"
//                                             >
//                                                 <Plus size={11} /> Add Card
//                                             </button>
//                                         </div>
//                                         {form.carousel_cards.length === 0 && (
//                                             <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
//                                                 <LayoutGrid size={24} className="mx-auto text-gray-300 mb-2" />
//                                                 <p className="text-xs text-gray-400">No cards yet. Add at least 2 cards.</p>
//                                             </div>
//                                         )}
//                                         {form.carousel_cards.map((card, ci) => (
//                                             <div key={ci} className="border border-gray-200 rounded-xl overflow-hidden">
//                                                 <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
//                                                     <p className="text-xs font-semibold text-gray-700">Card {ci + 1}</p>
//                                                     <button onClick={() => removeCarouselCard(ci)} className="p-1 text-red-400 hover:text-red-600">
//                                                         <Trash2 size={13} />
//                                                     </button>
//                                                 </div>
//                                                 <div className="p-4 space-y-3">
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="flex-1">
//                                                             <label className="text-[10px] font-medium text-gray-500 block mb-1">Header Type</label>
//                                                             <select
//                                                                 value={card.header_type}
//                                                                 onChange={(e) => updateCarouselCard(ci, { header_type: e.target.value as 'IMAGE' | 'VIDEO' })}
//                                                                 className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
//                                                             >
//                                                                 <option value="IMAGE">Image</option>
//                                                                 <option value="VIDEO">Video</option>
//                                                             </select>
//                                                         </div>
//                                                         <div className="flex-1">
//                                                             <label className="text-[10px] font-medium text-gray-500 block mb-1">Media URL</label>
//                                                             <input
//                                                                 value={card.header_url}
//                                                                 onChange={(e) => updateCarouselCard(ci, { header_url: e.target.value })}
//                                                                 className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                                                 placeholder="https://..."
//                                                             />
//                                                         </div>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-[10px] font-medium text-gray-500 block mb-1">Card Body</label>
//                                                         <textarea
//                                                             rows={2}
//                                                             value={card.body}
//                                                             onChange={(e) => updateCarouselCard(ci, { body: e.target.value })}
//                                                             className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                                                             placeholder="Card message body..."
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}

//                                 {/* Body */}
//                                 {form.template_type !== 'CAROUSEL' && (
//                                     <BodyEditor
//                                         value={form.body}
//                                         onChange={handleBodyChange}
//                                         sampleValues={form.sample_values}
//                                         onSampleChange={(n, v) => setForm((p) => ({ ...p, sample_values: { ...p.sample_values, [n]: v } }))}
//                                         variables={variables}
//                                         isApproved={isApproved}
//                                     />
//                                 )}

//                                 {/* Footer */}
//                                 <div>
//                                     <label className="text-xs font-semibold text-gray-600 block mb-1">
//                                         Footer <span className="text-gray-400 font-normal">(Optional)</span>
//                                     </label>
//                                     <input
//                                         className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                         value={form.footer}
//                                         onChange={(e) => setForm((p) => ({ ...p, footer: e.target.value }))}
//                                         placeholder="Enter footer text"
//                                         maxLength={60}
//                                     />
//                                     <p className="text-right text-[10px] text-gray-400 mt-0.5">{form.footer.length}/60</p>
//                                 </div>

//                                 {/* Interactive Actions */}
//                                 <div>
//                                     <label className="text-xs font-semibold text-gray-600 block mb-1">Interactive Actions</label>
//                                     <p className="text-[10px] text-gray-400 mb-3">
//                                         Add buttons to your message. Max 25 chars for button titles.
//                                         Quick Replies: up to 10 | CTA URL: up to 2 | Phone: up to 1 | Copy Code: up to 1
//                                     </p>

//                                     {/* Button Mode Radio */}
//                                     <div className="flex gap-2 mb-4 flex-wrap">
//                                         {(['NONE', 'QUICK_REPLY', 'CTA', 'ALL'] as ButtonMode[]).map((mode) => (
//                                             <button
//                                                 key={mode}
//                                                 onClick={() => {
//                                                     setForm((p) => ({ ...p, button_mode: mode, buttons: mode === 'NONE' ? [] : p.buttons }));
//                                                 }}
//                                                 className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.button_mode === mode
//                                                         ? 'bg-emerald-600 text-white border-emerald-600'
//                                                         : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
//                                                     }`}
//                                             >
//                                                 {mode === 'NONE' ? 'None' : mode === 'QUICK_REPLY' ? 'Quick Replies' : mode === 'CTA' ? 'Call to Actions' : 'All (QR + CTA)'}
//                                             </button>
//                                         ))}
//                                     </div>

//                                     {form.button_mode !== 'NONE' && (
//                                         <div className="space-y-3">
//                                             {/* Quick Replies section */}
//                                             {(form.button_mode === 'QUICK_REPLY' || form.button_mode === 'ALL') && (
//                                                 <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
//                                                     <div className="flex items-center justify-between">
//                                                         <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
//                                                             Quick Replies
//                                                             <span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{quickReplies.length}/10</span>
//                                                         </p>
//                                                         <button
//                                                             onClick={addQuickReply}
//                                                             disabled={!canAddQuickReply}
//                                                             className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 disabled:opacity-40 transition-colors"
//                                                         >
//                                                             <Plus size={10} /> Add
//                                                         </button>
//                                                     </div>
//                                                     {form.buttons.map((btn, i) => btn.type !== 'QUICK_REPLY' ? null : (
//                                                         <div key={i} className="flex items-center gap-2">
//                                                             <input
//                                                                 placeholder="Button label (max 25)"
//                                                                 value={btn.text}
//                                                                 maxLength={25}
//                                                                 onChange={(e) => updateButton(i, { text: e.target.value })}
//                                                                 className="flex-1 border border-emerald-200 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
//                                                             />
//                                                             <span className="text-[10px] text-gray-400 shrink-0 w-7 text-right">{btn.text.length}/25</span>
//                                                             <button onClick={() => removeButton(i)} className="p-1 text-red-400 hover:text-red-600 shrink-0">
//                                                                 <Trash2 size={13} />
//                                                             </button>
//                                                         </div>
//                                                     ))}
//                                                     {quickReplies.length === 0 && (
//                                                         <p className="text-[11px] text-emerald-600 opacity-60 text-center py-1">No quick replies added</p>
//                                                     )}
//                                                 </div>
//                                             )}

//                                             {/* CTA Buttons section */}
//                                             {(form.button_mode === 'CTA' || form.button_mode === 'ALL') && (
//                                                 <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
//                                                     <div className="flex items-center justify-between flex-wrap gap-2">
//                                                         <p className="text-xs font-semibold text-blue-800">Call to Actions</p>
//                                                         <div className="flex gap-1.5 flex-wrap">
//                                                             <button
//                                                                 onClick={() => addCta('URL')}
//                                                                 disabled={!canAddUrlCta}
//                                                                 className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors"
//                                                             >
//                                                                 <Link size={9} /> URL
//                                                                 <span className="bg-blue-100 text-blue-700 px-1 rounded">{urlCtaCount}/2</span>
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => addCta('PHONE_NUMBER')}
//                                                                 disabled={!canAddPhoneCta}
//                                                                 className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors"
//                                                             >
//                                                                 <Phone size={9} /> Phone
//                                                                 <span className="bg-blue-100 text-blue-700 px-1 rounded">{phoneCtaCount}/1</span>
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => addCta('COPY_CODE')}
//                                                                 disabled={!canAddCopyCode}
//                                                                 className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors"
//                                                             >
//                                                                 <Tag size={9} /> Copy Code
//                                                                 <span className="bg-blue-100 text-blue-700 px-1 rounded">{copyCodeCount}/1</span>
//                                                             </button>
//                                                         </div>
//                                                     </div>

//                                                     {form.buttons.map((btn, i) => {
//                                                         if (btn.type === 'QUICK_REPLY') return null;
//                                                         return (
//                                                             <div key={i} className="bg-white border border-blue-200 rounded-lg p-3 space-y-2">
//                                                                 <div className="flex items-center justify-between">
//                                                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${btn.type === 'URL' ? 'bg-blue-100 text-blue-700' :
//                                                                             btn.type === 'PHONE_NUMBER' ? 'bg-green-100 text-green-700' :
//                                                                                 'bg-orange-100 text-orange-700'
//                                                                         }`}>
//                                                                         {btn.type === 'URL' ? 'URL' : btn.type === 'PHONE_NUMBER' ? 'Phone Number' : 'Copy Code'}
//                                                                     </span>
//                                                                     <button onClick={() => removeButton(i)} className="p-1 text-red-400 hover:text-red-600">
//                                                                         <Trash2 size={12} />
//                                                                     </button>
//                                                                 </div>
//                                                                 <div className="flex items-center gap-2">
//                                                                     <input
//                                                                         placeholder="Button title (max 25)"
//                                                                         value={btn.text}
//                                                                         maxLength={25}
//                                                                         onChange={(e) => updateButton(i, { text: e.target.value })}
//                                                                         className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
//                                                                     />
//                                                                     <span className="text-[10px] text-gray-400 shrink-0">{btn.text.length}/25</span>
//                                                                 </div>
//                                                                 {btn.type === 'URL' && (
//                                                                     <input
//                                                                         placeholder="https://example.com"
//                                                                         value={btn.url || ''}
//                                                                         onChange={(e) => updateButton(i, { url: e.target.value })}
//                                                                         className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
//                                                                     />
//                                                                 )}
//                                                                 {btn.type === 'PHONE_NUMBER' && (
//                                                                     <div className="flex gap-2">
//                                                                         <select
//                                                                             value={btn.country_code || '+91'}
//                                                                             onChange={(e) => updateButton(i, { country_code: e.target.value })}
//                                                                             className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
//                                                                         >
//                                                                             {COUNTRY_CODES.map((cc) => (
//                                                                                 <option key={cc.code} value={cc.code}>{cc.label}</option>
//                                                                             ))}
//                                                                         </select>
//                                                                         <input
//                                                                             placeholder="Phone number"
//                                                                             value={btn.phone_number || ''}
//                                                                             onChange={(e) => updateButton(i, { phone_number: e.target.value })}
//                                                                             className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
//                                                                         />
//                                                                     </div>
//                                                                 )}
//                                                                 {btn.type === 'COPY_CODE' && (
//                                                                     <input
//                                                                         placeholder="Coupon code (max 15 chars)"
//                                                                         value={btn.coupon_code || ''}
//                                                                         maxLength={15}
//                                                                         onChange={(e) => updateButton(i, { coupon_code: e.target.value })}
//                                                                         className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
//                                                                     />
//                                                                 )}
//                                                             </div>
//                                                         );
//                                                     })}
//                                                     {ctaButtons.length === 0 && (
//                                                         <p className="text-[11px] text-blue-600 opacity-60 text-center py-1">No CTA buttons added</p>
//                                                     )}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Right: Live Preview */}
//                             <div className="w-64 border-l border-gray-100 p-4 shrink-0 bg-gray-50/30 overflow-y-auto hidden xl:flex xl:flex-col">
//                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
//                                     <Smartphone size={10} /> Live Preview
//                                 </p>
//                                 <PhonePreview form={form} headerType={headerType} renderBodyPreview={renderBodyPreview} compact />
//                             </div>
//                         </div>
//                     )}

//                     {/* ───── PREVIEW TAB ───── */}
//                     {activeTab === 'preview' && (
//                         <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center bg-gray-50/30">
//                             <div className="w-full max-w-xs">
//                                 <PhonePreview form={form} headerType={headerType} renderBodyPreview={renderBodyPreview} />
//                                 {variables.length > 0 && (
//                                     <div className="mt-4 bg-white border border-gray-200 rounded-xl p-3">
//                                         <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Sample Values</p>
//                                         <div className="space-y-1">
//                                             {variables.map((n) => (
//                                                 <div key={n} className="flex items-center gap-2">
//                                                     <span className="text-[10px] font-mono text-gray-400 w-7">{`{{${n}}}`}</span>
//                                                     <span className="text-xs text-gray-700 truncate">{form.sample_values[n] || <span className="text-gray-300 italic">empty</span>}</span>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer Actions */}
//                 <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
//                     <div className="flex items-center gap-2">
//                         {cat && <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cat.color}`}>{cat.label}</span>}
//                         <span className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 font-medium">
//                             {form.template_type}
//                         </span>
//                         {variables.length > 0 && (
//                             <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
//                                 {variables.length} var{variables.length !== 1 ? 's' : ''}
//                             </span>
//                         )}
//                         {form.buttons.length > 0 && (
//                             <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
//                                 {form.buttons.length} btn{form.buttons.length !== 1 ? 's' : ''}
//                             </span>
//                         )}
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
//                             Cancel
//                         </button>
//                         {isApproved ? (
//                             <button disabled className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl opacity-60 cursor-not-allowed">
//                                 <Lock size={14} /> Approved
//                             </button>
//                         ) : (
//                             <>
//                                 <button
//                                     onClick={handleSaveDraft}
//                                     disabled={saving || !form.name.trim() || !form.body.trim()}
//                                     className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
//                                 >
//                                     <Save size={14} />
//                                     {saving ? 'Saving...' : 'Save Draft'}
//                                 </button>
//                                 <button
//                                     onClick={handleSubmitToMeta}
//                                     disabled={saving || !form.name.trim() || !form.body.trim()}
//                                     className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
//                                 >
//                                     <Send size={14} />
//                                     {saving ? 'Submitting...' : 'Submit to Meta'}
//                                 </button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// function PhonePreview({ form, headerType, renderBodyPreview, compact = false }: {
//     form: FormState;
//     headerType: TemplateHeaderType | null;
//     renderBodyPreview: () => React.ReactNode;
//     compact?: boolean;
// }) {
//     if (form.template_type === 'CAROUSEL') {
//         return (
//             <div className={`flex flex-col ${compact ? '' : 'py-4'}`}>
//                 <div className={`bg-[#e5ddd5] rounded-2xl ${compact ? 'p-3' : 'p-5'} shadow-inner w-full`}>
//                     <div className="text-[9px] text-center text-gray-500 mb-2 bg-white/60 rounded-full px-2 py-0.5 mx-auto w-fit">Today</div>
//                     <div className="flex gap-2 overflow-x-auto pb-1">
//                         {form.carousel_cards.length === 0 ? (
//                             <div className="bg-white rounded-xl p-3 min-w-[120px] text-center">
//                                 <LayoutGrid size={20} className="mx-auto text-gray-300 mb-1" />
//                                 <p className="text-[10px] text-gray-400">No cards</p>
//                             </div>
//                         ) : form.carousel_cards.map((card, ci) => (
//                             <div key={ci} className="bg-white rounded-xl overflow-hidden min-w-[120px] max-w-[140px] shrink-0 shadow-sm">
//                                 <div className="h-16 bg-gray-100 flex items-center justify-center">
//                                     {card.header_url ? (
//                                         <img src={card.header_url} alt="" className="w-full h-full object-cover" />
//                                     ) : (
//                                         <Image size={20} className="text-gray-300" />
//                                     )}
//                                 </div>
//                                 <div className="p-2">
//                                     <p className="text-[9px] text-gray-700 leading-tight line-clamp-2">{card.body || 'Card body...'}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                     <p className="text-[10px] text-gray-800 mt-2 bg-white/60 rounded px-2 py-1">{form.body || 'Message body...'}</p>
//                 </div>
//             </div>
//         );
//     }

//     if (form.template_type === 'LOCATION') {
//         return (
//             <div className={`flex flex-col items-center ${compact ? '' : 'py-4'}`}>
//                 <div className={`bg-[#e5ddd5] rounded-2xl ${compact ? 'p-3 w-full' : 'p-5 max-w-xs w-full'} shadow-inner`}>
//                     <div className="text-[9px] text-center text-gray-500 mb-3 bg-white/60 rounded-full px-2 py-0.5 mx-auto w-fit">Today</div>
//                     <div className="bg-white rounded-2xl rounded-tl-none shadow-sm overflow-hidden max-w-[90%]">
//                         <div className={`bg-blue-100 flex items-center justify-center ${compact ? 'h-14' : 'h-20'}`}>
//                             <MapPin size={compact ? 20 : 28} className="text-blue-500" />
//                         </div>
//                         {form.location_name && (
//                             <div className="px-3 py-2">
//                                 <p className={`font-semibold text-gray-900 ${compact ? 'text-[10px]' : 'text-xs'}`}>{form.location_name}</p>
//                                 {form.location_address && <p className={`text-gray-500 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{form.location_address}</p>}
//                             </div>
//                         )}
//                         <div className="px-3 pb-2">
//                             <p className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${compact ? 'text-[10px]' : 'text-xs'}`}>
//                                 {renderBodyPreview()}
//                             </p>
//                             {form.footer && <p className={`text-gray-400 mt-1 italic ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{form.footer}</p>}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className={`flex flex-col items-center ${compact ? '' : 'py-4'}`}>
//             <div className={`bg-[#e5ddd5] rounded-2xl ${compact ? 'p-3 w-full' : 'p-5 max-w-xs w-full'} shadow-inner`}>
//                 <div className="text-[9px] text-center text-gray-500 mb-3 bg-white/60 rounded-full px-2 py-0.5 mx-auto w-fit">Today</div>
//                 <div className="bg-white rounded-2xl rounded-tl-none shadow-sm overflow-hidden max-w-[90%]">
//                     {/* Header */}
//                     {form.template_type === 'TEXT' && form.header_text && (
//                         <div className="px-3 pt-3 pb-1">
//                             <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>{form.header_text}</p>
//                         </div>
//                     )}
//                     {headerType === 'IMAGE' && (
//                         <div className="bg-amber-50 overflow-hidden flex items-center justify-center" style={{ height: compact ? '60px' : '120px' }}>
//                             {form.header_media_url ? (
//                                 <img src={form.header_media_url} alt="header" className="w-full h-full object-cover"
//                                     onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
//                             ) : <Image size={compact ? 18 : 28} className="text-amber-400" />}
//                         </div>
//                     )}
//                     {headerType === 'VIDEO' && (
//                         <div className="bg-gray-800 flex items-center justify-center" style={{ height: compact ? '60px' : '100px' }}>
//                             <Video size={compact ? 16 : 24} className="text-gray-400" />
//                         </div>
//                     )}
//                     {headerType === 'DOCUMENT' && (
//                         <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-100">
//                             <FileDoc size={compact ? 14 : 18} className="text-red-500 shrink-0" />
//                             <span className="text-xs text-gray-600 truncate">{form.header_media_url ? form.header_media_url.split('/').pop() : 'document.pdf'}</span>
//                         </div>
//                     )}

//                     {/* LTO Banner */}
//                     {form.template_type === 'LIMITED_TIME_OFFER' && form.lto_coupon_code && (
//                         <div className="bg-orange-50 border-b border-orange-100 px-3 py-2 flex items-center gap-2">
//                             <Tag size={12} className="text-orange-500 shrink-0" />
//                             <span className={`font-mono font-bold text-orange-700 ${compact ? 'text-[10px]' : 'text-xs'}`}>{form.lto_coupon_code}</span>
//                             <span className={`text-orange-500 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>Copy</span>
//                         </div>
//                     )}

//                     {/* Body */}
//                     <div className="px-3 pt-2 pb-2">
//                         <p className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${compact ? 'text-[10px]' : 'text-xs'}`}>
//                             {renderBodyPreview()}
//                         </p>
//                         {form.footer && (
//                             <p className={`text-gray-400 mt-1.5 italic ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{form.footer}</p>
//                         )}
//                         <div className="flex justify-end mt-1">
//                             <span className="text-[9px] text-gray-400">10:30</span>
//                         </div>
//                     </div>

//                     {/* Buttons */}
//                     {form.buttons.length > 0 && (
//                         <div className="border-t border-gray-100">
//                             {form.buttons.map((btn, i) => (
//                                 <div key={i} className={`text-center font-semibold text-blue-500 py-2 ${compact ? 'text-[10px]' : 'text-xs'} ${i > 0 ? 'border-t border-gray-100' : ''} flex items-center justify-center gap-1`}>
//                                     {btn.type === 'URL' && <Link size={compact ? 9 : 11} />}
//                                     {btn.type === 'PHONE_NUMBER' && <Phone size={compact ? 9 : 11} />}
//                                     {btn.type === 'COPY_CODE' && <Tag size={compact ? 9 : 11} />}
//                                     {btn.text || 'Button'}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

import { useState, useEffect, useMemo, useRef } from 'react';
import {
    X, Plus, Trash2, Lightbulb, Eye, CreditCard as Edit3, Smartphone,
    Image, FileText as FileDoc, Video, Type, Home, Users, Search,
    ChevronRight, Upload, MapPin, LayoutGrid, Tag, Phone, Link,
    Lock, AlertCircle, Save, Send, RotateCcw,
} from 'lucide-react';
import type { Template, TemplateCategory, TemplateHeaderType, TemplateType, TemplateButton, CarouselCard } from '../../types';
import { whatsappAPI } from '../../lib/whatsappApi';

interface Props {
    template: Template | null;
    onSubmit: (data: Partial<Template>) => Promise<void>;
    onClose: () => void;
}

const CATEGORIES: { value: TemplateCategory; label: string; desc: string; color: string }[] = [
    { value: 'MARKETING', label: 'Marketing', desc: 'Promotions & offers', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'UTILITY', label: 'Utility', desc: 'Updates & alerts', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'AUTHENTICATION', label: 'Auth', desc: 'OTPs & verification', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'te', label: 'Telugu' },
    { value: 'ta', label: 'Tamil' },
];

const TEMPLATE_TYPES_FOR: Record<TemplateCategory, { value: TemplateType; label: string; icon: React.ElementType; desc: string }[]> = {
    MARKETING: [
        { value: 'TEXT', label: 'Text', icon: Type, desc: 'Text only message' },
        { value: 'IMAGE', label: 'Image', icon: Image, desc: 'Message with image header' },
        { value: 'VIDEO', label: 'Video', icon: Video, desc: 'Message with video header' },
        { value: 'DOCUMENT', label: 'Document', icon: FileDoc, desc: 'Message with document header' },
        { value: 'LOCATION', label: 'Location', icon: MapPin, desc: 'Message with location' },
        { value: 'CAROUSEL', label: 'Carousel', icon: LayoutGrid, desc: 'Multiple cards (Marketing only)' },
        { value: 'LIMITED_TIME_OFFER', label: 'Limited Time Offer', icon: Tag, desc: 'LTO with expiry (Marketing only)' },
    ],
    UTILITY: [
        { value: 'TEXT', label: 'Text', icon: Type, desc: 'Text only message' },
        { value: 'IMAGE', label: 'Image', icon: Image, desc: 'Message with image header' },
        { value: 'VIDEO', label: 'Video', icon: Video, desc: 'Message with video header' },
        { value: 'DOCUMENT', label: 'Document', icon: FileDoc, desc: 'Message with document header' },
        { value: 'LOCATION', label: 'Location', icon: MapPin, desc: 'Message with location' },
    ],
    AUTHENTICATION: [
        { value: 'TEXT', label: 'Text', icon: Type, desc: 'OTP / code only' },
    ],
};

const HEADER_TYPES_FOR: Record<TemplateType, TemplateHeaderType | null> = {
    TEXT: null,
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    DOCUMENT: 'DOCUMENT',
    LOCATION: null,
    CAROUSEL: null,
    LIMITED_TIME_OFFER: null,
};

type ButtonMode = 'NONE' | 'QUICK_REPLY' | 'CTA' | 'ALL';

type SuggestionGroup = 'buyer' | 'seller' | 'general' | 'marketing';

const SUGGESTIONS: {
    label: string; group: SuggestionGroup; category: TemplateCategory;
    name: string; templateType: TemplateType; headerText: string; body: string; footer: string;
    buttons: Pick<TemplateButton, 'type' | 'text' | 'url'>[];
    sampleValues: string[];
}[] = [
        {
            label: 'Buyer Welcome', group: 'buyer', category: 'UTILITY', name: 'buyer_welcome',
        templateType: 'TEXT', headerText: 'Welcome, Property Seeker!',
            body: 'Hi {{1}},\n\nThank you for your interest in buying a property with us!\n\nWe have hundreds of verified properties across {{2}} matching your needs.\n\nOur expert team is ready to help you find your dream home.',
            footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'View Properties' }, { type: 'QUICK_REPLY', text: 'Talk to Agent' }],
        sampleValues: ['Rahul', 'Pune'],
        },
        {
            label: 'Buyer Budget Qualify', group: 'buyer', category: 'UTILITY', name: 'buyer_budget_qualify',
            templateType: 'TEXT', headerText: '',
            body: 'Hi {{1}},\n\nTo help you find the perfect property, we need a few details:\n\n📍 *Preferred Location:* {{2}}\n💰 *Budget Range:* {{3}}\n🏠 *Property Type:* {{4}}\n\nBased on this, we\'ll shortlist the best options for you!',
            footer: 'Our team will call you within 24 hrs', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, proceed' }, { type: 'QUICK_REPLY', text: 'Change details' }],
            sampleValues: ['Rahul', 'Wakad', '60L - 1.2Cr', 'Apartment'],
        },
        {
            label: 'Property Shortlist', group: 'buyer', category: 'MARKETING', name: 'property_shortlist',
            templateType: 'IMAGE', headerText: '',
            body: 'Hi {{1}},\n\nWe\'ve shortlisted *{{2}} properties* based on your requirements!\n\n🏠 *Area:* {{3}}\n💰 *Budget:* {{4}}\n\n*Top Pick:* {{5}}\n📍 {{6}}\n\nWould you like to schedule a site visit?',
            footer: 'T&C apply', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, Book Visit' }, { type: 'QUICK_REPLY', text: 'More Options' }, { type: 'URL', text: 'View All', url: 'https://example.com' }],
            sampleValues: ['Rahul', '5', 'Wakad', '₹80L', 'Tamara Uprise 3BHK', 'Rahatani, Pune'],
        },
        {
            label: 'Site Visit Confirmation', group: 'buyer', category: 'UTILITY', name: 'site_visit_confirmation',
            templateType: 'TEXT', headerText: 'Site Visit Confirmed!',
            body: 'Hi {{1}},\n\nYour site visit has been confirmed!\n\n🏠 *Property:* {{2}}\n📍 *Location:* {{3}}\n📅 *Date:* {{4}}\n⏰ *Time:* {{5}}\n\n👤 *Agent:* {{6}} — {{7}}\n\nPlease carry a valid ID proof.',
            footer: 'Reply CANCEL to cancel', buttons: [{ type: 'QUICK_REPLY', text: 'Confirm' }, { type: 'QUICK_REPLY', text: 'Reschedule' }],
            sampleValues: ['Rahul', 'Tamara Uprise', 'Rahatani, Pune', '25 Apr 2026', '11:00 AM', 'Priya Shah', '+91 98765 43210'],
        },
        {
            label: 'Seller Welcome', group: 'seller', category: 'UTILITY', name: 'seller_welcome',
            templateType: 'TEXT', headerText: 'Sell Your Property Fast!',
            body: 'Hi {{1}},\n\nThank you for choosing us to sell your property!\n\nWe have *10,000+ verified buyers* actively looking in {{2}}.\n\nOur team will help you:\n✅ Get the best price\n✅ Handle all documentation\n✅ Close deal in 30 days',
            footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'List My Property' }, { type: 'QUICK_REPLY', text: 'Know More' }],
            sampleValues: ['Suresh', 'Baner'],
        },
        {
            label: 'Seller Valuation Report', group: 'seller', category: 'UTILITY', name: 'seller_valuation',
            templateType: 'DOCUMENT', headerText: '',
            body: 'Hi {{1}},\n\nYour *Free Property Valuation Report* is ready!\n\n🏠 *Property:* {{2}}, {{3}}\n💰 *Estimated Market Value:* ₹{{4}} – ₹{{5}}\n📈 *Area Price Trend:* {{6}}\n\nOur expert can help you maximize your selling price.',
            footer: 'Valid for 30 days', buttons: [{ type: 'QUICK_REPLY', text: 'Talk to Expert' }, { type: 'QUICK_REPLY', text: 'List Now' }],
            sampleValues: ['Suresh', '3BHK Apartment', 'Baner', '92L', '1.05Cr', 'Rising +12% YoY'],
        },
        {
            label: 'New Property Launch', group: 'marketing', category: 'MARKETING', name: 'new_property_launch',
            templateType: 'IMAGE', headerText: '',
            body: '🎉 *Exclusive Launch Alert!*\n\nHi {{1}},\n\nWe\'re excited to announce the launch of *{{2}}* in {{3}}!\n\n🏗️ *{{4}} BHK* flats starting from *₹{{5}}*\n📅 *Pre-launch offer ends:* {{6}}\n\n💎 Early bird discount: {{7}}%',
            footer: 'Limited units available', buttons: [{ type: 'URL', text: 'Book Now', url: 'https://example.com' }, { type: 'QUICK_REPLY', text: 'Know More' }],
            sampleValues: ['Rahul', 'Tamara Uprise', 'Rahatani, Pune', '2,3,4', '87.96L', '30 Apr 2026', '5'],
        },
        {
            label: 'OTP Verification', group: 'general', category: 'AUTHENTICATION', name: 'otp_verification',
            templateType: 'TEXT', headerText: '',
            body: '{{1}} is your verification code for {{2}}.\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.',
            footer: "If you didn't request this, ignore.", buttons: [],
            sampleValues: ['123456', 'ResaleExpert CRM'],
        },
    ];

const GROUP_LABELS: Record<SuggestionGroup, string> = {
    buyer: 'Buyer', seller: 'Seller', general: 'General', marketing: 'Marketing',
};
const GROUP_COLORS: Record<SuggestionGroup, string> = {
    buyer: 'bg-blue-50 text-blue-700', seller: 'bg-emerald-50 text-emerald-700',
    general: 'bg-gray-100 text-gray-600', marketing: 'bg-orange-50 text-orange-700',
};
const GROUP_ICONS: Record<SuggestionGroup, React.ElementType> = {
    buyer: Home, seller: Users, general: FileDoc, marketing: Image,
};

const COUNTRY_CODES = [
    { code: '+91', label: 'IN +91' },
    { code: '+1', label: 'US +1' },
    { code: '+44', label: 'UK +44' },
    { code: '+971', label: 'UAE +971' },
    { code: '+61', label: 'AU +61' },
    { code: '+65', label: 'SG +65' },
];

function extractVariables(body: string): number[] {
    const matches = body.match(/\{\{(\d+)\}\}/g) || [];
    const nums = [...new Set(matches.map((m) => parseInt(m.replace(/[^0-9]/g, ''))))].sort((a, b) => a - b);
    return nums;
}

type FormState = {
    name: string;
    category: TemplateCategory;
    language: string;
    template_type: TemplateType;
    header_text: string;
    header_media_url: string;
    body: string;
    footer: string;
    buttons: TemplateButton[];
    sample_values: Record<number, string>;
    button_mode: ButtonMode;
    location_name: string;
    location_address: string;
    location_lat: string;
    location_lng: string;
    carousel_cards: CarouselCard[];
    lto_has_expiry: boolean;
    lto_expiration_date: string;
    lto_coupon_code: string;
};

const emptyForm: FormState = {
    name: '', category: 'MARKETING', language: 'en',
    template_type: 'TEXT', header_text: '', header_media_url: '',
    body: '', footer: '', buttons: [], sample_values: {},
    button_mode: 'NONE',
    location_name: '', location_address: '', location_lat: '', location_lng: '',
    carousel_cards: [],
    lto_has_expiry: false, lto_expiration_date: '', lto_coupon_code: '',
};

function templateToForm(t: any): FormState {
    const vars = extractVariables(t.body);
    const sv: Record<number, string> = {};
    if (t.variables) t.variables.forEach((v, i) => { sv[i + 1] = v; });

    let buttonMode: ButtonMode = 'NONE';
    const buttons: TemplateButton[] = t.buttons || [];
    const hasQR = buttons.some((b) => b.type === 'QUICK_REPLY');
    const hasCTA = buttons.some((b) => b.type !== 'QUICK_REPLY');
    if (hasQR && hasCTA) buttonMode = 'ALL';
    else if (hasQR) buttonMode = 'QUICK_REPLY';
    else if (hasCTA) buttonMode = 'CTA';

    return {
        name: t.label || t.name,
        category: t.category,
        language: t.language,
        template_type: t.template_type || 'TEXT',
        header_text: t.header_text || '',
        header_media_url: t.header_media_url || '',
        body: t.body,
        footer: t.footer || '',
        buttons,
        sample_values: vars.reduce((acc, n) => ({ ...acc, [n]: sv[n] || '' }), {} as Record<number, string>),
        button_mode: buttonMode,
        location_name: t.location_name || '',
        location_address: t.location_address || '',
        location_lat: t.location_lat ? String(t.location_lat) : '',
        location_lng: t.location_lng ? String(t.location_lng) : '',
        carousel_cards: t.carousel_cards || [],
        lto_has_expiry: t.lto_has_expiry || false,
        lto_expiration_date: t.lto_expiration_time_ms
            ? new Date(t.lto_expiration_time_ms).toISOString().slice(0, 16)
            : '',
        lto_coupon_code: t.lto_coupon_code || '',
    };
}

// Body editor with formatting toolbar + auto-increment variable insertion
function BodyEditor({
    value, onChange, sampleValues, onSampleChange, variables, isApproved,
}: {
    value: string;
    onChange: (v: string) => void;
    sampleValues: Record<number, string>;
    onSampleChange: (n: number, v: string) => void;
    variables: number[];
    isApproved: boolean;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const wrap = (open: string, close: string) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = value.slice(start, end);
        const newVal = value.slice(0, start) + open + selected + close + value.slice(end);
        onChange(newVal);
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + open.length, end + open.length);
        }, 0);
    };

    const insertVar = () => {
        const el = textareaRef.current;
        if (!el) return;
        const nextNum = variables.length > 0 ? Math.max(...variables) + 1 : 1;
        const tag = `{{${nextNum}}}`;
        const pos = el.selectionStart;
        const newVal = value.slice(0, pos) + tag + value.slice(pos);
        onChange(newVal);
        setTimeout(() => { el.focus(); el.setSelectionRange(pos + tag.length, pos + tag.length); }, 0);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">Message Body <span className="text-rose-500">*</span></label>
                <span className="text-[10px] text-gray-400">{value.length}/1024</span>
            </div>

            <div className="flex items-center gap-1 mb-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
                <button type="button" onClick={() => wrap('*', '*')} title="Bold (*text*)"
                    className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">B</button>
                <button type="button" onClick={() => wrap('_', '_')} title="Italic (_text_)"
                    className="px-2 py-1 text-xs italic text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">I</button>
                <button type="button" onClick={() => wrap('~', '~')} title="Strikethrough (~text~)"
                    className="px-2 py-1 text-xs line-through text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">S</button>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <button type="button" onClick={insertVar}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                    <span>+</span>
                    <span className="font-mono">{`{{${variables.length > 0 ? Math.max(...variables) + 1 : 1}}}`}</span>
                </button>
                <span className="text-[9px] text-gray-400 ml-1">auto-inserts next variable</span>
            </div>

            <textarea
                ref={textareaRef}
                rows={6}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-gray-200 rounded-b-xl rounded-t-none px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                placeholder={`Hello {{1}}, we have a great property for you in {{2}}.`}
                maxLength={1024}
            />

            {variables.length > 0 && (
                <div className="mt-2 border border-amber-200 rounded-xl overflow-hidden">
                    <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-amber-800">Sample Values <span className="font-normal text-amber-600">(required for Meta review)</span></p>
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                        {variables.map((n) => (
                            <div key={n} className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded w-10 text-center shrink-0">{`{{${n}}}`}</span>
                                <input
                                    value={sampleValues[n] || ''}
                                    onChange={(e) => onSampleChange(n, e.target.value)}
                                    placeholder={`Sample for {{${n}}}`}
                                    disabled={isApproved}
                                    className="flex-1 border border-amber-100 bg-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Explore Library panel
function ExploreLibrary({
    filteredSuggestions, suggestionFilter, setSuggestionFilter,
    suggestionSearch, setSuggestionSearch, onUse, isApproved,
}: {
    filteredSuggestions: typeof SUGGESTIONS;
    suggestionFilter: SuggestionGroup | 'all';
    setSuggestionFilter: (v: SuggestionGroup | 'all') => void;
    suggestionSearch: string;
    setSuggestionSearch: (v: string) => void;
    onUse: (s: typeof SUGGESTIONS[0]) => void;
    isApproved: boolean;
}) {
    const [previewSuggestion, setPreviewSuggestion] = useState<typeof SUGGESTIONS[0] | null>(null);

    const SIDEBAR_ITEMS: { id: SuggestionGroup | 'all'; label: string; icon: React.ElementType }[] = [
        { id: 'all', label: 'All Templates', icon: FileDoc },
        { id: 'buyer', label: 'Buyer', icon: Home },
        { id: 'seller', label: 'Seller', icon: Users },
        { id: 'general', label: 'General', icon: FileDoc },
        { id: 'marketing', label: 'Marketing', icon: Image },
    ];

    return (
        <div className="flex flex-1 min-h-0 overflow-hidden">
            <div className="w-44 border-r border-gray-100 shrink-0 bg-gray-50/50 overflow-y-auto py-2">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">Categories</p>
                {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = suggestionFilter === item.id;
                    return (
                        <button key={item.id} onClick={() => setSuggestionFilter(item.id)}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left transition-colors relative ${isActive ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 hover:bg-gray-100'
                                }`}>
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-r" />}
                            <Icon size={14} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                            {item.label}
                            <span className={`ml-auto text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'text-gray-300'}`}>
                                {SUGGESTIONS.filter((s) => item.id === 'all' || s.group === item.id).length}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 shrink-0">
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={suggestionSearch} onChange={(e) => setSuggestionSearch(e.target.value)}
                            placeholder="Search templates…"
                            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {filteredSuggestions.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Lightbulb size={24} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No templates found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredSuggestions.map((s) => (
                                <div key={s.name} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all bg-white flex flex-col">
                                    <div className="p-4 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${GROUP_COLORS[s.group]}`}>
                                                {GROUP_LABELS[s.group]}
                                            </span>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{s.templateType}</span>
                                            <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-semibold ${s.category === 'MARKETING' ? 'bg-orange-50 text-orange-600' :
                                                s.category === 'UTILITY' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>{s.category}</span>
                                        </div>

                                        <p className="font-bold text-gray-900 text-sm mb-1">{s.label}</p>
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 whitespace-pre-line">
                                            {s.body.replace(/\{\{(\d+)\}\}/g, (_, n) => s.sampleValues[Number(n) - 1] ? `[${s.sampleValues[Number(n) - 1]}]` : `[var${n}]`)}
                                        </p>

                                        {s.sampleValues.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {s.sampleValues.slice(0, 3).map((v, i) => (
                                                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-mono border border-amber-100">
                                                        {`{{${i + 1}}}`}={v}
                                                    </span>
                                                ))}
                                                {s.sampleValues.length > 3 && <span className="text-[9px] text-gray-400">+{s.sampleValues.length - 3}</span>}
                                            </div>
                                        )}

                                        {s.buttons.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {s.buttons.map((b, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 border border-blue-100 text-blue-600 bg-blue-50 rounded-full">{b.text}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 px-3 py-2.5 bg-gray-50/50 flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 font-mono flex-1 truncate">{s.name}</span>
                                        <button
                                            onClick={() => setPreviewSuggestion(s)}
                                            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
                                        >
                                            <Eye size={11} /> View
                                        </button>
                                        <button
                                            onClick={() => { onUse(s); }}
                                            disabled={isApproved}
                                            className="flex items-center gap-1 text-[11px] font-semibold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 shrink-0"
                                        >
                                            Use Template <ChevronRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {previewSuggestion && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl"
                    onClick={() => setPreviewSuggestion(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-6 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-sm text-gray-900">{previewSuggestion.label}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{previewSuggestion.name}</p>
                            </div>
                            <button onClick={() => setPreviewSuggestion(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="rounded-xl p-3" style={{ background: '#e5ddd5' }}>
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-xs ml-auto">
                                    <div className="px-3 pt-3 pb-2">
                                        <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                                            {previewSuggestion.body.replace(/\{\{(\d+)\}\}/g, (_, n) =>
                                                previewSuggestion.sampleValues[Number(n) - 1] ? `[${previewSuggestion.sampleValues[Number(n) - 1]}]` : `[var${n}]`
                                            )}
                                        </p>
                                        <p className="text-[9px] text-gray-300 text-right mt-1">10:30 AM</p>
                                    </div>
                                    {previewSuggestion.buttons.length > 0 && (
                                        <div className="border-t border-gray-100">
                                            {previewSuggestion.buttons.map((btn, i) => (
                                                <div key={i} className={`text-center text-xs font-semibold text-blue-500 py-2 ${i > 0 ? 'border-t border-gray-100' : ''}`}>{btn.text}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => { onUse(previewSuggestion); setPreviewSuggestion(null); }}
                                disabled={isApproved}
                                className="w-full mt-3 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                            >
                                Use This Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TemplateForm({ template, onSubmit, onClose }: Props) {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'explore'>(template ? 'edit' : 'explore');
    const [suggestionFilter, setSuggestionFilter] = useState<SuggestionGroup | 'all'>('all');
    const [suggestionSearch, setSuggestionSearch] = useState('');
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isApproved = template?.status === 'APPROVED';

    useEffect(() => {
        if (template) {
            setForm(templateToForm(template));
            setActiveTab('edit');
        }
    }, [template]);

    const handleCategoryChange = (cat: TemplateCategory) => {
        const validTypes = TEMPLATE_TYPES_FOR[cat].map((t) => t.value);
        setForm((p) => ({
            ...p,
            category: cat,
            template_type: validTypes.includes(p.template_type) ? p.template_type : 'TEXT',
        }));
    };

    const handleTemplateTypeChange = (tt: TemplateType) => {
        setForm((p) => ({
            ...p,
            template_type: tt,
            header_media_url: '',
            header_text: '',
        }));
    };

    const applySuggestion = (s: typeof SUGGESTIONS[0]) => {
        const vars = extractVariables(s.body);
        const sv = vars.reduce((acc, n, i) => ({ ...acc, [n]: s.sampleValues[i] || '' }), {} as Record<number, string>);
        const hasQR = s.buttons.some((b) => b.type === 'QUICK_REPLY');
        const hasCTA = s.buttons.some((b) => b.type !== 'QUICK_REPLY');
        let buttonMode: ButtonMode = 'NONE';
        if (hasQR && hasCTA) buttonMode = 'ALL';
        else if (hasQR) buttonMode = 'QUICK_REPLY';
        else if (hasCTA) buttonMode = 'CTA';
        setForm((p) => ({
            ...p,
            name: s.name,
            category: s.category,
            template_type: s.templateType,
            header_text: s.headerText,
            header_media_url: '',
            body: s.body,
            footer: s.footer,
            buttons: s.buttons as TemplateButton[],
            sample_values: sv,
            button_mode: buttonMode,
        }));
        setActiveTab('edit');
    };

    const handleBodyChange = (newBody: string) => {
        const vars = extractVariables(newBody);
        setForm((p) => {
            const sv = { ...p.sample_values };
            Object.keys(sv).forEach((k) => {
                if (!vars.includes(Number(k))) delete sv[Number(k)];
            });
            vars.forEach((n) => { if (!(n in sv)) sv[n] = ''; });
            return { ...p, body: newBody, sample_values: sv };
        });
    };

    const handleMediaUpload = async (file: File) => {
        if (!file) return;
        setUploadingMedia(true);
        setUploadProgress(10);
        try {
            setUploadProgress(40);
            const url = await whatsappAPI.uploadMedia(file);
            setUploadProgress(80);
            setForm((p) => ({ ...p, header_media_url: url }));
            setUploadProgress(100);
        } catch (err) {
            console.error('Failed to upload media:', err);
        } finally {
            setUploadingMedia(false);
            setTimeout(() => setUploadProgress(0), 800);
        }
    };

    const quickReplies = form.buttons.filter((b) => b.type === 'QUICK_REPLY');
    const ctaButtons = form.buttons.filter((b) => b.type !== 'QUICK_REPLY');
    const urlCtaCount = ctaButtons.filter((b) => b.type === 'URL').length;
    const phoneCtaCount = ctaButtons.filter((b) => b.type === 'PHONE_NUMBER').length;
    const copyCodeCount = ctaButtons.filter((b) => b.type === 'COPY_CODE').length;

    const canAddQuickReply = quickReplies.length < 10;
    const canAddUrlCta = urlCtaCount < 2;
    const canAddPhoneCta = phoneCtaCount < 1;
    const canAddCopyCode = copyCodeCount < 1;

    const addQuickReply = () => {
        if (!canAddQuickReply) return;
        setForm((p) => ({ ...p, buttons: [...p.buttons, { type: 'QUICK_REPLY', text: '' }] }));
    };

    const addCta = (type: 'URL' | 'PHONE_NUMBER' | 'COPY_CODE') => {
        setForm((p) => {
            let newBtn: TemplateButton;
            if (type === 'URL') newBtn = { type: 'URL', text: '', url: '' };
            else if (type === 'PHONE_NUMBER') newBtn = { type: 'PHONE_NUMBER', text: '', country_code: '+91', phone_number: '' };
            else newBtn = { type: 'COPY_CODE', text: 'Copy Code', coupon_code: '' };
            return { ...p, buttons: [...p.buttons, newBtn] };
        });
    };

    const removeButton = (i: number) => setForm((p) => ({ ...p, buttons: p.buttons.filter((_, idx) => idx !== i) }));

    const updateButton = (i: number, patch: Partial<TemplateButton>) => {
        setForm((p) => ({
            ...p,
            buttons: p.buttons.map((b, idx) => idx === i ? { ...b, ...patch } : b),
        }));
    };

    const addCarouselCard = () => {
        if (form.carousel_cards.length >= 10) return;
        setForm((p) => ({
            ...p,
            carousel_cards: [
                ...p.carousel_cards,
                { header_type: 'IMAGE', header_url: '', body: '', buttons: [] },
            ],
        }));
    };

    const updateCarouselCard = (i: number, patch: Partial<CarouselCard>) => {
        setForm((p) => ({
            ...p,
            carousel_cards: p.carousel_cards.map((c, idx) => idx === i ? { ...c, ...patch } : c),
        }));
    };

    const removeCarouselCard = (i: number) => {
        setForm((p) => ({ ...p, carousel_cards: p.carousel_cards.filter((_, idx) => idx !== i) }));
    };

    const buildPayload = (status: 'DRAFT' | 'PENDING'): any => {
        const vars = extractVariables(form.body);
        const ht = HEADER_TYPES_FOR[form.template_type];
        return {
            name: form.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            label: form.name,
            category: form.category,
            language: form.language,
            template_type: form.template_type,
            header_type: ht,
            header_text: ht === 'TEXT' ? (form.header_text || null) : null,
            header_media_url: ht && ht !== 'TEXT' ? (form.header_media_url || null) : null,
            body: form.body,
            footer: form.footer || null,
            buttons: form.buttons.length > 0 ? form.buttons : null,
            variables: vars.length > 0 ? vars.map((n) => form.sample_values[n] || '') : null,
            carousel_cards: form.template_type === 'CAROUSEL' ? (form.carousel_cards.length > 0 ? form.carousel_cards : null) : null,
            lto_has_expiry: form.template_type === 'LIMITED_TIME_OFFER' ? form.lto_has_expiry : false,
            lto_expiration_time_ms: form.template_type === 'LIMITED_TIME_OFFER' && form.lto_has_expiry && form.lto_expiration_date
                ? new Date(form.lto_expiration_date).getTime()
                : null,
            lto_coupon_code: form.template_type === 'LIMITED_TIME_OFFER' ? (form.lto_coupon_code || null) : null,
            status,
        };
    };

    const handleSaveDraft = async () => {
        if (!form.name.trim() || !form.body.trim()) {
            alert('Template name and message body are required');
            return;
        }
        const nameRegex = /^[a-z0-9_]+$/;
        if (!nameRegex.test(form.name)) {
            alert('Template name can only contain lowercase letters, numbers, and underscores');
            return;
        }
        setSaving(true);
        await onSubmit(buildPayload('DRAFT'));
        setSaving(false);
    };

    const handleSubmitToMeta = async () => {
        if (!form.name.trim() || !form.body.trim()) {
            alert('Template name and message body are required');
            return;
        }
        const nameRegex = /^[a-z0-9_]+$/;
        if (!nameRegex.test(form.name)) {
            alert('Template name can only contain lowercase letters, numbers, and underscores');
            return;
        }
        setSaving(true);
        await onSubmit(buildPayload('PENDING'));
        setSaving(false);
    };

    const variables = useMemo(() => extractVariables(form.body), [form.body]);
    const cat = CATEGORIES.find((c) => c.value === form.category);
    const templateTypes = TEMPLATE_TYPES_FOR[form.category];

    const filteredSuggestions = SUGGESTIONS.filter((s) => {
        const matchesGroup = suggestionFilter === 'all' || s.group === suggestionFilter;
        const matchesSearch = !suggestionSearch || s.label.toLowerCase().includes(suggestionSearch.toLowerCase()) || s.body.toLowerCase().includes(suggestionSearch.toLowerCase());
        return matchesGroup && matchesSearch;
    });

    const renderBodyPreview = () => {
        if (!form.body) return <span className="text-gray-400 italic">Message body...</span>;
        return form.body.replace(/\{\{(\d+)\}\}/g, (_, n) => {
            const val = form.sample_values[Number(n)];
            return val ? val : `[${n}]`;
        });
    };

    const headerType = HEADER_TYPES_FOR[form.template_type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                {template ? 'Edit Template' : 'New Template Message'}
                                {isApproved && (
                                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                        <Lock size={10} /> Approved — Read Only
                                    </span>
                                )}
                                {template?.status === 'DRAFT' && (
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-full">
                                        Draft
                                    </span>
                                )}
                                {template?.status === 'REJECTED' && (
                                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full">
                                        <AlertCircle size={10} /> Rejected
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">WhatsApp Business Message Template</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {template?.rejection_reason && (
                    <div className="flex items-start gap-3 px-6 py-3 bg-red-50 border-b border-red-100">
                        <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-red-700">Rejection Reason:</p>
                            <p className="text-xs text-red-600 mt-0.5">{template.rejection_reason}</p>
                        </div>
                    </div>
                )}

                <div className="flex border-b border-gray-100 px-6 shrink-0 bg-gray-50/50">
                    {(['explore', 'edit', 'preview'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab === 'explore' && <Lightbulb size={13} />}
                            {tab === 'edit' && <Edit3 size={13} />}
                            {tab === 'preview' && <Smartphone size={13} />}
                            {tab === 'explore' ? 'Explore Library' : tab === 'edit' ? 'Edit' : 'Preview'}
                        </button>
                    ))}
                </div>

                <div className="flex flex-1 min-h-0 relative">
                    {activeTab === 'explore' && (
                        <ExploreLibrary
                            filteredSuggestions={filteredSuggestions}
                            suggestionFilter={suggestionFilter}
                            setSuggestionFilter={setSuggestionFilter}
                            suggestionSearch={suggestionSearch}
                            setSuggestionSearch={setSuggestionSearch}
                            onUse={applySuggestion}
                            isApproved={isApproved}
                        />
                    )}

                    {activeTab === 'edit' && (
                        <div className="flex flex-1 min-h-0">
                            <div className={`flex-1 overflow-y-auto p-6 space-y-5 ${isApproved ? 'opacity-80 pointer-events-none select-none' : ''}`}>

                                {isApproved && (
                                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
                                        <Lock size={13} />
                                        This template is approved by Meta and cannot be edited.
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Template Category *</label>
                                    <p className="text-[10px] text-gray-400 mb-2">Your template should fall under one of these categories.</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {CATEGORIES.map((c) => (
                                            <button key={c.value} onClick={() => handleCategoryChange(c.value)}
                                                className={`p-3 rounded-xl border-2 text-left transition-all ${form.category === c.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <p className="text-xs font-semibold text-gray-800">{c.label}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{c.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Template Language *</label>
                                    <select value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                                        {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Template Name *</label>
                                    <p className="text-[10px] text-gray-400 mb-1.5">Lowercase alphanumeric and underscores only. e.g. buyer_welcome</p>
                                    <input
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        value={form.name}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                                        placeholder="e.g. buyer_welcome"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Template Type *</label>
                                    <p className="text-[10px] text-gray-400 mb-2">Select the format of your template message.</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {templateTypes.map((tt) => {
                                            const Icon = tt.icon;
                                            return (
                                                <button
                                                    key={tt.value}
                                                    onClick={() => handleTemplateTypeChange(tt.value)}
                                                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${form.template_type === tt.value
                                                        ? 'border-emerald-500 bg-emerald-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <Icon size={14} className={form.template_type === tt.value ? 'text-emerald-600' : 'text-gray-400'} />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800 leading-tight">{tt.label}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {form.template_type === 'TEXT' && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                                            Header Text <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={form.header_text}
                                            onChange={(e) => setForm((p) => ({ ...p, header_text: e.target.value }))}
                                            placeholder="e.g. Site Visit Confirmed!"
                                            maxLength={60}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 text-right">{form.header_text.length}/60</p>
                                    </div>
                                )}

                                {(form.template_type === 'IMAGE' || form.template_type === 'VIDEO' || form.template_type === 'DOCUMENT') && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                                            {form.template_type === 'IMAGE' ? 'Header Image' : form.template_type === 'VIDEO' ? 'Header Video' : 'Header Document'}
                                        </label>
                                        <p className="text-[10px] text-gray-400 mb-2">
                                            Upload a file or paste a URL. This is used as the header media sample for Meta review.
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={form.header_media_url}
                                                onChange={(e) => setForm((p) => ({ ...p, header_media_url: e.target.value }))}
                                                placeholder={
                                                    form.template_type === 'IMAGE' ? 'https://example.com/image.jpg' :
                                                        form.template_type === 'VIDEO' ? 'https://example.com/video.mp4' :
                                                            'https://example.com/document.pdf'
                                                }
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingMedia}
                                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shrink-0"
                                            >
                                                <Upload size={14} />
                                                {uploadingMedia ? `${uploadProgress}%` : 'Upload'}
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept={
                                                    form.template_type === 'IMAGE' ? 'image/*' :
                                                        form.template_type === 'VIDEO' ? 'video/*' :
                                                            '.pdf,.doc,.docx'
                                                }
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleMediaUpload(file);
                                                }}
                                            />
                                        </div>
                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        )}
                                        {form.template_type === 'IMAGE' && form.header_media_url && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-28">
                                                <img src={form.header_media_url} alt="preview" className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            </div>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {form.template_type === 'IMAGE' && 'JPG, PNG or WEBP (max 5MB)'}
                                            {form.template_type === 'VIDEO' && 'MP4 format (max 16MB)'}
                                            {form.template_type === 'DOCUMENT' && 'PDF format (max 100MB)'}
                                        </p>
                                    </div>
                                )}

                                {form.template_type === 'LOCATION' && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                                        <p className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                                            <MapPin size={13} /> Location Header
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-600 block mb-1">Place Name</label>
                                                <input value={form.location_name} onChange={(e) => setForm((p) => ({ ...p, location_name: e.target.value }))}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                    placeholder="e.g. Tamara Uprise" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-600 block mb-1">Address</label>
                                                <input value={form.location_address} onChange={(e) => setForm((p) => ({ ...p, location_address: e.target.value }))}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                    placeholder="e.g. Rahatani, Pune" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-600 block mb-1">Latitude</label>
                                                <input value={form.location_lat} onChange={(e) => setForm((p) => ({ ...p, location_lat: e.target.value }))}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                    placeholder="18.5861" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-600 block mb-1">Longitude</label>
                                                <input value={form.location_lng} onChange={(e) => setForm((p) => ({ ...p, location_lng: e.target.value }))}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                    placeholder="73.7785" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {form.template_type === 'LIMITED_TIME_OFFER' && (
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                                        <p className="text-xs font-semibold text-orange-800 flex items-center gap-1.5">
                                            <Tag size={13} /> Limited Time Offer Settings
                                        </p>
                                        <div>
                                            <label className="text-[10px] font-medium text-gray-600 block mb-1">Coupon Code <span className="text-gray-400">(max 15 chars)</span></label>
                                            <input
                                                value={form.lto_coupon_code}
                                                onChange={(e) => setForm((p) => ({ ...p, lto_coupon_code: e.target.value.slice(0, 15) }))}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white font-mono"
                                                placeholder="SALE20"
                                                maxLength={15}
                                            />
                                            <p className="text-right text-[10px] text-gray-400 mt-0.5">{form.lto_coupon_code.length}/15</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <div
                                                    onClick={() => setForm((p) => ({ ...p, lto_has_expiry: !p.lto_has_expiry }))}
                                                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.lto_has_expiry ? 'bg-orange-500' : 'bg-gray-200'}`}
                                                >
                                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.lto_has_expiry ? 'translate-x-4' : ''}`} />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700">Offer has expiry date</span>
                                            </label>
                                        </div>
                                        {form.lto_has_expiry && (
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-600 block mb-1">Expiry Date & Time</label>
                                                <input
                                                    type="datetime-local"
                                                    value={form.lto_expiration_date}
                                                    onChange={(e) => setForm((p) => ({ ...p, lto_expiration_date: e.target.value }))}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {form.template_type === 'CAROUSEL' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600">Carousel Cards</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Add up to 10 cards. Each card can have an image/video header, body text, and buttons.</p>
                                            </div>
                                            <button
                                                onClick={addCarouselCard}
                                                disabled={form.carousel_cards.length >= 10}
                                                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                                            >
                                                <Plus size={11} /> Add Card
                                            </button>
                                        </div>
                                        {form.carousel_cards.length === 0 && (
                                            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                                                <LayoutGrid size={24} className="mx-auto text-gray-300 mb-2" />
                                                <p className="text-xs text-gray-400">No cards yet. Add at least 2 cards.</p>
                                            </div>
                                        )}
                                        {form.carousel_cards.map((card, ci) => (
                                            <div key={ci} className="border border-gray-200 rounded-xl overflow-hidden">
                                                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-700">Card {ci + 1}</p>
                                                    <button onClick={() => removeCarouselCard(ci)} className="p-1 text-red-400 hover:text-red-600">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-medium text-gray-500 block mb-1">Header Type</label>
                                                            <select
                                                                value={card.header_type}
                                                                onChange={(e) => updateCarouselCard(ci, { header_type: e.target.value as 'IMAGE' | 'VIDEO' })}
                                                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                                            >
                                                                <option value="IMAGE">Image</option>
                                                                <option value="VIDEO">Video</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-medium text-gray-500 block mb-1">Media URL</label>
                                                            <input
                                                                value={card.header_url}
                                                                onChange={(e) => updateCarouselCard(ci, { header_url: e.target.value })}
                                                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-medium text-gray-500 block mb-1">Card Body</label>
                                                        <textarea
                                                            rows={2}
                                                            value={card.body}
                                                            onChange={(e) => updateCarouselCard(ci, { body: e.target.value })}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                                            placeholder="Card message body..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {form.template_type !== 'CAROUSEL' && (
                                    <BodyEditor
                                        value={form.body}
                                        onChange={handleBodyChange}
                                        sampleValues={form.sample_values}
                                        onSampleChange={(n, v) => setForm((p) => ({ ...p, sample_values: { ...p.sample_values, [n]: v } }))}
                                        variables={variables}
                                        isApproved={isApproved}
                                    />
                                )}

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                                        Footer <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={form.footer}
                                        onChange={(e) => setForm((p) => ({ ...p, footer: e.target.value }))}
                                        placeholder="Enter footer text"
                                        maxLength={60}
                                    />
                                    <p className="text-right text-[10px] text-gray-400 mt-0.5">{form.footer.length}/60</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1">Interactive Actions</label>
                                    <p className="text-[10px] text-gray-400 mb-3">
                                        Add buttons to your message. Max 25 chars for button titles.
                                        Quick Replies: up to 10 | CTA URL: up to 2 | Phone: up to 1 | Copy Code: up to 1
                                    </p>

                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {(['NONE', 'QUICK_REPLY', 'CTA', 'ALL'] as ButtonMode[]).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => {
                                                    setForm((p) => ({ ...p, button_mode: mode, buttons: mode === 'NONE' ? [] : p.buttons }));
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.button_mode === mode
                                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {mode === 'NONE' ? 'None' : mode === 'QUICK_REPLY' ? 'Quick Replies' : mode === 'CTA' ? 'Call to Actions' : 'All (QR + CTA)'}
                                            </button>
                                        ))}
                                    </div>

                                    {form.button_mode !== 'NONE' && (
                                        <div className="space-y-3">
                                            {(form.button_mode === 'QUICK_REPLY' || form.button_mode === 'ALL') && (
                                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                                                            Quick Replies
                                                            <span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{quickReplies.length}/10</span>
                                                        </p>
                                                        <button
                                                            onClick={addQuickReply}
                                                            disabled={!canAddQuickReply}
                                                            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                                                        >
                                                            <Plus size={10} /> Add
                                                        </button>
                                                    </div>
                                                    {form.buttons.map((btn, i) => btn.type !== 'QUICK_REPLY' ? null : (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <input
                                                                placeholder="Button label (max 25)"
                                                                value={btn.text}
                                                                maxLength={25}
                                                                onChange={(e) => updateButton(i, { text: e.target.value })}
                                                                className="flex-1 border border-emerald-200 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                                            />
                                                            <span className="text-[10px] text-gray-400 shrink-0 w-7 text-right">{btn.text.length}/25</span>
                                                            <button onClick={() => removeButton(i)} className="p-1 text-red-400 hover:text-red-600 shrink-0">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {quickReplies.length === 0 && (
                                                        <p className="text-[11px] text-emerald-600 opacity-60 text-center py-1">No quick replies added</p>
                                                    )}
                                                </div>
                                            )}

                                            {(form.button_mode === 'CTA' || form.button_mode === 'ALL') && (
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <p className="text-xs font-semibold text-blue-800">Call to Actions</p>
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            <button
                                                                onClick={() => addCta('URL')}
                                                                disabled={!canAddUrlCta}
                                                                className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors"
                                                            >
                                                                <Link size={9} /> URL
                                                                <span className="bg-blue-100 text-blue-700 px-1 rounded">{urlCtaCount}/2</span>
                                                            </button>
                                                            <button
                                                                onClick={() => addCta('PHONE_NUMBER')}
                                                                disabled={!canAddPhoneCta}
                                                                className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors"
                                                            >
                                                                <Phone size={9} /> Phone
                                                                <span className="bg-blue-100 text-blue-700 px-1 rounded">{phoneCtaCount}/1</span>
                                                            </button>
                                                            <button
                                                                onClick={() => addCta('COPY_CODE')}
                                                                disabled={!canAddCopyCode}
                                                                className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors"
                                                            >
                                                                <Tag size={9} /> Copy Code
                                                                <span className="bg-blue-100 text-blue-700 px-1 rounded">{copyCodeCount}/1</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {form.buttons.map((btn, i) => {
                                                        if (btn.type === 'QUICK_REPLY') return null;
                                                        return (
                                                            <div key={i} className="bg-white border border-blue-200 rounded-lg p-3 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${btn.type === 'URL' ? 'bg-blue-100 text-blue-700' :
                                                                        btn.type === 'PHONE_NUMBER' ? 'bg-green-100 text-green-700' :
                                                                            'bg-orange-100 text-orange-700'
                                                                        }`}>
                                                                        {btn.type === 'URL' ? 'URL' : btn.type === 'PHONE_NUMBER' ? 'Phone Number' : 'Copy Code'}
                                                                    </span>
                                                                    <button onClick={() => removeButton(i)} className="p-1 text-red-400 hover:text-red-600">
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        placeholder="Button title (max 25)"
                                                                        value={btn.text}
                                                                        maxLength={25}
                                                                        onChange={(e) => updateButton(i, { text: e.target.value })}
                                                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                    />
                                                                    <span className="text-[10px] text-gray-400 shrink-0">{btn.text.length}/25</span>
                                                                </div>
                                                                {btn.type === 'URL' && (
                                                                    <input
                                                                        placeholder="https://example.com"
                                                                        value={btn.url || ''}
                                                                        onChange={(e) => updateButton(i, { url: e.target.value })}
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                    />
                                                                )}
                                                                {btn.type === 'PHONE_NUMBER' && (
                                                                    <div className="flex gap-2">
                                                                        <select
                                                                            value={btn.country_code || '+91'}
                                                                            onChange={(e) => updateButton(i, { country_code: e.target.value })}
                                                                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                                                        >
                                                                            {COUNTRY_CODES.map((cc) => (
                                                                                <option key={cc.code} value={cc.code}>{cc.label}</option>
                                                                            ))}
                                                                        </select>
                                                                        <input
                                                                            placeholder="Phone number"
                                                                            value={btn.phone_number || ''}
                                                                            onChange={(e) => updateButton(i, { phone_number: e.target.value })}
                                                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {btn.type === 'COPY_CODE' && (
                                                                    <input
                                                                        placeholder="Coupon code (max 15 chars)"
                                                                        value={btn.coupon_code || ''}
                                                                        maxLength={15}
                                                                        onChange={(e) => updateButton(i, { coupon_code: e.target.value })}
                                                                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {ctaButtons.length === 0 && (
                                                        <p className="text-[11px] text-blue-600 opacity-60 text-center py-1">No CTA buttons added</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-64 border-l border-gray-100 p-4 shrink-0 bg-gray-50/30 overflow-y-auto hidden xl:flex xl:flex-col">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                    <Smartphone size={10} /> Live Preview
                                </p>
                                <PhonePreview form={form} headerType={headerType} renderBodyPreview={renderBodyPreview} compact />
                            </div>
                        </div>
                    )}

                    {activeTab === 'preview' && (
                        <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center bg-gray-50/30">
                            <div className="w-full max-w-xs">
                                <PhonePreview form={form} headerType={headerType} renderBodyPreview={renderBodyPreview} />
                                {variables.length > 0 && (
                                    <div className="mt-4 bg-white border border-gray-200 rounded-xl p-3">
                                        <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Sample Values</p>
                                        <div className="space-y-1">
                                            {variables.map((n) => (
                                                <div key={n} className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-gray-400 w-7">{`{{${n}}}`}</span>
                                                    <span className="text-xs text-gray-700 truncate">{form.sample_values[n] || <span className="text-gray-300 italic">empty</span>}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        {cat && <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cat.color}`}>{cat.label}</span>}
                        <span className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 font-medium">
                            {form.template_type}
                        </span>
                        {variables.length > 0 && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {variables.length} var{variables.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {form.buttons.length > 0 && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                {form.buttons.length} btn{form.buttons.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        {isApproved ? (
                            <button disabled className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl opacity-60 cursor-not-allowed">
                                <Lock size={14} /> Approved
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={saving || !form.name.trim() || !form.body.trim()}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <Save size={14} />
                                    {saving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <button
                                    onClick={handleSubmitToMeta}
                                    disabled={saving || !form.name.trim() || !form.body.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    <Send size={14} />
                                    {saving ? 'Submitting...' : 'Submit to Meta'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PhonePreview({ form, headerType, renderBodyPreview, compact = false }: {
    form: FormState;
    headerType: TemplateHeaderType | null;
    renderBodyPreview: () => React.ReactNode;
    compact?: boolean;
}) {
    if (form.template_type === 'CAROUSEL') {
        return (
            <div className={`flex flex-col ${compact ? '' : 'py-4'}`}>
                <div className={`bg-[#e5ddd5] rounded-2xl ${compact ? 'p-3' : 'p-5'} shadow-inner w-full`}>
                    <div className="text-[9px] text-center text-gray-500 mb-2 bg-white/60 rounded-full px-2 py-0.5 mx-auto w-fit">Today</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {form.carousel_cards.length === 0 ? (
                            <div className="bg-white rounded-xl p-3 min-w-[120px] text-center">
                                <LayoutGrid size={20} className="mx-auto text-gray-300 mb-1" />
                                <p className="text-[10px] text-gray-400">No cards</p>
                            </div>
                        ) : form.carousel_cards.map((card, ci) => (
                            <div key={ci} className="bg-white rounded-xl overflow-hidden min-w-[120px] max-w-[140px] shrink-0 shadow-sm">
                                <div className="h-16 bg-gray-100 flex items-center justify-center">
                                    {card.header_url ? (
                                        <img src={card.header_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Image size={20} className="text-gray-300" />
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-[9px] text-gray-700 leading-tight line-clamp-2">{card.body || 'Card body...'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-800 mt-2 bg-white/60 rounded px-2 py-1">{form.body || 'Message body...'}</p>
                </div>
            </div>
        );
    }

    if (form.template_type === 'LOCATION') {
        return (
            <div className={`flex flex-col items-center ${compact ? '' : 'py-4'}`}>
                <div className={`bg-[#e5ddd5] rounded-2xl ${compact ? 'p-3 w-full' : 'p-5 max-w-xs w-full'} shadow-inner`}>
                    <div className="text-[9px] text-center text-gray-500 mb-3 bg-white/60 rounded-full px-2 py-0.5 mx-auto w-fit">Today</div>
                    <div className="bg-white rounded-2xl rounded-tl-none shadow-sm overflow-hidden max-w-[90%]">
                        <div className={`bg-blue-100 flex items-center justify-center ${compact ? 'h-14' : 'h-20'}`}>
                            <MapPin size={compact ? 20 : 28} className="text-blue-500" />
                        </div>
                        {form.location_name && (
                            <div className="px-3 py-2">
                                <p className={`font-semibold text-gray-900 ${compact ? 'text-[10px]' : 'text-xs'}`}>{form.location_name}</p>
                                {form.location_address && <p className={`text-gray-500 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{form.location_address}</p>}
                            </div>
                        )}
                        <div className="px-3 pb-2">
                            <p className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${compact ? 'text-[10px]' : 'text-xs'}`}>
                                {renderBodyPreview()}
                            </p>
                            {form.footer && <p className={`text-gray-400 mt-1 italic ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{form.footer}</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center ${compact ? '' : 'py-4'}`}>
            <div className={`bg-[#e5ddd5] rounded-2xl ${compact ? 'p-3 w-full' : 'p-5 max-w-xs w-full'} shadow-inner`}>
                <div className="text-[9px] text-center text-gray-500 mb-3 bg-white/60 rounded-full px-2 py-0.5 mx-auto w-fit">Today</div>
                <div className="bg-white rounded-2xl rounded-tl-none shadow-sm overflow-hidden max-w-[90%]">
                    {form.template_type === 'TEXT' && form.header_text && (
                        <div className="px-3 pt-3 pb-1">
                            <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>{form.header_text}</p>
                        </div>
                    )}
                    {headerType === 'IMAGE' && (
                        <div className="bg-amber-50 overflow-hidden flex items-center justify-center" style={{ height: compact ? '60px' : '120px' }}>
                            {form.header_media_url ? (
                                <img src={form.header_media_url} alt="header" className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : <Image size={compact ? 18 : 28} className="text-amber-400" />}
                        </div>
                    )}
                    {headerType === 'VIDEO' && (
                        <div className="bg-gray-800 flex items-center justify-center" style={{ height: compact ? '60px' : '100px' }}>
                            <Video size={compact ? 16 : 24} className="text-gray-400" />
                        </div>
                    )}
                    {headerType === 'DOCUMENT' && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-100">
                            <FileDoc size={compact ? 14 : 18} className="text-red-500 shrink-0" />
                            <span className="text-xs text-gray-600 truncate">{form.header_media_url ? form.header_media_url.split('/').pop() : 'document.pdf'}</span>
                        </div>
                    )}

                    {form.template_type === 'LIMITED_TIME_OFFER' && form.lto_coupon_code && (
                        <div className="bg-orange-50 border-b border-orange-100 px-3 py-2 flex items-center gap-2">
                            <Tag size={12} className="text-orange-500 shrink-0" />
                            <span className={`font-mono font-bold text-orange-700 ${compact ? 'text-[10px]' : 'text-xs'}`}>{form.lto_coupon_code}</span>
                            <span className={`text-orange-500 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>Copy</span>
                        </div>
                    )}

                    <div className="px-3 pt-2 pb-2">
                        <p className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${compact ? 'text-[10px]' : 'text-xs'}`}>
                            {renderBodyPreview()}
                        </p>
                        {form.footer && (
                            <p className={`text-gray-400 mt-1.5 italic ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{form.footer}</p>
                        )}
                        <div className="flex justify-end mt-1">
                            <span className="text-[9px] text-gray-400">10:30</span>
                        </div>
                    </div>

                    {form.buttons.length > 0 && (
                        <div className="border-t border-gray-100">
                            {form.buttons.map((btn, i) => (
                                <div key={i} className={`text-center font-semibold text-blue-500 py-2 ${compact ? 'text-[10px]' : 'text-xs'} ${i > 0 ? 'border-t border-gray-100' : ''} flex items-center justify-center gap-1`}>
                                    {btn.type === 'URL' && <Link size={compact ? 9 : 11} />}
                                    {btn.type === 'PHONE_NUMBER' && <Phone size={compact ? 9 : 11} />}
                                    {btn.type === 'COPY_CODE' && <Tag size={compact ? 9 : 11} />}
                                    {btn.text || 'Button'}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}