// // src/pages/settings/RolesPermissionsPage.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
// import {
//   ArrowLeft, Shield, Edit, Lock, Save, Users, Key, ChevronRight,
//   Search, User, CheckCircle2, XCircle, Home, BarChart2, LayoutDashboard,
//   MessageSquare, Settings, Bot, Megaphone, FileText, Layers
// } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";
// import { masterDataAPI } from "@/lib/mastersAPI";
// import { toast } from "react-toastify";
// import { rbacAPI } from "@/lib/rbacAPI";
// import { usersAPI } from "@/lib/api";

// interface Role {
//   id: string;
//   name: string;
//   description: string;
//   permissions: string[];
//   user_count: number;
//   is_system: boolean;
//   created_at: string;
// }

// interface Permission {
//   id: string;
//   name: string;
//   resource: string;
//   action: string;
//   description: string;
// }

// interface PermissionGroup {
//   label: string;
//   resource: string;
//   permissions: Permission[];
// }

// interface PermissionSection {
//   section: string;
//   icon: React.ReactNode;
//   groups: PermissionGroup[];
// }

// interface AppUser {
//   id: number;
//   username: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   role: string;
//   is_active: number;
//   avatar?: string;
//   designation?: string;
//   department?: string;
//   module_permissions?: Record<string, Record<string, boolean>> | null;
// }

// const PERMISSION_SECTIONS: PermissionSection[] = [
//   // 1. Overview
//   {
//     section: "Overview",
//     icon: <LayoutDashboard className="h-4 w-4" />,
//     groups: [
//       {
//         label: "Overview",
//         resource: "overview",
//         permissions: [
//           { id: "ov_1", name: "Access Overview", resource: "overview", action: "access", description: "Access the overview/home dashboard" },
//         ],
//       },
//     ],
//   },

//   // 2. Dashboard
//   {
//     section: "Dashboard",
//     icon: <BarChart2 className="h-4 w-4" />,
//     groups: [
//       {
//         label: "Dashboard",
//         resource: "dashboard",
//         permissions: [
//           { id: "db_1", name: "Admin Dashboard",   resource: "dashboard", action: "admin",   description: "Access the admin dashboard" },
//           { id: "db_2", name: "Manager Dashboard", resource: "dashboard", action: "manager", description: "Access the manager dashboard" },
//           { id: "db_3", name: "Agent Dashboard",   resource: "dashboard", action: "agent",   description: "Access the agent dashboard" },
//         ],
//       },
//     ],
//   },

//   // 3. Home
//   {
//     section: "Home",
//     icon: <Home className="h-4 w-4" />,
//     groups: [
//       {
//         label: "Home",
//         resource: "home",
//         permissions: [
//           { id: "hm_1", name: "Create Home",      resource: "home", action: "create",      description: "Add home page content" },
//           { id: "hm_2", name: "Update Home",      resource: "home", action: "update",      description: "Edit home page content" },
//           { id: "hm_3", name: "Delete Home",      resource: "home", action: "delete",      description: "Delete home page content" },
//           { id: "hm_4", name: "Bulk Update Home", resource: "home", action: "bulk_update", description: "Bulk update home page content" },
//           { id: "hm_5", name: "Read Home",        resource: "home", action: "read",        description: "View home page content" },
//         ],
//       },
//     ],
//   },

//   // 4. CRM
//   {
//     section: "CRM",
//     icon: <Users className="h-4 w-4" />,
//     groups: [
//       {
//         label: "Lead",
//         resource: "lead",
//         permissions: [
//           { id: "ld_1",  name: "Create Lead",            resource: "lead", action: "create",             description: "Add new leads to the system" },
//           { id: "ld_2",  name: "Update Lead",            resource: "lead", action: "update",             description: "Edit lead details and status" },
//           { id: "ld_3",  name: "Delete Lead",            resource: "lead", action: "delete",             description: "Remove leads from system" },
//           { id: "ld_4",  name: "Read Lead",              resource: "lead", action: "read",               description: "Access lead information" },
//           { id: "ld_5",  name: "Import Lead",            resource: "lead", action: "import",             description: "Import leads from file" },
//           { id: "ld_6",  name: "Export Lead",            resource: "lead", action: "export",             description: "Export leads to file" },
//           { id: "ld_7",  name: "Bulk Update Status",     resource: "lead", action: "bulk_update_status", description: "Update status of multiple leads at once" },
//           { id: "ld_8",  name: "Assign Lead",            resource: "lead", action: "assign",             description: "Assign leads to team members" },
//           { id: "ld_9",  name: "Bulk Update Stage",      resource: "lead", action: "bulk_update_stage",  description: "Update stage of multiple leads at once" },
//           { id: "ld_10", name: "Update Priority",        resource: "lead", action: "update_priority",    description: "Change lead priority" },
//         ],
//       },
//       {
//         label: "Buyer",
//         resource: "buyer",
//         permissions: [
//           { id: "by_1",  name: "Create Buyer",        resource: "buyer", action: "create",            description: "Add new buyer records" },
//           { id: "by_2",  name: "Update Buyer",        resource: "buyer", action: "update",            description: "Edit buyer records" },
//           { id: "by_3",  name: "Buyer Account",       resource: "buyer", action: "account",           description: "Manage buyer account access" },
//           { id: "by_4",  name: "Import Buyer",        resource: "buyer", action: "import",            description: "Import buyers from file" },
//           { id: "by_5",  name: "Export Buyer",        resource: "buyer", action: "export",            description: "Export buyers to file" },
//           { id: "by_6",  name: "Read Buyer",          resource: "buyer", action: "read",              description: "View buyer details" },
//           { id: "by_7",  name: "Call Buyer",          resource: "buyer", action: "call",              description: "Call buyer via integrated dialer" },
//           { id: "by_8",  name: "WhatsApp Buyer",      resource: "buyer", action: "whatsapp",          description: "Send WhatsApp message to buyer" },
//           { id: "by_9",  name: "Email Buyer",         resource: "buyer", action: "email",             description: "Send email to buyer" },
//           { id: "by_10", name: "Send Properties",     resource: "buyer", action: "send_properties",   description: "Send property listings to buyer" },
//           { id: "by_11", name: "Delete Buyer",        resource: "buyer", action: "delete",            description: "Delete buyer records" },
//           { id: "by_12", name: "Assign Buyer",        resource: "buyer", action: "assign",            description: "Assign buyers to agents" },
//           { id: "by_13", name: "Bulk Update Stage",   resource: "buyer", action: "bulk_update_stage", description: "Update stage of multiple buyers at once" },
//           { id: "by_14", name: "Update Priority",     resource: "buyer", action: "update_priority",   description: "Change buyer priority" },
//         ],
//       },
//       {
//         label: "Seller",
//         resource: "seller",
//         permissions: [
//           { id: "sl_1",  name: "Create Seller",        resource: "seller", action: "create",             description: "Add new seller records" },
//           { id: "sl_2",  name: "Update Seller",        resource: "seller", action: "update",             description: "Edit seller records" },
//           { id: "sl_3",  name: "Delete Seller",        resource: "seller", action: "delete",             description: "Delete seller records" },
//           { id: "sl_4",  name: "Read Seller",          resource: "seller", action: "read",               description: "View seller details" },
//           { id: "sl_5",  name: "Import Seller",        resource: "seller", action: "import",             description: "Import sellers from file" },
//           { id: "sl_6",  name: "Export Seller",        resource: "seller", action: "export",             description: "Export sellers to file" },
//           { id: "sl_7",  name: "Seller Account",       resource: "seller", action: "account",            description: "Manage seller account access" },
//           { id: "sl_8",  name: "Call Seller",          resource: "seller", action: "call",               description: "Call seller via integrated dialer" },
//           { id: "sl_9",  name: "WhatsApp Seller",      resource: "seller", action: "whatsapp",           description: "Send WhatsApp message to seller" },
//           { id: "sl_10", name: "Email Seller",         resource: "seller", action: "email",              description: "Send email to seller" },
//           { id: "sl_11", name: "Bulk Update Status",   resource: "seller", action: "bulk_update_status", description: "Update status of multiple sellers at once" },
//           { id: "sl_12", name: "Bulk Update Stage",    resource: "seller", action: "bulk_update_stage",  description: "Update stage of multiple sellers at once" },
//           { id: "sl_13", name: "Assign Seller",        resource: "seller", action: "assign",             description: "Assign sellers to agents" },
//         ],
//       },
//       {
//         label: "Property",
//         resource: "property",
//         permissions: [
//           { id: "pr_1",  name: "Create Property",      resource: "property", action: "create",            description: "Add new property listings" },
//           { id: "pr_2",  name: "Download Brochure",    resource: "property", action: "download_brochure", description: "Download property brochure" },
//           { id: "pr_3",  name: "Import Property",      resource: "property", action: "import",            description: "Import properties from file" },
//           { id: "pr_4",  name: "Export Property",      resource: "property", action: "export",            description: "Export properties to file" },
//           { id: "pr_5",  name: "Read Property",        resource: "property", action: "read",              description: "Access property information" },
//           { id: "pr_6",  name: "Assign Property",      resource: "property", action: "assign",            description: "Assign properties to agents" },
//           { id: "pr_7",  name: "Update Property",      resource: "property", action: "update",            description: "Edit property details" },
//           { id: "pr_8",  name: "Mark Private",         resource: "property", action: "mark_private",      description: "Mark a property as private/hidden" },
//           { id: "pr_9",  name: "Delete Property",      resource: "property", action: "delete",            description: "Remove property listings" },
//         ],
//       },
//       {
//         label: "Contact Message",
//         resource: "contact",
//         permissions: [
//           { id: "cm_1", name: "Read Contact Messages",    resource: "contact", action: "read",     description: "View incoming contact messages" },
//           { id: "cm_2", name: "Assign Contact Messages",  resource: "contact", action: "assign",   description: "Assign contact messages to team" },
//           { id: "cm_3", name: "Favorite Contact Messages",resource: "contact", action: "favorite", description: "Mark contact messages as favourite" },
//           { id: "cm_4", name: "Call Contact",             resource: "contact", action: "call",     description: "Call contact via integrated dialer" },
//           { id: "cm_5", name: "Email Contact",            resource: "contact", action: "email",    description: "Send email to contact" },
//           { id: "cm_6", name: "Export Contact Messages",  resource: "contact", action: "export",   description: "Export contact messages" },
//           { id: "cm_7", name: "Delete Contact Messages",  resource: "contact", action: "delete",   description: "Delete contact messages" },
//         ],
//       },
//     ],
//   },

//   // 5. Blog
//   {
//     section: "Blog",
//     icon: <FileText className="h-4 w-4" />,
//     groups: [
//       {
//         label: "Blog",
//         resource: "blog",
//         permissions: [
//           { id: "bl_1", name: "Create Blog",        resource: "blog", action: "create",        description: "Add new blog posts" },
//           { id: "bl_2", name: "Delete Blog",        resource: "blog", action: "delete",        description: "Delete blog posts" },
//           { id: "bl_3", name: "Update Blog",        resource: "blog", action: "update",        description: "Edit existing blog posts" },
//           { id: "bl_4", name: "Read Blog",          resource: "blog", action: "read",          description: "View blog posts" },
//           { id: "bl_5", name: "Read Comments",      resource: "blog", action: "view_comments", description: "View blog post comments" },
//           { id: "bl_6", name: "AI Write Blog",      resource: "blog", action: "ai_write",      description: "Generate blog content using AI writer" },
//           { id: "bl_7", name: "Create RSS Source",  resource: "blog", action: "rss_add",       description: "Add an RSS feed source" },
//           { id: "bl_8", name: "Import RSS Source",  resource: "blog", action: "rss_import",    description: "Import posts from RSS feed" },
//           { id: "bl_9", name: "Delete RSS Source",  resource: "blog", action: "rss_delete",    description: "Delete an RSS feed source" },
//         ],
//       },
//     ],
//   },

//   // 6. Template Center
//   {
//     section: "Template Center",
//     icon: <Layers className="h-4 w-4" />,
//     groups: [
//       {
//         label: "Template Center",
//         resource: "template_center",
//         permissions: [
//           { id: "tc_1",  name: "Create Template",     resource: "template_center", action: "create",     description: "Create new templates" },
//           { id: "tc_2",  name: "Read Template",       resource: "template_center", action: "read",       description: "View existing templates" },
//           { id: "tc_3",  name: "Update Template",     resource: "template_center", action: "update",     description: "Edit templates" },
//           { id: "tc_4",  name: "Delete Template",     resource: "template_center", action: "delete",     description: "Delete templates" },
//           { id: "tc_5",  name: "Import Template",     resource: "template_center", action: "import",     description: "Import templates from file" },
//           { id: "tc_6",  name: "Export Template",     resource: "template_center", action: "export",     description: "Export templates to file" },
//           { id: "tc_7",  name: "Approve Template",    resource: "template_center", action: "approve",    description: "Approve templates for use" },
//           { id: "tc_8",  name: "Reject Template",     resource: "template_center", action: "reject",     description: "Reject submitted templates" },
//           { id: "tc_9",  name: "Activate Template",   resource: "template_center", action: "activate",   description: "Activate a template" },
//           { id: "tc_10", name: "Deactivate Template", resource: "template_center", action: "deactivate", description: "Deactivate a template" },
//         ],
//       },
//     ],
//   },

//   // 7. WhatsApp CRM  — Overview removed, Inbox added
//   {
//     section: "WhatsApp CRM",
//     icon: <MessageSquare className="h-4 w-4" />,
//     groups: [
//       // ✅ Inbox (replaces Overview)
//       {
//         label: "Inbox",
//         resource: "whatsapp_inbox",
//         permissions: [
//           { id: "wi_1", name: "Read Inbox", resource: "whatsapp_inbox", action: "read", description: "View WhatsApp inbox messages" },
//         ],
//       },
//       {
//         label: "Template",
//         resource: "whatsapp_template",
//         permissions: [
//           { id: "wt_1", name: "Create Template",      resource: "whatsapp_template", action: "create",      description: "Create WhatsApp message templates" },
//           { id: "wt_2", name: "Read Template",        resource: "whatsapp_template", action: "read",        description: "View WhatsApp message templates" },
//           { id: "wt_3", name: "Delete Template",      resource: "whatsapp_template", action: "delete",      description: "Delete WhatsApp message templates" },
//           { id: "wt_4", name: "Bulk Delete Template", resource: "whatsapp_template", action: "bulk_delete", description: "Bulk delete WhatsApp templates" },
//         ],
//       },
//       {
//         label: "Campaign",
//         resource: "whatsapp_campaign",
//         permissions: [
//           { id: "wc_1", name: "Create Campaign",      resource: "whatsapp_campaign", action: "create",      description: "Create new WhatsApp campaigns" },
//           { id: "wc_2", name: "Launch Campaign",      resource: "whatsapp_campaign", action: "launch",      description: "Launch WhatsApp campaigns" },
//           { id: "wc_3", name: "Read Campaign",        resource: "whatsapp_campaign", action: "read",        description: "View WhatsApp campaigns" },
//           { id: "wc_4", name: "Bulk Delete Campaign", resource: "whatsapp_campaign", action: "bulk_delete", description: "Bulk delete WhatsApp campaigns" },
//         ],
//       },
//       {
//         label: "Chatbot Flow",
//         resource: "whatsapp_chatbot",
//         permissions: [
//           { id: "wcb_1", name: "Create Chatbot Flow",   resource: "whatsapp_chatbot", action: "create",   description: "Create WhatsApp chatbot flows" },
//           { id: "wcb_2", name: "Read Chatbot Flow",     resource: "whatsapp_chatbot", action: "read",     description: "View chatbot flows" },
//           { id: "wcb_3", name: "Update Chatbot Flow",   resource: "whatsapp_chatbot", action: "update",   description: "Edit chatbot flows" },
//           { id: "wcb_4", name: "Delete Chatbot Flow",   resource: "whatsapp_chatbot", action: "delete",   description: "Delete chatbot flows" },
//           { id: "wcb_5", name: "Activate Chatbot Flow", resource: "whatsapp_chatbot", action: "activate", description: "Activate/deactivate chatbot flows" },
//         ],
//       },
//       {
//         label: "Analytics",
//         resource: "whatsapp_analytics",
//         permissions: [
//           { id: "wa_1", name: "Read Analytics",       resource: "whatsapp_analytics", action: "read",       description: "View WhatsApp analytics" },
//           { id: "wa_2", name: "Read Meta Spend",      resource: "whatsapp_analytics", action: "meta_spend", description: "View Meta ad spend analytics" },
//         ],
//       },
//       {
//         label: "WhatsApp CRM Settings",
//         resource: "whatsapp_settings",
//         permissions: [
//           { id: "ws_1", name: "Manage Settings",      resource: "whatsapp_settings", action: "manage",       description: "Manage WhatsApp CRM settings" },
//           { id: "ws_2", name: "Configure API",        resource: "whatsapp_settings", action: "api_config",   description: "Configure API settings" },
//           { id: "ws_3", name: "Configure Webhook",    resource: "whatsapp_settings", action: "webhook",      description: "Configure webhook settings" },
//           { id: "ws_4", name: "Manage Integration",   resource: "whatsapp_settings", action: "integration",  description: "Manage third-party integrations" },
//           { id: "ws_5", name: "Meta Account Config",  resource: "whatsapp_settings", action: "meta_account", description: "Configure Meta account settings" },
//         ],
//       },
//     ],
//   },

//   // 8. Settings
//   {
//     section: "Settings",
//     icon: <Settings className="h-4 w-4" />,
//     groups: [
//       {
//         label: "General Settings",
//         resource: "settings_general",
//         permissions: [
//           { id: "sg_1", name: "Manage General Settings", resource: "settings_general", action: "manage", description: "Access and manage general system settings" },
//         ],
//       },
//       {
//         label: "Role & Permission",
//         resource: "settings_rbac",
//         permissions: [
//           { id: "sr_1", name: "Manage Role Permissions", resource: "settings_rbac", action: "manage", description: "Manage roles and permissions" },
//         ],
//       },
//       {
//         label: "Integration",
//         resource: "settings_integration",
//         permissions: [
//           { id: "si_1", name: "Manage Integration", resource: "settings_integration", action: "manage", description: "Manage third-party integrations" },
//         ],
//       },
//       {
//         label: "AI Settings",
//         resource: "settings_ai",
//         permissions: [
//           { id: "sai_1", name: "Manage AI Settings", resource: "settings_ai", action: "manage", description: "Configure AI features and settings" },
//         ],
//       },
//       {
//         label: "Master Data",
//         resource: "settings_master",
//         permissions: [
//           { id: "sm_1", name: "Manage Variable Center", resource: "settings_master", action: "manage", description: "Manage master data variables" },
//           { id: "sm_2", name: "Import Master Data",     resource: "settings_master", action: "import", description: "Import master data from file" },
//           { id: "sm_3", name: "Export Master Data",     resource: "settings_master", action: "export", description: "Export master data to file" },
//         ],
//       },
//       {
//         label: "User Management",
//         resource: "user",
//         permissions: [
//           { id: "us_1",  name: "Create User",           resource: "user", action: "create",          description: "Create new user accounts" },
//           { id: "us_2",  name: "Import User",           resource: "user", action: "import",          description: "Import users from file" },
//           { id: "us_3",  name: "Export User",           resource: "user", action: "export",          description: "Export users to file" },
//           { id: "us_4",  name: "Update User",           resource: "user", action: "update",          description: "Edit user information and settings" },
//           { id: "us_5",  name: "Share User",            resource: "user", action: "share",           description: "Share user profile or data" },
//           { id: "us_6",  name: "Activate User",         resource: "user", action: "activate",        description: "Activate a user account" },
//           { id: "us_7",  name: "Deactivate User",       resource: "user", action: "deactivate",      description: "Deactivate a user account" },
//           { id: "us_8",  name: "Delete User",           resource: "user", action: "delete",          description: "Remove user accounts" },
//           { id: "us_9",  name: "Bulk Activate User",    resource: "user", action: "bulk_activate",   description: "Activate multiple user accounts" },
//           { id: "us_10", name: "Bulk Deactivate User",  resource: "user", action: "bulk_deactivate", description: "Deactivate multiple user accounts" },
//         ],
//       },
//     ],
//   },
// ];

// // Flat list of ALL permissions
// const STATIC_PERMISSIONS: Permission[] = PERMISSION_SECTIONS.flatMap((s) =>
//   s.groups.flatMap((g) => g.permissions)
// );

// // Resource color map
// const resourceMeta: Record<string, { color: string; bg: string }> = {
//   overview:             { color: "text-slate-700",   bg: "bg-slate-50 border-slate-200" },
//   dashboard:            { color: "text-cyan-700",    bg: "bg-cyan-50 border-cyan-200" },
//   home:                 { color: "text-sky-700",     bg: "bg-sky-50 border-sky-200" },
//   lead:                 { color: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
//   buyer:                { color: "text-purple-700",  bg: "bg-purple-50 border-purple-200" },
//   seller:               { color: "text-rose-700",    bg: "bg-rose-50 border-rose-200" },
//   property:             { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
//   contact:              { color: "text-teal-700",    bg: "bg-teal-50 border-teal-200" },
//   blog:                 { color: "text-lime-700",    bg: "bg-lime-50 border-lime-200" },
//   template_center:      { color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
//   whatsapp_inbox:       { color: "text-green-700",   bg: "bg-green-50 border-green-200" },
//   whatsapp_template:    { color: "text-green-700",   bg: "bg-green-50 border-green-200" },
//   whatsapp_campaign:    { color: "text-green-700",   bg: "bg-green-50 border-green-200" },
//   whatsapp_chatbot:     { color: "text-green-700",   bg: "bg-green-50 border-green-200" },
//   whatsapp_analytics:   { color: "text-green-700",   bg: "bg-green-50 border-green-200" },
//   whatsapp_settings:    { color: "text-green-700",   bg: "bg-green-50 border-green-200" },
//   settings_general:     { color: "text-gray-700",    bg: "bg-gray-50 border-gray-200" },
//   settings_rbac:        { color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
//   settings_integration: { color: "text-indigo-700",  bg: "bg-indigo-50 border-indigo-200" },
//   settings_ai:          { color: "text-fuchsia-700", bg: "bg-fuchsia-50 border-fuchsia-200" },
//   settings_master:      { color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
//   user:                 { color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
// };

// // Section accent colors
// const sectionAccent: Record<string, string> = {
//   "Overview":        "border-slate-300 bg-slate-50",
//   "Dashboard":       "border-cyan-300 bg-cyan-50",
//   "Home":            "border-sky-300 bg-sky-50",
//   "CRM":             "border-orange-300 bg-orange-50",
//   "Blog":            "border-lime-300 bg-lime-50",
//   "Template Center": "border-violet-300 bg-violet-50",
//   "WhatsApp CRM":    "border-green-300 bg-green-50",
//   "Settings":        "border-gray-300 bg-gray-50",
// };

// const sectionIconColor: Record<string, string> = {
//   "Overview":        "text-slate-600",
//   "Dashboard":       "text-cyan-600",
//   "Home":            "text-sky-600",
//   "CRM":             "text-orange-600",
//   "Blog":            "text-lime-600",
//   "Template Center": "text-violet-600",
//   "WhatsApp CRM":    "text-green-600",
//   "Settings":        "text-gray-600",
// };

// // ─── Helper: module_permissions ↔ flat keys ───────────────────────────────────
// function flattenModulePermissions(
//   mp: Record<string, Record<string, boolean>> | null | undefined
// ): string[] {
//   if (!mp) return [];
//   const keys: string[] = [];
//   for (const [resource, actions] of Object.entries(mp)) {
//     for (const [action, enabled] of Object.entries(actions)) {
//       if (enabled) keys.push(`${resource}.${action}`);
//     }
//   }
//   return keys;
// }

// function buildModulePermissions(
//   keys: string[]
// ): Record<string, Record<string, boolean>> {
//   const mp: Record<string, Record<string, boolean>> = {};
//   for (const key of keys) {
//     const dotIdx = key.indexOf(".");
//     if (dotIdx < 0) continue;
//     const resource = key.slice(0, dotIdx);
//     const action   = key.slice(dotIdx + 1);
//     if (!mp[resource]) mp[resource] = {};
//     mp[resource][action] = true;
//   }
//   return mp;
// }

// // ─── Avatar Initials ──────────────────────────────────────────────────────────
// const AvatarInitials: React.FC<{ user: AppUser }> = ({ user }) => {
//   const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
//   const colors = ["bg-blue-500","bg-emerald-500","bg-violet-500","bg-rose-500","bg-amber-500","bg-teal-500"];
//   const color  = colors[user.id % colors.length];
//   if (user.avatar) {
//     return <img src={user.avatar} alt={initials} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />;
//   }
//   return (
//     <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shadow-sm border-2 border-white`}>
//       {initials}
//     </div>
//   );
// };

// // ─── IndeterminateCheckbox helper ─────────────────────────────────────────────
// interface IndeterminateCheckboxProps {
//   checked: boolean;
//   indeterminate: boolean;
//   onChange: () => void;
//   disabled?: boolean;
//   className?: string;
// }
// const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
//   checked, indeterminate, onChange, disabled = false, className = "",
// }) => {
//   const ref = useRef<HTMLInputElement>(null);
//   useEffect(() => {
//     if (ref.current) ref.current.indeterminate = indeterminate;
//   }, [indeterminate]);
//   return (
//     <input
//       ref={ref}
//       type="checkbox"
//       checked={checked}
//       disabled={disabled}
//       onChange={onChange}
//       className={`w-3.5 h-3.5 rounded border-gray-300 text-[#e87722] focus:ring-[#e87722] focus:ring-1 shrink-0 ${className}`}
//     />
//   );
// };

// // ─── Permission checkbox grid ─────────────────────────────────────────────────
// interface PermChecklistProps {
//   checkedKeys: string[];
//   onToggle: (permId: string) => void;
//   onToggleGroup: (group: PermissionGroup, forceAll?: boolean) => void;
//   disabled?: boolean;
// }

// const PermChecklist: React.FC<PermChecklistProps> = ({
//   checkedKeys, onToggle, onToggleGroup, disabled = false,
// }) => {
//   const hasKey = (perm: Permission) =>
//     checkedKeys.includes(`${perm.resource}.${perm.action}`);

//   return (
//     <div className="space-y-4">
//       {PERMISSION_SECTIONS.map((section) => {
//         const sectionPerms  = section.groups.flatMap((g) => g.permissions);
//         const sectionTotal   = sectionPerms.length;
//         const sectionChecked = sectionPerms.filter(hasKey).length;
//         const accent   = sectionAccent[section.section] ?? "border-gray-200 bg-gray-50";
//         const iconCol  = sectionIconColor[section.section] ?? "text-gray-600";

//         return (
//           <div key={section.section} className={`rounded-xl border-2 overflow-hidden ${accent}`}>
//             {/* Section header */}
//             <div className="px-4 py-2.5 flex items-center justify-between">
//               <div className={`flex items-center gap-2 text-xs font-bold ${iconCol}`}>
//                 {section.icon}
//                 {section.section}
//               </div>
//               <span
//                 className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
//                   sectionChecked > 0
//                     ? "bg-orange-100 text-[#e87722]"
//                     : "bg-white/80 text-gray-400"
//                 }`}
//               >
//                 {sectionChecked}/{sectionTotal}
//               </span>
//             </div>

//             {/* Groups */}
//             <div className="divide-y divide-white/60 px-3 pb-3 space-y-2.5">
//               {section.groups.map((group) => {
//                 const meta      = resourceMeta[group.resource] ?? { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
//                 const gChecked  = group.permissions.filter(hasKey).length;
//                 const gTotal    = group.permissions.length;
//                 const allChecked  = gChecked === gTotal;
//                 const someChecked = gChecked > 0 && !allChecked;

//                 return (
//                   <div key={group.resource} className="pt-2.5">
//                     {/* Group header */}
//                     <div className="flex items-center justify-between mb-1.5">
//                       <div className="flex items-center gap-2">
//                         <h6 className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
//                           {group.label} Permissions
//                         </h6>
//                       </div>

//                       {/* Right side: Select All + count */}
//                       <div className="flex items-center gap-3">
//                         {!disabled && (
//                           <label className="flex items-center gap-1.5 cursor-pointer select-none group/sa">
//                             <IndeterminateCheckbox
//                               checked={allChecked}
//                               indeterminate={someChecked}
//                               onChange={() => onToggleGroup(group)}
//                               disabled={disabled}
//                             />
//                             <span className="text-[10px] font-semibold text-gray-400 group-hover/sa:text-[#e87722] transition-colors">
//                               Select All
//                             </span>
//                           </label>
//                         )}
//                         <span
//                           className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
//                             gChecked > 0
//                               ? "bg-orange-50 text-[#e87722]"
//                               : "bg-white/70 text-gray-400"
//                           }`}
//                         >
//                           {gChecked}/{gTotal}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Permission grid */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white rounded-lg border border-gray-100 overflow-hidden divide-y divide-gray-50">
//                       {group.permissions.map((perm) => {
//                         const checked = hasKey(perm);
//                         return (
//                           <label
//                             key={perm.id}
//                             className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-orange-50/40 ${
//                               checked ? "bg-orange-50/20" : ""
//                             } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
//                           >
//                             <input
//                               type="checkbox"
//                               checked={checked}
//                               disabled={disabled}
//                               onChange={() => onToggle(perm.id)}
//                               className="w-3.5 h-3.5 rounded border-gray-300 text-[#e87722] focus:ring-[#e87722] focus:ring-1 shrink-0"
//                             />
//                             <span
//                               className={`text-xs leading-tight ${
//                                 checked ? "text-[#1a3a5c] font-semibold" : "text-gray-600"
//                               }`}
//                             >
//                               {perm.name}
//                             </span>
//                           </label>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// // ─── Main Page ────────────────────────────────────────────────────────────────
// const RolesPermissionsPage: React.FC = () => {
//   const { user } = useAuth();

//   const [roles, setRoles]             = useState<Role[]>([]);
//   const [loading, setLoading]         = useState(true);
//   const [activeTab, setActiveTab]     = useState<"roles" | "permissions" | "users">("roles");
//   const [editingRole, setEditingRole] = useState<Role | null>(null);

//   // Users tab
//   const [allUsers, setAllUsers]                 = useState<AppUser[]>([]);
//   const [usersLoading, setUsersLoading]         = useState(false);
//   const [userSearch, setUserSearch]             = useState("");
//   const [editingUser, setEditingUser]           = useState<AppUser | null>(null);
//   const [editingUserPerms, setEditingUserPerms] = useState<string[]>([]);
//   const [savingUserPerms, setSavingUserPerms]   = useState(false);

//   useEffect(() => { console.log("CURRENT USER ===>", user); }, [user]);
//   useEffect(() => { fetchMasterRoles(); }, []);
//   useEffect(() => {
//     if (activeTab === "users" && allUsers.length === 0) fetchAllUsers();
//   }, [activeTab]);

//   // ── Fetch roles ────────────────────────────────────────────────────────────
//   const fetchMasterRoles = async () => {
//     setLoading(true);
//     try {
//       const commonMasterTypes: any[] = await masterDataAPI.getAllMasterTypes("common");
//       const roleType = commonMasterTypes.find(
//         (t) => ["role","roles"].includes(((t.name || "") as string).toLowerCase().trim())
//       );
//       if (!roleType) { setRoles([]); return; }

//       const masterRoles = await masterDataAPI.getMasterValues(roleType.id);
//       if (!Array.isArray(masterRoles)) { setRoles([]); return; }

//       const mapped: Role[] = masterRoles.map((item: any) => {
//         const rawName = item.value || item.name || `Role ${item.id}`;
//         return {
//           id: String(rawName).toLowerCase().trim(),
//           name: rawName,
//           description: item.description || item.meta?.description || "",
//           permissions: Array.isArray(item.permissions)
//             ? item.permissions.map((p: any) => (typeof p === "string" ? p : `${p.resource}.${p.action}`))
//             : [],
//           user_count: typeof item.user_count === "number" ? item.user_count : 0,
//           is_system: !!item.is_system,
//           created_at: item.created_at || new Date().toISOString(),
//         };
//       });

//       const merged = await Promise.all(
//         mapped.map(async (role) => {
//           try {
//             const dbPerms = await rbacAPI.getRolePermissions(role.id);
//             if (Array.isArray(dbPerms) && dbPerms.length > 0) return { ...role, permissions: dbPerms };
//             return role;
//           } catch { return role; }
//         })
//       );
//       setRoles(merged);
//     } catch (error) {
//       console.error("Failed to load roles:", error);
//       setRoles([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Fetch users ────────────────────────────────────────────────────────────
//   const fetchAllUsers = async () => {
//     setUsersLoading(true);
//     try {
//       const data = await usersAPI.getAllUsers();
//       const list: AppUser[] = Array.isArray(data) ? data : data?.users ?? data?.data ?? [];
//       setAllUsers(list);
//     } catch (error) {
//       console.error("Failed to fetch users:", error);
//       toast.error("Failed to load users");
//     } finally {
//       setUsersLoading(false);
//     }
//   };

//   // ── Role modal helpers ─────────────────────────────────────────────────────
//   const handleUpdateRole = async (role: Role) => {
//     try {
//       await rbacAPI.updateRolePermissions(role.id, role.permissions);
//       setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
//       setEditingRole(null);
//       toast.success("Role permissions updated successfully");
//     } catch (error: any) {
//       toast.error(error?.message || "Failed to update role permissions");
//     }
//   };

//   const toggleRolePerm = (permId: string) => {
//     if (!editingRole) return;
//     const perm = STATIC_PERMISSIONS.find((p) => p.id === permId);
//     if (!perm) return;
//     const key = `${perm.resource}.${perm.action}`;
//     const next = editingRole.permissions.includes(key)
//       ? editingRole.permissions.filter((k) => k !== key)
//       : [...editingRole.permissions, key];
//     setEditingRole({ ...editingRole, permissions: next });
//   };

//   const toggleRoleGroup = (group: PermissionGroup) => {
//     if (!editingRole) return;
//     const keys = group.permissions.map((p) => `${p.resource}.${p.action}`);
//     const allChecked = keys.every((k) => editingRole.permissions.includes(k));
//     const next = allChecked
//       ? editingRole.permissions.filter((k) => !keys.includes(k))
//       : [...new Set([...editingRole.permissions, ...keys])];
//     setEditingRole({ ...editingRole, permissions: next });
//   };

//   // ── User modal helpers ─────────────────────────────────────────────────────
//   const openUserPermEditor = (u: AppUser) => {
//     setEditingUser(u);
//     setEditingUserPerms(flattenModulePermissions(u.module_permissions));
//   };

//   const toggleUserPerm = (permId: string) => {
//     const perm = STATIC_PERMISSIONS.find((p) => p.id === permId);
//     if (!perm) return;
//     const key = `${perm.resource}.${perm.action}`;
//     setEditingUserPerms((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   const toggleUserGroup = (group: PermissionGroup) => {
//     const keys = group.permissions.map((p) => `${p.resource}.${p.action}`);
//     const allChecked = keys.every((k) => editingUserPerms.includes(k));
//     setEditingUserPerms((prev) =>
//       allChecked
//         ? prev.filter((k) => !keys.includes(k))
//         : [...new Set([...prev, ...keys])]
//     );
//   };

//   const saveUserPermissions = async () => {
//     if (!editingUser) return;
//     setSavingUserPerms(true);
//     try {
//       const module_permissions = buildModulePermissions(editingUserPerms);
//       await usersAPI.updateUser(String(editingUser.id), { module_permissions });
//       setAllUsers((prev) =>
//         prev.map((u) => u.id === editingUser.id ? { ...u, module_permissions } : u)
//       );
//       toast.success(`Permissions updated for ${editingUser.first_name} ${editingUser.last_name}`);
//       setEditingUser(null);
//     } catch (error: any) {
//       toast.error(error?.message || "Failed to save user permissions");
//     } finally {
//       setSavingUserPerms(false);
//     }
//   };

//   const filteredUsers = allUsers.filter((u) => {
//     const q = userSearch.toLowerCase();
//     return (
//       `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
//       u.email.toLowerCase().includes(q) ||
//       u.role.toLowerCase().includes(q) ||
//       (u.department ?? "").toLowerCase().includes(q)
//     );
//   });

//   const totalPerms = STATIC_PERMISSIONS.length;

//   if (loading) {
//     return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
//   }

//   // ─── JSX ──────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-2">

//       {/* Page Header */}
//       <div className="mb-5">
//         <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
//           <Link to="/dashboard/settings" className="flex items-center gap-1 text-[#1a3a5c] hover:text-[#e87722] font-medium transition-colors">
//             <ArrowLeft className="h-3.5 w-3.5" /> Settings
//           </Link>
//           <ChevronRight className="h-3 w-3" />
//           <span className="text-gray-500">Roles &amp; Permissions</span>
//         </div>

//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//           <div className="flex items-center gap-3">
//             <div className="w-1 h-10 rounded-full bg-[#e87722] shrink-0" />
//             <div>
//               <h1 className="text-xl sm:text-2xl font-bold text-[#1a3a5c] leading-tight">Roles &amp; Permissions</h1>
//               <p className="text-xs text-gray-400 mt-0.5">Manage user roles and their access permissions</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 flex-wrap">
//             <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a3a5c] shadow-sm">
//               <Shield className="h-3.5 w-3.5 text-[#e87722]" />{roles.length} Roles
//             </div>
//             <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a3a5c] shadow-sm">
//               <Key className="h-3.5 w-3.5 text-[#e87722]" />{totalPerms} Permissions
//             </div>
//             <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a3a5c] shadow-sm">
//               <Users className="h-3.5 w-3.5 text-[#e87722]" />{allUsers.length} Users
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Card */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

//         {/* Tabs */}
//         <div className="border-b border-gray-200 px-4 sm:px-6 sticky top-0 bg-white z-10">
//           <nav className="flex gap-0">
//             {(["roles", "permissions", "users"] as const).map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 ${
//                   activeTab === tab
//                     ? "border-[#e87722] text-[#e87722]"
//                     : "border-transparent text-gray-500 hover:text-[#1a3a5c] hover:border-gray-300"
//                 }`}
//               >
//                 {tab === "roles" ? <Shield className="h-4 w-4" /> : tab === "permissions" ? <Lock className="h-4 w-4" /> : <User className="h-4 w-4" />}
//                 <span className="capitalize">{tab}</span>
//                 <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${activeTab === tab ? "bg-orange-100 text-[#e87722]" : "bg-gray-100 text-gray-500"}`}>
//                   {tab === "roles" ? roles.length : tab === "permissions" ? totalPerms : allUsers.length}
//                 </span>
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="p-4 sm:p-6">

//           {/* ── ROLES TAB ── */}
//           {activeTab === "roles" && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//               {roles.map((role) => (
//                 <div key={role.id} className="group relative border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-[#e87722] hover:shadow-md transition-all duration-200 bg-white overflow-hidden">
//                   <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1a3a5c] to-[#e87722] opacity-0 group-hover:opacity-100 transition-opacity" />
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-center gap-2.5 min-w-0">
//                       <div className="w-9 h-9 rounded-lg bg-[#1a3a5c]/8 border border-[#1a3a5c]/15 flex items-center justify-center shrink-0">
//                         <Shield className="h-4 w-4 text-[#1a3a5c]" />
//                       </div>
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-1.5 flex-wrap">
//                           <h3 className="text-sm font-bold text-[#1a3a5c] truncate">{role.name}</h3>
//                           {role.is_system && <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-[#1a3a5c] text-white rounded">System</span>}
//                         </div>
//                         {role.description && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{role.description}</p>}
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setEditingRole(role)}
//                       disabled={role.is_system}
//                       className="shrink-0 ml-2 p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#e87722] hover:border-[#e87722] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//                       title={role.is_system ? "System role cannot be edited" : "Edit permissions"}
//                     >
//                       <Edit className="h-3.5 w-3.5" />
//                     </button>
//                   </div>
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="flex items-center gap-1.5 text-xs text-gray-500">
//                       <Users className="h-3.5 w-3.5 text-gray-400" />
//                       <span className="font-semibold text-[#1a3a5c]">{role.user_count}</span> users
//                     </div>
//                     <div className="w-px h-3 bg-gray-200" />
//                     <div className="flex items-center gap-1.5 text-xs text-gray-500">
//                       <Key className="h-3.5 w-3.5 text-gray-400" />
//                       <span className="font-semibold text-[#1a3a5c]">{role.permissions.length}</span> permissions
//                     </div>
//                   </div>
//                   <div className="border-t border-gray-100 pt-3">
//                     <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Permissions</p>
//                     <div className="flex flex-wrap gap-1">
//                       {role.permissions.slice(0, 4).map((p, idx) => (
//                         <span key={idx} className="inline-block px-2 py-0.5 text-[10px] font-medium bg-orange-50 text-[#e87722] border border-orange-100 rounded-full">
//                           {p.includes(".") ? p.split(".")[1] : p}
//                         </span>
//                       ))}
//                       {role.permissions.length > 4 && (
//                         <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">+{role.permissions.length - 4} more</span>
//                       )}
//                       {role.permissions.length === 0 && <span className="text-[10px] text-gray-300 italic">No permissions assigned</span>}
//                     </div>
//                   </div>
//                   <p className="text-[10px] text-gray-300 mt-2">
//                     Created {new Date(role.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
//                   </p>
//                 </div>
//               ))}
//               {roles.length === 0 && (
//                 <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
//                   <Shield className="h-12 w-12 mb-3 opacity-20" />
//                   <p className="text-sm font-medium">No roles found</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── PERMISSIONS TAB ── */}
//           {activeTab === "permissions" && (
//             <div className="space-y-5">
//               {PERMISSION_SECTIONS.map((section) => {
//                 const accent   = sectionAccent[section.section] ?? "border-gray-200 bg-gray-50";
//                 const iconCol  = sectionIconColor[section.section] ?? "text-gray-600";
//                 const sTotal   = section.groups.flatMap((g) => g.permissions).length;
//                 return (
//                   <div key={section.section} className={`rounded-xl border-2 overflow-hidden ${accent}`}>
//                     <div className="px-4 py-3 flex items-center gap-2">
//                       <span className={iconCol}>{section.icon}</span>
//                       <h3 className={`text-sm font-bold ${iconCol}`}>{section.section}</h3>
//                       <span className="ml-auto text-[10px] font-semibold bg-white/70 px-2 py-0.5 rounded-full text-gray-500">{sTotal} permissions</span>
//                     </div>
//                     <div className="px-3 pb-3 space-y-3">
//                       {section.groups.map((group) => {
//                         const meta = resourceMeta[group.resource] ?? { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
//                         return (
//                           <div key={group.resource}>
//                             <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${meta.color}`}>{group.label} Permissions</p>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//                               {group.permissions.map((perm) => (
//                                 <div key={perm.id} className="bg-white rounded-lg border border-white/80 shadow-sm p-3">
//                                   <div className="flex items-center gap-2 mb-1">
//                                     <Lock className="h-3 w-3 text-gray-300 shrink-0" />
//                                     <h4 className="text-xs font-semibold text-gray-800 truncate">{perm.name}</h4>
//                                   </div>
//                                   <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">{perm.description}</p>
//                                   <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded ${meta.bg} ${meta.color}`}>
//                                     {perm.resource}.{perm.action}
//                                   </span>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* ── USERS TAB ── */}
//           {activeTab === "users" && (
//             <div>
//               <div className="mb-4 flex items-center gap-3">
//                 <div className="relative flex-1 max-w-sm">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
//                   <input
//                     type="text"
//                     value={userSearch}
//                     onChange={(e) => setUserSearch(e.target.value)}
//                     placeholder="Search users by name, email, role..."
//                     className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e87722]/30 focus:border-[#e87722] transition-colors"
//                   />
//                 </div>
//                 <span className="text-xs text-gray-400 shrink-0">{filteredUsers.length} of {allUsers.length} users</span>
//               </div>

//               {usersLoading ? (
//                 <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
//               ) : filteredUsers.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-16 text-gray-400">
//                   <Users className="h-12 w-12 mb-3 opacity-20" />
//                   <p className="text-sm font-medium">{userSearch ? "No matching users found" : "No users found"}</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
//                   {filteredUsers.map((u) => {
//                     const permsFlat = flattenModulePermissions(u.module_permissions);
//                     return (
//                       <div key={u.id} className="group relative border border-gray-200 rounded-xl p-4 hover:border-[#e87722] hover:shadow-md transition-all duration-200 bg-white overflow-hidden">
//                         <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1a3a5c] to-[#e87722] opacity-0 group-hover:opacity-100 transition-opacity" />
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex items-center gap-2.5 min-w-0">
//                             <AvatarInitials user={u} />
//                             <div className="min-w-0">
//                               <div className="flex items-center gap-1.5 flex-wrap">
//                                 <h3 className="text-sm font-bold text-[#1a3a5c] truncate">{u.first_name} {u.last_name}</h3>
//                                 {u.is_active ? (
//                                   <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
//                                     <CheckCircle2 className="h-2.5 w-2.5" /> Active
//                                   </span>
//                                 ) : (
//                                   <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200 rounded-full">
//                                     <XCircle className="h-2.5 w-2.5" /> Inactive
//                                   </span>
//                                 )}
//                               </div>
//                               <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => openUserPermEditor(u)}
//                             className="shrink-0 ml-2 p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#e87722] hover:border-[#e87722] transition-colors"
//                             title="Edit permissions"
//                           >
//                             <Edit className="h-3.5 w-3.5" />
//                           </button>
//                         </div>
//                         <div className="flex items-center gap-2 mb-3 flex-wrap">
//                           <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-[#1a3a5c]/8 text-[#1a3a5c] border border-[#1a3a5c]/15 rounded-full">
//                             <Shield className="h-2.5 w-2.5" />{u.role}
//                           </span>
//                           {u.department && (
//                             <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">{u.department}</span>
//                           )}
//                         </div>
//                         <div className="border-t border-gray-100 pt-3">
//                           <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Custom Permissions</p>
//                           <div className="flex flex-wrap gap-1">
//                             {permsFlat.slice(0, 4).map((key, idx) => (
//                               <span key={idx} className="inline-block px-2 py-0.5 text-[10px] font-medium bg-orange-50 text-[#e87722] border border-orange-100 rounded-full">
//                                 {key.includes(".") ? key.split(".")[1] : key}
//                               </span>
//                             ))}
//                             {permsFlat.length > 4 && (
//                               <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">+{permsFlat.length - 4} more</span>
//                             )}
//                             {permsFlat.length === 0 && <span className="text-[10px] text-gray-300 italic">No custom permissions</span>}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Edit Role Modal ── */}
//       {editingRole && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
//           <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
//             <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3 min-w-0">
//                   <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center shrink-0">
//                     <Shield className="h-4 w-4 text-white" />
//                   </div>
//                   <div className="min-w-0">
//                     <h3 className="text-sm sm:text-base font-bold text-[#1a3a5c] truncate">Edit Permissions</h3>
//                     <p className="text-xs text-[#e87722] font-medium truncate">{editingRole.name}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 shrink-0 ml-3">
//                   <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{editingRole.permissions.length} selected</span>
//                   <button onClick={() => setEditingRole(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
//                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div className="px-4 sm:px-6 py-4">
//               <PermChecklist
//                 checkedKeys={editingRole.permissions}
//                 onToggle={toggleRolePerm}
//                 onToggleGroup={toggleRoleGroup}
//                 disabled={editingRole.is_system}
//               />
//               {editingRole.is_system && (
//                 <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
//                   <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
//                   <div>
//                     <p className="text-xs font-semibold text-amber-800">System Role</p>
//                     <p className="text-xs text-amber-700 mt-0.5">This is a system role. Permissions cannot be modified.</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-2.5">
//               <button
//                 onClick={() => handleUpdateRole(editingRole)}
//                 disabled={editingRole.is_system}
//                 className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Save className="h-3.5 w-3.5" /> Update Permissions
//               </button>
//               <button onClick={() => setEditingRole(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors">
//                 Cancel
//               </button>
//               <span className="ml-auto text-xs text-gray-400 hidden sm:inline">{editingRole.permissions.length} permissions selected</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Edit User Permissions Modal ── */}
//       {editingUser && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
//           <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
//             <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3 min-w-0">
//                   <AvatarInitials user={editingUser} />
//                   <div className="min-w-0">
//                     <h3 className="text-sm sm:text-base font-bold text-[#1a3a5c] truncate">{editingUser.first_name} {editingUser.last_name}</h3>
//                     <p className="text-xs text-[#e87722] font-medium truncate">{editingUser.role}{editingUser.department ? ` · ${editingUser.department}` : ""}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 shrink-0 ml-3">
//                   <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{editingUserPerms.length} selected</span>
//                   <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
//                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//                   </button>
//                 </div>
//               </div>
//               <div className="mt-3 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
//                 <Key className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
//                 <p className="text-[11px] text-blue-700 leading-relaxed">
//                   These are <strong>user-level overrides</strong> stored in <code className="bg-blue-100 px-1 rounded">module_permissions</code>. They override the user's role permissions for specific actions.
//                 </p>
//               </div>
//             </div>
//             <div className="px-4 sm:px-6 py-4">
//               <PermChecklist
//                 checkedKeys={editingUserPerms}
//                 onToggle={toggleUserPerm}
//                 onToggleGroup={toggleUserGroup}
//               />
//             </div>
//             <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-2.5">
//               <button
//                 onClick={saveUserPermissions}
//                 disabled={savingUserPerms}
//                 className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               >
//                 {savingUserPerms ? (
//                   <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                   </svg>
//                 ) : <Save className="h-3.5 w-3.5" />}
//                 {savingUserPerms ? "Saving..." : "Save Permissions"}
//               </button>
//               <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors">
//                 Cancel
//               </button>
//               <span className="ml-auto text-xs text-gray-400 hidden sm:inline">{editingUserPerms.length} permissions selected</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RolesPermissionsPage;


// src/pages/settings/RolesPermissionsPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Shield, Edit, Lock, Save, Users, Key, ChevronRight,
  Search, User, CheckCircle2, XCircle, Home, BarChart2, LayoutDashboard,
  MessageSquare, Settings, Bot, Megaphone, FileText, Layers
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { masterDataAPI } from "@/lib/mastersAPI";
import { toast } from "react-toastify";
import { rbacAPI } from "@/lib/rbacAPI";
import { usersAPI } from "@/lib/api";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system: boolean;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

interface PermissionGroup {
  label: string;
  resource: string;
  permissions: Permission[];
}

interface PermissionSection {
  section: string;
  icon: React.ReactNode;
  groups: PermissionGroup[];
}

interface AppUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: number;
  avatar?: string;
  designation?: string;
  department?: string;
  module_permissions?: Record<string, Record<string, boolean>> | null;
}

const PERMISSION_SECTIONS: PermissionSection[] = [
  // 1. Overview
  {
    section: "Overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
    groups: [
      {
        label: "Overview",
        resource: "overview",
        permissions: [
          { id: "ov_1", name: "Access Overview", resource: "overview", action: "access", description: "Access the overview/home dashboard" },
        ],
      },
    ],
  },

  // 2. Dashboard
  {
    section: "Dashboard",
    icon: <BarChart2 className="h-4 w-4" />,
    groups: [
      {
        label: "Dashboard",
        resource: "dashboard",
        permissions: [
          { id: "db_1", name: "Admin Dashboard", resource: "dashboard", action: "admin", description: "Access the admin dashboard" },
          { id: "db_2", name: "Manager Dashboard", resource: "dashboard", action: "manager", description: "Access the manager dashboard" },
          { id: "db_3", name: "Agent Dashboard", resource: "dashboard", action: "agent", description: "Access the agent dashboard" },
        ],
      },
    ],
  },

  // 3. Home
  {
    section: "Home",
    icon: <Home className="h-4 w-4" />,
    groups: [
      {
        label: "Home",
        resource: "home",
        permissions: [
          { id: "hm_1", name: "Create Home", resource: "home", action: "create", description: "Add home page content" },
          { id: "hm_2", name: "Update Home", resource: "home", action: "update", description: "Edit home page content" },
          { id: "hm_3", name: "Delete Home", resource: "home", action: "delete", description: "Delete home page content" },
          { id: "hm_4", name: "Bulk Update Home", resource: "home", action: "bulk_update", description: "Bulk update home page content" },
          { id: "hm_5", name: "Read Home", resource: "home", action: "read", description: "View home page content" },
        ],
      },
    ],
  },

  // 4. CRM
  {
    section: "CRM",
    icon: <Users className="h-4 w-4" />,
    groups: [
      {
        label: "Lead",
        resource: "lead",
        permissions: [
          { id: "ld_1", name: "Create Lead", resource: "lead", action: "create", description: "Add new leads to the system" },
          { id: "ld_2", name: "Update Lead", resource: "lead", action: "update", description: "Edit lead details and status" },
          { id: "ld_3", name: "Delete Lead", resource: "lead", action: "delete", description: "Remove leads from system" },
          { id: "ld_4", name: "Read Lead", resource: "lead", action: "read", description: "Access lead information" },
          { id: "ld_5", name: "Import Lead", resource: "lead", action: "import", description: "Import leads from file" },
          { id: "ld_6", name: "Export Lead", resource: "lead", action: "export", description: "Export leads to file" },
          { id: "ld_7", name: "Bulk Update Status", resource: "lead", action: "bulk_update_status", description: "Update status of multiple leads at once" },
          { id: "ld_8", name: "Assign Lead", resource: "lead", action: "assign", description: "Assign leads to team members" },
          { id: "ld_9", name: "Bulk Update Stage", resource: "lead", action: "bulk_update_stage", description: "Update stage of multiple leads at once" },
          { id: "ld_10", name: "Update Priority", resource: "lead", action: "update_priority", description: "Change lead priority" },
        ],
      },
      {
        label: "Buyer",
        resource: "buyer",
        permissions: [
          { id: "by_1", name: "Create Buyer", resource: "buyer", action: "create", description: "Add new buyer records" },
          { id: "by_2", name: "Update Buyer", resource: "buyer", action: "update", description: "Edit buyer records" },
          { id: "by_3", name: "Buyer Account", resource: "buyer", action: "account", description: "Manage buyer account access" },
          { id: "by_4", name: "Import Buyer", resource: "buyer", action: "import", description: "Import buyers from file" },
          { id: "by_5", name: "Export Buyer", resource: "buyer", action: "export", description: "Export buyers to file" },
          { id: "by_6", name: "Read Buyer", resource: "buyer", action: "read", description: "View buyer details" },
          { id: "by_7", name: "Call Buyer", resource: "buyer", action: "call", description: "Call buyer via integrated dialer" },
          { id: "by_8", name: "WhatsApp Buyer", resource: "buyer", action: "whatsapp", description: "Send WhatsApp message to buyer" },
          { id: "by_9", name: "Email Buyer", resource: "buyer", action: "email", description: "Send email to buyer" },
          { id: "by_10", name: "Send Properties", resource: "buyer", action: "send_properties", description: "Send property listings to buyer" },
          { id: "by_11", name: "Delete Buyer", resource: "buyer", action: "delete", description: "Delete buyer records" },
          { id: "by_12", name: "Assign Buyer", resource: "buyer", action: "assign", description: "Assign buyers to agents" },
          { id: "by_13", name: "Bulk Update Stage", resource: "buyer", action: "bulk_update_stage", description: "Update stage of multiple buyers at once" },
          { id: "by_14", name: "Update Priority", resource: "buyer", action: "update_priority", description: "Change buyer priority" },
        ],
      },
      {
        label: "Seller",
        resource: "seller",
        permissions: [
          { id: "sl_1", name: "Create Seller", resource: "seller", action: "create", description: "Add new seller records" },
          { id: "sl_2", name: "Update Seller", resource: "seller", action: "update", description: "Edit seller records" },
          { id: "sl_3", name: "Delete Seller", resource: "seller", action: "delete", description: "Delete seller records" },
          { id: "sl_4", name: "Read Seller", resource: "seller", action: "read", description: "View seller details" },
          { id: "sl_5", name: "Import Seller", resource: "seller", action: "import", description: "Import sellers from file" },
          { id: "sl_6", name: "Export Seller", resource: "seller", action: "export", description: "Export sellers to file" },
          { id: "sl_7", name: "Seller Account", resource: "seller", action: "account", description: "Manage seller account access" },
          { id: "sl_8", name: "Call Seller", resource: "seller", action: "call", description: "Call seller via integrated dialer" },
          { id: "sl_9", name: "WhatsApp Seller", resource: "seller", action: "whatsapp", description: "Send WhatsApp message to seller" },
          { id: "sl_10", name: "Email Seller", resource: "seller", action: "email", description: "Send email to seller" },
          { id: "sl_11", name: "Bulk Update Status", resource: "seller", action: "bulk_update_status", description: "Update status of multiple sellers at once" },
          { id: "sl_12", name: "Bulk Update Stage", resource: "seller", action: "bulk_update_stage", description: "Update stage of multiple sellers at once" },
          { id: "sl_13", name: "Assign Seller", resource: "seller", action: "assign", description: "Assign sellers to agents" },
        ],
      },
      {
        label: "Property",
        resource: "property",
        permissions: [
          { id: "pr_1", name: "Create Property", resource: "property", action: "create", description: "Add new property listings" },
          { id: "pr_2", name: "Download Brochure", resource: "property", action: "download_brochure", description: "Download property brochure" },
          { id: "pr_3", name: "Import Property", resource: "property", action: "import", description: "Import properties from file" },
          { id: "pr_4", name: "Export Property", resource: "property", action: "export", description: "Export properties to file" },
          { id: "pr_5", name: "Read Property", resource: "property", action: "read", description: "Access property information" },
          { id: "pr_6", name: "Assign Property", resource: "property", action: "assign", description: "Assign properties to agents" },
          { id: "pr_7", name: "Update Property", resource: "property", action: "update", description: "Edit property details" },
          { id: "pr_8", name: "Mark Private", resource: "property", action: "mark_private", description: "Mark a property as private/hidden" },
          { id: "pr_9", name: "Delete Property", resource: "property", action: "delete", description: "Remove property listings" },
        ],
      },
      {
        label: "Contact Message",
        resource: "contact",
        permissions: [
          { id: "cm_1", name: "Read Contact Messages", resource: "contact", action: "read", description: "View incoming contact messages" },
          { id: "cm_2", name: "Assign Contact Messages", resource: "contact", action: "assign", description: "Assign contact messages to team" },
          { id: "cm_3", name: "Favorite Contact Messages", resource: "contact", action: "favorite", description: "Mark contact messages as favourite" },
          { id: "cm_4", name: "Call Contact", resource: "contact", action: "call", description: "Call contact via integrated dialer" },
          { id: "cm_5", name: "Email Contact", resource: "contact", action: "email", description: "Send email to contact" },
          { id: "cm_6", name: "Export Contact Messages", resource: "contact", action: "export", description: "Export contact messages" },
          { id: "cm_7", name: "Delete Contact Messages", resource: "contact", action: "delete", description: "Delete contact messages" },
        ],
      },
    ],
  },

  // 5. Blog
  {
    section: "Blog",
    icon: <FileText className="h-4 w-4" />,
    groups: [
      {
        label: "Blog",
        resource: "blog",
        permissions: [
          { id: "bl_1", name: "Create Blog", resource: "blog", action: "create", description: "Add new blog posts" },
          { id: "bl_2", name: "Delete Blog", resource: "blog", action: "delete", description: "Delete blog posts" },
          { id: "bl_3", name: "Update Blog", resource: "blog", action: "update", description: "Edit existing blog posts" },
          { id: "bl_4", name: "Read Blog", resource: "blog", action: "read", description: "View blog posts" },
          { id: "bl_5", name: "Read Comments", resource: "blog", action: "view_comments", description: "View blog post comments" },
          { id: "bl_6", name: "AI Write Blog", resource: "blog", action: "ai_write", description: "Generate blog content using AI writer" },
          { id: "bl_7", name: "Create RSS Source", resource: "blog", action: "rss_add", description: "Add an RSS feed source" },
          { id: "bl_8", name: "Import RSS Source", resource: "blog", action: "rss_import", description: "Import posts from RSS feed" },
          { id: "bl_9", name: "Delete RSS Source", resource: "blog", action: "rss_delete", description: "Delete an RSS feed source" },
        ],
      },
    ],
  },

  // 6. Template Center
  {
    section: "Template Center",
    icon: <Layers className="h-4 w-4" />,
    groups: [
      {
        label: "Template Center",
        resource: "template_center",
        permissions: [
          { id: "tc_1", name: "Create Template", resource: "template_center", action: "create", description: "Create new templates" },
          { id: "tc_2", name: "Read Template", resource: "template_center", action: "read", description: "View existing templates" },
          { id: "tc_3", name: "Update Template", resource: "template_center", action: "update", description: "Edit templates" },
          { id: "tc_4", name: "Delete Template", resource: "template_center", action: "delete", description: "Delete templates" },
          { id: "tc_5", name: "Import Template", resource: "template_center", action: "import", description: "Import templates from file" },
          { id: "tc_6", name: "Export Template", resource: "template_center", action: "export", description: "Export templates to file" },
          { id: "tc_7", name: "Approve Template", resource: "template_center", action: "approve", description: "Approve templates for use" },
          { id: "tc_8", name: "Reject Template", resource: "template_center", action: "reject", description: "Reject submitted templates" },
          { id: "tc_9", name: "Activate Template", resource: "template_center", action: "activate", description: "Activate a template" },
          { id: "tc_10", name: "Deactivate Template", resource: "template_center", action: "deactivate", description: "Deactivate a template" },
        ],
      },
    ],
  },

  // 7. WhatsApp CRM
  {
    section: "WhatsApp CRM",
    icon: <MessageSquare className="h-4 w-4" />,
    groups: [
      {
        label: "Inbox",
        resource: "whatsapp_inbox",
        permissions: [
          { id: "wi_1", name: "Read Inbox", resource: "whatsapp_inbox", action: "read", description: "View WhatsApp inbox messages" },
        ],
      },
      {
        label: "Template",
        resource: "whatsapp_template",
        permissions: [
          { id: "wt_1", name: "Create Template", resource: "whatsapp_template", action: "create", description: "Create WhatsApp message templates" },
          { id: "wt_2", name: "Read Template", resource: "whatsapp_template", action: "read", description: "View WhatsApp message templates" },
          { id: "wt_3", name: "Delete Template", resource: "whatsapp_template", action: "delete", description: "Delete WhatsApp message templates" },
          { id: "wt_4", name: "Bulk Delete Template", resource: "whatsapp_template", action: "bulk_delete", description: "Bulk delete WhatsApp templates" },
        ],
      },
      {
        label: "Campaign",
        resource: "whatsapp_campaign",
        permissions: [
          { id: "wc_1", name: "Create Campaign", resource: "whatsapp_campaign", action: "create", description: "Create new WhatsApp campaigns" },
          { id: "wc_2", name: "Launch Campaign", resource: "whatsapp_campaign", action: "launch", description: "Launch WhatsApp campaigns" },
          { id: "wc_3", name: "Read Campaign", resource: "whatsapp_campaign", action: "read", description: "View WhatsApp campaigns" },
          { id: "wc_4", name: "Bulk Delete Campaign", resource: "whatsapp_campaign", action: "bulk_delete", description: "Bulk delete WhatsApp campaigns" },
        ],
      },
      {
        label: "Chatbot Flow",
        resource: "whatsapp_chatbot",
        permissions: [
          { id: "wcb_1", name: "Create Chatbot Flow", resource: "whatsapp_chatbot", action: "create", description: "Create WhatsApp chatbot flows" },
          { id: "wcb_2", name: "Read Chatbot Flow", resource: "whatsapp_chatbot", action: "read", description: "View chatbot flows" },
          { id: "wcb_3", name: "Update Chatbot Flow", resource: "whatsapp_chatbot", action: "update", description: "Edit chatbot flows" },
          { id: "wcb_4", name: "Delete Chatbot Flow", resource: "whatsapp_chatbot", action: "delete", description: "Delete chatbot flows" },
          { id: "wcb_5", name: "Activate Chatbot Flow", resource: "whatsapp_chatbot", action: "activate", description: "Activate/deactivate chatbot flows" },
        ],
      },
      {
        label: "Analytics",
        resource: "whatsapp_analytics",
        permissions: [
          { id: "wa_1", name: "Read Analytics", resource: "whatsapp_analytics", action: "read", description: "View WhatsApp analytics" },
          { id: "wa_2", name: "Read Meta Spend", resource: "whatsapp_analytics", action: "meta_spend", description: "View Meta ad spend analytics" },
        ],
      },
      {
        label: "WhatsApp CRM Settings",
        resource: "whatsapp_settings",
        permissions: [
          { id: "ws_1", name: "Manage Settings", resource: "whatsapp_settings", action: "manage", description: "Manage WhatsApp CRM settings" },
          { id: "ws_2", name: "Configure API", resource: "whatsapp_settings", action: "api_config", description: "Configure API settings" },
          { id: "ws_3", name: "Configure Webhook", resource: "whatsapp_settings", action: "webhook", description: "Configure webhook settings" },
          { id: "ws_4", name: "Manage Integration", resource: "whatsapp_settings", action: "integration", description: "Manage third-party integrations" },
          { id: "ws_5", name: "Meta Account Config", resource: "whatsapp_settings", action: "meta_account", description: "Configure Meta account settings" },
        ],
      },
    ],
  },

  // 8. Settings
  {
    section: "Settings",
    icon: <Settings className="h-4 w-4" />,
    groups: [
      {
        label: "General Settings",
        resource: "settings_general",
        permissions: [
          { id: "sg_1", name: "Manage General Settings", resource: "settings_general", action: "manage", description: "Access and manage general system settings" },
        ],
      },
      {
        label: "Role & Permission",
        resource: "settings_rbac",
        permissions: [
          { id: "sr_1", name: "Manage Role Permissions", resource: "settings_rbac", action: "manage", description: "Manage roles and permissions" },
        ],
      },
      {
        label: "Integration",
        resource: "settings_integration",
        permissions: [
          { id: "si_1", name: "Manage Integration", resource: "settings_integration", action: "manage", description: "Manage third-party integrations" },
        ],
      },
      {
        label: "AI Settings",
        resource: "settings_ai",
        permissions: [
          { id: "sai_1", name: "Manage AI Settings", resource: "settings_ai", action: "manage", description: "Configure AI features and settings" },
        ],
      },
      {
        label: "Master Data",
        resource: "settings_master",
        permissions: [
          { id: "sm_1", name: "Manage Variable Center", resource: "settings_master", action: "manage", description: "Manage master data variables" },
          { id: "sm_2", name: "Import Master Data", resource: "settings_master", action: "import", description: "Import master data from file" },
          { id: "sm_3", name: "Export Master Data", resource: "settings_master", action: "export", description: "Export master data to file" },
        ],
      },
      {
        label: "User Management",
        resource: "user",
        permissions: [
          { id: "us_1", name: "Create User", resource: "user", action: "create", description: "Create new user accounts" },
          { id: "us_2", name: "Import User", resource: "user", action: "import", description: "Import users from file" },
          { id: "us_3", name: "Export User", resource: "user", action: "export", description: "Export users to file" },
          { id: "us_4", name: "Update User", resource: "user", action: "update", description: "Edit user information and settings" },
          { id: "us_5", name: "Share User", resource: "user", action: "share", description: "Share user profile or data" },
          { id: "us_6", name: "Activate User", resource: "user", action: "activate", description: "Activate a user account" },
          { id: "us_7", name: "Deactivate User", resource: "user", action: "deactivate", description: "Deactivate a user account" },
          { id: "us_8", name: "Delete User", resource: "user", action: "delete", description: "Remove user accounts" },
          { id: "us_9", name: "Bulk Activate User", resource: "user", action: "bulk_activate", description: "Activate multiple user accounts" },
          { id: "us_10", name: "Bulk Deactivate User", resource: "user", action: "bulk_deactivate", description: "Deactivate multiple user accounts" },
        ],
      },
    ],
  },
];

// Flat list of ALL permissions
const STATIC_PERMISSIONS: Permission[] = PERMISSION_SECTIONS.flatMap((s) =>
  s.groups.flatMap((g) => g.permissions)
);

// Resource color map
const resourceMeta: Record<string, { color: string; bg: string }> = {
  overview: { color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
  dashboard: { color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200" },
  home: { color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
  lead: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  buyer: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  seller: { color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
  property: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  contact: { color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  blog: { color: "text-lime-700", bg: "bg-lime-50 border-lime-200" },
  template_center: { color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  whatsapp_inbox: { color: "text-green-700", bg: "bg-green-50 border-green-200" },
  whatsapp_template: { color: "text-green-700", bg: "bg-green-50 border-green-200" },
  whatsapp_campaign: { color: "text-green-700", bg: "bg-green-50 border-green-200" },
  whatsapp_chatbot: { color: "text-green-700", bg: "bg-green-50 border-green-200" },
  whatsapp_analytics: { color: "text-green-700", bg: "bg-green-50 border-green-200" },
  whatsapp_settings: { color: "text-green-700", bg: "bg-green-50 border-green-200" },
  settings_general: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
  settings_rbac: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  settings_integration: { color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  settings_ai: { color: "text-fuchsia-700", bg: "bg-fuchsia-50 border-fuchsia-200" },
  settings_master: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  user: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
};

// Section accent colors
const sectionAccent: Record<string, string> = {
  "Overview": "border-slate-300 bg-slate-50",
  "Dashboard": "border-cyan-300 bg-cyan-50",
  "Home": "border-sky-300 bg-sky-50",
  "CRM": "border-orange-300 bg-orange-50",
  "Blog": "border-lime-300 bg-lime-50",
  "Template Center": "border-violet-300 bg-violet-50",
  "WhatsApp CRM": "border-green-300 bg-green-50",
  "Settings": "border-gray-300 bg-gray-50",
};

const sectionIconColor: Record<string, string> = {
  "Overview": "text-slate-600",
  "Dashboard": "text-cyan-600",
  "Home": "text-sky-600",
  "CRM": "text-orange-600",
  "Blog": "text-lime-600",
  "Template Center": "text-violet-600",
  "WhatsApp CRM": "text-green-600",
  "Settings": "text-gray-600",
};

// Helper: module_permissions ↔ flat keys
function flattenModulePermissions(
  mp: Record<string, Record<string, boolean>> | null | undefined
): string[] {
  if (!mp) return [];
  const keys: string[] = [];
  for (const [resource, actions] of Object.entries(mp)) {
    for (const [action, enabled] of Object.entries(actions)) {
      if (enabled) keys.push(`${resource}.${action}`);
    }
  }
  return keys;
}

function buildModulePermissions(
  keys: string[]
): Record<string, Record<string, boolean>> {
  const mp: Record<string, Record<string, boolean>> = {};
  for (const key of keys) {
    const dotIdx = key.indexOf(".");
    if (dotIdx < 0) continue;
    const resource = key.slice(0, dotIdx);
    const action = key.slice(dotIdx + 1);
    if (!mp[resource]) mp[resource] = {};
    mp[resource][action] = true;
  }
  return mp;
}

// Helper to normalize role
const normalizeRole = (role: string): string => {
  if (!role) return '';
  return role.toLowerCase().trim();
};

// Avatar Initials
const AvatarInitials: React.FC<{ user: AppUser }> = ({ user }) => {
  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500", "bg-amber-500", "bg-teal-500"];
  const color = colors[user.id % colors.length];
  if (user.avatar) {
    return <img src={user.avatar} alt={initials} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />;
  }
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shadow-sm border-2 border-white`}>
      {initials}
    </div>
  );
};

// IndeterminateCheckbox helper
interface IndeterminateCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}
const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
  checked, indeterminate, onChange, disabled = false, className = "",
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className={`w-3.5 h-3.5 rounded border-gray-300 text-[#e87722] focus:ring-[#e87722] focus:ring-1 shrink-0 ${className}`}
    />
  );
};

// Permission checkbox grid
interface PermChecklistProps {
  checkedKeys: string[];
  onToggle: (permId: string) => void;
  onToggleGroup: (group: PermissionGroup, forceAll?: boolean) => void;
  disabled?: boolean;
}

const PermChecklist: React.FC<PermChecklistProps> = ({
  checkedKeys, onToggle, onToggleGroup, disabled = false,
}) => {
  const hasKey = (perm: Permission) =>
    checkedKeys.includes(`${perm.resource}.${perm.action}`);

  return (
    <div className="space-y-4">
      {PERMISSION_SECTIONS.map((section) => {
        const sectionPerms = section.groups.flatMap((g) => g.permissions);
        const sectionTotal = sectionPerms.length;
        const sectionChecked = sectionPerms.filter(hasKey).length;
        const accent = sectionAccent[section.section] ?? "border-gray-200 bg-gray-50";
        const iconCol = sectionIconColor[section.section] ?? "text-gray-600";

        return (
          <div key={section.section} className={`rounded-xl border-2 overflow-hidden ${accent}`}>
            {/* Section header */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div className={`flex items-center gap-2 text-xs font-bold ${iconCol}`}>
                {section.icon}
                {section.section}
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sectionChecked > 0
                    ? "bg-orange-100 text-[#e87722]"
                    : "bg-white/80 text-gray-400"
                  }`}
              >
                {sectionChecked}/{sectionTotal}
              </span>
            </div>

            {/* Groups */}
            <div className="divide-y divide-white/60 px-3 pb-3 space-y-2.5">
              {section.groups.map((group) => {
                const meta = resourceMeta[group.resource] ?? { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
                const gChecked = group.permissions.filter(hasKey).length;
                const gTotal = group.permissions.length;
                const allChecked = gChecked === gTotal;
                const someChecked = gChecked > 0 && !allChecked;

                return (
                  <div key={group.resource} className="pt-2.5">
                    {/* Group header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <h6 className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
                          {group.label} Permissions
                        </h6>
                      </div>

                      {/* Right side: Select All + count */}
                      <div className="flex items-center gap-3">
                        {!disabled && (
                          <label className="flex items-center gap-1.5 cursor-pointer select-none group/sa">
                            <IndeterminateCheckbox
                              checked={allChecked}
                              indeterminate={someChecked}
                              onChange={() => onToggleGroup(group)}
                              disabled={disabled}
                            />
                            <span className="text-[10px] font-semibold text-gray-400 group-hover/sa:text-[#e87722] transition-colors">
                              Select All
                            </span>
                          </label>
                        )}
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${gChecked > 0
                              ? "bg-orange-50 text-[#e87722]"
                              : "bg-white/70 text-gray-400"
                            }`}
                        >
                          {gChecked}/{gTotal}
                        </span>
                      </div>
                    </div>

                    {/* Permission grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white rounded-lg border border-gray-100 overflow-hidden divide-y divide-gray-50">
                      {group.permissions.map((perm) => {
                        const checked = hasKey(perm);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-orange-50/40 ${checked ? "bg-orange-50/20" : ""
                              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => onToggle(perm.id)}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-[#e87722] focus:ring-[#e87722] focus:ring-1 shrink-0"
                            />
                            <span
                              className={`text-xs leading-tight ${checked ? "text-[#1a3a5c] font-semibold" : "text-gray-600"
                                }`}
                            >
                              {perm.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Main Page
const RolesPermissionsPage: React.FC = () => {
  const { user } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"roles" | "permissions" | "users">("roles");
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Users tab
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editingUserPerms, setEditingUserPerms] = useState<string[]>([]);
  const [savingUserPerms, setSavingUserPerms] = useState(false);

  useEffect(() => { console.log("CURRENT USER ===>", user); }, [user]);
  useEffect(() => { fetchMasterRoles(); }, []);
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch roles
  const fetchMasterRoles = async () => {
    setLoading(true);
    try {
      const commonMasterTypes: any[] = await masterDataAPI.getAllMasterTypes("common");
      const roleType = commonMasterTypes.find(
        (t) => ["role", "roles"].includes(((t.name || "") as string).toLowerCase().trim())
      );
      if (!roleType) { setRoles([]); return; }

      const masterRoles = await masterDataAPI.getMasterValues(roleType.id);
      if (!Array.isArray(masterRoles)) { setRoles([]); return; }

      const mapped: Role[] = masterRoles.map((item: any) => {
        const rawName = item.value || item.name || `Role ${item.id}`;
        return {
          id: String(rawName).toLowerCase().trim(),
          name: rawName,
          description: item.description || item.meta?.description || "",
          permissions: Array.isArray(item.permissions)
            ? item.permissions.map((p: any) => (typeof p === "string" ? p : `${p.resource}.${p.action}`))
            : [],
          user_count: typeof item.user_count === "number" ? item.user_count : 0,
          is_system: !!item.is_system,
          created_at: item.created_at || new Date().toISOString(),
        };
      });

      const merged = await Promise.all(
        mapped.map(async (role) => {
          try {
            const dbPerms = await rbacAPI.getRolePermissions(role.id);
            if (Array.isArray(dbPerms) && dbPerms.length > 0) return { ...role, permissions: dbPerms };
            return role;
          } catch { return role; }
        })
      );
      setRoles(merged);
    } catch (error) {
      console.error("Failed to load roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users - EXCLUDING buyer and seller roles
  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await usersAPI.getAllUsers();
      const list: AppUser[] = Array.isArray(data) ? data : data?.users ?? data?.data ?? [];
      // Filter out users with buyer or seller roles
      const filteredList = list.filter(u =>
        normalizeRole(u.role) !== 'buyer' && normalizeRole(u.role) !== 'seller'
      );
      setAllUsers(filteredList);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Role modal helpers
  const handleUpdateRole = async (role: Role) => {
    try {
      await rbacAPI.updateRolePermissions(role.id, role.permissions);
      setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
      setEditingRole(null);
      toast.success("Role permissions updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update role permissions");
    }
  };

  const toggleRolePerm = (permId: string) => {
    if (!editingRole) return;
    const perm = STATIC_PERMISSIONS.find((p) => p.id === permId);
    if (!perm) return;
    const key = `${perm.resource}.${perm.action}`;
    const next = editingRole.permissions.includes(key)
      ? editingRole.permissions.filter((k) => k !== key)
      : [...editingRole.permissions, key];
    setEditingRole({ ...editingRole, permissions: next });
  };

  const toggleRoleGroup = (group: PermissionGroup) => {
    if (!editingRole) return;
    const keys = group.permissions.map((p) => `${p.resource}.${p.action}`);
    const allChecked = keys.every((k) => editingRole.permissions.includes(k));
    const next = allChecked
      ? editingRole.permissions.filter((k) => !keys.includes(k))
      : [...new Set([...editingRole.permissions, ...keys])];
    setEditingRole({ ...editingRole, permissions: next });
  };

  // User modal helpers
  const openUserPermEditor = (u: AppUser) => {
    setEditingUser(u);
    setEditingUserPerms(flattenModulePermissions(u.module_permissions));
  };

  const toggleUserPerm = (permId: string) => {
    const perm = STATIC_PERMISSIONS.find((p) => p.id === permId);
    if (!perm) return;
    const key = `${perm.resource}.${perm.action}`;
    setEditingUserPerms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleUserGroup = (group: PermissionGroup) => {
    const keys = group.permissions.map((p) => `${p.resource}.${p.action}`);
    const allChecked = keys.every((k) => editingUserPerms.includes(k));
    setEditingUserPerms((prev) =>
      allChecked
        ? prev.filter((k) => !keys.includes(k))
        : [...new Set([...prev, ...keys])]
    );
  };

  const saveUserPermissions = async () => {
    if (!editingUser) return;
    setSavingUserPerms(true);
    try {
      const module_permissions = buildModulePermissions(editingUserPerms);
      await usersAPI.updateUser(String(editingUser.id), { module_permissions });
      setAllUsers((prev) =>
        prev.map((u) => u.id === editingUser.id ? { ...u, module_permissions } : u)
      );
      toast.success(`Permissions updated for ${editingUser.first_name} ${editingUser.last_name}`);
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save user permissions");
    } finally {
      setSavingUserPerms(false);
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.department ?? "").toLowerCase().includes(q)
    );
  });

  const totalPerms = STATIC_PERMISSIONS.length;

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  // JSX
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-2">

      {/* Page Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
          <Link to="/dashboard/settings" className="flex items-center gap-1 text-[#1a3a5c] hover:text-[#e87722] font-medium transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Settings
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-500">Roles &amp; Permissions</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-full bg-[#e87722] shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a3a5c] leading-tight">Roles &amp; Permissions</h1>
              <p className="text-xs text-gray-400 mt-0.5">Manage user roles and their access permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a3a5c] shadow-sm">
              <Shield className="h-3.5 w-3.5 text-[#e87722]" />{roles.length} Roles
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a3a5c] shadow-sm">
              <Key className="h-3.5 w-3.5 text-[#e87722]" />{totalPerms} Permissions
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1a3a5c] shadow-sm">
              <Users className="h-3.5 w-3.5 text-[#e87722]" />{allUsers.length} Users
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4 sm:px-6 sticky top-0 bg-white z-10">
          <nav className="flex gap-0">
            {(["roles", "permissions", "users"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                    ? "border-[#e87722] text-[#e87722]"
                    : "border-transparent text-gray-500 hover:text-[#1a3a5c] hover:border-gray-300"
                  }`}
              >
                {tab === "roles" ? <Shield className="h-4 w-4" /> : tab === "permissions" ? <Lock className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span className="capitalize">{tab}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${activeTab === tab ? "bg-orange-100 text-[#e87722]" : "bg-gray-100 text-gray-500"}`}>
                  {tab === "roles" ? roles.length : tab === "permissions" ? totalPerms : allUsers.length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">

          {/* ROLES TAB */}
          {activeTab === "roles" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="group relative border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-[#e87722] hover:shadow-md transition-all duration-200 bg-white overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1a3a5c] to-[#e87722] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#1a3a5c]/8 border border-[#1a3a5c]/15 flex items-center justify-center shrink-0">
                        <Shield className="h-4 w-4 text-[#1a3a5c]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-[#1a3a5c] truncate">{role.name}</h3>
                          {role.is_system && <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-[#1a3a5c] text-white rounded">System</span>}
                        </div>
                        {role.description && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{role.description}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingRole(role)}
                      disabled={role.is_system}
                      className="shrink-0 ml-2 p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#e87722] hover:border-[#e87722] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={role.is_system ? "System role cannot be edited" : "Edit permissions"}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold text-[#1a3a5c]">{role.user_count}</span> users
                    </div>
                    <div className="w-px h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Key className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold text-[#1a3a5c]">{role.permissions.length}</span> permissions
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 4).map((p, idx) => (
                        <span key={idx} className="inline-block px-2 py-0.5 text-[10px] font-medium bg-orange-50 text-[#e87722] border border-orange-100 rounded-full">
                          {p.includes(".") ? p.split(".")[1] : p}
                        </span>
                      ))}
                      {role.permissions.length > 4 && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">+{role.permissions.length - 4} more</span>
                      )}
                      {role.permissions.length === 0 && <span className="text-[10px] text-gray-300 italic">No permissions assigned</span>}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-2">
                    Created {new Date(role.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
              {roles.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                  <Shield className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No roles found</p>
                </div>
              )}
            </div>
          )}

          {/* PERMISSIONS TAB */}
          {activeTab === "permissions" && (
            <div className="space-y-5">
              {PERMISSION_SECTIONS.map((section) => {
                const accent = sectionAccent[section.section] ?? "border-gray-200 bg-gray-50";
                const iconCol = sectionIconColor[section.section] ?? "text-gray-600";
                const sTotal = section.groups.flatMap((g) => g.permissions).length;
                return (
                  <div key={section.section} className={`rounded-xl border-2 overflow-hidden ${accent}`}>
                    <div className="px-4 py-3 flex items-center gap-2">
                      <span className={iconCol}>{section.icon}</span>
                      <h3 className={`text-sm font-bold ${iconCol}`}>{section.section}</h3>
                      <span className="ml-auto text-[10px] font-semibold bg-white/70 px-2 py-0.5 rounded-full text-gray-500">{sTotal} permissions</span>
                    </div>
                    <div className="px-3 pb-3 space-y-3">
                      {section.groups.map((group) => {
                        const meta = resourceMeta[group.resource] ?? { color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
                        return (
                          <div key={group.resource}>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${meta.color}`}>{group.label} Permissions</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {group.permissions.map((perm) => (
                                <div key={perm.id} className="bg-white rounded-lg border border-white/80 shadow-sm p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Lock className="h-3 w-3 text-gray-300 shrink-0" />
                                    <h4 className="text-xs font-semibold text-gray-800 truncate">{perm.name}</h4>
                                  </div>
                                  <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">{perm.description}</p>
                                  <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded ${meta.bg} ${meta.color}`}>
                                    {perm.resource}.{perm.action}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* USERS TAB - Only shows non-buyer, non-seller users */}
          {activeTab === "users" && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email, role..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e87722]/30 focus:border-[#e87722] transition-colors"
                  />
                </div>
                <span className="text-xs text-gray-400 shrink-0">{filteredUsers.length} of {allUsers.length} users</span>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Users className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">{userSearch ? "No matching users found" : "No users found"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredUsers.map((u) => {
                    const permsFlat = flattenModulePermissions(u.module_permissions);
                    return (
                      <div key={u.id} className="group relative border border-gray-200 rounded-xl p-4 hover:border-[#e87722] hover:shadow-md transition-all duration-200 bg-white overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1a3a5c] to-[#e87722] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <AvatarInitials user={u} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-sm font-bold text-[#1a3a5c] truncate">{u.first_name} {u.last_name}</h3>
                                {u.is_active ? (
                                  <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                    <CheckCircle2 className="h-2.5 w-2.5" /> Active
                                  </span>
                                ) : (
                                  <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200 rounded-full">
                                    <XCircle className="h-2.5 w-2.5" /> Inactive
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => openUserPermEditor(u)}
                            className="shrink-0 ml-2 p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#e87722] hover:border-[#e87722] transition-colors"
                            title="Edit permissions"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-[#1a3a5c]/8 text-[#1a3a5c] border border-[#1a3a5c]/15 rounded-full">
                            <Shield className="h-2.5 w-2.5" />{u.role}
                          </span>
                          {u.department && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">{u.department}</span>
                          )}
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Custom Permissions</p>
                          <div className="flex flex-wrap gap-1">
                            {permsFlat.slice(0, 4).map((key, idx) => (
                              <span key={idx} className="inline-block px-2 py-0.5 text-[10px] font-medium bg-orange-50 text-[#e87722] border border-orange-100 rounded-full">
                                {key.includes(".") ? key.split(".")[1] : key}
                              </span>
                            ))}
                            {permsFlat.length > 4 && (
                              <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">+{permsFlat.length - 4} more</span>
                            )}
                            {permsFlat.length === 0 && <span className="text-[10px] text-gray-300 italic">No custom permissions</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#1a3a5c] truncate">Edit Permissions</h3>
                    <p className="text-xs text-[#e87722] font-medium truncate">{editingRole.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{editingRole.permissions.length} selected</span>
                  <button onClick={() => setEditingRole(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <PermChecklist
                checkedKeys={editingRole.permissions}
                onToggle={toggleRolePerm}
                onToggleGroup={toggleRoleGroup}
                disabled={editingRole.is_system}
              />
              {editingRole.is_system && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                  <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">System Role</p>
                    <p className="text-xs text-amber-700 mt-0.5">This is a system role. Permissions cannot be modified.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-2.5">
              <button
                onClick={() => handleUpdateRole(editingRole)}
                disabled={editingRole.is_system}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Update Permissions
              </button>
              <button onClick={() => setEditingRole(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <span className="ml-auto text-xs text-gray-400 hidden sm:inline">{editingRole.permissions.length} permissions selected</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Permissions Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <AvatarInitials user={editingUser} />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#1a3a5c] truncate">{editingUser.first_name} {editingUser.last_name}</h3>
                    <p className="text-xs text-[#e87722] font-medium truncate">{editingUser.role}{editingUser.department ? ` · ${editingUser.department}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{editingUserPerms.length} selected</span>
                  <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                <Key className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  These are <strong>user-level overrides</strong> stored in <code className="bg-blue-100 px-1 rounded">module_permissions</code>. They override the user's role permissions for specific actions.
                </p>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <PermChecklist
                checkedKeys={editingUserPerms}
                onToggle={toggleUserPerm}
                onToggleGroup={toggleUserGroup}
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-2.5">
              <button
                onClick={saveUserPermissions}
                disabled={savingUserPerms}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {savingUserPerms ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <Save className="h-3.5 w-3.5" />}
                {savingUserPerms ? "Saving..." : "Save Permissions"}
              </button>
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <span className="ml-auto text-xs text-gray-400 hidden sm:inline">{editingUserPerms.length} permissions selected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsPage;