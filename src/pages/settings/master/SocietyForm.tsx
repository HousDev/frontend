// SocietyForm.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Upload,
  Download,
  X,
  Save,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Building2,
  ChevronDown as ChevronDownIcon,
  Image,
  Trash2,
  Loader2,
  Video,
  Tag,
  ChevronsDown,
  ChevronsUp,
  GripVertical,
} from "lucide-react";
import * as XLSX from "xlsx";
import { societyAPI } from "@/lib/societyAPI";
import { masterDataAPI } from "@/lib/mastersAPI";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import Dropdown from "@/components/ui/Dropdown";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { SocietyImportModal } from "./SocietyImportModal";

const getYouTubeEmbedUrl = (url: string): string | null => {
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

export interface SocietyImageItem {
  url: string;
  label: string;
  type: "image" | "video";
}

export interface SocietySubmitPayload {
  societyName: string;
  locality: string;
  city: string;
  pincode: string;
  amenities: string[];
  imageUrls: SocietyImageItem[];
}

export interface SocietyInitialData {
  societyName: string;
  locality: string;
  city: string;
  pincode: string;
  amenities?: string[];
  imageUrls?: (string | SocietyImageItem)[];
}
interface SocietyFormData {
  societyName: string;
  locality: string;
  city: string;
  pincode: string;
  amenities?: string[];
  images?: File[];
  imageUrls?: string[];
}

interface ImportValidationResult {
  data: SocietyFormData;
  isValid: boolean;
  isDuplicate?: boolean;
  errors: string[];
  rowNumber: number;
}

interface SocietyFormProps {
  initialData?: SocietyInitialData | null;
  onSubmit: (data: SocietySubmitPayload) => Promise<void>;
  onClose: () => void;
  isEditing?: boolean;
  onRefresh?: () => Promise<void>;
}

// Helper function to get scroll parents
function getScrollParents(node: Element | null): Element[] {
  const parents: Element[] = [];
  let el = node?.parentElement || null;
  while (el) {
    const style = window.getComputedStyle(el);
    const oy = style.overflowY;
    if (oy === "auto" || oy === "scroll" || el === document.body)
      parents.push(el);
    el = el.parentElement;
  }
  return parents;
}

// Multi-Select Amenities Dropdown Component
const AmenitiesMultiSelect: React.FC<{
  options: MasterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  label: string;
  placeholder?: string;
}> = ({
  options,
  selectedValues,
  onToggle,
  label,
  placeholder = "Select amenities...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const filteredOptions = useMemo(
    () =>
      options.filter((o) =>
        (o.label || "").toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [options, searchTerm],
  );

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(
        (opt) => String(opt.value) === String(selectedValues[0]),
      );
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} items selected`;
  }, [selectedValues, options, placeholder]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setIsOpen(false);
      setSearchTerm("");
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const updateRect = () => {
    if (!buttonRef.current) return setRect(null);
    setRect(buttonRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (!isOpen) return;
    updateRect();
    const onResize = () => updateRect();
    const onScroll = () => updateRect();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    const parents = getScrollParents(buttonRef.current);
    parents.forEach((p) => p.addEventListener("scroll", onScroll, true));
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      parents.forEach((p) => p.removeEventListener("scroll", onScroll, true));
    };
  }, [isOpen]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen]);

  const getPortalTarget = () => {
    if (typeof document === "undefined") return null;
    return document.getElementById("modal-portal") || document.body;
  };

  const isModalPortal =
    typeof document !== "undefined" &&
    !!document.getElementById("modal-portal");
  const Z = isModalPortal ? 1050 : 9999999;

  const popupStyle: any = rect
    ? {
        position: "fixed",
        zIndex: Z,
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        maxHeight: "50vh",
        overflow: "hidden",
        pointerEvents: "auto",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        borderRadius: "8px",
      }
    : {
        position: "fixed",
        zIndex: Z,
        top: 0,
        left: 0,
        minWidth: 200,
        pointerEvents: "auto",
      };

  const popup = (
    <div
      ref={dropdownRef}
      className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
      style={popupStyle}
    >
      <div className="p-2.5 border-b border-gray-100 bg-gray-50">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search amenities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <p className="text-xs text-gray-400 p-3 text-center">
            No amenities found
          </p>
        ) : (
          filteredOptions.map((option) => (
            <label
              key={String(option.value)}
              className="flex items-center px-3 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedValues
                  .map(String)
                  .includes(String(option.value))}
                onChange={() => onToggle(String(option.value))}
                className="mr-2.5 h-3.5 w-3.5 rounded border-gray-300 accent-orange-500"
              />
              <span className="text-xs text-gray-700">{option.label}</span>
            </label>
          ))
        )}
      </div>
      {selectedValues.length > 0 && (
        <div className="px-3 py-1.5 bg-orange-50 border-t border-orange-100 text-[10px] text-orange-600 font-bold">
          {selectedValues.length} selected
        </div>
      )}
    </div>
  );

  const portalTarget =
    typeof document !== "undefined" ? getPortalTarget() : null;

  return (
    <div className="relative">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
        {label}
      </label>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((p) => !p);
          setTimeout(updateRect, 0);
        }}
        className="w-full h-9 px-3 rounded-lg text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-all flex items-center justify-between text-left"
      >
        <span
          className={`truncate ${selectedValues.length === 0 ? "text-gray-400" : "text-gray-800"}`}
        >
          {displayText}
        </span>
        <ChevronDownIcon
          size={12}
          className="text-gray-400 flex-shrink-0 ml-1"
        />
      </button>
      {isOpen &&
        buttonRef.current &&
        portalTarget &&
        createPortal(popup, portalTarget)}
    </div>
  );
};

const ImageLabelDropdown: React.FC<{
  value: string;
  options: MasterOption[];
  onChange: (label: string) => void;
}> = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setIsOpen(false);
      setSearchTerm("");
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const updateRect = () => {
    if (!buttonRef.current) return setRect(null);
    setRect(buttonRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (!isOpen) return;
    updateRect();
    const onResize = () => updateRect();
    const onScroll = () => updateRect();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    const parents = getScrollParents(buttonRef.current);
    parents.forEach((p) => p.addEventListener("scroll", onScroll, true));
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      parents.forEach((p) => p.removeEventListener("scroll", onScroll, true));
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getPortalTarget = () => {
    if (typeof document === "undefined") return null;
    return document.getElementById("modal-portal") || document.body;
  };

  const isModalPortal =
    typeof document !== "undefined" &&
    !!document.getElementById("modal-portal");
  const Z = isModalPortal ? 1050 : 9999999;

  const MAX_H = 300;
  const popupStyle: React.CSSProperties = rect
    ? (() => {
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldOpenUpward = spaceBelow < 200 && spaceAbove > spaceBelow;
        return {
          position: "fixed",
          zIndex: Z,
          top: shouldOpenUpward
            ? rect.top + window.scrollY - Math.min(spaceAbove - 10, MAX_H) - 4
            : rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          minWidth: 140,
          maxWidth: 170,
          maxHeight: shouldOpenUpward
            ? Math.min(spaceAbove - 10, MAX_H)
            : Math.min(spaceBelow - 10, MAX_H),
          overflow: "hidden",
          pointerEvents: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          borderRadius: "8px",
        };
      })()
    : {
        position: "fixed",
        zIndex: Z,
        top: 0,
        left: 0,
        minWidth: 140,
        maxWidth: 170,
        pointerEvents: "auto",
      };

  const selectedLabel =
    options.find((o) => o.label === value)?.label || value || "No label";

  const filteredOptions = useMemo(
    () =>
      options.filter((o) =>
        (o.label || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [options, searchTerm]
  );

  const showNoLabel =
    !searchTerm || "no label".includes(searchTerm.toLowerCase());

  const popup = (
    <div
      ref={dropdownRef}
      className="bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden"
      style={popupStyle}
    >
      <div className="p-1.5 border-b border-gray-100 bg-gray-50 flex items-center shrink-0">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search label..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-1.5 py-0.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
        />
      </div>
      <div className="overflow-y-auto py-1 flex-1 max-h-[240px]">
        {showNoLabel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setIsOpen(false);
              setSearchTerm("");
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:bg-orange-50 transition-colors"
          >
            No label
          </button>
        )}
        {filteredOptions.length === 0 && !showNoLabel ? (
          <p className="px-3 py-2 text-[11px] text-gray-400 text-center">
            No options found
          </p>
        ) : (
          filteredOptions.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.label);
                setIsOpen(false);
                setSearchTerm("");
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-orange-50 transition-colors truncate"
            >
              {opt.label}
            </button>
          ))
        )}
      </div>
    </div>
  );

  const portalTarget =
    typeof document !== "undefined" ? getPortalTarget() : null;

  const hasLabel = !!value;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((p) => !p);
          setTimeout(updateRect, 0);
        }}
        className={`w-full flex items-center justify-between gap-1 px-1.5 py-[2px] rounded-md text-[9px] font-semibold outline-none border transition-all ${
          hasLabel
            ? "bg-orange-50 border-[#dbb393] text-gray-500 hover:bg-[#f6c195]"
            : "bg-white/15 border-white/25 text-white/90 hover:bg-white/25"
        }`}
      >
        <span className="flex items-center gap-1 min-w-0">
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronDown size={10} className="flex-shrink-0 opacity-80" />
      </button>
      {isOpen &&
        buttonRef.current &&
        portalTarget &&
        createPortal(popup, portalTarget)}
    </>
  );
};
const SocietyForm: React.FC<SocietyFormProps> = ({
  initialData,
  onSubmit,
  onClose,
  isEditing = false,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<SocietyFormData>({
    societyName: "",
    locality: "",
    city: "",
    pincode: "",
    amenities: [],
    images: [],
    imageUrls: [],
  });

  // 🆕 Image states
interface ImageItem {
    url: string;
    isExisting: boolean; // true = already saved on server
    file?: File;         // present only when isExisting is false
  }
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived — keeps rest of the JSX working with same shape as before
  const existingImageUrls = imageItems.filter((i) => i.isExisting).map((i) => i.url);
  const newImageItems = imageItems.filter((i) => !i.isExisting);
  const imagePreviews = [...existingImageUrls, ...newImageItems.map((i) => i.url)];

  // Master data options
  const [cityOptions, setCityOptions] = useState<MasterOption[]>([]);
  const [localityOptions, setLocalityOptions] = useState<MasterOption[]>([]);
  const [amenitiesOptions, setAmenitiesOptions] = useState<MasterOption[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof SocietyFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportValidationResult[]>(
    [],
  );
  const [existingSocieties, setExistingSocieties] = useState<any[]>([]);
  const [showValidSection, setShowValidSection] = useState(true);
  const [showInvalidSection, setShowInvalidSection] = useState(true);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [searchSocietyTerm, setSearchSocietyTerm] = useState("");
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [societyOptions, setSocietyOptions] = useState<MasterOption[]>([]);
  const [filteredSocietyOptions, setFilteredSocietyOptions] = useState<
    MasterOption[]
  >([]);
  const societyInputRef = useRef<HTMLInputElement>(null);
  const societyDropdownRef = useRef<HTMLDivElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [mediaLabelOptions, setMediaLabelOptions] = useState<MasterOption[]>(
    [],
  );
  const [selectedMediaLabel, setSelectedMediaLabel] = useState<string>("");
  const [imageLabels, setImageLabels] = useState<Record<string, string>>({}); // url -> label
  const [mediaTypeMap, setMediaTypeMap] = useState<
    Record<string, "image" | "video">
  >({});
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrlType, setImageUrlType] = useState<"image" | "video">("image"); // Load master data on mount
  useEffect(() => {
    loadMasterData();
    loadExistingSocieties();
  }, []);

  const loadMasterData = async () => {
    setIsLoadingMaster(true);
    try {
      const data = await getMasterDropdownOptions(["common", "property"]);

      const cities = data["city"] || [];
      setCityOptions(cities);

      const localities = data["location"] || data["locality"] || [];
      setLocalityOptions(localities);

      const amenities =
        data["amenities"] ||
        data["common"]?.filter((c: any) => c.type === "amenity") ||
        [];
      setAmenitiesOptions(amenities);

      const mediaLabels = data["media label"] || []; // 'property' tab already fetched via ['common','property']
      setMediaLabelOptions(mediaLabels);

      const societies = await societyAPI.getAllSocieties();
      const societyOpts = societies.map((s: any) => ({
        value: s.societyName,
        label: s.societyName,
      }));
      setSocietyOptions(societyOpts);
      setFilteredSocietyOptions(societyOpts);
    } catch (error) {
      console.error("Error loading master data:", error);
    } finally {
      setIsLoadingMaster(false);
    }
  };

  // Filter society options based on search
  useEffect(() => {
    const filtered = societyOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchSocietyTerm.toLowerCase()),
    );
    setFilteredSocietyOptions(filtered);
  }, [searchSocietyTerm, societyOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        societyDropdownRef.current &&
        !societyDropdownRef.current.contains(event.target as Node) &&
        societyInputRef.current &&
        !societyInputRef.current.contains(event.target as Node)
      ) {
        setShowSocietyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadExistingSocieties = async () => {
    try {
      const societies = await societyAPI.getAllSocieties();
      setExistingSocieties(societies);
    } catch (error) {
      console.error("Error loading societies:", error);
    }
  };

  // Initialize form with data for editing
  // Initialize form with data for editing
  useEffect(() => {
    if (initialData) {
      // 🆕 initialData.imageUrls may now arrive as {url,label}[] from the backend,
      // or plain string[] from older records — handle both.
      const rawImages: any[] = initialData.imageUrls || [];
      const uniqueImageUrls = Array.from(
        new Set(
          rawImages.map((img: any) =>
            typeof img === "string" ? img : img.url,
          ),
        ),
      );

      // 🆕 Restore labels keyed by URL
      const labelsMap: Record<string, string> = {};
      const typesMap: Record<string, "image" | "video"> = {}; // 🆕
      rawImages.forEach((img: any) => {
        if (img && typeof img === "object" && img.url) {
          labelsMap[img.url] = img.label || "";
          typesMap[img.url] = img.type === "video" ? "video" : "image"; // 🆕
        }
      });
      setImageLabels(labelsMap);
      setMediaTypeMap(typesMap); // 🆕

      setFormData({
        societyName: initialData.societyName || "",
        locality: initialData.locality || "",
        city: initialData.city || "",
        pincode: initialData.pincode || "",
        amenities: initialData.amenities || [],
        images: [],
        imageUrls: uniqueImageUrls,
      });
      setSearchSocietyTerm(initialData.societyName || "");

      // Set image previews from existing images
     setImageItems(uniqueImageUrls.map((url) => ({ url, isExisting: true })));
    }
  }, [initialData]);

  // 🆕 Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const newTypes: Record<string, "image" | "video"> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        newFiles.push(file);
        newPreviews.push(url);
        newTypes[url] = file.type.startsWith("video/") ? "video" : "image";
      }
    }

    if (newFiles.length === 0) {
      toast.warning("Please select valid image or video files");
      return;
    }

   setImageItems((prev) => [
      ...prev,
      ...newFiles.map((file, i) => ({ url: newPreviews[i], isExisting: false, file })),
    ]);

    setMediaTypeMap((prev) => ({ ...prev, ...newTypes })); // 🆕

    setImageLabels((prev) => {
      const next = { ...prev };
      newPreviews.forEach((url) => {
        next[url] = selectedMediaLabel;
      });
      return next;
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // toast.success(`${newFiles.length} image(s) selected`);
  };
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.warning(
        "Please enter a valid URL starting with http:// or https://",
      );
      return;
    }
    if (imagePreviews.includes(url)) {
      toast.info("This URL is already added");
      return;
    }

  setImageItems((prev) => [...prev, { url, isExisting: true }]);
    setMediaTypeMap((prev) => ({ ...prev, [url]: imageUrlType }));
    setImageLabels((prev) => ({ ...prev, [url]: selectedMediaLabel }));

    setImageUrlInput("");
  };

  // 🆕 Drag-and-drop reorder for saved (existing) images
 // ✅ FIX: sirf ek unified reorder + ek drag state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Simple index-based reorder — kaam karta hai chahe item saved ho ya naya
  const reorderImage = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setImageItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  };
  // 🔧 FIXED: Remove image — correctly handles mismatched indices between
  // `existingImageUrls` (server images) and `formData.images` (newly picked Files),
  // since `imagePreviews` / `formData.imageUrls` is the concatenation of BOTH.

 const removeImage = (index: number) => {
    const imageUrl = imageItems[index]?.url;
    if (!imageUrl) return;
    setImageLabels((prev) => {
      const next = { ...prev };
      delete next[imageUrl];
      return next;
    });
    setMediaTypeMap((prev) => {
      const next = { ...prev };
      delete next[imageUrl];
      return next;
    });
    if (imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSocietySelect = (society: MasterOption) => {
    setFormData((prev) => ({ ...prev, societyName: society.label }));
    setSearchSocietyTerm(society.label);
    setShowSocietyDropdown(false);

    if (society.label) {
      fetchAmenitiesForSociety(society.label);
    }
  };

  const fetchAmenitiesForSociety = async (societyName: string) => {
    try {
      const existingSociety = existingSocieties.find(
        (s) => s.societyName?.toLowerCase() === societyName.toLowerCase(),
      );

      if (existingSociety?.amenities && existingSociety.amenities.length > 0) {
        setFormData((prev) => ({
          ...prev,
          amenities: existingSociety.amenities,
        }));
        toast.info(
          `Loaded ${existingSociety.amenities.length} amenities for "${societyName}"`,
        );
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
    }
  };

  const handleCitySelect = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleLocalitySelect = (value: string) => {
    setFormData((prev) => ({ ...prev, locality: value }));
    if (errors.locality) {
      setErrors((prev) => ({ ...prev, locality: "" }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }));
  };

  const checkDuplicate = async () => {
    const { societyName, locality, pincode } = formData;

    if (!societyName || !locality || !pincode) {
      setDuplicateError(null);
      return;
    }

    if (isEditing && initialData) {
      const isSameAsOriginal =
        initialData.societyName === societyName &&
        initialData.locality === locality &&
        initialData.pincode === pincode;

      if (isSameAsOriginal) {
        setDuplicateError(null);
        return;
      }
    }

    setIsCheckingDuplicate(true);

    try {
      const allSocieties = await societyAPI.getAllSocieties();
      const exists = allSocieties.some(
        (society) =>
          society.societyName?.toLowerCase() === societyName.toLowerCase() &&
          society.locality?.toLowerCase() === locality.toLowerCase() &&
          society.pincode === pincode,
      );

      if (exists) {
        setDuplicateError(
          `⚠️ "${societyName}" already exists in ${locality} - ${pincode}`,
        );
      } else {
        setDuplicateError(null);
      }
    } catch (error) {
      console.error("Duplicate check error:", error);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.societyName && formData.locality && formData.pincode) {
        checkDuplicate();
      } else {
        setDuplicateError(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.societyName, formData.locality, formData.pincode]);

  const validateField = (
    name: keyof SocietyFormData,
    value: string,
  ): string => {
    switch (name) {
      case "societyName":
        if (!value.trim()) return "Society name is required";
        if (value.length < 2)
          return "Society name must be at least 2 characters";
        if (value.length > 100)
          return "Society name must be less than 100 characters";
        return "";
      case "locality":
        if (!value.trim()) return "Locality is required";
        if (value.length < 2) return "Locality must be at least 2 characters";
        if (value.length > 100)
          return "Locality must be less than 100 characters";
        return "";
      case "city":
        if (!value.trim()) return "City is required";
        if (value.length < 2) return "City must be at least 2 characters";
        if (value.length > 50) return "City must be less than 50 characters";
        return "";
      case "pincode":
        if (!value.trim()) return "Pincode is required";
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(value)) return "Enter a valid 6-digit pincode";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "societyName") {
      setSearchSocietyTerm(value);
    }
    if (errors[name as keyof SocietyFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SocietyFormData, string>> = {};
    let isValid = true;

    if (!formData.societyName) {
      newErrors.societyName = "Society name is required";
      isValid = false;
    }
    if (!formData.locality) {
      newErrors.locality = "Locality is required";
      isValid = false;
    }
    if (!formData.city) {
      newErrors.city = "City is required";
      isValid = false;
    }
    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
      isValid = false;
    } else {
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(formData.pincode)) {
        newErrors.pincode = "Enter a valid 6-digit pincode";
        isValid = false;
      }
    }

    if (duplicateError) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 🆕 Upload society images
  // 🆕 Upload society images
  const uploadSocietyImages = async (societyId: string, images: File[]) => {
    if (!images || images.length === 0) return;

    try {
      setIsUploadingImages(true);
      const uploadFormData = new FormData();

      // 🆕 New previews after existingImageUrls, same order as formData.images
    // 🆕 Split files into images vs videos to match backend .fields()
      const imageFiles: File[] = [];
      const imageLabelList: string[] = [];
      const videoFiles: File[] = [];
      const videoLabelList: string[] = [];

const newItems = imageItems.filter((it) => it.file);
      images.forEach((file, idx) => {
        const url = newItems.find((it) => it.file === file)?.url || "";
        const label = imageLabels[url] || "";
        if (mediaTypeMap[url] === "video") {
          videoFiles.push(file);
          videoLabelList.push(label);
        } else {
          imageFiles.push(file);
          imageLabelList.push(label);
        }
      });

      imageFiles.forEach((file) => uploadFormData.append("images", file));
      videoFiles.forEach((file) => uploadFormData.append("videos", file));
      uploadFormData.append(
        "labels",
        JSON.stringify([...imageLabelList, ...videoLabelList]),
      );
      await societyAPI.uploadSocietyImages(societyId, uploadFormData);
      // toast.success(`${images.length} image(s) uploaded successfully`);

      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploadingImages(false);
    }
  };

  // 🔥 FIXED: handleSubmit with duplicate submission prevention
  // 🔧 FIXED: no longer sends temporary blob: URLs to the backend — this was
  // the root cause of duplicate/broken images showing up after save.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 PREVENT DOUBLE SUBMIT
    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      if (duplicateError) {
        toast.error(duplicateError);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // 🔧 FIX: Only persist REAL, already-uploaded image URLs.
      // formData.imageUrls can contain local blob: preview URLs for
      // images that haven't been uploaded to the server yet — those
      // must never be saved on the society record itself, otherwise
      // they show up as permanent broken/duplicate entries.
      const persistedImageUrls = imageItems
        .filter((it) => it.isExisting)
        .map((it) => it.url)
        .filter((url) => !url.startsWith("blob:"))
        .map((url) => ({
          url,
          label: imageLabels[url] || "",
          type: mediaTypeMap[url] || "image",
        })); // 🆕 type add // 🆕 attach label per image

      const societyData = {
        societyName: formData.societyName,
        locality: formData.locality,
        city: formData.city,
        pincode: formData.pincode,
        amenities: formData.amenities || [],
        imageUrls: persistedImageUrls, // now {url, label}[]
      };

      if (isEditing && initialData) {
        // 🔥 EDIT MODE
        const allSocieties = await societyAPI.getAllSocieties();
        const existingSociety = allSocieties.find(
          (s: any) => s.societyName === formData.societyName,
        );

        if (existingSociety) {
          // ✅ Step 1: Update society with existing (real) image URLs only
          await onSubmit(societyData);

          // ✅ Step 2: Upload new images (they will be appended by the backend
          // and returned as real, persistent URLs)
const newFiles = imageItems.filter((it) => it.file).map((it) => it.file!);
if (newFiles.length > 0) {
  await uploadSocietyImages(existingSociety.id, newFiles);
}
        } else {
          toast.error("Society not found for editing");
          return;
        }
      // NEW
      } else {
        // ✅ CREATE MODE
        await onSubmit(societyData);

        // 🔧 FIX: formData.images kabhi populate nahi hota — imageItems se naye files nikalo
        const newFiles = imageItems.filter((it) => !it.isExisting && it.file).map((it) => it.file!);
        if (newFiles.length > 0) {
          const allSocieties = await societyAPI.getAllSocieties();
          const createdSociety = allSocieties.find(
            (s: any) => s.societyName === formData.societyName,
          );

          if (createdSociety) {
            await uploadSocietyImages(createdSociety.id, newFiles);
          }
        }
      }

      if (onRefresh) await onRefresh();
      onClose();
    } catch (error: any) {
      console.error("Submission error:", error);
      if (error.response?.status === 409) {
        toast.error(error.response?.data?.error || "Society already exists!");
      } else {
        toast.error("Failed to save society");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateImportData = (
    data: SocietyFormData,
    rowNumber: number,
  ): ImportValidationResult => {
    const errors: string[] = [];
    let isDuplicate = false;

    if (!data.societyName) errors.push("Society name is required");
    else if (data.societyName.length < 2)
      errors.push("Society name must be at least 2 characters");
    else if (data.societyName.length > 100)
      errors.push("Society name must be less than 100 characters");

    if (!data.locality) errors.push("Locality is required");
    else if (data.locality.length < 2)
      errors.push("Locality must be at least 2 characters");
    else if (data.locality.length > 100)
      errors.push("Locality must be less than 100 characters");

    if (!data.city) errors.push("City is required");
    else if (data.city.length < 2)
      errors.push("City must be at least 2 characters");
    else if (data.city.length > 50)
      errors.push("City must be less than 50 characters");

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!data.pincode) errors.push("Pincode is required");
    else if (!pincodeRegex.test(data.pincode))
      errors.push("Invalid pincode format");

    if (
      data.societyName &&
      data.locality &&
      data.pincode &&
      pincodeRegex.test(data.pincode)
    ) {
      const isDuplicateRecord = existingSocieties.some(
        (existing) =>
          existing.societyName?.toLowerCase() ===
            data.societyName.toLowerCase() &&
          existing.locality?.toLowerCase() === data.locality.toLowerCase() &&
          existing.pincode === data.pincode,
      );
      if (isDuplicateRecord) {
        isDuplicate = true;
        errors.push(
          "Duplicate record already exists (Same Society Name, Locality & Pincode)",
        );
      }
    }

    return {
      data,
      isValid: errors.length === 0,
      isDuplicate,
      errors,
      rowNumber,
    };
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const validatedData: ImportValidationResult[] = [];
        for (let i = 0; i < jsonData.length; i++) {
          const row: any = jsonData[i];
          const societyData: SocietyFormData = {
            societyName: row["Society Name"] || row.societyName || "",
            locality: row["Locality"] || row.locality || "",
            city: row["City"] || row.city || "",
            pincode: String(row["Pincode"] || row.pincode || ""),
            amenities: row["Amenities"]
              ? String(row["Amenities"])
                  .split(",")
                  .map((a: string) => a.trim())
              : [],
            images: [],
            imageUrls: [],
          };
          validatedData.push(validateImportData(societyData, i + 2));
        }

        setImportPreview(validatedData);
        setShowBulkImport(true);
        toast.info(
          `Found ${validatedData.filter((v) => v.isValid).length} valid records`,
        );
      } catch (error) {
        toast.error("Failed to parse Excel file");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const confirmBulkImport = async () => {
    try {
      setIsImporting(true);
      let successCount = 0;
      let errorCount = 0;
      const validItems = importPreview.filter((v) => v.isValid);
      const duplicateItems = importPreview.filter((v) => v.isDuplicate);
      const invalidItems = importPreview.filter(
        (v) => !v.isValid && !v.isDuplicate,
      );

      if (duplicateItems.length > 0) {
        const duplicateNames = duplicateItems
          .map((item) => item.data.societyName)
          .slice(0, 5);
        toast.warning(
          `⚠️ Skipping ${duplicateItems.length} duplicate societies: ${duplicateNames.join(", ")}`,
        );
      }

      if (invalidItems.length > 0) {
        toast.warning(
          `Skipping ${invalidItems.length} invalid records due to validation errors`,
        );
      }

      for (const item of validItems) {
        try {
          await societyAPI.createSociety(item.data);
          successCount++;
        } catch (err) {
          errorCount++;
          console.error("Import error:", err);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ Imported ${successCount} new societies`);
      }
      if (duplicateItems.length > 0) {
        toast.warning(
          `⚠️ Skipped ${duplicateItems.length} duplicate societies`,
        );
      }
      if (invalidItems.length > 0) {
        toast.warning(`⚠️ Skipped ${invalidItems.length} invalid records`);
      }
      if (errorCount > 0) {
        toast.error(`❌ Failed to import ${errorCount} societies`);
      }

      if (onRefresh) await onRefresh();
      setShowBulkImport(false);
      setImportPreview([]);
      onClose();
    } catch (error) {
      toast.error("Failed to import societies");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      // Fetch latest data with amenities
      const societies = await societyAPI.getAllSocieties();

      if (!societies || societies.length === 0) {
        toast.warn("No data to export");
        return;
      }

      // Prepare data with amenities
      const excelData = societies.map((society) => ({
        "Society Name": society.societyName || "",
        Locality: society.locality || "",
        City: society.city || "",
        Pincode: society.pincode || "",
        Amenities: (society.amenities || []).join(", "),
        Status: society.status || "Active",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better readability
      worksheet["!cols"] = [
        { wch: 35 },
        { wch: 30 },
        { wch: 25 },
        { wch: 15 },
        { wch: 50 },
        { wch: 12 },
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Societies");

      // Generate filename with date
      const fileName = `societies_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(`${excelData.length} societies exported successfully ✅`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export societies ❌");
    }
  };

  const downloadSample = () => {
    const sampleData = [
      {
        "Society Name": "Green Valley Residency",
        Locality: "Hinjewadi Phase 1",
        City: "Pune",
        Pincode: 411057,
        Amenities: "Parking, Security, Gym",
      },
      {
        "Society Name": "Sunshine Heights",
        Locality: "Baner",
        City: "Pune",
        Pincode: 411045,
        Amenities: "Swimming Pool, Clubhouse, WiFi",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    XLSX.writeFile(workbook, "sample_societies.xlsx");
    toast.info("Sample file downloaded");
  };

  const getInputClassName = (fieldName: keyof SocietyFormData) => {
    const baseClass =
      "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
    if (duplicateError && fieldName === "societyName") {
      return `${baseClass} border-red-500 bg-red-50`;
    }
    return errors[fieldName]
      ? `${baseClass} border-red-500 bg-red-50`
      : `${baseClass} border-gray-300 focus:border-blue-500`;
  };

  const validItems = importPreview.filter((v) => v.isValid);
  const validCount = validItems.length;
  const duplicateCount = importPreview.filter((v) => v.isDuplicate).length;
  const invalidCount = importPreview.filter(
    (v) => !v.isValid && !v.isDuplicate,
  ).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Custom Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b rounded-t-lg"
        style={{ background: "#0f2b3d", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
          <h2 className="text-sm font-bold text-white">
            {isEditing ? "Edit Society" : "Add New Society"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* <button
                        type="button"
                        onClick={() => setShowImportModal(true)}
                        className="p-1.5 rounded text-white hover:bg-white/10 transition-colors"
                        title="Import Societies"
                    >
                        <Upload size={16} />
                    </button>
                    <button type="button" onClick={handleExport} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors">
                        <Download size={16} />
                    </button>
                    <button type="button" onClick={downloadSample} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors">
                        <FileSpreadsheet size={16} />
                    </button> */}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors ml-2"
          >
            <X size={16} color="white" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {isImporting && (
          <div className="m-2 p-2 bg-blue-50 rounded-lg text-center">
            <div className="animate-spin inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full mr-1.5"></div>
            <span className="text-xs text-blue-600">Processing...</span>
          </div>
        )}

        {isLoadingMaster && (
          <div className="mx-4 mt-2 p-1.5 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1.5">
              <div className="animate-spin h-2.5 w-2.5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-[10px] text-blue-600">
                Loading master data...
              </span>
            </div>
          </div>
        )}

        {duplicateError && (
          <div className="mx-4 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <X size={14} className="text-red-500 flex-shrink-0" />
              {duplicateError}
            </p>
          </div>
        )}

        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {/* Society Name - Searchable Dropdown */}
            <div className="relative">
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Society Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={societyInputRef}
                  type="text"
                  name="societyName"
                  value={searchSocietyTerm}
                  onChange={handleInputChange}
                  onClick={() => {
                    setFilteredSocietyOptions(societyOptions);
                    setShowSocietyDropdown(true);
                  }}
                  className={
                    getInputClassName("societyName") + " text-xs py-1.5 px-2.5"
                  }
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowSocietyDropdown(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Search size={13} className="text-gray-400" />
                </button>
              </div>
              {showSocietyDropdown && filteredSocietyOptions.length > 0 && (
                <div
                  ref={societyDropdownRef}
                  className="absolute z-50 w-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  {filteredSocietyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSocietySelect(option)}
                      className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-orange-50 transition-colors flex items-center gap-1.5"
                    >
                      <Building2
                        size={12}
                        className="text-gray-400 flex-shrink-0"
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              {errors.societyName && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  {errors.societyName}
                </p>
              )}
            </div>

            {/* Locality - Dropdown from Master */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Locality <span className="text-red-500">*</span>
              </label>
              <Dropdown
                placeholder="Select locality"
                options={localityOptions}
                value={formData.locality}
                onChange={handleLocalitySelect}
                className="w-full text-xs"
                searchable
              />
              {errors.locality && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  {errors.locality}
                </p>
              )}
            </div>

            {/* City - Dropdown from Master */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                City <span className="text-red-500">*</span>
              </label>
              <Dropdown
                placeholder="Select city"
                options={cityOptions}
                value={formData.city}
                onChange={handleCitySelect}
                className="w-full text-xs"
                searchable
              />
              {errors.city && (
                <p className="mt-0.5 text-[10px] text-red-500">{errors.city}</p>
              )}
            </div>

            {/* Pincode - Input */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                className={
                  getInputClassName("pincode") + " text-xs py-1.5 px-2.5"
                }
              />
              {errors.pincode && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  {errors.pincode}
                </p>
              )}
              <p className="mt-0.5 text-[9px] text-gray-400">
                Must be a valid 6-digit Indian pincode
              </p>
            </div>
          </div>

          {/* Amenities Section - Multi-Select Dropdown */}
          <div className="mt-3">
            <AmenitiesMultiSelect
              label="AMENITIES"
              options={amenitiesOptions}
              selectedValues={formData.amenities || []}
              onToggle={handleAmenityToggle}
              placeholder="Select amenities..."
            />

            {/* Selected Amenities Tags */}
            {formData.amenities && formData.amenities.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {formData.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 rounded-full text-[10px] text-purple-700 border border-purple-200"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className="text-purple-400 hover:text-purple-600"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 🆕 IMAGES SECTION */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-medium text-gray-700">
                Society Images
                {imagePreviews.length > 0 && (
                  <span className="ml-1.5 text-[9px] text-gray-400 normal-case font-normal">
                    ({existingImageUrls.length} saved ·{" "}
                    {imagePreviews.length - existingImageUrls.length} new)
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImages}
                className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isUploadingImages ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}
                {isUploadingImages ? "Uploading..." : "Add Videos/Images"}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 🆕 Add via URL */}
            <div className="flex items-center gap-1.5 mb-2">
              <input
                type="text"
                placeholder="Paste image/video URL..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
              <select
                value={imageUrlType}
                onChange={(e) =>
                  setImageUrlType(e.target.value as "image" | "video")
                }
                className="px-2 py-1.5 border border-gray-200 rounded-md text-xs bg-white"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] flex items-center gap-1 whitespace-nowrap transition-colors"
              >
                Add URL
              </button>
            </div>

            {/* Image Preview Grid — unified, freely reorderable */}
            {imageItems.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
                {imageItems.map((item, idx) => {
                  const url = item.url;
                  const isVideo = mediaTypeMap[url] === 'video';
                  return (
                    <div
                      key={`${item.isExisting ? 'existing' : 'new'}-${url}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(idx));
                        setDraggedIdx(idx);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIdx !== null) reorderImage(draggedIdx, idx);
                        setDraggedIdx(null);
                      }}
                      onDragEnd={() => setDraggedIdx(null)}
                      className={`relative group rounded-md overflow-hidden border-2 ${item.isExisting ? 'border-blue-200' : 'border-orange-200'} aspect-square cursor-grab active:cursor-grabbing ${draggedIdx === idx ? 'opacity-40' : ''}`}
                    >
                      {isVideo ? (
                        getYouTubeEmbedUrl(url) ? (
                          <iframe draggable={false} src={getYouTubeEmbedUrl(url)!} className="w-full h-full pointer-events-none" frameBorder="0" allow="autoplay; encrypted-media" />
                        ) : (
                          <video draggable={false} src={url} className="w-full h-full object-cover pointer-events-none" muted />
                        )
                      ) : (
                        <img
                          draggable={false}
                          src={url}
                          alt={`Media ${idx + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      )}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Video size={16} className="text-white drop-shadow" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all pointer-events-auto"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <div className="absolute top-1 left-1 flex items-center gap-1 pointer-events-none">
                        <span className={`text-white text-[8px] px-1 py-0.5 rounded font-bold ${item.isExisting ? 'bg-blue-500' : 'bg-orange-500'}`}>
                          {item.isExisting ? 'S' : 'N'}
                        </span>
                        <span className="bg-black/70 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded p-0.5 pointer-events-none" title="Drag to reorder">
                        <GripVertical size={12} className="text-gray-600" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-1 pt-3 pb-1">
                        <ImageLabelDropdown
                          value={imageLabels[url] || ''}
                          options={mediaLabelOptions}
                          onChange={(label) => setImageLabels((prev) => ({ ...prev, [url]: label }))}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(
                    "border-orange-400",
                    "bg-orange-50/20",
                  );
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(
                    "border-orange-400",
                    "bg-orange-50/20",
                  );
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(
                    "border-orange-400",
                    "bg-orange-50/20",
                  );
                  const dropped = e.dataTransfer.files;
                  if (dropped && dropped.length > 0) {
                    const syntheticEvent = {
                      target: { files: dropped },
                    } as any;
                    handleImageUpload(syntheticEvent);
                  }
                }}
              >
                <Image size={24} className="mx-auto text-gray-300 mb-1" />
                <p className="text-[11px] text-gray-500">
                  Click or drag to upload images
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  JPG, PNG, WebP (Max 5MB each)
                </p>
              </div>
            )}

            {isUploadingImages && (
              <div className="mt-2 p-1.5 bg-blue-50 rounded-lg flex items-center gap-1.5">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent" />
                <span className="text-[10px] text-blue-600">
                  Uploading images...
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCheckingDuplicate || !!duplicateError}
              className="px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              {isSubmitting && (
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
              )}
              <Save size={13} />
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                  ? "Update Society"
                  : "Save Society"}
            </button>
          </div>
        </div>
      </form>

      {/* Bulk Import Preview Modal with Separate Sections */}
      {showBulkImport && importPreview.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                Import Preview & Validation
              </h3>
              <button
                onClick={() => setShowBulkImport(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="flex gap-6 p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  Valid: <strong>{validCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">
                  Duplicate: <strong>{duplicateCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">
                  Invalid: <strong>{invalidCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm">
                  Total: <strong>{importPreview.length}</strong>
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {/* ✅ VALID RECORDS SECTION */}
              {validItems.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowValidSection(!showValidSection)}
                    className="flex items-center gap-2 w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    {showValidSection ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="font-semibold text-green-700">
                      Valid Records ({validItems.length})
                    </span>
                    <span className="text-xs text-green-600 ml-auto">
                      Click to {showValidSection ? "collapse" : "expand"}
                    </span>
                  </button>

                  {showValidSection && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-sm border-collapse">
                        <thead className="bg-green-100 sticky top-0">
                          <tr>
                            <th className="p-2 text-left w-16 border-b">Row</th>
                            <th className="p-2 text-left border-b">
                              Society Name
                            </th>
                            <th className="p-2 text-left border-b">Locality</th>
                            <th className="p-2 text-left border-b">City</th>
                            <th className="p-2 text-left w-24 border-b">
                              Pincode
                            </th>
                            <th className="p-2 text-left w-32 border-b">
                              Amenities
                            </th>
                            <th className="p-2 text-left w-24 border-b">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {validItems.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-b hover:bg-green-50/50"
                            >
                              <td className="p-2 text-gray-500">
                                {item.rowNumber}
                              </td>
                              <td className="p-2 font-medium">
                                {item.data.societyName}
                              </td>
                              <td className="p-2">{item.data.locality}</td>
                              <td className="p-2">{item.data.city}</td>
                              <td className="p-2">{item.data.pincode}</td>
                              <td className="p-2 text-xs text-gray-500">
                                {item.data.amenities?.join(", ") || "-"}
                              </td>
                              <td className="p-2">
                                <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle size={14} /> Valid
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ❌ INVALID RECORDS SECTION */}
              {(invalidCount > 0 || duplicateCount > 0) && (
                <div>
                  <button
                    onClick={() => setShowInvalidSection(!showInvalidSection)}
                    className="flex items-center gap-2 w-full p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    {showInvalidSection ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                    <XCircle size={18} className="text-red-600" />
                    <span className="font-semibold text-red-700">
                      Invalid Records ({invalidCount + duplicateCount})
                    </span>
                    <span className="text-xs text-red-600 ml-auto">
                      Click to {showInvalidSection ? "collapse" : "expand"}
                    </span>
                  </button>

                  {showInvalidSection && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-sm border-collapse">
                        <thead className="bg-red-100 sticky top-0">
                          <tr>
                            <th className="p-2 text-left w-16 border-b">Row</th>
                            <th className="p-2 text-left border-b">
                              Society Name
                            </th>
                            <th className="p-2 text-left border-b">Locality</th>
                            <th className="p-2 text-left border-b">City</th>
                            <th className="p-2 text-left w-24 border-b">
                              Pincode
                            </th>
                            <th className="p-2 text-left w-32 border-b">
                              Amenities
                            </th>
                            <th className="p-2 text-left w-28 border-b">
                              Status
                            </th>
                            <th className="p-2 text-left border-b">Errors</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview
                            .filter((v) => !v.isValid)
                            .map((item, idx) => (
                              <tr
                                key={idx}
                                className={`border-b ${item.isDuplicate ? "bg-yellow-50/50" : "bg-red-50/50"}`}
                              >
                                <td className="p-2 text-gray-500">
                                  {item.rowNumber}
                                </td>
                                <td className="p-2 font-medium">
                                  {item.data.societyName || "-"}
                                </td>
                                <td className="p-2">
                                  {item.data.locality || "-"}
                                </td>
                                <td className="p-2">{item.data.city || "-"}</td>
                                <td className="p-2">
                                  {item.data.pincode || "-"}
                                </td>
                                <td className="p-2 text-xs text-gray-500">
                                  {item.data.amenities?.join(", ") || "-"}
                                </td>
                                <td className="p-2">
                                  {item.isDuplicate ? (
                                    <span className="inline-flex items-center gap-1 text-yellow-600">
                                      <AlertCircle size={14} /> Duplicate
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-red-600">
                                      <XCircle size={14} /> Invalid
                                    </span>
                                  )}
                                </td>
                                <td className="p-2">
                                  {item.errors.length > 0 && (
                                    <div className="space-y-0.5">
                                      {item.errors.map((err, errIdx) => (
                                        <p
                                          key={errIdx}
                                          className={`text-xs flex items-center gap-1 ${err.includes("Duplicate") ? "text-yellow-600" : "text-red-500"}`}
                                        >
                                          <AlertCircle size={10} /> {err}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-3 p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {validCount} records will be imported,{" "}
                {duplicateCount + invalidCount} records will be skipped
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkImport(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkImport}
                  disabled={isImporting || validCount === 0}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isImporting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  )}
                  Import {validCount} Valid Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SocietyImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={async () => {
          if (onRefresh) await onRefresh();
        }}
      />
    </div>
  );
};

export default SocietyForm;
