// import React, { FC, useMemo, useState, useEffect, useRef } from 'react';
// import {
//   Plus,
//   Trash2,
//   Edit2,
//   Check,
//   Upload,
//   Download,
//   CheckCircle2,
//   XCircle,
// } from 'lucide-react';
// import Modal from '@/components/ui/Modal';
// import { variableAPI } from '@/lib/variableAPI';
// import { toast } from 'react-toastify';
// import TableLoader from '@/components/ui/TableLoader';

// /** ----------------------------- Types ----------------------------- **/
// type Status = 'active' | 'inactive';

// interface Variable {
//   id: number;
//   name: string;
//   variable_key: string;        // <- system key (buyer_name)
//   placeholder: string;         // <- token ({{buyer_name}})
//   variable_tab_id: string;     // <- buyer/seller/property
//   category: string;            // <- will store tab id (same as variable_tab_id)
//   status: Status;
// }

// type VariablesState = Record<string, Variable[]>;

// interface Tab {
//   id: string;
//   label: string;
// }

// /** --------------------------- Constants --------------------------- **/
// const TABS: Tab[] = [
//   { id: 'buyer', label: 'Buyer Variables' },
//   { id: 'seller', label: 'Seller Variables' },
//   { id: 'property', label: 'Property Variables' },
//   { id: 'leads', label: 'Leads Variables' },
//   { id: 'account', label: 'Account Variables' },
//   { id: 'company', label: 'Company Variables' },
//   { id: 'common', label: 'Common Variables' },
// ];

// const normalizeKey = (s: string = '') =>
//   s
//     .trim()
//     .replace(/[^a-zA-Z0-9]+/g, '_')
//     .replace(/_+/g, '_')
//     .replace(/^_+|_+$/g, '')
//     .toLowerCase();

// const toPlaceholder = (key: string = '') => (key ? `{{${key}}}` : '');

// /** Dynamic tab placeholders for UX hints only */
// const TAB_PLACEHOLDERS: Record<string, { display: string; key: string }> = {
//   buyer: { display: 'Buyer Name', key: 'buyer_name' },
//   seller: { display: 'Seller Name', key: 'seller_name' },
//   property: { display: 'Property Title', key: 'property_title' },
//   leads: { display: 'Lead Name', key: 'lead_name' },
//   account: { display: 'Account Name', key: 'account_name' },
//   company: { display: 'Company Name', key: 'company_name' },
//   common: { display: 'Common Variable', key: 'common_variable' },
// };

// /** -------------------------- Component --------------------------- **/
// const VariableCenter: FC = () => {
//   const [variables, setVariables] = useState<VariablesState>({});
//   const [activeTabId, setActiveTabId] = useState<string>(TABS[0].id);
//   const [query, setQuery] = useState<string>('');

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [form, setForm] = useState<{
//     name: string;
//     variable_key: string;
//     placeholder: string;
//     status: Status;
//   }>({
//     name: '',
//     variable_key: '',
//     placeholder: '',
//     status: 'active',
//   });
//   const [isKeyDirty, setIsKeyDirty] = useState(false);
//   const [error, setError] = useState('');

//   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
//   const headerCheckboxRef = useRef<HTMLInputElement>(null);

//   const [loading, setLoading] = useState<boolean>(false);

//   // Import modal state
//   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
//   const [importTabId, setImportTabId] = useState<string>(activeTabId);
//   const [skipDupOnImport, setSkipDupOnImport] = useState<boolean>(true);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const tabsById = useMemo(() => {
//     const m = new Map<string, Tab>();
//     TABS.forEach((t) => m.set(t.id, t));
//     return m;
//   }, []);

//   const activeTabLabel = tabsById.get(activeTabId)?.label ?? 'Variables';
//   const activeTabUX = TAB_PLACEHOLDERS[activeTabId] || {
//     display: 'Variable Name',
//     key: 'variable_name',
//   };

//   /** ------------------------ CSV Template ------------------------ **/
//   const buildVariableCsvTemplate = (tabId: string) => {
//     // Header aligned with new schema
//     const header = [
//       'name',
//       'variable_key',
//       'placeholder',
//       'variable_tab_id',
//       'category',
//       'status',
//     ];

//     const samples: Record<
//       string,
//       [string, string, string, string, string, 'active' | 'inactive'][]
//     > = {
//       buyer: [[ 'Buyer Name', 'buyer_name', '{{buyer_name}}', 'buyer', 'buyer', 'active' ]],
//       seller: [[ 'Seller Name', 'seller_name', '{{seller_name}}', 'seller', 'seller', 'active' ]],
//       property: [[ 'Property Title', 'property_title', '{{property_title}}', 'property', 'property', 'active' ]],
//       leads: [[ 'Lead Name', 'lead_name', '{{lead_name}}', 'leads', 'leads', 'active' ]],
//       account: [
//         [ 'Account Name', 'account_name', '{{account_name}}', 'account', 'account', 'active' ],
//         [ 'Account Number', 'account_number', '{{account_number}}', 'account', 'account', 'inactive' ],
//       ],
//       company: [[ 'Company Name', 'company_name', '{{company_name}}', 'company', 'company', 'active' ]],
//       common: [[ 'Common Variable', 'common_variable', '{{common_variable}}', 'common', 'common', 'active' ]],
//     };

//     const sampleRows =
//       samples[tabId] ||
//       [[ 'Sample Name', 'sample_key', '{{sample_key}}', tabId, tabId, 'active' ]];

//     const rows = [header, ...sampleRows]
//       .map((cols) =>
//         cols.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','),
//       )
//       .join('\n');

//     return new Blob([rows], { type: 'text/csv;charset=utf-8;' });
//   };

//   const downloadTemplateCSV = (tabId: string, tabLabel: string) => {
//     const blob = buildVariableCsvTemplate(tabId);
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `Import_Template_${(tabLabel || 'Variables').replace(/\s+/g, '_')}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   /** ----------------------- Data Loading ------------------------ **/
//   const loadVariables = async (tabId: string) => {
//     try {
//       setLoading(true);
//       const res = await variableAPI.getByTab(tabId);
//       // Expecting res = { success: boolean, data: Variable[] }
//       if (res?.success) {
//         setVariables((prev) => ({ ...prev, [tabId]: res.data || [] }));
//       } else {
//         toast.error('Failed to fetch variables.');
//       }
//     } catch (err) {
//       console.error('Error fetching variables:', err);
//       toast.error('Failed to fetch variables.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadVariables(activeTabId);
//     setSelectedIds(new Set());
//   }, [activeTabId]);

//   /** ---------------------- Derived Values ----------------------- **/
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const list = variables[activeTabId] || [];
//     if (!q) return list;
//     return list.filter(
//       (v) =>
//         v.name.toLowerCase().includes(q) ||
//         v.variable_key.toLowerCase().includes(q) ||
//         v.placeholder.toLowerCase().includes(q),
//     );
//   }, [variables, activeTabId, query]);

//   const totalCount = useMemo(
//     () => Object.values(variables).reduce((sum, list) => sum + (list?.length || 0), 0),
//     [variables],
//   );

//   const tabCounts = useMemo(() => {
//     const m = new Map<string, number>();
//     for (const t of TABS) m.set(t.id, variables[t.id]?.length ?? 0);
//     return m;
//   }, [variables]);

//   /** ------------------------- Form Logic ------------------------ **/
//   const resetForm = () => {
//     setEditingId(null);
//     setForm({ name: '', variable_key: '', placeholder: '', status: 'active' });
//     setIsKeyDirty(false);
//     setError('');
//     setIsModalOpen(false);
//   };

//   const openAddModal = () => {
//     setEditingId(null);
//     setForm({
//       name: '',
//       variable_key: '',
//       placeholder: '',
//       status: 'active',
//     });
//     setIsKeyDirty(false);
//     setError('');
//     setIsModalOpen(true);
//   };

//   const startEdit = (item: Variable) => {
//     setEditingId(item.id);
//     setForm({
//       name: item.name,
//       variable_key: item.variable_key,
//       placeholder: item.placeholder,
//       status: item.status,
//     });
//     setIsKeyDirty(true);
//     setError('');
//     setIsModalOpen(true);
//   };

//   const validate = (
//     name: string,
//     variable_key: string,
//     placeholder: string,
//     ignoreId: number | null,
//   ): string => {
//     if (!name.trim()) return 'Please enter Name.';
//     if (!variable_key.trim()) return 'Please enter Variable Key.';
//     if (!/^[a-z0-9_]+$/.test(variable_key))
//       return 'Variable Key must contain only lowercase letters, numbers, and underscores.';
//     if (placeholder !== toPlaceholder(variable_key))
//       return `Placeholder must be ${toPlaceholder(variable_key)}`;

//     const list = variables[activeTabId] || [];
//     const dupKey = list.some(
//       (v) => v.variable_key.toLowerCase() === variable_key.toLowerCase() && v.id !== ignoreId,
//     );
//     if (dupKey) return `Variable Key '${variable_key}' already exists in this tab.`;
//     return '';
//   };

//   const addVariable = async () => {
//     const name = form.name.trim();
//     const key = isKeyDirty && form.variable_key ? form.variable_key : normalizeKey(name);
//     const placeholder = toPlaceholder(key);
//     const err = validate(name, key, placeholder, null);
//     if (err) {
//       setError(err);
//       toast.error(err);
//       return;
//     }

//     try {
//       const payload = {
//         name,
//         variable_key: key,
//         placeholder,
//         variable_tab_id: activeTabId,
//         category: activeTabId, // as requested: category stores tab id
//         status: form.status,
//       };
//       const res = await variableAPI.create(payload);
//       if (res?.success) {
//         toast.success('Variable added.');
//         await loadVariables(activeTabId);
//         resetForm();
//       } else {
//         toast.error('Failed to add variable.');
//       }
//     } catch (err: any) {
//       const msg = err?.message || 'Error adding variable';
//       setError(msg);
//       toast.error(msg);
//     }
//   };

//   const saveEdit = async () => {
//     if (!editingId) return;
//     const key = form.variable_key || normalizeKey(form.name);
//     const placeholder = toPlaceholder(key);
//     const err = validate(form.name, key, placeholder, editingId);
//     if (err) {
//       setError(err);
//       toast.error(err);
//       return;
//     }

//     try {
//       const payload = {
//         name: form.name,
//         variable_key: key,
//         placeholder,
//         status: form.status,
//       };
//       const res = await variableAPI.update(editingId, payload);
//       if (res?.success) {
//         toast.success('Variable updated.');
//         await loadVariables(activeTabId);
//         resetForm();
//       } else {
//         toast.error('Failed to update variable.');
//       }
//     } catch (err: any) {
//       const msg = err?.message || 'Error updating variable';
//       setError(msg);
//       toast.error(msg);
//     }
//   };

//   /** ----------------------- Row Actions ------------------------- **/
//   const remove = async (id: number) => {
//     if (!window.confirm('Delete this variable?')) return;
//     try {
//       const res = await variableAPI.delete(id);
//       if (res?.success) {
//         toast.success('Variable deleted.');
//         await loadVariables(activeTabId);
//       } else {
//         toast.error('Failed to delete variable.');
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to delete variable.');
//     }
//   };

//   const removeSelected = async () => {
//     if (!selectedIds.size) return;
//     if (!window.confirm(`Delete ${selectedIds.size} selected variable(s)?`)) return;
//     try {
//       const res = await variableAPI.bulkDelete(Array.from(selectedIds));
//       if (res?.success) {
//         toast.success(`${selectedIds.size} variable(s) deleted.`);
//         await loadVariables(activeTabId);
//         setSelectedIds(new Set());
//       } else {
//         toast.error('Failed to delete selected variables.');
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to delete selected variables.');
//     }
//   };

//   const updateSelectedStatus = async (status: Status) => {
//     if (!selectedIds.size) return;
//     try {
//       const res = await variableAPI.bulkUpdateStatus(Array.from(selectedIds), status);
//       if (res?.success) {
//         toast.success(
//           `Marked ${selectedIds.size} as ${status === 'active' ? 'Active' : 'Inactive'}.`,
//         );
//         await loadVariables(activeTabId);
//         setSelectedIds(new Set());
//       } else {
//         toast.error('Failed to update status.');
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to update status.');
//     }
//   };

//   /** -------------------- Selection Handlers --------------------- **/
//   const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.checked) setSelectedIds(new Set(filtered.map((v) => v.id)));
//     else setSelectedIds(new Set());
//   };

//   const handleSelectOne = (id: number) => {
//     setSelectedIds((prev) => {
//       const s = new Set(prev);
//       s.has(id) ? s.delete(id) : s.add(id);
//       return s;
//     });
//   };

//   /** -------------------- Export (CSV) ---------------------------- **/
//   const handleExport = () => {
//     const rows = variables[activeTabId] || [];
//     const header = [
//       'id',
//       'name',
//       'variable_key',
//       'placeholder',
//       'variable_tab_id',
//       'category',
//       'status',
//     ];
//     const csv = [
//       header.join(','),
//       ...rows.map((r) =>
//         [
//           r.id,
//           `"${r.name.replace(/"/g, '""')}"`,
//           r.variable_key,
//           r.placeholder,
//           r.variable_tab_id,
//           r.category,
//           r.status,
//         ].join(','),
//       ),
//     ].join('\n');

//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${activeTabId}-variables.csv`;
//     a.click();
//     URL.revokeObjectURL(url);

//     toast.success(`Exported ${rows.length} item(s).`);
//   };

//   /** -------------------- Import (CSV/XLSX) ---------------------- **/
//   const handleImportClick = () => {
//     setImportTabId(activeTabId);
//     setSkipDupOnImport(true);
//     setIsImportModalOpen(true);
//   };

//   const triggerFileChooser = () => fileInputRef.current?.click();

//   const handleImportSubmit = async () => {
//     const f = fileInputRef.current?.files?.[0];
//     if (!f) {
//       toast.error('Please select a file to import.');
//       return;
//     }
//     try {
//       const fd = new FormData();
//       fd.append('file', f);
//       fd.append('tabId', importTabId);
//       fd.append('skipDup', String(skipDupOnImport));

//       // If you have a helper api instance, you can expose this via variableAPI.importFile.
//       // Using fetch directly to keep this component self-contained:
//       const res = await fetch(`/variables/import?tabId=${encodeURIComponent(importTabId)}&skipDup=${skipDupOnImport ? '1' : '0'}`, {
//         method: 'POST',
//         body: fd,
//       });

//       const json = await res.json().catch(() => ({}));
//       if (res.ok && json?.success) {
//         toast.success(json?.message || 'Import completed.');
//         setIsImportModalOpen(false);
//         await loadVariables(importTabId);
//       } else {
//         toast.error(json?.message || 'Import failed.');
//       }
//     } catch (e: any) {
//       console.error(e);
//       toast.error(e?.message || 'Import failed.');
//     }
//   };

//   /** ----------------------------- UI ---------------------------- **/
//   return (
//     <div className="bg-slate-50 text-xs">
//       <div className="mx-auto max-w-7xl">
//         {/* Header */}
//         <header className="flex items-center justify-between gap-3 p-4 border-b bg-white shadow-sm">
//           <h1 className="text-lg font-semibold">
//             Variable Data Management
//             <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
//               Total: {totalCount}
//             </span>
//           </h1>
//         </header>

//         {/* Tabs */}
//         <div className="bg-white border-b">
//           <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-2">
//             {TABS.map((t) => (
//               <button
//                 key={t.id}
//                 onClick={() => setActiveTabId(t.id)}
//                 className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3 py-1 transition-colors ${
//                   activeTabId === t.id
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 <span>{t.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Toolbar */}
//         <div className="mt-4 flex items-center gap-3 p-4">
//           <div className="font-bold text-slate-900">{activeTabLabel}</div>
//           <div className="text-slate-500">{tabCounts.get(activeTabId) ?? 0} items</div>
//           <div className="ml-auto w-full max-w-md">
//             <input
//               className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//               placeholder={`Search in ${activeTabLabel}...`}
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               type="button"
//               className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
//               onClick={handleImportClick}
//             >
//               <Upload size={14} />
//               Import
//             </button>

//             <button
//               type="button"
//               className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-white hover:bg-orange-700"
//               onClick={handleExport}
//             >
//               <Download size={14} />
//               Export
//             </button>
//             <button
//               type="button"
//               className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
//               onClick={openAddModal}
//             >
//               <Plus size={14} />
//               Add Variable
//             </button>
//           </div>
//         </div>

//         {/* Table Card */}
//         <div className="mx-2 mt-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
//           {/* Selected items toolbar */}
//           {selectedIds.size > 0 && (
//             <div className="flex items-center justify-between rounded-t-xl border-b border-blue-200 bg-blue-50 px-4 py-2">
//               <div className="font-semibold text-blue-800">{selectedIds.size} selected</div>
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={() => updateSelectedStatus('active')}
//                   className="inline-flex items-center gap-1 font-medium text-green-600 hover:text-green-800"
//                 >
//                   <CheckCircle2 size={12} />
//                   Mark as Active
//                 </button>
//                 <button
//                   onClick={() => updateSelectedStatus('inactive')}
//                   className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-800"
//                 >
//                   <XCircle size={12} />
//                   Mark as Inactive
//                 </button>
//                 <button
//                   onClick={removeSelected}
//                   className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-800"
//                 >
//                   <Trash2 size={12} />
//                   Delete Selected
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="overflow-x-auto overflow-y-auto max-h-[470px]">
//             <table className="w-full text-left">
//               <thead className="bg-slate-50 uppercase text-slate-600 sticky top-0 z-10">
//                 <tr>
//                   <th className="w-4 p-3">
//                     <input
//                       type="checkbox"
//                       ref={headerCheckboxRef}
//                       onChange={handleSelectAll}
//                       className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-blue-600 focus:ring-blue-500"
//                     />
//                   </th>
//                   <th className="px-6 py-3">Name</th>
//                   <th className="px-6 py-3">Key</th>
//                   <th className="px-6 py-3">Placeholder</th>
//                   <th className="px-6 py-3">Status</th>
//                   <th className="px-6 py-3 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan={6} className="p-0">
//                       <TableLoader colSpan={6} />
//                     </td>
//                   </tr>
//                 ) : filtered.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="py-16 text-center text-slate-500">
//                       <p className="font-semibold">No variables found.</p>
//                       <p className="mt-1">Try another search or click “Add Variable”.</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((v) => (
//                     <tr
//                       key={v.id}
//                       className={`border-b ${
//                         selectedIds.has(v.id) ? 'bg-blue-50' : 'bg-white'
//                       } hover:bg-slate-50`}
//                     >
//                       <td className="w-4 p-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedIds.has(v.id)}
//                           onChange={() => handleSelectOne(v.id)}
//                           className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-blue-600 focus:ring-blue-500"
//                         />
//                       </td>
//                       <td className="px-6 py-3 font-medium text-slate-900">{v.name}</td>
//                       <td className="px-6 py-3 font-mono text-slate-800">{v.variable_key}</td>
//                       <td className="px-6 py-3 font-mono text-blue-700">{v.placeholder}</td>
//                       <td className="px-6 py-3">
//                         <span
//                           className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${
//                             v.status === 'active'
//                               ? 'bg-green-100 text-green-800'
//                               : 'bg-slate-100 text-slate-600'
//                           }`}
//                         >
//                           {v.status === 'active' ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-3 text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => startEdit(v)}
//                             className="rounded-md p-2 text-blue-600 hover:bg-blue-100"
//                             title="Edit"
//                           >
//                             <Edit2 size={14} />
//                           </button>
//                           <button
//                             onClick={() => remove(v.id)}
//                             className="rounded-md p-2 text-red-600 hover:bg-red-100"
//                             title="Delete"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Add / Edit Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={resetForm}
//         title={
//           editingId ? `Edit Variable — ${activeTabLabel}` : `Add New Variable — ${activeTabLabel}`
//         }
//       >
//         <div>
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//             <div>
//               <label className="mb-1 block font-medium text-slate-700">Name</label>
//               <input
//                 type="text"
//                 value={form.name}
//                 onChange={(e) => {
//                   const name = e.target.value;
//                   const autoKey = normalizeKey(name);
//                   setForm((f) => ({
//                     ...f,
//                     name,
//                     variable_key: isKeyDirty ? f.variable_key : autoKey,
//                     placeholder: isKeyDirty ? toPlaceholder(f.variable_key) : toPlaceholder(autoKey),
//                   }));
//                   setError('');
//                 }}
//                 placeholder={`e.g., ${activeTabUX.display}`}
//                 className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block font-medium text-slate-700">Variable Key</label>
//               <input
//                 type="text"
//                 value={form.variable_key}
//                 onChange={(e) => {
//                   setIsKeyDirty(true);
//                   const key = normalizeKey(e.target.value);
//                   setForm((f) => ({
//                     ...f,
//                     variable_key: key,
//                     placeholder: toPlaceholder(key),
//                   }));
//                   setError('');
//                 }}
//                 placeholder={activeTabUX.key}
//                 className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//               />
//             </div>
//           </div>

//           <div className="mt-3">
//             <label className="mb-1 block font-medium text-slate-700">Placeholder</label>
//             <input
//               type="text"
//               value={form.placeholder}
//               onChange={(e) => {
//                 // keep in sync but allow user to type; we'll validate exact match on save
//                 setForm((f) => ({ ...f, placeholder: e.target.value.trim() }));
//                 setError('');
//               }}
//               placeholder={toPlaceholder(activeTabUX.key)}
//               className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//             />
//             <p className="mt-1 text-[11px] text-slate-500">
//               Must match <span className="font-mono">{"{{" + (form.variable_key || activeTabUX.key) + "}}"}</span>
//             </p>
//           </div>

//           <div className="mt-3">
//             <label className="mb-1 block font-medium text-slate-700">Status</label>
//             <select
//               value={form.status}
//               onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
//               className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//             >
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>

//           {error && <div className="mt-3 font-medium text-red-600">{error}</div>}
//         </div>

//         <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
//           <button
//             onClick={resetForm}
//             className="rounded-md bg-white px-3 py-2 font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={editingId ? saveEdit : addVariable}
//             className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
//           >
//             {editingId ? <Check size={14} /> : <Plus size={14} />}
//             {editingId ? 'Update Variable' : 'Add Variable'}
//           </button>
//         </div>
//       </Modal>

//       {/* Import Modal */}
//       <Modal
//         isOpen={isImportModalOpen}
//         onClose={() => setIsImportModalOpen(false)}
//         title={`Import ${tabsById.get(importTabId)?.label || 'Variables'}`}
//       >
//         <div className="space-y-4">
//           {/* Download Template */}
//           <button
//             onClick={() =>
//               downloadTemplateCSV(
//                 importTabId,
//                 tabsById.get(importTabId)?.label || 'Variables',
//               )
//             }
//             className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
//           >
//             <Download size={14} />
//             Download Template
//           </button>

//           {/* Import options */}
//           <div className="flex items-center gap-2">
//             <input
//               id="skipDup"
//               type="checkbox"
//               checked={skipDupOnImport}
//               onChange={(e) => setSkipDupOnImport(e.target.checked)}
//               className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//             />
//             <label htmlFor="skipDup" className="text-sm text-slate-700">
//               Skip duplicates (by <span className="font-mono">variable_key</span>)
//             </label>
//           </div>

//           {/* File Input */}
//           <div>
//             <label className="mb-1 block text-sm font-medium text-slate-700">
//               Select File (CSV or Excel)
//             </label>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".csv,.xlsx,.xls"
//               className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//             />
//             <p className="mt-1 text-xs text-slate-500">
//               Supported columns: <span className="font-mono">name, variable_key, placeholder, variable_tab_id, category, status</span>
//             </p>
//           </div>

//           {/* Footer */}
//           <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
//             <button
//               onClick={() => setIsImportModalOpen(false)}
//               className="rounded-md bg-white px-3 py-2 font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleImportSubmit}
//               className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
//             >
//               <Upload size={14} />
//               Import
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default VariableCenter;



import React, { FC, useMemo, useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { variableAPI } from '@/lib/variableAPI';
import { toast } from 'react-toastify';
import TableLoader from '@/components/ui/TableLoader';
import Swal from 'sweetalert2';

/** ----------------------------- Types ----------------------------- **/
type Status = 'active' | 'inactive';

interface Variable {
  id: number;
  name: string;
  variable_key: string;        // <- system key (buyer_name)
  placeholder: string;         // <- token ({{buyer_name}})
  variable_tab_id: string;     // <- buyer/seller/property
  category: string;            // <- will store tab id (same as variable_tab_id)
  status: Status;
}

type VariablesState = Record<string, Variable[]>;

interface Tab {
  id: string;
  label: string;
}

/** --------------------------- Constants --------------------------- **/
const TABS: Tab[] = [
  { id: 'buyer', label: 'Buyer Variables' },
  { id: 'seller', label: 'Seller Variables' },
  { id: 'property', label: 'Property Variables' },
  { id: 'leads', label: 'Leads Variables' },
  { id: 'account', label: 'Account Variables' },
  { id: 'company', label: 'Company Variables' },
  { id: 'common', label: 'Common Variables' },
];

const normalizeKey = (s: string = '') =>
  s
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

const toPlaceholder = (key: string = '') => (key ? `{{${key}}}` : '');

/** Dynamic tab placeholders for UX hints only */
const TAB_PLACEHOLDERS: Record<string, { display: string; key: string }> = {
  buyer: { display: 'Buyer Name', key: 'buyer_name' },
  seller: { display: 'Seller Name', key: 'seller_name' },
  property: { display: 'Property Title', key: 'property_title' },
  leads: { display: 'Lead Name', key: 'lead_name' },
  account: { display: 'Account Name', key: 'account_name' },
  company: { display: 'Company Name', key: 'company_name' },
  common: { display: 'Common Variable', key: 'common_variable' },
};

/** -------------------------- Component --------------------------- **/
const VariableCenter: FC = () => {
  const [variables, setVariables] = useState<VariablesState>({});
  const [activeTabId, setActiveTabId] = useState<string>(TABS[0].id);
  const [query, setQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{
    name: string;
    variable_key: string;
    placeholder: string;
    status: Status;
  }>({
    name: '',
    variable_key: '',
    placeholder: '',
    status: 'active',
  });
  const [isKeyDirty, setIsKeyDirty] = useState(false);
  const [error, setError] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTabId, setImportTabId] = useState<string>(activeTabId);
  const [skipDupOnImport, setSkipDupOnImport] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabsById = useMemo(() => {
    const m = new Map<string, Tab>();
    TABS.forEach((t) => m.set(t.id, t));
    return m;
  }, []);

  const activeTabLabel = tabsById.get(activeTabId)?.label ?? 'Variables';
  const activeTabUX = TAB_PLACEHOLDERS[activeTabId] || {
    display: 'Variable Name',
    key: 'variable_name',
  };

  /** ------------------------ CSV Template ------------------------ **/
  const buildVariableCsvTemplate = (tabId: string) => {
    const header = [
      'name',
      'variable_key',
      'placeholder',
      'variable_tab_id',
      'category',
      'status',
    ];

    const samples: Record<
      string,
      [string, string, string, string, string, 'active' | 'inactive'][]
    > = {
      buyer: [[ 'Buyer Name', 'buyer_name', '{{buyer_name}}', 'buyer', 'buyer', 'active' ]],
      seller: [[ 'Seller Name', 'seller_name', '{{seller_name}}', 'seller', 'seller', 'active' ]],
      property: [[ 'Property Title', 'property_title', '{{property_title}}', 'property', 'property', 'active' ]],
      leads: [[ 'Lead Name', 'lead_name', '{{lead_name}}', 'leads', 'leads', 'active' ]],
      account: [
        [ 'Account Name', 'account_name', '{{account_name}}', 'account', 'account', 'active' ],
        [ 'Account Number', 'account_number', '{{account_number}}', 'account', 'account', 'inactive' ],
      ],
      company: [[ 'Company Name', 'company_name', '{{company_name}}', 'company', 'company', 'active' ]],
      common: [[ 'Common Variable', 'common_variable', '{{common_variable}}', 'common', 'common', 'active' ]],
    };

    const sampleRows =
      samples[tabId] ||
      [[ 'Sample Name', 'sample_key', '{{sample_key}}', tabId, tabId, 'active' ]];

    const rows = [header, ...sampleRows]
      .map((cols) =>
        cols.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');

    return new Blob([rows], { type: 'text/csv;charset=utf-8;' });
  };

  const downloadTemplateCSV = (tabId: string, tabLabel: string) => {
    const blob = buildVariableCsvTemplate(tabId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Import_Template_${(tabLabel || 'Variables').replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** ----------------------- Data Loading ------------------------ **/
  const loadVariables = async (tabId: string) => {
    try {
      setLoading(true);
      const res = await variableAPI.getByTab(tabId);
      if (res?.success) {
        setVariables((prev) => ({ ...prev, [tabId]: res.data || [] }));
      } else {
        toast.error('Failed to fetch variables.');
      }
    } catch (err) {
      console.error('Error fetching variables:', err);
      toast.error('Failed to fetch variables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVariables(activeTabId);
    setSelectedIds(new Set());
  }, [activeTabId]);

  /** ---------------------- Derived Values ----------------------- **/
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = variables[activeTabId] || [];
    if (!q) return list;
    return list.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.variable_key.toLowerCase().includes(q) ||
        v.placeholder.toLowerCase().includes(q),
    );
  }, [variables, activeTabId, query]);

  const totalCount = useMemo(
    () => Object.values(variables).reduce((sum, list) => sum + (list?.length || 0), 0),
    [variables],
  );

  const tabCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of TABS) m.set(t.id, variables[t.id]?.length ?? 0);
    return m;
  }, [variables]);

  /** ------------------------- Form Logic ------------------------ **/
  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', variable_key: '', placeholder: '', status: 'active' });
    setIsKeyDirty(false);
    setError('');
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      variable_key: '',
      placeholder: '',
      status: 'active',
    });
    setIsKeyDirty(false);
    setError('');
    setIsModalOpen(true);
  };

  const startEdit = (item: Variable) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      variable_key: item.variable_key,
      placeholder: item.placeholder,
      status: item.status,
    });
    setIsKeyDirty(true);
    setError('');
    setIsModalOpen(true);
  };

  const validate = (
    name: string,
    variable_key: string,
    placeholder: string,
    ignoreId: number | null,
  ): string => {
    if (!name.trim()) return 'Please enter Name.';
    if (!variable_key.trim()) return 'Please enter Variable Key.';
    if (!/^[a-z0-9_]+$/.test(variable_key))
      return 'Variable Key must contain only lowercase letters, numbers, and underscores.';
    if (placeholder !== toPlaceholder(variable_key))
      return `Placeholder must be ${toPlaceholder(variable_key)}`;

    const list = variables[activeTabId] || [];
    const dupKey = list.some(
      (v) => v.variable_key.toLowerCase() === variable_key.toLowerCase() && v.id !== ignoreId,
    );
    if (dupKey) return `Variable Key '${variable_key}' already exists in this tab.`;
    return '';
  };

  const addVariable = async () => {
    const name = form.name.trim();
    const key = isKeyDirty && form.variable_key ? form.variable_key : normalizeKey(name);
    const placeholder = toPlaceholder(key);
    const err = validate(name, key, placeholder, null);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }

    try {
      const payload = {
        name,
        variable_key: key,
        placeholder,
        variable_tab_id: activeTabId,
        category: activeTabId,
        status: form.status,
      };
      const res = await variableAPI.create(payload);
      if (res?.success) {
        toast.success('Variable added.');
        await loadVariables(activeTabId);
        resetForm();
      } else {
        toast.error('Failed to add variable.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Error adding variable';
      setError(msg);
      toast.error(msg);
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const key = form.variable_key || normalizeKey(form.name);
    const placeholder = toPlaceholder(key);
    const err = validate(form.name, key, placeholder, editingId);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }

    try {
      const payload = {
        name: form.name,
        variable_key: key,
        placeholder,
        status: form.status,
      };
      const res = await variableAPI.update(editingId, payload);
      if (res?.success) {
        toast.success('Variable updated.');
        await loadVariables(activeTabId);
        resetForm();
      } else {
        toast.error('Failed to update variable.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Error updating variable';
      setError(msg);
      toast.error(msg);
    }
  };

  /** ----------------------- Row Actions ------------------------- **/
  const remove = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this variable. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(15, 43, 61, 0.45)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;

    try {
      const res = await variableAPI.delete(id);
      if (res?.success) {
        toast.success('Variable deleted.');
        await loadVariables(activeTabId);
      } else {
        toast.error('Failed to delete variable.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete variable.');
    }
  };

  const removeSelected = async () => {
    if (!selectedIds.size) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedIds.size} selected variable(s). This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(15, 43, 61, 0.45)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;

    try {
      const res = await variableAPI.bulkDelete(Array.from(selectedIds));
      if (res?.success) {
        toast.success(`${selectedIds.size} variable(s) deleted.`);
        await loadVariables(activeTabId);
        setSelectedIds(new Set());
      } else {
        toast.error('Failed to delete selected variables.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete selected variables.');
    }
  };

  const updateSelectedStatus = async (status: Status) => {
    if (!selectedIds.size) return;
    try {
      const res = await variableAPI.bulkUpdateStatus(Array.from(selectedIds), status);
      if (res?.success) {
        toast.success(
          `Marked ${selectedIds.size} as ${status === 'active' ? 'Active' : 'Inactive'}.`,
        );
        await loadVariables(activeTabId);
        setSelectedIds(new Set());
      } else {
        toast.error('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  };

  /** -------------------- Selection Handlers --------------------- **/
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(filtered.map((v) => v.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  /** -------------------- Export (CSV) ---------------------------- **/
  const handleExport = () => {
    const rows = variables[activeTabId] || [];
    const header = [
      'id',
      'name',
      'variable_key',
      'placeholder',
      'variable_tab_id',
      'category',
      'status',
    ];
    const csv = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.id,
          `"${r.name.replace(/"/g, '""')}"`,
          r.variable_key,
          r.placeholder,
          r.variable_tab_id,
          r.category,
          r.status,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTabId}-variables.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${rows.length} item(s).`);
  };

  /** -------------------- Import (CSV/XLSX) ---------------------- **/
  const handleImportClick = () => {
    setImportTabId(activeTabId);
    setSkipDupOnImport(true);
    setIsImportModalOpen(true);
  };

  const triggerFileChooser = () => fileInputRef.current?.click();

  const handleImportSubmit = async () => {
    const f = fileInputRef.current?.files?.[0];
    if (!f) {
      toast.error('Please select a file to import.');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('tabId', importTabId);
      fd.append('skipDup', String(skipDupOnImport));

      const res = await fetch(`/variables/import?tabId=${encodeURIComponent(importTabId)}&skipDup=${skipDupOnImport ? '1' : '0'}`, {
        method: 'POST',
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        toast.success(json?.message || 'Import completed.');
        setIsImportModalOpen(false);
        await loadVariables(importTabId);
      } else {
        toast.error(json?.message || 'Import failed.');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Import failed.');
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeTabId]);

  /** ----------------------------- UI ---------------------------- **/
  return (
    <div className="bg-slate-50 ">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            Variable Data Management
            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
              Total: {totalCount}
            </span>
          </h1>
        </div>

        {/* Tabs - Horizontal Scroll */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <div className="overflow-x-auto scrollbar-custom px-2 py-2">
            <div className="flex gap-1.5 min-w-max">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTabId(t.id)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTabId === t.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`ml-1.5 text-[10px] ${activeTabId === t.id ? 'text-white/80' : 'text-gray-500'}`}>
                    ({tabCounts.get(t.id) ?? 0})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm text-gray-900">{activeTabLabel}</div>
            <div className="text-xs text-gray-500">{tabCounts.get(activeTabId) ?? 0} items</div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:max-w-md">
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder={`Search in ${activeTabLabel}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
         <div className="flex flex-wrap gap-1.5 sm:gap-2">
  
  <button
    type="button"
    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
    onClick={handleImportClick}
  >
    <Upload size={12} />
    <span>Import</span>
  </button>

  <button
    type="button"
    className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-white hover:bg-orange-700 transition-colors whitespace-nowrap"
    onClick={handleExport}
  >
    <Download size={12} />
    <span>Export</span>
  </button>

  <button
    type="button"
    className="inline-flex items-center gap-1 rounded-md bg-[#0f2b3d] px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
    onClick={openAddModal}
  >
    <Plus size={12} />
    <span>Add Variable</span>
  </button>

</div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Selected items toolbar */}
          {selectedIds.size > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-orange-50 border-b border-orange-200 px-3 py-2">
              <div className="font-semibold text-xs text-orange-800">{selectedIds.size} selected</div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => updateSelectedStatus('active')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-800"
                >
                  <CheckCircle2 size={11} />
                  Mark Active
                </button>
                <button
                  onClick={() => updateSelectedStatus('inactive')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                >
                  <XCircle size={11} />
                  Mark Inactive
                </button>
                <button
                  onClick={removeSelected}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800"
                >
                  <Trash2 size={11} />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Table with dynamic height */}
          <div
            className="overflow-y-auto overflow-x-auto scrollbar-custom-vertical"
            style={{
              maxHeight: selectedIds.size > 0 ? 'calc(100vh - 380px)' : 'calc(100vh - 280px)',
            }}
          >
            <table className="w-full text-left" style={{ minWidth: '700px' }}>
              <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="w-8 px-3 py-2">
                    <input
                      type="checkbox"
                      ref={headerCheckboxRef}
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={handleSelectAll}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">Key</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">Placeholder</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <TableLoader colSpan={6} />
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <p className="text-sm font-medium">No variables found.</p>
                      <p className="text-xs mt-1">Try another search or click "Add Variable".</p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((v) => (
                    <tr
                      key={v.id}
                      className={`${selectedIds.has(v.id) ? 'bg-orange-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                    >
                      <td className="w-8 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(v.id)}
                          onChange={() => handleSelectOne(v.id)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs font-medium text-gray-900">{v.name}</div>
                      </td>
                      <td className="px-3 py-2">
                        <code className="text-[10px] font-mono text-gray-700 bg-gray-100 px-1 py-0.5 rounded">{v.variable_key}</code>
                      </td>
                      <td className="px-3 py-2">
                        <code className="text-[10px] font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">{v.placeholder}</code>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            v.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {v.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(v)}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => remove(v.id)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-white">
              
              {/* MOBILE */}
              <div className="flex flex-col gap-2 sm:hidden">
                <div className="text-[10px] text-gray-500 text-center">
                  Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filtered.length)} of {filtered.length}
                </div>
                <div className="flex items-center justify-between gap-2">
                  {selectedIds.size === 0 && (
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value, 10));
                        setCurrentPage(1);
                      }}
                      className="min-w-[70px] px-2 py-1 text-[10px] border border-gray-200 rounded bg-white"
                    >
                      {[50, 100, 200, 500, 700].map(n => <option key={n} value={n}>{n}</option>)}
                      <option value={999999}>All</option>
                    </select>
                  )}
                  <div className="flex-1 overflow-x-auto scrollbar-hide">
                    <div className="flex justify-end min-w-max">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-1 rounded border border-gray-300 disabled:opacity-50"
                        >
                          <ChevronLeft size={12} />
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-2 py-0.5 rounded text-[10px] ${currentPage === page ? "bg-orange-500 text-white" : "border border-gray-300"}`}
                              >
                                {page}
                              </button>
                            );
                          })}
                          {totalPages > 3 && <span className="text-[9px]">...</span>}
                          {totalPages > 3 && (
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-2 py-0.5 rounded text-[10px] border border-gray-300"
                            >
                              {totalPages}
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-1 rounded border border-gray-300 disabled:opacity-50"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESKTOP */}
              <div className="hidden sm:flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-gray-500 whitespace-nowrap">
                    Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filtered.length)} of {filtered.length} variables
                  </div>
                  {selectedIds.size === 0 && (
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value, 10));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 text-[11px] border border-gray-200 rounded bg-white"
                    >
                      {[50, 100, 200, 500, 700].map(n => <option key={n} value={n}>{n} / page</option>)}
                      <option value={999999}>All</option>
                    </select>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-gray-300 disabled:opacity-50"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 py-1 rounded text-[11px] ${currentPage === page ? "bg-orange-500 text-white" : "border border-gray-300"}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span className="text-xs">...</span>}
                    {totalPages > 5 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-2 py-1 rounded text-[11px] border border-gray-300"
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-gray-300 disabled:opacity-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
    {/* Add / Edit Modal - Custom Design */}
{isModalOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
    style={{ background: "rgba(15,27,40,0.65)", backdropFilter: "blur(4px)" }}
    onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
  >
    <div
      className="relative w-full flex flex-col overflow-hidden"
      style={{
        maxWidth: 600, maxHeight: "95vh",
        background: "#fff", borderRadius: 16,
        boxShadow: "0 16px 60px rgba(0,0,0,0.18)",
        border: "1px solid #e4e7eb",
      }}
    >
      {/* ── Custom Header ── */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, #1a2b3c 0%, #2d3f52 100%)` }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(230,118,29,0.18)" }}
        >
          {editingId ? <Edit2 size={18} color="#E6761D" /> : <Plus size={18} color="#E6761D" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-[14px] leading-tight">
            {editingId ? `Edit Variable` : `Add New Variable`}
          </div>
          <div className="text-white/60 text-[11px] mt-0.5">
            {activeTabLabel}
          </div>
        </div>
        <button
          onClick={resetForm}
          className="flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <X size={15} color="#fff" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin" }}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const autoKey = normalizeKey(name);
                  setForm((f) => ({
                    ...f,
                    name,
                    variable_key: isKeyDirty ? f.variable_key : autoKey,
                    placeholder: isKeyDirty ? toPlaceholder(f.variable_key) : toPlaceholder(autoKey),
                  }));
                  setError('');
                }}
                placeholder={`e.g., ${activeTabUX.display}`}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Variable Key *</label>
              <input
                type="text"
                value={form.variable_key}
                onChange={(e) => {
                  setIsKeyDirty(true);
                  const key = normalizeKey(e.target.value);
                  setForm((f) => ({
                    ...f,
                    variable_key: key,
                    placeholder: toPlaceholder(key),
                  }));
                  setError('');
                }}
                placeholder={activeTabUX.key}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-[13px] text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Placeholder</label>
            <input
              type="text"
              value={form.placeholder}
              onChange={(e) => {
                setForm((f) => ({ ...f, placeholder: e.target.value.trim() }));
                setError('');
              }}
              placeholder={toPlaceholder(activeTabUX.key)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-[13px] text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
            />
            <p className="mt-1 text-[10px] text-gray-500">
              Must match <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{"{{" + (form.variable_key || activeTabUX.key) + "}}"}</code>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {error && <div className="text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid #e4e7eb", background: "#f8f9fa" }}
      >
        <button
          onClick={resetForm}
          className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors"
          style={{ borderColor: "#e4e7eb", color: "#1a1f2e", background: "transparent" }}
        >
          Cancel
        </button>
        <button
          onClick={editingId ? saveEdit : addVariable}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-orange-700 transition-colors"
        >
          {editingId ? <Check size={13} /> : <Plus size={13} />}
          {editingId ? 'Update Variable' : 'Add Variable'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Import Modal */}
     {/* Import Modal - Custom Design */}
{isImportModalOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
    style={{ background: "rgba(15,27,40,0.65)", backdropFilter: "blur(4px)" }}
    onClick={(e) => { if (e.target === e.currentTarget) setIsImportModalOpen(false); }}
  >
    <div
      className="relative w-full flex flex-col overflow-hidden"
      style={{
        maxWidth: 520, maxHeight: "95vh",
        background: "#fff", borderRadius: 16,
        boxShadow: "0 16px 60px rgba(0,0,0,0.18)",
        border: "1px solid #e4e7eb",
      }}
    >
      {/* ── Custom Header ── */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, #1a2b3c 0%, #2d3f52 100%)` }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(230,118,29,0.18)" }}
        >
          <Upload size={18} color="#E6761D" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-[14px] leading-tight">
            Import {tabsById.get(importTabId)?.label || 'Variables'}
          </div>
          <div className="text-white/60 text-[11px] mt-0.5">
            Bulk upload variables via CSV or Excel
          </div>
        </div>
        <button
          onClick={() => setIsImportModalOpen(false)}
          className="flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <X size={15} color="#fff" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin" }}>
        <div className="space-y-4">
          {/* Download Template Button */}
          <button
            onClick={() =>
              downloadTemplateCSV(
                importTabId,
                tabsById.get(importTabId)?.label || 'Variables',
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors w-full justify-center"
          >
            <Download size={14} />
            Download Template CSV
          </button>

          {/* Skip Duplicates Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="skipDup"
              type="checkbox"
              checked={skipDupOnImport}
              onChange={(e) => setSkipDupOnImport(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="skipDup" className="text-xs text-gray-700">
              Skip duplicates (by <code className="font-mono text-[11px] bg-gray-100 px-1 py-0.5 rounded">variable_key</code>)
            </label>
          </div>

          {/* File Input */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select File (CSV or Excel)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
            />
            <p className="mt-2 text-[11px] text-gray-500">
              Supported columns: <code className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded">name, variable_key, placeholder, variable_tab_id, category, status</code>
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid #e4e7eb", background: "#f8f9fa" }}
      >
        <button
          onClick={() => setIsImportModalOpen(false)}
          className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors"
          style={{ borderColor: "#e4e7eb", color: "#1a1f2e", background: "transparent" }}
        >
          Cancel
        </button>
        <button
          onClick={handleImportSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-orange-700 transition-colors"
        >
          <Upload size={13} />
          Import
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default VariableCenter;