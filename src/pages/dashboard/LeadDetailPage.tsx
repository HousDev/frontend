// // src/pages/LeadDetailPage.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Phone, Mail, MapPin, User as UserIcon, ChevronDown, Calendar, Clock,
//   Users, UserPlus, ArrowLeftToLine, ArrowRightToLine, MessageSquare,
//   User, Pencil, Trash2,
//   NotebookPen
// } from "lucide-react";
// import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
// import { FaWhatsapp } from "react-icons/fa";
// import { HiArrowsRightLeft } from "react-icons/hi2";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";

// import { leadsAPI, usersAPI } from "@/lib/api";
// import { masterDataAPI } from "@/lib/mastersAPI";
// import { followupAPI } from "@/lib/followupAPI";
// import { notificationAPI } from "@/lib/notificationAPI";

// import FollowupModal, { FOLLOWUP_TYPES, FollowupForm } from "@/pages/dashboard/components/FollowupModal";
// import BuyerFormModal from "./components/BuyerFormModal";
// import AddLeadModal from "./components/AddLeadModal";
// import { useAuth } from "@/contexts/AuthContext";
// import SellerFormModal from "./components/SellerFormModel";

// import { can } from "@/utils/permission";

// /* ===================== Types ===================== */
// type UserRole = "admin" | "manager" | "agent" | "executive";

// interface AuthUser {
//   id?: string | number;
//   user_id?: string | number;
//   first_name?: string;
//   last_name?: string;
//   name?: string;
//   role?: string;
//   department?: string;
//   salutation?: string;
// }

// export interface Lead {
//   id: string;
//   salutation?: string;
//   name?: string;
//   phone?: string;
//   email?: string;
//   lead_type?: string;
//   lead_source?: string;
//   priority?: string;
//   whatsapp_number?: string;
//   state?: string;
//   city?: string;
//   location?: string;
//   status: string;
//   stage?: string;
//   assigned_executive?: string;
//   assigned_executive_name?: string;
//   created_at?: string;
//   created_by?: string;
//   last_contact?: string;
//   last_contacted_by?: string;
//   last_contacted_by_name?: string;
//   updated_by_name?: string;
//   created_by_name?: string;
//   updated_at?: string;
// }

// interface Followup {
//   priority: string;
//   id: string | number;
//   leadId: string | number;
//   type: string;
//   stage?: string;
//   status?: string;
//   remark?: string;
//   customRemark?: string;
//   nextAction?: string;
//   scheduledDate?: string | null;
//   completedDate?: string | null;
//   createdBy?: string;
//   createdAt?: string;
//   createdByFirstName?: string;
//   createdByLastName?: string;
//   updatedByFirstName?: string;
//   updatedByLastName?: string;
//   last_contacted_by?: string;
//   last_contacted_by_name?: string;
// }

// interface MasterOption {
//   value: string;
//   label: string;
//   role?: string;
// }

// interface MasterOptions {
//   salutation: MasterOption[];
//   leadType: MasterOption[];
//   leadSource: MasterOption[];
//   leadStatus: MasterOption[];
//   states: MasterOption[];
//   cities: MasterOption[];
//   locations: MasterOption[];
//   agents: MasterOption[];
// }

// interface PresalesUser {
//   id: string;
//   name: string;
//   department?: string;
//   role?: string;
//   selfOnly?: boolean;
//   salutation?: string;
// }

// interface NotificationData {
//   leadId: string;
//   userId: string;
//   message: string;
//   type: string;
//   link: string;
// }

// interface ApiResponse {
//   success?: boolean;
//   data?: any;
//   items?: any[];
//   payload?: any[];
//   result?: any[];
// }

// const getLatestFollowup = (arr?: Followup[] | null): Followup | null => (arr && arr.length ? arr[0] : null);

// const FOLLOWUP_COLOR_MAP: Record<
//   string,
//   { container: string; icon: string; leftBar: string; badge: string }
// > = {
//   blue: { container: "bg-blue-50 border-blue-200 hover:bg-blue-50", icon: "text-blue-600", leftBar: "border-blue-400", badge: "bg-blue-100 text-blue-800 border-blue-200" },
//   green: { container: "bg-green-50 border-green-200 hover:bg-green-50", icon: "text-green-600", leftBar: "border-green-400", badge: "bg-green-100 text-green-800 border-green-200" },
//   indigo: { container: "bg-indigo-50 border-indigo-200 hover:bg-indigo-50", icon: "text-indigo-600", leftBar: "border-indigo-400", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
//   orange: { container: "bg-orange-50 border-orange-200 hover:bg-orange-50", icon: "text-orange-600", leftBar: "border-orange-400", badge: "bg-orange-100 text-orange-800 border-orange-200" },
//   purple: { container: "bg-purple-50 border-purple-200 hover:bg-purple-50", icon: "text-purple-600", leftBar: "border-purple-400", badge: "bg-purple-100 text-purple-800 border-purple-200" },
//   gray: { container: "bg-gray-50 border-gray-200 hover:bg-gray-50", icon: "text-gray-600", leftBar: "border-gray-400", badge: "bg-gray-100 text-gray-800 border-gray-200" },
// };

// // Helper function to normalize strings for comparison
// const normalizeString = (str: any): string => {
//   return (str ?? "").toString().trim().toLowerCase().replace(/[\s-_/]+/g, "");
// };

// // Role-based executive assignment helper - FIXED VERSION
// const getAssignableExecutives = (user: any, presalesUsers: any[]) => {
//   const norm = (s: any) =>
//     (s ?? "")
//       .toString()
//       .trim()
//       .toLowerCase()
//       .replace(/[\s-_/]+/g, "");

//   const role = norm(user?.role);
//   const dept = norm(user?.department);

//   const toExecutive = (u: any) => ({
//     id: u.id ?? u.user_id ?? u._id,
//     name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "Executive",
//     department: u.department,
//     role: u.role,
//     selfOnly: false,
//     salutation: u.salutation || "",
//   });

//   // Presales Executive - can only assign to themselves
//   if (role === "executive" && (dept === "presales" || dept === "presale")) {
//     const selfExecutive = {
//       ...toExecutive(user),
//       selfOnly: true,
//       name: `${(user as AuthUser)?.salutation ? (user as AuthUser).salutation + " " : ""}${(user as AuthUser)?.first_name || (user as AuthUser)?.name || "You"}${(user as AuthUser)?.last_name ? " " + (user as AuthUser).last_name : ""} (Self)`,
//     };
//     return [selfExecutive];
//   }

//   // Presales Manager - can assign to all presales executives
//   if (role === "manager" && (dept === "presales" || dept === "presale")) {
//     return presalesUsers.map(toExecutive);
//   }

//   // Admin - can assign to all presales executives
//   if (role === "admin") {
//     return presalesUsers.map(toExecutive);
//   }

//   // Default - allow self-assignment for other roles
//   const selfExecutive = {
//     ...toExecutive(user),
//     selfOnly: true,
//     name: `${(user as AuthUser)?.salutation ? (user as AuthUser).salutation + " " : ""}${(user as AuthUser)?.first_name || (user as AuthUser)?.name || "You"}${(user as AuthUser)?.last_name ? " " + (user as AuthUser).last_name : ""} (Self)`,
//   };
//   return [selfExecutive];
// };

// // Get filtered leads based on user role and assignment
// const getFilteredLeads = (allLeads: Lead[], user: AuthUser | null): Lead[] => {
//   if (!user) return allLeads;

//   const userRole = normalizeString(user.role);
//   const userId = user.id || user.user_id;

//   // Admin and Manager can see all leads
//   if (userRole === "admin" || userRole === "manager") {
//     return allLeads;
//   }

//   // Executive can only see leads assigned to them
//   if (userRole === "executive") {
//     return allLeads.filter(lead =>
//       lead.assigned_executive && String(lead.assigned_executive) === String(userId)
//     );
//   }

//   // Default: return all leads for other roles
//   return allLeads;
// };

// // Safe user fetch function with role-based permissions
// const fetchUsersSafely = async (user: AuthUser | null): Promise<any[]> => {
//   const userRole = normalizeString(user?.role);
//   const userDept = normalizeString(user?.department);

//   // Only admin, manager, and presales managers can fetch all users
//   if (userRole === "admin" ||
//     userRole === "manager" ||
//     (userRole === "manager" && (userDept === "presales" || userDept === "presale"))) {
//     try {
//       const resp = await usersAPI.getAllUsers?.();
//       const raw = resp?.data ?? resp?.items ?? resp ?? [];
//       return Array.isArray(raw) ? raw : [];
//     } catch (error: any) {
//       console.warn("User fetch failed (may be permission issue):", error);
//       // Don't throw error, just return empty array
//       return [];
//     }
//   }

//   // For executives and other roles, return empty array
//   return [];
// };

// const LeadDetailPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   // const { user } = useAuth() as { user: AuthUser | null };
//     const { user } = useAuth();

//   // ---------- Permissions ----------
//   const canReadLeads = can(user, "lead.read");
//   const canUpdateLeads = can(user, "lead.update");
//   const canDeleteLeads = can(user, "lead.delete");
//   const canAssignLeads = can(user, "lead.assign");

//   const canViewFollowups = can(user, "followup.read");
//   const canCreateFollowups = can(user, "followup.create");
//   const canUpdateFollowups = can(user, "followup.update");
//   const canDeleteFollowups = can(user, "followup.delete");

//   const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
//   const [lead, setLead] = useState<Lead | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const [allLeads, setAllLeads] = useState<Lead[]>([]);
//   const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
//   const [currentLeadIndex, setCurrentLeadIndex] = useState<number>(0);

//   const [showTransferOptions, setShowTransferOptions] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   const [followups, setFollowups] = useState<Followup[]>([]);
//   const [followupsLoading, setFollowupsLoading] = useState(false);
//   const [followupsError, setFollowupsError] = useState<string | null>(null);

//   const [masterOptions, setMasterOptions] = useState<MasterOptions>({
//     salutation: [],
//     leadType: [],
//     leadSource: [],
//     leadStatus: [],
//     states: [],
//     cities: [],
//     locations: [],
//     agents: [],
//   });

//   const [presalesUsers, setPreSalesUsers] = useState<PresalesUser[]>([]);
//   const [execsLoading, setExecsLoading] = useState<boolean>(true);
//   const [showExecDropdown, setShowExecDropdown] = useState(false);

//   const [showBuyerComponent, setShowBuyerComponent] = useState(false);
//   const [showSellerComponent, setShowSellerComponent] = useState(false);
//   const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);

//   /* ===================== Access check early return ===================== */
//   useEffect(() => {
//     if (!canReadLeads) {
//       // no toast here — UI will show Access Denied
//       setLoading(false);
//     }
//   }, [canReadLeads]);

//   /* ===================== Fetch Presales Executives Safely ===================== */
//   useEffect(() => {
//     let mounted = true;
//     const fetchExecs = async () => {
//       try {
//         setExecsLoading(true);

//         // Use safe user fetch function
//         const allUsers = await fetchUsersSafely(user);
//         if (!mounted) return;

//         // Get only PRESALES executives
//         const presalesExecs: PresalesUser[] = allUsers
//           .filter((u: any) => {
//             const role = normalizeString(u?.role);
//             const dept = normalizeString(u?.department);
//             return role === "executive" &&
//               (dept === "presales" || dept === "presale");
//           })
//           .map((u: any) => ({
//             id: String(u.id ?? u.user_id ?? u._id ?? ""),
//             name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "Executive",
//             department: u.department,
//             role: u.role,
//             salutation: u.salutation || "",
//           }));

//         setPreSalesUsers(presalesExecs);
//       } catch (err) {
//         console.error("Failed to load presales executives:", err);
//         setPreSalesUsers([]);
//       } finally {
//         setExecsLoading(false);
//       }
//     };

//     fetchExecs();
//     return () => {
//       mounted = false;
//     };
//   }, [user]); // Add user as dependency

//   /* ===================== Filter leads based on user role ===================== */
//   useEffect(() => {
//     const filtered = getFilteredLeads(allLeads, user);
//     setFilteredLeads(filtered);

//     // Update current index when filtered leads change
//     if (lead && filtered.length > 0) {
//       const index = filtered.findIndex((l: Lead) => String(l.id) === String(lead.id));
//       setCurrentLeadIndex(index >= 0 ? index : 0);
//     }
//   }, [allLeads, user, lead]);

//   /* ===================== Assignable executives based on role ===================== */
//   const assignableExecs = useMemo(() => {
//     return getAssignableExecutives(user, presalesUsers);
//   }, [user, presalesUsers]);

//   /* ===================== Resolve assigned exec name reliably ===================== */
//   const getAssignedExecName = (): string => {
//     if (!lead) return "Unassigned";

//     // If we already have a name, use it
//     if (lead.assigned_executive_name && lead.assigned_executive_name !== "Unassigned") {
//       return lead.assigned_executive_name;
//     }

//     // Try to find in presales users
//     if (lead.assigned_executive && presalesUsers.length > 0) {
//       const exec = presalesUsers.find((u) => String(u.id) === String(lead.assigned_executive));
//       if (exec) {
//         return exec.name;
//       }
//     }

//     // Check if current user is assigned to themselves
//     const currentUserId = user?.id ?? (user as AuthUser)?.user_id;
//     if (
//       lead.assigned_executive &&
//       String(lead.assigned_executive) === String(currentUserId)
//     ) {
//       return `${(user as AuthUser)?.salutation ? (user as AuthUser).salutation + " " : ""}${(user as AuthUser)?.first_name || (user as AuthUser)?.name || "You"}${(user as AuthUser)?.last_name ? " " + (user as AuthUser).last_name : ""} (Self)`;
//     }

//     return "Unassigned";
//   };

//   /* ===================== Handle outside click for transfer popup ===================== */
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowTransferOptions(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   /* ===================== Followups ===================== */
//   const fetchFollowups = async (leadIdParam?: string): Promise<Followup[]> => {
//     if (!canViewFollowups) {
//       setFollowups([]);
//       setFollowupsError("You do not have permission to view follow-ups");
//       setFollowupsLoading(false);
//       return [];
//     }

//     const leadToUse = leadIdParam ?? id;
//     if (!leadToUse) {
//       setFollowups([]);
//       setFollowupsError(null);
//       setFollowupsLoading(false);
//       return [];
//     }
//     try {
//       setFollowupsLoading(true);
//       setFollowupsError(null);
//       const response = await followupAPI.getFollowupsByLeadId(leadToUse);

//       let followupsData: Followup[] = [];
//       if (Array.isArray(response?.data)) followupsData = response.data;
//       else if (Array.isArray(response)) followupsData = response;
//       else if (Array.isArray(response?.Payload)) followupsData = response.Payload;
//       else if (Array.isArray(response?.result)) followupsData = response.result;

//       followupsData = (followupsData || []).map((f: any) => ({
//         id: f.id || f._id || f.followup_id || "",
//         leadId: f.leadId || f.lead_id || leadToUse,
//         type: f.type || f.followupType || "general",
//         stage: f.stage || f.leadStage || "",
//         status: f.status || f.leadStatus || "",
//         remark: f.remark || "",
//         customRemark: f.customRemark || f.custom_remark || "",
//         nextAction: f.nextAction || f.next_action || "",
//         scheduledDate: f.scheduledDate || f.scheduled_date || f.schedule || f.createdAt || f.created_at || null,
//         createdAt: f.createdAt || f.created_at || null,
//         priority: f.priority || "Medium",
//         createdByFirstName: f.createdByFirstName || f.created_by_first_name || f.created_first_name || "",
//         createdByLastName: f.createdByLastName || f.created_by_last_name || f.created_last_name || "",
//         ...f,
//       }));

//       // latest first
//       followupsData.sort((a, b) => {
//         const da = new Date(a.scheduledDate || a.createdAt || 0).getTime();
//         const db = new Date(b.scheduledDate || b.createdAt || 0).getTime();
//         if (db !== da) return db - da;
//         if (a.id && b.id) return a.id > b.id ? -1 : 1;
//         return 0;
//       });

//       setFollowups(followupsData);
//       return followupsData;
//     } catch (e: any) {
//       console.error("Error fetching followups:", e);
//       const status = e?.response?.status || e?.status;
//       if (status === 404 || status === 204) {
//         setFollowups([]);
//         setFollowupsError(null);
//         return [];
//       } else {
//         toast.error("Failed to fetch follow-ups");
//         setFollowupsError("Failed to fetch follow-ups");
//         setFollowups([]);
//         return [];
//       }
//     } finally {
//       setFollowupsLoading(false);
//     }
//   };

//   // Fetch followups when component mounts or id changes
//   useEffect(() => {
//     if (id) {
//       fetchFollowups();
//     }
//   }, [id, canViewFollowups]);

//   /* ===================== Fetch Lead + Master Data ===================== */
//   useEffect(() => {
//     const fetchLead = async () => {
//       try {
//         setLoading(true);

//         if (!canReadLeads) {
//           setError("You do not have permission to view this lead.");
//           setLoading(false);
//           return;
//         }

//         if (id) {
//           const [response, allLeadsResponse] = await Promise.all([
//             leadsAPI.getLead(id),
//             leadsAPI.getLeads(),
//           ]);

//           if (allLeadsResponse?.success && allLeadsResponse.data) {
//             const leadsData: Lead[] = Array.isArray(allLeadsResponse.data)
//               ? allLeadsResponse.data.map((l: any) => ({
//                 ...l,
//                 id: String(l.id || l._id || "")
//               }))
//               : [];
//             setAllLeads(leadsData);
//           }

//           const data = response?.data ?? response;
//           if (!data) {
//             setError("No lead data returned");
//             return;
//           }

//           const resolveExecName = (execId: any): string | null => {
//             if (!execId) return null;
//             const found = presalesUsers.find((u) => String(u.id) === String(execId));
//             return found?.name ?? null;
//           };

//           const execName =
//             data.assigned_executive_name ||
//             resolveExecName(data.assigned_executive) ||
//             "Unassigned";

//           const createdByName =
//             data.created_by_name ||
//             `${data.created_first_name || data.createdByFirstName || ""} ${data.created_last_name || data.createdByLastName || ""}`.trim() ||
//             "System";

//           const updatedByName =
//             data.updated_by_name ||
//             `${data.updated_first_name || data.updatedByFirstName || ""} ${data.updated_last_name || data.updatedByLastName || ""}`.trim() ||
//             "System";

//           const lastContactedByName =
//             data.last_contacted_by_name || data.updated_by_name || null;

//           const leadData: Lead = {
//             id: String(data.id || data._id || ""),
//             salutation: data.salutation || "",
//             name: data.name || "",
//             phone: data.phone || "",
//             email: data.email || "",
//             lead_type: data.lead_type || data.leadType || "",
//             lead_source: data.lead_source || data.leadSource || "",
//             whatsapp_number: data.whatsapp_number || data.whatsapp || "",
//             state: data.state || "",
//             city: data.city || "",
//             location: data.location || "",
//             status: data.status || "New",
//             assigned_executive: data.assigned_executive ? String(data.assigned_executive) : "",
//             assigned_executive_name: execName || "Unassigned",
//             created_at: data.created_at || new Date().toISOString(),
//             updated_at: data.updated_at || new Date().toISOString(),
//             priority: data.priority || " -",
//             stage: data.stage || "-",
//             created_by: data.created_by || data.createdBy || "System",
//             last_contact: data.last_contact || data.lastContact || "",
//             last_contacted_by: data.last_contacted_by || data.last_contact_by || data.lastContactedBy || "",
//             last_contacted_by_name: lastContactedByName || undefined,
//             created_by_name: createdByName,
//             updated_by_name: updatedByName,
//           };

//           setLead(leadData);
//         }
//       } catch (err) {
//         console.error("Error fetching lead details:", err);
//         toast.error("Error fetching lead details");
//         setError("Failed to fetch lead details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchMasters = async () => {
//       try {
//         setError(null);

//         const [leadMasterTypes, commonMasterTypes] = await Promise.all([
//           masterDataAPI.getAllMasterTypes("lead"),
//           masterDataAPI.getAllMasterTypes("common"),
//         ]);

//         const allMasterTypes = [...leadMasterTypes, ...commonMasterTypes];

//         const masterValues = await Promise.all(
//           allMasterTypes.map(async (masterType: any) => {
//             try {
//               const values = await masterDataAPI.getMasterValues(masterType.id);
//               return values;
//             } catch {
//               return [];
//             }
//           })
//         );

//         const organizedData: Record<string, MasterOption[]> = {};
//         allMasterTypes.forEach((masterType: any, index: number) => {
//           const values = masterValues[index] || [];
//           const normalizedName = (masterType.name || "").toLowerCase().trim();
//           organizedData[normalizedName] = values.map((item: any) => ({
//             value: item.value,
//             label: item.value || item.name || "Unknown",
//             role: item.role || "Agent",
//           }));
//         });

//         const agentData = organizedData["agent"] || organizedData["agents"] || [];
//         setMasterOptions((prev) => ({
//           ...prev,
//           salutation: organizedData["salutation"] || organizedData["salutations"] || [],
//           leadType: organizedData["lead type"] || organizedData["leadtype"] || organizedData["lead_type"] || [],
//           leadSource: organizedData["lead source"] || organizedData["leadsource"] || organizedData["lead_source"] || [],
//           leadStatus: organizedData["lead status"] || organizedData["leadstatus"] || organizedData["lead_status"] || organizedData["status"] || [],
//           states: organizedData["state"] || organizedData["states"] || [],
//           cities: organizedData["city"] || organizedData["cities"] || [],
//           locations: organizedData["location"] || organizedData["locations"] || [],
//           agents: agentData.map((item) => ({
//             value: item.value,
//             label: item.label,
//             role: item.role || "Agent",
//           })),
//         }));
//       } catch (err: any) {
//         console.error("Failed to load master data:", err);
//         setError(`Failed to load dropdown options`);
//       }
//     };

//     // Load masters immediately; load lead after we at least started execs
//     fetchMasters();
//     fetchLead();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, execsLoading, canReadLeads]);

//   // When presalesUsers arrives later, resolve assigned name (no page refresh needed)
//   useEffect(() => {
//     if (lead?.assigned_executive && presalesUsers.length > 0) {
//       const exec = presalesUsers.find((u) => String(u.id) === String(lead.assigned_executive));
//       if (exec) {
//         setLead((prev) =>
//           prev
//             ? {
//               ...prev,
//               assigned_executive_name: exec.name,
//             }
//             : prev
//         );
//       }
//     }
//   }, [presalesUsers, lead?.assigned_executive]);

//   /* ===================== Edit / Delete ===================== */
//   const handleDelete = async () => {
//     if (!id) return;
//     if (!canDeleteLeads) {
//       toast.error("You do not have permission to delete leads");
//       return;
//     }
//     if (confirm("Are you sure you want to delete this lead?")) {
//       try {
//         const response = await leadsAPI.deleteLead(id);
//         if (response.success) {
//           toast.success("Lead deleted ✅");
//           navigate("/dashboard/leads");
//         } else {
//           toast.error("Failed to delete lead ❌");
//         }
//       } catch (err) {
//         console.error("Error deleting lead:", err);
//         toast.error("Error deleting lead");
//       }
//     }
//   };

//   /* ===================== Exec Assignment + Notification ===================== */
//   const handleExecAssign = async (execId: string, execName: string) => {
//     if (!lead) return;
//     if (!canAssignLeads) {
//       toast.error("You do not have permission to assign leads");
//       return;
//     }

//     try {
//       const prevExec = lead.assigned_executive || "";

//       // optimistic UI
//       setLead({ ...lead, assigned_executive: execId, assigned_executive_name: execName });
//       setShowExecDropdown(false);

//       // update lead assignment on server
//       await leadsAPI.assignToExecutive(lead.id, { assigned_executive: execId });

//       // if changed → create notification for new assignee
//       if (execId && execId !== prevExec) {
//         try {
//           await notificationAPI.createNotification({
//             leadId: String(lead.id),
//             userId: String(execId),
//             message: `Lead assigned to ${execName}`,
//             type: "lead_assign",
//             link: `/dashboard/leads/${lead.id}`,
//           } as NotificationData);
//         } catch (notifErr: any) {
//           console.error("Notification error:", notifErr);
//           toast.warn("Lead assigned but notification failed");
//         }
//       }

//       toast.success(`Lead assigned to ${execName}`);
//     } catch (err) {
//       console.error("Error assigning executive:", err);
//       // rollback
//       setLead((prev) => (prev ? { ...prev, assigned_executive: lead.assigned_executive, assigned_executive_name: lead.assigned_executive_name } : prev));
//       toast.error("Failed to assign. Please try again.");
//     }
//   };

//   /* ===================== Save lead (edit) + Notification if assignee changed ===================== */
//   const handleSaveLead = async (updatedLead: Lead | null) => {
//     if (!updatedLead) return;
//     if (!canUpdateLeads) {
//       toast.error("You do not have permission to update leads");
//       return;
//     }
//     try {
//       const prevExec = lead?.assigned_executive || "";
//       const newExec = updatedLead.assigned_executive || "";

//       const response = await leadsAPI.updateLead(updatedLead.id!, updatedLead);
//       const savedLead = response?.data || response;

//       setLead((prev) => ({ ...(prev || {} as Lead), ...savedLead }));
//       setAllLeads((prev) => prev.map((l) => (String(l.id) === String(savedLead.id) ? { ...l, ...savedLead } : l)));

//       if (newExec && newExec !== prevExec) {
//         const exec = presalesUsers.find((u) => String(u.id) === String(newExec));
//         const execName = exec?.name || savedLead.assigned_executive_name || "Executive";
//         try {
//           await notificationAPI.createNotification({
//             leadId: String(updatedLead.id),
//             userId: String(newExec),
//             message: `Lead updated and assigned to ${execName}`,
//             type: "lead_update",
//             link: `/dashboard/leads/${updatedLead.id}`,
//           } as NotificationData);
//         } catch (notifErr) {
//           console.error("Notification error:", notifErr);
//         }
//       }

//       setIsEditModalOpen(false);
//       toast.success("Lead details updated successfully!");
//     } catch (err) {
//       console.error("Error saving lead:", err);
//       toast.error("Failed to save lead. Please try again.");
//     }
//   };

//   /* ===================== Followup Save (+ notify assignee) ===================== */
//   const handleFollowupSave = async (data: FollowupForm & { lead_id?: string }) => {
//     if (!lead?.id) {
//       toast.error("Lead not loaded.");
//       return;
//     }

//     if (editingFollowup && !canUpdateFollowups) {
//       toast.error("You do not have permission to update follow-ups");
//       return;
//     }
//     if (!editingFollowup && !canCreateFollowups) {
//       toast.error("You do not have permission to create follow-ups");
//       return;
//     }

//     let saved: any = null;
//     const scheduledISO = data.scheduleDate ? `${data.scheduleDate}T${(data.scheduleTime || "00:00")}:00` : null;

//     const followupPayload = {
//       leadId: data.lead_id ?? lead.id,
//       type: data.followupType,
//       stage: data.leadStage,
//       status: data.leadStatus,
//       remark: data.remark,
//       customRemark: data.customRemark,
//       nextAction: data.nextAction,
//       scheduledDate: scheduledISO,
//       priority: data.priority,
//       updated_by: (user as AuthUser)?.id ?? (user as AuthUser)?.user_id,
//     };

//     try {
//       if (editingFollowup) {
//         await followupAPI.updateFollowup(String(editingFollowup.id), followupPayload);
//         saved = { ...editingFollowup, ...followupPayload, updatedAt: new Date().toISOString() };
//         setEditingFollowup(null);
//         setFollowups((prev) => prev.map((f) => (f.id === editingFollowup.id ? saved : f)));
//         toast.success("Follow-up updated successfully!");
//       } else {
//         const resp = await followupAPI.createFollowup(followupPayload);
//         const newId = resp?.data?.id || resp?.id || `temp-${Date.now()}`;
//         saved = {
//           id: newId,
//           leadId: followupPayload.leadId,
//           type: followupPayload.type,
//           stage: followupPayload.stage,
//           status: followupPayload.status,
//           remark: followupPayload.remark,
//           customRemark: followupPayload.customRemark,
//           nextAction: followupPayload.nextAction,
//           scheduledDate: scheduledISO,
//           createdAt: new Date().toISOString(),
//           priority: followupPayload.priority,
//           createdByFirstName: user?.first_name || "",
//           createdByLastName: user?.last_name || "",
//         };
//         setFollowups((prev) => [saved, ...prev]);
//         toast.success("Follow-up saved successfully!");
//       }
//     } catch (err) {
//       console.error("Error saving followup:", err);
//       toast.error(`Failed to ${editingFollowup ? "update" : "save"} follow-up. Please try again.`);
//       return;
//     }

//     // Update lead status/stage/priority (non-blocking)
//     try {
//       await leadsAPI.updateLead(lead.id, {
//         stage: data.leadStage,
//         status: data.leadStatus,
//         priority: data.priority,
//         updated_by: (user as AuthUser)?.id ?? (user as AuthUser)?.user_id,
//       });
//       setLead((prev) =>
//         prev
//           ? {
//             ...prev,
//             stage: data.leadStage || prev.stage,
//             status: data.leadStatus || prev.status,
//             priority: data.priority,
//           }
//           : prev
//       );
//     } catch (err) {
//       console.error("Error updating lead:", err);
//     }

//     // Notify current assignee (non-blocking)
//     if (lead.assigned_executive && String(lead.assigned_executive).trim() !== "") {
//       try {
//         await notificationAPI.createNotification({
//           leadId: String(lead.id),
//           userId: String(lead.assigned_executive),
//           message: `New follow-up added for lead "${lead.name}" by ${user?.first_name || "User"}`,
//           type: "followup_add",
//           link: `/dashboard/leads/${lead.id}`,
//         } as NotificationData);
//       } catch (notifErr) {
//         console.error("Notification error:", notifErr);
//       }
//     }

//     setIsFollowupModalOpen(false);

//     // refresh followups for consistency
//     try {
//       await fetchFollowups();
//     } catch {
//       // ignore
//     }
//   };

//   /* ===================== Followup Edit/Delete Handlers ===================== */
//   const handleEditFollowup = (followup: Followup) => {
//     if (!canUpdateFollowups) {
//       toast.error("You do not have permission to edit follow-ups");
//       return;
//     }
//     setEditingFollowup(followup);
//     setIsFollowupModalOpen(true);
//   };

//   const handleDeleteFollowup = async (followupId: string | number) => {
//     if (!canDeleteFollowups) {
//       toast.error("You do not have permission to delete follow-ups");
//       return;
//     }
//     if (!confirm("Are you sure you want to delete this follow-up?")) return;

//     const prevFollowups = [...followups];
//     setFollowups((prev) => prev.filter((f) => f.id !== followupId));

//     try {
//       await followupAPI.deleteFollowup(String(followupId));
//       toast.success("Follow-up deleted successfully");
//     } catch (err) {
//       console.error("Error deleting followup:", err);
//       setFollowups(prevFollowups);
//       toast.error("Failed to delete follow-up");
//     }
//   };

//   /* ===================== Navigation Handlers ===================== */
//   const handlePreviousLead = () => {
//     if (filteredLeads.length === 0 || currentLeadIndex <= 0) return;
//     const prevIndex = currentLeadIndex - 1;
//     const prevLead = filteredLeads[prevIndex];
//     setCurrentLeadIndex(prevIndex);
//     navigate(`/dashboard/leads/${prevLead.id}`);
//   };

//   const handleNextLead = () => {
//     if (filteredLeads.length === 0 || currentLeadIndex >= filteredLeads.length - 1) return;
//     const nextIndex = currentLeadIndex + 1;
//     const nextLead = filteredLeads[nextIndex];
//     setCurrentLeadIndex(nextIndex);
//     navigate(`/dashboard/leads/${nextLead.id}`);
//   };

//   /* ===================== Other helpers / UI ===================== */
//   const formatDateTime = (dateString: string | null) => {
//     if (!dateString) return { date: "-", time: "-" };
//     try {
//       const date = new Date(dateString);
//       return {
//         date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
//         time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
//       };
//     } catch {
//       return { date: "-", time: "-" };
//     }
//   };

//   const shouldShowTransfer = (ld?: Lead | null, lf?: Followup | null): boolean => {
//     const lStage = (ld?.stage || "").trim().toLowerCase();
//     const lStatus = (ld?.status || "").trim().toLowerCase();
//     const fStage = (lf?.stage || "").trim().toLowerCase();
//     const fStatus = (lf?.status || "").trim().toLowerCase();
//     const isLeadOK = (lStage === "contacted" || lStage === "connected") && lStatus === "qualified";
//     const isFollowupOK = (fStage === "contacted" || fStage === "connected") && fStatus === "qualified";
//     return isLeadOK || isFollowupOK;
//   };

//   const getStatusColor = (status: string): string => {
//     switch (status?.toLowerCase()) {
//       case "contacted": return "bg-blue-100 text-blue-800 border-blue-200";
//       case "new": return "bg-purple-100 text-purple-800 border-purple-200";
//       case "qualified": return "bg-teal-100 text-teal-800 border-teal-200";
//       case "unqualified": return "bg-red-100 text-red-800 border-red-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getLeadTypeColor = (type: string): string => {
//     switch (type?.toLowerCase()) {
//       case "buyer-self": return "bg-green-100 text-green-800 border-green-200";
//       case "buyer inverstor": return "bg-indigo-100 text-indigo-800 border-indigo-200";
//       case "seller self": return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "seller inverstor": return "bg-red-100 text-red-800 border-red-200";
//       case "seller builder": return "bg-orange-100 text-orange-800 border-orange-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getPriorityColor = (priority: string): string => {
//     switch (priority?.toLowerCase()) {
//       case "high": return "bg-red-100 text-red-800 border-red-200";
//       case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "low": return "bg-green-100 text-green-800 border-green-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getStageColor = (stage: string): string => {
//     switch (stage?.toLowerCase()) {
//       case "attempting contact": return "bg-blue-100 text-blue-800 border-blue-200";
//       case "contacted": return "bg-purple-100 text-purple-800 border-purple-200";
//       case "converted to opportunity": return "bg-green-100 text-green-800 border-green-200";
//       case "disqualified": return "bg-red-100 text-red-800 border-red-200";
//       case "new": return "bg-gray-100 text-gray-800 border-gray-200";
//       case "nurturing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "qualified": return "bg-teal-100 text-teal-800 border-teal-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const latestFollowup = useMemo(() => getLatestFollowup(followups), [followups]);
//   const { date: createdDate, time: createdTime } = formatDateTime(lead?.created_at || null);
//   const { date: updatedDate, time: updatedTime } = formatDateTime(lead?.updated_at || null);
//   const { date: lastContactDate, time: lastContactTime } = formatDateTime(lead?.last_contact || "");

//   const handleBack = () => navigate("/dashboard/leads");
//   const handleEdit = () => {
//     if (!canUpdateLeads) {
//       toast.error("You do not have permission to edit leads");
//       return;
//     }
//     setIsEditModalOpen(true);
//   };
//   const handleCall = () => lead?.phone && window.open(`tel:${lead.phone}`, "_self");
//   const handleWhatsApp = () => lead?.whatsapp_number && window.open(`https://wa.me/${lead.whatsapp_number.replace(/\D/g, "")}`, "_blank");
//   const handleEmail = () => lead?.email && window.open(`mailto:${lead.email}`, "_self");
//   const handleScheduleMeeting = () =>
//     lead &&
//     window.open(
//       `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting+with+${encodeURIComponent(
//         lead.name || ""
//       )}&details=${encodeURIComponent(`Discuss lead ${lead.id}`)}&location=Online&dates=20240101T100000Z/20240101T110000Z`,
//       "_blank"
//     );

//   const typeIcon = (t: string) => {
//     const found = FOLLOWUP_TYPES.find((ft) => ft.value === t);
//     return found ? found.Icon : MessageSquare;
//   };

//   const followupCardClasses = (t: string) => {
//     const color = FOLLOWUP_TYPES.find((ft) => ft.value === t)?.color || "gray";
//     return FOLLOWUP_COLOR_MAP[color] || FOLLOWUP_COLOR_MAP.gray;
//   };

//   const formatDateShort = (iso?: string | null): string => {
//     if (!iso) return "-";
//     const d = new Date(iso);
//     const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
//     const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
//     return `${date} • ${time}`;
//   };

//   const getLeadHeaderGradient = (): string => {
//     const status = lead?.status?.toLowerCase() || "";
//     const stage = lead?.stage?.toLowerCase() || "";
//     const type = lead?.lead_type?.toLowerCase() || "";
//     const priority = lead?.priority?.toLowerCase() || "";
//     if (priority === "high") return "from-red-600 to-red-700";
//     if (priority === "low") return "from-green-600 to-green-700";
//     if (status === "qualified" || stage === "qualified") return "from-teal-600 to-teal-700";
//     if (status === "contacted" || stage === "contacted") return "from-purple-600 to-purple-700";
//     if (status === "unqualified" || stage === "disqualified") return "from-rose-600 to-rose-700";
//     if (type === "seller builder") return "from-orange-600 to-orange-700";
//     if (type === "buyer-self") return "from-green-600 to-green-700";
//     if (type === "buyer inverstor") return "from-indigo-600 to-indigo-700";
//     return "from-blue-600 to-indigo-700";
//   };

//   /* ===================== Render ===================== */
//   if (!canReadLeads) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
//         <div className="text-center p-6">
//           <div className="text-red-600 text-lg font-semibold mb-2">
//             Access Denied
//           </div>
//           <div className="text-gray-600 text-sm">
//             You do not have permission to view leads.
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">{error}</p>
//           <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
//         </div>
//       </div>
//     );
//   }
//   if (loading || !lead) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p>Loading lead details...</p>
//         </div>
//       </div>
//     );
//   }

//   const tabId = "lead";
//   const leadId = id || "";

//   return (
//     <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
//         {/* Main Lead Profile Card */}
//         <div className="xl:col-span-2 bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-gray-100 overflow-visible p-2">
//           <div className="mb-4 flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
//             <button onClick={handleBack} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-fit text-xs">
//               <FiArrowLeft className="h-3.5 w-3.5" />
//               <span>Back to Leads</span>
//             </button>

//             <div className="grid grid-cols-4 gap-2">
//               <button onClick={handleEdit} className={`flex items-center justify-center gap-1 px-2 py-1 text-xs border ${canUpdateLeads ? "border-gray-300 hover:bg-gray-50 bg-white" : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"} rounded-md transition-colors`} disabled={!canUpdateLeads}>
//                 <FiEdit className="h-3.5 w-3.5" />
//                 <span className="hidden sm:inline">Edit</span>
//               </button>

//               <button onClick={handleDelete} className={`flex items-center justify-center gap-1 px-2 py-1 text-xs border rounded-md transition-colors ${canDeleteLeads ? "border-red-300 text-red-600 hover:bg-red-50 bg-white" : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"}`} disabled={!canDeleteLeads}>
//                 <FiTrash2 className="h-3.5 w-3.5" />
//                 <span className="hidden sm:inline">Delete</span>
//               </button>

//               <button
//                 onClick={handlePreviousLead}
//                 disabled={currentLeadIndex <= 0}
//                 className={`flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md transition-colors bg-white ${currentLeadIndex <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
//                 title={`Previous lead (${currentLeadIndex > 0 ? filteredLeads[currentLeadIndex - 1]?.name : "No more leads"})`}
//               >
//                 <ArrowLeftToLine className="w-4 h-4" />
//                 <span className="hidden sm:inline">Previous</span>
//               </button>

//               <button
//                 onClick={handleNextLead}
//                 disabled={currentLeadIndex >= filteredLeads.length - 1}
//                 className={`flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md transition-colors bg-white ${currentLeadIndex >= filteredLeads.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
//                 title={`Next lead (${currentLeadIndex < filteredLeads.length - 1 ? filteredLeads[currentLeadIndex + 1]?.name : "No more leads"})`}
//               >
//                 <span className="hidden sm:inline">Next</span>
//                 <ArrowRightToLine className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Header */}
//           <div className={`bg-gradient-to-r ${getLeadHeaderGradient()} px-3 py-3 sm:px-4 sm:py-4 text-white rounded-lg`}>
//             <div className="flex flex-wrap items-center justify-between gap-3">
//               <div className="flex items-center space-x-3 min-w-0">
//                 <div className="bg-white bg-opacity-20 p-2 rounded-full shadow-md">
//                   <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//                 </div>
//                 <div className="min-w-0">
//                   <h2 className="text-base sm:text-lg font-bold truncate">
//                     {lead.salutation} {lead.name}
//                   </h2>
//                   <div className="flex flex-wrap items-center gap-2 mt-1">
//                     <span className="text-xs sm:text-sm text-white text-opacity-80 truncate">Lead ID: {String(lead.id).slice(0, 4)}</span>
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border w-fit ${getLeadTypeColor(lead.lead_type || "")}`}>
//                       {lead.lead_type}
//                     </span>
//                     <span className="text-xs text-white text-opacity-80">
//                       ({currentLeadIndex + 1} of {filteredLeads.length})
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-wrap items-center gap-2 justify-end">
//                 <button
//                   onClick={() => {
//                     if (!canCreateFollowups) {
//                       toast.error("You do not have permission to create follow-ups");
//                       return;
//                     }
//                     setEditingFollowup(null);
//                     setIsFollowupModalOpen(true);
//                   }}
//                   className={`flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2.5 py-1.5 rounded-md shadow text-xs ${!canCreateFollowups ? "opacity-60 cursor-not-allowed" : ""}`}
//                   title="Add Follow-up"
//                 >
//                   <div className="p-1 rounded-md bg-[#ea8634]">
//                     <NotebookPen className="w-3.5 h-3.5 text-white" />
//                   </div>
//                   <span className="hidden sm:inline">Follow Up</span>
//                 </button>

//                 {/* Assign Executive dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={() => {
//                       if (!canAssignLeads) {
//                         toast.error("You do not have permission to assign leads");
//                         return;
//                       }
//                       if (!execsLoading) setShowExecDropdown((s) => !s);
//                     }}
//                     className={`flex items-center justify-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2.5 py-1.5 rounded-md shadow text-xs ${(!canAssignLeads || assignableExecs.length === 0) ? "opacity-60 cursor-not-allowed" : ""}`}
//                     title="Assign Lead"
//                     disabled={!canAssignLeads || execsLoading || assignableExecs.length === 0}
//                   >
//                     <UserPlus className="w-3.5 h-3.5" />
//                     <ChevronDown className="w-2.5 h-2.5" />
//                   </button>

//                   {showExecDropdown && canAssignLeads && (
//                     <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-10 text-xs">
//                       <div className="p-2">
//                         <div className="text-[10px] text-gray-500 uppercase tracking-wide px-2 py-1 border-b truncate">
//                           Assign to Presales Executive
//                         </div>

//                         {assignableExecs.length === 0 ? (
//                           <div className="px-2 py-2 text-xs text-gray-500">No presales executives available</div>
//                         ) : (
//                           assignableExecs.map((exec: PresalesUser) => (
//                             <button
//                               key={exec.id}
//                               onClick={() => handleExecAssign(String(exec.id), exec.name)}
//                               className={`w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-xs truncate ${String(lead.assigned_executive) === String(exec.id)
//                                 ? "bg-blue-50 text-blue-600 font-medium"
//                                 : "text-gray-800"
//                                 }`}
//                             >
//                               {exec.name}
//                             </button>
//                           ))
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Communication Buttons */}
//                 <div className="flex gap-2">
//                   <button onClick={handleCall} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition shadow" title="Call"><Phone className="w-4 h-4" /></button>
//                   <button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md transition shadow" title="WhatsApp"><FaWhatsapp className="w-4 h-4" /></button>
//                   <button onClick={handleEmail} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition shadow" title="Email"><Mail className="w-4 h-4" /></button>
//                   <button onClick={handleScheduleMeeting} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md transition shadow" title="Schedule Meeting"><Calendar className="w-4 h-4" /></button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="p-4 sm:p-6 pt-0 sm:pt-2">
//             {/* Contact & Location */}
//             <div className="flex flex-col md:flex-row gap-6 items-start">
//               <div className="w-full md:w-auto">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Details</h3>
//                 <div className="p-4 bg-gray-50 rounded-lg space-y-4 w-full md:w-fit">
//                   <div className="flex items-center space-x-3">
//                     <Phone className="w-4 h-4 text-gray-600 flex-shrink-0" />
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
//                       <p className="font-medium text-gray-800 text-sm break-all">{lead.phone}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <Mail className="w-4 h-4 text-gray-600 flex-shrink-0" />
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
//                       <p className="font-medium text-gray-800 text-sm break-all">{lead.email}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <FaWhatsapp className="w-4 h-4" />
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">WhatsApp</p>
//                       <p className="font-medium text-gray-800 text-sm break-all">{lead.whatsapp_number}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="w-full md:w-auto">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Location Details</h3>
//                 <div className="p-4 bg-gray-50 rounded-lg space-y-4 w-full md:w-fit">
//                   <div className="flex items-center space-x-3">
//                     <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
//                     <div>
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">State</p>
//                       <p className="font-medium text-gray-800 text-sm">{lead.state || "-"}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
//                     <div>
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">City</p>
//                       <p className="font-medium text-gray-800 text-sm">{lead.city || "-"}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
//                     <div>
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
//                       <p className="font-medium text-gray-800 text-sm">{lead.location || "-"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Classification */}
//             <div className="mt-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-3">Lead Classification</h3>
//               <div className="space-y-4">
//                 <div className="flex flex-wrap gap-3">
//                   <div className="flex items-center space-x-2">
//                     <span className="text-xs text-gray-500">Source:</span>
//                     <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
//                       {lead.lead_source}
//                     </span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-xs text-gray-500">Priority:</span>
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(lead.priority || "")}`}>
//                       {lead.priority || "-"}
//                     </span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-xs text-gray-500">Stage:</span>
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStageColor(lead.stage || "")}`}>
//                       {lead.stage || "-"}
//                     </span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-xs text-gray-500">Status:</span>
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)}`}>
//                       {lead.status}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap">
//                   <div className="flex items-start space-x-1 p-1 bg-gray-50 rounded-md">
//                     <Clock className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
//                     <div className="flex space-x-2">
//                       <div>
//                         <p className="text-[10px] text-gray-400 uppercase tracking-wide">Created</p>
//                         <p className="text-[11px] text-gray-700">{createdDate}</p>
//                         <p className="text-[11px] text-gray-700">{createdTime}</p>
//                       </div>
//                       <div>
//                         <p className="text-[10px] text-gray-400 uppercase tracking-wide">Updated</p>
//                         <p className="text-[11px] text-gray-700">{updatedDate}</p>
//                         <p className="text-[11px] text-gray-700">{updatedTime}</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-1 bg-gray-50 rounded-md">
//                     <p className="text-[10px] text-gray-400 uppercase tracking-wide">Created By</p>
//                     <p className="text-[11px] text-gray-700">{lead.created_by_name || "System"}</p>

//                     <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Updated By</p>
//                     <p className="text-[11px] text-gray-700">{lead.updated_by_name || "System"}</p>
//                   </div>

//                   <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
//                     <Clock className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
//                     <div>
//                       <p className="text-xs text-gray-500 uppercase tracking-wide">Last Contact</p>
//                       <p className="text-xs font-medium text-gray-800">{lastContactDate} {lastContactTime}</p>
//                       <div className="text-xs text-gray-500 mt-1">By: {lead.last_contacted_by_name || lead.last_contacted_by || lead.updated_by_name || lead.created_by_name || "-"}</div>
//                     </div>
//                   </div>

//                   <div className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
//                     <Users className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
//                     <div>
//                       <p className="text-xs text-green-600 uppercase tracking-wide">Assigned Executive</p>
//                       <p className="font-medium text-gray-800 text-xs">{getAssignedExecName()}</p>
//                     </div>
//                   </div>

//                   <div className="relative inline-block" ref={dropdownRef}>
//                     {shouldShowTransfer(lead, latestFollowup) && (
//                       <button onClick={() => setShowTransferOptions(!showTransferOptions)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700">
//                         <HiArrowsRightLeft className="w-4 h-4" />
//                         Transfer Lead
//                       </button>
//                     )}

//                     {showTransferOptions && (
//                       <div className="absolute top-0 left-full ml-2 w-40 rounded z-[9999]">
//                         <button className="px-2 py-1 text-white text-xs rounded bg-green-500 hover:bg-green-600" onClick={() => { setShowTransferOptions(false); setShowBuyerComponent(true); }}>
//                           Transfer to Buyer
//                         </button>
//                         <button className="px-2 py-1 text-white text-xs rounded bg-red-500 hover:bg-red-600" onClick={() => { setShowTransferOptions(false); setShowSellerComponent(true); }}>
//                           Transfer to Seller
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar – Follow-ups */}
//         <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-gray-100 p-4 space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-base font-semibold text-gray-800">Follow-ups TimeLine</h3>
//             <div className="flex gap-2"></div>
//           </div>

//           {followupsLoading && (<div className="text-xs text-gray-500">Loading follow-ups…</div>)}
//           {!followupsLoading && !id && (<div className="text-xs text-gray-500">No follow-up data — invalid lead.</div>)}
//           {!followupsLoading && id && followupsError && (<div className="text-xs text-red-600">{followupsError}</div>)}

//           {!followupsLoading && id && !followupsError && followups.length === 0 && (
//             <div className="flex flex-col items-center justify-center text-gray-500 py-8 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
//               <MessageSquare className="w-8 h-8 text-gray-400 mb-2" />
//               <p className="text-sm font-medium">No follow-ups yet</p>
//             </div>
//           )}

//           {!followupsLoading && !followupsError && followups.length > 0 && (
//             <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
//               {followups.map((f) => {
//                 const Ico = typeIcon(f.type);
//                 const scheduledLabel = formatDateShort(f.scheduledDate || f.createdAt || "");
//                 const color = followupCardClasses(f.type);
//                 return (
//                   <div key={f.id} className={`border rounded-lg p-3 transition ${color.container} border-l-4 ${color.leftBar}`}>
//                     <div className="flex gap-3">
//                       <div className="flex-shrink-0"><Ico className={`h-5 w-5 ${color.icon}`} /></div>
//                       <div className="flex-1 space-y-2 text-xs">
//                         <div className="flex items-center justify-between">
//                           <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${color.badge}`}>{f.type}</span>
//                           <div className="flex items-center gap-1">
//                             {canUpdateFollowups && (
//                               <button onClick={() => handleEditFollowup(f)} className="p-1 rounded hover:bg-gray-200 transition" title="Edit"><Pencil className="h-3.5 w-3.5 text-gray-600" /></button>
//                             )}
//                             {canDeleteFollowups && (
//                               <button onClick={() => handleDeleteFollowup(f.id)} className="p-1 rounded hover:bg-red-100 transition" title="Delete"><Trash2 className="h-3.5 w-3.5 text-red-600" /></button>
//                             )}
//                           </div>
//                         </div>

//                         <div className="flex flex-wrap items-center gap-2">
//                           <span className="font-medium text-gray-600">Lead Priority:</span>
//                           {(f.priority || lead.priority) && (
//                             <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getPriorityColor(f.priority || lead.priority || "")}`}>{f.priority || lead.priority}</span>
//                           )}

//                           <span className="font-medium text-gray-600">Lead Stage:</span>
//                           {f.stage && <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/70 text-gray-800 border border-gray-200">{f.stage}</span>}

//                           <span className="font-medium text-gray-600">Lead Status:</span>
//                           {f.status && <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/70 text-gray-800 border border-gray-200">{f.status}</span>}
//                         </div>

//                         <div className="text-gray-700"><span className="font-medium">Remark:</span> {f.customRemark || f.remark || "—"}</div>
//                         {f.nextAction && <div className="text-gray-700"><span className="font-medium">Next Action:</span> {f.nextAction}</div>}

//                         <div className="mt-2 flex justify-end text-gray-500">
//                           <div className="flex items-center gap-2">
//                             <div>{scheduledLabel}</div>
//                             <div className="flex items-center gap-1"><User className="h-3 w-3 text-gray-400" />{`${f.createdByFirstName || ""} ${f.createdByLastName || ""}`.trim() || "System"}</div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Follow-up Modal */}
//       <FollowupModal
//         isOpen={isFollowupModalOpen}
//         onClose={() => { setIsFollowupModalOpen(false); setEditingFollowup(null); }}
//         onSave={handleFollowupSave}
//         tabId={tabId}
//         leadId={leadId}
//         initialForm={
//           editingFollowup
//             ? {
//               id: editingFollowup.id,
//               followupType: editingFollowup.type,
//               leadStage: editingFollowup.stage || "",
//               leadStatus: editingFollowup.status || "",
//               remark: editingFollowup.remark || "",
//               customRemark: editingFollowup.customRemark || "",
//               nextAction: editingFollowup.nextAction || "",
//               scheduleDate: editingFollowup.scheduledDate ? new Date(editingFollowup.scheduledDate).toISOString().slice(0, 10) : "",
//               scheduleTime: editingFollowup.scheduledDate ? new Date(editingFollowup.scheduledDate).toTimeString().slice(0, 5) : "",
//               priority: editingFollowup.priority || lead.priority || "Medium",
//               lead_id: leadId,
//             }
//             : { priority: lead.priority || "Medium" }
//         }
//       />

//       {showBuyerComponent && lead && (
//         <BuyerFormModal lead={lead} followups={followups} onClose={() => setShowBuyerComponent(false)} />
//       )}

//       {showSellerComponent && lead && (
//         <SellerFormModal lead={lead} followups={followups} onClose={() => setShowSellerComponent(false)} />
//       )}

//       <AddLeadModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLead} lead={lead || undefined} />
//     </div>
//   );
// };

// export default LeadDetailPage;

// src/pages/LeadDetailPage.tsx - Compact & Mobile Responsive Redesign
// src/pages/LeadDetailPage.tsx - Compact Desktop View (No Mobile Drawer)

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Phone, Mail, MapPin, User as UserIcon, ChevronDown, Calendar, Clock,
  Users, UserPlus, ArrowLeftToLine, ArrowRightToLine, MessageSquare,
  User, Pencil, Trash2, NotebookPen,
  Tag
} from "lucide-react";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { leadsAPI, usersAPI } from "@/lib/api";
import { masterDataAPI } from "@/lib/mastersAPI";
import { followupAPI } from "@/lib/followupAPI";
import { notificationAPI } from "@/lib/notificationAPI";

import FollowupModal, { FOLLOWUP_TYPES, FollowupForm } from "@/pages/dashboard/components/FollowupModal";
import BuyerFormModal from "./components/BuyerFormModal";
import AddLeadModal from "./components/AddLeadModal";
import { useAuth } from "@/contexts/AuthContext";
import SellerFormModal from "./components/SellerFormModel";

import { can } from "@/utils/permission";

// ESALE Light Theme Colors
const PRIMARY_NAVY = "#0f2b3d";
const PRIMARY_ORANGE = "#e67e22";
const BG_WHITE = "#ffffff";
const BG_GRAY = "#f5f7fa";
const BORDER = "#e4e7eb";
const TEXT_PRIMARY = "#1a2c3e";
const TEXT_SECONDARY = "#5a7184";
const TEXT_MUTED = "#8ba0b5";

/* ===================== Types ===================== */
type UserRole = "admin" | "manager" | "agent" | "executive";

interface AuthUser {
  id?: string | number;
  user_id?: string | number;
  first_name?: string;
  last_name?: string;
  name?: string;
  role?: string;
  department?: string;
  salutation?: string;
}

export interface Lead {
  id: string;
  salutation?: string;
  name?: string;
  phone?: string;
  email?: string;
  lead_type?: string;
  lead_source?: string;
  priority?: string;
  whatsapp_number?: string;
  state?: string;
  city?: string;
  location?: string;
  status: string;
  stage?: string;
  assigned_executive?: string;
  assigned_executive_name?: string;
  created_at?: string;
  created_by?: string;
  last_contact?: string;
  last_contacted_by?: string;
  last_contacted_by_name?: string;
  updated_by_name?: string;
  created_by_name?: string;
  updated_at?: string;
}

interface Followup {
  priority: string;
  id: string | number;
  leadId: string | number;
  type: string;
  stage?: string;
  status?: string;
  remark?: string;
  customRemark?: string;
  nextAction?: string;
  scheduledDate?: string | null;
  completedDate?: string | null;
  createdBy?: string;
  createdAt?: string;
  createdByFirstName?: string;
  createdByLastName?: string;
  updatedByFirstName?: string;
  updatedByLastName?: string;
  last_contacted_by?: string;
  last_contacted_by_name?: string;
}

interface MasterOption {
  value: string;
  label: string;
  role?: string;
}

interface MasterOptions {
  salutation: MasterOption[];
  leadType: MasterOption[];
  leadSource: MasterOption[];
  leadStatus: MasterOption[];
  states: MasterOption[];
  cities: MasterOption[];
  locations: MasterOption[];
  agents: MasterOption[];
}

interface PresalesUser {
  id: string;
  name: string;
  department?: string;
  role?: string;
  selfOnly?: boolean;
  salutation?: string;
}

interface NotificationData {
  leadId: string;
  userId: string;
  message: string;
  type: string;
  link: string;
}

const getLatestFollowup = (arr?: Followup[] | null): Followup | null => (arr && arr.length ? arr[0] : null);

const FOLLOWUP_COLOR_MAP: Record<
  string,
  { container: string; icon: string; leftBar: string; badge: string }
> = {
  blue: { container: "bg-blue-50 border-blue-200", icon: "text-blue-600", leftBar: "border-blue-400", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  green: { container: "bg-green-50 border-green-200", icon: "text-green-600", leftBar: "border-green-400", badge: "bg-green-100 text-green-800 border-green-200" },
  indigo: { container: "bg-indigo-50 border-indigo-200", icon: "text-indigo-600", leftBar: "border-indigo-400", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  orange: { container: "bg-orange-50 border-orange-200", icon: "text-orange-600", leftBar: "border-orange-400", badge: "bg-orange-100 text-orange-800 border-orange-200" },
  purple: { container: "bg-purple-50 border-purple-200", icon: "text-purple-600", leftBar: "border-purple-400", badge: "bg-purple-100 text-purple-800 border-purple-200" },
  gray: { container: "bg-gray-50 border-gray-200", icon: "text-gray-600", leftBar: "border-gray-400", badge: "bg-gray-100 text-gray-800 border-gray-200" },
};

const normalizeString = (str: any): string => {
  return (str ?? "").toString().trim().toLowerCase().replace(/[\s-_/]+/g, "");
};

const getAssignableExecutives = (user: any, presalesUsers: any[]) => {
  const norm = (s: any) => (s ?? "").toString().trim().toLowerCase().replace(/[\s-_/]+/g, "");
  const role = norm(user?.role);
  const dept = norm(user?.department);

  const toExecutive = (u: any) => ({
    id: u.id ?? u.user_id ?? u._id,
    name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "Executive",
    department: u.department,
    role: u.role,
    selfOnly: false,
    salutation: u.salutation || "",
  });

  if (role === "executive" && (dept === "presales" || dept === "presale")) {
    const selfExecutive = {
      ...toExecutive(user),
      selfOnly: true,
      name: `${(user as AuthUser)?.salutation ? (user as AuthUser).salutation + " " : ""}${(user as AuthUser)?.first_name || (user as AuthUser)?.name || "You"}${(user as AuthUser)?.last_name ? " " + (user as AuthUser).last_name : ""} (Self)`,
    };
    return [selfExecutive];
  }

  if (role === "manager" && (dept === "presales" || dept === "presale")) {
    return presalesUsers.map(toExecutive);
  }

  if (role === "admin") {
    return presalesUsers.map(toExecutive);
  }

  const selfExecutive = {
    ...toExecutive(user),
    selfOnly: true,
    name: `${(user as AuthUser)?.salutation ? (user as AuthUser).salutation + " " : ""}${(user as AuthUser)?.first_name || (user as AuthUser)?.name || "You"}${(user as AuthUser)?.last_name ? " " + (user as AuthUser).last_name : ""} (Self)`,
  };
  return [selfExecutive];
};

const getFilteredLeads = (allLeads: Lead[], user: AuthUser | null): Lead[] => {
  if (!user) return allLeads;
  const userRole = normalizeString(user.role);
  const userId = user.id || user.user_id;
  if (userRole === "admin" || userRole === "manager") return allLeads;
  if (userRole === "executive") {
    return allLeads.filter(lead => lead.assigned_executive && String(lead.assigned_executive) === String(userId));
  }
  return allLeads;
};

const fetchUsersSafely = async (user: AuthUser | null): Promise<any[]> => {
  const userRole = normalizeString(user?.role);
  const userDept = normalizeString(user?.department);
  if (userRole === "admin" || userRole === "manager" || (userRole === "manager" && (userDept === "presales" || userDept === "presale"))) {
    try {
      const resp = await usersAPI.getAllUsers?.();
      const raw = resp?.data ?? resp?.items ?? resp ?? [];
      return Array.isArray(raw) ? raw : [];
    } catch (error: any) {
      console.warn("User fetch failed:", error);
      return [];
    }
  }
  return [];
};

const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Permissions
  const canReadLeads = can(user, "lead.read");
  const canUpdateLeads = can(user, "lead.update");
  const canDeleteLeads = can(user, "lead.delete");
  const canAssignLeads = can(user, "lead.assign");
  const canViewFollowups = can(user, "followup.read");
  const canCreateFollowups = can(user, "followup.create");
  const canUpdateFollowups = can(user, "followup.update");
  const canDeleteFollowups = can(user, "followup.delete");

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState<number>(0);
  const [showTransferOptions, setShowTransferOptions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [followupsLoading, setFollowupsLoading] = useState(false);
  const [followupsError, setFollowupsError] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState<MasterOptions>({
    salutation: [], leadType: [], leadSource: [], leadStatus: [], states: [], cities: [], locations: [], agents: [],
  });
  const [presalesUsers, setPreSalesUsers] = useState<PresalesUser[]>([]);
  const [execsLoading, setExecsLoading] = useState<boolean>(true);
  const [showExecDropdown, setShowExecDropdown] = useState(false);
  const [showBuyerComponent, setShowBuyerComponent] = useState(false);
  const [showSellerComponent, setShowSellerComponent] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);

  useEffect(() => {
    if (!canReadLeads) setLoading(false);
  }, [canReadLeads]);

  useEffect(() => {
    let mounted = true;
    const fetchExecs = async () => {
      try {
        setExecsLoading(true);
        const allUsers = await fetchUsersSafely(user);
        if (!mounted) return;
        const presalesExecs: PresalesUser[] = allUsers
          .filter((u: any) => {
            const role = normalizeString(u?.role);
            const dept = normalizeString(u?.department);
            return role === "executive" && (dept === "presales" || dept === "presale");
          })
          .map((u: any) => ({
            id: String(u.id ?? u.user_id ?? u._id ?? ""),
            name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "Executive",
            department: u.department,
            role: u.role,
            salutation: u.salutation || "",
          }));
        setPreSalesUsers(presalesExecs);
      } catch (err) {
        console.error("Failed to load presales executives:", err);
        setPreSalesUsers([]);
      } finally {
        setExecsLoading(false);
      }
    };
    fetchExecs();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    const filtered = getFilteredLeads(allLeads, user);
    setFilteredLeads(filtered);
    if (lead && filtered.length > 0) {
      const index = filtered.findIndex((l: Lead) => String(l.id) === String(lead.id));
      setCurrentLeadIndex(index >= 0 ? index : 0);
    }
  }, [allLeads, user, lead]);

  const assignableExecs = useMemo(() => getAssignableExecutives(user, presalesUsers), [user, presalesUsers]);

  const getAssignedExecName = (): string => {
    if (!lead) return "Unassigned";
    if (lead.assigned_executive_name && lead.assigned_executive_name !== "Unassigned") return lead.assigned_executive_name;
    if (lead.assigned_executive && presalesUsers.length > 0) {
      const exec = presalesUsers.find((u) => String(u.id) === String(lead.assigned_executive));
      if (exec) return exec.name;
    }
    const currentUserId = user?.id ?? (user as AuthUser)?.user_id;
    if (lead.assigned_executive && String(lead.assigned_executive) === String(currentUserId)) {
      return `${(user as AuthUser)?.salutation ? (user as AuthUser).salutation + " " : ""}${(user as AuthUser)?.first_name || (user as AuthUser)?.name || "You"}${(user as AuthUser)?.last_name ? " " + (user as AuthUser).last_name : ""} (Self)`;
    }
    return "Unassigned";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTransferOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchFollowups = async (leadIdParam?: string): Promise<Followup[]> => {
    if (!canViewFollowups) {
      setFollowups([]);
      setFollowupsError("You do not have permission to view follow-ups");
      setFollowupsLoading(false);
      return [];
    }
    const leadToUse = leadIdParam ?? id;
    if (!leadToUse) {
      setFollowups([]);
      setFollowupsError(null);
      setFollowupsLoading(false);
      return [];
    }
    try {
      setFollowupsLoading(true);
      setFollowupsError(null);
      const response = await followupAPI.getFollowupsByLeadId(leadToUse);
      let followupsData: Followup[] = [];
      if (Array.isArray(response?.data)) followupsData = response.data;
      else if (Array.isArray(response)) followupsData = response;
      else if (Array.isArray(response?.Payload)) followupsData = response.Payload;
      else if (Array.isArray(response?.result)) followupsData = response.result;
      followupsData = (followupsData || []).map((f: any) => ({
        id: f.id || f._id || f.followup_id || "",
        leadId: f.leadId || f.lead_id || leadToUse,
        type: f.type || f.followupType || "general",
        stage: f.stage || f.leadStage || "",
        status: f.status || f.leadStatus || "",
        remark: f.remark || "",
        customRemark: f.customRemark || f.custom_remark || "",
        nextAction: f.nextAction || f.next_action || "",
        scheduledDate: f.scheduledDate || f.scheduled_date || f.schedule || f.createdAt || f.created_at || null,
        createdAt: f.createdAt || f.created_at || null,
        priority: f.priority || "Medium",
        createdByFirstName: f.createdByFirstName || f.created_by_first_name || f.created_first_name || "",
        createdByLastName: f.createdByLastName || f.created_by_last_name || f.created_last_name || "",
        ...f,
      }));
      followupsData.sort((a, b) => {
        const da = new Date(a.scheduledDate || a.createdAt || 0).getTime();
        const db = new Date(b.scheduledDate || b.createdAt || 0).getTime();
        if (db !== da) return db - da;
        if (a.id && b.id) return a.id > b.id ? -1 : 1;
        return 0;
      });
      setFollowups(followupsData);
      return followupsData;
    } catch (e: any) {
      console.error("Error fetching followups:", e);
      const status = e?.response?.status || e?.status;
      if (status === 404 || status === 204) {
        setFollowups([]);
        setFollowupsError(null);
        return [];
      } else {
        toast.error("Failed to fetch follow-ups");
        setFollowupsError("Failed to fetch follow-ups");
        setFollowups([]);
        return [];
      }
    } finally {
      setFollowupsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFollowups();
  }, [id, canViewFollowups]);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        if (!canReadLeads) {
          setError("You do not have permission to view this lead.");
          setLoading(false);
          return;
        }
        if (id) {
          const [response, allLeadsResponse] = await Promise.all([leadsAPI.getLead(id), leadsAPI.getLeads()]);
          if (allLeadsResponse?.success && allLeadsResponse.data) {
            const leadsData: Lead[] = Array.isArray(allLeadsResponse.data)
              ? allLeadsResponse.data.map((l: any) => ({ ...l, id: String(l.id || l._id || "") }))
              : [];
            setAllLeads(leadsData);
          }
          const data = response?.data ?? response;
          if (!data) {
            setError("No lead data returned");
            return;
          }
          const resolveExecName = (execId: any): string | null => {
            if (!execId) return null;
            const found = presalesUsers.find((u) => String(u.id) === String(execId));
            return found?.name ?? null;
          };
          const execName = data.assigned_executive_name || resolveExecName(data.assigned_executive) || "Unassigned";
          const createdByName = data.created_by_name || `${data.created_first_name || data.createdByFirstName || ""} ${data.created_last_name || data.createdByLastName || ""}`.trim() || "System";
          const updatedByName = data.updated_by_name || `${data.updated_first_name || data.updatedByFirstName || ""} ${data.updated_last_name || data.updatedByLastName || ""}`.trim() || "System";
          const lastContactedByName = data.last_contacted_by_name || data.updated_by_name || null;
          const leadData: Lead = {
            id: String(data.id || data._id || ""),
            salutation: data.salutation || "",
            name: data.name || "",
            phone: data.phone || "",
            email: data.email || "",
            lead_type: data.lead_type || data.leadType || "",
            lead_source: data.lead_source || data.leadSource || "",
            whatsapp_number: data.whatsapp_number || data.whatsapp || "",
            state: data.state || "",
            city: data.city || "",
            location: data.location || "",
            status: data.status || "New",
            assigned_executive: data.assigned_executive ? String(data.assigned_executive) : "",
            assigned_executive_name: execName || "Unassigned",
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
            priority: data.priority || " -",
            stage: data.stage || "-",
            created_by: data.created_by || data.createdBy || "System",
            last_contact: data.last_contact || data.lastContact || "",
            last_contacted_by: data.last_contacted_by || data.last_contact_by || data.lastContactedBy || "",
            last_contacted_by_name: lastContactedByName || undefined,
            created_by_name: createdByName,
            updated_by_name: updatedByName,
          };
          setLead(leadData);
        }
      } catch (err) {
        console.error("Error fetching lead details:", err);
        toast.error("Error fetching lead details");
        setError("Failed to fetch lead details");
      } finally {
        setLoading(false);
      }
    };
    const fetchMasters = async () => {
      try {
        setError(null);
        const [leadMasterTypes, commonMasterTypes] = await Promise.all([masterDataAPI.getAllMasterTypes("lead"), masterDataAPI.getAllMasterTypes("common")]);
        const allMasterTypes = [...leadMasterTypes, ...commonMasterTypes];
        const masterValues = await Promise.all(allMasterTypes.map(async (masterType: any) => {
          try { return await masterDataAPI.getMasterValues(masterType.id); } catch { return []; }
        }));
        const organizedData: Record<string, MasterOption[]> = {};
        allMasterTypes.forEach((masterType: any, index: number) => {
          const values = masterValues[index] || [];
          const normalizedName = (masterType.name || "").toLowerCase().trim();
          organizedData[normalizedName] = values.map((item: any) => ({ value: item.value, label: item.value || item.name || "Unknown", role: item.role || "Agent" }));
        });
        const agentData = organizedData["agent"] || organizedData["agents"] || [];
        setMasterOptions((prev) => ({
          ...prev,
          salutation: organizedData["salutation"] || organizedData["salutations"] || [],
          leadType: organizedData["lead type"] || organizedData["leadtype"] || organizedData["lead_type"] || [],
          leadSource: organizedData["lead source"] || organizedData["leadsource"] || organizedData["lead_source"] || [],
          leadStatus: organizedData["lead status"] || organizedData["leadstatus"] || organizedData["lead_status"] || organizedData["status"] || [],
          states: organizedData["state"] || organizedData["states"] || [],
          cities: organizedData["city"] || organizedData["cities"] || [],
          locations: organizedData["location"] || organizedData["locations"] || [],
          agents: agentData.map((item) => ({ value: item.value, label: item.label, role: item.role || "Agent" })),
        }));
      } catch (err: any) {
        console.error("Failed to load master data:", err);
        setError(`Failed to load dropdown options`);
      }
    };
    fetchMasters();
    fetchLead();
  }, [id, execsLoading, canReadLeads]);

  useEffect(() => {
    if (lead?.assigned_executive && presalesUsers.length > 0) {
      const exec = presalesUsers.find((u) => String(u.id) === String(lead.assigned_executive));
      if (exec) setLead((prev) => prev ? { ...prev, assigned_executive_name: exec.name } : prev);
    }
  }, [presalesUsers, lead?.assigned_executive]);

  const handleDelete = async () => {
    if (!id) return;
    if (!canDeleteLeads) { toast.error("You do not have permission to delete leads"); return; }
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        const response = await leadsAPI.deleteLead(id);
        if (response.success) { toast.success("Lead deleted ✅"); navigate("/dashboard/leads"); }
        else toast.error("Failed to delete lead ❌");
      } catch (err) { console.error("Error deleting lead:", err); toast.error("Error deleting lead"); }
    }
  };

  const handleExecAssign = async (execId: string, execName: string) => {
    if (!lead) return;
    if (!canAssignLeads) { toast.error("You do not have permission to assign leads"); return; }
    try {
      const prevExec = lead.assigned_executive || "";
      setLead({ ...lead, assigned_executive: execId, assigned_executive_name: execName });
      setShowExecDropdown(false);
      await leadsAPI.assignToExecutive(lead.id, { assigned_executive: execId });
      if (execId && execId !== prevExec) {
        try { await notificationAPI.createNotification({ leadId: String(lead.id), userId: String(execId), message: `Lead assigned to ${execName}`, type: "lead_assign", link: `/dashboard/leads/${lead.id}` } as NotificationData); }
        catch (notifErr) { console.error("Notification error:", notifErr); toast.warn("Lead assigned but notification failed"); }
      }
      toast.success(`Lead assigned to ${execName}`);
    } catch (err) { console.error("Error assigning executive:", err); setLead((prev) => prev ? { ...prev, assigned_executive: lead.assigned_executive, assigned_executive_name: lead.assigned_executive_name } : prev); toast.error("Failed to assign. Please try again."); }
  };

  const handleSaveLead = async (updatedLead: Lead | null) => {
    if (!updatedLead) return;
    if (!canUpdateLeads) { toast.error("You do not have permission to update leads"); return; }
    try {
      const prevExec = lead?.assigned_executive || "";
      const newExec = updatedLead.assigned_executive || "";
      const response = await leadsAPI.updateLead(updatedLead.id!, updatedLead);
      const savedLead = response?.data || response;
      setLead((prev) => ({ ...(prev || {} as Lead), ...savedLead }));
      setAllLeads((prev) => prev.map((l) => (String(l.id) === String(savedLead.id) ? { ...l, ...savedLead } : l)));
      if (newExec && newExec !== prevExec) {
        const exec = presalesUsers.find((u) => String(u.id) === String(newExec));
        const execName = exec?.name || savedLead.assigned_executive_name || "Executive";
        try { await notificationAPI.createNotification({ leadId: String(updatedLead.id), userId: String(newExec), message: `Lead updated and assigned to ${execName}`, type: "lead_update", link: `/dashboard/leads/${updatedLead.id}` } as NotificationData); }
        catch (notifErr) { console.error("Notification error:", notifErr); }
      }
      setIsEditModalOpen(false);
      toast.success("Lead details updated successfully!");
    } catch (err) { console.error("Error saving lead:", err); toast.error("Failed to save lead. Please try again."); }
  };

  const handleFollowupSave = async (data: FollowupForm & { lead_id?: string }) => {
    if (!lead?.id) { toast.error("Lead not loaded."); return; }
    if (editingFollowup && !canUpdateFollowups) { toast.error("You do not have permission to update follow-ups"); return; }
    if (!editingFollowup && !canCreateFollowups) { toast.error("You do not have permission to create follow-ups"); return; }
    let saved: any = null;
    const scheduledISO = data.scheduleDate ? `${data.scheduleDate}T${(data.scheduleTime || "00:00")}:00` : null;
    const followupPayload = { leadId: data.lead_id ?? lead.id, type: data.followupType, stage: data.leadStage, status: data.leadStatus, remark: data.remark, customRemark: data.customRemark, nextAction: data.nextAction, scheduledDate: scheduledISO, priority: data.priority, updated_by: (user as AuthUser)?.id ?? (user as AuthUser)?.user_id };
    try {
      if (editingFollowup) {
        await followupAPI.updateFollowup(String(editingFollowup.id), followupPayload);
        saved = { ...editingFollowup, ...followupPayload, updatedAt: new Date().toISOString() };
        setEditingFollowup(null);
        setFollowups((prev) => prev.map((f) => (f.id === editingFollowup.id ? saved : f)));
        toast.success("Follow-up updated successfully!");
      } else {
        const resp = await followupAPI.createFollowup(followupPayload);
        const newId = resp?.data?.id || resp?.id || `temp-${Date.now()}`;
        saved = { id: newId, leadId: followupPayload.leadId, type: followupPayload.type, stage: followupPayload.stage, status: followupPayload.status, remark: followupPayload.remark, customRemark: followupPayload.customRemark, nextAction: followupPayload.nextAction, scheduledDate: scheduledISO, createdAt: new Date().toISOString(), priority: followupPayload.priority, createdByFirstName: user?.first_name || "", createdByLastName: user?.last_name || "" };
        setFollowups((prev) => [saved, ...prev]);
        toast.success("Follow-up saved successfully!");
      }
    } catch (err) { console.error("Error saving followup:", err); toast.error(`Failed to ${editingFollowup ? "update" : "save"} follow-up. Please try again.`); return; }
    try {
      await leadsAPI.updateLead(lead.id, { stage: data.leadStage, status: data.leadStatus, priority: data.priority, updated_by: (user as AuthUser)?.id ?? (user as AuthUser)?.user_id });
      setLead((prev) => prev ? { ...prev, stage: data.leadStage || prev.stage, status: data.leadStatus || prev.status, priority: data.priority } : prev);
    } catch (err) { console.error("Error updating lead:", err); }
    if (lead.assigned_executive && String(lead.assigned_executive).trim() !== "") {
      try { await notificationAPI.createNotification({ leadId: String(lead.id), userId: String(lead.assigned_executive), message: `New follow-up added for lead "${lead.name}" by ${user?.first_name || "User"}`, type: "followup_add", link: `/dashboard/leads/${lead.id}` } as NotificationData); }
      catch (notifErr) { console.error("Notification error:", notifErr); }
    }
    setIsFollowupModalOpen(false);
    try { await fetchFollowups(); } catch { }
  };

  const handleEditFollowup = (followup: Followup) => {
    if (!canUpdateFollowups) { toast.error("You do not have permission to edit follow-ups"); return; }
    setEditingFollowup(followup);
    setIsFollowupModalOpen(true);
  };

  const handleDeleteFollowup = async (followupId: string | number) => {
    if (!canDeleteFollowups) { toast.error("You do not have permission to delete follow-ups"); return; }
    if (!confirm("Are you sure you want to delete this follow-up?")) return;
    const prevFollowups = [...followups];
    setFollowups((prev) => prev.filter((f) => f.id !== followupId));
    try { await followupAPI.deleteFollowup(String(followupId)); toast.success("Follow-up deleted successfully"); }
    catch (err) { console.error("Error deleting followup:", err); setFollowups(prevFollowups); toast.error("Failed to delete follow-up"); }
  };

  const handlePreviousLead = () => {
    if (filteredLeads.length === 0 || currentLeadIndex <= 0) return;
    const prevIndex = currentLeadIndex - 1;
    const prevLead = filteredLeads[prevIndex];
    setCurrentLeadIndex(prevIndex);
    navigate(`/dashboard/leads/${prevLead.id}`);
  };

  const handleNextLead = () => {
    if (filteredLeads.length === 0 || currentLeadIndex >= filteredLeads.length - 1) return;
    const nextIndex = currentLeadIndex + 1;
    const nextLead = filteredLeads[nextIndex];
    setCurrentLeadIndex(nextIndex);
    navigate(`/dashboard/leads/${nextLead.id}`);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return { date: "-", time: "-" };
    try {
      const date = new Date(dateString);
      return { date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) };
    } catch { return { date: "-", time: "-" }; }
  };

  const shouldShowTransfer = (ld?: Lead | null, lf?: Followup | null): boolean => {
    const lStage = (ld?.stage || "").trim().toLowerCase();
    const lStatus = (ld?.status || "").trim().toLowerCase();
    const fStage = (lf?.stage || "").trim().toLowerCase();
    const fStatus = (lf?.status || "").trim().toLowerCase();
    const isLeadOK = (lStage === "contacted" || lStage === "connected") && lStatus === "qualified";
    const isFollowupOK = (fStage === "contacted" || fStage === "connected") && fStatus === "qualified";
    return isLeadOK || isFollowupOK;
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "contacted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "new": return "bg-purple-100 text-purple-700 border-purple-200";
      case "qualified": return "bg-teal-100 text-teal-700 border-teal-200";
      case "unqualified": return "bg-red-100 text-red-700 border-red-200";
      case "cold": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getLeadTypeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case "buyer-self": return "bg-green-100 text-green-700 border-green-200";
      case "buyer investor": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "seller self": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "seller investor": return "bg-red-100 text-red-700 border-red-200";
      case "seller builder": return "bg-orange-100 text-orange-700 border-orange-200";
      case "walk-in lead": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "referral lead": return "bg-sky-100 text-sky-700 border-sky-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage?.toLowerCase()) {
      case "attempting contact": return "bg-blue-100 text-blue-700 border-blue-200";
      case "contacted": return "bg-purple-100 text-purple-700 border-purple-200";
      case "converted to opportunity": return "bg-green-100 text-green-700 border-green-200";
      case "disqualified": return "bg-red-100 text-red-700 border-red-200";
      case "new": return "bg-gray-100 text-gray-700 border-gray-200";
      case "nurturing": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "qualified": return "bg-teal-100 text-teal-700 border-teal-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const latestFollowup = useMemo(() => getLatestFollowup(followups), [followups]);
  const { date: createdDate, time: createdTime } = formatDateTime(lead?.created_at || null);
  const { date: updatedDate, time: updatedTime } = formatDateTime(lead?.updated_at || null);
  const { date: lastContactDate, time: lastContactTime } = formatDateTime(lead?.last_contact || "");

  const handleBack = () => navigate("/dashboard/leads");
  const handleEdit = () => { if (!canUpdateLeads) { toast.error("You do not have permission to edit leads"); return; } setIsEditModalOpen(true); };
  const handleCall = () => lead?.phone && window.open(`tel:${lead.phone}`, "_self");
  const handleWhatsApp = () => lead?.whatsapp_number && window.open(`https://wa.me/${lead.whatsapp_number.replace(/\D/g, "")}`, "_blank");
  const handleEmail = () => lead?.email && window.open(`mailto:${lead.email}`, "_self");
  const handleScheduleMeeting = () => lead && window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting+with+${encodeURIComponent(lead.name || "")}&details=${encodeURIComponent(`Discuss lead ${lead.id}`)}&location=Online&dates=20240101T100000Z/20240101T110000Z`, "_blank");

  const typeIcon = (t: string) => { const found = FOLLOWUP_TYPES.find((ft) => ft.value === t); return found ? found.Icon : MessageSquare; };
  const followupCardClasses = (t: string) => { const color = FOLLOWUP_TYPES.find((ft) => ft.value === t)?.color || "gray"; return FOLLOWUP_COLOR_MAP[color] || FOLLOWUP_COLOR_MAP.gray; };
  const formatDateShort = (iso?: string | null): string => { if (!iso) return "-"; const d = new Date(iso); const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }); const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); return `${date} • ${time}`; };

  const tabId = "lead";
  const leadId = id || "";

  if (!canReadLeads) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_GRAY }}>
        <div className="text-center p-6 bg-white rounded-xl shadow-lg border" style={{ borderColor: BORDER }}>
          <div className="text-red-600 text-lg font-semibold mb-2">Access Denied</div>
          <div className="text-gray-600 text-sm">You do not have permission to view leads.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_GRAY }}>
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border" style={{ borderColor: BORDER }}>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90" style={{ background: PRIMARY_ORANGE }}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading || !lead) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_GRAY }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: PRIMARY_ORANGE }}></div>
          <p className="text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-5" style={{ background: BG_GRAY }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
          {/* Main Lead Profile Card */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border" style={{ borderColor: BORDER }}>
            {/* Action Buttons Bar - Compact */}
            <div className="p-3 md:p-4 border-b flex flex-wrap items-center justify-between gap-2" style={{ borderColor: BORDER, background: BG_WHITE }}>
              <button onClick={handleBack} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm font-medium border hover:bg-gray-50" style={{ borderColor: BORDER, color: TEXT_PRIMARY }}>
                <FiArrowLeft size={13} />
                Back
              </button>

              <div className="flex items-center gap-1.5">
                <button onClick={handleEdit} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm font-medium text-white ${canUpdateLeads ? "hover:opacity-90" : "opacity-50 cursor-not-allowed"}`} style={{ background: PRIMARY_ORANGE }} disabled={!canUpdateLeads}>
                  <FiEdit size={13} /> Edit
                </button>
                <button onClick={handleDelete} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm font-medium border ${canDeleteLeads ? "hover:bg-red-50" : "opacity-50 cursor-not-allowed"}`} style={{ borderColor: "#ef4444", color: "#ef4444", background: BG_WHITE }} disabled={!canDeleteLeads}>
                  <FiTrash2 size={13} /> Delete
                </button>
                <button onClick={handlePreviousLead} disabled={currentLeadIndex <= 0} className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm border disabled:opacity-40 hover:bg-gray-50" style={{ background: BG_WHITE, borderColor: BORDER, color: TEXT_PRIMARY }}>
                  <ArrowLeftToLine size={13} /> Prev
                </button>
                <button onClick={handleNextLead} disabled={currentLeadIndex >= filteredLeads.length - 1} className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm border disabled:opacity-40 hover:bg-gray-50" style={{ background: BG_WHITE, borderColor: BORDER, color: TEXT_PRIMARY }}>
                  Next <ArrowRightToLine size={13} />
                </button>
              </div>
            </div>

            {/* Lead Header - Compact with Gradient */}
            <div className="p-4 md:p-5 border-b" style={{ borderColor: BORDER, background: `linear-gradient(135deg, ${PRIMARY_NAVY}08 0%, ${PRIMARY_ORANGE}08 100%)` }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: `${PRIMARY_ORANGE}15` }}>
                    <UserIcon size={20} style={{ color: PRIMARY_ORANGE }} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold" style={{ color: PRIMARY_NAVY }}>
                      {lead.salutation} {lead.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[11px]" style={{ color: TEXT_MUTED }}>ID: {String(lead.id).slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getLeadTypeColor(lead.lead_type || "")}`}>
                        {lead.lead_type || "Lead"}
                      </span>
                      <span className="text-[11px]" style={{ color: TEXT_MUTED }}>({currentLeadIndex + 1} of {filteredLeads.length})</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button onClick={() => { if (!canCreateFollowups) { toast.error("Permission denied"); return; } setEditingFollowup(null); setIsFollowupModalOpen(true); }} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white transition-all text-xs md:text-sm font-medium ${!canCreateFollowups ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`} style={{ background: PRIMARY_ORANGE }}>
                    <NotebookPen size={13} /> Follow Up
                  </button>

                  <div className="relative">
                    <button onClick={() => { if (!canAssignLeads) { toast.error("Permission denied"); return; } if (!execsLoading) setShowExecDropdown((s) => !s); }} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white transition-all text-xs md:text-sm font-medium ${(!canAssignLeads || assignableExecs.length === 0) ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`} style={{ background: PRIMARY_NAVY }} disabled={!canAssignLeads || execsLoading || assignableExecs.length === 0}>
                      <UserPlus size={13} /> Assign <ChevronDown size={11} />
                    </button>
                    {showExecDropdown && canAssignLeads && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border z-10 overflow-hidden" style={{ borderColor: BORDER }}>
                        <div className="p-2 border-b" style={{ borderColor: BORDER, background: BG_GRAY }}>
                          <p className="text-xs font-semibold" style={{ color: PRIMARY_NAVY }}>Assign to Executive</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {assignableExecs.length === 0 ? <div className="px-3 py-2 text-xs text-gray-500">No executives available</div> : assignableExecs.map((exec: PresalesUser) => (
                            <button key={exec.id} onClick={() => handleExecAssign(String(exec.id), exec.name)} className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${String(lead.assigned_executive) === String(exec.id) ? "bg-orange-50 text-orange-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}>
                              {exec.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <button onClick={handleCall} className="p-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "#25D366" }} title="Call"><Phone size={13} /></button>
                    <button onClick={handleWhatsApp} className="p-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "#128C7E" }} title="WhatsApp"><FaWhatsapp size={13} /></button>
                    <button onClick={handleEmail} className="p-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "#3b82f6" }} title="Email"><Mail size={13} /></button>
                    <button onClick={handleScheduleMeeting} className="p-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "#8b5cf6" }} title="Schedule Meeting"><Calendar size={13} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Compact */}
            <div className="p-4 md:p-5 space-y-4">
              {/* Contact & Location Section - Two Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Details */}
                <div className="rounded-lg p-3" style={{ background: BG_GRAY, border: `1px solid ${BORDER}` }}>
                  <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: PRIMARY_NAVY }}>
                    <Phone size={12} style={{ color: PRIMARY_ORANGE }} />
                    Contact Details
                  </h3>
                  <div className="space-y-2">
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>PHONE</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.phone || "-"}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>EMAIL</p><p className="text-sm font-medium break-all" style={{ color: TEXT_PRIMARY }}>{lead.email || "-"}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>WHATSAPP</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.whatsapp_number || "-"}</p></div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="rounded-lg p-3" style={{ background: BG_GRAY, border: `1px solid ${BORDER}` }}>
                  <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: PRIMARY_NAVY }}>
                    <MapPin size={12} style={{ color: PRIMARY_ORANGE }} />
                    Location Details
                  </h3>
                  <div className="space-y-2">
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>STATE</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.state || "-"}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>CITY</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.city || "-"}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>LOCATION</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.location || "-"}</p></div>
                  </div>
                </div>
              </div>

              {/* Lead Classification - Compact */}
              <div className="rounded-lg p-3" style={{ background: BG_GRAY, border: `1px solid ${BORDER}` }}>
                <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: PRIMARY_NAVY }}>
                  <Tag size={12} style={{ color: PRIMARY_ORANGE }} />
                  Lead Classification
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1"><span className="text-[10px]" style={{ color: TEXT_MUTED }}>Source:</span><span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">{lead.lead_source || "-"}</span></div>
                  <div className="flex items-center gap-1"><span className="text-[10px]" style={{ color: TEXT_MUTED }}>Priority:</span><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(lead.priority || "")}`}>{lead.priority || "-"}</span></div>
                  <div className="flex items-center gap-1"><span className="text-[10px]" style={{ color: TEXT_MUTED }}>Stage:</span><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStageColor(lead.stage || "")}`}>{lead.stage || "-"}</span></div>
                  <div className="flex items-center gap-1"><span className="text-[10px]" style={{ color: TEXT_MUTED }}>Status:</span><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(lead.status)}`}>{lead.status}</span></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border" style={{ borderColor: BORDER }}>
                    <Clock size={13} style={{ color: TEXT_MUTED }} />
                    <div><p className="text-[9px] uppercase" style={{ color: TEXT_MUTED }}>CREATED</p><p className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>{createdDate}</p><p className="text-[10px]" style={{ color: TEXT_MUTED }}>{createdTime}</p><p className="text-[10px] mt-0.5 truncate max-w-[130px]" style={{ color: TEXT_MUTED }}>By: {lead.created_by_name || "System"}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border" style={{ borderColor: BORDER }}>
                    <Clock size={13} style={{ color: TEXT_MUTED }} />
                    <div><p className="text-[9px] uppercase" style={{ color: TEXT_MUTED }}>UPDATED</p><p className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>{updatedDate}</p><p className="text-[10px]" style={{ color: TEXT_MUTED }}>{updatedTime}</p><p className="text-[10px] mt-0.5 truncate max-w-[130px]" style={{ color: TEXT_MUTED }}>By: {lead.updated_by_name || "System"}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border" style={{ borderColor: BORDER }}>
                    <Clock size={13} style={{ color: TEXT_MUTED }} />
                    <div><p className="text-[9px] uppercase" style={{ color: TEXT_MUTED }}>LAST CONTACT</p><p className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>{lastContactDate}</p><p className="text-[10px]" style={{ color: TEXT_MUTED }}>{lastContactTime}</p><p className="text-[10px] mt-0.5 truncate max-w-[130px]" style={{ color: TEXT_MUTED }}>By: {lead.last_contacted_by_name || lead.last_contacted_by || "-"}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg col-span-1 sm:col-span-2 lg:col-span-1" style={{ background: `${PRIMARY_ORANGE}08`, border: `1px solid ${PRIMARY_ORANGE}20` }}>
                    <Users size={13} style={{ color: PRIMARY_ORANGE }} />
                    <div><p className="text-[9px] uppercase" style={{ color: PRIMARY_ORANGE }}>ASSIGNED EXECUTIVE</p><p className="text-xs font-semibold" style={{ color: PRIMARY_NAVY }}>{getAssignedExecName()}</p></div>
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    {shouldShowTransfer(lead, latestFollowup) && (
                      <button onClick={() => setShowTransferOptions(!showTransferOptions)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90" style={{ background: PRIMARY_ORANGE }}>
                        <HiArrowsRightLeft size={12} /> Transfer Lead
                      </button>
                    )}
                    {showTransferOptions && (
                      <div className="absolute top-full left-0 mt-2 w-44 rounded-xl shadow-lg border z-20 overflow-hidden bg-white" style={{ borderColor: BORDER }}>
                        <button className="w-full px-3 py-1.5 text-left text-xs text-green-600 hover:bg-green-50" onClick={() => { setShowTransferOptions(false); setShowBuyerComponent(true); }}>Transfer to Buyer</button>
                        <button className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50" onClick={() => { setShowTransferOptions(false); setShowSellerComponent(true); }}>Transfer to Seller</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Follow-ups Timeline - Compact */}
          <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: BORDER }}>
            <div className="p-3 md:p-4 border-b" style={{ borderColor: BORDER, background: BG_GRAY }}>
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: PRIMARY_NAVY }}>
                <MessageSquare size={14} style={{ color: PRIMARY_ORANGE }} />
                Follow-ups Timeline
              </h3>
            </div>
            <div className="p-3 md:p-4">
              {followupsLoading && (<div className="flex justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: PRIMARY_ORANGE }}></div></div>)}
              {!followupsLoading && id && followupsError && (<div className="text-center py-6 text-red-500 text-xs">{followupsError}</div>)}
              {!followupsLoading && id && !followupsError && followups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl text-center" style={{ background: BG_GRAY, border: `1px dashed ${BORDER}` }}>
                  <MessageSquare size={32} style={{ color: TEXT_MUTED }} />
                  <p className="text-xs font-medium mt-2" style={{ color: TEXT_MUTED }}>No follow-ups yet</p>
                  <p className="text-[10px] mt-1" style={{ color: TEXT_MUTED }}>Click "Follow Up" to add one</p>
                </div>
              )}
              {!followupsLoading && !followupsError && followups.length > 0 && (
                <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {followups.map((f) => {
                    const Ico = typeIcon(f.type);
                    const scheduledLabel = formatDateShort(f.scheduledDate || f.createdAt || "");
                    const color = followupCardClasses(f.type);
                    return (
                      <div key={f.id} className={`border rounded-lg p-2.5 transition-all ${color.container} border-l-3 ${color.leftBar}`}>
                        <div className="flex gap-2">
                          <Ico size={14} className={color.icon} />
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${color.badge}`}>{f.type}</span>
                              <div className="flex gap-1">
                                {canUpdateFollowups && <button onClick={() => handleEditFollowup(f)} className="p-0.5 rounded hover:bg-gray-200"><Pencil size={10} className="text-gray-500" /></button>}
                                {canDeleteFollowups && <button onClick={() => handleDeleteFollowup(f.id)} className="p-0.5 rounded hover:bg-red-100"><Trash2 size={10} className="text-red-500" /></button>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px]">
                              {f.priority && <><span className="text-gray-400">Priority:</span><span className={`px-1 py-0 rounded-full text-[9px] font-medium ${getPriorityColor(f.priority)}`}>{f.priority}</span></>}
                              {f.stage && <><span className="text-gray-400">Stage:</span><span className="px-1 py-0 rounded-full text-[9px] font-medium bg-white/70 border border-gray-200">{f.stage}</span></>}
                              {f.status && <><span className="text-gray-400">Status:</span><span className="px-1 py-0 rounded-full text-[9px] font-medium bg-white/70 border border-gray-200">{f.status}</span></>}
                            </div>
                            {(f.customRemark || f.remark) && <p className="text-[10px] text-gray-600"><span className="font-medium">Remark:</span> {f.customRemark || f.remark}</p>}
                            {f.nextAction && <p className="text-[10px] text-gray-600"><span className="font-medium">Next Action:</span> {f.nextAction}</p>}
                            <div className="flex flex-wrap justify-between gap-1 pt-1 text-[9px] text-gray-400">
                              <div className="flex items-center gap-1"><Calendar size={8} />{scheduledLabel}</div>
                              <div className="flex items-center gap-1"><User size={8} />{`${f.createdByFirstName || ""} ${f.createdByLastName || ""}`.trim() || "System"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FollowupModal isOpen={isFollowupModalOpen} onClose={() => { setIsFollowupModalOpen(false); setEditingFollowup(null); }} onSave={handleFollowupSave} tabId={tabId} leadId={leadId} initialForm={editingFollowup ? { id: editingFollowup.id, followupType: editingFollowup.type, leadStage: editingFollowup.stage || "", leadStatus: editingFollowup.status || "", remark: editingFollowup.remark || "", customRemark: editingFollowup.customRemark || "", nextAction: editingFollowup.nextAction || "", scheduleDate: editingFollowup.scheduledDate ? new Date(editingFollowup.scheduledDate).toISOString().slice(0, 10) : "", scheduleTime: editingFollowup.scheduledDate ? new Date(editingFollowup.scheduledDate).toTimeString().slice(0, 5) : "", priority: editingFollowup.priority || lead.priority || "Medium", lead_id: leadId } : { priority: lead.priority || "Medium" }} />
      {showBuyerComponent && lead && <BuyerFormModal lead={lead} followups={followups} onClose={() => setShowBuyerComponent(false)} />}
      {showSellerComponent && lead && <SellerFormModal lead={lead} followups={followups} onClose={() => setShowSellerComponent(false)} />}
      <AddLeadModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLead} lead={lead || undefined} />
    </div>
  );
};

export default LeadDetailPage;