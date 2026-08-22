import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Eye, CheckCircle, Award, UserCheck, Plus, Search, Filter as FilterIcon,
  Download, Upload, Edit, Trash2, MoreVertical, Check, RefreshCw, Sparkles,
  Link as LinkIcon, UserPlus, FileText, ChevronDown, ListFilter, Users,
  Layers, MapPin, User, UserX, Link2, Grid, List, MoreHorizontal, Globe, X, Mail, Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { sellerAPI } from '@/lib/sellersAPI';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/utils/permission';
import { getMasterDropdownOptions } from '@/lib/useMasterData';
import { usersAPI } from '@/lib/api';
import viewsAPI from '@/lib/viewAPI';
import { getImageUrl } from '@/lib/helpers';
import RentalPropertyFormModal from './components/RentalPropertyFormModal';
import RentalPropertyFilterModal, { RentalPropertyFilters } from './RentalPropertyFilterModal';
import ImportRentalPropertiesModal from '../../components/properties/ImportRentalPropertiesModal';
import RentalPropertyViewPage from '../../components/properties/RentalPropertyViewPage';
import { OwnerViewPage } from '../../components/owners/OwnerViewPage';
import TenantMatchingModal from '../../components/properties/TenantMatchingModal';
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import getTagStyle, { DEFAULT_TAG_STYLE } from "@/lib/tagStyles";
import { LucideIcon } from 'lucide-react';
import ownerAPI from '@/lib/ownerAPI';

const BRAND = '#E6761D'; // Orange accent
const NAVY = '#0f2b3d';  // Navy

interface UIProperty {
  id: number;
  propertyId?: string;
  title: string;
  location: string;
  city: string;
  society?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  carpetArea?: number | string;
  builtupArea?: number | string;
  monthly_rent?: number;
  security_deposit?: number;
  status: string;
  isPublic: boolean;
  assignedTo?: { id: number; name: string };
  seller?: { id: number; name: string };
  leadSource?: string;
  hotLeads?: number;
  created_at?: string;
  type?: string;
  subtype?: string;
  unitType?: string;
  wing?: string;
  floor?: string | number;
  totalFloors?: string | number;
  photos?: any[];
  stage?: string;
  interestedBuyers?: number;
  matchedBuyers?: any[];
  furnishing?: string;
  preferred_tenants?: string;
  owner?: { id: number; name: string } | null;
}

function Emoji({ emoji, size = 12, className = "" }: { emoji?: string | LucideIcon; size?: number; className?: string }) {
  if (!emoji) return null;
  if (typeof emoji === "string") return <span className={`${className} font-bold uppercase leading-none`} aria-hidden="true">{emoji}</span>;
  const Icon = emoji;
  return <Icon size={size} className={className} aria-hidden="true" />;
}

const TagPickerRow: React.FC<{
  label: "Add" | "Remove";
  knownTags: string[];
  selectedPropertyIds: (number | string)[];
  propTags: Record<string, string[]>;
  onApply: (tags: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}> = ({ label, knownTags, selectedPropertyIds, propTags, onApply, isOpen, onToggle, onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const currentTags = useMemo(() => {
    const allTags = new Set<string>();
    selectedPropertyIds.forEach(id => {
      const tags = propTags[String(id)] || [];
      tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  }, [selectedPropertyIds, propTags]);

  const options = useMemo(() => {
    const base = (knownTags?.length ? knownTags : Object.keys(DEFAULT_TAG_STYLE))
      .map(t => String(t).trim())
      .filter(Boolean);
    const uniq = Array.from(new Map(base.map(t => [t.toLowerCase(), t])).values());
    return uniq.sort((a, b) => a.localeCompare(b));
  }, [knownTags]);

  useEffect(() => {
    if (label === "Remove" && isOpen) {
      setSelected(currentTags.filter(tag => options.includes(tag)));
    } else if (label === "Add" && isOpen) {
      setSelected([]);
    }
  }, [isOpen, label, currentTags, options]);

  const toggle = (t: string) => {
    setSelected(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  };

  const selectAll = () => setSelected(options);
  const clearAll = () => setSelected([]);

  const apply = () => {
    if (!selected.length) {
      toast.warn(`Please select at least one tag to ${label.toLowerCase()}`);
      return;
    }
    onApply(selected);
    onClose();
  };

  return (
    <div className="mb-1.5 relative">
      <button
        className="w-full text-left text-[10px] px-2 py-1 rounded-lg font-medium transition-all duration-200 flex items-center justify-between group bg-slate-50 border border-slate-200 text-[#0f2b3d]"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        type="button"
      >
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${label === 'Add' ? 'bg-green-500' : 'bg-red-500'}`} />
          {label} tags
        </span>
        {selected.length > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-orange-100 text-orange-600">
            {selected.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={onClose} />
          <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg shadow-xl overflow-hidden bg-white border border-slate-200 min-w-[190px] w-full">
            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-b border-slate-200">
              <div className="text-[9px] font-medium text-slate-500">
                {options.length} tags
                {label === "Remove" && currentTags.length > 0 && (
                  <span className="ml-1 text-orange-500">({currentTags.length} applied)</span>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={selectAll} className="text-[9px] px-1.5 py-0.5 rounded hover:bg-gray-100 text-[#0f2b3d]">All</button>
                <button onClick={clearAll} className="text-[9px] px-1.5 py-0.5 rounded hover:bg-gray-100 text-slate-500">Clear</button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto p-1.5 space-y-1" style={{ scrollbarWidth: 'thin' }}>
              {options.map(t => {
                const active = selected.includes(t);
                const tone = getTagStyle(t);
                const isCurrentlyApplied = currentTags.includes(t);

                return (
                  <li
                    key={t}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg cursor-pointer transition-all duration-150 ${active ? 'shadow-sm bg-orange-50 border border-orange-200' : 'border border-transparent'}`}
                    onClick={() => toggle(t)}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggle(t)}
                      className="h-3 w-3 rounded focus:ring-1 cursor-pointer accent-orange-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium flex-1 ${tone.bg} ${tone.text} ${tone.ring}`} title={t}>
                      <Emoji emoji={tone.emoji} size={10} />
                      <span className="leading-none capitalize">{t}</span>
                    </div>
                    {label === "Remove" && isCurrentlyApplied && (
                      <span className="text-[8px] font-medium px-1 py-0.5 rounded whitespace-nowrap bg-orange-100 text-orange-600">Applied</span>
                    )}
                  </li>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-2 py-1.5 border-t border-slate-200 bg-slate-50">
              <div className="text-[9px] font-medium text-slate-500">
                {selected.length} tag{selected.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={onClose} className="px-2 py-0.5 text-[9px] rounded text-slate-500 hover:bg-gray-100">Cancel</button>
                <button onClick={apply} disabled={selected.length === 0} className="px-2 py-0.5 text-[9px] font-medium rounded text-white bg-orange-500 hover:opacity-80 disabled:opacity-40">{label} {selected.length}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PropertyTags = ({ tags, className = "", onClickTag }: { tags: string[]; className?: string; onClickTag?: (tag: string) => void }) => {
  if (!tags?.length) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((raw, i) => {
        const key = String(raw || "").trim();
        const tone = getTagStyle(key);
        const common = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 shadow-sm leading-none";
        const TagEl = onClickTag ? "button" as const : "span";
        return (
          <TagEl
            key={`${key}-${i}`}
            title={onClickTag ? `Filter by: ${key}` : key}
            className={`${common} ${tone.bg} ${tone.text} ${tone.ring} ${onClickTag ? "cursor-pointer hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400" : ""}`}
            onClick={onClickTag ? () => onClickTag(key) : undefined}
            type={onClickTag ? "button" : undefined}
          >
            <Emoji emoji={tone.emoji} size={12} className="text-xs mr-1" />
            <span className="leading-none">{key}</span>
          </TagEl>
        );
      })}
    </div>
  );
};

/* ---------------------- Image Helper Component ---------------------- */
const ImageWithDebug: React.FC<{
  srcCandidate?: string;
  alt?: string;
  className?: string;
  fitCover?: boolean;
}> = ({ srcCandidate, alt = 'image', className = '', fitCover = true }) => {
  const [failed, setFailed] = useState(false);
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    const url = getImageUrl(srcCandidate || '');
    setResolved(url);
    setFailed(false);
  }, [srcCandidate]);

  if (!resolved || failed) {
    return (
      <div
        className={`bg-gradient-to-br from-[#0f2b3d]/5 to-[#0f2b3d]/10 text-slate-500 font-normal flex flex-col items-center justify-center text-center gap-1 ${className}`}
        style={{ objectFit: fitCover ? 'cover' : undefined }}
      >
        <Building className="text-[#e67e22]/70 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-[8px] tracking-wider font-semibold uppercase opacity-60">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      style={{ objectFit: fitCover ? 'cover' : undefined }}
      onError={() => setFailed(true)}
    />
  );
};

/* ---------------------- Formatting Helpers ---------------------- */
const formatCurrency = (val: any) => {
  if (val == null || val === '') return '₹ -';
  const num = Number(val);
  return `₹${num.toLocaleString('en-IN')}`;
};

const getStatusBadge = (status: string, isAbsolute = false) => {
  const isAvail = status === 'Available';
  const isLeased = status === 'Sold' || status === 'Leased';
  const bg = isAvail ? 'bg-green-50 text-green-700 ring-green-600/20' : isLeased ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : 'bg-orange-50 text-orange-700 ring-orange-600/20';
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${bg} ${isAbsolute ? 'shadow-sm' : ''}`}>
      {status}
    </span>
  );
};

const getStageBadge = (stage: string, isAbsolute = false) => {
  return (
    <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[8.5px] font-bold uppercase text-blue-700 ring-1 ring-inset ring-blue-600/20">
      {stage ? stage.replace(/_/g, ' ') : 'Initial Contact'}
    </span>
  );
};

const dash = (val: any) => {
  if (val === null || val === undefined || String(val).trim() === '' || String(val).trim() === '-') return ' - ';
  return String(val);
};

const ExecutiveBadge: React.FC<{ assignedTo?: { id: any; name: string } }> = ({ assignedTo }) => {
  if (!assignedTo) return null;
  return (
    <div className="inline-flex items-center gap-1 bg-slate-100/80 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-slate-700 border border-slate-200/50">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span className="truncate max-w-[80px]">{assignedTo.name}</span>
    </div>
  );
};

/* ---------------------- Tailwind Color Helpers ---------------------- */
const TAB_STYLES: Record<string, { badge: string; btn: string; btnActive: string; countActive: string }> = {
  blue: { badge: 'bg-orange-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-orange-50 text-orange-600 border border-orange-200', countActive: 'bg-orange-200 text-orange-700' },
  green: { badge: 'bg-green-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-green-50 text-green-600 border border-green-200', countActive: 'bg-green-200 text-green-700' },
  purple: { badge: 'bg-purple-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-purple-50 text-purple-600 border border-purple-200', countActive: 'bg-purple-200 text-purple-700' },
  orange: { badge: 'bg-orange-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-orange-50 text-orange-600 border border-orange-200', countActive: 'bg-orange-200 text-orange-700' },
  indigo: { badge: 'bg-indigo-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-indigo-50 text-indigo-600 border border-indigo-200', countActive: 'bg-indigo-200 text-indigo-700' },
  red: { badge: 'bg-red-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-red-50 text-red-600 border border-red-200', countActive: 'bg-red-200 text-red-700' },
};

function tabBtnClass(active: boolean, color: string) {
  const s = TAB_STYLES[color] || TAB_STYLES.blue;
  return `flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-xs ${active ? s.btnActive : s.btn}`;
}
function tabCountClass(active: boolean, color: string) {
  const s = TAB_STYLES[color] || TAB_STYLES.blue;
  return `px-2 py-0.5 rounded-full text-[10px] ${active ? s.countActive : 'bg-gray-200 text-gray-700'}`;
}

const Building: React.FC<{ className?: string; size?: number }> = ({ className, size }) => (
  <svg className={className} width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="22" x2="9" y2="16"></line>
    <line x1="15" y1="22" x2="15" y2="16"></line>
    <line x1="9" y1="16" x2="15" y2="16"></line>
    <path d="M9 8h.01"></path>
    <path d="M15 8h.01"></path>
    <path d="M9 12h.01"></path>
    <path d="M15 12h.01"></path>
  </svg>
);

export function RentalPropertiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Permission checks (mirror PropertiesPage)
  const canCreate = can(user, 'property.create');
  const canUpdate = can(user, 'property.update');
  const canDelete = can(user, 'property.delete');
  const canImport = can(user, 'data.import');
  const canExport = can(user, 'data.export');
  const canAssign = can(user, 'property.assign');
  const canBulkDelete = can(user, 'property.bulk_delete');

  const [properties, setProperties] = useState<UIProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTenantMatching, setShowTenantMatching] = useState(false);
  const [matchingProperty, setMatchingProperty] = useState<any | null>(null);

  const handleTenantMatching = (property: any) => {
    setMatchingProperty(property);
    setShowTenantMatching(true);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkAssignExecId, setBulkAssignExecId] = useState('');
  const [ownerToView, setOwnerToView] = useState<{ id: number; name: string } | null>(null);

  // Selection
  const [selectedProperties, setSelectedProperties] = useState<(number | string)[]>([]);

  // Modal toggles
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [currentPropertyView, setCurrentPropertyView] = useState<any | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewsMap, setViewsMap] = useState<Record<string, { total_views: number; unique_views: number }>>({});
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);

  // Dynamic Tags
  const [propTags, setPropTags] = useState<Record<string, string[]>>({});
  const [knownTags, setKnownTags] = useState<string[]>([]);
  const [bulkTagsMenuOpen, setBulkTagsMenuOpen] = useState(false);
  const [activeTagPicker, setActiveTagPicker] = useState<'add' | 'remove' | null>(null);

  // Link Owner States & Handlers
  const [showLinkOwnerModal, setShowLinkOwnerModal] = useState(false);
  const [linkingPropertyForOwner, setLinkingPropertyForOwner] = useState<any | null>(null);
  const [allOwnersList, setAllOwnersList] = useState<any[]>([]);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [savingOwnerLink, setSavingOwnerLink] = useState(false);

  const handleOpenLinkOwnerModal = async (property: any) => {
    setLinkingPropertyForOwner(property);
    setShowLinkOwnerModal(true);
    setOwnerSearchQuery('');
    setLoadingOwners(true);
    try {
      const res = await ownerAPI.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAllOwnersList(list);
    } catch (err) {
      console.error("Failed to load owners:", err);
      toast.error("Could not load owners");
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleLinkOwnerToProperty = async (owner: any) => {
    if (!linkingPropertyForOwner) return;
    setSavingOwnerLink(true);
    try {
      // Fetch full owner details to ensure we do not overwrite other properties linked to this owner
      const resp = await ownerAPI.getById(String(owner.id));
      const ownerData = resp?.data?.owner ?? resp?.owner ?? resp;
      const currentProps = Array.isArray(resp?.data?.properties)
        ? resp.data.properties
        : Array.isArray(resp?.properties)
        ? resp.properties
        : [];

      const pid = String(linkingPropertyForOwner.id);
      const alreadyLinked = currentProps.some((p: any) => String(p.id || p.property_id || p._id) === pid);

      const updatedProps = alreadyLinked ? currentProps : [...currentProps, linkingPropertyForOwner];

      await ownerAPI.update(String(owner.id), {
        ...(ownerData || {}),
        properties: updatedProps,
        property_ids: updatedProps.map((p: any) => p.id || p.property_id || p._id).filter(Boolean),
      });

      await rentalPropertiesAPI.patchOwner(String(linkingPropertyForOwner.id), 'link', owner.id);

      setProperties(prev => prev.map(p => {
        if (p.id === linkingPropertyForOwner.id) {
          return {
            ...p,
            owner: {
              id: owner.id,
              name: owner.name,
              phone: owner.phone,
              email: owner.email,
            },
          };
        }
        return p;
      }));

      toast.success(`Property linked to owner "${owner.name}" successfully!`);
      setShowLinkOwnerModal(false);
      setLinkingPropertyForOwner(null);
    } catch (err: any) {
      console.error('Failed to link owner:', err);
      toast.error('Failed to link owner to property');
    } finally {
      setSavingOwnerLink(false);
    }
  };

  const handleUnlinkOwnerFromProperty = async () => {
    if (!linkingPropertyForOwner) return;
    const linkedOwnerId = linkingPropertyForOwner.owner?.id;
    const linkedOwnerName = linkingPropertyForOwner.owner?.name;

    const result = await Swal.fire({
      title: 'Unlink Owner?',
      text: `Are you sure you want to unlink owner "${linkedOwnerName}" from this property?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Unlink',
      cancelButtonText: 'Cancel',
      width: '380px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-gray-800',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 mx-1',
        cancelButton: 'px-3 py-1.5 bg-gray-500 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 mx-1',
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    setSavingOwnerLink(true);
    try {
      await rentalPropertiesAPI.patchOwner(String(linkingPropertyForOwner.id), 'unlink');

      if (linkedOwnerId) {
        try {
          const resp = await ownerAPI.getById(String(linkedOwnerId));
          const ownerData = resp?.data?.owner ?? resp?.owner ?? resp;
          const currentProps: any[] = Array.isArray(resp?.data?.properties)
            ? resp.data.properties
            : Array.isArray(resp?.properties)
            ? resp.properties
            : [];

          const pid = String(linkingPropertyForOwner.id);
          const updatedProps = currentProps.filter(
            (p: any) => String(p.id || p.property_id || p._id) !== pid
          );

          await ownerAPI.update(String(linkedOwnerId), {
            ...(ownerData || {}),
            properties: updatedProps,
            property_ids: updatedProps.map((p: any) => p.id || p.property_id || p._id).filter(Boolean),
          });
        } catch (err) {
          console.error('Failed to update owner properties on server during unlink:', err);
        }
      }

      setProperties(prev => prev.map(p => {
        if (p.id === linkingPropertyForOwner.id) {
          return { ...p, owner: null, owner_id: null, owner_name: null };
        }
        return p;
      }));

      setLinkingPropertyForOwner(prev => prev ? { ...prev, owner: null, owner_id: null, owner_name: null } : null);
      toast.success('Owner unlinked from property successfully!');
    } catch (err: any) {
      console.error('Failed to unlink owner:', err);
      toast.error('Failed to unlink owner from property');
    } finally {
      setSavingOwnerLink(false);
    }
  };

  const filteredOwnersForLink = useMemo(() => {
    if (!ownerSearchQuery.trim()) return allOwnersList;
    const q = ownerSearchQuery.toLowerCase().trim();
    return allOwnersList.filter(o =>
      String(o.name || '').toLowerCase().includes(q) ||
      String(o.phone || '').toLowerCase().includes(q) ||
      String(o.email || '').toLowerCase().includes(q) ||
      String(o.location || '').toLowerCase().includes(q)
    );
  }, [allOwnersList, ownerSearchQuery]);

  const knownTagsAll = useMemo(() => {
    const set = new Set<string>([...Object.keys(DEFAULT_TAG_STYLE), ...knownTags]);
    return Array.from(set).sort();
  }, [knownTags]);

  const handleBulkAddTags = async (tags: string[]) => {
    if (!selectedProperties.length) return toast.warn("No properties selected");
    const clean = Array.from(new Set(tags.map(t => String(t).trim()).filter(Boolean)));
    if (!clean.length) return toast.warn("Pick at least one tag");

    setBulkLoading(true);
    try {
      for (const id of selectedProperties) {
        await propertyTagsAPI.add(id, clean);
        const key = String(id);
        setPropTags(prev => ({
          ...prev,
          [key]: Array.from(new Set([...(prev[key] || []), ...clean]))
        }));
      }
      setKnownTags(prev => Array.from(new Set([...prev, ...clean])).sort());
      toast.success("Tags added to selected properties");
    } catch (e: any) {
      console.error("Bulk add tags failed:", e);
      toast.error(e?.response?.data?.message || "Failed to add tags");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRemoveTags = async (tags: string[]) => {
    if (!selectedProperties.length) return toast.warn("No properties selected");
    const clean = Array.from(new Set(tags.map(t => String(t).trim()).filter(Boolean)));
    if (!clean.length) return toast.warn("Pick at least one tag");

    setBulkLoading(true);
    try {
      for (const id of selectedProperties) {
        await propertyTagsAPI.remove(id, clean);
        const key = String(id);
        setPropTags(prev => {
          const remain = (prev[key] || []).filter(t => !clean.some(r => r.toLowerCase() === t.toLowerCase()));
          return { ...prev, [key]: remain };
        });
      }
      toast.success("Tags removed from selected properties");
    } catch (e: any) {
      console.error("Bulk remove tags failed:", e);
      toast.error(e?.response?.data?.message || "Failed to remove tags");
    } finally {
      setBulkLoading(false);
    }
  };

  // Filters State
  const EMPTY_FILTERS: RentalPropertyFilters = {
    type: "all",
    subtype: "all",
    city: "all",
    location: "all",
    society: "all",
    seller: "all",
    assignedExecutive: "all",
    status: "all",
    furnishing: "all",
    bedrooms: "all",
    preferredTenants: "all",
    minRent: "",
    maxRent: "",
    minDeposit: "",
    maxDeposit: "",
    dateFrom: "",
    dateTo: "",
    ignoreDate: false,
    sortOrder: "created_desc",
    isPublic: "all",
  };
  const [filters, setFilters] = useState<RentalPropertyFilters>(EMPTY_FILTERS);

  // Master lists for filter dropdowns
  const [masters, setMasters] = useState<Record<string, any[]>>({});
  const [sellers, setSellers] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);

  // Statistics
  const [totalViews, setTotalViews] = useState(0);
  const [totalUniqueViews, setTotalUniqueViews] = useState(0);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await rentalPropertiesAPI.getProperties();
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((p: any) => ({
          ...p,
          id: p.id,
          propertyId: p.propertyId || `RENT-${p.id}`,
          title: p.title || `${p.bedrooms || 0} BHK ${p.property_subtype_name || p.property_type_name || 'Apartment'} in ${p.society_name || p.location_name || 'Society'}`,
          type: p.property_type_name || p.type || '',
          subtype: p.property_subtype_name || p.subtype || '',
          unitType: p.unit_type || p.unitType || '',
          location: p.location_name || p.location || '',
          city: p.city_name || p.city || '',
          society: p.society_name || p.society || '',
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          carpetArea: p.carpet_area || p.carpetArea || 0,
          builtupArea: p.builtup_area || p.builtupArea || 0,
          budget: Number(p.monthly_rent || p.budget || 0),
          monthly_rent: Number(p.monthly_rent || 0),
          security_deposit: Number(p.security_deposit || 0),
          maintenance_charge: p.maintenance_charge || '',
          maintenance_extra: p.maintenance_extra,
          preferred_tenants: p.preferred_tenants || '',
          lock_in_period: p.lock_in_period || '',
          agreement_duration: p.agreement_duration || '',
          available_from: p.available_from || '',
          status: p.status || 'Available',
          isPublic: !!p.is_public,
          assignedTo: p.assigned_to ? { id: p.assigned_to, name: p.assigned_executive || 'Executive' } : undefined,
          seller: p.seller_id ? { id: p.seller_id, name: p.seller_name || 'Owner' } : undefined,
          leadSource: p.lead_source || '',
          hotLeads: p.hotLeads || 0,
          created_at: p.created_at,
          photos: p.photos || [],
          floor: p.floor || '',
          totalFloors: p.total_floors || '',
          wing: p.wing || '',
          unitNo: p.unit_no || '',
          furnishing: p.furnishing || '',
          facing: p.facing || '',
          balcony: p.balcony || '',
          stage: p.stage || 'initial_contact',
          interestedBuyers: p.interested_buyers || 0,
          address: p.address || '',
          description: p.description || '',
          amenities: p.amenities || [],
          furnishingItems: p.furnishing_items || p.furnishingItems || [],
          nearby_places: p.nearby_places || [],
          owner: (p.owner_id || p.owner?.id) ? { id: p.owner_id || p.owner?.id, name: p.owner_name || p.owner?.name || 'Owner' } : null,
        }));
        setProperties(mapped);

        const ids = mapped.map((p: any) => p.id);
        if (ids.length > 0) {
          propertyTagsAPI.getBulk(ids).then(bulkMap => {
            setPropTags(bulkMap || {});
            const allTags = Object.values(bulkMap || {}).flat();
            setKnownTags(prev => Array.from(new Set([...prev, ...allTags])).sort());
          }).catch(console.error);
        }
      }
    } catch (err) {
      toast.error('Failed to load rental properties');
    } finally {
      setLoading(false);
    }
  };

  // Load masters for filters
  useEffect(() => {
    loadProperties();

    const fetchFiltersMetadata = async () => {
      try {
        const [mastersData, sellersRes, usersRes] = await Promise.all([
          getMasterDropdownOptions(['common', 'lead', 'property']),
          sellerAPI.getAll(),
          usersAPI.getAllUsers(),
        ]);

        setMasters(mastersData);

        if (sellersRes.success && Array.isArray(sellersRes.data)) {
          setSellers(sellersRes.data.map((s: any) => ({ label: s.name, value: s.name })));
        }

        if (usersRes.success && Array.isArray(usersRes.data)) {
          const execs = usersRes.data
            .filter((u: any) => u.role === 'sales_executive' || u.role_name === 'sales_executive')
            .map((u: any) => ({ label: `${u.first_name || ''} ${u.last_name || ''}`.trim(), value: String(u.id) }));
          setExecutives(execs);
        }
      } catch (e) {
        console.error("Failed to load filters metadata:", e);
      }
    };

    fetchFiltersMetadata();
  }, []);

  // Load view statistics
  useEffect(() => {
    async function fetchViewStats() {
      try {
        const res = await viewsAPI.getAll(false);
        const resUnique = await viewsAPI.getAll(true);

        const views = res?.rows?.reduce((sum: number, row: any) => sum + (row?.total_views || 0), 0) || 0;
        const unique = resUnique?.rows?.reduce((sum: number, row: any) => sum + (row?.unique_views || 0), 0) || 0;
        setTotalViews(views);
        setTotalUniqueViews(unique);

        const map: Record<string, any> = {};
        if (res && Array.isArray(res.rows)) {
          res.rows.forEach((row: any) => {
            map[String(row.property_id)] = {
              total_views: row.total_views || 0,
              unique_views: row.unique_views || 0
            };
          });
        }
        setViewsMap(map);
      } catch (e) {
        console.error("Failed to load view stats:", e);
      }
    }
    fetchViewStats();
  }, [properties]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([k, v]) => {
      if (k === 'sortOrder') return false;
      if (k === 'ignoreDate') return false;
      if (v === 'all' || v === '' || v === undefined) return false;
      return true;
    }).length;
  }, [filters]);

  // Filter & Search computation — derive unique option lists from loaded properties
  const cityOptions = useMemo(() => {
    const vals = masters['city'] || [];
    if (vals.length > 0) return vals;
    const unique = [...new Set(properties.map(p => p.city).filter(Boolean))];
    return unique.map(v => ({ label: v, value: v }));
  }, [properties, masters]);

  const subtypeOptions = useMemo(() => {
    const vals = masters['property subtype'] || masters['property sub type'] || masters['subtype'] || [];
    if (vals.length > 0) return vals;
    const unique = [...new Set(properties.map(p => p.subtype).filter(Boolean))];
    return unique.map(v => ({ label: v, value: v }));
  }, [properties, masters]);

  const furnishingOptions = useMemo(() => {
    const vals = masters['furnishing'] || masters['furnishing status'] || [];
    if (vals.length > 0) return vals;
    return [
      { label: 'Fully Furnished', value: 'Fully Furnished' },
      { label: 'Semi-Furnished', value: 'Semi-Furnished' },
      { label: 'Unfurnished', value: 'Unfurnished' },
    ];
  }, [masters]);

  const societyOptions = useMemo(() => {
    const unique = [...new Set(properties.map(p => p.society).filter(Boolean))];
    return unique.sort().map(v => ({ label: v, value: v }));
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let result = properties.filter((p: any) => {
      const q = searchTerm.toLowerCase().trim();

      const pid = String(p.id || "");
      const pidDigits = pid.replace(/\D/g, "");
      const pidNum = Number(pidDigits);
      const qDigits = q.replace(/\D/g, "");
      const qNum = Number(qDigits);
      const qTrimmed = qDigits.replace(/^0+/, "");
      const qClean = q.replace(/[^a-z0-9]/gi, "");
      const pidTrimmed = pidDigits.replace(/^0+/, "");
      const pidClean = pid.replace(/[^a-z0-9]/gi, "");
      const repId = String(p.propertyId || "").toLowerCase();
      const repIdClean = repId.replace(/[^a-z0-9]/gi, "");

      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        (p.propertyId || '').toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.society || '').toLowerCase().includes(q) ||
        (p.seller?.name || '').toLowerCase().includes(q) ||
        (p.owner?.name || '').toLowerCase().includes(q) ||
        (p.owner_name || '').toLowerCase().includes(q) ||
        (p.subtype || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q) ||
        (qClean && (pidClean.includes(qClean) || repIdClean.includes(qClean))) ||
        (!isNaN(qNum) && !isNaN(pidNum) && qNum === pidNum) ||
        (qTrimmed && pidTrimmed && pidTrimmed.includes(qTrimmed));

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'available' && p.status === 'Available') ||
        (activeTab === 'leased' && (p.status === 'Sold' || p.status === 'Leased')) ||
        (activeTab === 'negotiation' && p.status === 'Under Negotiation') ||
        (activeTab === 'public' && p.isPublic) ||
        (activeTab === 'private' && !p.isPublic);

      // --- Advanced filter conditions ---
      const fv = (val?: string) => !val || val === 'all';

      const matchesType = fv(filters.type) || (p.type || '').toLowerCase() === (filters.type || '').toLowerCase();
      const matchesSubtype = fv(filters.subtype) || (p.subtype || '').toLowerCase() === (filters.subtype || '').toLowerCase();
      const matchesCity = fv(filters.city) || (p.city || '').toLowerCase() === (filters.city || '').toLowerCase();
      const matchesLocation = fv(filters.location) || (p.location || '').toLowerCase() === (filters.location || '').toLowerCase();
      const matchesSociety = fv(filters.society) || (p.society || '').toLowerCase() === (filters.society || '').toLowerCase();
      const matchesSeller = fv(filters.seller) || p.seller?.name === filters.seller;
      const matchesStatus = fv(filters.status) || p.status.toLowerCase() === (filters.status || '').toLowerCase();
      const matchesFurnishing = fv(filters.furnishing) || (p.furnishing || '').toLowerCase() === (filters.furnishing || '').toLowerCase();
      const matchesBedrooms = fv(filters.bedrooms) || String(p.bedrooms) === filters.bedrooms;
      const matchesPreferredTenants = fv(filters.preferredTenants) || (p.preferred_tenants || '').toLowerCase() === (filters.preferredTenants || '').toLowerCase() || (filters.preferredTenants === 'Any' && !p.preferred_tenants);

      const matchesExecutive = fv(filters.assignedExecutive) ||
        (filters.assignedExecutive === '__unassigned__' ? !p.assignedTo?.id : String(p.assignedTo?.id) === filters.assignedExecutive);

      const rentVal = p.monthly_rent || 0;
      const depositVal = p.security_deposit || 0;
      const matchesMinRent = !filters.minRent || rentVal >= Number(filters.minRent);
      const matchesMaxRent = !filters.maxRent || rentVal <= Number(filters.maxRent);
      const matchesMinDeposit = !filters.minDeposit || depositVal >= Number(filters.minDeposit);
      const matchesMaxDeposit = !filters.maxDeposit || depositVal <= Number(filters.maxDeposit);

      const matchesVisibility = fv(filters.isPublic) ||
        (filters.isPublic === 'public' ? p.isPublic : !p.isPublic);

      // Date range filter
      let matchesDate = true;
      if (!filters.ignoreDate && (filters.dateFrom || filters.dateTo) && p.created_at) {
        const created = new Date(p.created_at).getTime();
        if (filters.dateFrom) {
          const from = new Date(filters.dateFrom).getTime();
          if (created < from) matchesDate = false;
        }
        if (filters.dateTo) {
          const to = new Date(filters.dateTo).getTime() + 86400000; // inclusive
          if (created > to) matchesDate = false;
        }
      }

      return matchesSearch && matchesTab && matchesType && matchesSubtype && matchesCity && matchesLocation &&
        matchesSociety && matchesSeller && matchesStatus && matchesFurnishing && matchesBedrooms &&
        matchesPreferredTenants && matchesExecutive && matchesMinRent && matchesMaxRent &&
        matchesMinDeposit && matchesMaxDeposit && matchesVisibility && matchesDate;
    });

    // Apply sort
    const sortOrder = filters.sortOrder || 'created_desc';
    result = [...result].sort((a, b) => {
      if (sortOrder === 'created_asc') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      if (sortOrder === 'created_desc') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortOrder === 'price_asc') return (a.monthly_rent || 0) - (b.monthly_rent || 0);
      if (sortOrder === 'price_desc') return (b.monthly_rent || 0) - (a.monthly_rent || 0);
      if (sortOrder === 'deposit_asc') return (a.security_deposit || 0) - (b.security_deposit || 0);
      if (sortOrder === 'deposit_desc') return (b.security_deposit || 0) - (a.security_deposit || 0);
      return 0;
    });

    return result;
  }, [properties, searchTerm, activeTab, filters]);

  // Tabs structure
  const tabs = useMemo(() => [
    { id: 'all', label: 'All Rental Properties', count: properties.length, color: 'blue' },
    { id: 'available', label: 'Available', count: properties.filter(p => p.status === 'Available').length, color: 'green' },
    { id: 'leased', label: 'Leased / Signed', count: properties.filter(p => p.status === 'Sold' || p.status === 'Leased').length, color: 'purple' },
    { id: 'negotiation', label: 'Under Negotiation', count: properties.filter(p => p.status === 'Under Negotiation').length, color: 'orange' },
    { id: 'public', label: 'Public Listings', count: properties.filter(p => p.isPublic).length, color: 'indigo' },
    { id: 'private', label: 'Private Listings', count: properties.filter(p => !p.isPublic).length, color: 'red' },
  ], [properties]);

  const avgRent = useMemo(() => {
    const valid = properties.filter(p => p.monthly_rent && p.monthly_rent > 0);
    if (!valid.length) return 0;
    const sum = valid.reduce((acc, p) => acc + (p.monthly_rent || 0), 0);
    return Math.round(sum / valid.length);
  }, [properties]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = useMemo(() => {
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, startIndex, itemsPerPage]);

  const handleSelectAllPages = () => {
    const allIds = filteredProperties.map(p => p.id);
    if (selectedProperties.length === allIds.length && allIds.length > 0) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(allIds);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(filteredProperties.map(p => p.id));
    } else {
      setSelectedProperties([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, id]);
    } else {
      setSelectedProperties(prev => prev.filter(x => x !== id));
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this rental listing!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E6761D',
      cancelButtonColor: '#0f2b3d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await rentalPropertiesAPI.deleteProperty(String(id));
        if (res.success) {
          toast.success('Rental property deleted successfully');
          loadProperties();
        }
      } catch (err) {
        toast.error('Failed to delete property');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedProperties.length) return;
    const result = await Swal.fire({
      title: 'Bulk Delete?',
      text: `Are you sure you want to delete ${selectedProperties.length} rental properties?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E6761D',
      cancelButtonColor: '#0f2b3d',
      confirmButtonText: 'Yes, delete them!'
    });

    if (result.isConfirmed) {
      try {
        setBulkLoading(true);
        const res = await rentalPropertiesAPI.bulkDelete({ propertyIds: selectedProperties });
        if (res.success) {
          toast.success('Selected properties deleted successfully');
          setSelectedProperties([]);
          loadProperties();
        }
      } catch (e) {
        toast.error('Bulk deletion failed');
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (!selectedProperties.length) return;
    try {
      setBulkLoading(true);
      const res = await rentalPropertiesAPI.bulkUpdateStatus({ propertyIds: selectedProperties, status });
      if (res.success) {
        toast.success(`Marked ${selectedProperties.length} listings as ${status}`);
        setSelectedProperties([]);
        loadProperties();
      }
    } catch (e) {
      toast.error('Status update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkVisibility = async (isPublic: boolean) => {
    if (!selectedProperties.length) return;
    try {
      setBulkLoading(true);
      const res = await rentalPropertiesAPI.bulkSetVisibility({ propertyIds: selectedProperties, isPublic });
      if (res.success) {
        toast.success(`Marked selected properties as ${isPublic ? 'Public' : 'Private'}`);
        setSelectedProperties([]);
        loadProperties();
      }
    } catch (e) {
      toast.error('Failed to update visibility');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkAssignExecutive = async () => {
    if (!bulkAssignExecId) { toast.warning('Select an executive first'); return; }
    try {
      setBulkLoading(true);
      const res = await rentalPropertiesAPI.bulkAssignExecutive(selectedProperties.map(Number), Number(bulkAssignExecId));
      if (res.success) {
        toast.success(`Assigned executive to ${selectedProperties.length} properties`);
        setSelectedProperties([]);
        setBulkAssignExecId('');
        loadProperties();
      }
    } catch (e) { toast.error('Failed to assign executive'); }
    finally { setBulkLoading(false); }
  };

  const handleBulkUnassignExecutive = async () => {
    try {
      setBulkLoading(true);
      const res = await rentalPropertiesAPI.bulkUnassignExecutive(selectedProperties.map(Number));
      if (res.success) {
        toast.success(`Unassigned executive from ${selectedProperties.length} properties`);
        setSelectedProperties([]);
        loadProperties();
      }
    } catch (e) { toast.error('Failed to unassign executive'); }
    finally { setBulkLoading(false); }
  };

  const handleBulkExport = async (format: 'csv' | 'json') => {
    if (!selectedProperties.length) {
      toast.info("Please select properties to export");
      return;
    }
    try {
      await rentalPropertiesAPI.bulkExport({ propertyIds: selectedProperties, format });
      toast.success("Export successful!");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const handleToggleSingleVisibility = async (p: UIProperty) => {
    try {
      const nextPublic = !p.isPublic;
      const res = await rentalPropertiesAPI.setVisibility(String(p.id), nextPublic);
      if (res.success) {
        toast.success(`Listing set to ${nextPublic ? 'Public' : 'Private'}`);
        loadProperties();
      }
    } catch (err) {
      toast.error('Failed to update visibility status');
    }
  };

  const buildInitialData = (p: UIProperty): any => {
    // Looks up and maps the model keys for editing
    return {
      id: p.id,
      seller: p.seller?.name || '',
      seller_id: p.seller?.id || '',
      assigned_to: p.assignedTo?.id || '',
      propertyType: '', // Fetch from backend or trigger standard state maps
      status: p.status,
      carpetArea: p.carpetArea,
      monthly_rent: p.monthly_rent,
      security_deposit: p.security_deposit,
    };
  };
  const getPhotoUrl = (photo: any): string => {
    if (!photo) return '';
    return typeof photo === 'string' ? photo : (photo.url || '');
  };

  const getFirstDisplayPhotoUrl = (photos: any[]): string => {
    if (!Array.isArray(photos) || photos.length === 0) return '';

    const firstImage = photos.find((p) => {
      if (typeof p === 'string') return true; // legacy string entries = image
      return p?.type !== 'video';
    });
    if (firstImage) return getPhotoUrl(firstImage);

    // Agar sab video hi hain, YouTube thumbnail try karo
    const first = photos[0];
    const firstUrl = getPhotoUrl(first);
    const ytMatch = firstUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;

    return ''; // koi usable image nahi mila
  };

  const handleEditProperty = async (id: number) => {
    try {
      const detailed = await rentalPropertiesAPI.getProperty(String(id));
      if (detailed.success && detailed.data) {
        const prop = detailed.data;
        const initial = {
          id: prop.id,
          // Support linking to owner or seller transparently
          seller: prop.owner_name || prop.seller_name || '',
          seller_id: prop.owner_id || prop.seller_id || '',
          assigned_to: prop.assigned_to || '',
          propertyType: prop.property_type_name || '',
          propertySubtype: prop.property_subtype_name || '',
          unitType: prop.unit_type || '',
          wing: prop.wing || '',
          unitNo: prop.unit_no || '',
          furnishing: prop.furnishing || '',
          bedrooms: prop.bedrooms || '',
          bathrooms: prop.bathrooms || '',
          balcony: prop.balcony || '',
          facing: prop.facing || '',
          parkingType: prop.parking_type || '',
          parkingQty: prop.parking_qty || '',
          city: prop.city_name || '',
          location: prop.location_name || '',
          society: prop.society_name || prop.society || '',
          society_name: prop.society_name || prop.society || '',
          floor: prop.floor || '',
          totalFloors: prop.total_floors || '',
          leadSource: prop.lead_source || '',
          source_url: prop.source_url || prop.sourceUrl || '',
          address: prop.address || '',
          status: prop.status || 'Available',
          description: prop.description || '',
          amenities: prop.amenities || [],
          furnishingItems: prop.furnishing_items || [],
          nearby_places: prop.nearby_places || [],
          carpetArea: prop.carpet_area || '',
          builtupArea: prop.builtup_area || '',
          photos: prop.photos || [],
          ownershipDocUrl: prop.ownership_doc_path || '',
          existingOwnershipDocUrl: prop.ownership_doc_path || '',
          existingOwnershipDocName: prop.ownership_doc_name || 'Ownership Document',
          existingPhotos: (prop.photos || []).map((photo: any, idx: number) => {
            const isObj = photo && typeof photo === 'object';
            const url = isObj ? photo.url : photo;
            const label = isObj ? (photo.label || '') : '';
            const isSociety = isObj ? !!photo.isSociety : false;
            const type: 'video' | 'image' | undefined = isObj ? (photo.type === 'video' ? 'video' : 'image') : undefined;
            const name = label || `photo-${idx + 1}`;
            return {
              id: String(idx + 1),
              url,
              name,
              label,
              isSociety,
              type,
            };
          }),

          monthly_rent: prop.monthly_rent || '',
          security_deposit: prop.security_deposit || '',
          maintenance_extra: !!prop.maintenance_extra,
          maintenance_charge: prop.maintenance_charge || '',
          preferred_tenants: prop.preferred_tenants || '',
          lock_in_period: prop.lock_in_period || '',
          agreement_duration: prop.agreement_duration || '',
          available_from: prop.available_from || '',
        };
        setEditingProperty(initial);
        setShowFormModal(true);
      }
    } catch (err) {
      toast.error('Failed to load detailed property data');
    }
  };

  const handleViewProperty = (property: any) => {
    setCurrentPropertyView(property);
    const url = new URL(window.location.href);
    url.searchParams.set('view', String(property.id));
    window.history.replaceState({}, '', url.toString());
  };

  const handleBackToList = () => {
    setCurrentPropertyView(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('tab');
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    if (loading) return;
    const sp = new URLSearchParams(window.location.search);
    const viewId = sp.get('view');
    if (viewId && !currentPropertyView) {
      const p = properties.find(pp => String(pp.id) === viewId || String(pp.propertyId) === viewId);
      if (p) setCurrentPropertyView(p);
    }
  }, [loading, properties]);

  if (ownerToView) {
    return (
      <OwnerViewPage
        ownerId={ownerToView.id}
        onBack={() => setOwnerToView(null)}
      />
    );
  }

  if (currentPropertyView) {
    return (
      <RentalPropertyViewPage
        property={currentPropertyView}
        onBack={handleBackToList}
        onUpdateProperty={(p: any) => {
          setCurrentPropertyView(p);
          setProperties(prev => prev.map(x => x.id === p.id ? { ...x, ...p } : x));
        }}
      />
    );
  }

  return (
    <div className="h-[91.7vh] flex flex-col bg-gray-50 overflow-hidden">
      {/* Sticky top area - mirrors PropertiesPage structure */}
      <div className="sticky top-0 bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-2 py-4">
          {/* Mobile buttons row */}
          <div className="md:hidden flex items-center space-x-2 ml-auto justify-end mb-2">
            {canImport && (
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all text-xs"
              >
                <Upload size={14} />
                <span>Import</span>
              </button>
            )}
            {canCreate && (
              <button
                onClick={() => { setEditingProperty(null); setShowFormModal(true); }}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-all text-xs"
                style={{ background: NAVY }}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-3 items-stretch mt-2 sm:mt-3">
            {/* Tab Switcher on the Left */}
            <div className="flex flex-row lg:flex-col p-1 rounded-xl bg-gray-100 border border-gray-200 justify-between lg:justify-start gap-1 lg:w-44 flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate('/dashboard/properties')}
                className="flex-1 lg:flex-initial text-center lg:text-left px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center lg:justify-start gap-2 text-gray-500 hover:text-gray-800 hover:bg-white/50"
              >
                Sell Properties
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/rental-properties')}
                className="flex-1 lg:flex-initial text-center lg:text-left px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center lg:justify-start gap-2 bg-white text-[#E6761D] shadow-sm font-bold"
              >
                Rent Properties
              </button>
            </div>

            {/* Stats Cards - mirrors PropertiesPage style */}
            <div className="flex-1 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5 sm:gap-2">
              {/* Total */}
              <div className="rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm" style={{ background: '#eff6ff', border: '1px solid #3b82f620' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#3b82f6' }}>Total</p>
                    <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>{properties.length}</p>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#3b82f620' }}>
                    <Home size={10} className="sm:hidden" style={{ color: '#3b82f6' }} />
                    <Home size={12} className="hidden sm:block" style={{ color: '#3b82f6' }} />
                  </div>
                </div>
              </div>

              {/* Views */}
              <div className="rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm" style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#8b5cf6' }}>Views</p>
                    <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>{totalViews}</p>
                    <p className="text-[6px] sm:text-[7px] mt-0.5 hidden sm:block" style={{ color: '#8b5cf6' }}>Unique: {totalUniqueViews}</p>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#8b5cf620' }}>
                    <Eye size={10} className="sm:hidden" style={{ color: '#8b5cf6' }} />
                    <Eye size={12} className="hidden sm:block" style={{ color: '#8b5cf6' }} />
                  </div>
                </div>
              </div>

              {/* Available */}
              <div className="rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#10b981' }}>Avail</p>
                    <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
                      {properties.filter(p => p.status === 'Available').length}
                    </p>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#10b98120' }}>
                    <CheckCircle size={10} className="sm:hidden" style={{ color: '#10b981' }} />
                    <CheckCircle size={12} className="hidden sm:block" style={{ color: '#10b981' }} />
                  </div>
                </div>
              </div>

              {/* Leased */}
              <div className="rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm" style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#f59e0b' }}>Leased</p>
                    <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
                      {properties.filter(p => p.status === 'Sold' || p.status === 'Leased').length}
                    </p>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b20' }}>
                    <Award size={10} className="sm:hidden" style={{ color: '#f59e0b' }} />
                    <Award size={12} className="hidden sm:block" style={{ color: '#f59e0b' }} />
                  </div>
                </div>
              </div>

              {/* Assigned - desktop */}
              <div className="hidden sm:block rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm col-span-2 sm:col-span-1" style={{ background: '#e67e2210', border: '1px solid #e67e2220' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#e67e22' }}>Assigned</p>
                    <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
                      {properties.filter(p => p.assignedTo?.id).length}
                    </p>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#e67e2220' }}>
                    <UserCheck size={10} className="sm:hidden" style={{ color: '#e67e22' }} />
                    <UserCheck size={12} className="hidden sm:block" style={{ color: '#e67e22' }} />
                  </div>
                </div>
              </div>

              {/* Assigned - mobile */}
              <div className="sm:hidden rounded-lg p-1.5 transition-all hover:shadow-sm col-span-2" style={{ background: '#e67e2210', border: '1px solid #e67e2220' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] font-medium uppercase tracking-wider" style={{ color: '#e67e22' }}>Assigned</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
                      {properties.filter(p => p.assignedTo?.id).length}
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: '#e67e2220' }}>
                    <UserCheck size={10} style={{ color: '#e67e22' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs row with Import/Add buttons on right */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Tabs - scrollable */}
              <div className="tabs-scroll flex items-center gap-0.5 overflow-x-auto pb-1 flex-1 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${tabBtnClass(activeTab === tab.id, tab.color)} px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md min-h-[26px] flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-[11px] leading-none flex-shrink-0`}
                  >
                    <span className="font-medium whitespace-nowrap">{tab.label}</span>
                    <span className={`${tabCountClass(activeTab === tab.id, tab.color)} text-[9px] px-1 py-[1px] rounded-full leading-none`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Desktop Buttons */}
              <div className="hidden lg:flex items-center space-x-2">
                {canImport && (
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all text-xs whitespace-nowrap"
                  >
                    <Upload size={14} />
                    <span>Import</span>
                  </button>
                )}
                {canCreate && (
                  <button
                    onClick={() => { setEditingProperty(null); setShowFormModal(true); }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-all text-xs whitespace-nowrap"
                    style={{ background: NAVY }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ================= END STICKY TOP AREA ================= */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Search / Filter / View mode bar */}
        <div className="bg-white border-b border-gray-200 px-2 sm:px-2 lg:px-2 py-2 sm:py-3 mx-2 sm:mx-4 mt-2 rounded-md overflow-visible">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
            <div className="flex-1 flex items-center gap-1.5 sm:space-x-2">
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="text"
                  placeholder="Search rental properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-[11px] sm:text-xs"
                />
              </div>

              <button
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center justify-center px-2.5 py-1.5 border rounded-md transition-all text-[11px] sm:text-xs font-semibold gap-1.5 ${activeFiltersCount > 0
                  ? 'border-orange-500 bg-orange-50/50 text-orange-700 hover:bg-orange-100/60'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <FilterIcon size={12} className={activeFiltersCount > 0 ? 'text-orange-600' : 'text-gray-400'} />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-1.5 sm:space-x-2">
              {canExport && viewMode === 'grid' && (
                <button
                  onClick={() => handleBulkExport('csv')}
                  disabled={bulkLoading}
                  className="flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-[11px] sm:text-xs disabled:opacity-50"
                >
                  <Download size={12} />
                  <span className="hidden sm:inline ml-2">Export</span>
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedProperties.length > 0 && (canUpdate || canBulkDelete || canExport) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg mt-2 overflow-visible">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:px-2 sm:py-2 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                    <span className="text-xs font-medium text-blue-700 whitespace-nowrap">
                      {selectedProperties.length} selected
                    </span>
                    <button
                      onClick={() => setSelectedProperties([])}
                      className="text-blue-600 hover:text-blue-800 transition-colors sm:hidden"
                      title="Clear selection"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={handleSelectAllPages}
                      className="px-2 sm:px-2.5 py-1 bg-blue-600 text-white rounded text-[10px] sm:text-xs hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {selectedProperties.length === filteredProperties.length && filteredProperties.length > 0 ? 'Unselect All' : 'Select All'}
                    </button>

                    {canAssign && (
                      <>
                        <select
                          value={bulkAssignExecId}
                          onChange={(e) => setBulkAssignExecId(e.target.value)}
                          disabled={bulkLoading}
                          className="px-2 py-1 text-[10px] sm:text-xs border border-gray-300 rounded bg-white text-gray-700 focus:outline-none"
                        >
                          <option value="">Assign Executive...</option>
                          {executives.map(ex => (
                            <option key={ex.id} value={ex.id}>
                              {(`${ex.first_name || ''} ${ex.last_name || ''}`).trim() || ex.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleBulkAssignExecutive}
                          disabled={bulkLoading || !bulkAssignExecId}
                          className="px-2 sm:px-2.5 py-1 bg-[#0f2b3d] text-white rounded text-[10px] sm:text-xs hover:bg-[#1a3f5a] disabled:opacity-50 whitespace-nowrap"
                        >
                          Assign Exec
                        </button>
                        <button
                          onClick={handleBulkUnassignExecutive}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-gray-500 text-white rounded text-[10px] sm:text-xs hover:bg-gray-600 disabled:opacity-50 whitespace-nowrap"
                        >
                          Unassign Exec
                        </button>
                      </>
                    )}

                    {canUpdate && (
                      <>
                        <button
                          onClick={() => handleBulkStatusChange('Available')}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-green-600 text-white rounded text-[10px] sm:text-xs hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <span className="sm:hidden">Available</span>
                          <span className="hidden sm:inline">Mark Available</span>
                        </button>
                        <button
                          onClick={() => handleBulkStatusChange('Leased')}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-purple-600 text-white rounded text-[10px] sm:text-xs hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <span className="sm:hidden">Leased</span>
                          <span className="hidden sm:inline">Mark Leased</span>
                        </button>
                        <button
                          onClick={() => handleBulkVisibility(true)}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-indigo-600 text-white rounded text-[10px] sm:text-xs hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <span className="sm:hidden">Public</span>
                          <span className="hidden sm:inline">Mark Public</span>
                        </button>
                        <button
                          onClick={() => handleBulkVisibility(false)}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-gray-600 text-white rounded text-[10px] sm:text-xs hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <span className="sm:hidden">Private</span>
                          <span className="hidden sm:inline">Mark Private</span>
                        </button>

                        <div className="relative inline-block">
                          <button
                            onClick={() => {
                              setBulkTagsMenuOpen(prev => !prev);
                              setActiveTagPicker(null);
                            }}
                            className="px-2 sm:px-2.5 py-1 bg-gray-800 text-white rounded text-[10px] sm:text-xs hover:bg-gray-900 transition-colors whitespace-nowrap"
                          >
                            Tags
                          </button>

                          {bulkTagsMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => {
                                  setBulkTagsMenuOpen(false);
                                  setActiveTagPicker(null);
                                }}
                              />
                              <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px] sm:min-w-[230px] left-0 sm:right-0 sm:left-auto">
                                <div className="p-2 sm:p-3">
                                  <div className="text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">Bulk Tag Operations</div>
                                  <div className="tag-picker-container">
                                    <TagPickerRow
                                      label="Add"
                                      knownTags={knownTagsAll}
                                      selectedPropertyIds={selectedProperties}
                                      propTags={propTags}
                                      onApply={(tags) => {
                                        handleBulkAddTags(tags);
                                        setBulkTagsMenuOpen(false);
                                        setActiveTagPicker(null);
                                      }}
                                      isOpen={activeTagPicker === 'add'}
                                      onToggle={() => {
                                        if (activeTagPicker && activeTagPicker !== 'add') {
                                          setActiveTagPicker('add');
                                        } else {
                                          setActiveTagPicker(activeTagPicker === 'add' ? null : 'add');
                                        }
                                      }}
                                      onClose={() => setActiveTagPicker(null)}
                                    />
                                    <TagPickerRow
                                      label="Remove"
                                      knownTags={knownTagsAll}
                                      selectedPropertyIds={selectedProperties}
                                      propTags={propTags}
                                      onApply={(tags) => {
                                        handleBulkRemoveTags(tags);
                                        setBulkTagsMenuOpen(false);
                                        setActiveTagPicker(null);
                                      }}
                                      isOpen={activeTagPicker === 'remove'}
                                      onToggle={() => {
                                        if (activeTagPicker && activeTagPicker !== 'remove') {
                                          setActiveTagPicker('remove');
                                        } else {
                                          setActiveTagPicker(activeTagPicker === 'remove' ? null : 'remove');
                                        }
                                      }}
                                      onClose={() => setActiveTagPicker(null)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {canExport && (
                      <button
                        onClick={() => handleBulkExport('csv')}
                        disabled={bulkLoading}
                        className="px-2 sm:px-2.5 py-1 bg-purple-600 text-white rounded text-[10px] sm:text-xs hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        Export
                      </button>
                    )}

                    {canBulkDelete && (
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkLoading}
                        className="px-2 sm:px-2.5 py-1 bg-red-600 text-white rounded text-[10px] sm:text-xs hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProperties([])}
                  className="hidden sm:block text-blue-600 hover:text-blue-800 transition-colors"
                  title="Clear selection"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Listing cards/grid content container */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col mt-2 px-4 pb-4">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading rental properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <Home size={32} className="mx-auto mb-2 opacity-35" />
              <p className="text-xs font-bold">No rental properties found matching search filters.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              {viewMode === 'grid' ? (
                <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-1">
                    {paginatedProperties.map((property) => (
                      <div key={property.id} className="bg-slate-50/20 hover:bg-white rounded-2xl border border-slate-100 hover:border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-visible flex flex-col h-full">
                        {/* Image Section */}
                        <div
                          className="relative overflow-hidden cursor-pointer flex-shrink-0 border-b border-slate-100 rounded-t-2xl"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleViewProperty(property)}
                        >
                          <ImageWithDebug
                            srcCandidate={getFirstDisplayPhotoUrl(property.photos)}
                            alt={dash(property.title)}
                            className="w-full h-36 sm:h-40 rounded-md transition-transform duration-300 ease-out group-hover:scale-105 object-cover object-center"
                          />

                          {/* Checkbox */}
                          <div className="absolute top-2 left-2">
                            <input
                              type="checkbox"
                              checked={selectedProperties.includes(property.id)}
                              onChange={() => handleSelectRow(property.id, !selectedProperties.includes(property.id))}
                              onClick={(e) => e.stopPropagation()}
                              className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 focus:ring-orange-500"
                              style={{ accentColor: '#E6761D' }}
                            />
                          </div>

                          {/* Visibility badge & Tags overlay */}
                          <div className="absolute top-2 right-2 flex max-w-[75%] flex-wrap gap-1 justify-end z-10">
                            <PropertyTags
                              tags={propTags[String(property.id)] || []}
                            />
                            {property.isPublic ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-green-50 text-green-700 ring-1 ring-green-200">
                                PUBLIC
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-red-50 text-red-700 ring-1 ring-red-200">
                                PRIVATE
                              </span>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="absolute bottom-2 left-2">
                            {getStatusBadge(property.status, true)}
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-2 sm:p-2.5 flex flex-col flex-1">
                          {/* Title and ID */}
                          {(() => {
                            const unitAndSubtype = [
                              (property.unitType && property.unitType !== ' - ') ? property.unitType : '',
                              (property.subtype && property.subtype !== ' - ') ? property.subtype : '',
                            ].filter(Boolean).join(' ');

                            const societyName = property.society || '';
                            const leftTitle = [unitAndSubtype, societyName].filter(Boolean).join(' • ') || property.title || 'Property';

                            return (
                              <div className="flex items-start justify-between gap-1.5 mb-1">
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11.5px] font-bold truncate text-[#0f2b3d] cursor-pointer hover:text-orange-600 transition-colors" title={leftTitle} onClick={() => handleViewProperty(property)}>
                                    {unitAndSubtype && <span className="text-[#0f2b3d] hover:text-orange-600">{unitAndSubtype}</span>}
                                    {unitAndSubtype && societyName && <span className="text-gray-400 font-normal mx-1"></span>}
                                    {societyName && <span className=" hover:text-orange-600">{societyName}</span>}
                                    {!unitAndSubtype && !societyName && (property.title || 'Property')}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 text-right">
                                  <span className="text-[9px] font-semibold text-gray-400">
                                    {dash(property.propertyId)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Price & Executive row */}
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <div className="text-sm font-bold truncate text-[#E6761D]">
                              {formatCurrency(property.monthly_rent)}/mo
                            </div>
                            {property.assignedTo && (
                              <div className="flex-shrink-0">
                                <ExecutiveBadge assignedTo={property.assignedTo} />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="space-y-0.5 mb-1.5">
                            <div className="flex items-center justify-between text-[9.5px] text-gray-500 gap-1.5">
                              <div className="flex items-center gap-1 min-w-0">
                                <Building className="flex-shrink-0 text-slate-400 w-3 h-3" />
                                <span className="truncate">
                                  {property.unitType && property.unitType !== ' - ' ? `${property.unitType}` : 'Unit'}
                                  {property.carpetArea ? ` • ${dash(property.carpetArea)} sq ft` : ''}
                                </span>
                              </div>
                              {(() => {
                                const cleanFloorNo = (val: any) => {
                                  if (!val || val === '-' || val === ' - ') return '';
                                  const str = String(val).trim();
                                  const match = str.match(/\d+/);
                                  return match ? match[0] : (str !== '-' ? str : '');
                                };

                                const floorNo = cleanFloorNo(property.floor);
                                const totalNo = cleanFloorNo(property.totalFloors);
                                const hasFloor = Boolean(floorNo || totalNo);

                                return (
                                  <div className="flex items-center gap-0.5 flex-shrink-0 text-right pr-8">
                                    <Layers size={10} className="flex-shrink-0 text-slate-400" />
                                    <span className="font-medium text-gray-500">Floor:</span>
                                    <span className="text-[9.5px] font-bold">
                                      {hasFloor ? (
                                        <>
                                          {totalNo ? <span className="text-red-500 font-bold">{totalNo}</span> : <span className="text-gray-400 font-normal">-</span>}
                                          <span className="text-gray-400 font-normal mx-0.5">/</span>
                                          {floorNo ? <span className="text-green-600 font-bold">{floorNo}</span> : <span className="text-gray-400 font-normal">-</span>}
                                        </>
                                      ) : (
                                        <span className="text-gray-400 font-normal">-/-</span>
                                      )}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>

                            <div className="flex items-center gap-1.5 text-[9.5px] text-gray-500">
                              <MapPin size={10} className="flex-shrink-0 text-slate-400" />
                              <span className="truncate">{[property.location, property.city].filter(Boolean).join(', ') || ' - '}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9.5px] text-gray-500">
                              <User size={10} className="flex-shrink-0 text-slate-400" />
                              <span className="truncate">{dash(property.seller?.name)}</span>
                            </div>
                            {/* Owner badge */}
                            {property.owner?.id && (
                              <div className="flex items-center gap-1 text-[9px] text-gray-500 mb-1">
                                <UserCheck size={9} className="text-orange-500" />
                                <span className="truncate max-w-[120px] font-medium">{property.owner.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Stage and Visits */}
                          <div className="flex items-center justify-between mb-1.5 mt-auto">
                            {getStageBadge(property.stage || '', true)}
                            <div className="flex items-center gap-1 text-[9px] text-gray-400">
                              <Eye size={9} />
                              <span>{viewsMap[String(property.id)]?.total_views ?? 0} views</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 mt-1.5 relative">
                            <button
                              onClick={() => handleViewProperty(property)}
                              className="flex-1 py-1.5 text-[10.5px] font-semibold rounded-lg text-white transition-all hover:opacity-95 shadow-sm active:scale-[0.98]"
                              style={{ background: BRAND }}
                            >
                              View Details
                            </button>
                             <button
                              onClick={() => handleOpenLinkOwnerModal(property)}
                              className={`p-1.5 rounded-lg transition-all flex-shrink-0 flex items-center justify-center border ${
                                property.owner?.id
                                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100/50'
                                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100 border-gray-200'
                              }`}
                              title={property.owner?.id ? `Manage Owner: ${property.owner.name}` : 'Link Owner'}
                            >
                              <Link2 size={13} />
                            </button>
                            <button
                              onClick={() => handleTenantMatching(property)}
                              className="relative flex items-center justify-center w-7 h-7 rounded-lg transition-all text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/50 flex-shrink-0"
                              title="Match Tenants"
                            >
                              <Users size={13} className="text-emerald-600" />
                              <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 flex items-center justify-center rounded-full bg-green-800 text-white text-[8px] font-bold leading-none border-2 border-white shadow-sm">
                                {property.interestedBuyers || (Number(property.id) % 3 + 2)}
                              </span>
                            </button>

                            <div className="relative">
                              <button
                                id={`more-btn-${property.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === property.id ? null : property.id);
                                }}
                                className="p-1.5 rounded-lg transition-all border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-gray-500"
                              >
                                <MoreVertical size={12} />
                              </button>

                              {openDropdownId === property.id && (
                                <div
                                  id={`more-menu-${property.id}`}
                                  className="absolute z-50 bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[120px] py-1"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditProperty(property.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-slate-700 hover:bg-slate-50 w-full text-left"
                                  >
                                    <Edit size={10} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(property.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 w-full text-left"
                                  >
                                    <Trash2 size={10} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto min-h-0 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            className="rounded accent-orange-500"
                            checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        </th>
                        <th className="p-3 w-12 text-center text-xs font-bold text-gray-500">S.No.</th>
                        <th className="p-3 w-20">ID</th>
                        <th className="p-3 min-w-[200px]">Property Details</th>
                        <th className="p-3">Rent (Monthly)</th>
                        <th className="p-3">Deposit</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Visibility</th>
                        <th className="p-3">Executive</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProperties.map((p, idx) => {
                        const isChecked = selectedProperties.includes(p.id);
                        return (
                          <tr key={p.id} className={`border-b last:border-0 hover:bg-slate-50/50 ${isChecked ? 'bg-orange-50/20' : ''}`}>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                className="rounded accent-orange-500"
                                checked={isChecked}
                                onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                              />
                            </td>
                            <td className="p-3 text-center font-semibold text-gray-500 text-xs">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            <td className="p-3 font-bold text-gray-500 uppercase">{dash(p.propertyId)}</td>
                            <td className="p-3">
                              <div>
                                <p className="font-extrabold text-slate-800 text-xs cursor-pointer hover:text-orange-600 transition-colors" onClick={() => handleViewProperty(p)}>{p.title}</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{p.location}, {p.city}</p>
                              </div>
                            </td>
                            <td className="p-3 font-black text-slate-800">
                              {formatCurrency(p.monthly_rent)}
                            </td>
                            <td className="p-3 text-gray-500 font-semibold">
                              {formatCurrency(p.security_deposit)}
                            </td>
                            <td className="p-3">
                              {getStatusBadge(p.status)}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleSingleVisibility(p)}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${p.isPublic
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                                  : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                                  }`}
                              >
                                {p.isPublic ? 'Public' : 'Private'}
                              </button>
                            </td>
                            <td className="p-3 font-semibold text-gray-600">{p.assignedTo?.name || 'Unassigned'}</td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5">
                                 <button
                                   onClick={() => handleTenantMatching(p)}
                                   className="p-1 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                                   title="Match Tenants"
                                 >
                                   <Users size={13} />
                                 </button>
                                <button
                                  onClick={() => handleViewProperty(p)}
                                  className="p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={() => handleEditProperty(p.id)}
                                  className="p-1 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl mt-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span>Showing {filteredProperties.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredProperties.length)} of {filteredProperties.length}</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="ml-2 px-2 py-1 border border-gray-200 rounded-md text-xs font-bold"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={300}>300</option>
                    <option value={400}>400</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                    <option value={999999}>All</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs font-bold text-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                        ? 'bg-[#E6761D] text-white shadow-sm'
                        : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs font-bold text-gray-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forms and Modals */}
      {showFormModal && (
        <RentalPropertyFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingProperty(null);
          }}
          mode={editingProperty ? 'edit' : 'create'}
          propertyId={editingProperty?.id}
          initialData={editingProperty}
          onSubmit={() => loadProperties()}
        />
      )}

      {showFilterModal && (
        <RentalPropertyFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          setFilters={setFilters}
          clearFilters={() => setFilters({
            type: "all",
            subtype: "all",
            city: "all",
            location: "all",
            society: "all",
            seller: "all",
            assignedExecutive: "all",
            status: "all",
            furnishing: "all",
            bedrooms: "all",
            preferredTenants: "all",
            minRent: "",
            maxRent: "",
            minDeposit: "",
            maxDeposit: "",
            dateFrom: "",
            dateTo: "",
            ignoreDate: false,
            sortOrder: "created_desc",
            isPublic: "all",
          })}
          typeOptions={masters['property type'] || masters['property types'] || []}
          subtypeOptions={subtypeOptions}
          cityOptions={cityOptions}
          locationOptions={masters['location'] || masters['locations'] || []}
          societyOptions={societyOptions}
          furnishingOptions={furnishingOptions}
          statusOptions={masters['status'] || masters['property status'] || []}
          sellerOptions={sellers}
          executiveOptions={executives}
        />
      )}

      {showImportModal && (
        <ImportRentalPropertiesModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onDone={() => {
            setShowImportModal(false);
            loadProperties();
          }}
        />
      )}

      {showLinkOwnerModal && linkingPropertyForOwner && (() => {
        const linkedOwnerName = linkingPropertyForOwner.owner?.name || (linkingPropertyForOwner as any).owner_name;
        const linkedOwnerId = linkingPropertyForOwner.owner?.id || (linkingPropertyForOwner as any).owner_id;
        const linkedOwnerPhone = linkingPropertyForOwner.owner?.phone || (linkingPropertyForOwner as any).owner_phone || '';
        const linkedOwnerEmail = linkingPropertyForOwner.owner?.email || (linkingPropertyForOwner as any).owner_email || '';

        const cleanOwnerId = String(linkedOwnerId || '').trim();
        const cleanOwnerName = String(linkedOwnerName || '').trim().replace(/\s+/g, '');
        const hasLinkedOwner = Boolean(
          cleanOwnerId &&
          cleanOwnerId !== '0' &&
          cleanOwnerId !== 'null' &&
          cleanOwnerId !== 'undefined' &&
          cleanOwnerName &&
          cleanOwnerName !== '-' &&
          cleanOwnerName !== '—'
        );

        const getInitials = (name: string) => {
          const cleaned = String(name || '').replace(/^(mr|mrs|ms|dr|miss)\.?\s+/i, '').trim();
          const parts = cleaned.split(/\s+/).filter(Boolean);
          if (parts.length === 0) return 'O';
          if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
          return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        };

        // Format phone with +91 country code
        const formatPhone = (phone: string) => {
          if (!phone) return '';
          const digits = String(phone).replace(/\D/g, '');
          const last10 = digits.slice(-10);
          return `+91 ${last10}`;
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="px-4 py-3 bg-[#0f2b3d] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 flex-shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    {hasLinkedOwner ? (
                      <>
                        <h3 className="text-sm font-bold truncate">Linked Owner: {linkedOwnerName}</h3>
                        <p className="text-[9px] text-emerald-400 font-medium">Currently Associated</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-sm font-bold">Link Owner to Property</h3>
                        <p className="text-[10px] text-white/70 truncate">
                          Property: <span className="font-semibold text-white">{linkingPropertyForOwner.title || `${linkingPropertyForOwner.unitType || ''} ${linkingPropertyForOwner.subtype || ''}`.trim() || 'Property'}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  {hasLinkedOwner && (
                    <button
                      onClick={handleUnlinkOwnerFromProperty}
                      disabled={savingOwnerLink}
                      className="px-2.5 py-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
                    >
                      <UserX size={12} />
                      <span>Unlink Owner</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowLinkOwnerModal(false);
                      setLinkingPropertyForOwner(null);
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {hasLinkedOwner ? (
                /* Linked Owner Details Card - Property ID, phone, email all in one row */
                <div className="p-3 border-b border-gray-100">
                  <div className="p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
                        {getInitials(linkedOwnerName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-gray-800 block truncate">{linkedOwnerName}</span>
                        <div className="flex items-center gap-3 text-[11px] text-gray-600 flex-wrap mt-0.5">
                          <span className="text-gray-500">
                            Property ID: <span className="font-semibold text-[#e67e22]">{linkingPropertyForOwner.propertyId || `REX${String(linkingPropertyForOwner.id).padStart(4, "0")}`}</span>
                          </span>
                          {linkedOwnerPhone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="font-medium text-gray-700">{formatPhone(linkedOwnerPhone)}</span>
                            </span>
                          )}
                          {linkedOwnerEmail && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="font-medium text-gray-700 truncate">{linkedOwnerEmail}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={ownerSearchQuery}
                        onChange={(e) => setOwnerSearchQuery(e.target.value)}
                        placeholder="Search owners by name, phone, email, location..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Owners List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh]">
                    {loadingOwners ? (
                      <div className="py-8 text-center text-xs text-gray-500">Loading owners...</div>
                    ) : filteredOwnersForLink.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-500">
                        {ownerSearchQuery ? 'No owners found matching your search.' : 'No owners available.'}
                      </div>
                    ) : (
                      filteredOwnersForLink.map((owner: any) => {
                        const oId = owner.id || owner.owner_id || owner._id;
                        const isCurrent = linkingPropertyForOwner.owner?.name && String(linkingPropertyForOwner.owner?.name).toLowerCase() === String(owner.name || '').toLowerCase();

                        return (
                          <div
                            key={oId}
                            className="p-2.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all flex items-center justify-between gap-3 bg-white"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                {getInitials(owner.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs text-gray-800 truncate">{owner.name || 'Unnamed Owner'}</span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-green-100 text-green-700">
                                      Currently Linked
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                                  {owner.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone size={10} className="text-gray-400" /> {formatPhone(owner.phone)}
                                    </span>
                                  )}
                                  {owner.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin size={10} className="text-gray-400" /> {owner.location}
                                    </span>
                                  )}
                                  {owner.email && (
                                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                                      <Mail size={10} className="text-gray-400" /> {owner.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleLinkOwnerToProperty(owner)}
                              disabled={savingOwnerLink}
                              className="px-3 py-1.5 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
                            >
                              <Link2 size={12} />
                              <span>{isCurrent ? 'Re-link' : 'Link'}</span>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowLinkOwnerModal(false);
                    setLinkingPropertyForOwner(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showTenantMatching && matchingProperty && (
        <TenantMatchingModal
          isOpen={showTenantMatching}
          onClose={() => {
            setShowTenantMatching(false);
            setMatchingProperty(null);
          }}
          property={matchingProperty}
        />
      )}
    </div>
  );
}
export default RentalPropertiesPage;
