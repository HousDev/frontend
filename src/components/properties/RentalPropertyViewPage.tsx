// src/components/properties/RentalPropertyViewPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { LucideProps } from "lucide-react";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Edit, Eye, Camera, FileText, Users,
  Phone, MessageCircle, Mail, MapPin, Home, Shield, Calendar, Bell, Target,
  TrendingUp, User, Globe, BarChart3, Share2, IndianRupee, KeyRound, Clock,
  CheckCircle2, Building, Layers, Sparkles, AlertCircle, FileCheck
} from 'lucide-react';
import AmenityPill from "../properties/AmenityPill";
import FurnishingPill from '../properties/FurnishingPill';
import PropertyStageModal from './PropertyStageModal';
import PropertyVisitModal from './PropertyVisitModal';
import PropertyInspectionModal from './PropertyInspectionModal';
import PropertyMaintenanceModal from './PropertyMaintenanceModal';
import PropertyReportModal from './PropertyReportModal';
import PropertyBrochureModal from './PropertyBrochureModal';
import PropertyDocumentModal from './PropertyDocumentModal';
import PropertyNegotiationModal from './PropertyNegotiationModal';
import PropertyMediaModal from './PropertyMediaModal';
import PropertyStatusUpdateModal from './PropertyStatusUpdateModal';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import RentalPropertyFormModal from '@/pages/dashboard/components/RentalPropertyFormModal';
import StagesTab from './propertiescomponents/StagesTab';
import VisitsTab from './propertiescomponents/VisitsTab';
import DocumentsTab from './propertiescomponents/DocumentsTab';
import BuyersTab from './propertiescomponents/BuyersTab';
import MarketingTab from './propertiescomponents/MarketingTab';
import NegotiationsTab from './propertiescomponents/NegotiationsTab';
import ReportsTab from './propertiescomponents/ReportsTab';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/utils/permission';
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import { getTagStyle } from "@/lib/tagStyles";
import { toast } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

export interface UIRentalProperty {
  id: number | string;
  propertyId?: string;
  title: string;
  type?: string;
  subtype?: string;
  unitType?: string;
  wing?: string;
  unitNo?: string;
  furnishing?: string;
  facing?: string;
  balcony?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  parkingType?: string;
  parkingQty?: number | string;
  city?: string;
  location?: string;
  society?: string;
  floor?: string | number;
  totalFloors?: string | number;
  carpetArea?: number | string;
  builtupArea?: number | string;
  status: string;
  leadSource?: string;
  source_url?: string;
  address?: string;
  description?: string;
  photos?: any[];
  seller?: {
    id?: number | string;
    name?: string;
    phone?: string;
    email?: string;
  };
  assignedTo?: {
    id?: number | string;
    name?: string;
    phone?: string;
    email?: string;
  };
  stage?: string;
  stageProgress?: number;
  interestedBuyers?: number;
  created_at?: string;
  updated_at?: string;
  isPublic?: boolean;
  amenities?: string[];
  furnishingItems?: string[];
  nearby_places?: Array<{ name: string; distance?: string; type?: string }>;
  tags?: string[];

  // Rental specific fields
  listing_type?: string;
  monthly_rent?: number | string;
  security_deposit?: number | string;
  maintenance_extra?: boolean | number | string;
  maintenance_charge?: number | string;
  preferred_tenants?: string;
  lock_in_period?: number | string;
  agreement_duration?: number | string;
  available_from?: string;
}

interface RentalPropertyViewPageProps {
  property: UIRentalProperty;
  onBack: () => void;
  onEdit?: (property: UIRentalProperty) => void;
  onUpdateProperty?: (property: UIRentalProperty) => void;
}

const formatCurrency = (amount: number | string | undefined | null) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
};

const buildInitialData = (p: any) => ({
  id: p.id,
  seller: p.owner?.name || p.owner_name || p.seller?.name || p.seller_name || '',
  sellerId: p.owner?.id || p.owner_id || p.seller?.id || p.seller_id || '',
  assigned_to: p.assignedTo?.id || p.assigned_to || '',
  propertyType: p.type || p.propertyType || p.property_type_name || '',
  propertySubtype: p.subtype || p.propertySubtype || p.property_subtype_name || '',
  unitType: p.unitType || p.unit_type || '',
  wing: p.wing || '',
  unitNo: p.unitNo || p.unit_no || '',
  furnishing: p.furnishing || '',
  facing: p.facing || '',
  balcony: p.balcony ? String(p.balcony) : '',
  bedrooms: p.bedrooms ? String(p.bedrooms) : '',
  bathrooms: p.bathrooms ? String(p.bathrooms) : '',
  parkingType: p.parkingType || p.parking_type || '',
  parkingQty: String(p.parkingQty ?? p.parking_qty ?? ''),
  city: p.city || p.city_name || '',
  location: p.location || p.location_name || '',
  society: p.society || p.society_name || '',
  floor: String(p.floor ?? ''),
  totalFloors: String(p.totalFloors ?? p.total_floors ?? ''),
  carpetArea: String(p.carpetArea ?? p.carpet_area ?? ''),
  builtupArea: String(p.builtupArea ?? p.builtup_area ?? ''),
  address: p.address || '',
  status: p.status || 'Available',
  leadSource: p.leadSource || p.lead_source || '',
  source_url: p.source_url || p.sourceUrl || '',
  amenities: Array.isArray(p.amenities) ? p.amenities : [],
  furnishingItems: Array.isArray(p.furnishingItems) ? p.furnishingItems : Array.isArray(p.furnishing_items) ? p.furnishing_items : [],
  description: p.description || '',
  nearby_places: Array.isArray(p.nearby_places) ? p.nearby_places : [],
  listing_type: p.listing_type || 'rent',
  monthly_rent: p.monthly_rent || p.monthlyRent || p.budget || '',
  security_deposit: p.security_deposit || p.securityDeposit || '',
  maintenance_extra: p.maintenance_extra === 1 || p.maintenance_extra === '1' || p.maintenance_extra === true,
  maintenance_charge: p.maintenance_charge || p.maintenanceCharge || '',
  preferred_tenants: p.preferred_tenants || p.preferredTenants || '',
  lock_in_period: p.lock_in_period || p.lockInPeriod || '',
  agreement_duration: p.agreement_duration || p.agreementDuration || '',
  available_from: p.available_from || p.availableFrom || '',
});

const PropertyTags = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {tags.slice(0, 10).map((tag, index) => {
        const style = getTagStyle(tag);
        return (
          <span
            key={index}
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ring-1 ${style.bg} ${style.text} ${style.ring}`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};

/* ================= OVERVIEW TAB ================= */
const RentalOverviewTab = ({ property, onUpdate, onOpenGallery }: any) => {
  const [editingRent, setEditingRent] = useState(false);
  const [rentPrice, setRentPrice] = useState(property.monthly_rent || property.budget || 0);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const [showGalleryViewer, setShowGalleryViewer] = useState(false);

  useEffect(() => {
    setRentPrice(property.monthly_rent || property.budget || 0);
  }, [property.monthly_rent, property.budget, property.updated_at]);

  const handleRentUpdate = () => {
    const updatedProperty = {
      ...property,
      monthly_rent: rentPrice,
      budget: rentPrice,
    };
    onUpdate(updatedProperty);
    setEditingRent(false);
    toast.success('Rent updated successfully!');
  };

  const getUrl = (p: any) => (typeof p === 'string' ? p : p?.url || '');
  const isVideo = (p: any) => {
    if (typeof p === 'object' && p?.type === 'video') return true;
    const u = getUrl(p);
    return /\.(mp4|mov|webm|mkv)$/i.test(u) || /youtube\.com|youtu\.be/i.test(u);
  };
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const rawPhotos = Array.isArray(property.photos) ? property.photos : [];
  const mediaList = rawPhotos.filter((p: any) => getUrl(p));
  const effectiveMediaList = mediaList.length
    ? mediaList
    : ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'];
  const currentMedia = effectiveMediaList[selectedMediaIdx] || effectiveMediaList[0];
  const isCurrentVideo = isVideo(currentMedia);

  const renderThumbnail = (mediaIdx: number, className = "", isLastWithMore = false) => {
    const item = effectiveMediaList[mediaIdx];
    const isSelected = mediaIdx === selectedMediaIdx;

    if (!item) {
      return (
        <div
          key={mediaIdx}
          className="rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 gap-1 h-full min-h-[90px] sm:min-h-[110px] lg:min-h-0"
        >
          <Home size={14} className="opacity-40 text-slate-400" />
          <span className="text-[8px] uppercase tracking-wider font-semibold opacity-50">No Photo</span>
        </div>
      );
    }

    const url = getUrl(item);
    const isVid = isVideo(item);
    const hasMoreOverlay = isLastWithMore && effectiveMediaList.length > 7;
    const remainingCount = effectiveMediaList.length - 6;

    return (
      <div
        key={mediaIdx}
        onClick={() => {
          if (hasMoreOverlay) {
            onOpenGallery();
          } else {
            setSelectedMediaIdx(mediaIdx);
          }
        }}
        className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group border-2 ${
          isSelected && !hasMoreOverlay
            ? 'border-[#e67e22] ring-2 ring-[#e67e22]/30 shadow-md scale-[1.01]'
            : 'border-slate-100 hover:border-slate-200 opacity-90 hover:opacity-100 hover:shadow-sm'
        } ${className} bg-slate-900`}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center blur-lg scale-110 opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${url})` }}
        />
        <img
          src={url}
          alt={`Media thumbnail ${mediaIdx + 1}`}
          className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {isVid && (
          <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[10px] text-slate-900 font-bold pl-0.5">
              ▶
            </div>
          </div>
        )}

        {hasMoreOverlay ? (
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/60 to-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-all group-hover:bg-black/75">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white drop-shadow">
              +{remainingCount}
            </span>
            <span className="text-[8px] font-semibold text-white/90 flex items-center gap-0.5 mt-0.5">
              <Camera size={9} /> View All
            </span>
          </div>
        ) : isSelected ? (
          <div className="absolute top-1.5 left-1.5 z-20 bg-[#e67e22] text-white rounded-md text-[7.5px] font-bold shadow-sm tracking-wide uppercase">
            Active
          </div>
        ) : null}
      </div>
    );
  };

  const isMaintExtra = property.maintenance_extra === 1 || property.maintenance_extra === '1' || property.maintenance_extra === true;

  return (
    <div className="space-y-3">
      <div className="flex flex-col xl:flex-row gap-3">
        {/* Left Column */}
        <div className="flex-1 space-y-3 min-w-0">
        
          {/* Modern Split-View Featured Media Showcase */}
          <div className="bg-white rounded-xl border p-2.5 shadow-sm" style={{ borderColor: BD }}>
            <div className={`flex flex-col ${effectiveMediaList.length > 1 ? 'lg:grid lg:grid-cols-4 gap-2.5' : ''}`}>
              {/* Left Side: Main Large Featured Image / Video Player */}
              <div
                onClick={() => {
                  if (effectiveMediaList.length === 1 || !isCurrentVideo) {
                    onOpenGallery();
                  }
                }}
                className={`relative min-w-0 h-[240px] sm:h-[300px] md:h-[350px] lg:h-[380px] rounded-lg overflow-hidden bg-slate-900 group ${
                  effectiveMediaList.length > 1 ? 'lg:col-span-2 cursor-pointer' : 'w-full cursor-pointer'
                }`}
              >
                {isCurrentVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <iframe
                      src={getYouTubeEmbedUrl(getUrl(currentMedia))}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Rental Property Video"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-30 pointer-events-none"
                      style={{ backgroundImage: `url(${getUrl(currentMedia)})` }}
                    />
                    <img
                      src={getUrl(currentMedia)}
                      alt={property.title || 'Rental Property'}
                      className="relative z-10 block w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                )}

                {/* Top Left Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-orange-500 text-white shadow-sm">
                    FOR RENT
                  </span>
                  {property.isPublic ? (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-green-600 text-white shadow-sm backdrop-blur-sm">
                      PUBLIC
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-600 text-white shadow-sm backdrop-blur-sm">
                      PRIVATE
                    </span>
                  )}
                  {property.status && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-white shadow-sm backdrop-blur-sm">
                      {property.status}
                    </span>
                  )}
                </div>

                {/* Top Right Badges */}
                <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1 justify-end z-20">
                  <PropertyTags tags={property.tags || []} />
                </div>

                {/* Navigation Arrows on Main Image */}
                {effectiveMediaList.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMediaIdx((prev) => (prev > 0 ? prev - 1 : effectiveMediaList.length - 1));
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all shadow-md text-lg"
                      type="button"
                      title="Previous Image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMediaIdx((prev) => (prev < effectiveMediaList.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all shadow-md text-lg"
                      type="button"
                      title="Next Image"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Bottom info & Full Gallery Button */}
                <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-2">
                  <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-medium rounded-lg backdrop-blur-sm shadow-sm">
                    {selectedMediaIdx + 1} / {effectiveMediaList.length}
                  </span>
                  <button
                    className="flex items-center gap-1 px-2.5 py-1 bg-black/60 hover:bg-black/85 text-white text-[10px] font-semibold rounded-lg transition backdrop-blur-sm shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenGallery();
                    }}
                    title="Open Full Media Gallery"
                  >
                    <Camera size={12} />
                    <span>Gallery</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Dynamic Media Grid */}
              {effectiveMediaList.length > 1 && (
                <div className="lg:col-span-2 flex flex-col gap-2 h-full max-h-[380px]">
                  {(() => {
                    const totalThumbnails = effectiveMediaList.length - 1;

                    if (totalThumbnails === 1) {
                      return <div className="h-full">{renderThumbnail(1, "h-full")}</div>;
                    }
                    if (totalThumbnails === 2) {
                      return (
                        <div className="grid grid-rows-2 gap-2 h-full">
                          {renderThumbnail(1, "h-full")}
                          {renderThumbnail(2, "h-full")}
                        </div>
                      );
                    }
                    if (totalThumbnails === 3) {
                      return (
                        <div className="grid grid-cols-3 gap-2 h-full">
                          {renderThumbnail(1, "h-full")}
                          {renderThumbnail(2, "h-full")}
                          {renderThumbnail(3, "h-full")}
                        </div>
                      );
                    }
                    if (totalThumbnails === 4) {
                      return (
                        <div className="flex flex-col gap-2 h-full">
                          <div className="grid grid-cols-2 gap-2 h-[186px]">
                            {renderThumbnail(1, "h-full")}
                            {renderThumbnail(2, "h-full")}
                          </div>
                          <div className="grid grid-cols-2 gap-2 h-[186px]">
                            {renderThumbnail(3, "h-full")}
                            {renderThumbnail(4, "h-full")}
                          </div>
                        </div>
                      );
                    }
                    if (totalThumbnails === 5) {
                      return (
                        <div className="flex flex-col gap-2 h-full">
                          <div className="grid grid-cols-2 gap-2 h-[186px]">
                            {renderThumbnail(1, "h-full")}
                            {renderThumbnail(2, "h-full")}
                          </div>
                          <div className="grid grid-cols-3 gap-2 h-[186px]">
                            {renderThumbnail(3, "h-full")}
                            {renderThumbnail(4, "h-full")}
                            {renderThumbnail(5, "h-full")}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-2 h-full">
                        <div className="grid grid-cols-3 gap-2 h-[186px]">
                          {renderThumbnail(1, "h-full")}
                          {renderThumbnail(2, "h-full")}
                          {renderThumbnail(3, "h-full")}
                        </div>
                        <div className="grid grid-cols-3 gap-2 h-[186px]">
                          {renderThumbnail(4, "h-full")}
                          {renderThumbnail(5, "h-full")}
                          {renderThumbnail(6, "h-full", true)}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="bg-white rounded-lg border p-2" style={{ borderColor: BD }}>
            <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Quick Info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-lg p-2" style={{ background: `${N}05` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MU }}>Monthly Rent</p>
                    {editingRent ? (
                      <input type="number" value={rentPrice} onChange={(e) => setRentPrice(Number(e.target.value))}
                        className="text-sm font-bold border-b bg-transparent w-24 focus:outline-none" style={{ borderColor: O }}
                        onBlur={handleRentUpdate} onKeyDown={(e) => e.key === 'Enter' && handleRentUpdate()} autoFocus />
                    ) : (
                      <p className="text-sm font-bold cursor-pointer hover:opacity-80" style={{ color: O }} onClick={() => setEditingRent(true)}>
                        {formatCurrency(rentPrice)}/mo
                      </p>
                    )}
                  </div>
                  <IndianRupee size={14} style={{ color: O }} />
                </div>
              </div>
              <div className="rounded-lg p-2" style={{ background: `${N}05` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MU }}>Security Deposit</p>
                    <p className="text-sm font-bold" style={{ color: O }}>{formatCurrency(property?.security_deposit)}</p>
                  </div>
                  <KeyRound size={14} style={{ color: O }} />
                </div>
              </div>
              <div className="rounded-lg p-2" style={{ background: `${N}05` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MU }}>Maintenance</p>
                    <p className="text-xs font-bold text-slate-800">
                      {isMaintExtra
                        ? (property.maintenance_charge ? `${formatCurrency(property.maintenance_charge)}/mo` : 'Extra')
                        : 'Included'}
                    </p>
                  </div>
                  <Building size={14} className="text-slate-500" />
                </div>
              </div>
              <div className="rounded-lg p-2" style={{ background: `${N}05` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MU }}>Interested Tenants</p>
                    <p className="text-sm font-bold" style={{ color: '#8b5cf6' }}>{property.interestedBuyers || 0}</p>
                  </div>
                  <Users size={14} style={{ color: '#8b5cf6' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details — ALL FIELDS with DIFFERENT COLORS */}
          <div className="bg-white rounded-lg border p-2" style={{ borderColor: BD }}>
            <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Property & Lease Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 text-[10px]">
              
              {/* Landlord - Blue */}
              <div className="p-1.5 rounded" style={{ background: '#3b82f610', border: '1px solid #3b82f620' }}>
                <div className="text-[8px] font-medium" style={{ color: '#3b82f6' }}>Landlord</div>
                <div className="font-medium truncate" style={{ color: N }}>{property.seller?.name || "-"}</div>
              </div>
              
              {/* Property Type - Purple */}
              <div className="p-1.5 rounded" style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}>
                <div className="text-[8px] font-medium" style={{ color: '#8b5cf6' }}>Property Type</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.type || "-"}</div>
              </div>
              
              {/* Property Subtype - Pink */}
              <div className="p-1.5 rounded" style={{ background: '#ec489910', border: '1px solid #ec489920' }}>
                <div className="text-[8px] font-medium" style={{ color: '#ec4899' }}>Property Subtype</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.subtype || "-"}</div>
              </div>
              
              {/* Unit Type - Green */}
              <div className="p-1.5 rounded" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
                <div className="text-[8px] font-medium" style={{ color: '#10b981' }}>Unit Type</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.unitType || "-"}</div>
              </div>
              
              {/* Wing - Cyan */}
              <div className="p-1.5 rounded" style={{ background: '#06b6d410', border: '1px solid #06b6d420' }}>
                <div className="text-[8px] font-medium" style={{ color: '#06b6d4' }}>Wing</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.wing || "-"}</div>
              </div>
              
              {/* Unit No - Teal */}
              <div className="p-1.5 rounded" style={{ background: '#14b8a610', border: '1px solid #14b8a620' }}>
                <div className="text-[8px] font-medium" style={{ color: '#14b8a6' }}>Unit No</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.unitNo || "-"}</div>
              </div>
              
              {/* Furnishing - Amber */}
              <div className="p-1.5 rounded" style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}>
                <div className="text-[8px] font-medium" style={{ color: '#f59e0b' }}>Furnishing</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.furnishing || "-"}</div>
              </div>
              
              {/* Facing - Orange (Theme) */}
              <div className="p-1.5 rounded" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                <div className="text-[8px] font-medium" style={{ color: O }}>Facing</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.facing || "-"}</div>
              </div>
              
              {/* Bedrooms - Red */}
              <div className="p-1.5 rounded" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
                <div className="text-[8px] font-medium" style={{ color: '#ef4444' }}>Bedrooms</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.bedrooms || "-"}</div>
              </div>
              
              {/* Bathrooms - Rose */}
              <div className="p-1.5 rounded" style={{ background: '#f43f5e10', border: '1px solid #f43f5e20' }}>
                <div className="text-[8px] font-medium" style={{ color: '#f43f5e' }}>Bathrooms</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.bathrooms || "-"}</div>
              </div>
              
              {/* Balcony - Yellow */}
              <div className="p-1.5 rounded" style={{ background: '#eab30810', border: '1px solid #eab30820' }}>
                <div className="text-[8px] font-medium" style={{ color: '#eab308' }}>Balcony</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.balcony || "-"}</div>
              </div>
              
              {/* Society - Indigo */}
              <div className="p-1.5 rounded" style={{ background: '#6366f110', border: '1px solid #6366f120' }}>
                <div className="text-[8px] font-medium" style={{ color: '#6366f1' }}>Society</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.society || "-"}</div>
              </div>
              
              {/* City - Sky */}
              <div className="p-1.5 rounded" style={{ background: '#0ea5e910', border: '1px solid #0ea5e920' }}>
                <div className="text-[8px] font-medium" style={{ color: '#0ea5e9' }}>City</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.city || "-"}</div>
              </div>
              
              {/* Location - Lime */}
              <div className="p-1.5 rounded" style={{ background: '#84cc1610', border: '1px solid #84cc1620' }}>
                <div className="text-[8px] font-medium" style={{ color: '#84cc16' }}>Location</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.location || "-"}</div>
              </div>

              {/* Floor - Stone */}
              <div className="p-1.5 rounded" style={{ background: '#78716c10', border: '1px solid #78716c20' }}>
                <div className="text-[8px] font-medium" style={{ color: '#78716c' }}>Floor</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.floor || "-"}</div>
              </div>
              
              {/* Total Floors - Zinc */}
              <div className="p-1.5 rounded" style={{ background: '#71717a10', border: '1px solid #71717a20' }}>
                <div className="text-[8px] font-medium" style={{ color: '#71717a' }}>Total Floors</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.totalFloors || "-"}</div>
              </div>
              
              {/* Carpet Area - Emerald */}
              <div className="p-1.5 rounded" style={{ background: '#05966910', border: '1px solid #05966920' }}>
                <div className="text-[8px] font-medium" style={{ color: '#059669' }}>Carpet Area</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.carpetArea ? `${property.carpetArea} sq ft` : "-"}</div>
              </div>
              
              {/* Built-up Area - Violet */}
              <div className="p-1.5 rounded" style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}>
                <div className="text-[8px] font-medium" style={{ color: '#8b5cf6' }}>Built-up Area</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.builtupArea ? `${property.builtupArea} sq ft` : "-"}</div>
              </div>

              {/* Monthly Rent - Orange Theme */}
              <div className="p-1.5 rounded" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                <div className="text-[8px] font-medium" style={{ color: O }}>Monthly Rent</div>
                <div className="font-medium" style={{ color: O }}>{formatCurrency(property?.monthly_rent || property?.budget)}/mo</div>
              </div>

              {/* Security Deposit - Orange Dark */}
              <div className="p-1.5 rounded" style={{ background: `${O}15`, border: `1px solid ${O}30` }}>
                <div className="text-[8px] font-medium" style={{ color: O }}>Security Deposit</div>
                <div className="font-medium" style={{ color: O }}>{formatCurrency(property?.security_deposit)}</div>
              </div>

              {/* Preferred Tenants - Purple */}
              <div className="p-1.5 rounded" style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}>
                <div className="text-[8px] font-medium" style={{ color: '#8b5cf6' }}>Preferred Tenants</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.preferred_tenants || "Any"}</div>
              </div>

              {/* Lock-in Period - Cyan */}
              <div className="p-1.5 rounded" style={{ background: '#06b6d410', border: '1px solid #06b6d420' }}>
                <div className="text-[8px] font-medium" style={{ color: '#06b6d4' }}>Lock-in Period</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.lock_in_period ? `${property.lock_in_period} Months` : "-"}</div>
              </div>

              {/* Agreement Duration - Teal */}
              <div className="p-1.5 rounded" style={{ background: '#14b8a610', border: '1px solid #14b8a620' }}>
                <div className="text-[8px] font-medium" style={{ color: '#14b8a6' }}>Agreement Duration</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.agreement_duration ? `${property.agreement_duration} Months` : "-"}</div>
              </div>

              {/* Available From - Blue */}
              <div className="p-1.5 rounded" style={{ background: '#3b82f610', border: '1px solid #3b82f620' }}>
                <div className="text-[8px] font-medium" style={{ color: '#3b82f6' }}>Available From</div>
                <div className="font-medium truncate" style={{ color: N }}>
                  {property?.available_from
                    ? new Date(property.available_from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : "Immediate"}
                </div>
              </div>

              {/* Lead Source - Rose */}
              <div className="p-1.5 rounded" style={{ background: '#f43f5e10', border: '1px solid #f43f5e20' }}>
                <div className="text-[8px] font-medium" style={{ color: '#f43f5e' }}>Lead Source</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.leadSource || "-"}</div>
              </div>

              {/* Source URL - Indigo */}
              {property?.source_url && (
                <div className="p-1.5 rounded" style={{ background: '#6366f110', border: '1px solid #6366f120' }}>
                  <div className="text-[8px] font-medium" style={{ color: '#6366f1' }}>Source URL</div>
                  <div className="font-medium truncate" style={{ color: N }}>
                    <a
                      href={property.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-650 hover:text-blue-800 underline inline-flex items-center gap-0.5 cursor-pointer font-semibold"
                      title={property.source_url}
                    >
                      Open Source Link ↗
                    </a>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="p-1.5 rounded" style={{ background: property.status === 'Available' ? '#10b98110' : '#f59e0b10', border: `1px solid ${property.status === 'Available' ? '#10b98120' : '#f59e0b20'}` }}>
                <div className="text-[8px] font-medium" style={{ color: property.status === 'Available' ? '#10b981' : '#f59e0b' }}>Status</div>
                <div className="font-medium" style={{ color: property.status === 'Available' ? '#10b981' : '#f59e0b' }}>{property?.status || "-"}</div>
              </div>

              {/* Address - Slate (Full Width) */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-4 p-1.5 rounded" style={{ background: '#64748b10', border: '1px solid #64748b20' }}>
                <div className="text-[8px] font-medium" style={{ color: '#64748b' }}>Address</div>
                <div className="font-medium truncate" style={{ color: N }}>{property?.address || "-"}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-lg border p-2.5" style={{ borderColor: BD }}>
              <h3 className="text-[11px] font-semibold mb-1" style={{ color: N }}>Description</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Amenities & Furnishing Items */}
          {((property.amenities && property.amenities.length > 0) || (property.furnishingItems && property.furnishingItems.length > 0)) && (
            <div className="bg-white rounded-lg border p-2.5 space-y-3" style={{ borderColor: BD }}>
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold mb-1.5" style={{ color: N }}>Amenities</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {property.amenities.map((a: string, i: number) => (
                      <AmenityPill key={i} name={a} />
                    ))}
                  </div>
                </div>
              )}

              {property.furnishingItems && property.furnishingItems.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold mb-1.5" style={{ color: N }}>Furnishing Items Included</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {property.furnishingItems.map((f: string, i: number) => (
                      <FurnishingPill key={i} name={f} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full xl:w-72 space-y-3 flex-shrink-0">
          {/* Landlord / Owner Details Card */}
          {(() => {
            const ownerName = (property as any).owner?.name || (typeof (property as any).seller === 'object' ? (property as any).seller?.name : null) || null;
            const ownerPhone = (property as any).owner?.phone || (typeof (property as any).seller === 'object' ? (property as any).seller?.phone : null) || null;
            const ownerEmail = (property as any).owner?.email || (typeof (property as any).seller === 'object' ? (property as any).seller?.email : null) || null;
            const ownerLocation = (property as any).owner?.location || (property as any).location || null;

            return (
              <div className="rounded-lg p-2.5 animate-fade-in" style={{ background: 'linear-gradient(135deg, #3b82f608 0%, #3b82f615 100%)', border: '1px solid #3b82f630' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#3b82f620' }}>
                    <User size={12} style={{ color: '#3b82f6' }} />
                  </div>
                  <h3 className="text-[11px] font-bold" style={{ color: '#3b82f6' }}>Owner Information</h3>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#3b82f608' }}>
                    <User size={10} style={{ color: '#3b82f6' }} />
                    <span className="font-semibold" style={{ color: N }}>{ownerName || "-"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#3b82f608' }}>
                    <Phone size={10} style={{ color: '#3b82f6' }} />
                    <span style={{ color: MU }}>{ownerPhone || "Not Available"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#3b82f608' }}>
                    <Mail size={10} style={{ color: '#3b82f6' }} />
                    <span style={{ color: MU }}>{ownerEmail || "Not Available"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#3b82f608' }}>
                    <MapPin size={10} style={{ color: '#3b82f6' }} />
                    <span style={{ color: MU }}>{ownerLocation || "-"}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Assigned Executive Card */}
          <div className="rounded-lg p-2.5 animate-fade-in" style={{ background: 'linear-gradient(135deg, #e67e2208 0%, #e67e2215 100%)', border: '1px solid #e67e2230' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#e67e2220' }}>
                <User size={12} style={{ color: O }} />
              </div>
              <h3 className="text-[11px] font-bold" style={{ color: O }}>Executive Information</h3>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#e67e2208' }}>
                <User size={10} style={{ color: O }} />
                <span className="font-semibold" style={{ color: N }}>{property.assignedTo?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#e67e2208' }}>
                <Phone size={10} style={{ color: O }} />
                <span style={{ color: MU }}>{property.assignedTo?.phone || "Not Available"}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#e67e2208' }}>
                <Mail size={10} style={{ color: O }} />
                <span style={{ color: MU }}>{property.assignedTo?.email || "Not Available"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN RENTAL VIEW PAGE ================= */
const RentalPropertyViewPage: React.FC<RentalPropertyViewPageProps> = ({
  property,
  onBack,
  onEdit,
  onUpdateProperty,
}) => {
  const { user } = useAuth();
  const canUpdate = can(user, 'property.update');

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [propertyData, setPropertyData] = useState<UIRentalProperty>(property);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loadingStatusHistory, setLoadingStatusHistory] = useState(false);

  useEffect(() => {
    if (property) {
      setPropertyData(property);
    }
  }, [property]);

  useEffect(() => {
    const fetchFullDetails = async () => {
      if (!property?.id) return;
      try {
        const res = await rentalPropertiesAPI.getProperty(String(property.id));
        if (res && res.success && res.data) {
          setPropertyData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch full property details:", err);
      }
    };
    fetchFullDetails();
  }, [property?.id]);

  const fetchStatusHistory = async () => {
    if (!propertyData.id) return;
    setLoadingStatusHistory(true);
    try {
      const response = await rentalPropertiesAPI.getStatusHistory(String(propertyData.id));
      if (response.success) {
        setStatusHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch rental status history:', error);
    } finally {
      setLoadingStatusHistory(false);
    }
  };

  useEffect(() => {
    fetchStatusHistory();
  }, [propertyData.id]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'stages', label: 'Stages & Progress', icon: TrendingUp },
    { id: 'visits', label: 'Visits & Inspection', icon: Eye },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'buyers', label: 'Tenant Interest', icon: Users },
    { id: 'marketing', label: 'Marketing', icon: Globe },
    { id: 'negotiations', label: 'Negotiations', icon: Target },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(propertyData);
    } else {
      setShowEditModal(true);
    }
  };

  return (
    <div className="h-[91.7vh] flex flex-col bg-gray-50 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Back to Rental Properties"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {(() => {
                    const p: any = propertyData;
                    const idText = p.propertyId || `RENT-${p.id}`;
                    const typeName = p.type || p.propertyType || p.property_type_name;
                    const subtypeName = p.subtype || p.propertySubtype || p.property_subtype_name;
                    const unitTypeName = p.unitType || p.unit_type;
                    const societyName = p.society || p.society_name;
                    
                    const infoParts = [
                      idText,
                      typeName,
                      subtypeName,
                      unitTypeName,
                      societyName
                    ].filter(Boolean);
                    
                    return infoParts.join(" • ");
                  })()}
                </span>
                {propertyData.isPublic && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-green-50 text-green-700 ring-1 ring-green-200">
                    PUBLIC
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 truncate max-w-xl">
                {propertyData.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStatusUpdateModal(true)}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 shadow-xs"
              style={{ background: N }}
            >
              Update Status
            </button>
            
            {canUpdate && (
              <button
                onClick={handleEditClick}
                className="px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90 shadow-xs flex items-center gap-1.5"
                style={{ background: O }}
              >
                <Edit size={13} />
                Edit Listing
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-bold ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                style={isActive ? { background: O } : {}}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <RentalOverviewTab
            property={propertyData}
            onUpdate={(updated: any) => {
              setPropertyData(updated);
              onUpdateProperty?.(updated);
            }}
            onOpenGallery={() => setShowMediaModal(true)}
          />
        )}

        {activeTab === 'stages' && (
          <StagesTab
            property={propertyData as any}
            stages={[
              { id: 'initial_contact', label: 'Initial Contact', progress: 15, description: 'First contact with landlord', tasks: ['Call landlord', 'Gather requirements'], nextStage: 'property_listing' },
              { id: 'property_listing', label: 'Property Listing', progress: 35, description: 'Collect rental details and media', tasks: ['Photoshoot', 'Document verification'], nextStage: 'tenant_screening' },
              { id: 'tenant_screening', label: 'Tenant Screening', progress: 60, description: 'Screening prospective tenants', tasks: ['Tenant visits', 'Background check'], nextStage: 'lease_agreement' },
              { id: 'lease_agreement', label: 'Lease Agreement', progress: 80, description: 'Drafting & signing lease', tasks: ['Draft agreement', 'Stamp duty'], nextStage: 'deposit_received' },
              { id: 'deposit_received', label: 'Deposit Received', progress: 95, description: 'Security deposit paid', tasks: ['Collect deposit', 'Advance rent'], nextStage: 'handed_over' },
              { id: 'handed_over', label: 'Keys Handed Over', progress: 100, description: 'Keys & possession handed over', tasks: ['Inventory check', 'Keys handover'], nextStage: null },
            ]}
            onStageUpdate={async (newStage: string) => {
              const updated = { ...propertyData, stage: newStage };
              setPropertyData(updated);
              onUpdateProperty?.(updated);
            }}
            onShowStageModal={() => {}}
            statusHistory={statusHistory}
            loadingStatusHistory={loadingStatusHistory}
            onRefreshHistory={fetchStatusHistory}
          />
        )}

        {activeTab === 'visits' && (
          <VisitsTab property={propertyData as any} onScheduleVisit={() => {}} onStartInspection={() => {}} onMaintenanceSuggestions={() => {}} onGenerateReport={() => {}} />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab property={propertyData as any} onCreateDocument={() => {}} />
        )}

        {activeTab === 'buyers' && (
          <BuyersTab property={propertyData as any} onMatchBuyers={() => {}} />
        )}

        {activeTab === 'marketing' && (
          <MarketingTab property={propertyData as any} onCreateBrochure={() => {}} onShareProperty={() => {}} onManageMedia={() => setShowMediaModal(true)} onPublishProperty={() => {}} />
        )}

        {activeTab === 'negotiations' && (
          <NegotiationsTab property={propertyData as any} onStartNegotiation={() => {}} />
        )}

        {activeTab === 'reports' && <ReportsTab property={propertyData as any} />}
      </div>

      {/* Edit Form Modal */}
      {showEditModal && (
        <RentalPropertyFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          mode="edit"
          propertyId={propertyData.id}
          initialData={buildInitialData(propertyData)}
          onSubmit={async () => {
            setShowEditModal(false);
            toast.success('Rental property updated');
            // Reload fresh data from server
            try {
              const res = await rentalPropertiesAPI.getProperty(String(propertyData.id));
              if (res.success && res.data) {
                setPropertyData(res.data);
                onUpdateProperty?.(res.data);
              }
            } catch {
              // silently fail - data will refresh on next load
            }
          }}
        />
      )}

      {/* Media Modal */}
      {showMediaModal && (
        <PropertyMediaModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          property={propertyData as any}
          onUpdate={(updated: any) => setPropertyData(prev => ({ ...prev, ...updated }))}
        />
      )}

      {/* Status Update Modal */}
      {showStatusUpdateModal && (
        <PropertyStatusUpdateModal
          isOpen={showStatusUpdateModal}
          onClose={() => setShowStatusUpdateModal(false)}
          property={propertyData as any}
          onStatusUpdate={(data: any) => {
            const newStatus = data?.status || propertyData.status;
            const updated = { ...propertyData, status: newStatus };
            setPropertyData(updated);
            onUpdateProperty?.(updated);
            fetchStatusHistory();
          }}
        />
      )}
    </div>
  );
};

export default RentalPropertyViewPage;
