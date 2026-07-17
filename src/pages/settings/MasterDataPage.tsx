

// // src/pages/settings/MasterDataPage.tsx
// import React, { useState, useEffect, ChangeEvent } from "react";
// import {
//   Edit2,
//   Trash2,
//   CheckCircle,
//   XCircle,
//   Plus,
//   ArrowLeft,
//   Upload,
//   Download,
//   X,
//   Eye,
//   Image as ImageIcon,
//   MapPin,
//   Building2,
//   Tag,
//   List,
//   FileText,
//   Home,
//   Hash,
//   Map,
//   Package,
//   Check,
//   ChevronRight,
// } from "lucide-react";
// import Modal from "@/components/ui/Modal";
// import { masterDataAPI } from "@/lib/mastersAPI";
// import { ImportModal } from "./master/ImportModal";
// import { ConnectedRemarkForm } from "./master/ConnectedRemarkForm";
// import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
// import { societyAPI } from "@/lib/societyAPI";
// import { toast, ToastContentProps } from "react-toastify";
// import Swal from "sweetalert2";
// import SocietyForm from "./master/SocietyForm";
// import * as XLSX from 'xlsx';
// import { SocietyImportModal } from "./master/SocietyImportModal";

// import { useAuth } from "@/contexts/AuthContext";
// import { can } from "@/utils/permission";

// const getYouTubeEmbedUrl = (url: string): string | null => {
//   const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
//   return match ? `https://www.youtube.com/embed/${match[1]}` : null;
// };

// type ImportType = "master" | "values";

// interface Tab {
//   id: string;
//   title: string;
// }

// interface Value {
//   id: string;
//   value: string;
//   status: string;
// }

// interface MasterItem {
//   id: string;
//   name: string;
//   status: string;
//   values: Value[];
//   valueCount: number;
//   [k: string]: any;
// }

// interface ItemsByTab {
//   property: MasterItem[];
//   buyer: MasterItem[];
//   seller: MasterItem[];
//   lead: MasterItem[];
//   common: MasterItem[];
//   connectedRemark: MasterItem[];
//   society: MasterItem[];
// }

// interface SocietyData {
//   societyName: string;
//   locality: string;
//   city: string;
//   pincode: string;
//   id?: string;
//   status?: string;
//   createdAt?: string;
//   amenities?: string[];
//   imageUrls?: (string | { url: string; label: string; type: 'image' | 'video' })[];
// }

// interface ConnectedRemark {
//   id: string;
//   tabId?: string;
//   tab_id?: string;
//   type1: string;
//   value1: string;
//   type2: string;
//   value2: string;
//   remarks?: string | Array<string | Record<string, any>> | Record<string, any> | null;
//   status: string;
//   type1Name?: string;
//   type2Name?: string;
//   value1Name?: string;
//   value2Name?: string;
//   [k: string]: any;
// }

// type TabId = keyof ItemsByTab;

// export default function MasterDataPage(): JSX.Element {

//   const { user } = useAuth();

//   const canManageMaster = can(user, "settings_master.manage");
//   const canImportMaster = can(user, "settings_master.import");
//   const canExportMaster = can(user, "settings_master.export");

//   if (!canManageMaster) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <h3>Access Denied</h3>
//         <p>You don't have permission to access Master Data.</p>
//       </div>
//     );
//   }
//   const [tabs] = useState<Tab[]>([
//     { id: "property", title: "Property Master" },
//     { id: "buyer", title: "Buyer Master" },
//     { id: "seller", title: "Seller Master" },
//     { id: "lead", title: "Lead Master" },
//     { id: "common", title: "Common Master" },
//     { id: "connectedRemark", title: "Connected Remark" },
//     { id: "society", title: "Society with locality" },
//   ]);

//   const [activeId, setActiveId] = useState<TabId>(() => {
//     const savedTab =
//       typeof window !== "undefined" ? localStorage.getItem("masterDataActiveTab") : null;
//     return (savedTab && tabs.some((t) => t.id === savedTab)) ? (savedTab as TabId) : (tabs[0].id as TabId);
//   });

//   const activeTab: Tab = tabs.find((t) => t.id === activeId) ?? tabs[0];

//   const [itemsByTab, setItemsByTab] = useState<ItemsByTab>({
//     property: [],
//     buyer: [],
//     seller: [],
//     lead: [],
//     common: [],
//     connectedRemark: [],
//     society: [],
//   });

//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isValuesLoading, setIsValuesLoading] = useState<boolean>(false);

//   const [currentView, setCurrentView] = useState<"list" | "values">("list");
//   const [selectedMaster, setSelectedMaster] = useState<MasterItem | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>("");

//   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
//   const [isSocietyImportModalOpen, setIsSocietyImportModalOpen] = useState(false);
//   const [importType, setImportType] = useState<ImportType>("master");

//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [isEditMode, setIsEditMode] = useState<boolean>(false);
//   const [currentItem, setCurrentItem] = useState<MasterItem | null>(null);
//   const [name, setName] = useState<string>("");
//   const [status, setStatus] = useState<string>("Active");

//   const [isValueModalOpen, setIsValueModalOpen] = useState<boolean>(false);
//   const [valueInput, setValueInput] = useState<string>("");
//   const [valueStatus, setValueStatus] = useState<string>("Active");
//   const [editingValue, setEditingValue] = useState<Value | null>(null);

//   const isConnectedRemarkTab = activeId === "connectedRemark";
//   const isSocietyTab = activeId === "society";
//   const [selectedValueIds, setSelectedValueIds] = useState<string[]>([]);
//   const isAllSelected =
//     selectedMaster?.values?.length > 0 && selectedValueIds.length === (selectedMaster.values?.length ?? 0);

//   const [connectedRemarks, setConnectedRemarks] = useState<ConnectedRemark[]>([]);
//   const [currentConnectedRemark, setCurrentConnectedRemark] = useState<ConnectedRemark | null>(null);

//   const [societies, setSocieties] = useState<SocietyData[]>([]);
//   const [currentSociety, setCurrentSociety] = useState<SocietyData | null>(null);
//   const [viewSociety, setViewSociety] = useState<SocietyData | null>(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

//   const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([]);
//   const [isAllSocietiesSelected, setIsAllSocietiesSelected] = useState(false);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("masterDataActiveTab", activeId);
//     }
//   }, [activeId]);

//   useEffect(() => {
//     if (isConnectedRemarkTab) {
//       loadConnectedRemarks();
//     } else if (isSocietyTab) {
//       loadSocieties();
//     } else {
//       loadMasterTypes();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeId]);

//   // Society Functions
//   const loadSocieties = async (): Promise<void> => {
//     try {
//       setIsLoading(true);
//       const data = await societyAPI.getAllSocieties();
//       setSocieties(data);
//     } catch (error) {
//       console.error("Error loading societies:", error);
//       toast.error("Error loading societies ❌");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSocietySubmit = async (formData: SocietyData): Promise<void> => {
//     try {
//       if (isEditMode && currentSociety) {
//         await societyAPI.updateSociety(currentSociety.id!, formData);
//         toast.success("Society updated successfully ✏️");
//       } else {
//         await societyAPI.createSociety(formData);
//         toast.success("Society added successfully ✅");
//       }
//       await loadSocieties();
//       resetSocietyForm();
//     } catch (error: any) {
//       console.error("Error saving society:", error);
//       const errorMessage = error.response?.data?.error || "Error saving society ❌ Please try again.";
//       toast.error(errorMessage);
//     }
//   };

//   const handleEditSociety = (society: SocietyData): void => {
//     setCurrentSociety(society);
//     setIsEditMode(true);
//     setIsModalOpen(true);
//   };

//   // 🆕 View Society Handler
//   const handleViewSociety = (society: SocietyData): void => {
//     setViewSociety(society);
//     setIsViewModalOpen(true);
//   };

//   // 🆕 Handle click on society name
//   const handleSocietyNameClick = (society: SocietyData): void => {
//     handleViewSociety(society);
//   };

// const handleDeleteSociety = async (societyId: string): Promise<void> => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You are about to delete this society. This action cannot be undone!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//       background: "#fff",
//       backdrop: `rgba(0,0,0,0.4)`,
//       width: "400px",
//       padding: "1.5rem",
//       customClass: {
//         popup: "rounded-xl shadow-2xl",
//         title: "text-lg font-bold text-gray-800",
//         htmlContainer: "text-sm text-gray-600 my-2",
//         confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
//         cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
//         actions: "flex justify-center gap-2 mt-4",
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await societyAPI.deleteSociety(societyId);
//       await loadSocieties();
//       Swal.fire({
//         title: "Deleted!",
//         text: "Society has been deleted successfully.",
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-green-600",
//           htmlContainer: "text-xs text-gray-600",
//         },
//       });
//     } catch (error: any) {
//       console.error("Error deleting society:", error);
//       const errorMessage = error.response?.data?.error || "Error deleting society ❌ Please try again.";
//       Swal.fire({
//         title: "Error!",
//         text: errorMessage,
//         icon: "error",
//         confirmButtonColor: "#3085d6",
//         confirmButtonText: "OK",
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-red-600",
//           htmlContainer: "text-xs text-gray-600",
//           confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
//         },
//         buttonsStyling: false,
//       });
//     }
//   };


//   // Toggle select all societies
//   const toggleSelectAllSocieties = () => {
//     if (isAllSocietiesSelected) {
//       setSelectedSocietyIds([]);
//       setIsAllSocietiesSelected(false);
//     } else {
//       setSelectedSocietyIds(filteredSocieties.map(s => s.id!));
//       setIsAllSocietiesSelected(true);
//     }
//   };

//   // Toggle single society selection
//   const toggleSelectSociety = (id: string) => {
//     setSelectedSocietyIds(prev =>
//       prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
//     );
//   };

//   // Bulk delete societies
// const handleBulkDeleteSocieties = async () => {
//     if (selectedSocietyIds.length === 0) return;

//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: `You are about to delete ${selectedSocietyIds.length} selected societies. This action cannot be undone!`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: `Yes, delete ${selectedSocietyIds.length} society(s)!`,
//       cancelButtonText: "Cancel",
//       background: "#fff",
//       backdrop: `rgba(0,0,0,0.4)`,
//       width: "400px",
//       padding: "1.5rem",
//       customClass: {
//         popup: "rounded-xl shadow-2xl",
//         title: "text-lg font-bold text-gray-800",
//         htmlContainer: "text-sm text-gray-600 my-2",
//         confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
//         cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
//         actions: "flex justify-center gap-2 mt-4",
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await Promise.all(selectedSocietyIds.map(id => societyAPI.deleteSociety(id)));
//       await loadSocieties();
//       const count = selectedSocietyIds.length;
//       setSelectedSocietyIds([]);
//       setIsAllSocietiesSelected(false);
//       Swal.fire({
//         title: "Deleted!",
//         text: `${count} societies have been deleted successfully.`,
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-green-600",
//           htmlContainer: "text-xs text-gray-600",
//         },
//       });
//     } catch (error: any) {
//       Swal.fire({
//         title: "Error!",
//         text: error.response?.data?.error || "Error deleting societies ❌",
//         icon: "error",
//         confirmButtonColor: "#3085d6",
//         confirmButtonText: "OK",
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-red-600",
//           htmlContainer: "text-xs text-gray-600",
//           confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
//         },
//         buttonsStyling: false,
//       });
//     }
//   };

//   const resetSocietyForm = (): void => {
//     setIsModalOpen(false);
//     setIsEditMode(false);
//     setCurrentSociety(null);
//   };

//   // Connected Remark Functions
//   const loadConnectedRemarks = async (): Promise<void> => {
//     try {
//       setIsLoading(true);
//       const data = await connectedRemarkAPI.getAllRemarks();
//       setConnectedRemarks(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error loading connected remarks:", error);
//       toast.error("Error loading connected remarks ❌");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleConnectedRemarkSubmit = async (formData: ConnectedRemark | any) => {
//     try {
//       if (isEditMode && currentConnectedRemark) {
//         await connectedRemarkAPI.updateRemark(currentConnectedRemark.id, formData);
//         toast.success("Connected remark updated successfully ✏️");
//       } else {
//         await connectedRemarkAPI.createRemark(formData);
//         toast.success("Connected remark added successfully ✅");
//       }
//       await loadConnectedRemarks();
//       resetForm();
//     } catch (error: any) {
//       console.error("Error saving connected remark:", error);
//       const errorMessage = error.response?.data?.error || "Error saving connected remark ❌ Please try again.";
//       toast.error(errorMessage);
//     }
//   };

//   const handleEditConnectedRemark = (remark: ConnectedRemark): void => {
//     setCurrentConnectedRemark(remark);
//     setIsEditMode(true);
//     setIsModalOpen(true);
//   };

//  const handleDeleteConnectedRemark = async (remarkId: string): Promise<void> => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You are about to delete this connected remark. This action cannot be undone!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//       background: "#fff",
//       backdrop: `rgba(0,0,0,0.4)`,
//       width: "400px",
//       padding: "1.5rem",
//       customClass: {
//         popup: "rounded-xl shadow-2xl",
//         title: "text-lg font-bold text-gray-800",
//         htmlContainer: "text-sm text-gray-600 my-2",
//         confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
//         cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
//         actions: "flex justify-center gap-2 mt-4",
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await connectedRemarkAPI.deleteRemark(remarkId);
//       await loadConnectedRemarks();
//       Swal.fire({
//         title: "Deleted!",
//         text: "Connected remark has been deleted successfully.",
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-green-600",
//           htmlContainer: "text-xs text-gray-600",
//         },
//       });
//     } catch (error: any) {
//       console.error("Error deleting connected remark:", error);
//       const errorMessage = error.response?.data?.error || "Error deleting connected remark ❌ Please try again.";
//       Swal.fire({
//         title: "Error!",
//         text: errorMessage,
//         icon: "error",
//         confirmButtonColor: "#3085d6",
//         confirmButtonText: "OK",
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-red-600",
//           htmlContainer: "text-xs text-gray-600",
//           confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
//         },
//         buttonsStyling: false,
//       });
//     }
//   };

//   // Master Type Functions
//   const loadMasterTypes = async (): Promise<void> => {
//     try {
//       setIsLoading(true);
//       const data = await masterDataAPI.getAllMasterTypes(activeId);

//       const itemsWithValueCounts = await Promise.all(
//         (data || []).map(async (item: any) => {
//           try {
//             const values = await masterDataAPI.getMasterValues(item.id);
//             return {
//               ...item,
//               values: Array.isArray(values) ? values : [],
//               valueCount: (values && values.length) || 0,
//             } as MasterItem;
//           } catch (error) {
//             console.error(`Error loading values for ${item.id}:`, error);
//             return {
//               ...item,
//               values: [],
//               valueCount: 0,
//             } as MasterItem;
//           }
//         })
//       );

//       setItemsByTab((prev) => ({
//         ...prev,
//         [activeId]: itemsWithValueCounts,
//       }));
//     } catch (error) {
//       console.error("Error loading master types:", error);
//       toast.error("Error loading master types ❌");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadMasterValues = async (masterTypeId: string): Promise<void> => {
//     try {
//       setIsValuesLoading(true);
//       const values = await masterDataAPI.getMasterValues(masterTypeId);

//       setSelectedMaster((prev) => (prev ? { ...prev, values: Array.isArray(values) ? values : [] } : null));
//       setItemsByTab((prev) => ({
//         ...prev,
//         [activeId]: prev[activeId].map((item) =>
//           item.id === masterTypeId ? { ...item, values: Array.isArray(values) ? values : [], valueCount: (values && values.length) || 0 } : item
//         ),
//       }));
//     } catch (error) {
//       console.error("Error loading master values:", error);
//       toast.error("Error loading master values ❌");
//     } finally {
//       setIsValuesLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault();

//     try {
//       if (isEditMode && currentItem) {
//         const updatedItem = await masterDataAPI.updateMasterType(currentItem.id, { name, status });

//         const updatedMasterItem: MasterItem = {
//           ...currentItem,
//           name,
//           status,
//           ...updatedItem,
//         };

//         setItemsByTab((prev) => ({
//           ...prev,
//           [activeId]: prev[activeId].map((item) => (item.id === currentItem.id ? updatedMasterItem : item)),
//         }));

//         if (selectedMaster?.id === currentItem.id) {
//           setSelectedMaster((prev) => (prev ? { ...prev, name, status } : null));
//         }

//         toast.success("Master type updated successfully ✅");
//       } else {
//         const newItem = await masterDataAPI.createMasterType({ tabId: activeId, name, status });

//         if (!newItem?.id) {
//           await loadMasterTypes();
//           toast.success("Master type created successfully ✅");
//           resetForm();
//           return;
//         }

//         const newMasterItem: MasterItem = {
//           id: newItem.id,
//           name,
//           status,
//           values: [],
//           valueCount: 0,
//           ...newItem,
//         };

//         setItemsByTab((prev) => ({
//           ...prev,
//           [activeId]: [...prev[activeId], newMasterItem],
//         }));

//         toast.success("Master type created successfully ✅");
//       }

//       resetForm();
//     } catch (error: any) {
//       console.error("Error saving master type:", error);
//       const errorMessage = error.response?.data?.error || "Error saving master type ❌ Please try again.";
//       toast.error(errorMessage);
//     }
//   };

//   const handleEdit = (item: MasterItem): void => {
//     setCurrentItem(item);
//     setName(item.name);
//     setStatus(item.status);
//     setIsEditMode(true);
//     setIsModalOpen(true);
//   };

// const handleDelete = async (id: string): Promise<void> => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You are about to delete this master type. This action cannot be undone!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//       background: "#fff",
//       backdrop: `rgba(0,0,0,0.4)`,
//       width: "400px",
//       padding: "1.5rem",
//       customClass: {
//         popup: "rounded-xl shadow-2xl",
//         title: "text-lg font-bold text-gray-800",
//         htmlContainer: "text-sm text-gray-600 my-2",
//         confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
//         cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
//         actions: "flex justify-center gap-2 mt-4",
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await masterDataAPI.deleteMasterType(id);
//       await loadMasterTypes();

//       if (selectedMaster?.id === id) {
//         setCurrentView("list");
//         setSelectedMaster(null);
//         setSelectedValueIds([]);
//       }

//       Swal.fire({
//         title: "Deleted!",
//         text: "Master type has been deleted successfully.",
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-green-600",
//           htmlContainer: "text-xs text-gray-600",
//         },
//       });
//     } catch (error: any) {
//       console.error("Error deleting master type:", error);
//       const errorMessage = error.response?.data?.error || "Error deleting master type ❌ Please try again.";
//       Swal.fire({
//         title: "Error!",
//         text: errorMessage,
//         icon: "error",
//         confirmButtonColor: "#3085d6",
//         confirmButtonText: "OK",
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-red-600",
//           htmlContainer: "text-xs text-gray-600",
//           confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
//         },
//         buttonsStyling: false,
//       });
//     }
//   };

//   const handleValueSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault();

//     if (!selectedMaster?.id) {
//       toast.error("Invalid master. Please refresh or select a valid master before adding values ❌");
//       return;
//     }

//     try {
//       if (editingValue) {
//         const updatedValue = await masterDataAPI.updateMasterValue(editingValue.id, {
//           value: valueInput,
//           status: valueStatus,
//         });

//         const updatedValueData: Value = {
//           id: updatedValue.id || editingValue.id,
//           value: updatedValue.value || valueInput,
//           status: updatedValue.status || valueStatus,
//           ...updatedValue,
//         };

//         setItemsByTab((prev) => ({
//           ...prev,
//           [activeId]: prev[activeId].map((item) =>
//             item.id === selectedMaster.id ? { ...item, values: item.values.map((v) => (v.id === editingValue.id ? updatedValueData : v)) } : item
//           ),
//         }));
//         setSelectedMaster((prev) =>
//           prev ? { ...prev, values: prev.values.map((v) => (v.id === editingValue.id ? updatedValueData : v)) } : prev
//         );

//         toast.success("Value updated successfully ✅");
//       } else {
//         const newValue = await masterDataAPI.createMasterValue(selectedMaster.id, {
//           value: valueInput,
//           status: valueStatus,
//         });

//         if (!newValue?.id) {
//           await loadMasterValues(selectedMaster.id);
//           toast.success("Value created successfully ✅");
//           resetValueForm();
//           return;
//         }

//         const newValueData: Value = {
//           id: newValue.id,
//           value: newValue.value || valueInput,
//           status: newValue.status || valueStatus,
//           ...newValue,
//         };

//         setItemsByTab((prev) => ({
//           ...prev,
//           [activeId]: prev[activeId].map((item) =>
//             item.id === selectedMaster.id ? { ...item, values: [...item.values, newValueData], valueCount: item.valueCount + 1 } : item
//           ),
//         }));
//         setSelectedMaster((prev) => (prev ? { ...prev, values: [...prev.values, newValueData] } : prev));

//         toast.success("Value created successfully ✅");
//       }

//       resetValueForm();
//     } catch (error: any) {
//       console.error("Error saving value:", error);
//       const errorMessage = error.response?.data?.error || "Error saving value ❌ Please try again.";
//       toast.error(errorMessage);
//     }
//   };

//   const handleEditValue = (value: Value): void => {
//     setValueInput(value.value);
//     setValueStatus(value.status);
//     setEditingValue(value);
//     setIsValueModalOpen(true);
//   };

//  const handleDeleteValue = async (valueId: string): Promise<void> => {
//     if (!selectedMaster) return;

//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You are about to delete this value. This action cannot be undone!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//       background: "#fff",
//       backdrop: `rgba(0,0,0,0.4)`,
//       width: "400px",
//       padding: "1.5rem",
//       customClass: {
//         popup: "rounded-xl shadow-2xl",
//         title: "text-lg font-bold text-gray-800",
//         htmlContainer: "text-sm text-gray-600 my-2",
//         confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
//         cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
//         actions: "flex justify-center gap-2 mt-4",
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await masterDataAPI.deleteMasterValue(valueId);
//       await loadMasterValues(selectedMaster.id);
//       setSelectedValueIds((prev) => prev.filter((id) => id !== valueId));
//       Swal.fire({
//         title: "Deleted!",
//         text: "Value has been deleted successfully.",
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-green-600",
//           htmlContainer: "text-xs text-gray-600",
//         },
//       });
//     } catch (error: any) {
//       console.error("Error deleting value:", error);
//       const errorMessage = error.response?.data?.error || "Error deleting value ❌ Please try again.";
//       Swal.fire({
//         title: "Error!",
//         text: errorMessage,
//         icon: "error",
//         confirmButtonColor: "#3085d6",
//         confirmButtonText: "OK",
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-red-600",
//           htmlContainer: "text-xs text-gray-600",
//           confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
//         },
//         buttonsStyling: false,
//       });
//     }
//   };

// const handleBulkDelete = async (): Promise<void> => {
//     if (!selectedMaster || selectedValueIds.length === 0 || isConnectedRemarkTab) return;

//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: `You are about to delete ${selectedValueIds.length} selected values. This action cannot be undone!`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: `Yes, delete ${selectedValueIds.length} value(s)!`,
//       cancelButtonText: "Cancel",
//       background: "#fff",
//       backdrop: `rgba(0,0,0,0.4)`,
//       width: "400px",
//       padding: "1.5rem",
//       customClass: {
//         popup: "rounded-xl shadow-2xl",
//         title: "text-lg font-bold text-gray-800",
//         htmlContainer: "text-sm text-gray-600 my-2",
//         confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
//         cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
//         actions: "flex justify-center gap-2 mt-4",
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       const count = selectedValueIds.length;
//       await Promise.all(selectedValueIds.map((id) => masterDataAPI.deleteMasterValue(id)));
//       await loadMasterValues(selectedMaster.id);
//       setSelectedValueIds([]);
//       Swal.fire({
//         title: "Deleted!",
//         text: `${count} selected value(s) have been deleted successfully.`,
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-green-600",
//           htmlContainer: "text-xs text-gray-600",
//         },
//       });
//     } catch (error: any) {
//       console.error("Error deleting values:", error);
//       const errorMessage = error.response?.data?.error || "Error deleting selected values ❌ Please try again.";
//       Swal.fire({
//         title: "Error!",
//         text: errorMessage,
//         icon: "error",
//         confirmButtonColor: "#3085d6",
//         confirmButtonText: "OK",
//         width: "350px",
//         padding: "1rem",
//         customClass: {
//           popup: "rounded-xl shadow-2xl",
//           title: "text-base font-bold text-red-600",
//           htmlContainer: "text-xs text-gray-600",
//           confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
//         },
//         buttonsStyling: false,
//       });
//     }
//   };

//   const resetForm = (): void => {
//     setName("");
//     setStatus("Active");
//     setIsModalOpen(false);
//     setIsEditMode(false);
//     setCurrentItem(null);
//     setCurrentConnectedRemark(null);
//   };

//   const resetValueForm = (): void => {
//     setValueInput("");
//     setValueStatus("Active");
//     setIsValueModalOpen(false);
//     setEditingValue(null);
//   };

//   const handleCardClick = async (master: MasterItem): Promise<void> => {
//     if (isConnectedRemarkTab || isSocietyTab) return;

//     setSelectedMaster(master);
//     setCurrentView("values");
//     setSearchTerm("");
//     setSelectedValueIds([]);
//     await loadMasterValues(master.id);
//   };

//   const handleBackToList = (): void => {
//     setCurrentView("list");
//     setSelectedMaster(null);
//     setSearchTerm("");
//     setSelectedValueIds([]);
//   };

//   const handleExport = async (): Promise<void> => {
//     if (!selectedMaster) return;

//     // Export all values (not just filtered ones)
//     const valuesToExport = selectedMaster.values.map(v => ({
//       'Value': v.value,
//       'Status': v.status,
//     }));

//     if (valuesToExport.length === 0) {
//       toast.warn("No values to export.");
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(valuesToExport);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, selectedMaster.name);
//     XLSX.writeFile(wb, `${selectedMaster.name}_values.xlsx`);
//     toast.success(`Values exported successfully for "${selectedMaster.name}" ✅`);
//   };

//   // 🔥 UPDATED: Export with amenities for society
//   const handleMasterExport = async (): Promise<void> => {
//     if (isConnectedRemarkTab) {
//       // Export connected remarks
//       const dataToExport = filteredConnectedRemarks.map(remark => ({
//         'Master Tab Id': remark.tab_id || remark.tabId || 'N/A',
//         'Master Type 1': remark.type1Name || 'N/A',
//         'Master Value 1': remark.value1Name || 'N/A',
//         'Master Type 2': remark.type2Name || 'N/A',
//         'Master Value 2': remark.value2Name || 'N/A',
//         'Remarks': typeof remark.remarks === 'string' ? remark.remarks : JSON.stringify(remark.remarks),
//         'Status': remark.status,
//       }));

//       if (dataToExport.length === 0) {
//         toast.warn("No data to export.");
//         return;
//       }

//       const ws = XLSX.utils.json_to_sheet(dataToExport);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Connected Remarks');
//       XLSX.writeFile(wb, `Connected_Remarks_${Date.now()}.xlsx`);
//       toast.success("Connected remarks exported successfully ✅");
//       return;
//     }

//     if (isSocietyTab) {
//       // 🆕 Export societies with amenities
//       const dataToExport = filteredSocieties.map(society => ({
//         'Society Name': society.societyName || '',
//         'Locality': society.locality || '',
//         'City': society.city || '',
//         'Pincode': society.pincode || '',
//         'Amenities': (society.amenities || []).join(', '),
//         'Status': society.status || 'Active',
//       }));

//       if (dataToExport.length === 0) {
//         toast.warn("No data to export.");
//         return;
//       }

//       const ws = XLSX.utils.json_to_sheet(dataToExport);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Societies');
//       XLSX.writeFile(wb, `Societies_${Date.now()}.xlsx`);
//       toast.success(`${dataToExport.length} societies exported successfully ✅`);
//       return;
//     }

//     // Master types export
//     const dataToExport = filteredMasterItems.map(item => ({
//       'Name': item.name,
//       'Status': item.status,
//       'Value Count': item.valueCount,
//     }));

//     if (dataToExport.length === 0) {
//       toast.warn("No data to export.");
//       return;
//     }

//     const ws = XLSX.utils.json_to_sheet(dataToExport);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, activeTab.title);
//     XLSX.writeFile(wb, `${activeTab.title}_master_types.xlsx`);
//     toast.success("Master types exported successfully ✅");
//   };

//   const handleImport = async (file: File): Promise<void> => {
//     try {
//       if (importType === "master") {
//         const response = await masterDataAPI.importMasterTypes(activeId, file);

//         // Handle response
//         if (response?.imported === 0 && response?.skipped > 0) {
//           toast.warning(response.message || "All records were duplicates");
//         } else if (response?.imported > 0) {
//           toast.success(response.message || "Master types imported successfully ✅");
//         } else {
//           toast.success("Master types imported successfully ✅");
//         }

//         // Refresh data
//         if (isConnectedRemarkTab) {
//           await loadConnectedRemarks();
//         } else if (isSocietyTab) {
//           await loadSocieties();
//         } else {
//           await loadMasterTypes();
//         }
//       } else {
//         // Import Values
//         if (!selectedMaster) {
//           toast.error("Please select a master first ❌");
//           return;
//         }

//         const response = await masterDataAPI.importMasterValues(selectedMaster.id, file);

//         if (response?.imported === 0 && response?.skipped > 0) {
//           toast.warning(response.message || "All values were duplicates");
//         } else if (response?.imported > 0) {
//           toast.success(response.message || "Values imported successfully ✅");
//         } else {
//           toast.success(`Values imported successfully for "${selectedMaster.name}" ✅`);
//         }

//         await loadMasterValues(selectedMaster.id);
//       }
//     } catch (error: any) {
//       console.error(`Error importing ${importType}:`, error);
//       const errorMessage = error.response?.data?.error || `Failed to import ${importType}`;
//       toast.error(errorMessage);
//       throw error; // Re-throw so modal knows it failed
//     }
//   };

//   const toggleSelectAll = (): void => {
//     if (isAllSelected) {
//       setSelectedValueIds([]);
//     } else {
//       setSelectedValueIds(selectedMaster?.values.map((v) => v.id) || []);
//     }
//   };

//   const toggleSelectValue = (id: string): void => {
//     setSelectedValueIds((prev) => (prev.includes(id) ? prev.filter((valId) => valId !== id) : [...prev, id]));
//   };

//   const filteredValues: Value[] =
//     selectedMaster?.values
//       ?.filter((value) =>
//         value.value.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//       .sort((a, b) => {
//         const numA = parseInt(a.value);
//         const numB = parseInt(b.value);
//         return numA - numB;
//       }) || [];

//   const filteredMasterItems = itemsByTab[activeId].filter((item) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const filteredConnectedRemarks = connectedRemarks.filter((remark) => {
//     const searchLower = searchTerm.toLowerCase();

//     const getSearchableText = (r: any): string => {
//       if (!r) return "";
//       if (Array.isArray(r)) {
//         return r
//           .map((x) => {
//             if (typeof x === "object" && x !== null) {
//               return x.note || x.text || x.remark || "";
//             }
//             return String(x || "");
//           })
//           .join(" ");
//       }
//       if (typeof r === "object" && r !== null) {
//         return (r as any).note || (r as any).text || (r as any).remark || "";
//       }
//       return String(r);
//     };

//     const remarksText = getSearchableText(remark.remarks);

//     return (
//       (remark.type1Name?.toLowerCase() || "").includes(searchLower) ||
//       (remark.value1Name?.toLowerCase() || "").includes(searchLower) ||
//       (remark.type2Name?.toLowerCase() || "").includes(searchLower) ||
//       (remark.value2Name?.toLowerCase() || "").includes(searchLower) ||
//       remarksText.toLowerCase().includes(searchLower)
//     );
//   });

//   const filteredSocieties = societies.filter((society) => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       society.societyName.toLowerCase().includes(searchLower) ||
//       society.locality.toLowerCase().includes(searchLower) ||
//       society.city.toLowerCase().includes(searchLower) ||
//       society.pincode.includes(searchLower)
//     );
//   });

//   // 🆕 View Society Modal Component
//   const ViewSocietyModal = () => {
//     if (!viewSociety) return null;

//     return (
//       <Modal
//         isOpen={isViewModalOpen}
//         onClose={() => setIsViewModalOpen(false)}
//         showHeader={false}
//         showCloseButton={false}
//         width="max-w-2xl"
//       >
//         {/* Header - Compact */}
//         <div className="sticky top-0 z-10 flex items-center justify-between px-3 sm:px-4 py-2 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
//           <div className="flex items-center gap-2 min-w-0">
//             <div className="w-0.5 h-5 rounded-full bg-[#e67e22] flex-shrink-0" />
//             <div className="min-w-0">
//               <h2 className="text-xs sm:text-sm font-bold text-white truncate">{viewSociety.societyName}</h2>
//               <p className="text-[8px] text-gray-400 leading-none">Society Details</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setIsViewModalOpen(false)}
//             className="p-1 rounded hover:bg-white/10 transition-colors text-white flex-shrink-0"
//           >
//             <X size={16} />
//           </button>
//         </div>

//         {/* Body - Ultra Compact */}
//         <div className="p-3 sm:p-4 space-y-3">
//           {/* Status Badge - Compact */}
//           <div className="flex flex-wrap justify-between items-center gap-1.5">
//             <div className="flex items-center gap-1.5">
//               <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${viewSociety.status === 'Active'
//                 ? 'bg-green-50 text-green-700 border-green-200'
//                 : 'bg-red-50 text-red-700 border-red-200'
//                 }`}>
//                 <span className={`w-1 h-1 rounded-full ${viewSociety.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
//                 {viewSociety.status || 'Active'}
//               </span>
//             </div>
//             {viewSociety.createdAt && (
//               <span className="text-[8px] text-gray-400">
//                 Created: {new Date(viewSociety.createdAt).toLocaleDateString()}
//               </span>
//             )}
//           </div>

//           {/* Details Grid - Compact Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             {/* Society Name */}
//             <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
//               <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-0.5">
//                 <Building2 size={11} className="text-[#e67e22] flex-shrink-0" />
//                 Society Name
//               </div>
//               <p className="text-xs font-semibold text-gray-800 truncate">{viewSociety.societyName}</p>
//             </div>

//             {/* Locality */}
//             <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
//               <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-0.5">
//                 <MapPin size={11} className="text-[#e67e22] flex-shrink-0" />
//                 Locality
//               </div>
//               <p className="text-xs text-gray-800 truncate">{viewSociety.locality}</p>
//             </div>

//             {/* City */}
//             <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
//               <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-0.5">
//                 <Map size={11} className="text-[#e67e22] flex-shrink-0" />
//                 City
//               </div>
//               <p className="text-xs text-gray-800 truncate">{viewSociety.city}</p>
//             </div>

//             {/* Pincode */}
//             <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
//               <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-0.5">
//                 <Hash size={11} className="text-[#e67e22] flex-shrink-0" />
//                 Pincode
//               </div>
//               <p className="text-xs text-gray-800 truncate">{viewSociety.pincode}</p>
//             </div>
//           </div>

//           {/* Amenities Section - Compact */}
//           <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
//             <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-1">
//               <Package size={11} className="text-[#e67e22] flex-shrink-0" />
//               Amenities ({viewSociety.amenities?.length || 0})
//             </div>
//             {viewSociety.amenities && viewSociety.amenities.length > 0 ? (
//               <div className="flex flex-wrap gap-1">
//                 {viewSociety.amenities.map((amenity, idx) => (
//                   <span
//                     key={idx}
//                     className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[9px] font-medium border border-purple-200"
//                   >
//                     <Check size={9} className="text-purple-400 flex-shrink-0" />
//                     {amenity}
//                   </span>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-xs text-gray-400">No amenities added</p>
//             )}
//           </div>

//           {/* Images Section - Compact */}
//           {viewSociety.imageUrls && viewSociety.imageUrls.length > 0 && (
//             <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
//               <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-1">
//                 <ImageIcon size={11} className="text-[#e67e22] flex-shrink-0" />
//                 Images ({viewSociety.imageUrls.length})
//               </div>
//               <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
//             {viewSociety.imageUrls.slice(0, 6).map((img: any, idx) => {
//   const url = typeof img === 'string' ? img : img.url;
//   const label = typeof img === 'string' ? '' : img.label;
//   const mediaType = typeof img === 'string' ? 'image' : (img.type === 'video' ? 'video' : 'image');
//   const ytEmbed = mediaType === 'video' ? getYouTubeEmbedUrl(url) : null;
//   return (
//     <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
//       {mediaType === 'video' ? (
//         ytEmbed ? (
//           <iframe src={ytEmbed} className="w-full h-full" frameBorder="0" allow="autoplay; encrypted-media" />
//         ) : (
//           <video src={url} className="w-full h-full object-cover" muted controls />
//         )
//       ) : (
//         <img
//           src={url}
//           alt={`${viewSociety.societyName} ${idx + 1}`}
//           className="w-full h-full object-cover"
//           onError={(e) => {
//             (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
//           }}
//         />
//       )}
//       {label && (
//         <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[7px] px-1 py-0.5 truncate text-center">
//           {label}
//         </div>
//       )}
//     </div>
//   );
// })}
//                 {viewSociety.imageUrls.length > 6 && (
//                   <div className="aspect-square rounded-md border border-gray-200 flex items-center justify-center bg-gray-100">
//                     <span className="text-[10px] font-semibold text-gray-500">+{viewSociety.imageUrls.length - 6}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer - Compact */}
//         <div className="px-3 sm:px-4 py-2 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-1.5 sm:gap-2">
//           <button
//             onClick={() => setIsViewModalOpen(false)}
//             className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
//           >
//             Close
//           </button>
//           <button
//             onClick={() => {
//               setIsViewModalOpen(false);
//               handleEditSociety(viewSociety);
//             }}
//             className="px-3 py-1.5 text-xs font-medium text-white bg-[#0f2b3d] rounded-lg hover:bg-[#1a3d52] transition-colors flex items-center justify-center gap-1.5 order-1 sm:order-2"
//           >
//             <Edit2 size={12} className="flex-shrink-0" />
//             Edit Society
//           </button>
//         </div>
//       </Modal>
//     );
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <header className="p-4 border-b bg-white shadow-sm">
//         <h1 className="text-xl font-semibold">Master Data Management</h1>
//       </header>

//       <nav className="bg-white border-b">
//         <div className="px-3 py-2 flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar">
//           {tabs.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => {
//                 setActiveId(t.id as TabId);
//                 setCurrentView("list");
//                 setSelectedMaster(null);
//                 setSelectedValueIds([]);
//                 setSearchTerm("");
//               }}
//               className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors duration-200 ${t.id === activeId
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//             >
//               {t.title}
//             </button>
//           ))}
//         </div>
//       </nav>

//       <main className="p-3 sm:p-4">
//         {currentView === "list" ? (
//           <>
//             <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">

//               {/* 🔹 MOBILE: Heading + Create button in same row */}
//               <div className="flex items-center justify-between md:block">
//                 <h2 className="text-base sm:text-lg font-semibold truncate">
//                   {activeTab.title}
//                 </h2>

//                 {/* Create button (mobile only) */}
//                 <div className="md:hidden">
//                   <button
//                     onClick={() => setIsModalOpen(true)}
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
//                   >
//                     <Plus size={14} />
//                     <span className="whitespace-nowrap">
//                       {isConnectedRemarkTab
//                         ? "Add Connected Remark"
//                         : isSocietyTab
//                           ? "Add Society"
//                           : `Create ${activeTab.title} types`}
//                     </span>
//                   </button>
//                 </div>
//               </div>

//               {/* 🔹 RIGHT SECTION */}
//               <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 md:gap-3 md:flex-wrap w-full md:w-auto">

//                 {/* Search */}
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full sm:w-56 md:w-64 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />

//                 {/* 🔹 Import + Export */}
//                 {!isConnectedRemarkTab && !isSocietyTab && (
//                   <div className="flex gap-2 w-full md:w-auto">
//                     <button
//                       onClick={() => {
//                         setImportType("master");
//                         setIsImportModalOpen(true);
//                       }}
//                       className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
//                     >
//                       <Upload size={14} />
//                       <span className="whitespace-nowrap">
//                         Import {activeTab.title}
//                       </span>
//                     </button>

//                     <button
//                       onClick={handleMasterExport}
//                       disabled={!filteredMasterItems.length}
//                       className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
//                     >
//                       <Download size={14} />
//                       <span className="whitespace-nowrap">Export</span>
//                     </button>
//                   </div>
//                 )}

//                 {/* 🔹 Society Tab - Export button */}
//                 {isSocietyTab && (
//                   <div className="flex gap-2 w-full md:w-auto">
//                     {/* 🆕 IMPORT BUTTON — Export ke bajule, Add Society se pehle */}
//                     <button
//                       onClick={() => setIsSocietyImportModalOpen(true)}
//                       className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
//                     >
//                       <Upload size={14} />
//                       <span className="whitespace-nowrap">Import Societies</span>
//                     </button>

//                     <button
//                       onClick={handleMasterExport}
//                       disabled={!filteredSocieties.length}
//                       className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
//                     >
//                       <Download size={14} />
//                       <span className="whitespace-nowrap">Export Societies</span>
//                     </button>
//                   </div>
//                 )}

//                 {/* 🔹 Connected Remark Tab - Export button */}
//                 {isConnectedRemarkTab && (
//                   <div className="flex gap-2 w-full md:w-auto">
//                     <button
//                       onClick={handleMasterExport}
//                       disabled={!filteredConnectedRemarks.length}
//                       className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
//                     >
//                       <Download size={14} />
//                       <span className="whitespace-nowrap">Export Remarks</span>
//                     </button>
//                   </div>
//                 )}

//                 {/* 🔹 DESKTOP: Create button */}
//                 <button
//                   onClick={() => setIsModalOpen(true)}
//                   className="hidden md:flex w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg items-center justify-center gap-2 text-xs"
//                 >
//                   <Plus size={14} />
//                   <span className="whitespace-nowrap">
//                     {isConnectedRemarkTab
//                       ? "Add Connected Remark"
//                       : isSocietyTab
//                         ? "Add Society"
//                         : `Create ${activeTab.title} types`}
//                   </span>
//                 </button>

//               </div>
//             </div>

//             {isLoading ? (
//               <div className="text-center py-10 sm:py-12">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
//                 <p className="mt-2 text-gray-500 text-sm">Loading...</p>
//               </div>
//             ) : isConnectedRemarkTab ? (
//               <div className="bg-white rounded-lg shadow-sm">
//                 {filteredConnectedRemarks.length === 0 ? (
//                   <div className="text-center py-10 sm:py-12 text-gray-500">
//                     <Plus size={40} className="mx-auto mb-3 opacity-50" />
//                     {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No connected remarks created yet</p>}
//                   </div>
//                 ) : (
//                   <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
//                     <div className="overflow-auto max-h-[380px] sm:max-h-[450px]">
//                       <table className="min-w-[1200px] w-full border-collapse table-fixed">
//                         <thead className="sticky top-0 z-10">
//                           <tr className="border-b bg-gray-50">
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">#</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Tab Id</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Type 1</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Value 1</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Type 2</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Value 2</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Remarks</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-100">
//                           {filteredConnectedRemarks.map((remark, index) => (
//                             <tr key={remark.id} className="border-b hover:bg-gray-50 transition-colors">
//                               <td className="p-3 text-gray-600 text-xs">{index + 1}</td>
//                               <td className="p-3 font-medium text-xs">{remark.tab_id || remark.tabId || "N/A"}</td>
//                               <td className="p-3 font-medium text-xs">{remark.type1Name || "N/A"}</td>
//                               <td className="p-3 font-medium text-xs">{remark.value1Name || "N/A"}</td>
//                               <td className="p-3 font-medium text-xs">{remark.type2Name || "N/A"}</td>
//                               <td className="p-3 font-medium text-xs">{remark.value2Name || "N/A"}</td>
//                               <td className="p-3 font-medium text-xs max-w-xs">
//                                 {(() => {
//                                   if (!remark.remarks || (Array.isArray(remark.remarks) && remark.remarks.length === 0)) {
//                                     return <span className="text-gray-400">No remarks</span>;
//                                   }
//                                   if (Array.isArray(remark.remarks)) {
//                                     return (
//                                       <ol className="list-decimal list-inside space-y-1">
//                                         {remark.remarks.map((remarkText, idx) => {
//                                           const text =
//                                             typeof remarkText === "object" && remarkText !== null
//                                               ? (remarkText as any).note || (remarkText as any).text || (remarkText as any).remark || "Empty remark"
//                                               : String(remarkText || "Empty remark");
//                                           return (
//                                             <li key={idx} className="text-[11px] sm:text-xs text-gray-700 break-words">
//                                               {text}
//                                             </li>
//                                           );
//                                         })}
//                                       </ol>
//                                     );
//                                   }
//                                   if (typeof remark.remarks === "object" && remark.remarks !== null) {
//                                     const r = remark.remarks as Record<string, any>;
//                                     const text = r.note || r.text || r.remark || "Empty remark";
//                                     return <span className="text-[11px] sm:text-xs text-gray-700">{text}</span>;
//                                   }
//                                   return (
//                                     <span className="text-[11px] sm:text-xs text-gray-700">
//                                       {String(remark.remarks ?? "Empty remark")}
//                                     </span>
//                                   );
//                                 })()}
//                               </td>
//                               <td className="p-3">
//                                 <span
//                                   className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium border ${remark.status === "Active"
//                                     ? "bg-green-50 text-green-700 border-green-200"
//                                     : "bg-red-50 text-red-600 border-red-200"
//                                     }`}
//                                 >
//                                   <span className={`w-1.5 h-1.5 rounded-full ${remark.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
//                                   {remark.status}
//                                 </span>
//                               </td>
//                               <td className="p-3">
//                                 <div className="flex gap-2">
//                                   <button
//                                     onClick={() => handleEditConnectedRemark(remark)}
//                                     className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
//                                   >
//                                     <Edit2 size={14} />
//                                   </button>
//                                   <button
//                                     onClick={() => handleDeleteConnectedRemark(remark.id)}
//                                     className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
//                                   >
//                                     <Trash2 size={14} />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                           {filteredConnectedRemarks.length === 0 && (
//                             <tr>
//                               <td colSpan={9} className="p-3 text-center text-xs text-gray-400">
//                                 No data found
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
//                       <span className="text-xs text-gray-400">
//                         Showing <span className="font-medium text-gray-600">{filteredConnectedRemarks.length}</span> records
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : isSocietyTab ? (
//               <div className="bg-white rounded-lg shadow-sm">
//                 {/* Bulk Actions Bar */}
//                 {selectedSocietyIds.length > 0 && (
//                   <div className="flex items-center justify-between p-3 bg-blue-50 border-b">
//                     <div className="flex items-center gap-2">
//                       <input
//                         type="checkbox"
//                         checked={isAllSocietiesSelected}
//                         onChange={toggleSelectAllSocieties}
//                         className="h-4 w-4 rounded border-gray-300"
//                       />
//                       <span className="text-sm text-gray-700">
//                         {selectedSocietyIds.length} society(s) selected
//                       </span>
//                     </div>
//                     <button
//                       onClick={handleBulkDeleteSocieties}
//                       className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs"
//                     >
//                       <Trash2 size={14} />
//                       Delete Selected ({selectedSocietyIds.length})
//                     </button>
//                   </div>
//                 )}

//                 {filteredSocieties.length === 0 ? (
//                   <div className="text-center py-10 sm:py-12 text-gray-500">
//                     <Plus size={40} className="mx-auto mb-3 opacity-50" />
//                     {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No societies created yet</p>}
//                   </div>
//                 ) : (
//                   <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
//                     <div className="overflow-auto max-h-[400px] sm:max-h-[450px]">
//                       <table className="min-w-[900px] w-full border-collapse">
//                         <thead className="sticky top-0 z-10">
//                           <tr className="border-b bg-gray-50">
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">
//                               <input
//                                 type="checkbox"
//                                 checked={isAllSocietiesSelected}
//                                 onChange={toggleSelectAllSocieties}
//                                 className="h-4 w-4 rounded border-gray-300"
//                               />
//                             </th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">#</th>
//                             <th className="w-[20%] text-left p-3 font-medium text-[11px] sm:text-xs">Society Name</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Locality</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">City</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Pincode</th>
//                             <th className="w-[20%] text-left p-3 font-medium text-[11px] sm:text-xs">Amenities</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-100">
//                           {filteredSocieties.map((society, index) => (
//                             <tr
//                               key={society.id}
//                               className="border-b hover:bg-gray-50 transition-colors"
//                             >
//                               <td className="p-3">
//                                 <input
//                                   type="checkbox"
//                                   checked={selectedSocietyIds.includes(society.id!)}
//                                   onChange={() => toggleSelectSociety(society.id!)}
//                                   className="h-4 w-4 rounded border-gray-300"
//                                 />
//                               </td>

//                               <td className="p-3 text-gray-600 text-xs">
//                                 {index + 1}
//                               </td>

//                               {/* 🔥 Clickable Society Name */}
//                               <td className="p-3 font-medium text-xs w-[20%]">
//                                 <button
//                                   onClick={() => handleSocietyNameClick(society)}
//                                   className="text-blue-600 hover:text-blue-800 hover:underline text-left transition-colors font-medium"
//                                 >
//                                   {society.societyName}
//                                 </button>
//                               </td>

//                               <td className="p-3 font-medium text-xs">
//                                 {society.locality}
//                               </td>

//                               <td className="p-3 font-medium text-xs">
//                                 {society.city}
//                               </td>

//                               <td className="p-3 font-medium text-xs">
//                                 {society.pincode}
//                               </td>

//                               {/* Amenities */}
//                               <td className="p-3 min-w-[200px] w-[20%]">
//                                 {society.amenities?.length > 0 ? (
//                                   <div className="flex flex-wrap gap-1">
//                                     {society.amenities.slice(0, 3).map((amenity, idx) => (
//                                       <span
//                                         key={idx}
//                                         className="inline-block px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px] border border-purple-200"
//                                       >
//                                         {amenity}
//                                       </span>
//                                     ))}
//                                     {society.amenities.length > 3 && (
//                                       <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px]">
//                                         +{society.amenities.length - 3}
//                                       </span>
//                                     )}
//                                   </div>
//                                 ) : (
//                                   <span className="text-gray-400 text-xs">—</span>
//                                 )}
//                               </td>

//                               {/* Status */}
//                               <td className="p-3">
//                                 <span
//                                   className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${society.status === "Active"
//                                     ? "bg-green-50 text-green-700 border-green-200"
//                                     : "bg-red-50 text-red-700 border-red-200"
//                                     }`}
//                                 >
//                                   <span
//                                     className={`w-2 h-2 rounded-full ${society.status === "Active"
//                                       ? "bg-green-500"
//                                       : "bg-red-500"
//                                       }`}
//                                   />
//                                   {society.status || "Active"}
//                                 </span>
//                               </td>

//                               {/* Actions */}
//                               <td className="p-3">
//                                 <div className="flex items-center gap-1.5">
//                                   {/* 🆕 View Button */}
//                                   <button
//                                     onClick={() => handleViewSociety(society)}
//                                     className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
//                                     title="View Society"
//                                   >
//                                     <Eye size={15} />
//                                   </button>

//                                   <button
//                                     onClick={() => handleEditSociety(society)}
//                                     className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
//                                     title="Edit Society"
//                                   >
//                                     <Edit2 size={15} />
//                                   </button>

//                                   <button
//                                     onClick={() => handleDeleteSociety(society.id!)}
//                                     className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
//                                     title="Delete Society"
//                                   >
//                                     <Trash2 size={15} />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}

//                           {filteredSocieties.length === 0 && (
//                             <tr>
//                               <td colSpan={9} className="p-6 text-center text-gray-500">
//                                 No societies found
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>

//                     <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
//                       <span className="text-xs text-gray-400">
//                         Showing <span className="font-medium text-gray-600">{filteredSocieties.length}</span> societies
//                       </span>
//                       {selectedSocietyIds.length > 0 && (
//                         <span className="text-xs text-blue-600 font-medium">{selectedSocietyIds.length} selected</span>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-h-[390px] sm:max-h-[480px] overflow-y-auto pr-2">
//                 {filteredMasterItems.length === 0 ? (
//                   <div className="col-span-full text-center py-10 sm:py-12 text-gray-500">
//                     <Plus size={40} className="mx-auto mb-3 opacity-50" />
//                     {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No {activeTab.title} types created yet</p>}
//                   </div>
//                 ) : (
//                   filteredMasterItems.map((item) => (
//                     <div
//                       key={item.id}
//                       className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
//                       onClick={() => handleCardClick(item)}
//                     >
//                       <div className="flex justify-between items-start mb-1">
//                         <h3 className="font-semibold text-sm sm:text-[15px]">{item.name}</h3>
//                         <div className="flex gap-1">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleEdit(item);
//                             }}
//                             className="p-1 text-blue-600 hover:bg-blue-50 rounded"
//                           >
//                             <Edit2 size={14} />
//                           </button>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleDelete(item.id);
//                             }}
//                             className="p-1 text-red-600 hover:bg-red-50 rounded"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <span
//                           className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                             }`}
//                         >
//                           {item.status === "Active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
//                           {item.status}
//                         </span>
//                         <span className="text-[11px] sm:text-xs text-gray-500">{item.valueCount} values</span>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </>
//         ) : (
//           <>
//             <div className="mb-4 sm:mb-6">
//               <button
//                 onClick={handleBackToList}
//                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-3 sm:mb-4"
//               >
//                 <ArrowLeft size={18} className="sm:size-5" />
//                 <span className="text-sm sm:text-base">Back to {activeTab.title}</span>
//               </button>

//               <div className="bg-white rounded-lg p-3 sm:p-3 shadow-sm">

//                 {/* HEADER */}
//                 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-2 sm:mb-2">

//                   {/* TITLE + STATUS */}
//                   <div className="flex items-center justify-between w-full sm:w-auto gap-2">
//                     <h2 className="text-sm sm:text-base font-semibold">
//                       {selectedMaster?.name}
//                     </h2>

//                     <span
//                       className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium sm:mt-2 ${selectedMaster?.status === "Active"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-red-100 text-red-700"
//                         }`}
//                     >
//                       {selectedMaster?.status === "Active" ? (
//                         <CheckCircle size={12} />
//                       ) : (
//                         <XCircle size={12} />
//                       )}
//                       {selectedMaster?.status}
//                     </span>
//                   </div>

//                   {/* RIGHT SECTION */}
//                   <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 md:gap-3 md:flex-wrap w-full sm:w-auto">

//                     <div className="flex flex-row gap-2 w-full sm:w-auto order-1 sm:order-none">
//                       {!isConnectedRemarkTab && (
//                         <>
//                           <button
//                             onClick={() => {
//                               setImportType("values");
//                               setIsImportModalOpen(true);
//                             }}
//                             disabled={!selectedMaster}
//                             className={`flex-1 sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs ${!selectedMaster ? "opacity-50 cursor-not-allowed" : ""
//                               }`}
//                           >
//                             <Upload size={14} />
//                             <span className="whitespace-nowrap">Import Values</span>
//                           </button>

//                           <button
//                             onClick={handleExport}
//                             disabled={!selectedMaster?.values?.length}
//                             className="flex-1 sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
//                           >
//                             <Download size={14} />
//                             <span className="whitespace-nowrap">Export</span>
//                           </button>

//                           <button
//                             onClick={() => setIsValueModalOpen(true)}
//                             className="flex-1 sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
//                           >
//                             <Plus size={14} />
//                             <span className="whitespace-nowrap">Add Value</span>
//                           </button>
//                         </>
//                       )}
//                     </div>

//                     <div className="flex flex-row gap-2 w-full sm:w-auto order-2 sm:order-none">
//                       <input
//                         type="text"
//                         placeholder="Search..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="flex-1 sm:w-56 md:w-64 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />

//                       {!isConnectedRemarkTab && selectedValueIds.length > 0 && (
//                         <button
//                           onClick={handleBulkDelete}
//                           className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs whitespace-nowrap"
//                         >
//                           <Trash2 size={14} />
//                           <span className="whitespace-nowrap">
//                             Delete Selected ({selectedValueIds.length})
//                           </span>
//                         </button>
//                       )}
//                     </div>

//                   </div>
//                 </div>

//                 {isValuesLoading ? (
//                   <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
//                     <p className="mt-2 text-gray-500 text-sm">Loading values...</p>
//                   </div>
//                 ) : filteredValues.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     {selectedMaster?.values?.length === 0 ? (
//                       <>
//                         <Plus size={32} className="mx-auto mb-2 opacity-50" />
//                         <p>No values added yet</p>
//                       </>
//                     ) : (
//                       <p>
//                         No values found matching{" "}
//                         <span className="font-medium">&quot;{searchTerm}&quot;</span>
//                       </p>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
//                     <div className="overflow-auto max-h-[320px] sm:max-h-[410px]">
//                       <table className="min-w-[600px] w-full border-collapse">
//                         <thead className="sticky top-0 z-10">
//                           <tr className="bg-gray-100 border-b border-gray-200">
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">
//                               <div className="flex items-center gap-2">
//                                 <input
//                                   type="checkbox"
//                                   checked={isAllSelected}
//                                   onChange={toggleSelectAll}
//                                   className="h-4 w-4"
//                                 />
//                                 <span>#</span>
//                               </div>
//                             </th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Value</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
//                             <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-100">
//                           {filteredValues.map((value, index) => (
//                             <tr key={value.id} className="border-b hover:bg-gray-50 transition-colors">
//                               <td className="p-3 text-gray-600 text-xs">
//                                 <div className="flex items-center gap-2">
//                                   <input
//                                     type="checkbox"
//                                     checked={selectedValueIds.includes(value.id)}
//                                     onChange={() => toggleSelectValue(value.id)}
//                                     className="h-4 w-4"
//                                   />
//                                   {index + 1}
//                                 </div>
//                               </td>
//                               <td className="p-3 font-medium text-xs">{value.value}</td>
//                               <td className="p-3">
//                                 <span
//                                   className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium border ${value.status === "Active"
//                                     ? "bg-green-50 text-green-700 border-green-200"
//                                     : "bg-red-50 text-red-600 border-red-200"
//                                     }`}
//                                 >
//                                   <span className={`w-1.5 h-1.5 rounded-full ${value.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
//                                   {value.status}
//                                 </span>
//                               </td>
//                               <td className="p-3">
//                                 <div className="flex gap-2">
//                                   <button
//                                     onClick={() => handleEditValue(value)}
//                                     className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
//                                   >
//                                     <Edit2 size={14} />
//                                   </button>
//                                   <button
//                                     onClick={() => handleDeleteValue(value.id)}
//                                     className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
//                                   >
//                                     <Trash2 size={14} />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                           {filteredValues.length === 0 && (
//                             <tr>
//                               <td colSpan={4} className="p-3 text-center text-xs text-gray-400">
//                                 No values found
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
//                       <span className="text-xs text-gray-400">
//                         Showing <span className="font-medium text-gray-600">{filteredValues.length}</span> values
//                       </span>
//                       {selectedValueIds.length > 0 && (
//                         <span className="text-xs text-blue-600 font-medium">{selectedValueIds.length} selected</span>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* View Society Modal */}
//       <ViewSocietyModal />

//       <SocietyImportModal
//         isOpen={isSocietyImportModalOpen}
//         onClose={() => setIsSocietyImportModalOpen(false)}
//         onImported={loadSocieties}
//       />

//       {/* Modal for Master Types */}
//       <Modal
//         isOpen={isModalOpen && !isSocietyTab}
//         onClose={resetForm}
//         showHeader={false}
//         showCloseButton={false}
//       >
//         <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
//           <div className="flex items-center gap-2">
//             <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
//             <h2 className="text-sm font-bold text-white">
//               {isConnectedRemarkTab
//                 ? (isEditMode ? "Edit Connected Remark" : "Add Connected Remark")
//                 : (isEditMode ? "Edit Master Type" : "Create Master Type")}
//             </h2>
//           </div>
//           <button onClick={resetForm} className="p-1 rounded hover:bg-white/10 transition-colors">
//             <X size={16} color="white" />
//           </button>
//         </div>

//         {isConnectedRemarkTab ? (
//           <div className="px-5 py-4">
//             <ConnectedRemarkForm
//               onClose={resetForm}
//               onSubmit={handleConnectedRemarkSubmit}
//               initialData={isEditMode && currentConnectedRemark ? (currentConnectedRemark as any) : null}
//             />
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <div className="space-y-4 px-5 py-4">
//               <div>
//                 <label className="block mb-1 font-medium text-xs">Name</label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1 font-medium text-xs">Status</label>
//                 <select
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
//                 >
//                   Cancel
//                 </button>
//                 {canManageMaster && (
//                   <button
//                     type="submit"
//                     className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
//                   >
//                     {isEditMode ? "Update" : "Create"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </form>
//         )}
//       </Modal>

//       {/* Separate Modal for Society */}
//       <Modal
//         isOpen={isModalOpen && isSocietyTab}
//         onClose={resetSocietyForm}
//         showHeader={false}
//         showCloseButton={false}
//         width="max-w-2xl"
//       >
//         <SocietyForm
//           onClose={resetSocietyForm}
//           onSubmit={handleSocietySubmit}
//           initialData={isEditMode && currentSociety ? currentSociety : null}
//           isEditing={isEditMode}
//           onRefresh={async () => {
//             console.log("Refresh called");
//             await loadSocieties();
//           }}
//         />
//       </Modal>

//       {/* Value Modal */}
//       <Modal isOpen={isValueModalOpen} onClose={resetValueForm} title={`${editingValue ? "Edit" : "Add"} Value`}>
//         <form onSubmit={handleValueSubmit}>
//           <div className="space-y-4 px-5 py-4">
//             <div>
//               <label className="block mb-1 font-medium text-xs">Value</label>
//               <input
//                 type="text"
//                 value={valueInput}
//                 onChange={(e) => setValueInput(e.target.value)}
//                 required
//                 className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
//               />
//             </div>
//             <div>
//               <label className="block mb-1 font-medium text-xs">Status</label>
//               <select
//                 value={valueStatus}
//                 onChange={(e) => setValueStatus(e.target.value)}
//                 className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
//               >
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </select>
//             </div>
//             <div className="flex justify-end gap-2">
//               <button
//                 type="button"
//                 onClick={resetValueForm}
//                 className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
//               >
//                 {editingValue ? "Update" : "Create"}
//               </button>
//             </div>
//           </div>
//         </form>
//       </Modal>

//       {/* Import Modal */}
//       <ImportModal
//         isOpen={isImportModalOpen}
//         onClose={() => setIsImportModalOpen(false)}
//         onImport={handleImport}
//         title={`Import ${importType === "master" ? activeTab.title : (selectedMaster?.name ?? "") + " Values"}`}
//         type={importType}
//       />
//     </div>
//   );
// }




// src/pages/settings/MasterDataPage.tsx
import React, { useState, useEffect, ChangeEvent, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  ArrowLeft,
  Upload,
  Download,
  X,
  Eye,
  Image as ImageIcon,
  MapPin,
  Building2,
  Tag,
  List,
  FileText,
  Home,
  Hash,
  Map,
  Package,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { masterDataAPI } from "@/lib/mastersAPI";
import { ImportModal } from "./master/ImportModal";
import { ConnectedRemarkForm } from "./master/ConnectedRemarkForm";
import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
import { societyAPI } from "@/lib/societyAPI";
import { toast, ToastContentProps } from "react-toastify";
import Swal from "sweetalert2";
import SocietyForm from "./master/SocietyForm";
import * as XLSX from 'xlsx';
import { SocietyImportModal } from "./master/SocietyImportModal";

import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/utils/permission";

const getYouTubeEmbedUrl = (url: string): string | null => {
  const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

type ImportType = "master" | "values";

interface Tab {
  id: string;
  title: string;
}

interface Value {
  id: string;
  value: string;
  status: string;
}

interface MasterItem {
  id: string;
  name: string;
  status: string;
  values: Value[];
  valueCount: number;
  [k: string]: any;
}

interface ItemsByTab {
  property: MasterItem[];
  buyer: MasterItem[];
  seller: MasterItem[];
  lead: MasterItem[];
  common: MasterItem[];
  connectedRemark: MasterItem[];
  society: MasterItem[];
}

interface SocietyData {
  societyName: string;
  locality: string;
  city: string;
  pincode: string;
  id?: string;
  status?: string;
  createdAt?: string;
  amenities?: string[];
  imageUrls?: (string | { url: string; label: string; type: 'image' | 'video' })[];
}

interface ConnectedRemark {
  id: string;
  tabId?: string;
  tab_id?: string;
  type1: string;
  value1: string;
  type2: string;
  value2: string;
  remarks?: string | Array<string | Record<string, any>> | Record<string, any> | null;
  status: string;
  type1Name?: string;
  type2Name?: string;
  value1Name?: string;
  value2Name?: string;
  [k: string]: any;
}

type TabId = keyof ItemsByTab;

interface AdvancedFilters {
  status: string; // 'All' | 'Active' | 'Inactive'
  city: string;
  locality: string;
  pincode: string;
  selectedAmenities: string[];
  hasMedia: string; // 'All' | 'With Media' | 'Without Media'
  tabId: string;
  type1: string;
  type2: string;
  minValues: string;
  maxValues: string;
  hasValues: string; // 'All' | 'With Values' | 'No Values'
  valueStatus: string; // 'All' | 'Active' | 'Inactive'
  valueType: string; // 'All' | 'Numeric' | 'Alphabetic'
}

const initialFilters: AdvancedFilters = {
  status: "All",
  city: "",
  locality: "",
  pincode: "",
  selectedAmenities: [],
  hasMedia: "All",
  tabId: "All",
  type1: "",
  type2: "",
  minValues: "",
  maxValues: "",
  hasValues: "All",
  valueStatus: "All",
  valueType: "All",
};

export default function MasterDataPage(): JSX.Element {

  const { user } = useAuth();
  
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<AdvancedFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [amenitiesSearch, setAmenitiesSearch] = useState<string>("");

  useEffect(() => {
    if (showFilters) {
      setDraftFilters(appliedFilters);
    }
  }, [showFilters, appliedFilters]);

  const canManageMaster = can(user, "settings_master.manage");
  const canImportMaster = can(user, "settings_master.import");
  const canExportMaster = can(user, "settings_master.export");

  if (!canManageMaster) {
    return (
      <div className="h-full flex items-center justify-center">
        <h3>Access Denied</h3>
        <p>You don't have permission to access Master Data.</p>
      </div>
    );
  }
  const [tabs] = useState<Tab[]>([
    { id: "property", title: "Property Master" },
    { id: "buyer", title: "Buyer Master" },
    { id: "seller", title: "Seller Master" },
    { id: "lead", title: "Lead Master" },
    { id: "common", title: "Common Master" },
    { id: "connectedRemark", title: "Connected Remark" },
    { id: "society", title: "Society with locality" },
  ]);

  const [activeId, setActiveId] = useState<TabId>(() => {
    const savedTab =
      typeof window !== "undefined" ? localStorage.getItem("masterDataActiveTab") : null;
    return (savedTab && tabs.some((t) => t.id === savedTab)) ? (savedTab as TabId) : (tabs[0].id as TabId);
  });

  const activeTab: Tab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  const [itemsByTab, setItemsByTab] = useState<ItemsByTab>({
    property: [],
    buyer: [],
    seller: [],
    lead: [],
    common: [],
    connectedRemark: [],
    society: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValuesLoading, setIsValuesLoading] = useState<boolean>(false);

  const [currentView, setCurrentView] = useState<"list" | "values">("list");
  const [selectedMaster, setSelectedMaster] = useState<MasterItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSocietyImportModalOpen, setIsSocietyImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<ImportType>("master");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<MasterItem | null>(null);
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<string>("Active");

  const [isValueModalOpen, setIsValueModalOpen] = useState<boolean>(false);
  const [valueInput, setValueInput] = useState<string>("");
  const [valueStatus, setValueStatus] = useState<string>("Active");
  const [editingValue, setEditingValue] = useState<Value | null>(null);

  const isConnectedRemarkTab = activeId === "connectedRemark";
  const isSocietyTab = activeId === "society";
  const [selectedValueIds, setSelectedValueIds] = useState<string[]>([]);
  const isAllSelected =
    selectedMaster?.values?.length > 0 && selectedValueIds.length === (selectedMaster.values?.length ?? 0);

  const [connectedRemarks, setConnectedRemarks] = useState<ConnectedRemark[]>([]);
  const [currentConnectedRemark, setCurrentConnectedRemark] = useState<ConnectedRemark | null>(null);
  const [selectedRemarkIds, setSelectedRemarkIds] = useState<string[]>([]);
  const [isAllRemarksSelected, setIsAllRemarksSelected] = useState(false);

  const [societies, setSocieties] = useState<SocietyData[]>([]);
  const [currentSociety, setCurrentSociety] = useState<SocietyData | null>(null);
  const [viewSociety, setViewSociety] = useState<SocietyData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

  const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([]);
  const [isAllSocietiesSelected, setIsAllSocietiesSelected] = useState(false);

  const uniqueCities = useMemo(() => {
    const list = societies.map((s) => s.city).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [societies]);

  const uniqueLocalities = useMemo(() => {
    const subset = draftFilters.city ? societies.filter((s) => s.city === draftFilters.city) : societies;
    const list = subset.map((s) => s.locality).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [societies, draftFilters.city]);

  const uniqueAmenities = useMemo(() => {
    const set = new Set<string>();
    societies.forEach((s) => {
      if (s.amenities) {
        s.amenities.forEach((a) => {
          if (a) set.add(a.trim());
        });
      }
    });
    return Array.from(set).sort();
  }, [societies]);

  const uniqueTabIds = useMemo(() => {
    const list = connectedRemarks.map((r) => r.tab_id || r.tabId).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [connectedRemarks]);

  const uniqueType1Names = useMemo(() => {
    const list = connectedRemarks.map((r) => r.type1Name).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [connectedRemarks]);

  const uniqueType2Names = useMemo(() => {
    const list = connectedRemarks.map((r) => r.type2Name).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [connectedRemarks]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentView === "values") {
      if (appliedFilters.valueStatus !== "All") count++;
      if (appliedFilters.valueType !== "All") count++;
    } else {
      if (appliedFilters.status !== "All") count++;
      if (isSocietyTab) {
        if (appliedFilters.city) count++;
        if (appliedFilters.locality) count++;
        if (appliedFilters.pincode) count++;
        if (appliedFilters.selectedAmenities.length > 0) count++;
        if (appliedFilters.hasMedia !== "All") count++;
      } else if (isConnectedRemarkTab) {
        if (appliedFilters.tabId !== "All") count++;
        if (appliedFilters.type1) count++;
        if (appliedFilters.type2) count++;
      } else {
        if (appliedFilters.minValues !== "") count++;
        if (appliedFilters.maxValues !== "") count++;
        if (appliedFilters.hasValues !== "All") count++;
      }
    }
    return count;
  }, [appliedFilters, currentView, isSocietyTab, isConnectedRemarkTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("masterDataActiveTab", activeId);
    }
  }, [activeId]);

  useEffect(() => {
    if (isConnectedRemarkTab) {
      loadConnectedRemarks();
    } else if (isSocietyTab) {
      loadSocieties();
    } else {
      loadMasterTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Society Functions
  const loadSocieties = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await societyAPI.getAllSocieties();
      setSocieties(data);
    } catch (error) {
      console.error("Error loading societies:", error);
      toast.error("Error loading societies ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocietySubmit = async (formData: SocietyData): Promise<void> => {
    try {
      if (isEditMode && currentSociety) {
        await societyAPI.updateSociety(currentSociety.id!, formData);
        toast.success("Society updated successfully ✏️");
      } else {
        await societyAPI.createSociety(formData);
        toast.success("Society added successfully ✅");
      }
      await loadSocieties();
      resetSocietyForm();
    } catch (error: any) {
      console.error("Error saving society:", error);
      const errorMessage = error.response?.data?.error || "Error saving society ❌ Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEditSociety = (society: SocietyData): void => {
    setCurrentSociety(society);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // 🆕 View Society Handler
  const handleViewSociety = (society: SocietyData): void => {
    setViewSociety(society);
    setIsViewModalOpen(true);
  };

  // 🆕 Handle click on society name
  const handleSocietyNameClick = (society: SocietyData): void => {
    handleViewSociety(society);
  };

const handleDeleteSociety = async (societyId: string): Promise<void> => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this society. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await societyAPI.deleteSociety(societyId);
      await loadSocieties();
      Swal.fire({
        title: "Deleted!",
        text: "Society has been deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (error: any) {
      console.error("Error deleting society:", error);
      const errorMessage = error.response?.data?.error || "Error deleting society ❌ Please try again.";
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    }
  };


  // Toggle select all societies
  const toggleSelectAllSocieties = () => {
    if (isAllSocietiesSelected) {
      setSelectedSocietyIds([]);
      setIsAllSocietiesSelected(false);
    } else {
      setSelectedSocietyIds(filteredSocieties.map(s => s.id!));
      setIsAllSocietiesSelected(true);
    }
  };

  // Toggle single society selection
  const toggleSelectSociety = (id: string) => {
    setSelectedSocietyIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // Bulk delete societies
const handleBulkDeleteSocieties = async () => {
    if (selectedSocietyIds.length === 0) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedSocietyIds.length} selected societies. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, delete ${selectedSocietyIds.length} society(s)!`,
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(selectedSocietyIds.map(id => societyAPI.deleteSociety(id)));
      await loadSocieties();
      const count = selectedSocietyIds.length;
      setSelectedSocietyIds([]);
      setIsAllSocietiesSelected(false);
      Swal.fire({
        title: "Deleted!",
        text: `${count} societies have been deleted successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Error deleting societies ❌",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    }
  };

  const resetSocietyForm = (): void => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentSociety(null);
  };

  // Connected Remark Functions
  const loadConnectedRemarks = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await connectedRemarkAPI.getAllRemarks();
      setConnectedRemarks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading connected remarks:", error);
      toast.error("Error loading connected remarks ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectedRemarkSubmit = async (formData: ConnectedRemark | any) => {
    try {
      if (isEditMode && currentConnectedRemark) {
        await connectedRemarkAPI.updateRemark(currentConnectedRemark.id, formData);
        toast.success("Connected remark updated successfully ✏️");
      } else {
        await connectedRemarkAPI.createRemark(formData);
        toast.success("Connected remark added successfully ✅");
      }
      await loadConnectedRemarks();
      resetForm();
    } catch (error: any) {
      console.error("Error saving connected remark:", error);
      const errorMessage = error.response?.data?.error || "Error saving connected remark ❌ Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEditConnectedRemark = (remark: ConnectedRemark): void => {
    setCurrentConnectedRemark(remark);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

 const handleDeleteConnectedRemark = async (remarkId: string): Promise<void> => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this connected remark. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await connectedRemarkAPI.deleteRemark(remarkId);
      await loadConnectedRemarks();
      Swal.fire({
        title: "Deleted!",
        text: "Connected remark has been deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (error: any) {
      console.error("Error deleting connected remark:", error);
      const errorMessage = error.response?.data?.error || "Error deleting connected remark ❌ Please try again.";
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    }
  };

  // Toggle select all connected remarks
  const toggleSelectAllRemarks = () => {
    if (isAllRemarksSelected) {
      setSelectedRemarkIds([]);
      setIsAllRemarksSelected(false);
    } else {
      setSelectedRemarkIds(filteredConnectedRemarks.map(r => r.id));
      setIsAllRemarksSelected(true);
    }
  };

  // Toggle single connected remark selection
  const toggleSelectRemark = (id: string) => {
    setSelectedRemarkIds(prev => {
      const next = prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id];
      setIsAllRemarksSelected(next.length === filteredConnectedRemarks.length);
      return next;
    });
  };

  // Bulk delete connected remarks
  const handleBulkDeleteRemarks = async () => {
    if (selectedRemarkIds.length === 0) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedRemarkIds.length} selected connected remarks. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, delete ${selectedRemarkIds.length} remark(s)!`,
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(selectedRemarkIds.map(id => connectedRemarkAPI.deleteRemark(id)));
      await loadConnectedRemarks();
      const count = selectedRemarkIds.length;
      setSelectedRemarkIds([]);
      setIsAllRemarksSelected(false);
      Swal.fire({
        title: "Deleted!",
        text: `${count} connected remarks have been deleted successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (error: any) {
      console.error("Error deleting connected remarks:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Error deleting connected remarks ❌",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    }
  };

  // Master Type Functions
  const loadMasterTypes = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await masterDataAPI.getAllMasterTypes(activeId);

      const itemsWithValueCounts = await Promise.all(
        (data || []).map(async (item: any) => {
          try {
            const values = await masterDataAPI.getMasterValues(item.id);
            return {
              ...item,
              values: Array.isArray(values) ? values : [],
              valueCount: (values && values.length) || 0,
            } as MasterItem;
          } catch (error) {
            console.error(`Error loading values for ${item.id}:`, error);
            return {
              ...item,
              values: [],
              valueCount: 0,
            } as MasterItem;
          }
        })
      );

      setItemsByTab((prev) => ({
        ...prev,
        [activeId]: itemsWithValueCounts,
      }));
    } catch (error) {
      console.error("Error loading master types:", error);
      toast.error("Error loading master types ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMasterValues = async (masterTypeId: string): Promise<void> => {
    try {
      setIsValuesLoading(true);
      const values = await masterDataAPI.getMasterValues(masterTypeId);

      setSelectedMaster((prev) => (prev ? { ...prev, values: Array.isArray(values) ? values : [] } : null));
      setItemsByTab((prev) => ({
        ...prev,
        [activeId]: prev[activeId].map((item) =>
          item.id === masterTypeId ? { ...item, values: Array.isArray(values) ? values : [], valueCount: (values && values.length) || 0 } : item
        ),
      }));
    } catch (error) {
      console.error("Error loading master values:", error);
      toast.error("Error loading master values ❌");
    } finally {
      setIsValuesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      if (isEditMode && currentItem) {
        const updatedItem = await masterDataAPI.updateMasterType(currentItem.id, { name, status });

        const updatedMasterItem: MasterItem = {
          ...currentItem,
          name,
          status,
          ...updatedItem,
        };

        setItemsByTab((prev) => ({
          ...prev,
          [activeId]: prev[activeId].map((item) => (item.id === currentItem.id ? updatedMasterItem : item)),
        }));

        if (selectedMaster?.id === currentItem.id) {
          setSelectedMaster((prev) => (prev ? { ...prev, name, status } : null));
        }

        toast.success("Master type updated successfully ✅");
      } else {
        const newItem = await masterDataAPI.createMasterType({ tabId: activeId, name, status });

        if (!newItem?.id) {
          await loadMasterTypes();
          toast.success("Master type created successfully ✅");
          resetForm();
          return;
        }

        const newMasterItem: MasterItem = {
          id: newItem.id,
          name,
          status,
          values: [],
          valueCount: 0,
          ...newItem,
        };

        setItemsByTab((prev) => ({
          ...prev,
          [activeId]: [...prev[activeId], newMasterItem],
        }));

        toast.success("Master type created successfully ✅");
      }

      resetForm();
    } catch (error: any) {
      console.error("Error saving master type:", error);
      const errorMessage = error.response?.data?.error || "Error saving master type ❌ Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (item: MasterItem): void => {
    setCurrentItem(item);
    setName(item.name);
    setStatus(item.status);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

const handleDelete = async (id: string): Promise<void> => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this master type. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await masterDataAPI.deleteMasterType(id);
      await loadMasterTypes();

      if (selectedMaster?.id === id) {
        setCurrentView("list");
        setSelectedMaster(null);
        setSelectedValueIds([]);
      }

      Swal.fire({
        title: "Deleted!",
        text: "Master type has been deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (error: any) {
      console.error("Error deleting master type:", error);
      const errorMessage = error.response?.data?.error || "Error deleting master type ❌ Please try again.";
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    }
  };

  const handleValueSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!selectedMaster?.id) {
      toast.error("Invalid master. Please refresh or select a valid master before adding values ❌");
      return;
    }

    try {
      if (editingValue) {
        const updatedValue = await masterDataAPI.updateMasterValue(editingValue.id, {
          value: valueInput,
          status: valueStatus,
        });

        const updatedValueData: Value = {
          id: updatedValue.id || editingValue.id,
          value: updatedValue.value || valueInput,
          status: updatedValue.status || valueStatus,
          ...updatedValue,
        };

        setItemsByTab((prev) => ({
          ...prev,
          [activeId]: prev[activeId].map((item) =>
            item.id === selectedMaster.id ? { ...item, values: item.values.map((v) => (v.id === editingValue.id ? updatedValueData : v)) } : item
          ),
        }));
        setSelectedMaster((prev) =>
          prev ? { ...prev, values: prev.values.map((v) => (v.id === editingValue.id ? updatedValueData : v)) } : prev
        );

        toast.success("Value updated successfully ✅");
      } else {
        const newValue = await masterDataAPI.createMasterValue(selectedMaster.id, {
          value: valueInput,
          status: valueStatus,
        });

        if (!newValue?.id) {
          await loadMasterValues(selectedMaster.id);
          toast.success("Value created successfully ✅");
          resetValueForm();
          return;
        }

        const newValueData: Value = {
          id: newValue.id,
          value: newValue.value || valueInput,
          status: newValue.status || valueStatus,
          ...newValue,
        };

        setItemsByTab((prev) => ({
          ...prev,
          [activeId]: prev[activeId].map((item) =>
            item.id === selectedMaster.id ? { ...item, values: [...item.values, newValueData], valueCount: item.valueCount + 1 } : item
          ),
        }));
        setSelectedMaster((prev) => (prev ? { ...prev, values: [...prev.values, newValueData] } : prev));

        toast.success("Value created successfully ✅");
      }

      resetValueForm();
    } catch (error: any) {
      console.error("Error saving value:", error);
      const errorMessage = error.response?.data?.error || "Error saving value ❌ Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEditValue = (value: Value): void => {
    setValueInput(value.value);
    setValueStatus(value.status);
    setEditingValue(value);
    setIsValueModalOpen(true);
  };

 const handleDeleteValue = async (valueId: string): Promise<void> => {
    if (!selectedMaster) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this value. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await masterDataAPI.deleteMasterValue(valueId);
      await loadMasterValues(selectedMaster.id);
      setSelectedValueIds((prev) => prev.filter((id) => id !== valueId));
      Swal.fire({
        title: "Deleted!",
        text: "Value has been deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (error: any) {
      console.error("Error deleting value:", error);
      const errorMessage = error.response?.data?.error || "Error deleting value ❌ Please try again.";
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    }
  };

const handleBulkDelete = async (): Promise<void> => {
    if (!selectedMaster || selectedValueIds.length === 0 || isConnectedRemarkTab) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedValueIds.length} selected values. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, delete ${selectedValueIds.length} value(s)!`,
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      const count = selectedValueIds.length;
      await Promise.all(selectedValueIds.map((id) => masterDataAPI.deleteMasterValue(id)));
      await loadMasterValues(selectedMaster.id);
      setSelectedValueIds([]);
      Swal.fire({
        title: "Deleted!",
        text: `${count} selected value(s) have been deleted successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (error: any) {
      console.error("Error deleting values:", error);
      const errorMessage = error.response?.data?.error || "Error deleting selected values ❌ Please try again.";
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton: "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    }
  };

  const resetForm = (): void => {
    setName("");
    setStatus("Active");
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentItem(null);
    setCurrentConnectedRemark(null);
  };

  const resetValueForm = (): void => {
    setValueInput("");
    setValueStatus("Active");
    setIsValueModalOpen(false);
    setEditingValue(null);
  };

  const handleCardClick = async (master: MasterItem): Promise<void> => {
    if (isConnectedRemarkTab || isSocietyTab) return;

    setSelectedMaster(master);
    setCurrentView("values");
    setSearchTerm("");
    setSelectedValueIds([]);
    setAppliedFilters(initialFilters);
    setDraftFilters(initialFilters);
    await loadMasterValues(master.id);
  };

  const handleBackToList = (): void => {
    setCurrentView("list");
    setSelectedMaster(null);
    setSearchTerm("");
    setSelectedValueIds([]);
    setAppliedFilters(initialFilters);
    setDraftFilters(initialFilters);
  };

  const handleExport = async (): Promise<void> => {
    if (!selectedMaster) return;

    // Export all values (not just filtered ones)
    const valuesToExport = selectedMaster.values.map(v => ({
      'Value': v.value,
      'Status': v.status,
    }));

    if (valuesToExport.length === 0) {
      toast.warn("No values to export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(valuesToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selectedMaster.name);
    XLSX.writeFile(wb, `${selectedMaster.name}_values.xlsx`);
    toast.success(`Values exported successfully for "${selectedMaster.name}" ✅`);
  };

  // 🔥 UPDATED: Export with amenities for society
  const handleMasterExport = async (): Promise<void> => {
    if (isConnectedRemarkTab) {
      // Export connected remarks
      const dataToExport = filteredConnectedRemarks.map(remark => ({
        'Master Tab Id': remark.tab_id || remark.tabId || 'N/A',
        'Master Type 1': remark.type1Name || 'N/A',
        'Master Value 1': remark.value1Name || 'N/A',
        'Master Type 2': remark.type2Name || 'N/A',
        'Master Value 2': remark.value2Name || 'N/A',
        'Remarks': typeof remark.remarks === 'string' ? remark.remarks : JSON.stringify(remark.remarks),
        'Status': remark.status,
      }));

      if (dataToExport.length === 0) {
        toast.warn("No data to export.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Connected Remarks');
      XLSX.writeFile(wb, `Connected_Remarks_${Date.now()}.xlsx`);
      toast.success("Connected remarks exported successfully ✅");
      return;
    }

    if (isSocietyTab) {
      // 🆕 Export societies with amenities
      const dataToExport = filteredSocieties.map(society => ({
        'Society Name': society.societyName || '',
        'Locality': society.locality || '',
        'City': society.city || '',
        'Pincode': society.pincode || '',
        'Amenities': (society.amenities || []).join(', '),
        'Status': society.status || 'Active',
      }));

      if (dataToExport.length === 0) {
        toast.warn("No data to export.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Societies');
      XLSX.writeFile(wb, `Societies_${Date.now()}.xlsx`);
      toast.success(`${dataToExport.length} societies exported successfully ✅`);
      return;
    }

    // Master types export
    const dataToExport = filteredMasterItems.map(item => ({
      'Name': item.name,
      'Status': item.status,
      'Value Count': item.valueCount,
    }));

    if (dataToExport.length === 0) {
      toast.warn("No data to export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab.title);
    XLSX.writeFile(wb, `${activeTab.title}_master_types.xlsx`);
    toast.success("Master types exported successfully ✅");
  };

  const handleImport = async (file: File): Promise<void> => {
    try {
      if (importType === "master") {
        const response = await masterDataAPI.importMasterTypes(activeId, file);

        // Handle response
        if (response?.imported === 0 && response?.skipped > 0) {
          toast.warning(response.message || "All records were duplicates");
        } else if (response?.imported > 0) {
          toast.success(response.message || "Master types imported successfully ✅");
        } else {
          toast.success("Master types imported successfully ✅");
        }

        // Refresh data
        if (isConnectedRemarkTab) {
          await loadConnectedRemarks();
        } else if (isSocietyTab) {
          await loadSocieties();
        } else {
          await loadMasterTypes();
        }
      } else {
        // Import Values
        if (!selectedMaster) {
          toast.error("Please select a master first ❌");
          return;
        }

        const response = await masterDataAPI.importMasterValues(selectedMaster.id, file);

        if (response?.imported === 0 && response?.skipped > 0) {
          toast.warning(response.message || "All values were duplicates");
        } else if (response?.imported > 0) {
          toast.success(response.message || "Values imported successfully ✅");
        } else {
          toast.success(`Values imported successfully for "${selectedMaster.name}" ✅`);
        }

        await loadMasterValues(selectedMaster.id);
      }
    } catch (error: any) {
      console.error(`Error importing ${importType}:`, error);
      const errorMessage = error.response?.data?.error || `Failed to import ${importType}`;
      toast.error(errorMessage);
      throw error; // Re-throw so modal knows it failed
    }
  };

  const toggleSelectAll = (): void => {
    if (isAllSelected) {
      setSelectedValueIds([]);
    } else {
      setSelectedValueIds(selectedMaster?.values.map((v) => v.id) || []);
    }
  };

  const toggleSelectValue = (id: string): void => {
    setSelectedValueIds((prev) => (prev.includes(id) ? prev.filter((valId) => valId !== id) : [...prev, id]));
  };

  const filteredValues: Value[] =
    selectedMaster?.values
      ?.filter((value) => {
        const matchesSearch = value.value.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = appliedFilters.valueStatus === "All" || value.status === appliedFilters.valueStatus;

        let matchesType = true;
        const isNumeric = /^\d+$/.test(value.value.trim());
        if (appliedFilters.valueType === "Numeric") {
          matchesType = isNumeric;
        } else if (appliedFilters.valueType === "Alphabetic") {
          matchesType = !isNumeric;
        }

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        const numA = parseInt(a.value);
        const numB = parseInt(b.value);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.value.localeCompare(b.value);
      }) || [];

  const filteredMasterItems = itemsByTab[activeId].filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = appliedFilters.status === "All" || item.status === appliedFilters.status;

    const valueCount = item.valueCount || 0;
    const matchesMin = appliedFilters.minValues === "" || valueCount >= parseInt(appliedFilters.minValues);
    const matchesMax = appliedFilters.maxValues === "" || valueCount <= parseInt(appliedFilters.maxValues);

    let matchesHasValues = true;
    if (appliedFilters.hasValues === "With Values") {
      matchesHasValues = valueCount > 0;
    } else if (appliedFilters.hasValues === "No Values") {
      matchesHasValues = valueCount === 0;
    }

    return matchesSearch && matchesStatus && matchesMin && matchesMax && matchesHasValues;
  });

  const filteredConnectedRemarks = connectedRemarks.filter((remark) => {
    const searchLower = searchTerm.toLowerCase();

    const getSearchableText = (r: any): string => {
      if (!r) return "";
      if (Array.isArray(r)) {
        return r
          .map((x) => {
            if (typeof x === "object" && x !== null) {
              return x.note || x.text || x.remark || "";
            }
            return String(x || "");
          })
          .join(" ");
      }
      if (typeof r === "object" && r !== null) {
        return (r as any).note || (r as any).text || (r as any).remark || "";
      }
      return String(r);
    };

    const remarksText = getSearchableText(remark.remarks);

    const matchesSearch = (
      (remark.type1Name?.toLowerCase() || "").includes(searchLower) ||
      (remark.value1Name?.toLowerCase() || "").includes(searchLower) ||
      (remark.type2Name?.toLowerCase() || "").includes(searchLower) ||
      (remark.value2Name?.toLowerCase() || "").includes(searchLower) ||
      remarksText.toLowerCase().includes(searchLower)
    );

    const matchesStatus = appliedFilters.status === "All" || remark.status === appliedFilters.status;
    const matchesTabId = appliedFilters.tabId === "All" || (remark.tab_id || remark.tabId) === appliedFilters.tabId;
    const matchesType1 = appliedFilters.type1 === "" || remark.type1Name === appliedFilters.type1;
    const matchesType2 = appliedFilters.type2 === "" || remark.type2Name === appliedFilters.type2;

    return matchesSearch && matchesStatus && matchesTabId && matchesType1 && matchesType2;
  });

  const filteredSocieties = societies.filter((society) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      society.societyName.toLowerCase().includes(searchLower) ||
      society.locality.toLowerCase().includes(searchLower) ||
      society.city.toLowerCase().includes(searchLower) ||
      society.pincode.includes(searchLower)
    );

    const matchesStatus = appliedFilters.status === "All" || (society.status || "Active") === appliedFilters.status;
    const matchesCity = appliedFilters.city === "" || society.city === appliedFilters.city;
    const matchesLocality = appliedFilters.locality === "" || society.locality === appliedFilters.locality;
    const matchesPincode = appliedFilters.pincode === "" || society.pincode.includes(appliedFilters.pincode);

    const matchesAmenities = appliedFilters.selectedAmenities.length === 0 ||
      appliedFilters.selectedAmenities.every(amenity => society.amenities?.includes(amenity));

    let matchesMedia = true;
    const hasMedia = society.imageUrls && society.imageUrls.length > 0;
    if (appliedFilters.hasMedia === "With Media") {
      matchesMedia = hasMedia;
    } else if (appliedFilters.hasMedia === "Without Media") {
      matchesMedia = !hasMedia;
    }

    return matchesSearch && matchesStatus && matchesCity && matchesLocality && matchesPincode && matchesAmenities && matchesMedia;
  });

  // 🆕 View Society Modal Component
  const ViewSocietyModal = () => {
    if (!viewSociety) return null;

    return (
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        showHeader={false}
        showCloseButton={false}
        width="max-w-2xl"
      >
        {/* Header - Compact */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-3 sm:px-4 py-2 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-0.5 h-5 rounded-full bg-[#e67e22] flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">{viewSociety.societyName}</h2>
              <p className="text-[8px] text-gray-400 leading-none">Society Details</p>
            </div>
          </div>
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="p-1 rounded hover:bg-white/10 transition-colors text-white flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body - Ultra Compact */}
        <div className="p-3 sm:p-4 space-y-3">
          {/* Status Badge - Compact */}
          <div className="flex flex-wrap justify-between items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${viewSociety.status === 'Active'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                <span className={`w-1 h-1 rounded-full ${viewSociety.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                {viewSociety.status || 'Active'}
              </span>
            </div>
            {viewSociety.createdAt && (
              <span className="text-[8px] text-gray-400">
                Created: {new Date(viewSociety.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Details Grid - Compact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Society Name */}
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-0.5">
                <Building2 size={11} className="text-[#e67e22] flex-shrink-0" />
                Society Name
              </div>
              <p className="text-xs font-semibold text-gray-800 truncate">{viewSociety.societyName}</p>
            </div>

            {/* Locality */}
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-0.5">
                <MapPin size={11} className="text-[#e67e22] flex-shrink-0" />
                Locality
              </div>
              <p className="text-xs text-gray-800 truncate">{viewSociety.locality}</p>
            </div>

            {/* City */}
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-0.5">
                <Map size={11} className="text-[#e67e22] flex-shrink-0" />
                City
              </div>
              <p className="text-xs text-gray-800 truncate">{viewSociety.city}</p>
            </div>

            {/* Pincode */}
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-0.5">
                <Hash size={11} className="text-[#e67e22] flex-shrink-0" />
                Pincode
              </div>
              <p className="text-xs text-gray-800 truncate">{viewSociety.pincode}</p>
            </div>
          </div>

          {/* Amenities Section - Compact */}
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-1">
              <Package size={11} className="text-[#e67e22] flex-shrink-0" />
              Amenities ({viewSociety.amenities?.length || 0})
            </div>
            {viewSociety.amenities && viewSociety.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {viewSociety.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[9px] font-medium border border-purple-200"
                  >
                    <Check size={9} className="text-purple-400 flex-shrink-0" />
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No amenities added</p>
            )}
          </div>

          {/* Images Section - Compact */}
          {viewSociety.imageUrls && viewSociety.imageUrls.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1 text-gray-500 text-[8px] font-semibold uppercase tracking-wider mb-1">
                <ImageIcon size={11} className="text-[#e67e22] flex-shrink-0" />
                Images ({viewSociety.imageUrls.length})
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
            {viewSociety.imageUrls.slice(0, 6).map((img: any, idx) => {
  const url = typeof img === 'string' ? img : img.url;
  const label = typeof img === 'string' ? '' : img.label;
  const mediaType = typeof img === 'string' ? 'image' : (img.type === 'video' ? 'video' : 'image');
  const ytEmbed = mediaType === 'video' ? getYouTubeEmbedUrl(url) : null;
  return (
    <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
      {mediaType === 'video' ? (
        ytEmbed ? (
          <iframe src={ytEmbed} className="w-full h-full" frameBorder="0" allow="autoplay; encrypted-media" />
        ) : (
          <video src={url} className="w-full h-full object-cover" muted controls />
        )
      ) : (
        <img
          src={url}
          alt={`${viewSociety.societyName} ${idx + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
      )}
      {label && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[7px] px-1 py-0.5 truncate text-center">
          {label}
        </div>
      )}
    </div>
  );
})}
                {viewSociety.imageUrls.length > 6 && (
                  <div className="aspect-square rounded-md border border-gray-200 flex items-center justify-center bg-gray-100">
                    <span className="text-[10px] font-semibold text-gray-500">+{viewSociety.imageUrls.length - 6}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="px-3 sm:px-4 py-2 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
          >
            Close
          </button>
          <button
            onClick={() => {
              setIsViewModalOpen(false);
              handleEditSociety(viewSociety);
            }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#0f2b3d] rounded-lg hover:bg-[#1a3d52] transition-colors flex items-center justify-center gap-1.5 order-1 sm:order-2"
          >
            <Edit2 size={12} className="flex-shrink-0" />
            Edit Society
          </button>
        </div>
      </Modal>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="p-4 border-b bg-white shadow-sm">
        <h1 className="text-xl font-semibold">Master Data Management</h1>
      </header>

      <nav className="bg-white border-b">
        <div className="px-3 py-2 flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveId(t.id as TabId);
                setCurrentView("list");
                setSelectedMaster(null);
                setSelectedValueIds([]);
                setSelectedRemarkIds([]);
                setIsAllRemarksSelected(false);
                setSelectedSocietyIds([]);
                setIsAllSocietiesSelected(false);
                setSearchTerm("");
                setAppliedFilters(initialFilters);
                setDraftFilters(initialFilters);
              }}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors duration-200 ${t.id === activeId
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-3 sm:p-4">
            {currentView === "list" ? (
              <>
                <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">

                  {/* 🔹 MOBILE: Heading + Create button in same row */}
                  <div className="flex items-center justify-between md:block">
                    <h2 className="text-base sm:text-lg font-semibold truncate">
                      {activeTab.title}
                    </h2>

                    {/* Create button (mobile only) */}
                    <div className="md:hidden">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
                      >
                        <Plus size={14} />
                        <span className="whitespace-nowrap">
                          {isConnectedRemarkTab
                            ? "Add Connected Remark"
                            : isSocietyTab
                              ? "Add Society"
                              : `Create ${activeTab.title} types`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 🔹 RIGHT SECTION */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 md:gap-3 md:flex-wrap w-full md:w-auto">

                    {/* Search & Advanced Filters Toggle */}
                    <div className="flex gap-2 w-full sm:w-auto flex-1">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56 md:w-64 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                          showFilters
                            ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm animate-pulse-fast"
                            : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Filter size={14} className={showFilters ? "fill-blue-600/10 text-blue-600" : "text-gray-400"} />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFiltersCount > 0 && (
                          <span className="flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white px-1">
                            {activeFiltersCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* 🔹 Import + Export */}
                    {!isConnectedRemarkTab && !isSocietyTab && (
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => {
                            setImportType("master");
                            setIsImportModalOpen(true);
                          }}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
                        >
                          <Upload size={14} />
                          <span className="whitespace-nowrap">
                            Import {activeTab.title}
                          </span>
                        </button>

                        <button
                          onClick={handleMasterExport}
                          disabled={!filteredMasterItems.length}
                          className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
                        >
                          <Download size={14} />
                          <span className="whitespace-nowrap">Export</span>
                        </button>
                      </div>
                    )}

                    {/* 🔹 Society Tab - Export button */}
                    {isSocietyTab && (
                      <div className="flex gap-2 w-full md:w-auto">
                        {/* 🆕 IMPORT BUTTON — Export ke bajule, Add Society se pehle */}
                        <button
                          onClick={() => setIsSocietyImportModalOpen(true)}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
                        >
                          <Upload size={14} />
                          <span className="whitespace-nowrap">Import Societies</span>
                        </button>

                        <button
                          onClick={handleMasterExport}
                          disabled={!filteredSocieties.length}
                          className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
                        >
                          <Download size={14} />
                          <span className="whitespace-nowrap">Export Societies</span>
                        </button>
                      </div>
                    )}

                    {/* 🔹 Connected Remark Tab - Export button */}
                    {isConnectedRemarkTab && (
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={handleMasterExport}
                          disabled={!filteredConnectedRemarks.length}
                          className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
                        >
                          <Download size={14} />
                          <span className="whitespace-nowrap">Export Remarks</span>
                        </button>
                      </div>
                    )}

                    {/* 🔹 DESKTOP: Create button */}
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="hidden md:flex w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg items-center justify-center gap-2 text-xs"
                    >
                      <Plus size={14} />
                      <span className="whitespace-nowrap">
                        {isConnectedRemarkTab
                          ? "Add Connected Remark"
                          : isSocietyTab
                            ? "Add Society"
                            : `Create ${activeTab.title} types`}
                      </span>
                    </button>

                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-10 sm:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-2 text-gray-500 text-sm">Loading...</p>
                  </div>
                ) : isConnectedRemarkTab ? (
                  <div className="bg-white rounded-lg shadow-sm">
                    {/* Bulk Actions Bar */}
                    {selectedRemarkIds.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 border-b">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isAllRemarksSelected}
                            onChange={toggleSelectAllRemarks}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            {selectedRemarkIds.length} connected remark(s) selected
                          </span>
                        </div>
                        <button
                          onClick={handleBulkDeleteRemarks}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-medium transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete Selected ({selectedRemarkIds.length})
                        </button>
                      </div>
                    )}

                    {filteredConnectedRemarks.length === 0 ? (
                      <div className="text-center py-10 sm:py-12 text-gray-500">
                        <Plus size={40} className="mx-auto mb-3 opacity-50" />
                        {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No connected remarks created yet</p>}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-auto max-h-[380px] sm:max-h-[450px]">
                          <table className="min-w-[1200px] w-full border-collapse table-fixed">
                            <thead className="sticky top-0 z-10">
                              <tr className="border-b bg-gray-50 divide-x divide-gray-200">
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs w-[50px]">
                                  <input
                                    type="checkbox"
                                    checked={isAllRemarksSelected}
                                    onChange={toggleSelectAllRemarks}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                </th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs w-[60px]">#</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Tab Id</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Type 1</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Value 1</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Type 2</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Value 2</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Remarks</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {filteredConnectedRemarks.map((remark, index) => (
                                <tr key={remark.id} className="border-b hover:bg-gray-50 transition-colors divide-x divide-gray-200">
                                  <td className="p-3 w-[50px]">
                                    <input
                                      type="checkbox"
                                      checked={selectedRemarkIds.includes(remark.id)}
                                      onChange={() => toggleSelectRemark(remark.id)}
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                  </td>
                                  <td className="p-3 text-gray-600 text-xs w-[60px]">{index + 1}</td>
                                  <td className="p-3 font-medium text-xs">{remark.tab_id || remark.tabId || "N/A"}</td>
                                  <td className="p-3 font-medium text-xs">{remark.type1Name || "N/A"}</td>
                                  <td className="p-3 font-medium text-xs">{remark.value1Name || "N/A"}</td>
                                  <td className="p-3 font-medium text-xs">{remark.type2Name || "N/A"}</td>
                                  <td className="p-3 font-medium text-xs">{remark.value2Name || "N/A"}</td>
                                  <td className="p-3 font-medium text-xs max-w-xs">
                                    {(() => {
                                      if (!remark.remarks || (Array.isArray(remark.remarks) && remark.remarks.length === 0)) {
                                        return <span className="text-gray-400">No remarks</span>;
                                      }
                                      if (Array.isArray(remark.remarks)) {
                                        return (
                                          <ol className="list-decimal list-inside space-y-1">
                                            {remark.remarks.map((remarkText, idx) => {
                                              const text =
                                                typeof remarkText === "object" && remarkText !== null
                                                  ? (remarkText as any).note || (remarkText as any).text || (remarkText as any).remark || "Empty remark"
                                                  : String(remarkText || "Empty remark");
                                              return (
                                                <li key={idx} className="text-[11px] sm:text-xs text-gray-700 break-words">
                                                  {text}
                                                </li>
                                              );
                                            })}
                                          </ol>
                                        );
                                      }
                                      if (typeof remark.remarks === "object" && remark.remarks !== null) {
                                        const r = remark.remarks as Record<string, any>;
                                        const text = r.note || r.text || r.remark || "Empty remark";
                                        return <span className="text-[11px] sm:text-xs text-gray-700">{text}</span>;
                                      }
                                      return (
                                        <span className="text-[11px] sm:text-xs text-gray-700">
                                          {String(remark.remarks ?? "Empty remark")}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium border ${remark.status === "Active"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                        }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${remark.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                                      {remark.status}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditConnectedRemark(remark)}
                                        className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteConnectedRemark(remark.id)}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredConnectedRemarks.length === 0 && (
                                <tr>
                                  <td colSpan={10} className="p-3 text-center text-xs text-gray-400">
                                    No data found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Showing <span className="font-medium text-gray-600">{filteredConnectedRemarks.length}</span> records
                          </span>
                          {selectedRemarkIds.length > 0 && (
                            <span className="text-xs text-blue-600 font-medium">{selectedRemarkIds.length} selected</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : isSocietyTab ? (
                  <div className="bg-white rounded-lg shadow-sm">
                    {/* Bulk Actions Bar */}
                    {selectedSocietyIds.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 border-b">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isAllSocietiesSelected}
                            onChange={toggleSelectAllSocieties}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {selectedSocietyIds.length} society(s) selected
                          </span>
                        </div>
                        <button
                          onClick={handleBulkDeleteSocieties}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs"
                        >
                          <Trash2 size={14} />
                          Delete Selected ({selectedSocietyIds.length})
                        </button>
                      </div>
                    )}

                    {filteredSocieties.length === 0 ? (
                      <div className="text-center py-10 sm:py-12 text-gray-500">
                        <Plus size={40} className="mx-auto mb-3 opacity-50" />
                        {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No societies created yet</p>}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-auto max-h-[400px] sm:max-h-[450px]">
                          <table className="min-w-[900px] w-full border-collapse">
                            <thead className="sticky top-0 z-10">
                              <tr className="border-b bg-gray-50 divide-x divide-gray-200">
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">
                                  <input
                                    type="checkbox"
                                    checked={isAllSocietiesSelected}
                                    onChange={toggleSelectAllSocieties}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                </th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">#</th>
                                <th className="w-[20%] text-left p-3 font-medium text-[11px] sm:text-xs">Society Name</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Locality</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">City</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Pincode</th>
                                <th className="w-[20%] text-left p-3 font-medium text-[11px] sm:text-xs">Amenities</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Media</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {filteredSocieties.map((society, index) => (
                                <tr
                                  key={society.id}
                                  className="border-b hover:bg-gray-50 transition-colors divide-x divide-gray-200"
                                >
                                  <td className="p-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedSocietyIds.includes(society.id!)}
                                      onChange={() => toggleSelectSociety(society.id!)}
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                  </td>

                                  <td className="p-3 text-gray-600 text-xs">
                                    {index + 1}
                                  </td>

                                  {/* 🔥 Clickable Society Name */}
                                  <td className="p-3 font-medium text-xs w-[20%]">
                                    <button
                                      onClick={() => handleSocietyNameClick(society)}
                                      className="text-blue-600 hover:text-blue-800 hover:underline text-left transition-colors font-medium"
                                    >
                                      {society.societyName}
                                    </button>
                                  </td>

                                  <td className="p-3 font-medium text-xs">
                                    {society.locality}
                                  </td>

                                  <td className="p-3 font-medium text-xs">
                                    {society.city}
                                  </td>

                                  <td className="p-3 font-medium text-xs">
                                    {society.pincode}
                                  </td>

                                  {/* Amenities */}
                                  <td className="p-3 min-w-[200px] w-[20%]">
                                    {society.amenities?.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {society.amenities.slice(0, 3).map((amenity, idx) => (
                                          <span
                                            key={idx}
                                            className="inline-block px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px] border border-purple-200"
                                          >
                                            {amenity}
                                          </span>
                                        ))}
                                        {society.amenities.length > 3 && (
                                          <button
                                            onClick={() => handleViewSociety(society)}
                                            className="inline-block px-2 py-1 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded text-[10px] cursor-pointer transition-colors font-medium border border-transparent hover:border-gray-300"
                                            title="View all amenities"
                                          >
                                            +{society.amenities.length - 3}
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-xs">—</span>
                                    )}
                                  </td>

                                  {/* Media (Images/Video) */}
                                  <td className="p-3">
                                    {society.imageUrls && society.imageUrls.length > 0 ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <span className="text-gray-400 text-xs">—</span>
                                    )}
                                  </td>

                                  {/* Status */}
                                  <td className="p-3">
                                    <span
                                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${society.status === "Active"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                        }`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${society.status === "Active"
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                          }`}
                                      />
                                      {society.status || "Active"}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3">
                                    <div className="flex items-center gap-1.5">
                                      {/* 🆕 View Button */}
                                      <button
                                        onClick={() => handleViewSociety(society)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="View Society"
                                      >
                                        <Eye size={15} />
                                      </button>

                                      <button
                                        onClick={() => handleEditSociety(society)}
                                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit Society"
                                      >
                                        <Edit2 size={15} />
                                      </button>

                                      <button
                                        onClick={() => handleDeleteSociety(society.id!)}
                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Society"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}

                              {filteredSocieties.length === 0 && (
                                <tr>
                                  <td colSpan={9} className="p-6 text-center text-gray-500">
                                    No societies found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Showing <span className="font-medium text-gray-600">{filteredSocieties.length}</span> societies
                          </span>
                          {selectedSocietyIds.length > 0 && (
                            <span className="text-xs text-blue-600 font-medium">{selectedSocietyIds.length} selected</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-h-[390px] sm:max-h-[480px] overflow-y-auto pr-2">
                    {filteredMasterItems.length === 0 ? (
                      <div className="col-span-full text-center py-10 sm:py-12 text-gray-500">
                        <Plus size={40} className="mx-auto mb-3 opacity-50" />
                        {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No {activeTab.title} types created yet</p>}
                      </div>
                    ) : (
                      filteredMasterItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleCardClick(item)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-sm sm:text-[15px]">{item.name}</h3>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(item);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                            >
                              {item.status === "Active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {item.status}
                            </span>
                            <span className="text-[11px] sm:text-xs text-gray-500">{item.valueCount} values</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-3 sm:mb-4"
                  >
                    <ArrowLeft size={18} className="sm:size-5" />
                    <span className="text-sm sm:text-base">Back to {activeTab.title}</span>
                  </button>

                  <div className="bg-white rounded-lg p-3 sm:p-3 shadow-sm">

                    {/* HEADER */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-2 sm:mb-2">

                      {/* TITLE + STATUS */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                        <h2 className="text-sm sm:text-base font-semibold">
                          {selectedMaster?.name}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium sm:mt-2 ${selectedMaster?.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {selectedMaster?.status === "Active" ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {selectedMaster?.status}
                        </span>
                      </div>

                      {/* RIGHT SECTION */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 md:gap-3 md:flex-wrap w-full sm:w-auto">

                        <div className="flex flex-row gap-2 w-full sm:w-auto order-1 sm:order-none">
                          {!isConnectedRemarkTab && (
                            <>
                              <button
                                onClick={() => {
                                  setImportType("values");
                                  setIsImportModalOpen(true);
                                }}
                                disabled={!selectedMaster}
                                className={`flex-1 sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs ${!selectedMaster ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                              >
                                <Upload size={14} />
                                <span className="whitespace-nowrap">Import Values</span>
                              </button>

                              <button
                                onClick={handleExport}
                                disabled={!selectedMaster?.values?.length}
                                className="flex-1 sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
                              >
                                <Download size={14} />
                                <span className="whitespace-nowrap">Export</span>
                              </button>

                              <button
                                onClick={() => setIsValueModalOpen(true)}
                                className="flex-1 sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
                              >
                                <Plus size={14} />
                                <span className="whitespace-nowrap">Add Value</span>
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex flex-row gap-2 w-full sm:w-auto order-2 sm:order-none">
                          
                          {/* Search & Advanced Filters Toggle */}
                          <div className="flex gap-2 w-full sm:w-auto flex-1">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="flex-1 sm:w-56 md:w-64 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowFilters(!showFilters)}
                              className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                                showFilters
                                  ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <Filter size={14} className={showFilters ? "fill-blue-600/10 text-blue-600" : "text-gray-400"} />
                              <span className="hidden sm:inline">Filters</span>
                              {activeFiltersCount > 0 && (
                                <span className="flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white px-1">
                                  {activeFiltersCount}
                                </span>
                              )}
                            </button>
                          </div>

                          {!isConnectedRemarkTab && selectedValueIds.length > 0 && (
                            <button
                              onClick={handleBulkDelete}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs whitespace-nowrap"
                            >
                              <Trash2 size={14} />
                              <span className="whitespace-nowrap">
                                Delete Selected ({selectedValueIds.length})
                              </span>
                            </button>
                          )}
                        </div>

                      </div>
                    </div>

                    {isValuesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-2 text-gray-500 text-sm">Loading values...</p>
                      </div>
                    ) : filteredValues.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {selectedMaster?.values?.length === 0 ? (
                          <>
                            <Plus size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No values added yet</p>
                          </>
                        ) : (
                          <p>
                            No values found matching{" "}
                            <span className="font-medium">&quot;{searchTerm}&quot;</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-auto max-h-[320px] sm:max-h-[410px]">
                          <table className="min-w-[600px] w-full border-collapse">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-gray-100 border-b border-gray-200 divide-x divide-gray-200">
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isAllSelected}
                                      onChange={toggleSelectAll}
                                      className="h-4 w-4"
                                    />
                                    <span>#</span>
                                  </div>
                                </th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Value</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
                                <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {filteredValues.map((value, index) => (
                                <tr key={value.id} className="border-b hover:bg-gray-50 transition-colors divide-x divide-gray-200">
                                  <td className="p-3 text-gray-600 text-xs">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={selectedValueIds.includes(value.id)}
                                        onChange={() => toggleSelectValue(value.id)}
                                        className="h-4 w-4"
                                      />
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="p-3 font-medium text-xs">{value.value}</td>
                                  <td className="p-3">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium border ${value.status === "Active"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                        }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${value.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                                      {value.status}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditValue(value)}
                                        className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteValue(value.id)}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredValues.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="p-3 text-center text-xs text-gray-400">
                                    No values found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Showing <span className="font-medium text-gray-600">{filteredValues.length}</span> values
                          </span>
                          {selectedValueIds.length > 0 && (
                            <span className="text-xs text-blue-600 font-medium">{selectedValueIds.length} selected</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
      </main>

      {/* View Society Modal */}
      <ViewSocietyModal />

      <SocietyImportModal
        isOpen={isSocietyImportModalOpen}
        onClose={() => setIsSocietyImportModalOpen(false)}
        onImported={loadSocieties}
      />

      {/* Modal for Master Types */}
      <Modal
        isOpen={isModalOpen && !isSocietyTab}
        onClose={resetForm}
        showHeader={false}
        showCloseButton={false}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
            <h2 className="text-sm font-bold text-white">
              {isConnectedRemarkTab
                ? (isEditMode ? "Edit Connected Remark" : "Add Connected Remark")
                : (isEditMode ? "Edit Master Type" : "Create Master Type")}
            </h2>
          </div>
          <button onClick={resetForm} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X size={16} color="white" />
          </button>
        </div>

        {isConnectedRemarkTab ? (
          <div className="px-5 py-4">
            <ConnectedRemarkForm
              onClose={resetForm}
              onSubmit={handleConnectedRemarkSubmit}
              initialData={isEditMode && currentConnectedRemark ? (currentConnectedRemark as any) : null}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="block mb-1 font-medium text-xs">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-xs">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                >
                  Cancel
                </button>
                {canManageMaster && (
                  <button
                    type="submit"
                    className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
                  >
                    {isEditMode ? "Update" : "Create"}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Separate Modal for Society */}
      <Modal
        isOpen={isModalOpen && isSocietyTab}
        onClose={resetSocietyForm}
        showHeader={false}
        showCloseButton={false}
        width="max-w-2xl"
      >
        <SocietyForm
          onClose={resetSocietyForm}
          onSubmit={handleSocietySubmit}
          initialData={isEditMode && currentSociety ? currentSociety : null}
          isEditing={isEditMode}
          onRefresh={async () => {
            console.log("Refresh called");
            await loadSocieties();
          }}
        />
      </Modal>

      {/* Value Modal */}
      <Modal isOpen={isValueModalOpen} onClose={resetValueForm} title={`${editingValue ? "Edit" : "Add"} Value`}>
        <form onSubmit={handleValueSubmit}>
          <div className="space-y-4 px-5 py-4">
            <div>
              <label className="block mb-1 font-medium text-xs">Value</label>
              <input
                type="text"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-xs">Status</label>
              <select
                value={valueStatus}
                onChange={(e) => setValueStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetValueForm}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
              >
                {editingValue ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title={`Import ${importType === "master" ? activeTab.title : (selectedMaster?.name ?? "") + " Values"}`}
        type={importType}
      />

      {/* Smart Filters Drawer Portal */}
      {showFilters && typeof document !== "undefined" && createPortal(
        <>
          {/* Overlay Backdrop */}
          <div
            className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${
              showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ background: "rgba(15, 43, 61, 0.45)", backdropFilter: "blur(2px)" }}
            onClick={() => setShowFilters(false)}
          />

          {/* Drawer Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full z-[1001] flex flex-col transform transition-transform duration-300 ease-out ${
              showFilters ? "translate-x-0" : "translate-x-full"
            } w-[280px] sm:w-[380px]`}
            style={{ background: "#f8fafc", boxShadow: "-4px 0 32px rgba(15, 43, 61, 0.18)" }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: "#0f2b3d", borderBottom: "1px solid #e2e8f0" }}
            >
              <div className="flex items-center gap-2">
                <Filter size={15} color="#e67e22" />
                <span
                  className="text-white font-semibold tracking-wide"
                  style={{ fontSize: "13px" }}
                >
                  Smart Filters
                </span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white px-1">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="flex items-center justify-center rounded-full transition text-white hover:bg-white/20"
                style={{
                  width: 26,
                  height: 26,
                  background: "rgba(255,255,255,0.12)",
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ scrollbarWidth: "thin" }}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                
                {/* SECTION: Global/Active View Status Filter */}
                {currentView !== "values" && (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                      Status
                    </label>
                    <select
                      value={draftFilters.status}
                      onChange={(e) => setDraftFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}

                {/* Tab-Specific Filters */}
                {currentView === "values" ? (
                  <>
                    {/* VALUE VIEW FILTERS */}
                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Value Status
                      </label>
                      <select
                        value={draftFilters.valueStatus}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, valueStatus: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Value Type
                      </label>
                      <select
                        value={draftFilters.valueType}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, valueType: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="All">All Types</option>
                        <option value="Numeric">Numeric Only</option>
                        <option value="Alphabetic">Alphabetic Only</option>
                      </select>
                    </div>
                  </>
                ) : isSocietyTab ? (
                  <>
                    {/* SOCIETY FILTERS */}
                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        City
                      </label>
                      <select
                        value={draftFilters.city}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, city: e.target.value, locality: "" }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="">All Cities</option>
                        {uniqueCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Locality
                      </label>
                      <select
                        value={draftFilters.locality}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, locality: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="">All Localities</option>
                        {uniqueLocalities.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="Enter pincode..."
                        value={draftFilters.pincode}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, pincode: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Media Attachments
                      </label>
                      <select
                        value={draftFilters.hasMedia}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, hasMedia: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="All">All Societies</option>
                        <option value="With Media">Has Images/Videos</option>
                        <option value="Without Media">No Media Files</option>
                      </select>
                    </div>

                    {/* Amenities checklist with search */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Amenities
                      </label>
                      <input
                        type="text"
                        placeholder="Search amenities..."
                        value={amenitiesSearch}
                        onChange={(e) => setAmenitiesSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] mb-1.5 bg-white text-gray-700"
                      />
                      <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2.5 bg-gray-50/50 space-y-1">
                        {uniqueAmenities
                          .filter(a => a.toLowerCase().includes(amenitiesSearch.toLowerCase()))
                          .map(amenity => {
                            const isChecked = draftFilters.selectedAmenities.includes(amenity);
                            return (
                              <label key={amenity} className="flex items-center gap-2 px-1 py-0.5 hover:bg-gray-100 rounded cursor-pointer text-xs text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setDraftFilters(prev => ({
                                      ...prev,
                                      selectedAmenities: isChecked
                                        ? prev.selectedAmenities.filter(a => a !== amenity)
                                        : [...prev.selectedAmenities, amenity]
                                    }));
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                />
                                <span className="truncate">{amenity}</span>
                              </label>
                            );
                          })
                        }
                        {uniqueAmenities.length === 0 && (
                          <p className="text-[10px] text-gray-400 text-center py-2">No amenities found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : isConnectedRemarkTab ? (
                  <>
                    {/* CONNECTED REMARKS FILTERS */}
                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Master Tab ID
                      </label>
                      <select
                        value={draftFilters.tabId}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, tabId: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="All">All Tab IDs</option>
                        {uniqueTabIds.map(tab => (
                          <option key={tab} value={tab}>{tab}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Type 1 Name
                      </label>
                      <select
                        value={draftFilters.type1}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, type1: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="">All Types</option>
                        {uniqueType1Names.map(t1 => (
                          <option key={t1} value={t1}>{t1}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Type 2 Name
                      </label>
                      <select
                        value={draftFilters.type2}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, type2: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="">All Types</option>
                        {uniqueType2Names.map(t2 => (
                          <option key={t2} value={t2}>{t2}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {/* MASTER TYPES FILTERS */}
                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Min Value Count
                      </label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={draftFilters.minValues}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, minValues: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700 text-center"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Max Value Count
                      </label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={draftFilters.maxValues}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, maxValues: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700 text-center"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block font-semibold uppercase tracking-wider mb-1" style={{ fontSize: "10px", color: "#0f2b3d" }}>
                        Has Values
                      </label>
                      <select
                        value={draftFilters.hasValues}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, hasValues: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#e67e22] bg-white text-gray-700"
                      >
                        <option value="All">All Types</option>
                        <option value="With Values">With Values Only</option>
                        <option value="No Values">No Values (Empty)</option>
                      </select>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Footer Buttons — sticky at bottom */}
            <div
              className="flex gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}
            >
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters(initialFilters);
                  setDraftFilters(initialFilters);
                  setAmenitiesSearch("");
                }}
                className="flex-1 rounded-md transition-colors"
                style={{
                  padding: "8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "1px solid #e67e22",
                  background: "#fff",
                  color: "#e67e22",
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters(draftFilters);
                  setShowFilters(false);
                }}
                className="flex-1 rounded-md transition-opacity hover:opacity-90 text-white"
                style={{
                  padding: "8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: "#0f2b3d",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}