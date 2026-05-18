// import React, { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
// import Button from '@/components/ui/Button';
// import Input from '@/components/ui/Input';
// import { Label } from '@/components/ui/Label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
// import { Progress } from '@/components/ui/Progress';
// import { Badge } from '@/components/ui/Badge';
// import { Upload, Download, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// const ImportExportPage: React.FC = () => {
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);

//   const recentImports = [
//     {
//       id: 1,
//       filename: 'leads_2025_q1.csv',
//       type: 'Leads',
//       status: 'completed',
//       records: 1250,
//       date: '2025-01-15 14:30',
//       errors: 0,
//     },
//     {
//       id: 2,
//       filename: 'properties_update.xlsx',
//       type: 'Properties',
//       status: 'completed',
//       records: 890,
//       date: '2025-01-14 09:45',
//       errors: 3,
//     },
//     {
//       id: 3,
//       filename: 'contacts_import.csv',
//       type: 'Contacts',
//       status: 'processing',
//       records: 456,
//       date: '2025-01-15 16:20',
//       errors: 0,
//     },
//     {
//       id: 4,
//       filename: 'user_data.json',
//       type: 'Users',
//       status: 'failed',
//       records: 0,
//       date: '2025-01-13 11:15',
//       errors: 15,
//     },
//   ];

//   const exportTemplates = [
//     { id: 1, name: 'Leads Export', description: 'All lead data with contact information', type: 'leads' },
//     { id: 2, name: 'Properties Export', description: 'Property listings with full details', type: 'properties' },
//     { id: 3, name: 'Users Export', description: 'User accounts and role information', type: 'users' },
//     { id: 4, name: 'Activities Export', description: 'Activity logs and interaction history', type: 'activities' },
//   ];

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setIsUploading(true);
//       setUploadProgress(0);
      
//       // Simulate upload progress
//       const interval = setInterval(() => {
//         setUploadProgress((prev) => {
//           if (prev >= 100) {
//             clearInterval(interval);
//             setIsUploading(false);
//             return 100;
//           }
//           return prev + 10;
//         });
//       }, 200);
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
//       case 'processing':
//         return <Clock className="h-4 w-4 text-blue-500 shrink-0" />;
//       case 'failed':
//         return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
//       default:
//         return <FileText className="h-4 w-4 text-gray-500 shrink-0" />;
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, any> = {
//       completed: 'default',
//       processing: 'secondary',
//       failed: 'destructive',
//     };
//     return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
//   };

//   return (
//     <div className="space-y-6 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
//       <div>
//         <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Import & Export</h1>
//         <p className="text-sm sm:text-base text-muted-foreground">
//           Import data from external sources or export your data for backup and analysis
//         </p>
//       </div>

//       <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
//         {/* Import Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
//               <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
//               Import Data
//             </CardTitle>
//             <CardDescription>
//               Upload CSV, Excel, or JSON files to import data into the system
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="import-type">Data Type</Label>
//               <Select>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Select data type to import" />
//                 </SelectTrigger>
//                 <SelectContent >
//                   <SelectItem value="leads">Leads</SelectItem>
//                   <SelectItem value="properties">Properties</SelectItem>
//                   <SelectItem value="contacts">Contacts</SelectItem>
//                   <SelectItem value="users">Users</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="file-upload">Choose File</Label>
//               <Input
//                 id="file-upload"
//                 type="file"
//                 accept=".csv,.xlsx,.xls,.json"
//                 onChange={handleFileUpload}
//                 disabled={isUploading}
//                 className="w-full"
//               />
//               <p className="text-xs text-muted-foreground">
//                 Supported formats: CSV, Excel (.xlsx, .xls), JSON
//               </p>
//             </div>

//             {isUploading && (
//               <div className="space-y-2">
//                 <div className="flex justify-between text-xs sm:text-sm">
//                   <span>Uploading...</span>
//                   <span>{uploadProgress}%</span>
//                 </div>
//                 <Progress value={uploadProgress} className="w-full" />
//               </div>
//             )}

//             <div className="flex flex-wrap gap-2">
//               <Button disabled={isUploading} className="w-full sm:w-auto">
//                 <Upload className="mr-2 h-4 w-4" />
//                 Import Data
//               </Button>
//               <Button variant="outline" className="w-full sm:w-auto">
//                 <FileText className="mr-2 h-4 w-4" />
//                 Download Template
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Export Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
//               <Download className="h-5 w-5 sm:h-6 sm:w-6" />
//               Export Data
//             </CardTitle>
//             <CardDescription>
//               Export your data in various formats for backup or external analysis
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-3">
//               {exportTemplates.map((template) => (
//                 <div key={template.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
//                   <div className="min-w-0">
//                     <p className="font-medium text-sm sm:text-base truncate">{template.name}</p>
//                     <p className="text-xs sm:text-sm text-muted-foreground">{template.description}</p>
//                   </div>
//                   <Button variant="outline" size="sm" className="w-full sm:w-auto">
//                     <Download className="mr-2 h-3 w-3" />
//                     Export
//                   </Button>
//                 </div>
//               ))}
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="export-format">Export Format</Label>
//               <Select>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Select export format" />
//                 </SelectTrigger>
//                 <SelectContent >
//                   <SelectItem value="csv">CSV</SelectItem>
//                   <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
//                   <SelectItem value="json">JSON</SelectItem>
//                   <SelectItem value="pdf">PDF Report</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Imports */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg sm:text-xl">Recent Imports</CardTitle>
//           <CardDescription>
//             History of recent data import operations
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             {recentImports.map((importItem) => (
//               <div key={importItem.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
//                 <div className="flex items-start sm:items-center gap-3 min-w-0">
//                   {getStatusIcon(importItem.status)}
//                   <div className="min-w-0">
//                     <p className="font-medium text-sm sm:text-base break-words sm:truncate">
//                       {importItem.filename}
//                     </p>
//                     <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
//                       <span className="whitespace-nowrap">{importItem.type}</span>
//                       <span className="hidden sm:inline">•</span>
//                       <span className="whitespace-nowrap">{importItem.records} records</span>
//                       <span className="hidden sm:inline">•</span>
//                       <span className="whitespace-nowrap">{importItem.date}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex flex-wrap items-center gap-2">
//                   {importItem.errors > 0 && (
//                     <Badge variant="destructive">{importItem.errors} errors</Badge>
//                   )}
//                   {getStatusBadge(importItem.status)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ImportExportPage;



// // src/pages/settings/ImportExportPage.tsx
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Upload, Download, FileText, AlertCircle, CheckCircle,
//   Clock, RefreshCw, Trash2, X, ChevronLeft, ChevronRight,
//   BarChart3, Users, Building, UserCheck, UserX, TrendingUp,
// } from "lucide-react";
// import { backupAPI, BackupEntity, ExportFormat, BackupRecord, BackupStats } from "@/lib/backupAPI";
// import { toast } from "@/hooks/useToast";

// /* ── theme ───────────────────────────────────────────────────── */
// const NAVY       = "#0c3854";
// const ORANGE     = "#e87722";
// const LIGHT      = "#f0f4f8";
// const BORDER     = "#dce5ee";
// const MUTED      = "#7a95a8";

// /* ── entity config ───────────────────────────────────────────── */
// const ENTITIES: { value: BackupEntity; label: string; icon: React.ReactNode; color: string }[] = [
//   { value: "leads",      label: "Leads",      icon: <BarChart3 className="h-4 w-4" />, color: ORANGE    },
//   { value: "buyers",     label: "Buyers",     icon: <UserCheck className="h-4 w-4" />, color: "#16a34a" },
//   { value: "sellers",    label: "Sellers",    icon: <UserX     className="h-4 w-4" />, color: "#dc2626" },
//   { value: "properties", label: "Properties", icon: <Building  className="h-4 w-4" />, color: "#0891b2" },
//   { value: "users",      label: "Users",      icon: <Users     className="h-4 w-4" />, color: "#7c3aed" },
// ];

// const FORMATS: { value: ExportFormat; label: string; desc: string }[] = [
//   { value: "csv",  label: "CSV",   desc: "Spreadsheet compatible" },
//   { value: "xlsx", label: "Excel", desc: "With formatting"        },
//   { value: "json", label: "JSON",  desc: "Developer friendly"     },
//   { value: "pdf",  label: "PDF",   desc: "Print ready report"     },
// ];

// /* ── helpers ─────────────────────────────────────────────────── */
// const fmtBytes = (b?: number | null) => {
//   if (!b) return "—";
//   if (b < 1024) return `${b} B`;
//   if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
//   return `${(b / (1024 * 1024)).toFixed(1)} MB`;
// };
// const fmtDate = (d?: string | null) =>
//   d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

// const statusStyle = (s: string) => {
//   if (s === "completed")  return { bg: "#dcfce7", color: "#16a34a", icon: <CheckCircle className="h-3.5 w-3.5" /> };
//   if (s === "processing") return { bg: "#dbeafe", color: "#1d4ed8", icon: <Clock       className="h-3.5 w-3.5" /> };
//   return                         { bg: "#fee2e2", color: "#dc2626", icon: <AlertCircle  className="h-3.5 w-3.5" /> };
// };

// const entityCfg = (v: string) => ENTITIES.find((e) => e.value === v);

// /* ── StatCard ─────────────────────────────────────────────────── */
// const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
//   <div className="flex-1 min-w-[130px] bg-white rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: BORDER }}>
//     <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: color }}>{icon}</div>
//     <div>
//       <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: MUTED }}>{label}</p>
//       <p className="text-2xl font-extrabold" style={{ color: NAVY }}>{value.toLocaleString()}</p>
//     </div>
//   </div>
// );

// /* ================================================================
//    Main page
// ================================================================ */
// const ImportExportPage: React.FC = () => {
//   /* ── state ── */
//   const [tab,          setTab]          = useState<"import" | "export">("import");
//   const [importEntity, setImportEntity] = useState<BackupEntity>("leads");
//   const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
//   const [file,         setFile]         = useState<File | null>(null);
//   const [progress,     setProgress]     = useState(0);
//   const [importing,    setImporting]    = useState(false);
//   const [exporting,    setExporting]    = useState<BackupEntity | null>(null);
//   const [dlTemplate,   setDlTemplate]   = useState(false);
//   const [history,      setHistory]      = useState<BackupRecord[]>([]);
//   const [stats,        setStats]        = useState<BackupStats | null>(null);
//   const [histLoading,  setHistLoading]  = useState(true);
//   const [fOp,          setFOp]          = useState("");
//   const [fEntity,      setFEntity]      = useState("");
//   const [fStatus,      setFStatus]      = useState("");
//   const [page,         setPage]         = useState(1);
//   const [totalPages,   setTotalPages]   = useState(1);
//   const fileRef = useRef<HTMLInputElement>(null);

//   /* ── load ── */
//   useEffect(() => { loadStats(); }, []);
//   useEffect(() => { loadHistory(); }, [fOp, fEntity, fStatus, page]);

//   const loadStats = async () => {
//     try { setStats(await backupAPI.getStats()); } catch (_) {}
//   };

//   const loadHistory = async () => {
//     setHistLoading(true);
//     try {
//       const p: any = { page, limit: 10 };
//       if (fOp)     p.operation = fOp;
//       if (fEntity) p.entity    = fEntity;
//       if (fStatus) p.status    = fStatus;
//       const r = await backupAPI.getHistory(p);
//       setHistory(r.records);
//       setTotalPages(r.total_pages);
//     } catch { setHistory([]); }
//     finally { setHistLoading(false); }
//   };

//   /* ── actions ── */
//   const doImport = async () => {
//     if (!file) { toast.error("Please select a file first"); return; }
//     setImporting(true); setProgress(0);
//     try {
//       const r = await backupAPI.importData(importEntity, file, setProgress);
//       toast.success(`Import done! ${r.inserted} imported, ${r.skipped} skipped`);
//       setFile(null);
//       if (fileRef.current) fileRef.current.value = "";
//       loadHistory(); loadStats();
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message || "Import failed");
//     } finally { setImporting(false); setProgress(0); }
//   };

//   // Export from this page = re-export current DB data for that entity
//   const doExport = async (entity: BackupEntity) => {
//     setExporting(entity);
//     try {
//       await backupAPI.reExportData(entity, exportFormat);
//       toast.success(`${entity} exported as ${exportFormat.toUpperCase()}`);
//       loadHistory(); loadStats();
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message || "Export failed");
//     } finally { setExporting(null); }
//   };

//   const doTemplate = async () => {
//     setDlTemplate(true);
//     try { await backupAPI.downloadTemplate(importEntity); }
//     catch { toast.error("Could not download template"); }
//     finally { setDlTemplate(false); }
//   };

//   const doDelete = async (id: number) => {
//     if (!confirm("Delete this record?")) return;
//     try {
//       await backupAPI.deleteHistory(id);
//       toast.success("Deleted");
//       loadHistory(); loadStats();
//     } catch { toast.error("Delete failed"); }
//   };

//   /* ── render ── */
//   return (
//     <div className="min-h-screen p-3 sm:p-5 xl:p-7 space-y-5" style={{ background: LIGHT }}>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
//             Import & Export
//           </h1>
//           <p className="text-sm mt-0.5" style={{ color: MUTED }}>
//             Import data into any module · Export any module's data · Full history tracked here
//           </p>
//         </div>
//         <button
//           onClick={() => { loadHistory(); loadStats(); }}
//           className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border transition hover:shadow"
//           style={{ borderColor: BORDER, color: MUTED }}
//         >
//           <RefreshCw className="h-4 w-4" /> Refresh
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="flex flex-wrap gap-3">
//         <StatCard label="Total Imports"  value={stats?.totalImports          ?? 0} icon={<Upload      className="h-4 w-4" />} color={NAVY}      />
//         <StatCard label="Total Exports"  value={stats?.totalExports          ?? 0} icon={<Download    className="h-4 w-4" />} color={ORANGE}    />
//         <StatCard label="Failed"         value={stats?.recentFailed          ?? 0} icon={<AlertCircle className="h-4 w-4" />} color="#dc2626"   />
//         <StatCard label="Records Synced" value={stats?.totalRecordsProcessed ?? 0} icon={<TrendingUp  className="h-4 w-4" />} color="#0891b2"   />
//       </div>

//       {/* Tab bar */}
//       <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: BORDER }}>
//         {(["import","export"] as const).map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
//             style={tab === t ? { background: NAVY, color: "white" } : { background: "transparent", color: MUTED }}
//           >
//             {t === "import" ? <Upload className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
//             {t === "import" ? "Import Data" : "Export Data"}
//           </button>
//         ))}
//       </div>

//       {/* ══════════════ IMPORT PANEL ══════════════ */}
//       {tab === "import" && (
//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

//           {/* Upload card */}
//           <div className="lg:col-span-3 bg-white rounded-2xl border p-5 sm:p-6 space-y-5" style={{ borderColor: BORDER }}>
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: NAVY }}>
//                 <Upload className="h-5 w-5" />
//               </div>
//               <div>
//                 <h2 className="text-base font-bold" style={{ color: NAVY }}>Import Data</h2>
//                 <p className="text-xs" style={{ color: MUTED }}>CSV · Excel · JSON · max 50 MB</p>
//               </div>
//             </div>

//             {/* Entity selection */}
//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: MUTED }}>
//                 Select which module to import into
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {ENTITIES.map((e) => {
//                   const active = importEntity === e.value;
//                   return (
//                     <button
//                       key={e.value}
//                       onClick={() => setImportEntity(e.value)}
//                       className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
//                       style={active
//                         ? { borderColor: e.color, background: `${e.color}18`, color: e.color }
//                         : { borderColor: BORDER, background: "white", color: MUTED }}
//                     >
//                       <span style={{ color: active ? e.color : MUTED }}>{e.icon}</span>
//                       {e.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Drop zone */}
//             <div
//               className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
//               style={{ borderColor: file ? ORANGE : BORDER, background: file ? `${ORANGE}06` : "#fafbfc" }}
//               onClick={() => fileRef.current?.click()}
//               onDragOver={(e) => e.preventDefault()}
//               onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
//             >
//               <input
//                 ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json"
//                 className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)}
//               />
//               {file ? (
//                 <div className="flex items-center justify-center gap-3">
//                   <FileText className="h-6 w-6 shrink-0" style={{ color: ORANGE }} />
//                   <div className="text-left min-w-0">
//                     <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{file.name}</p>
//                     <p className="text-xs mt-0.5" style={{ color: MUTED }}>{fmtBytes(file.size)}</p>
//                   </div>
//                   <button className="ml-2 shrink-0 p-1 rounded-lg hover:bg-red-50"
//                           onClick={(e) => { e.stopPropagation(); setFile(null); }}>
//                     <X className="h-4 w-4 text-red-400" />
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: LIGHT }}>
//                     <Upload className="h-6 w-6" style={{ color: MUTED }} />
//                   </div>
//                   <p className="text-sm font-semibold" style={{ color: NAVY }}>Drop file here or click to browse</p>
//                   <p className="text-xs mt-1" style={{ color: MUTED }}>CSV · XLSX · XLS · JSON</p>
//                 </>
//               )}
//             </div>

//             {/* Progress */}
//             {importing && (
//               <div className="space-y-1">
//                 <div className="flex justify-between text-xs font-semibold" style={{ color: MUTED }}>
//                   <span>Importing into {importEntity}…</span><span>{progress}%</span>
//                 </div>
//                 <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
//                   <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: ORANGE }} />
//                 </div>
//               </div>
//             )}

//             {/* Buttons */}
//             <div className="flex flex-wrap gap-3">
//               <button
//                 onClick={doImport} disabled={importing || !file}
//                 className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
//                 style={{ background: NAVY }}
//               >
//                 <Upload className="h-4 w-4" />
//                 {importing ? "Importing…" : `Import into ${importEntity}`}
//               </button>
//               <button
//                 onClick={doTemplate} disabled={dlTemplate}
//                 className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition hover:shadow disabled:opacity-40"
//                 style={{ borderColor: BORDER, color: NAVY }}
//               >
//                 <FileText className="h-4 w-4" />
//                 {dlTemplate ? "Downloading…" : "Get Template"}
//               </button>
//             </div>
//           </div>

//           {/* Import tips */}
//           <div className="lg:col-span-2 bg-white rounded-2xl border p-5 sm:p-6" style={{ borderColor: BORDER }}>
//             <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>
//               How it works
//             </p>
//             <div className="space-y-3">
//               {[
//                 { n:"1", title:"Select module",       body:"Choose which table the data should go into — leads, buyers, sellers, properties, or users." },
//                 { n:"2", title:"Get the template",    body:"Download the blank template to see what columns are expected for the selected module." },
//                 { n:"3", title:"Upload your file",    body:"CSV, Excel (.xlsx/.xls), or JSON. Invalid rows are skipped and logged." },
//                 { n:"4", title:"Data saved + logged", body:"Records are inserted into the correct table. The import is logged here in history." },
//               ].map((tip) => (
//                 <div key={tip.n} className="flex gap-3 p-3 rounded-xl" style={{ background: LIGHT }}>
//                   <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
//                        style={{ background: ORANGE }}>{tip.n}</div>
//                   <div>
//                     <p className="text-sm font-bold" style={{ color: NAVY }}>{tip.title}</p>
//                     <p className="text-xs mt-0.5 leading-relaxed" style={{ color: MUTED }}>{tip.body}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Required fields quick ref */}
//             <div className="mt-5 pt-4 border-t" style={{ borderColor: BORDER }}>
//               <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: MUTED }}>Required fields</p>
//               <div className="space-y-1.5">
//                 {ENTITIES.map((e) => (
//                   <div key={e.value} className="flex items-center justify-between text-xs">
//                     <span className="flex items-center gap-1.5 font-semibold" style={{ color: e.color }}>
//                       {e.icon} {e.label}
//                     </span>
//                     <span style={{ color: MUTED }}>
//                       {e.value === "users" ? "first_name, email" : e.value === "properties" ? "title, city" : "name, phone"}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══════════════ EXPORT PANEL ══════════════ */}
//       {tab === "export" && (
//         <div className="space-y-4">

//           {/* Format selector */}
//           <div className="bg-white rounded-2xl border p-5" style={{ borderColor: BORDER }}>
//             <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: MUTED }}>
//               Choose export format
//             </p>
//             <div className="flex flex-wrap gap-2">
//               {FORMATS.map((f) => {
//                 const active = exportFormat === f.value;
//                 return (
//                   <button
//                     key={f.value}
//                     onClick={() => setExportFormat(f.value)}
//                     className="flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all min-w-[110px]"
//                     style={active
//                       ? { borderColor: ORANGE, background: `${ORANGE}12`, color: ORANGE }
//                       : { borderColor: BORDER, background: "white", color: MUTED }}
//                   >
//                     <span className="text-sm font-bold">{f.label}</span>
//                     <span className="text-[10px] mt-0.5 opacity-80">{f.desc}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Entity cards */}
//           <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
//             {ENTITIES.map((e) => {
//               const busy = exporting === e.value;
//               return (
//                 <div key={e.value}
//                      className="bg-white rounded-2xl border p-4 flex flex-col gap-4 hover:shadow-md transition-shadow"
//                      style={{ borderColor: BORDER }}>
//                   <div className="flex items-center gap-3">
//                     <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
//                          style={{ background: e.color }}>
//                       {e.icon}
//                     </div>
//                     <div>
//                       <p className="font-bold text-sm" style={{ color: NAVY }}>{e.label}</p>
//                       <p className="text-[11px]" style={{ color: MUTED }}>All records</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => doExport(e.value)}
//                     disabled={!!exporting}
//                     className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
//                     style={{ background: busy ? MUTED : e.color }}
//                   >
//                     {busy
//                       ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Exporting…</>
//                       : <><Download  className="h-3.5 w-3.5" />Export {exportFormat.toUpperCase()}</>}
//                   </button>
//                 </div>
//               );
//             })}
//           </div>

//           <p className="text-xs" style={{ color: MUTED }}>
//             * Export pulls live data from each module's database table at the time of click.
//               Every export is logged in history below.
//           </p>
//         </div>
//       )}

//       {/* ══════════════ HISTORY ══════════════ */}
//       <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: BORDER }}>
//         {/* Header + filters */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: BORDER }}>
//           <div>
//             <h3 className="font-bold" style={{ color: NAVY }}>Import / Export History</h3>
//             <p className="text-xs mt-0.5" style={{ color: MUTED }}>
//               Every import & export from this page and from all module pages
//             </p>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {[
//               { val: fOp,     set: (v: string) => { setFOp(v); setPage(1); },     opts: [["","All Ops"],["import","Import"],["export","Export"]] },
//               { val: fEntity, set: (v: string) => { setFEntity(v); setPage(1); }, opts: [["","All Modules"], ...ENTITIES.map((e) => [e.value, e.label])] },
//               { val: fStatus, set: (v: string) => { setFStatus(v); setPage(1); }, opts: [["","All Status"],["completed","Completed"],["processing","Processing"],["failed","Failed"]] },
//             ].map((s, i) => (
//               <select key={i} value={s.val} onChange={(e) => s.set(e.target.value)}
//                       className="text-xs px-3 py-1.5 rounded-xl border font-medium outline-none"
//                       style={{ borderColor: BORDER, color: NAVY, background: LIGHT }}>
//                 {s.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
//               </select>
//             ))}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm min-w-[700px]">
//             <thead>
//               <tr style={{ background: LIGHT }}>
//                 {["Operation","Module","Filename","Format","Records","Size","Status","Date",""].map((h) => (
//                   <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
//                       style={{ color: MUTED }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {histLoading ? (
//                 <tr><td colSpan={9} className="text-center py-16 text-sm" style={{ color: MUTED }}>
//                   <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" style={{ color: BORDER }} />
//                   Loading…
//                 </td></tr>
//               ) : !history.length ? (
//                 <tr><td colSpan={9} className="text-center py-16 text-sm" style={{ color: MUTED }}>
//                   No records yet
//                 </td></tr>
//               ) : history.map((rec) => {
//                 const ec = entityCfg(rec.entity);
//                 const sm = statusStyle(rec.status);
//                 return (
//                   <tr key={rec.id} className="border-t hover:bg-[#f8fafc] transition-colors" style={{ borderColor: "#f0f4f8" }}>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
//                             style={rec.operation === "import"
//                               ? { background: `${NAVY}12`, color: NAVY }
//                               : { background: `${ORANGE}12`, color: ORANGE }}>
//                         {rec.operation === "import" ? <Upload className="h-3 w-3" /> : <Download className="h-3 w-3" />}
//                         {rec.operation}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: ec?.color || NAVY }}>
//                         {ec?.icon} {ec?.label || rec.entity}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 max-w-[160px]">
//                       <p className="text-xs font-medium truncate" style={{ color: NAVY }}>{rec.filename || "—"}</p>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md"
//                             style={{ background: LIGHT, color: NAVY }}>{rec.file_format}</span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-xs">
//                       <span className="font-bold" style={{ color: "#16a34a" }}>{rec.success_records}</span>
//                       {rec.failed_records > 0 && (
//                         <span className="ml-1 font-bold" style={{ color: "#dc2626" }}>/{rec.failed_records} err</span>
//                       )}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: MUTED }}>{fmtBytes(rec.file_size)}</td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
//                             style={{ background: sm.bg, color: sm.color }}>
//                         {sm.icon} {rec.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: MUTED }}>{fmtDate(rec.created_at)}</td>
//                     <td className="px-4 py-3">
//                       <button onClick={() => doDelete(rec.id)}
//                               className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
//                         <Trash2 className="h-3.5 w-3.5 text-red-400" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: BORDER }}>
//             <p className="text-xs" style={{ color: MUTED }}>Page {page} of {totalPages}</p>
//             <div className="flex gap-2">
//               <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
//                       className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border disabled:opacity-40 transition"
//                       style={{ borderColor: BORDER, color: NAVY }}>
//                 <ChevronLeft className="h-3.5 w-3.5" /> Prev
//               </button>
//               <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
//                       className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border disabled:opacity-40 transition"
//                       style={{ borderColor: BORDER, color: NAVY }}>
//                 Next <ChevronRight className="h-3.5 w-3.5" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ImportExportPage;



// // src/pages/settings/ImportExportPage.tsx
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Upload, Download, FileText, AlertCircle, CheckCircle,
//   Clock, RefreshCw, Trash2, X, ChevronLeft, ChevronRight,
//   BarChart3, Users, Building, UserCheck, UserX, TrendingUp,
//   ChevronRight as ChevronRightIcon, Check, AlertTriangle
// } from "lucide-react";
// import { backupAPI, BackupEntity, ExportFormat, BackupRecord, BackupStats } from "@/lib/backupAPI";
// import { toast } from "@/hooks/useToast";
// import * as XLSX from "xlsx";

// /* ── theme ───────────────────────────────────────────────────── */
// const NAVY       = "#0c3854";
// const ORANGE     = "#e87722";
// const LIGHT      = "#f0f4f8";
// const BORDER     = "#dce5ee";
// const MUTED      = "#7a95a8";

// /* ── entity config ───────────────────────────────────────────── */
// const ENTITIES: { value: BackupEntity; label: string; icon: React.ReactNode; color: string; tableName: string }[] = [
//   { value: "leads",      label: "Leads",      icon: <BarChart3 className="h-4 w-4" />, color: ORANGE,    tableName: "client_leads" },
//   { value: "buyers",     label: "Buyers",     icon: <UserCheck className="h-4 w-4" />, color: "#16a34a", tableName: "buyers" },
//   { value: "sellers",    label: "Sellers",    icon: <UserX     className="h-4 w-4" />, color: "#dc2626", tableName: "sellers" },
//   { value: "properties", label: "Properties", icon: <Building  className="h-4 w-4" />, color: "#0891b2", tableName: "my_properties" },
//   { value: "users",      label: "Users",      icon: <Users     className="h-4 w-4" />, color: "#7c3aed", tableName: "users" },
// ];

// const FORMATS: { value: ExportFormat; label: string; desc: string }[] = [
//   { value: "csv",  label: "CSV",   desc: "Spreadsheet compatible" },
//   { value: "xlsx", label: "Excel", desc: "With formatting"        },
//   { value: "json", label: "JSON",  desc: "Developer friendly"     },
//   { value: "pdf",  label: "PDF",   desc: "Print ready report"     },
// ];

// /* ── helpers ─────────────────────────────────────────────────── */
// const fmtBytes = (b?: number | null) => {
//   if (!b) return "—";
//   if (b < 1024) return `${b} B`;
//   if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
//   return `${(b / (1024 * 1024)).toFixed(1)} MB`;
// };
// const fmtDate = (d?: string | null) =>
//   d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

// const statusStyle = (s: string) => {
//   if (s === "completed")  return { bg: "#dcfce7", color: "#16a34a", icon: <CheckCircle className="h-3.5 w-3.5" /> };
//   if (s === "processing") return { bg: "#dbeafe", color: "#1d4ed8", icon: <Clock       className="h-3.5 w-3.5" /> };
//   return                         { bg: "#fee2e2", color: "#dc2626", icon: <AlertCircle  className="h-3.5 w-3.5" /> };
// };

// const entityCfg = (v: string) => ENTITIES.find((e) => e.value === v);

// /* ── StatCard ─────────────────────────────────────────────────── */
// const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
//   <div className="flex-1 min-w-[130px] bg-white rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: BORDER }}>
//     <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: color }}>{icon}</div>
//     <div>
//       <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: MUTED }}>{label}</p>
//       <p className="text-2xl font-extrabold" style={{ color: NAVY }}>{value.toLocaleString()}</p>
//     </div>
//   </div>
// );

// /* ================================================================
//    Expected Columns - Matches backend importService.js
// ================================================================ */
// const EXPECTED_COLUMNS: Record<string, { field: string; label: string; required: boolean; type: string }[]> = {
//   leads: [
//     { field: "name", label: "Name", required: true, type: "text" },
//     { field: "phone", label: "Phone", required: true, type: "phone" },
//     { field: "email", label: "Email", required: false, type: "email" },
//     { field: "salutation", label: "Salutation", required: false, type: "text" },
//     { field: "whatsapp_number", label: "WhatsApp Number", required: false, type: "phone" },
//     { field: "lead_type", label: "Lead Type", required: false, type: "text" },
//     { field: "lead_source", label: "Lead Source", required: false, type: "text" },
//     { field: "stage", label: "Stage", required: false, type: "text" },
//     { field: "status", label: "Status", required: false, type: "text" },
//     { field: "priority", label: "Priority", required: false, type: "text" },
//     { field: "state", label: "State", required: false, type: "text" },
//     { field: "city", label: "City", required: false, type: "text" },
//     { field: "location", label: "Location", required: false, type: "text" },
//     { field: "assigned_executive", label: "Assigned Executive", required: false, type: "number" },
//   ],
//   buyers: [
//     { field: "name", label: "Name", required: true, type: "text" },
//     { field: "phone", label: "Phone", required: true, type: "phone" },
//     { field: "email", label: "Email", required: false, type: "email" },
//     { field: "salutation", label: "Salutation", required: false, type: "text" },
//     { field: "whatsapp_number", label: "WhatsApp Number", required: false, type: "phone" },
//     { field: "state", label: "State", required: false, type: "text" },
//     { field: "city", label: "City", required: false, type: "text" },
//     { field: "location", label: "Location", required: false, type: "text" },
//     { field: "buyer_lead_priority", label: "Priority", required: false, type: "text" },
//     { field: "buyer_lead_source", label: "Source", required: false, type: "text" },
//     { field: "buyer_lead_stage", label: "Stage", required: false, type: "text" },
//     { field: "buyer_lead_status", label: "Status", required: false, type: "text" },
//     { field: "budget_min", label: "Budget Min", required: false, type: "number" },
//     { field: "budget_max", label: "Budget Max", required: false, type: "number" },
//     { field: "remark", label: "Remark", required: false, type: "text" },
//     { field: "dob", label: "DOB", required: false, type: "date" },
//     { field: "nearbylocations", label: "Nearby Locations", required: false, type: "text" },
//   ],
//   sellers: [
//     { field: "name", label: "Name", required: true, type: "text" },
//     { field: "phone", label: "Phone", required: true, type: "phone" },
//     { field: "email", label: "Email", required: false, type: "email" },
//     { field: "salutation", label: "Salutation", required: false, type: "text" },
//     { field: "whatsapp_number", label: "WhatsApp Number", required: false, type: "phone" },
//     { field: "state", label: "State", required: false, type: "text" },
//     { field: "city", label: "City", required: false, type: "text" },
//     { field: "location", label: "Location", required: false, type: "text" },
//     { field: "seller_lead_priority", label: "Priority", required: false, type: "text" },
//     { field: "seller_lead_source", label: "Source", required: false, type: "text" },
//     { field: "seller_lead_stage", label: "Stage", required: false, type: "text" },
//     { field: "seller_lead_status", label: "Status", required: false, type: "text" },
//     { field: "remark", label: "Remark", required: false, type: "text" },
//     { field: "dob", label: "DOB", required: false, type: "date" },
//   ],
//   properties: [
//     { field: "propertyId", label: "Property ID", required: true, type: "text" },
//     { field: "sellerName", label: "Seller Name", required: false, type: "text" },
//     { field: "propertyTypeName", label: "Property Type", required: false, type: "text" },
//     { field: "propertySubtypeName", label: "Property Subtype", required: false, type: "text" },
//     { field: "unitType", label: "Unit Type", required: false, type: "text" },
//     { field: "cityName", label: "City", required: false, type: "text" },
//     { field: "locationName", label: "Location", required: false, type: "text" },
//     { field: "budget", label: "Budget", required: false, type: "number" },
//     { field: "carpetArea", label: "Carpet Area", required: false, type: "number" },
//     { field: "status", label: "Status", required: false, type: "text" },
//     { field: "bedrooms", label: "Bedrooms", required: false, type: "number" },
//     { field: "bathrooms", label: "Bathrooms", required: false, type: "number" },
//     { field: "furnishing", label: "Furnishing", required: false, type: "text" },
//     { field: "address", label: "Address", required: false, type: "text" },
//   ],
//   users: [
//     { field: "username", label: "Username", required: true, type: "text" },
//     { field: "first_name", label: "First Name", required: true, type: "text" },
//     { field: "last_name", label: "Last Name", required: false, type: "text" },
//     { field: "email", label: "Email", required: true, type: "email" },
//     { field: "phone", label: "Phone", required: false, type: "phone" },
//     { field: "role", label: "Role", required: false, type: "text" },
//     { field: "salutation", label: "Salutation", required: false, type: "text" },
//     { field: "designation", label: "Designation", required: false, type: "text" },
//     { field: "department", label: "Department", required: false, type: "text" },
//   ],
// };

// /* ── Import Modal Steps ───────────────────────────────────────── */
// type ImportStep = "upload" | "mapping" | "preview" | "result";

// interface ImportModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   entity: BackupEntity;
//   entityLabel: string;
//   onImportComplete: () => void;
// }

// const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, entity, entityLabel, onImportComplete }) => {
//   const [step, setStep] = useState<ImportStep>("upload");
//   const [file, setFile] = useState<File | null>(null);
//   const [fileData, setFileData] = useState<any[]>([]);
//   const [fileHeaders, setFileHeaders] = useState<string[]>([]);
//   const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
//   const [previewData, setPreviewData] = useState<any[]>([]);
//   const [importing, setImporting] = useState(false);
//   const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; errors: any[] } | null>(null);
//   const [progress, setProgress] = useState(0);
//   const fileRef = useRef<HTMLInputElement>(null);

//   const expectedColumnsForEntity = EXPECTED_COLUMNS[entity] || [];

//   const parseFile = async (file: File): Promise<{ data: any[]; headers: string[] }> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     const ext = file.name.split(".").pop()?.toLowerCase();

//     reader.onload = (e) => {
//       try {
//         const result = e.target?.result;

//         // ── Excel ──────────────────────────────────────────
//        // ── Excel ──────────────────────────────────────────
// if (ext === "xlsx" || ext === "xls") {
//   const wb = XLSX.read(result, { type: "array" });
//           const ws = wb.Sheets[wb.SheetNames[0]];
//           const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

//           if (raw.length < 2) {
//             reject(new Error("File has no data rows"));
//             return;
//           }

//           // Normalise headers same way as CSV path
//           const headers = (raw[0] as any[]).map((h) =>
//             String(h ?? "").toLowerCase().trim()
//               .replace(/[*]/g, "")
//               .replace(/[^a-z0-9_]/g, "_")
//           );

//           const data = raw.slice(1)
//             .filter((row) => row.some((v) => v !== null && v !== ""))
//             .map((row) => {
//               const obj: any = {};
//               headers.forEach((h, i) => {
//                 let val = row[i];
//                 if (val === null || val === undefined || val === "") val = null;
//                 obj[h] = val;
//               });
//               return obj;
//             });

//           resolve({ data, headers });
//           return;
//         }

//         // ── CSV ────────────────────────────────────────────
//         const text = result as string;
//         const lines = text.split("\n").filter((line) => line.trim());
//         if (lines.length < 2) {
//           reject(new Error("File has no data rows"));
//           return;
//         }

//         const headers = lines[0]
//           .split(",")
//           .map((h) =>
//             h.trim().toLowerCase()
//               .replace(/[*"]/g, "")
//               .replace(/[^a-z0-9_]/g, "_")
//           );

//         const data = lines.slice(1)
//           .filter((line) => line.trim())
//           .map((line) => {
//             const values = line.split(",");
//             const obj: any = {};
//             headers.forEach((h, i) => {
//               let val = values[i]?.trim() || null;
//               if (val === "" || val === "null" || val === "NULL") val = null;
//               obj[h] = val;
//             });
//             return obj;
//           });

//         resolve({ data, headers });

//       } catch (err) {
//         reject(err);
//       }
//     };

//     reader.onerror = reject;

//     // Read as ArrayBuffer for Excel, text for CSV
//     const ext2 = file.name.split(".").pop()?.toLowerCase();
//     if (ext2 === "xlsx" || ext2 === "xls") {
//       reader.readAsArrayBuffer(file);
//     } else {
//       reader.readAsText(file);
//     }
//   });
// };

//   const handleFileSelect = async (selectedFile: File | null) => {
//     if (!selectedFile) return;
//     setFile(selectedFile);
//     try {
//       const { data, headers } = await parseFile(selectedFile);
//       setFileData(data);
//       setFileHeaders(headers);
      
//       // Auto-map columns based on similarity
//       const mapping: Record<string, string> = {};
//       expectedColumnsForEntity.forEach(expected => {
//         const matchedHeader = headers.find(h => 
//           h === expected.field ||
//           h.includes(expected.field.toLowerCase()) ||
//           expected.field.toLowerCase().includes(h)
//         );
//         if (matchedHeader) {
//           mapping[expected.field] = matchedHeader;
//         }
//       });
//       setColumnMapping(mapping);
//       // Show ALL rows in preview (not just first 5)
//       setPreviewData(data);
//       setStep("mapping");
//     } catch (error) {
//       toast.error("Failed to parse file");
//     }
//   };

//   const handleMappingChange = (expectedField: string, fileCol: string) => {
//     setColumnMapping(prev => ({ ...prev, [expectedField]: fileCol }));
//   };

//   const handleNextToPreview = () => {
//     // Validate required columns are mapped
//     const requiredFields = expectedColumnsForEntity.filter(col => col.required);
//     const missingRequired = requiredFields.filter(req => !columnMapping[req.field]);
//     if (missingRequired.length) {
//       toast.error(`Please map required columns: ${missingRequired.map(m => m.label).join(", ")}`);
//       return;
//     }
//     setStep("preview");
//   };

//   const handleImport = async () => {
//     if (!file) return;
//     setImporting(true);
//     setProgress(0);
    
//     // Transform data based on mapping
//     const transformedData = fileData.map(row => {
//       const newRow: any = {};
//       Object.entries(columnMapping).forEach(([expectedField, fileCol]) => {
//         if (fileCol && row[fileCol] !== undefined && row[fileCol] !== null && row[fileCol] !== "") {
//           newRow[expectedField] = row[fileCol];
//         }
//       });
//       return newRow;
//     }).filter(row => Object.keys(row).length > 0);
    
//     // Create a new file with mapped columns
//     const newHeaders = Object.keys(columnMapping).filter(k => columnMapping[k]);
//     const csvContent = [
//       newHeaders.join(","),
//       ...transformedData.map(row => newHeaders.map(h => {
//         let val = row[h] || "";
//         if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
//           val = `"${val.replace(/"/g, '""')}"`;
//         }
//         return val;
//       }).join(","))
//     ].join("\n");
    
// const mappedFile = new File([csvContent], "import_data.csv", { type: "text/csv" });
    
//     try {
//       const result = await backupAPI.importData(entity, mappedFile, setProgress);
//       setImportResult({
//         inserted: result.inserted,
//         skipped: result.skipped,
//         errors: result.skippedRows || []
//       });
//       setStep("result");
//       onImportComplete();
//       toast.success(`Import completed! ${result.inserted} records imported`);
//     } catch (error: any) {
//       toast.error(error?.response?.data?.message || "Import failed");
//       setImportResult({
//         inserted: 0,
//         skipped: 0,
//         errors: [{ reason: error?.response?.data?.message || "Import failed" }]
//       });
//       setStep("result");
//     } finally {
//       setImporting(false);
//     }
//   };

//   const resetModal = () => {
//     setStep("upload");
//     setFile(null);
//     setFileData([]);
//     setFileHeaders([]);
//     setColumnMapping({});
//     setPreviewData([]);
//     setImportResult(null);
//     setProgress(0);
//     if (fileRef.current) fileRef.current.value = "";
//   };

//   const handleClose = () => {
//     resetModal();
//     onClose();
//   };

//   if (!isOpen) return null;

//   const totalRows = fileData.length;
//   const previewRows = previewData; // Show ALL rows

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
//       <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center" style={{ borderColor: BORDER }}>
//           <div>
//             <h2 className="text-xl font-bold" style={{ color: NAVY }}>Import {entityLabel}</h2>
//             <p className="text-sm mt-0.5" style={{ color: MUTED }}>Upload your CSV/Excel file</p>
//           </div>
//           <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
//             <X className="h-5 w-5" style={{ color: MUTED }} />
//           </button>
//         </div>

//         {/* Steps */}
//         <div className="px-6 py-4 border-b" style={{ borderColor: BORDER }}>
//           <div className="flex items-center justify-between max-w-md mx-auto">
//             {["upload", "mapping", "preview", "result"].map((s, idx) => {
//               const stepNames = ["1. Upload", "2. Mapping", "3. Preview", "4. Result"];
//               const isActive = step === s;
//               const isCompleted = (step === "mapping" && s === "upload") ||
//                                   (step === "preview" && (s === "upload" || s === "mapping")) ||
//                                   (step === "result");
//               return (
//                 <React.Fragment key={s}>
//                   <div className="flex flex-col items-center">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
//                       ${isActive ? 'text-white' : isCompleted ? 'text-white' : 'text-gray-400'}
//                       ${isActive ? 'bg-orange-500' : isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}>
//                       {isCompleted && step !== s ? <Check className="h-4 w-4" /> : idx + 1}
//                     </div>
//                     <span className="text-xs mt-1 whitespace-nowrap" style={{ color: isActive ? NAVY : MUTED }}>
//                       {stepNames[idx]}
//                     </span>
//                   </div>
//                   {idx < 3 && <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
//                 </React.Fragment>
//               );
//             })}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Step 1: Upload */}
//           {step === "upload" && (
//             <div>
//               <div
//                 className="rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
//                 style={{ borderColor: file ? ORANGE : BORDER, background: file ? `${ORANGE}06` : "#fafbfc" }}
//                 onClick={() => fileRef.current?.click()}
//                 onDragOver={(e) => e.preventDefault()}
//                 onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
//               >
//                 <input
//                   ref={fileRef}
//                   type="file"
//                   accept=".csv,.xlsx,.xls"
//                   className="hidden"
//                   onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
//                 />
//                 {file ? (
//                   <div className="flex items-center justify-center gap-3">
//                     <FileText className="h-8 w-8" style={{ color: ORANGE }} />
//                     <div className="text-left">
//                       <p className="text-sm font-semibold" style={{ color: NAVY }}>{file.name}</p>
//                       <p className="text-xs" style={{ color: MUTED }}>{fmtBytes(file.size)}</p>
//                     </div>
//                     <button className="p-1 rounded-lg hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
//                       <X className="h-4 w-4 text-red-400" />
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: LIGHT }}>
//                       <Upload className="h-7 w-7" style={{ color: MUTED }} />
//                     </div>
//                     <p className="text-base font-semibold" style={{ color: NAVY }}>Drop your file here or click to browse</p>
//                     <p className="text-sm mt-1" style={{ color: MUTED }}>CSV · Excel (.xlsx, .xls)</p>
//                   </>
//                 )}
//               </div>
              
//               <div className="mt-6 flex justify-between items-center">
//                 <button
//                   onClick={async () => {
//                     try {
//                       await backupAPI.downloadTemplate(entity);
//                       toast.success("Template downloaded");
//                     } catch {
//                       toast.error("Could not download template");
//                     }
//                   }}
//                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border"
//                   style={{ borderColor: BORDER, color: NAVY }}
//                 >
//                   <FileText className="h-4 w-4" />
//                   Download Template
//                 </button>
//                 <button
//                   onClick={() => file && setStep("mapping")}
//                   disabled={!file}
//                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
//                   style={{ background: NAVY }}
//                 >
//                   Next <ChevronRightIcon className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Column Mapping */}
//           {step === "mapping" && (
//             <div>
//               <div className="flex justify-between items-center mb-4">
//                 <p className="text-sm" style={{ color: MUTED }}>
//                   Map your file columns to database fields. Required fields are marked with <span className="text-red-500">*</span>
//                 </p>
//                 <p className="text-xs px-2 py-1 rounded-full" style={{ background: LIGHT, color: NAVY }}>
//                   Total Rows: {totalRows}
//                 </p>
//               </div>
//               <div className="space-y-3 max-h-[400px] overflow-y-auto">
//                 {expectedColumnsForEntity.map(expected => {
//                   const isRequired = expected.required;
//                   return (
//                     <div key={expected.field} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: LIGHT }}>
//                       <div className="w-36">
//                         <span className="text-sm font-semibold" style={{ color: NAVY }}>
//                           {expected.label}
//                           {isRequired && <span className="text-red-500 ml-1">*</span>}
//                         </span>
//                         <p className="text-[10px]" style={{ color: MUTED }}>{expected.field}</p>
//                       </div>
//                       <ChevronRightIcon className="h-4 w-4 shrink-0" style={{ color: MUTED }} />
//                       <select
//                         value={columnMapping[expected.field] || ""}
//                         onChange={(e) => handleMappingChange(expected.field, e.target.value)}
//                         className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
//                         style={{ borderColor: BORDER }}
//                       >
//                         <option value="">-- Select column --</option>
//                         {fileHeaders.map(h => (
//                           <option key={h} value={h}>{h}</option>
//                         ))}
//                       </select>
//                     </div>
//                   );
//                 })}
//               </div>
              
//               <div className="mt-6 flex justify-between">
//                 <button
//                   onClick={() => setStep("upload")}
//                   className="px-6 py-2.5 rounded-xl text-sm font-semibold border"
//                   style={{ borderColor: BORDER, color: NAVY }}
//                 >
//                   Back
//                 </button>
//                 <button
//                   onClick={handleNextToPreview}
//                   className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
//                   style={{ background: NAVY }}
//                 >
//                   Preview Data ({totalRows} rows)
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Preview */}
//           {step === "preview" && (
//             <div>
//               <div className="flex justify-between items-center mb-4">
//                 <p className="text-sm" style={{ color: MUTED }}>
//                   Preview of data after mapping - <strong>{previewRows.length}</strong> row(s) found
//                 </p>
//                 <p className="text-xs px-2 py-1 rounded-full" style={{ background: LIGHT, color: NAVY }}>
//                   Total: {previewRows.length} records
//                 </p>
//               </div>
              
//               {previewRows.length === 0 ? (
//                 <div className="text-center py-10 rounded-xl" style={{ background: LIGHT }}>
//                   <AlertCircle className="h-12 w-12 mx-auto mb-3" style={{ color: ORANGE }} />
//                   <p className="text-sm" style={{ color: MUTED }}>No valid data rows found after mapping</p>
//                   <p className="text-xs mt-1" style={{ color: MUTED }}>Please check your column mapping</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto border rounded-xl" style={{ borderColor: BORDER }}>
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr style={{ background: LIGHT }}>
//                         <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: NAVY }}>#</th>
//                         {Object.keys(columnMapping).filter(k => columnMapping[k]).map(col => {
//                           const colInfo = expectedColumnsForEntity.find(c => c.field === col);
//                           return (
//                             <th key={col} className="px-3 py-2 text-left text-xs font-semibold" style={{ color: NAVY }}>
//                               {colInfo?.label || col}
//                             </th>
//                           );
//                         })}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {previewRows.map((row, idx) => (
//                         <tr key={idx} className="border-t" style={{ borderColor: BORDER }}>
//                           <td className="px-3 py-2 text-xs" style={{ color: MUTED }}>{idx + 1}</td>
//                           {Object.entries(columnMapping).filter(([k, v]) => v).map(([expectedField, fileCol]) => (
//                             <td key={expectedField} className="px-3 py-2 text-xs" style={{ color: NAVY }}>
//                               {row[fileCol] || <span style={{ color: MUTED }}>—</span>}
//                             </td>
//                           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
              
//               {importing && (
//                 <div className="mt-4 space-y-1">
//                   <div className="flex justify-between text-xs font-semibold" style={{ color: MUTED }}>
//                     <span>Importing {previewRows.length} records...</span><span>{progress}%</span>
//                   </div>
//                   <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
//                     <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: ORANGE }} />
//                   </div>
//                 </div>
//               )}
              
//               <div className="mt-6 flex justify-between">
//                 <button
//                   onClick={() => setStep("mapping")}
//                   disabled={importing}
//                   className="px-6 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-40"
//                   style={{ borderColor: BORDER, color: NAVY }}
//                 >
//                   Back
//                 </button>
//                 <button
//                   onClick={handleImport}
//                   disabled={importing || previewRows.length === 0}
//                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
//                   style={{ background: ORANGE }}
//                 >
//                   {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
//                   {importing ? "Importing..." : `Import ${previewRows.length} Record${previewRows.length !== 1 ? 's' : ''}`}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 4: Result */}
//           {step === "result" && importResult && (
//             <div>
//               <div className="text-center mb-6">
//                 {importResult.inserted > 0 ? (
//                   <CheckCircle className="h-16 w-16 mx-auto mb-3" style={{ color: "#16a34a" }} />
//                 ) : (
//                   <AlertTriangle className="h-16 w-16 mx-auto mb-3" style={{ color: "#e87722" }} />
//                 )}
//                 <h3 className="text-xl font-bold" style={{ color: NAVY }}>
//                   {importResult.inserted > 0 ? "Import Completed!" : "Import Completed with Issues"}
//                 </h3>
//                 <p className="text-sm mt-1" style={{ color: MUTED }}>
//                   {importResult.inserted} record{importResult.inserted !== 1 ? 's' : ''} imported successfully
//                   {importResult.skipped > 0 && `, ${importResult.skipped} record${importResult.skipped !== 1 ? 's' : ''} skipped`}
//                 </p>
//               </div>
              
//               {importResult.errors.length > 0 && (
//                 <div className="mt-4">
//                   <p className="text-sm font-semibold mb-2" style={{ color: "#dc2626" }}>Skipped Rows:</p>
//                   <div className="max-h-[200px] overflow-y-auto border rounded-xl" style={{ borderColor: BORDER }}>
//                     <table className="w-full text-sm">
//                       <thead>
//                         <tr style={{ background: LIGHT }}>
//                           <th className="px-3 py-2 text-left text-xs">Row</th>
//                           <th className="px-3 py-2 text-left text-xs">Reason</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {importResult.errors.slice(0, 20).map((err, idx) => (
//                           <tr key={idx} className="border-t" style={{ borderColor: BORDER }}>
//                             <td className="px-3 py-2 text-xs">{err.row || idx + 1}</td>
//                             <td className="px-3 py-2 text-xs" style={{ color: "#dc2626" }}>{err.reason}</td>
//                           </tr>
//                         ))}
//                         {importResult.errors.length > 20 && (
//                           <tr>
//                             <td colSpan={2} className="px-3 py-2 text-xs text-center" style={{ color: MUTED }}>
//                               ... and {importResult.errors.length - 20} more errors
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
              
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={handleClose}
//                   className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
//                   style={{ background: NAVY }}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ================================================================
//    Main page
// ================================================================ */
// const ImportExportPage: React.FC = () => {
//   /* ── state ── */
//   const [tab, setTab] = useState<"import" | "export">("import");
//   const [importEntity, setImportEntity] = useState<BackupEntity>("leads");
//   const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
//   const [progress, setProgress] = useState(0);
//   const [importing, setImporting] = useState(false);
//   const [exporting, setExporting] = useState<BackupEntity | null>(null);
//   const [showImportModal, setShowImportModal] = useState(false);
//   const [showExportModal, setShowExportModal] = useState(false);
//   const [selectedExportEntity, setSelectedExportEntity] = useState<BackupEntity | null>(null);
//   const [exportFormatSelection, setExportFormatSelection] = useState<ExportFormat>("csv");
//   const [history, setHistory] = useState<BackupRecord[]>([]);
//   const [stats, setStats] = useState<BackupStats | null>(null);
//   const [histLoading, setHistLoading] = useState(true);
//   const [fOp, setFOp] = useState("");
//   const [fEntity, setFEntity] = useState("");
//   const [fStatus, setFStatus] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   /* ── load ── */
//   useEffect(() => { loadStats(); }, []);
//   useEffect(() => { loadHistory(); }, [fOp, fEntity, fStatus, page]);

//   const loadStats = async () => {
//     try { setStats(await backupAPI.getStats()); } catch (_) {}
//   };

//   const loadHistory = async () => {
//     setHistLoading(true);
//     try {
//       const p: any = { page, limit: 10 };
//       if (fOp) p.operation = fOp;
//       if (fEntity) p.entity = fEntity;
//       if (fStatus) p.status = fStatus;
//       const r = await backupAPI.getHistory(p);
//       setHistory(r.records);
//       setTotalPages(r.total_pages);
//     } catch { setHistory([]); }
//     finally { setHistLoading(false); }
//   };

//   const handleImportComplete = () => {
//     loadHistory();
//     loadStats();
//   };

//   const handleOpenExportModal = (entity: BackupEntity) => {
//     setSelectedExportEntity(entity);
//     setShowExportModal(true);
//   };

//   const confirmExport = async () => {
//     if (!selectedExportEntity) return;
//     setExporting(selectedExportEntity);
//     setShowExportModal(false);
//     try {
//       await backupAPI.reExportData(selectedExportEntity, exportFormatSelection);
//       toast.success(`${selectedExportEntity} exported as ${exportFormatSelection.toUpperCase()}`);
//       loadHistory();
//       loadStats();
//     } catch (e: any) {
//       toast.error(e?.response?.data?.message || "Export failed");
//     } finally {
//       setExporting(null);
//       setSelectedExportEntity(null);
//     }
//   };

//   const doDelete = async (id: number) => {
//     if (!confirm("Delete this record?")) return;
//     try {
//       await backupAPI.deleteHistory(id);
//       toast.success("Deleted");
//       loadHistory();
//       loadStats();
//     } catch { toast.error("Delete failed"); }
//   };

//   const entityLabel = ENTITIES.find(e => e.value === importEntity)?.label || importEntity;

//   return (
//     <div className="min-h-screen p-3 sm:p-5 xl:p-7 space-y-5" style={{ background: LIGHT }}>
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
//             Import & Export
//           </h1>
//           <p className="text-sm mt-0.5" style={{ color: MUTED }}>
//             Import data into any module · Export any module's data · Full history tracked here
//           </p>
//         </div>
//         <button
//           onClick={() => { loadHistory(); loadStats(); }}
//           className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border transition hover:shadow"
//           style={{ borderColor: BORDER, color: MUTED }}
//         >
//           <RefreshCw className="h-4 w-4" /> Refresh
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="flex flex-wrap gap-3">
//         <StatCard label="Total Imports" value={stats?.totalImports ?? 0} icon={<Upload className="h-4 w-4" />} color={NAVY} />
//         <StatCard label="Total Exports" value={stats?.totalExports ?? 0} icon={<Download className="h-4 w-4" />} color={ORANGE} />
//         <StatCard label="Failed" value={stats?.recentFailed ?? 0} icon={<AlertCircle className="h-4 w-4" />} color="#dc2626" />
//         <StatCard label="Records Synced" value={stats?.totalRecordsProcessed ?? 0} icon={<TrendingUp className="h-4 w-4" />} color="#0891b2" />
//       </div>

//       {/* Tab bar */}
//       <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: BORDER }}>
//         {(["import", "export"] as const).map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
//             style={tab === t ? { background: NAVY, color: "white" } : { background: "transparent", color: MUTED }}
//           >
//             {t === "import" ? <Upload className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
//             {t === "import" ? "Import Data" : "Export Data"}
//           </button>
//         ))}
//       </div>

//       {/* ══════════════ IMPORT PANEL ══════════════ */}
//       {tab === "import" && (
//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
//           <div className="lg:col-span-3 bg-white rounded-2xl border p-5 sm:p-6 space-y-5" style={{ borderColor: BORDER }}>
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: NAVY }}>
//                 <Upload className="h-5 w-5" />
//               </div>
//               <div>
//                 <h2 className="text-base font-bold" style={{ color: NAVY }}>Import Data</h2>
//                 <p className="text-xs" style={{ color: MUTED }}>CSV · Excel · max 50 MB</p>
//               </div>
//             </div>

//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: MUTED }}>
//                 Select which module to import into
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {ENTITIES.map((e) => {
//                   const active = importEntity === e.value;
//                   return (
//                     <button
//                       key={e.value}
//                       onClick={() => setImportEntity(e.value)}
//                       className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
//                       style={active
//                         ? { borderColor: e.color, background: `${e.color}18`, color: e.color }
//                         : { borderColor: BORDER, background: "white", color: MUTED }}
//                     >
//                       <span style={{ color: active ? e.color : MUTED }}>{e.icon}</span>
//                       {e.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <button
//               onClick={() => setShowImportModal(true)}
//               className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
//               style={{ background: NAVY }}
//             >
//               <Upload className="h-4 w-4" />
//               Import {entityLabel} Data
//             </button>

//             <div className="text-center text-xs" style={{ color: MUTED }}>
//               Click above to start import with column mapping and preview
//             </div>
//           </div>

//           <div className="lg:col-span-2 bg-white rounded-2xl border p-5 sm:p-6" style={{ borderColor: BORDER }}>
//             <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>
//               How it works
//             </p>
//             <div className="space-y-3">
//               {[
//                 { n: "1", title: "Select module", body: "Choose which table the data should go into — leads, buyers, sellers, properties, or users." },
//                 { n: "2", title: "Upload file", body: "CSV or Excel file. We'll auto-detect columns." },
//                 { n: "3", title: "Map columns", body: "Match your file columns to database fields." },
//                 { n: "4", title: "Preview & Import", body: "Review data and confirm import." },
//               ].map((tip) => (
//                 <div key={tip.n} className="flex gap-3 p-3 rounded-xl" style={{ background: LIGHT }}>
//                   <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
//                     style={{ background: ORANGE }}>{tip.n}</div>
//                   <div>
//                     <p className="text-sm font-bold" style={{ color: NAVY }}>{tip.title}</p>
//                     <p className="text-xs mt-0.5 leading-relaxed" style={{ color: MUTED }}>{tip.body}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══════════════ EXPORT PANEL ══════════════ */}
//       {tab === "export" && (
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
//             {ENTITIES.map((e) => {
//               const busy = exporting === e.value;
//               return (
//                 <div key={e.value}
//                   className="bg-white rounded-2xl border p-4 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer"
//                   style={{ borderColor: BORDER }}
//                   onClick={() => !busy && handleOpenExportModal(e.value)}>
//                   <div className="flex items-center gap-3">
//                     <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
//                       style={{ background: e.color }}>
//                       {e.icon}
//                     </div>
//                     <div>
//                       <p className="font-bold text-sm" style={{ color: NAVY }}>{e.label}</p>
//                       <p className="text-[11px]" style={{ color: MUTED }}>Click to export</p>
//                     </div>
//                   </div>
//                   <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
//                     style={{ background: busy ? MUTED : e.color }}>
//                     {busy
//                       ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Exporting…</>
//                       : <><Download className="h-3.5 w-3.5" />Export Data</>}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//           <p className="text-xs" style={{ color: MUTED }}>
//             * Click on any card to choose export format and download data.
//           </p>
//         </div>
//       )}

//       {/* ══════════════ HISTORY ══════════════ */}
//       <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: BORDER }}>
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: BORDER }}>
//           <div>
//             <h3 className="font-bold" style={{ color: NAVY }}>Import / Export History</h3>
//             <p className="text-xs mt-0.5" style={{ color: MUTED }}>
//               Every import & export from this page and from all module pages
//             </p>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {[
//               { val: fOp, set: (v: string) => { setFOp(v); setPage(1); }, opts: [["", "All Ops"], ["import", "Import"], ["export", "Export"]] },
//               { val: fEntity, set: (v: string) => { setFEntity(v); setPage(1); }, opts: [["", "All Modules"], ...ENTITIES.map((e) => [e.value, e.label])] },
//               { val: fStatus, set: (v: string) => { setFStatus(v); setPage(1); }, opts: [["", "All Status"], ["completed", "Completed"], ["processing", "Processing"], ["failed", "Failed"]] },
//             ].map((s, i) => (
//               <select key={i} value={s.val} onChange={(e) => s.set(e.target.value)}
//                 className="text-xs px-3 py-1.5 rounded-xl border font-medium outline-none"
//                 style={{ borderColor: BORDER, color: NAVY, background: LIGHT }}>
//                 {s.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
//               </select>
//             ))}
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-sm min-w-[700px]">
//             <thead>
//               <tr style={{ background: LIGHT }}>
//                 {["Operation", "Module", "Filename", "Format", "Records", "Size", "Status", "Date", ""].map((h) => (
//                   <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
//                     style={{ color: MUTED }}>{h}</th>
//                 ))}
//                </tr>
//             </thead>
//             <tbody>
//               {histLoading ? (
//                 <tr><td colSpan={9} className="text-center py-16 text-sm" style={{ color: MUTED }}>
//                   <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" style={{ color: BORDER }} />
//                   Loading…
//                 </td></tr>
//               ) : !history.length ? (
//                 <tr><td colSpan={9} className="text-center py-16 text-sm" style={{ color: MUTED }}>
//                   No records yet
//                 </td></tr>
//               ) : history.map((rec) => {
//                 const ec = entityCfg(rec.entity);
//                 const sm = statusStyle(rec.status);
//                 return (
//                   <tr key={rec.id} className="border-t hover:bg-[#f8fafc] transition-colors" style={{ borderColor: "#f0f4f8" }}>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
//                         style={rec.operation === "import"
//                           ? { background: `${NAVY}12`, color: NAVY }
//                           : { background: `${ORANGE}12`, color: ORANGE }}>
//                         {rec.operation === "import" ? <Upload className="h-3 w-3" /> : <Download className="h-3 w-3" />}
//                         {rec.operation}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: ec?.color || NAVY }}>
//                         {ec?.icon} {ec?.label || rec.entity}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 max-w-[160px]">
//                       <p className="text-xs font-medium truncate" style={{ color: NAVY }}>{rec.filename || "—"}</p>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md"
//                         style={{ background: LIGHT, color: NAVY }}>{rec.file_format}</span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-xs">
//                       <span className="font-bold" style={{ color: "#16a34a" }}>{rec.success_records}</span>
//                       {rec.failed_records > 0 && (
//                         <span className="ml-1 font-bold" style={{ color: "#dc2626" }}>/{rec.failed_records} err</span>
//                       )}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: MUTED }}>{fmtBytes(rec.file_size)}</td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
//                         style={{ background: sm.bg, color: sm.color }}>
//                         {sm.icon} {rec.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: MUTED }}>{fmtDate(rec.created_at)}</td>
//                     <td className="px-4 py-3">
//                       <button onClick={() => doDelete(rec.id)}
//                         className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
//                         <Trash2 className="h-3.5 w-3.5 text-red-400" />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: BORDER }}>
//             <p className="text-xs" style={{ color: MUTED }}>Page {page} of {totalPages}</p>
//             <div className="flex gap-2">
//               <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
//                 className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border disabled:opacity-40 transition"
//                 style={{ borderColor: BORDER, color: NAVY }}>
//                 <ChevronLeft className="h-3.5 w-3.5" /> Prev
//               </button>
//               <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
//                 className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border disabled:opacity-40 transition"
//                 style={{ borderColor: BORDER, color: NAVY }}>
//                 Next <ChevronRight className="h-3.5 w-3.5" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Import Modal */}
//       <ImportModal
//         isOpen={showImportModal}
//         onClose={() => setShowImportModal(false)}
//         entity={importEntity}
//         entityLabel={entityLabel}
//         onImportComplete={handleImportComplete}
//       />

//       {/* Export Modal */}
//       {showExportModal && selectedExportEntity && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExportModal(false)}>
//           <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
//             <h3 className="text-xl font-bold mb-4" style={{ color: NAVY }}>Export {selectedExportEntity}</h3>
//             <p className="text-sm mb-4" style={{ color: MUTED }}>Select format to export data:</p>

//             <div className="flex gap-3 mb-6">
//               {FORMATS.map((f) => (
//                 <button
//                   key={f.value}
//                   onClick={() => setExportFormatSelection(f.value)}
//                   className={`flex-1 py-3 rounded-xl border text-center transition-all ${exportFormatSelection === f.value
//                       ? 'border-orange-500 bg-orange-50 text-orange-600'
//                       : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                 >
//                   <div className="font-bold">{f.label}</div>
//                   <div className="text-xs opacity-70">{f.desc}</div>
//                 </button>
//               ))}
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowExportModal(false)}
//                 className="flex-1 py-2.5 rounded-xl border font-semibold"
//                 style={{ borderColor: BORDER, color: MUTED }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmExport}
//                 className="flex-1 py-2.5 rounded-xl font-semibold text-white"
//                 style={{ background: ORANGE }}
//               >
//                 Export {exportFormatSelection.toUpperCase()}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImportExportPage;


// src/pages/settings/ImportExportPage.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Upload, Download, FileText, AlertCircle, CheckCircle,
  Clock, RefreshCw, Trash2, X, ChevronLeft, ChevronRight,
  BarChart3, Users, Building, UserCheck, UserX, TrendingUp,
  ChevronRight as ChevronRightIcon, Check, AlertTriangle,
  History, Filter
} from "lucide-react";
import { backupAPI, BackupEntity, ExportFormat, BackupRecord, BackupStats } from "@/lib/backupAPI";
import { toast } from "@/hooks/useToast";
import * as XLSX from "xlsx";

/* ── theme ───────────────────────────────────────────────────── */
const NAVY   = "#0c3854";
const ORANGE = "#e87722";
const LIGHT  = "#f0f4f8";
const BORDER = "#dce5ee";
const MUTED  = "#7a95a8";

/* ── entity config ───────────────────────────────────────────── */
const ENTITIES: { value: BackupEntity; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "leads",      label: "Leads",      icon: <BarChart3 className="h-4 w-4" />, color: ORANGE    },
  { value: "buyers",     label: "Buyers",     icon: <UserCheck className="h-4 w-4" />, color: "#16a34a" },
  { value: "sellers",    label: "Sellers",    icon: <UserX     className="h-4 w-4" />, color: "#dc2626" },
  { value: "properties", label: "Properties", icon: <Building  className="h-4 w-4" />, color: "#0891b2" },
  { value: "users",      label: "Users",      icon: <Users     className="h-4 w-4" />, color: "#7c3aed" },
];

const FORMATS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: "csv",  label: "CSV",   desc: "Spreadsheet" },
  { value: "xlsx", label: "Excel", desc: "Formatted"   },
  { value: "json", label: "JSON",  desc: "Developer"   },
  { value: "pdf",  label: "PDF",   desc: "Print ready" },
];

/* ── helpers ─────────────────────────────────────────────────── */
const fmtBytes = (b?: number | null) => {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

const statusStyle = (s: string) => {
  if (s === "completed")  return { bg: "#dcfce7", color: "#16a34a", icon: <CheckCircle className="h-3.5 w-3.5" /> };
  if (s === "processing") return { bg: "#dbeafe", color: "#1d4ed8", icon: <Clock       className="h-3.5 w-3.5" /> };
  return                         { bg: "#fee2e2", color: "#dc2626", icon: <AlertCircle  className="h-3.5 w-3.5" /> };
};
const entityCfg = (v: string) => ENTITIES.find((e) => e.value === v);

/* ── Compact StatCard ─────────────────────────────────────────── */
const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
  <div className="flex-1 min-w-0 bg-white rounded-xl border p-3 flex items-center gap-2.5" style={{ borderColor: BORDER }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: color }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: MUTED }}>{label}</p>
      <p className="text-lg font-extrabold leading-tight" style={{ color: NAVY }}>{value.toLocaleString()}</p>
    </div>
  </div>
);

/* ================================================================
   Expected Columns
================================================================ */
const EXPECTED_COLUMNS: Record<string, { field: string; label: string; required: boolean; type: string }[]> = {
  leads: [
    { field: "name",               label: "Name",               required: true,  type: "text"   },
    { field: "phone",              label: "Phone",              required: true,  type: "phone"  },
    { field: "email",              label: "Email",              required: false, type: "email"  },
    { field: "salutation",         label: "Salutation",         required: false, type: "text"   },
    { field: "whatsapp_number",    label: "WhatsApp Number",    required: false, type: "phone"  },
    { field: "lead_type",          label: "Lead Type",          required: false, type: "text"   },
    { field: "lead_source",        label: "Lead Source",        required: false, type: "text"   },
    { field: "stage",              label: "Stage",              required: false, type: "text"   },
    { field: "status",             label: "Status",             required: false, type: "text"   },
    { field: "priority",           label: "Priority",           required: false, type: "text"   },
    { field: "state",              label: "State",              required: false, type: "text"   },
    { field: "city",               label: "City",               required: false, type: "text"   },
    { field: "location",           label: "Location",           required: false, type: "text"   },
    { field: "assigned_executive", label: "Assigned Executive", required: false, type: "number" },
  ],
  buyers: [
    { field: "name",               label: "Name",            required: true,  type: "text"   },
    { field: "phone",              label: "Phone",           required: true,  type: "phone"  },
    { field: "email",              label: "Email",           required: false, type: "email"  },
    { field: "salutation",         label: "Salutation",      required: false, type: "text"   },
    { field: "whatsapp_number",    label: "WhatsApp Number", required: false, type: "phone"  },
    { field: "state",              label: "State",           required: false, type: "text"   },
    { field: "city",               label: "City",            required: false, type: "text"   },
    { field: "location",           label: "Location",        required: false, type: "text"   },
    { field: "buyer_lead_priority",label: "Priority",        required: false, type: "text"   },
    { field: "buyer_lead_source",  label: "Source",          required: false, type: "text"   },
    { field: "buyer_lead_stage",   label: "Stage",           required: false, type: "text"   },
    { field: "buyer_lead_status",  label: "Status",          required: false, type: "text"   },
    { field: "budget_min",         label: "Budget Min",      required: false, type: "number" },
    { field: "budget_max",         label: "Budget Max",      required: false, type: "number" },
    { field: "remark",             label: "Remark",          required: false, type: "text"   },
    { field: "dob",                label: "DOB",             required: false, type: "date"   },
    { field: "nearbylocations",    label: "Nearby Locations",required: false, type: "text"   },
  ],
  sellers: [
    { field: "name",                label: "Name",            required: true,  type: "text"  },
    { field: "phone",               label: "Phone",           required: true,  type: "phone" },
    { field: "email",               label: "Email",           required: false, type: "email" },
    { field: "salutation",          label: "Salutation",      required: false, type: "text"  },
    { field: "whatsapp_number",     label: "WhatsApp Number", required: false, type: "phone" },
    { field: "state",               label: "State",           required: false, type: "text"  },
    { field: "city",                label: "City",            required: false, type: "text"  },
    { field: "location",            label: "Location",        required: false, type: "text"  },
    { field: "seller_lead_priority",label: "Priority",        required: false, type: "text"  },
    { field: "seller_lead_source",  label: "Source",          required: false, type: "text"  },
    { field: "seller_lead_stage",   label: "Stage",           required: false, type: "text"  },
    { field: "seller_lead_status",  label: "Status",          required: false, type: "text"  },
    { field: "remark",              label: "Remark",          required: false, type: "text"  },
    { field: "dob",                 label: "DOB",             required: false, type: "date"  },
  ],
  properties: [
    { field: "propertyId",          label: "Property ID",      required: true,  type: "text"   },
    { field: "sellerName",          label: "Seller Name",      required: false, type: "text"   },
    { field: "propertyTypeName",    label: "Property Type",    required: false, type: "text"   },
    { field: "propertySubtypeName", label: "Property Subtype", required: false, type: "text"   },
    { field: "unitType",            label: "Unit Type",        required: false, type: "text"   },
    { field: "cityName",            label: "City",             required: false, type: "text"   },
    { field: "locationName",        label: "Location",         required: false, type: "text"   },
    { field: "budget",              label: "Budget",           required: false, type: "number" },
    { field: "carpetArea",          label: "Carpet Area",      required: false, type: "number" },
    { field: "status",              label: "Status",           required: false, type: "text"   },
    { field: "bedrooms",            label: "Bedrooms",         required: false, type: "number" },
    { field: "bathrooms",           label: "Bathrooms",        required: false, type: "number" },
    { field: "furnishing",          label: "Furnishing",       required: false, type: "text"   },
    { field: "address",             label: "Address",          required: false, type: "text"   },
  ],
  users: [
    { field: "username",    label: "Username",    required: true,  type: "text"  },
    { field: "first_name",  label: "First Name",  required: true,  type: "text"  },
    { field: "last_name",   label: "Last Name",   required: false, type: "text"  },
    { field: "email",       label: "Email",       required: true,  type: "email" },
    { field: "phone",       label: "Phone",       required: false, type: "phone" },
    { field: "role",        label: "Role",        required: false, type: "text"  },
    { field: "salutation",  label: "Salutation",  required: false, type: "text"  },
    { field: "designation", label: "Designation", required: false, type: "text"  },
    { field: "department",  label: "Department",  required: false, type: "text"  },
  ],
};

/* ── Import Modal ─────────────────────────────────────────────── */
type ImportStep = "upload" | "mapping" | "preview" | "result";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: BackupEntity;
  entityLabel: string;
  onImportComplete: () => void;
  /* pass history so user can pick a previously imported file */
  importHistory: BackupRecord[];
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen, onClose, entity, entityLabel, onImportComplete, importHistory,
}) => {
  const [step, setStep]               = useState<ImportStep>("upload");
  const [file, setFile]               = useState<File | null>(null);
  const [fileData, setFileData]       = useState<any[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importing, setImporting]     = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; errors: any[] } | null>(null);
  const [progress, setProgress]       = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const expectedColumnsForEntity = EXPECTED_COLUMNS[entity] || [];

  /* ── parse file ── */
  const parseFile = async (f: File): Promise<{ data: any[]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const ext = f.name.split(".").pop()?.toLowerCase();

      reader.onload = (e) => {
        try {
          const result = e.target?.result;

          if (ext === "xlsx" || ext === "xls") {
            const wb   = XLSX.read(result, { type: "array" });
            const ws   = wb.Sheets[wb.SheetNames[0]];
            const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
            if (raw.length < 2) { reject(new Error("File has no data rows")); return; }

            const headers = (raw[0] as any[]).map((h) =>
              String(h ?? "").toLowerCase().trim().replace(/[*]/g, "").replace(/[^a-z0-9_]/g, "_")
            );
            const data = raw.slice(1)
              .filter((row) => row.some((v) => v !== null && v !== ""))
              .map((row) => {
                const obj: any = {};
                headers.forEach((h, i) => {
                  let val = row[i];
                  if (val === null || val === undefined || val === "") val = null;
                  obj[h] = val;
                });
                return obj;
              });
            resolve({ data, headers });
            return;
          }

          // CSV
          const text  = result as string;
          const lines = text.split("\n").filter((l) => l.trim());
          if (lines.length < 2) { reject(new Error("File has no data rows")); return; }

          const headers = lines[0].split(",").map((h) =>
            h.trim().toLowerCase().replace(/[*"]/g, "").replace(/[^a-z0-9_]/g, "_")
          );
          const data = lines.slice(1).filter((l) => l.trim()).map((line) => {
            const values = line.split(",");
            const obj: any = {};
            headers.forEach((h, i) => {
              let val = values[i]?.trim() || null;
              if (val === "" || val === "null" || val === "NULL") val = null;
              obj[h] = val;
            });
            return obj;
          });
          resolve({ data, headers });
        } catch (err) { reject(err); }
      };

      reader.onerror = reject;
      if (ext === "xlsx" || ext === "xls") reader.readAsArrayBuffer(f);
      else reader.readAsText(f);
    });
  };

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    try {
      const { data, headers } = await parseFile(selectedFile);
      setFileData(data);
      setFileHeaders(headers);

      const mapping: Record<string, string> = {};
      expectedColumnsForEntity.forEach((expected) => {
        const matched = headers.find(
          (h) => h === expected.field || h.includes(expected.field.toLowerCase()) || expected.field.toLowerCase().includes(h)
        );
        if (matched) mapping[expected.field] = matched;
      });
      setColumnMapping(mapping);
      setPreviewData(data);
      setStep("mapping");
    } catch {
      toast.error("Failed to parse file");
    }
  };

  const handleMappingChange = (field: string, col: string) =>
    setColumnMapping((prev) => ({ ...prev, [field]: col }));

  const handleNextToPreview = () => {
    const missing = expectedColumnsForEntity
      .filter((c) => c.required && !columnMapping[c.field])
      .map((c) => c.label);
    if (missing.length) {
      toast.error(`Please map required columns: ${missing.join(", ")}`);
      return;
    }
    setStep("preview");
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setProgress(0);

    const transformedData = fileData
      .map((row) => {
        const newRow: any = {};
        Object.entries(columnMapping).forEach(([expectedField, fileCol]) => {
          if (fileCol && row[fileCol] !== undefined && row[fileCol] !== null && row[fileCol] !== "") {
            newRow[expectedField] = row[fileCol];
          }
        });
        return newRow;
      })
      .filter((row) => Object.keys(row).length > 0);

    const newHeaders = Object.keys(columnMapping).filter((k) => columnMapping[k]);
    const csvContent = [
      newHeaders.join(","),
      ...transformedData.map((row) =>
        newHeaders
          .map((h) => {
            let val = row[h] ?? "";
            if (typeof val === "string" && (val.includes(",") || val.includes('"')))
              val = `"${val.replace(/"/g, '""')}"`;
            return val;
          })
          .join(",")
      ),
    ].join("\n");

    // Always send as .csv so backend uses CSV parser
    const mappedFile = new File([csvContent], "import_data.csv", { type: "text/csv" });

    try {
      const result = await backupAPI.importData(entity, mappedFile, setProgress);
      setImportResult({ inserted: result.inserted, skipped: result.skipped, errors: result.skippedRows || [] });
      setStep("result");
      onImportComplete();
      toast.success(`Import completed! ${result.inserted} records imported`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Import failed";
      toast.error(msg);
      setImportResult({ inserted: 0, skipped: 0, errors: [{ reason: msg }] });
      setStep("result");
    } finally {
      setImporting(false);
    }
  };

  const resetModal = () => {
    setStep("upload");
    setFile(null);
    setFileData([]);
    setFileHeaders([]);
    setColumnMapping({});
    setPreviewData([]);
    setImportResult(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => { resetModal(); onClose(); };

  if (!isOpen) return null;

  const totalRows  = fileData.length;
  const previewRows = previewData;

  /* history for this entity (imports only, completed) */
  const entityImportHistory = importHistory.filter(
    (r) => r.entity === entity && r.operation === "import" && r.status === "completed" && r.filename
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center z-10" style={{ borderColor: BORDER }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>Import {entityLabel}</h2>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>Upload CSV/Excel file</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-4 w-4" style={{ color: MUTED }} />
          </button>
        </div>

        {/* Steps */}
        <div className="px-5 py-3 border-b" style={{ borderColor: BORDER }}>
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {["upload", "mapping", "preview", "result"].map((s, idx) => {
              const names = ["Upload", "Mapping", "Preview", "Result"];
              const isActive    = step === s;
              const isCompleted =
                (step === "mapping"  && s === "upload") ||
                (step === "preview"  && (s === "upload" || s === "mapping")) ||
                (step === "result");
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                        ${isActive ? "text-white bg-orange-500" : isCompleted ? "text-white bg-green-500" : "text-gray-400 bg-gray-200"}`}
                    >
                      {isCompleted && step !== s ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <span className="text-[10px] mt-0.5 whitespace-nowrap hidden sm:block" style={{ color: isActive ? NAVY : MUTED }}>
                      {names[idx]}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-0.5 mx-1 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          {/* ── Step 1: Upload ── */}
          {step === "upload" && (
            <div className="space-y-4">
              {/* Previously imported files for this entity */}
              {entityImportHistory.length > 0 && (
                <div className="rounded-xl border p-3" style={{ borderColor: BORDER, background: LIGHT }}>
                  <div className="flex items-center gap-2 mb-2">
                    <History className="h-3.5 w-3.5" style={{ color: MUTED }} />
                    <p className="text-xs font-semibold" style={{ color: NAVY }}>
                      Previously Imported Files ({entityLabel})
                    </p>
                  </div>
                  <p className="text-[11px] mb-2" style={{ color: MUTED }}>
                    You can re-import any previously uploaded file
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {entityImportHistory.slice(0, 10).map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border cursor-pointer hover:border-orange-300 transition-colors"
                        style={{ borderColor: BORDER }}
                        onClick={() => {
                          toast.info?.("Re-import: please upload the same file again from your device");
                          fileRef.current?.click();
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: ORANGE }} />
                          <span className="text-xs truncate" style={{ color: NAVY }}>{rec.filename}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px]" style={{ color: MUTED }}>{rec.success_records} rows</span>
                          <span className="text-[10px]" style={{ color: MUTED }}>{fmtDate(rec.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
                style={{ borderColor: file ? ORANGE : BORDER, background: file ? `${ORANGE}06` : "#fafbfc" }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-7 w-7" style={{ color: ORANGE }} />
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: NAVY }}>{file.name}</p>
                      <p className="text-xs" style={{ color: MUTED }}>{fmtBytes(file.size)}</p>
                    </div>
                    <button
                      className="p-1 rounded-lg hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: LIGHT }}>
                      <Upload className="h-5 w-5" style={{ color: MUTED }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: NAVY }}>Drop file here or click to browse</p>
                    <p className="text-xs mt-1" style={{ color: MUTED }}>CSV · Excel (.xlsx, .xls)</p>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={async () => {
                    try { await backupAPI.downloadTemplate(entity); toast.success("Template downloaded"); }
                    catch { toast.error("Could not download template"); }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border"
                  style={{ borderColor: BORDER, color: NAVY }}
                >
                  <FileText className="h-3.5 w-3.5" /> Download Template
                </button>
                <button
                  onClick={() => file && setStep("mapping")}
                  disabled={!file}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                  style={{ background: NAVY }}
                >
                  Next <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Mapping ── */}
          {step === "mapping" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs" style={{ color: MUTED }}>
                  Map columns. Required marked <span className="text-red-500">*</span>
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: LIGHT, color: NAVY }}>
                  {totalRows} rows
                </span>
              </div>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {expectedColumnsForEntity.map((expected) => (
                  <div key={expected.field} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: LIGHT }}>
                    <div className="w-32 shrink-0">
                      <span className="text-xs font-semibold" style={{ color: NAVY }}>
                        {expected.label}
                        {expected.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <p className="text-[10px]" style={{ color: MUTED }}>{expected.field}</p>
                    </div>
                    <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" style={{ color: MUTED }} />
                    <select
                      value={columnMapping[expected.field] || ""}
                      onChange={(e) => handleMappingChange(expected.field, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs outline-none"
                      style={{ borderColor: BORDER }}
                    >
                      <option value="">-- Select column --</option>
                      {fileHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setStep("upload")}
                  className="px-5 py-2 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: BORDER, color: NAVY }}
                >
                  Back
                </button>
                <button
                  onClick={handleNextToPreview}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: NAVY }}
                >
                  Preview ({totalRows} rows)
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Preview ── */}
          {step === "preview" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs" style={{ color: MUTED }}>
                  <strong>{previewRows.length}</strong> row(s) ready to import
                </p>
              </div>

              {previewRows.length === 0 ? (
                <div className="text-center py-8 rounded-xl" style={{ background: LIGHT }}>
                  <AlertCircle className="h-10 w-10 mx-auto mb-2" style={{ color: ORANGE }} />
                  <p className="text-sm" style={{ color: MUTED }}>No valid data rows found. Check column mapping.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl" style={{ borderColor: BORDER }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: LIGHT }}>
                        <th className="px-3 py-2 text-left font-semibold" style={{ color: NAVY }}>#</th>
                        {Object.keys(columnMapping).filter((k) => columnMapping[k]).map((col) => {
                          const info = expectedColumnsForEntity.find((c) => c.field === col);
                          return (
                            <th key={col} className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ color: NAVY }}>
                              {info?.label || col}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="border-t" style={{ borderColor: BORDER }}>
                          <td className="px-3 py-1.5" style={{ color: MUTED }}>{idx + 1}</td>
                          {Object.entries(columnMapping).filter(([, v]) => v).map(([expectedField, fileCol]) => (
                            <td key={expectedField} className="px-3 py-1.5 max-w-[120px] truncate" style={{ color: NAVY }}>
                              {row[fileCol] ?? <span style={{ color: MUTED }}>—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewRows.length > 50 && (
                    <p className="text-center text-xs py-2" style={{ color: MUTED }}>
                      Showing first 50 of {previewRows.length} rows
                    </p>
                  )}
                </div>
              )}

              {importing && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs" style={{ color: MUTED }}>
                    <span>Importing…</span><span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: ORANGE }} />
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setStep("mapping")}
                  disabled={importing}
                  className="px-5 py-2 rounded-xl text-sm font-semibold border disabled:opacity-40"
                  style={{ borderColor: BORDER, color: NAVY }}
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || previewRows.length === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                  style={{ background: ORANGE }}
                >
                  {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {importing ? "Importing…" : `Import ${previewRows.length} Record${previewRows.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Result ── */}
          {step === "result" && importResult && (
            <div>
              <div className="text-center mb-4">
                {importResult.inserted > 0 ? (
                  <CheckCircle className="h-14 w-14 mx-auto mb-2" style={{ color: "#16a34a" }} />
                ) : (
                  <AlertTriangle className="h-14 w-14 mx-auto mb-2" style={{ color: ORANGE }} />
                )}
                <h3 className="text-lg font-bold" style={{ color: NAVY }}>
                  {importResult.inserted > 0 ? "Import Completed!" : "Import Completed with Issues"}
                </h3>
                <p className="text-sm mt-1" style={{ color: MUTED }}>
                  {importResult.inserted} record{importResult.inserted !== 1 ? "s" : ""} imported successfully
                  {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
                </p>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: "#dc2626" }}>Skipped Rows:</p>
                  <div className="max-h-[180px] overflow-y-auto border rounded-xl" style={{ borderColor: BORDER }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: LIGHT }}>
                          <th className="px-3 py-2 text-left">Row</th>
                          <th className="px-3 py-2 text-left">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errors.slice(0, 20).map((err, idx) => (
                          <tr key={idx} className="border-t" style={{ borderColor: BORDER }}>
                            <td className="px-3 py-1.5">{err.row || idx + 1}</td>
                            <td className="px-3 py-1.5" style={{ color: "#dc2626" }}>{err.reason}</td>
                          </tr>
                        ))}
                        {importResult.errors.length > 20 && (
                          <tr>
                            <td colSpan={2} className="px-3 py-1.5 text-center" style={{ color: MUTED }}>
                              … and {importResult.errors.length - 20} more
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: NAVY }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   Export Modal — compact, with entity file-history dropdown
================================================================ */
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: BackupEntity | null;
  exportHistory: BackupRecord[]; // all export logs
  onConfirm: (entity: BackupEntity, format: ExportFormat) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, entity, exportHistory, onConfirm }) => {
  const [format, setFormat] = useState<ExportFormat>("csv");
  // Which previously-exported file the user wants to re-download (optional filter)
  const [selectedLogId, setSelectedLogId] = useState<string>("");

  if (!isOpen || !entity) return null;

  const ec = entityCfg(entity);

  // Export logs for this entity
  const entityExportLogs = exportHistory.filter(
    (r) => r.entity === entity && r.operation === "export" && r.status === "completed" && r.filename
  );

  const handleConfirm = () => {
    onConfirm(entity, format);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: ec?.color || NAVY }}>
              {ec?.icon}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: NAVY }}>Export {ec?.label}</p>
              <p className="text-[11px]" style={{ color: MUTED }}>Choose format & download</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="h-4 w-4" style={{ color: MUTED }} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Format selector */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: MUTED }}>Format</p>
            <div className="grid grid-cols-4 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className="py-2.5 rounded-xl border text-center transition-all"
                  style={
                    format === f.value
                      ? { borderColor: ORANGE, background: `${ORANGE}10`, color: ORANGE }
                      : { borderColor: BORDER, color: MUTED }
                  }
                >
                  <div className="text-xs font-bold">{f.label}</div>
                  <div className="text-[10px] opacity-70 hidden sm:block">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Previously exported files dropdown */}
          {entityExportLogs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: MUTED }}>
                Previous Exports (for reference)
              </p>
              <select
                value={selectedLogId}
                onChange={(e) => setSelectedLogId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{ borderColor: BORDER, color: NAVY }}
              >
                <option value="">— Latest data (live) —</option>
                {entityExportLogs.slice(0, 15).map((rec) => (
                  <option key={rec.id} value={String(rec.id)}>
                    {rec.filename} · {rec.success_records} rows · {fmtDate(rec.created_at)}
                  </option>
                ))}
              </select>
              <p className="text-[10px] mt-1" style={{ color: MUTED }}>
                Export always pulls live data from the database
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border text-sm font-semibold"
              style={{ borderColor: BORDER, color: MUTED }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background: ORANGE }}
            >
              <Download className="h-4 w-4" />
              Export {format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   Main Page
================================================================ */
const ImportExportPage: React.FC = () => {
  const [tab, setTab]           = useState<"import" | "export">("import");
  const [importEntity, setImportEntity] = useState<BackupEntity>("leads");
  const [exporting, setExporting]       = useState<BackupEntity | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportEntity, setSelectedExportEntity] = useState<BackupEntity | null>(null);
  const [history, setHistory]   = useState<BackupRecord[]>([]);
  const [allHistory, setAllHistory] = useState<BackupRecord[]>([]); // for modal dropdowns
  const [stats, setStats]       = useState<BackupStats | null>(null);
  const [histLoading, setHistLoading] = useState(true);
  const [fOp, setFOp]           = useState("");
  const [fEntity, setFEntity]   = useState("");
  const [fStatus, setFStatus]   = useState("");
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { loadStats(); loadAllHistory(); }, []);
  useEffect(() => { loadHistory(); }, [fOp, fEntity, fStatus, page]);

  const loadStats = async () => {
    try { setStats(await backupAPI.getStats()); } catch (_) {}
  };

  // Load ALL history (unpaginated, max 200) for modal dropdowns
  const loadAllHistory = async () => {
    try {
      const r = await backupAPI.getHistory({ limit: 200 });
      setAllHistory(r.records);
    } catch (_) {}
  };

  const loadHistory = async () => {
    setHistLoading(true);
    try {
      const p: any = { page, limit: 10 };
      if (fOp)     p.operation = fOp;
      if (fEntity) p.entity    = fEntity;
      if (fStatus) p.status    = fStatus;
      const r = await backupAPI.getHistory(p);
      setHistory(r.records);
      setTotalPages(r.total_pages);
    } catch { setHistory([]); }
    finally { setHistLoading(false); }
  };

  const handleImportComplete = () => { loadHistory(); loadStats(); loadAllHistory(); };

  const handleOpenExportModal = (entity: BackupEntity) => {
    setSelectedExportEntity(entity);
    setShowExportModal(true);
  };

  const confirmExport = async (entity: BackupEntity, format: ExportFormat) => {
    setExporting(entity);
    try {
      await backupAPI.reExportData(entity, format);
      toast.success(`${entity} exported as ${format.toUpperCase()}`);
      loadHistory();
      loadStats();
      loadAllHistory();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Export failed");
    } finally {
      setExporting(null);
      setSelectedExportEntity(null);
    }
  };

  const doDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    try {
      await backupAPI.deleteHistory(id);
      toast.success("Deleted");
      loadHistory();
      loadStats();
      loadAllHistory();
    } catch { toast.error("Delete failed"); }
  };

  const entityLabel = ENTITIES.find((e) => e.value === importEntity)?.label || importEntity;

  return (
    <div className="min-h-screen p-3 sm:p-5 space-y-4" style={{ background: LIGHT }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>
            Import & Export
          </h1>
          <p className="text-xs mt-0.5 hidden sm:block" style={{ color: MUTED }}>
            Import data · Export any module · Full history tracked
          </p>
        </div>
        <button
          onClick={() => { loadHistory(); loadStats(); loadAllHistory(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border"
          style={{ borderColor: BORDER, color: MUTED }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* ── Compact Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Imports"       value={stats?.totalImports          ?? 0} icon={<Upload      className="h-3.5 w-3.5" />} color={NAVY}      />
        <StatCard label="Exports"       value={stats?.totalExports          ?? 0} icon={<Download    className="h-3.5 w-3.5" />} color={ORANGE}    />
        <StatCard label="Failed"        value={stats?.recentFailed          ?? 0} icon={<AlertCircle className="h-3.5 w-3.5" />} color="#dc2626"   />
        <StatCard label="Records"       value={stats?.totalRecordsProcessed ?? 0} icon={<TrendingUp  className="h-3.5 w-3.5" />} color="#0891b2"   />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: BORDER }}>
        {(["import", "export"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={tab === t ? { background: NAVY, color: "white" } : { background: "transparent", color: MUTED }}
          >
            {t === "import" ? <Upload className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            {t === "import" ? "Import" : "Export"}
          </button>
        ))}
      </div>

      {/* ══ IMPORT PANEL ══ */}
      {tab === "import" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-3 bg-white rounded-2xl border p-4 space-y-4" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: NAVY }}>
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: NAVY }}>Import Data</h2>
                <p className="text-[11px]" style={{ color: MUTED }}>CSV · Excel · max 50 MB</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: MUTED }}>
                Select Module
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ENTITIES.map((e) => {
                  const active = importEntity === e.value;
                  return (
                    <button
                      key={e.value}
                      onClick={() => setImportEntity(e.value)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={
                        active
                          ? { borderColor: e.color, background: `${e.color}18`, color: e.color }
                          : { borderColor: BORDER, background: "white", color: MUTED }
                      }
                    >
                      <span style={{ color: active ? e.color : MUTED }}>{e.icon}</span>
                      {e.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowImportModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
              style={{ background: NAVY }}
            >
              <Upload className="h-4 w-4" /> Import {entityLabel} Data
            </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border p-4" style={{ borderColor: BORDER }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: MUTED }}>How it works</p>
            <div className="space-y-2">
              {[
                { n: "1", t: "Select module", b: "Choose which table to import into." },
                { n: "2", t: "Upload file",   b: "CSV or Excel. We auto-detect columns." },
                { n: "3", t: "Map columns",   b: "Match your columns to DB fields." },
                { n: "4", t: "Preview & Import", b: "Review and confirm." },
              ].map((tip) => (
                <div key={tip.n} className="flex gap-2.5 p-2.5 rounded-xl" style={{ background: LIGHT }}>
                  <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0" style={{ background: ORANGE }}>
                    {tip.n}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: NAVY }}>{tip.t}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: MUTED }}>{tip.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ EXPORT PANEL ══ */}
      {tab === "export" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ENTITIES.map((e) => {
              const busy = exporting === e.value;
              return (
                <div
                  key={e.value}
                  className="bg-white rounded-2xl border p-3 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderColor: BORDER }}
                  onClick={() => !busy && handleOpenExportModal(e.value)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: e.color }}>
                      {e.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: NAVY }}>{e.label}</p>
                      <p className="text-[11px]" style={{ color: MUTED }}>
                        {allHistory.filter((r) => r.entity === e.value && r.operation === "export" && r.status === "completed").length} exports
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: busy ? MUTED : e.color }}
                  >
                    {busy ? (
                      <><RefreshCw className="h-3 w-3 animate-spin" /> Exporting…</>
                    ) : (
                      <><Download className="h-3 w-3" /> Export</>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px]" style={{ color: MUTED }}>* Click a card to choose format and download live data.</p>
        </div>
      )}

      {/* ══ HISTORY TABLE ══ */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b" style={{ borderColor: BORDER }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: NAVY }}>History</h3>
            <p className="text-[11px]" style={{ color: MUTED }}>All imports & exports</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { val: fOp,     set: (v: string) => { setFOp(v);     setPage(1); }, opts: [["", "All Ops"],     ["import", "Import"],     ["export", "Export"]]                                                   },
              { val: fEntity, set: (v: string) => { setFEntity(v); setPage(1); }, opts: [["", "All Modules"], ...ENTITIES.map((e) => [e.value, e.label])]                                                       },
              { val: fStatus, set: (v: string) => { setFStatus(v); setPage(1); }, opts: [["", "All Status"],  ["completed", "Completed"], ["processing", "Processing"], ["failed", "Failed"]]                   },
            ].map((s, i) => (
              <select
                key={i}
                value={s.val}
                onChange={(e) => s.set(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border font-medium outline-none"
                style={{ borderColor: BORDER, color: NAVY, background: LIGHT }}
              >
                {s.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr style={{ background: LIGHT }}>
                {["Op", "Module", "File", "Fmt", "Records", "Size", "Status", "Date", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: MUTED }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {histLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-sm" style={{ color: MUTED }}>
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1" style={{ color: BORDER }} />
                    Loading…
                  </td>
                </tr>
              ) : !history.length ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-sm" style={{ color: MUTED }}>
                    No records yet
                  </td>
                </tr>
              ) : (
                history.map((rec) => {
                  const ec = entityCfg(rec.entity);
                  const sm = statusStyle(rec.status);
                  return (
                    <tr key={rec.id} className="border-t hover:bg-[#f8fafc] transition-colors" style={{ borderColor: "#f0f4f8" }}>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={
                            rec.operation === "import"
                              ? { background: `${NAVY}12`, color: NAVY }
                              : { background: `${ORANGE}12`, color: ORANGE }
                          }
                        >
                          {rec.operation === "import" ? <Upload className="h-2.5 w-2.5" /> : <Download className="h-2.5 w-2.5" />}
                          {rec.operation}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: ec?.color || NAVY }}>
                          {ec?.icon} {ec?.label || rec.entity}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 max-w-[130px]">
                        <p className="text-xs truncate" style={{ color: NAVY }}>{rec.filename || "—"}</p>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: LIGHT, color: NAVY }}>
                          {rec.file_format}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="font-bold" style={{ color: "#16a34a" }}>{rec.success_records}</span>
                        {rec.failed_records > 0 && (
                          <span className="ml-1 font-bold" style={{ color: "#dc2626" }}>/{rec.failed_records} err</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: MUTED }}>{fmtBytes(rec.file_size)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}
                        >
                          {sm.icon} {rec.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: MUTED }}>{fmtDate(rec.created_at)}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => doDelete(rec.id)} className="p-1 rounded-lg hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: BORDER }}>
            <p className="text-xs" style={{ color: MUTED }}>Page {page} of {totalPages}</p>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-40"
                style={{ borderColor: BORDER, color: NAVY }}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-40"
                style={{ borderColor: BORDER, color: NAVY }}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        entity={importEntity}
        entityLabel={entityLabel}
        onImportComplete={handleImportComplete}
        importHistory={allHistory}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => { setShowExportModal(false); setSelectedExportEntity(null); }}
        entity={selectedExportEntity}
        exportHistory={allHistory}
        onConfirm={confirmExport}
      />
    </div>
  );
};

export default ImportExportPage;