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
// } from "lucide-react";
// import Modal from "@/components/ui/Modal";
// import { masterDataAPI } from "@/lib/mastersAPI";
// import { ImportModal } from "./master/ImportModal";
// import { ConnectedRemarkForm } from "./master/ConnectedRemarkForm";
// import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
// import { toast, ToastContentProps } from "react-toastify";

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
// }

// /**
//  * IMPORTANT FIX:
//  * `remarks` can be one of:
//  *  - an array of strings or objects,
//  *  - a single object,
//  *  - or a plain string.
//  *
//  * Previously it was typed only as an array which made the non-array branch
//  * unreachable and caused `never` type errors when accessing properties like `.note`.
//  */
// interface ConnectedRemark {
//   id: string;
//   tabId?: string;
//   tab_id?: string;
//   type1: string;
//   value1: string;
//   type2: string;
//   value2: string;
//   // allow multiple shapes for remarks
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
//   const [tabs] = useState<Tab[]>([
//     { id: "property", title: "Property Master" },
//     { id: "buyer", title: "Buyer Master" },
//     { id: "seller", title: "Seller Master" },
//     { id: "lead", title: "Lead Master" },
//     { id: "common", title: "Common Master" },
//     { id: "connectedRemark", title: "Connected Remark" },
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
//   });

//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isValuesLoading, setIsValuesLoading] = useState<boolean>(false);

//   const [currentView, setCurrentView] = useState<"list" | "values">("list");
//   const [selectedMaster, setSelectedMaster] = useState<MasterItem | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>("");

//   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
//   const [selectedValueIds, setSelectedValueIds] = useState<string[]>([]);
//   const isAllSelected =
//     selectedMaster?.values?.length > 0 && selectedValueIds.length === (selectedMaster.values?.length ?? 0);

//   const [connectedRemarks, setConnectedRemarks] = useState<ConnectedRemark[]>([]);
//   const [currentConnectedRemark, setCurrentConnectedRemark] = useState<ConnectedRemark | null>(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("masterDataActiveTab", activeId);
//     }
//   }, [activeId]);

//   useEffect(() => {
//     if (isConnectedRemarkTab) {
//       loadConnectedRemarks();
//     } else {
//       loadMasterTypes();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeId]);

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
//         const updatedRemark = await connectedRemarkAPI.updateRemark(currentConnectedRemark.id, formData);
//         setConnectedRemarks((prev) =>
//           prev.map((item) => (item.id === currentConnectedRemark.id ? { ...item, ...updatedRemark } : item))
//         );
//         toast.success("Connected remark updated successfully ✏️");
//       } else {
//         const newRemark = await connectedRemarkAPI.createRemark(formData);
//         setConnectedRemarks((prev) => [...prev, newRemark]);
//         toast.success("Connected remark added successfully ✅");
//       }
//       await loadConnectedRemarks();
//       resetForm();
//     } catch (error) {
//       console.error("Error saving connected remark:", error);
//       toast.error("Error saving connected remark ❌ Please try again.");
//     }
//   };

//   const handleDeleteConnectedRemark = async (remarkId: string): Promise<void> => {
//     toast.info(
//       (props: ToastContentProps) => {
//         const close = (props as any).closeToast as (() => void) | undefined;
//         return (
//           <div>
//             <p className="text-sm mb-2">Are you sure you want to delete this connected remark?</p>
//             <div className="flex gap-2">
//               <button
//                 onClick={async () => {
//                   try {
//                     await connectedRemarkAPI.deleteRemark(remarkId);
//                     setConnectedRemarks((prev) => prev.filter((remark) => remark.id !== remarkId));
//                     toast.success("Connected remark deleted successfully 🗑️");
//                   } catch (error) {
//                     console.error("Error deleting connected remark:", error);
//                     toast.error("Error deleting connected remark ❌ Please try again.");
//                   } finally {
//                     close?.();
//                   }
//                 }}
//                 className="px-3 py-1 bg-red-600 text-white rounded text-xs"
//               >
//                 Yes
//               </button>
//               <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
//                 No
//               </button>
//             </div>
//           </div>
//         );
//       },
//       {
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         position: "top-center",
//       }
//     );
//   };

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

//   const handleBulkDelete = async (): Promise<void> => {
//     if (!selectedMaster || selectedValueIds.length === 0 || isConnectedRemarkTab) return;

//     toast.info(
//       (props: ToastContentProps) => {
//         const close = (props as any).closeToast as (() => void) | undefined;
//         return (
//           <div>
//             <p className="text-sm mb-2">Are you sure you want to delete {selectedValueIds.length} selected values?</p>
//             <div className="flex gap-2">
//               <button
//                 onClick={async () => {
//                   try {
//                     await Promise.all(selectedValueIds.map((id) => masterDataAPI.deleteMasterValue(id)));

//                     const updatedValues = selectedMaster.values.filter((v) => !selectedValueIds.includes(v.id));

//                     setItemsByTab((prev) => ({
//                       ...prev,
//                       [activeId]: prev[activeId].map((item) =>
//                         item.id === selectedMaster.id ? { ...item, values: updatedValues, valueCount: updatedValues.length } : item
//                       ),
//                     }));

//                     setSelectedMaster((prev) => (prev ? { ...prev, values: updatedValues } : null));

//                     setSelectedValueIds([]);
//                     toast.success("Selected values deleted successfully 🗑️");
//                   } catch (error) {
//                     console.error("Error deleting values:", error);
//                     toast.error("Error deleting selected values ❌ Please try again.");
//                   } finally {
//                     close?.();
//                   }
//                 }}
//                 className="px-3 py-1 bg-red-600 text-white rounded text-xs"
//               >
//                 Yes
//               </button>
//               <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
//                 No
//               </button>
//             </div>
//           </div>
//         );
//       },
//       {
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         position: "top-center",
//       }
//     );
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
//     } catch (error) {
//       console.error("Error saving master type:", error);
//       toast.error("Error saving master type ❌ Please try again.");
//     }
//   };

//   const handleEdit = (item: MasterItem): void => {
//     setCurrentItem(item);
//     setName(item.name);
//     setStatus(item.status);
//     setIsEditMode(true);
//     setIsModalOpen(true);
//   };

//   const handleEditConnectedRemark = (remark: ConnectedRemark): void => {
//     setCurrentConnectedRemark(remark);
//     setIsEditMode(true);
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id: string): Promise<void> => {
//     toast.info(
//       (props: ToastContentProps) => {
//         const close = (props as any).closeToast as (() => void) | undefined;
//         return (
//           <div>
//             <p className="text-sm mb-2">Are you sure you want to delete this master type?</p>
//             <div className="flex gap-2">
//               <button
//                 onClick={async () => {
//                   try {
//                     await masterDataAPI.deleteMasterType(id);

//                     setItemsByTab((prev) => ({
//                       ...prev,
//                       [activeId]: prev[activeId].filter((item) => item.id !== id),
//                     }));

//                     if (selectedMaster?.id === id) {
//                       setCurrentView("list");
//                       setSelectedMaster(null);
//                       setSelectedValueIds([]);
//                     }

//                     toast.success("Master type deleted successfully 🗑️");
//                   } catch (error) {
//                     console.error("Error deleting master type:", error);
//                     toast.error("Error deleting master type ❌ Please try again.");
//                   } finally {
//                     close?.();
//                   }
//                 }}
//                 className="px-3 py-1 bg-red-600 text-white rounded text-xs"
//               >
//                 Yes
//               </button>
//               <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
//                 No
//               </button>
//             </div>
//           </div>
//         );
//       },
//       {
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         position: "top-center",
//       }
//     );
//   };

//   const resetForm = (): void => {
//     setName("");
//     setStatus("Active");
//     setIsModalOpen(false);
//     setIsEditMode(false);
//     setCurrentItem(null);
//     setCurrentConnectedRemark(null);
//   };

//   const handleCardClick = async (master: MasterItem): Promise<void> => {
//     if (isConnectedRemarkTab) return;

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
//     } catch (error) {
//       console.error("Error saving value:", error);
//       toast.error("Error saving value ❌ Please try again.");
//     }
//   };

//   const handleEditValue = (value: Value): void => {
//     setValueInput(value.value);
//     setValueStatus(value.status);
//     setEditingValue(value);
//     setIsValueModalOpen(true);
//   };

//   const handleDeleteValue = async (valueId: string): Promise<void> => {
//     if (!selectedMaster) return;

//     toast.info(
//       (props: ToastContentProps) => {
//         const close = (props as any).closeToast as (() => void) | undefined;
//         return (
//           <div>
//             <p className="text-sm mb-2">Are you sure you want to delete this value?</p>
//             <div className="flex gap-2">
//               <button
//                 onClick={async () => {
//                   try {
//                     await masterDataAPI.deleteMasterValue(valueId);

//                     const updatedValues = selectedMaster.values.filter((v) => v.id !== valueId);

//                     setItemsByTab((prev) => ({
//                       ...prev,
//                       [activeId]: prev[activeId].map((item) =>
//                         item.id === selectedMaster.id ? { ...item, values: updatedValues, valueCount: updatedValues.length } : item
//                       ),
//                     }));

//                     setSelectedMaster((prev) => (prev ? { ...prev, values: updatedValues } : prev));

//                     setSelectedValueIds((prev) => prev.filter((id) => id !== valueId));

//                     toast.success("Value deleted successfully 🗑️");
//                   } catch (error) {
//                     console.error("Error deleting value:", error);
//                     toast.error("Error deleting value ❌ Please try again.");
//                   } finally {
//                     close?.();
//                   }
//                 }}
//                 className="px-3 py-1 bg-red-600 text-white rounded text-xs"
//               >
//                 Yes
//               </button>
//               <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
//                 No
//               </button>
//             </div>
//           </div>
//         );
//       },
//       {
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         position: "top-center",
//       }
//     );
//   };

//   const resetValueForm = (): void => {
//     setValueInput("");
//     setValueStatus("Active");
//     setIsValueModalOpen(false);
//     setEditingValue(null);
//   };

//   const handleExport = async (): Promise<void> => {
//     if (!selectedMaster || isConnectedRemarkTab) return;

//     try {
//       const blob = await masterDataAPI.exportMasterValues(selectedMaster.id);
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `${selectedMaster.name}_values.csv`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);

//       toast.success(`Values exported successfully for "${selectedMaster.name}" ✅`);
//     } catch (error) {
//       console.error("Error exporting values:", error);
//       toast.error("Error exporting values ❌ Please try again.");
//     }
//   };

//   const handleImport = async (file: File): Promise<void> => {
//     try {
//       if (importType === "master") {
//         await masterDataAPI.importMasterTypes(activeId, file);

//         if (isConnectedRemarkTab) {
//           await loadConnectedRemarks();
//         } else {
//           await loadMasterTypes();
//         }

//         toast.success("Master types imported successfully ✅");
//       } else {
//         if (!selectedMaster) {
//           toast.error("Please select a master first ❌");
//           return;
//         }

//         await masterDataAPI.importMasterValues(selectedMaster.id, file);
//         await loadMasterValues(selectedMaster.id);

//         toast.success(`Values imported successfully for "${selectedMaster.name}" ✅`);
//       }
//     } catch (error) {
//       console.error(`Error importing ${importType}:`, error);
//       toast.error(`Failed to import ${importType} ❌ Please try again.`);
//     }
//   };

//   const handleMasterExport = async (): Promise<void> => {
//     if (isConnectedRemarkTab) return;

//     try {
//       const blob = await masterDataAPI.exportMasterTypes(activeId);
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `${activeTab.title}_master_types.csv`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error exporting master types:", error);
//       toast.error("Error exporting master types ❌ Please try again.");
//     }
//   };

//   const filteredValues: Value[] =
//     selectedMaster?.values
//       ?.filter((value) =>
//         value.value.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//       .sort((a, b) => {
//         const numA = parseInt(a.value); // "10th Floor" -> 10
//         const numB = parseInt(b.value); // "2nd Floor"  -> 2
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

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="p-4 border-b bg-white shadow-sm">
//         <h1 className="text-xl font-semibold">Master Data Management</h1>
//       </header>

//       {/* Tabs */}
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
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//             >
//               {t.title}
//             </button>
//           ))}
//         </div>
//       </nav>


//       {/* Content */}
//     <main className="p-3 sm:p-4">
//   {currentView === "list" ? (
//     <>
//       {/* Header with Create button */}
//       <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
//         <h2 className="text-base sm:text-lg font-semibold truncate">{activeTab.title}</h2>

//         <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 md:gap-3 md:flex-wrap">
//           <input
//             type="text"
//             placeholder="Search..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full sm:w-56 md:w-64 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           {!isConnectedRemarkTab && (
//             <>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => {
//                     setImportType("master");
//                     setIsImportModalOpen(true);
//                   }}
//                   className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
//                 >
//                   <Upload size={14} />
//                   <span className="whitespace-nowrap">Import {activeTab.title}</span>
//                 </button>
//               </div>

//               <button
//                 onClick={handleMasterExport}
//                 disabled={!filteredMasterItems.length}
//                 className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
//               >
//                 <Download size={14} />
//                 <span className="whitespace-nowrap">Export</span>
//               </button>
//             </>
//           )}

//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-xs"
//           >
//             <Plus size={14} />
//             <span className="whitespace-nowrap">
//               {isConnectedRemarkTab ? "Add Connected Remark" : `Create ${activeTab.title} types`}
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* Loading State */}
//       {isLoading ? (
//         <div className="text-center py-10 sm:py-12">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
//           <p className="mt-2 text-gray-500 text-sm">Loading...</p>
//         </div>
//       ) : isConnectedRemarkTab ? (
//         <div className="bg-white rounded-lg shadow-sm">
//           {filteredConnectedRemarks.length === 0 ? (
//             <div className="text-center py-10 sm:py-12 text-gray-500">
//               <Plus size={40} className="mx-auto mb-3 opacity-50" />
//               {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No connected remarks created yet</p>}
//             </div>
//           ) : (
//             <div className="w-full overflow-x-auto">
//               <table className="min-w-[800px] w-full border-collapse">
//                 <thead>
//                   <tr className="border-b bg-gray-50">
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">#</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Tab Id</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Type 1</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Value 1</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Type 2</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Master Value 2</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Remarks</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredConnectedRemarks.map((remark, index) => (
//                     <tr key={remark.id} className="border-b hover:bg-gray-50">
//                       <td className="p-3 text-gray-600 text-xs">{index + 1}</td>
//                       <td className="p-3 font-medium text-xs">{remark.tab_id || remark.tabId || "N/A"}</td>
//                       <td className="p-3 font-medium text-xs">{remark.type1Name || "N/A"}</td>
//                       <td className="p-3 font-medium text-xs">{remark.value1Name || "N/A"}</td>
//                       <td className="p-3 font-medium text-xs">{remark.type2Name || "N/A"}</td>
//                       <td className="p-3 font-medium text-xs">{remark.value2Name || "N/A"}</td>
//                       <td className="p-3 font-medium text-xs max-w-xs">
//                         {(() => {
//                           if (!remark.remarks || (Array.isArray(remark.remarks) && remark.remarks.length === 0)) {
//                             return <span className="text-gray-400">No remarks</span>;
//                           }
//                           if (Array.isArray(remark.remarks)) {
//                             return (
//                               <ol className="list-decimal list-inside space-y-1">
//                                 {remark.remarks.map((remarkText, idx) => {
//                                   const text =
//                                     typeof remarkText === "object" && remarkText !== null
//                                       ? (remarkText as any).note || (remarkText as any).text || (remarkText as any).remark || "Empty remark"
//                                       : String(remarkText || "Empty remark");
//                                   return (
//                                     <li key={idx} className="text-[11px] sm:text-xs text-gray-700 break-words">
//                                       {text}
//                                     </li>
//                                   );
//                                 })}
//                               </ol>
//                             );
//                           }
//                           if (typeof remark.remarks === "object" && remark.remarks !== null) {
//                             const r = remark.remarks as Record<string, any>;
//                             const text = r.note || r.text || r.remark || "Empty remark";
//                             return <span className="text-[11px] sm:text-xs text-gray-700">{text}</span>;
//                           }
//                           return (
//                             <span className="text-[11px] sm:text-xs text-gray-700">
//                               {String(remark.remarks ?? "Empty remark")}
//                             </span>
//                           );
//                         })()}
//                       </td>
//                       <td className="p-3">
//                         <span
//                           className={`px-2 py-1 rounded text-[11px] sm:text-xs font-medium ${
//                             remark.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                           }`}
//                         >
//                           {remark.status}
//                         </span>
//                       </td>
//                       <td className="p-3">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleEditConnectedRemark(remark)}
//                             className="p-1 text-blue-600 hover:bg-blue-100 rounded"
//                           >
//                             <Edit2 size={14} />
//                           </button>
//                           <button
//                             onClick={() => handleDeleteConnectedRemark(remark.id)}
//                             className="p-1 text-red-600 hover:bg-red-100 rounded"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
//           {filteredMasterItems.length === 0 ? (
//             <div className="col-span-full text-center py-10 sm:py-12 text-gray-500">
//               <Plus size={40} className="mx-auto mb-3 opacity-50" />
//               {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No {activeTab.title} types created yet</p>}
//             </div>
//           ) : (
//             filteredMasterItems.map((item) => (
//               <div
//                 key={item.id}
//                 className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
//                 onClick={() => handleCardClick(item)}
//               >
//                 <div className="flex justify-between items-start mb-1">
//                   <h3 className="font-semibold text-sm sm:text-[15px]">{item.name}</h3>
//                   <div className="flex gap-1">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleEdit(item);
//                       }}
//                       className="p-1 text-blue-600 hover:bg-blue-50 rounded"
//                     >
//                       <Edit2 size={14} />
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDelete(item.id);
//                       }}
//                       className="p-1 text-red-600 hover:bg-red-50 rounded"
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <span
//                     className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium ${
//                       item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {item.status === "Active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
//                     {item.status}
//                   </span>
//                   <span className="text-[11px] sm:text-xs text-gray-500">{item.valueCount} values</span>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </>
//   ) : (
//     <>
//       <div className="mb-4 sm:mb-6">
//         <button
//           onClick={handleBackToList}
//           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-3 sm:mb-4"
//         >
//           <ArrowLeft size={18} className="sm:size-5" />
//           <span className="text-sm sm:text-base">Back to {activeTab.title}</span>
//         </button>

//         <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
//             <div>
//               <h2 className="text-sm sm:text-base font-semibold">{selectedMaster?.name}</h2>
//               <span
//                 className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium mt-2 ${
//                   selectedMaster?.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                 }`}
//               >
//                 {selectedMaster?.status === "Active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
//                 {selectedMaster?.status}
//               </span>
//             </div>

//             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 md:gap-3 md:flex-wrap">
//               {!isConnectedRemarkTab && selectedValueIds.length > 0 && (
//                 <button
//                   onClick={handleBulkDelete}
//                   className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
//                 >
//                   <Trash2 size={14} />
//                   <span className="whitespace-nowrap">Delete Selected ({selectedValueIds.length})</span>
//                 </button>
//               )}

//               <input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full sm:w-56 md:w-64 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />

//               {!isConnectedRemarkTab && (
//                 <>
//                   <button
//                     onClick={() => {
//                       setImportType("values");
//                       setIsImportModalOpen(true);
//                     }}
//                     disabled={!selectedMaster}
//                     className={`w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs ${
//                       !selectedMaster ? "opacity-50 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     <Upload size={14} />
//                     <span className="whitespace-nowrap">Import {activeTab.title} Values</span>
//                   </button>

//                   <button
//                     onClick={handleExport}
//                     disabled={!selectedMaster?.values?.length}
//                     className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
//                   >
//                     <Download size={14} />
//                     <span className="whitespace-nowrap">Export</span>
//                   </button>
//                 </>
//               )}

//               {!isConnectedRemarkTab && (
//                 <button
//                   onClick={() => setIsValueModalOpen(true)}
//                   className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
//                 >
//                   <Plus size={14} />
//                   <span className="whitespace-nowrap">Add Value</span>
//                 </button>
//               )}
//             </div>
//           </div>

//           {isValuesLoading ? (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
//               <p className="mt-2 text-gray-500 text-sm">Loading values...</p>
//             </div>
//           ) : filteredValues.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               {selectedMaster?.values?.length === 0 ? (
//                 <>
//                   <Plus size={32} className="mx-auto mb-2 opacity-50" />
//                   <p>No values added yet</p>
//                 </>
//               ) : (
//                 <p>
//                   No values found matching{" "}
//                   <span className="font-medium">&quot;{searchTerm}&quot;</span>
//                 </p>
//               )}
//             </div>
//           ) : (
//             <div className="w-full overflow-x-auto">
//               <table className="min-w-[600px] w-full border-collapse">
//                 <thead>
//                   <tr className="border-b bg-gray-50">
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={isAllSelected}
//                           onChange={toggleSelectAll}
//                           className="h-4 w-4"
//                         />
//                         <span>#</span>
//                       </div>
//                     </th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Value</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
//                     <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredValues.map((value, index) => (
//                     <tr key={value.id} className="border-b hover:bg-gray-50">
//                       <td className="p-3 text-gray-600 text-xs">
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="checkbox"
//                             checked={selectedValueIds.includes(value.id)}
//                             onChange={() => toggleSelectValue(value.id)}
//                             className="h-4 w-4"
//                           />
//                           {index + 1}
//                         </div>
//                       </td>
//                       <td className="p-3 font-medium text-xs">{value.value}</td>
//                       <td className="p-3">
//                         <span
//                           className={`px-2 py-1 rounded text-[11px] sm:text-xs font-medium ${
//                             value.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                           }`}
//                         >
//                           {value.status}
//                         </span>
//                       </td>
//                       <td className="p-3">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleEditValue(value)}
//                             className="p-1 text-blue-600 hover:bg-blue-100 rounded"
//                           >
//                             <Edit2 size={14} />
//                           </button>
//                           <button
//                             onClick={() => handleDeleteValue(value.id)}
//                             className="p-1 text-red-600 hover:bg-red-100 rounded"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )}
// </main>


//       <Modal
//         isOpen={isModalOpen}
//         onClose={resetForm}
//         title={isConnectedRemarkTab ? (isEditMode ? "Edit Connected Remark" : "Add Connected Remark") : `${isEditMode ? "Edit" : "Create"} Master Type`}
//       >
//         {isConnectedRemarkTab ? (
//           <ConnectedRemarkForm onClose={resetForm} onSubmit={handleConnectedRemarkSubmit} initialData={isEditMode && currentConnectedRemark ? (currentConnectedRemark as any) : null} />
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <div className="space-y-4">
//               <div>
//                 <label className="block mb-1 font-medium text-xs">Name</label>
//                 <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" />
//               </div>
//               <div>
//                 <label className="block mb-1 font-medium text-xs">Status</label>
//                 <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs">
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </div>
//               <div className="flex justify-end gap-2">
//                 <button type="button" onClick={resetForm} className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs">
//                   Cancel
//                 </button>
//                 <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs">
//                   {isEditMode ? "Update" : "Create"}
//                 </button>
//               </div>
//             </div>
//           </form>
//         )}
//       </Modal>

//       <Modal isOpen={isValueModalOpen} onClose={resetValueForm} title={`${editingValue ? "Edit" : "Add"} Value`}>
//         <form onSubmit={handleValueSubmit}>
//           <div className="space-y-4">
//             <div>
//               <label className="block mb-1 font-medium text-xs">Value</label>
//               <input type="text" value={valueInput} onChange={(e) => setValueInput(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" />
//             </div>
//             <div>
//               <label className="block mb-1 font-medium text-xs">Status</label>
//               <select value={valueStatus} onChange={(e) => setValueStatus(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs">
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </select>
//             </div>
//             <div className="flex justify-end gap-2">
//               <button type="button" onClick={resetValueForm} className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs">
//                 Cancel
//               </button>
//               <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs">
//                 {editingValue ? "Update" : "Create"}
//               </button>
//             </div>
//           </div>
//         </form>
//       </Modal>

//       <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImport} title={`Import ${importType === "master" ? activeTab.title : (selectedMaster?.name ?? "") + " Values"}`} type={importType} />
//     </div>
//   );
// }




// src/pages/settings/MasterDataPage.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  ArrowLeft,
  Upload,
  Download,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { masterDataAPI } from "@/lib/mastersAPI";
import { ImportModal } from "./master/ImportModal";
import { ConnectedRemarkForm } from "./master/ConnectedRemarkForm";
import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
import { societyAPI } from "@/lib/societyAPI";
import { toast, ToastContentProps } from "react-toastify";
import SocietyForm from "./master/SocietyForm";

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

export default function MasterDataPage(): JSX.Element {
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

  const [societies, setSocieties] = useState<SocietyData[]>([]);
  const [currentSociety, setCurrentSociety] = useState<SocietyData | null>(null);

  const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([]);
  const [isAllSocietiesSelected, setIsAllSocietiesSelected] = useState(false);

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

  const handleDeleteSociety = async (societyId: string): Promise<void> => {
    toast.info(
      (props: ToastContentProps) => {
        const close = (props as any).closeToast as (() => void) | undefined;
        return (
          <div>
            <p className="text-sm mb-2">Are you sure you want to delete this society?</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await societyAPI.deleteSociety(societyId);
                    await loadSocieties();
                    toast.success("Society deleted successfully 🗑️");
                  } catch (error: any) {
                    console.error("Error deleting society:", error);
                    const errorMessage = error.response?.data?.error || "Error deleting society ❌ Please try again.";
                    toast.error(errorMessage);
                  } finally {
                    close?.();
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs"
              >
                Yes
              </button>
              <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
                No
              </button>
            </div>
          </div>
        );
      },
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
      }
    );
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

    toast.info(
      (props: ToastContentProps) => {
        const close = (props as any).closeToast as (() => void) | undefined;
        return (
          <div>
            <p className="text-sm mb-2">Are you sure you want to delete {selectedSocietyIds.length} selected societies?</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await Promise.all(selectedSocietyIds.map(id => societyAPI.deleteSociety(id)));
                    await loadSocieties();
                    setSelectedSocietyIds([]);
                    setIsAllSocietiesSelected(false);
                    toast.success(`${selectedSocietyIds.length} societies deleted successfully 🗑️`);
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || "Error deleting societies ❌");
                  } finally {
                    close?.();
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs"
              >
                Yes
              </button>
              <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
                No
              </button>
            </div>
          </div>
        );
      },
      { autoClose: false, closeOnClick: false, draggable: false, position: "top-center" }
    );
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
    toast.info(
      (props: ToastContentProps) => {
        const close = (props as any).closeToast as (() => void) | undefined;
        return (
          <div>
            <p className="text-sm mb-2">Are you sure you want to delete this connected remark?</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await connectedRemarkAPI.deleteRemark(remarkId);
                    await loadConnectedRemarks();
                    toast.success("Connected remark deleted successfully 🗑️");
                  } catch (error: any) {
                    console.error("Error deleting connected remark:", error);
                    const errorMessage = error.response?.data?.error || "Error deleting connected remark ❌ Please try again.";
                    toast.error(errorMessage);
                  } finally {
                    close?.();
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs"
              >
                Yes
              </button>
              <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
                No
              </button>
            </div>
          </div>
        );
      },
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
      }
    );
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
    toast.info(
      (props: ToastContentProps) => {
        const close = (props as any).closeToast as (() => void) | undefined;
        return (
          <div>
            <p className="text-sm mb-2">Are you sure you want to delete this master type?</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await masterDataAPI.deleteMasterType(id);
                    await loadMasterTypes();

                    if (selectedMaster?.id === id) {
                      setCurrentView("list");
                      setSelectedMaster(null);
                      setSelectedValueIds([]);
                    }

                    toast.success("Master type deleted successfully 🗑️");
                  } catch (error: any) {
                    console.error("Error deleting master type:", error);
                    const errorMessage = error.response?.data?.error || "Error deleting master type ❌ Please try again.";
                    toast.error(errorMessage);
                  } finally {
                    close?.();
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs"
              >
                Yes
              </button>
              <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
                No
              </button>
            </div>
          </div>
        );
      },
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
      }
    );
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

    toast.info(
      (props: ToastContentProps) => {
        const close = (props as any).closeToast as (() => void) | undefined;
        return (
          <div>
            <p className="text-sm mb-2">Are you sure you want to delete this value?</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await masterDataAPI.deleteMasterValue(valueId);
                    await loadMasterValues(selectedMaster.id);
                    setSelectedValueIds((prev) => prev.filter((id) => id !== valueId));
                    toast.success("Value deleted successfully 🗑️");
                  } catch (error: any) {
                    console.error("Error deleting value:", error);
                    const errorMessage = error.response?.data?.error || "Error deleting value ❌ Please try again.";
                    toast.error(errorMessage);
                  } finally {
                    close?.();
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs"
              >
                Yes
              </button>
              <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
                No
              </button>
            </div>
          </div>
        );
      },
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
      }
    );
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (!selectedMaster || selectedValueIds.length === 0 || isConnectedRemarkTab) return;

    toast.info(
      (props: ToastContentProps) => {
        const close = (props as any).closeToast as (() => void) | undefined;
        return (
          <div>
            <p className="text-sm mb-2">Are you sure you want to delete {selectedValueIds.length} selected values?</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await Promise.all(selectedValueIds.map((id) => masterDataAPI.deleteMasterValue(id)));
                    await loadMasterValues(selectedMaster.id);
                    setSelectedValueIds([]);
                    toast.success("Selected values deleted successfully 🗑️");
                  } catch (error: any) {
                    console.error("Error deleting values:", error);
                    const errorMessage = error.response?.data?.error || "Error deleting selected values ❌ Please try again.";
                    toast.error(errorMessage);
                  } finally {
                    close?.();
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs"
              >
                Yes
              </button>
              <button onClick={() => close?.()} className="px-3 py-1 bg-gray-300 rounded text-xs">
                No
              </button>
            </div>
          </div>
        );
      },
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
      }
    );
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
    await loadMasterValues(master.id);
  };

  const handleBackToList = (): void => {
    setCurrentView("list");
    setSelectedMaster(null);
    setSearchTerm("");
    setSelectedValueIds([]);
  };

  const handleExport = async (): Promise<void> => {
    if (!selectedMaster || isConnectedRemarkTab) return;

    try {
      const blob = await masterDataAPI.exportMasterValues(selectedMaster.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedMaster.name}_values.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Values exported successfully for "${selectedMaster.name}" ✅`);
    } catch (error) {
      console.error("Error exporting values:", error);
      toast.error("Error exporting values ❌ Please try again.");
    }
  };

  const handleMasterExport = async (): Promise<void> => {
    if (isConnectedRemarkTab) return;

    try {
      const blob = await masterDataAPI.exportMasterTypes(activeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${activeTab.title}_master_types.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Master types exported successfully ✅");
    } catch (error) {
      console.error("Error exporting master types:", error);
      toast.error("Error exporting master types ❌ Please try again.");
    }
  };

  const handleImport = async (file: File): Promise<void> => {
    try {
      if (importType === "master") {
        await masterDataAPI.importMasterTypes(activeId, file);

        if (isConnectedRemarkTab) {
          await loadConnectedRemarks();
        } else if (isSocietyTab) {
          await loadSocieties();
        } else {
          await loadMasterTypes();
        }

        toast.success("Master types imported successfully ✅");
      } else {
        if (!selectedMaster) {
          toast.error("Please select a master first ❌");
          return;
        }

        await masterDataAPI.importMasterValues(selectedMaster.id, file);
        await loadMasterValues(selectedMaster.id);

        toast.success(`Values imported successfully for "${selectedMaster.name}" ✅`);
      }
    } catch (error) {
      console.error(`Error importing ${importType}:`, error);
      toast.error(`Failed to import ${importType} ❌ Please try again.`);
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
      ?.filter((value) =>
        value.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const numA = parseInt(a.value);
        const numB = parseInt(b.value);
        return numA - numB;
      }) || [];

  const filteredMasterItems = itemsByTab[activeId].filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

    return (
      (remark.type1Name?.toLowerCase() || "").includes(searchLower) ||
      (remark.value1Name?.toLowerCase() || "").includes(searchLower) ||
      (remark.type2Name?.toLowerCase() || "").includes(searchLower) ||
      (remark.value2Name?.toLowerCase() || "").includes(searchLower) ||
      remarksText.toLowerCase().includes(searchLower)
    );
  });

  const filteredSocieties = societies.filter((society) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      society.societyName.toLowerCase().includes(searchLower) ||
      society.locality.toLowerCase().includes(searchLower) ||
      society.city.toLowerCase().includes(searchLower) ||
      society.pincode.includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
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
                setSearchTerm("");
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
              <h2 className="text-base sm:text-lg font-semibold truncate">{activeTab.title}</h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 md:gap-3 md:flex-wrap">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56 md:w-64 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {!isConnectedRemarkTab && !isSocietyTab && (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setImportType("master");
                          setIsImportModalOpen(true);
                        }}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
                      >
                        <Upload size={14} />
                        <span className="whitespace-nowrap">Import {activeTab.title}</span>
                      </button>
                    </div>

                    <button
                      onClick={handleMasterExport}
                      disabled={!filteredMasterItems.length}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
                    >
                      <Download size={14} />
                      <span className="whitespace-nowrap">Export</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-xs"
                >
                  <Plus size={14} />
                  <span className="whitespace-nowrap">
                    {isConnectedRemarkTab ? "Add Connected Remark" : isSocietyTab ? "Add Society" : `Create ${activeTab.title} types`}
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
                {filteredConnectedRemarks.length === 0 ? (
                  <div className="text-center py-10 sm:py-12 text-gray-500">
                    <Plus size={40} className="mx-auto mb-3 opacity-50" />
                    {searchTerm.trim() !== "" ? <p>No results found</p> : <p>No connected remarks created yet</p>}
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-[800px] w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium text-[11px] sm:text-xs">#</th>
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
                      <tbody>
                        {filteredConnectedRemarks.map((remark, index) => (
                          <tr key={remark.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-gray-600 text-xs">{index + 1}</td>
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
                                className={`px-2 py-1 rounded text-[11px] sm:text-xs font-medium ${remark.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {remark.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditConnectedRemark(remark)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteConnectedRemark(remark.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                    <div className="w-full overflow-x-auto">
                      <table className="min-w-[800px] w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-3 font-medium text-[11px] sm:text-xs">
                              <input
                                type="checkbox"
                                checked={isAllSocietiesSelected}
                                onChange={toggleSelectAllSocieties}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </th>
                            <th className="text-left p-3 font-medium text-[11px] sm:text-xs">#</th>
                            <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Society Name</th>
                            <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Locality</th>
                            <th className="text-left p-3 font-medium text-[11px] sm:text-xs">City</th>
                            <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Pincode</th>
                            <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Status</th>
                            <th className="text-left p-3 font-medium text-[11px] sm:text-xs">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSocieties.map((society, index) => (
                            <tr key={society.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={selectedSocietyIds.includes(society.id!)}
                                  onChange={() => toggleSelectSociety(society.id!)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </td>
                              <td className="p-3 text-gray-600 text-xs">{index + 1}</td>
                              <td className="p-3 font-medium text-xs">{society.societyName}</td>
                              <td className="p-3 font-medium text-xs">{society.locality}</td>
                              <td className="p-3 font-medium text-xs">{society.city}</td>
                              <td className="p-3 font-medium text-xs">{society.pincode}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-[11px] sm:text-xs font-medium ${society.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {society.status || "Active"}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button onClick={() => handleEditSociety(society)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteSociety(society.id!)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold">{selectedMaster?.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium mt-2 ${selectedMaster?.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                    >
                      {selectedMaster?.status === "Active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {selectedMaster?.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 md:gap-3 md:flex-wrap">
                    {!isConnectedRemarkTab && selectedValueIds.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
                      >
                        <Trash2 size={14} />
                        <span className="whitespace-nowrap">Delete Selected ({selectedValueIds.length})</span>
                      </button>
                    )}

                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-56 md:w-64 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {!isConnectedRemarkTab && (
                      <>
                        <button
                          onClick={() => {
                            setImportType("values");
                            setIsImportModalOpen(true);
                          }}
                          disabled={!selectedMaster}
                          className={`w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs ${!selectedMaster ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          <Upload size={14} />
                          <span className="whitespace-nowrap">Import Values</span>
                        </button>

                        <button
                          onClick={handleExport}
                          disabled={!selectedMaster?.values?.length}
                          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
                        >
                          <Download size={14} />
                          <span className="whitespace-nowrap">Export</span>
                        </button>
                      </>
                    )}

                    {!isConnectedRemarkTab && (
                      <button
                        onClick={() => setIsValueModalOpen(true)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs"
                      >
                        <Plus size={14} />
                        <span className="whitespace-nowrap">Add Value</span>
                      </button>
                    )}
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
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-[600px] w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
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
                      <tbody>
                        {filteredValues.map((value, index) => (
                          <tr key={value.id} className="border-b hover:bg-gray-50">
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
                                className={`px-2 py-1 rounded text-[11px] sm:text-xs font-medium ${value.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {value.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditValue(value)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteValue(value.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* <Modal
        isOpen={isModalOpen}
        onClose={isConnectedRemarkTab || isSocietyTab ? (isSocietyTab ? resetSocietyForm : resetForm) : resetForm}
        title={isConnectedRemarkTab ? (isEditMode ? "Edit Connected Remark" : "Add Connected Remark") : isSocietyTab ? (isEditMode ? "Edit Society" : "Add Society") : `${isEditMode ? "Edit" : "Create"} Master Type`}
      >
        {isConnectedRemarkTab ? (
          <ConnectedRemarkForm
            onClose={resetForm}
            onSubmit={handleConnectedRemarkSubmit}
            initialData={isEditMode && currentConnectedRemark ? (currentConnectedRemark as any) : null}
          />
        ) : isSocietyTab ? (
          <SocietyForm
            onClose={resetSocietyForm}
            onSubmit={handleSocietySubmit}
            initialData={isEditMode && currentSociety ? currentSociety : null}
              isEditing={isEditMode}
              onRefresh={async () => {
                console.log("Refresh called"); // 🔥 Debug log
                await loadSocieties();
              }}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
                >
                  {isEditMode ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal> */}

      {/* Modal for Connected Remark and Master Type (without Society) */}
      <Modal
        isOpen={isModalOpen && !isSocietyTab}
        onClose={resetForm}
        title={isConnectedRemarkTab ? (isEditMode ? "Edit Connected Remark" : "Add Connected Remark") : `${isEditMode ? "Edit" : "Create"} Master Type`}
      >
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
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
                >
                  {isEditMode ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Separate Modal for Society with custom header */}
      <Modal
        isOpen={isModalOpen && isSocietyTab}
        onClose={resetSocietyForm}
        showHeader={false}
        showCloseButton={false}
        width="max-w-3xl"
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

      <Modal isOpen={isValueModalOpen} onClose={resetValueForm} title={`${editingValue ? "Edit" : "Add"} Value`}>
        <form onSubmit={handleValueSubmit}>
          <div className="space-y-4 px-5 py-4 ">
            <div>
              <label className="block mb-1 font-medium text-xs">Value</label>
              <input
                type="text"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs "
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

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title={`Import ${importType === "master" ? activeTab.title : (selectedMaster?.name ?? "") + " Values"}`}
        type={importType}
      />
    </div>
  );
}