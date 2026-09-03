// src/pages/dashboard/TemplateCenterModal.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Code,
  Eye,
  Check,
  Sparkles,
  Info,
  Loader2,
  SlidersHorizontal,
  Wand2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { getMasterDropdownOptions } from "@/lib/useMasterData";
import { aiClient } from "@/lib/TemplateAPI";

export interface TemplateModalData {
  id?: string | number;
  name: string;
  category: string;
  subCategory?: string;
  sub_category?: string;
  priority?: "Normal" | "High" | "Urgent" | "Critical" | string;
  channel: "email" | "sms" | "whatsapp" | string;
  subject?: string;
  content: string;
  autoApprove?: boolean | number;
  status?: string;
  is_active?: boolean | number;
  rejection_reason?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TemplateModalData) => Promise<void>;
  initial?: TemplateModalData | null;
  channel?: string;
  title?: string;
}

const PRIORITIES = ["Normal", "High", "Urgent"];

export default function TemplateCenterModal({
  open,
  onClose,
  onSubmit,
  initial,
  channel = "email",
  title,
}: Props) {
  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name || "Resale Expert";

  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [subCategoriesList, setSubCategoriesList] = useState<string[]>(["None"]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("None");
  const [priority, setPriority] = useState<string>("Normal");
  const [selectedChannel, setSelectedChannel] = useState<string>("email");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [autoApprove, setAutoApprove] = useState(true);
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [saving, setSaving] = useState(false);

  // AI Generation State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSubject, setAiSubject] = useState("");
  const [aiTone, setAiTone] = useState("Friendly");
  const [aiLang, setAiLang] = useState("English");
  const [aiLength, setAiLength] = useState("Short");
  const [aiGenerating, setAiGenerating] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Dynamic system variables for insertion
  const templateVariables = [
    { tag: "{name}", label: "Recipient Name" },
    { tag: "{first_name}", label: "First Name" },
    { tag: "{otp}", label: "OTP Code" },
    { tag: "{expiry_minutes}", label: "Expiry Minutes" },
    { tag: "{site_name}", label: "Company Name" },
    { tag: "{property_name}", label: "Property Name" },
    { tag: "{location}", label: "Location" },
    { tag: "{price}", label: "Price / Amount" },
    { tag: "{date}", label: "Current Date" },
    { tag: "{year}", label: "Current Year" },
  ];

  // Fetch Category and Sub Category dynamically from Master Data
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const raw = await getMasterDropdownOptions(["common"]);
        // Find category options
        const catKey = Object.keys(raw).find((k) => k.includes("category") && !k.includes("sub"));
        const cats = catKey && raw[catKey] ? raw[catKey].map((c) => c.value) : [];

        // Find sub category options
        const subCatKey = Object.keys(raw).find((k) => k.includes("sub") || k.includes("subcategory"));
        const subCats = subCatKey && raw[subCatKey] ? raw[subCatKey].map((sc) => sc.value) : [];

        const defaultCats = [
          "Security",
          "Alerts",
          "Notification",
          "Welcome",
          "Reminders",
          "Billing",
          "Marketing",
        ];

        const mergedCats = Array.from(new Set([...cats, ...defaultCats])).filter(Boolean);
        setCategoriesList(mergedCats);

        const mergedSubCats = Array.from(new Set(["None", ...subCats])).filter(Boolean);
        setSubCategoriesList(mergedSubCats);

        if (!initial && mergedCats.length > 0 && !category) {
          setCategory(mergedCats[0]);
        }
      } catch (err) {
        console.warn("Could not load master options, using fallback:", err);
        setCategoriesList(["Security", "Alerts", "Notification", "Welcome", "Reminders", "Billing", "Marketing"]);
      }
    };

    if (open) {
      loadMasters();
    }
  }, [open]);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setCategory(initial.category || categoriesList[0] || "Security");
      setSubCategory(initial.subCategory || (initial as any).sub_category || "None");
      setPriority(initial.priority || "Normal");
      setSelectedChannel(initial.channel || channel || "email");
      setSubject(initial.subject || "");
      setContent(initial.content || "");
      setAutoApprove(initial.autoApprove !== undefined ? Boolean(initial.autoApprove) : true);
      setAiSubject(initial.subject || initial.name || "");
    } else {
      setName("");
      setCategory(categoriesList[0] || "Security");
      setSubCategory("None");
      setPriority("Normal");
      setSelectedChannel(channel || "email");
      setSubject("");
      setContent("");
      setAutoApprove(true);
      setAiSubject("");
    }
  }, [initial, channel, open, categoriesList]);

  // Extract variables detected in content
  const detectedVariables = Array.from(
    new Set(
      (content.match(/\{([a-zA-Z0-9_]+)\}/g) || []).map((v) => v.replace(/[{}]/g, ""))
    )
  );

  // Helper to insert variable token into textarea
  const handleInsertVariable = (token: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => prev + token);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const newContent = content.substring(0, start) + token + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    }, 50);
  };

  // Generate Template with AI using ChatGPT integration
  const handleGenerateAI = async () => {
    const activeSubject = aiSubject.trim() || subject.trim() || name.trim();
    if (!activeSubject && !category) {
      toast.error("Please provide a content subject or select a category");
      return;
    }

    setAiGenerating(true);
    try {
      const res = await aiClient.generateTemplate({
        subject: activeSubject,
        channel: selectedChannel,
        category: category,
        subCategory: subCategory !== "None" ? subCategory : undefined,
        priority: priority,
        tone: aiTone.toLowerCase(),
        lang: aiLang,
        length: aiLength.toLowerCase(),
      });

      if (res?.content) {
        let generatedText = res.content.trim();

        // If email and output includes "Subject: ...", parse subject
        if (selectedChannel === "email" && generatedText.toLowerCase().startsWith("subject:")) {
          const lines = generatedText.split("\n");
          const subjLine = lines[0].replace(/^subject:\s*/i, "").trim();
          if (subjLine && !subject) {
            setSubject(subjLine);
          }
          generatedText = lines.slice(1).join("\n").trim();
        }

        setContent(generatedText);
        setShowAiModal(false);
        toast.success("Template generated with AI!");
      } else {
        toast.error("AI returned empty content. Please try again.");
      }
    } catch (err: any) {
      console.error("AI Generation error:", err);
      const errMsg = err.response?.data?.error || err.message || "Failed to generate template with AI";
      toast.error(errMsg);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Template content is required");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        id: initial?.id,
        name: name.trim(),
        category: category || "Security",
        subCategory: subCategory || "None",
        sub_category: subCategory || "None",
        priority,
        channel: selectedChannel,
        subject: selectedChannel === "email" ? subject.trim() : undefined,
        content: content.trim(),
        autoApprove,
        status: autoApprove ? "approved" : initial?.status || "pending",
        is_active: initial?.is_active !== undefined ? initial.is_active : 1,
      });
      onClose();
    } catch (err: any) {
      console.error("Save template error:", err);
      toast.error(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (showAiModal) {
          setShowAiModal(false);
        } else {
          onClose();
        }
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, showAiModal, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl sm:max-w-3xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header - Compact */}
        <div className="bg-[#1a3a5c] px-4 py-2.5 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight">
              {title || (initial ? "Edit Template" : "Create Template")}
            </h2>
            <span className="text-[11px] text-blue-200 hidden sm:inline">
              · {companyName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content - Compact spacing */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
          {/* Top Config Grid: Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. OTP Security Verification"
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#e87722] focus:border-[#e87722] outline-none transition-all"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Channel
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#e87722] focus:border-[#e87722] outline-none transition-all cursor-pointer font-medium"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#e87722] focus:border-[#e87722] outline-none transition-all cursor-pointer font-medium"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Top Config Grid: Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className={selectedChannel === "email" ? "sm:col-span-3" : "sm:col-span-6"}>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#e87722] focus:border-[#e87722] outline-none transition-all cursor-pointer font-medium"
              >
                {categoriesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className={selectedChannel === "email" ? "sm:col-span-3" : "sm:col-span-6"}>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Sub Category
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#e87722] focus:border-[#e87722] outline-none transition-all cursor-pointer font-medium"
              >
                {subCategoriesList.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            {selectedChannel === "email" && (
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={`e.g. Verification Code - ${companyName}`}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#e87722] focus:border-[#e87722] outline-none transition-all"
                />
              </div>
            )}
          </div>

          {/* Compact Variables Chips Row */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-2">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                Click Variable to Insert:
              </span>
              <span className="text-[10px] text-gray-400">Inserts at cursor</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {templateVariables.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertVariable(v.tag)}
                  title={v.label}
                  className="px-2 py-0.5 text-[11px] font-mono font-medium bg-white hover:bg-orange-50 hover:text-[#e87722] hover:border-orange-300 text-gray-700 border border-gray-200 rounded-md transition-all cursor-pointer shadow-2xs"
                >
                  {v.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Template Content Editor Area */}
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Template Content <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center gap-1.5">
                {/* Generate with AI Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!aiSubject && (subject || name)) {
                      setAiSubject(subject || name);
                    }
                    setShowAiModal((s) => !s);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Generate with AI</span>
                </button>

                {/* View Switcher: Code vs Preview */}
                <div className="flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("code")}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === "code"
                        ? "bg-[#1a3a5c] text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Code className="w-3 h-3" /> Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("preview")}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === "preview"
                        ? "bg-[#1a3a5c] text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>
              </div>
            </div>

            {/* AI Settings Compact Floating Popover */}
            {showAiModal && (
              <div className="absolute right-0 top-7 z-30 w-full max-w-sm bg-white border border-blue-200 rounded-xl p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Generation Settings</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiModal(false)}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Content Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      placeholder="e.g. Schedule Site Visit, Welcome Message"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Tone</label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded-md bg-white outline-none cursor-pointer"
                      >
                        <option value="Friendly">Friendly</option>
                        <option value="Professional">Professional</option>
                        <option value="Formal">Formal</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Persuasive">Persuasive</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Concise">Concise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Language</label>
                      <select
                        value={aiLang}
                        onChange={(e) => setAiLang(e.target.value)}
                        className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded-md bg-white outline-none cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Marathi">Marathi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Length</label>
                      <select
                        value={aiLength}
                        onChange={(e) => setAiLength(e.target.value)}
                        className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded-md bg-white outline-none cursor-pointer"
                      >
                        <option value="Short">Short</option>
                        <option value="Medium">Medium</option>
                        <option value="Long">Long</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-400">Uses OpenAI ChatGPT</span>
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={aiGenerating}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-yellow-300" />
                          <span>Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "code" ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-[#1e1e2f] shadow-inner">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Template content will appear here or type message text..."
                  className="w-full p-2.5 font-mono text-xs text-gray-100 bg-transparent outline-none resize-y leading-relaxed"
                  required
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 min-h-[140px] max-h-[220px] overflow-y-auto">
                <div
                  className="bg-white rounded-lg shadow-2xs border border-gray-200 p-2.5 text-xs"
                  dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-400 italic'>No content entered yet</p>" }}
                />
              </div>
            )}

            {/* Detected Variables in Content */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-blue-900">
              <span className="font-bold shrink-0">Detected variables:</span>
              <div className="flex flex-wrap gap-1">
                {detectedVariables.length > 0 ? (
                  detectedVariables.map((v) => (
                    <span
                      key={v}
                      className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-semibold"
                    >
                      [{v}]
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-[10px]">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls - Compact */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
            {/* Auto-approve Switch */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="w-4 h-4 accent-[#e87722] rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-700">Auto-approve</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  autoApprove
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {autoApprove ? "Approved" : "Review"}
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-[#e87722] hover:bg-[#d0681a] text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{initial ? "Save Changes" : "Create Template"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}