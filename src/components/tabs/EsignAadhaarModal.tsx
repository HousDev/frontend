// src/components/documents/modals/EsignAadhaarModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  ShieldCheck,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
  Copy as CopyIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";

/* ----------------------------- Types & Shape ---------------------------- */

type PartyRole = "Buyer" | "Seller" | "Custom";

type Signer = {
  id: string;
  role: PartyRole;
  name: string;
  email: string;
  phone: string;
  reason?: string;
  sign_type?: "digital" | "eSign" | "auth" | string;
  signature_mode?: "online" | "offline" | string;
  signer_tag?: string;        // key for sign_coordinates
  anchor_string?: string;     // [[ANCHOR_NAME]] in PDF
  index?: number;
  signing_addons?: { type?: string; performEnrichment?: boolean; optional?: boolean }[];
  verified?: boolean;
  link_sent?: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | string;
  defaultBuyer?: { name?: string; email?: string; phone?: string };
  defaultSeller?: { name?: string; email?: string; phone?: string };
  onProgress?: (args: { docId: number | string; payload?: Record<string, any> }) => void | Promise<void>;
  onBothSigned?: (args: { docId: number | string }) => void | Promise<void>;
};

/* ---------------------------- Helpers / Utils ---------------------------- */

const uid = (prefix = "") => `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
const isPhone = (s: string) => /^\+?\d{7,15}$/.test(s);

// normalize to [[NAME]] even if user types SIGN_NAME or [SIGN_NAME]
const normalizeAnchor = (raw?: string) => {
  if (!raw) return "";
  let s = String(raw).trim();
  s = s.replace(/^\[+/, "").replace(/\]+$/, ""); // strip any surrounding []
  if (!s) return "";
  return `[[${s}]]`;
};

/* ------------------------------- Component ------------------------------- */

export default function EsignAadhaarModal({
  isOpen,
  onClose,
  documentId,
  defaultBuyer,
  defaultSeller,
  onProgress,
  onBothSigned,
}: Props) {
  // Preview state
  const [showPreview, setShowPreview] = useState(true);
  const [previewPage, setPreviewPage] = useState<"a4" | "legal">("a4");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [documentDetails, setDocumentDetails] = useState<any>(null);

  // Signers initial (defaults include anchors + signer_tag)
  const initialSigners: Signer[] = [
    {
      id: uid("buyer-"),
      role: "Buyer",
      name: defaultBuyer?.name || "",
      email: defaultBuyer?.email || "",
      phone: defaultBuyer?.phone || "",
      reason: "Please sign as Buyer",
      signer_tag: "buyer",
      anchor_string: "[[SIGN_BUYER]]",
      index: 0,
      verified: false,
      link_sent: false,
      signing_addons: [],
    },
    {
      id: uid("seller-"),
      role: "Seller",
      name: defaultSeller?.name || "",
      email: defaultSeller?.email || "",
      phone: defaultSeller?.phone || "",
      reason: "Please sign as Seller",
      signer_tag: "seller",
      anchor_string: "[[SIGN_SELLER]]",
      index: 1,
      verified: false,
      link_sent: false,
      signing_addons: [],
    },
  ];

  const [signers, setSigners] = useState<Signer[]>(initialSigners);
  const [sendingLinks, setSendingLinks] = useState(false);
  const [selectedSigners, setSelectedSigners] = useState<string[]>([]);
  const payloadRef = useRef<HTMLElement | null>(null);

  /* ---------------------------- Document Details --------------------------- */
  const loadDocumentDetails = async () => {
    if (!documentId) return;
    try {
      const details = await documentsGeneratedAPI.getById(documentId);
      setDocumentDetails(details);
    } catch (err) {
      console.error("Failed to load document details:", err);
    }
  };

  /* ---------------------------- Preview loader --------------------------- */
  const loadPreview = async () => {
    if (!documentId) return;
    try {
      setLoadingPreview(true);
      const url = await documentsGeneratedAPI.previewUrl(documentId, previewPage);
      setPdfUrl(url);
    } catch (err) {
      console.error("Failed to load preview:", err);
      toast.error("Failed to load PDF preview");
      setPdfUrl("");
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDocumentDetails();
      if (showPreview) {
        loadPreview();
      }
    }
    return () => {
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, showPreview, previewPage, documentId]);

  /* ------------------------------- Signers -------------------------------- */

  const buyer = useMemo(() => signers.find((s) => s.role === "Buyer") || null, [signers]);
  const seller = useMemo(() => signers.find((s) => s.role === "Seller") || null, [signers]);

  const buyerVerified = !!buyer && !!buyer.verified;
  const sellerVerified = !!seller && !!seller.verified;

  const addCustomSigner = () => {
    // ask role
    const roleInput = (window.prompt("Role? (Buyer/Seller/Custom)", "Custom") || "Custom").trim();
    const role: PartyRole = (["Buyer", "Seller", "Custom"].includes(roleInput) ? (roleInput as PartyRole) : "Custom");

    // ask signer_tag (key)
    const tag =
      (window.prompt(
        "Signer Tag (used as key in sign_coordinates)",
        role === "Custom" ? `custom-${signers.length}` : role.toLowerCase()
      ) || ""
      ).trim() || (role === "Custom" ? `custom-${signers.length}` : role.toLowerCase());

    // ask anchor
    const anchorRaw =
      window.prompt(
        "Anchor name in PDF (e.g. SIGN_BUYER). I'll wrap in [[...]] automatically:",
        role === "Buyer" ? "SIGN_BUYER" : role === "Seller" ? "SIGN_SELLER" : `SIGN_${tag.toUpperCase()}`
      ) || "";
    const anchor_string = normalizeAnchor(anchorRaw);

    const idx = signers.length;
    const s: Signer = {
      id: uid("signer-"),
      role,
      name: "",
      email: "",
      phone: "",
      reason: role === "Buyer" ? "Please sign as Buyer" : role === "Seller" ? "Please sign as Seller" : "Please sign",
      signer_tag: tag,
      anchor_string,
      index: idx,
      verified: false,
      link_sent: false,
      signing_addons: [],
    };
    setSigners((p) => [...p, s]);
    // ✅ ensure new custom signer is counted/selected
    setSelectedSigners((prev) => [...prev, s.id]);
  };

  const updateSigner = (id: string, patch: Partial<Signer>) => {
    setSigners((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSigner = (id: string) => {
    setSigners((p) => p.filter((s) => s.id !== id));
    // ✅ also remove from selected
    setSelectedSigners((prev) => prev.filter((x) => x !== id));
  };

  /* ------------------------------- Selection ------------------------------- */

  const toggleSelectSigner = (id: string) => {
    setSelectedSigners((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // ✅ Auto-select existing signers on open (first render)
  useEffect(() => {
    if (isOpen && signers.length > 0 && selectedSigners.length === 0) {
      setSelectedSigners(signers.map((s) => s.id));
    }
  }, [isOpen, signers.length]);

  /* ------------------------------- Payload -------------------------------- */

  const buildPayload = (onlySignerIds?: string[]) => {
    // Which signers to include
    const signersToInclude =
      typeof onlySignerIds === "undefined"
        ? selectedSigners.length > 0
          ? signers.filter((s) => selectedSigners.includes(s.id))
          : signers
        : signers.filter((s) => onlySignerIds.includes(s.id));

    // signers array for Digio
    const signersPayload = signersToInclude.map((s, i) => {
      let identifier = "";
      if (s.email && s.phone) identifier = s.email;
      else if (s.email) identifier = s.email;
      else if (s.phone) identifier = s.phone;

      return {
        identifier,
        reason: s.reason || "",
        sign_type: s.sign_type || "eSign",
        signature_mode: s.signature_mode || "online",
        name: s.name,
        signer_tag: s.signer_tag,
        signing_addons: s.signing_addons || [],
        index: typeof s.index === "number" ? s.index : i,
        email: s.email || undefined,
        phone: s.phone || undefined,
      };
    });

    // build sign_coordinates from anchors
    const sign_coordinates: Record<string, any> = {};
    signersToInclude.forEach((s) => {
      const tag = (s.signer_tag || "").trim();
      const anchor = (s.anchor_string || "").trim();
      if (tag && anchor) {
        sign_coordinates[tag] = { anchor_string: normalizeAnchor(anchor) };
      }
    });

    const estamp_request = {
      tags: {},
      note_content: "",
      note_on_page: "last",
      sign_on_page: "last",
    };

    const signature_verification = {};

    const actualPdfUrl = documentDetails?.file_path || documentDetails?.pdf_url || "";
       const fileName =
      documentDetails?.name ||
      documentDetails?.file_path?.split("/").pop() ||
      `document-${documentId}.pdf`;

    const payload: Record<string, any> = {
      file_name: fileName,
      pdf_url: actualPdfUrl,
      will_self_sign: false,
      signatory: "multiple",
      expire_in_days: 30,
      callback: "",
      comment: "",
      display_on_page: "last",
      sign_coordinates, // << now filled from anchors
      notify_signers: true,
      customer_notification_mode: "sms_and_email",
      signature_type: "simple",
      estamp_request,
      generate_access_token: true,
      post_signing_receivers: [],
      signature_verification,
      include_authentication_url: false,
      reference_id: String(documentId),
      signers: signersPayload,
      sequential: false,
      send_sign_link: true,
    };

    return payload;
  };

  /* ---------------------------- Copy / Send actions ----------------------- */

  const copyPayload = async () => {
    try {
      const payload = buildPayload();
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success("Payload copied to clipboard");
    } catch {
      toast.error("Failed to copy payload");
    }
  };

  const sendSignLinks = async (signerIds?: string[]) => {
    const idsToSend = signerIds ?? selectedSigners;

    if (!idsToSend || idsToSend.length === 0) {
      toast.warn("No signers selected to send links to.");
      return;
    }

    const signersToSend = signers.filter((s) => idsToSend.includes(s.id));
    const invalidSigners = signersToSend.filter((s) => !s.email && !s.phone);

    if (invalidSigners.length > 0) {
      toast.error("Some signers are missing both email and phone. Please provide at least one contact method.");
      return;
    }

    const payload = buildPayload(idsToSend);
    console.log("digio for payload",payload)
    onProgress?.({ docId: documentId, payload });

    try {
      setSendingLinks(true);
      await new Promise((r) => setTimeout(r, 700)); // replace with real API
      setSigners((prev) => prev.map((s) => (idsToSend.includes(s.id) ? { ...s, link_sent: true } : s)));
      toast.success(`Sign links sent to ${idsToSend.length} signer(s) via Email/SMS.`);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to send sign links");
    } finally {
      setSendingLinks(false);
    }
  };

  const sendAllSignLinks = async () => {
    await sendSignLinks(signers.map((s) => s.id));
  };

  useEffect(() => {
    if (buyerVerified && sellerVerified) {
      onBothSigned?.({ docId: documentId });
    }
  }, [buyerVerified, sellerVerified]);

  if (!isOpen) return null;

  const payload = buildPayload();
  const allSelected = selectedSigners.length === signers.length; // ✅ FIX: define allSelected so buttons/count work

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 !mt-0">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                E-sign (SMS & Email)
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                  <FileText size={14} /> Doc ID: <span className="truncate max-w-[160px]">{String(documentId)}</span>
                </span>
              </h3>
              <p className="text-xs text-gray-600">Select signers and send signing links via both SMS and Email.</p>
              {documentDetails && (
                <div className="mt-1 text-xs text-gray-500">
                  Document: {documentDetails.name || `Document ${documentId}`}
                  {documentDetails.file_path && <span className="ml-2">• Path: {documentDetails.file_path}</span>}
                </div>
              )}
            </div>

            {/* PDF & actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600">Page:</label>
                <select
                  value={previewPage}
                  onChange={(e) => setPreviewPage(e.target.value as "a4" | "legal")}
                  className="text-xs border rounded-lg px-2 py-1"
                  title="Choose PDF page format"
                >
                  <option value="a4">A4</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              <button
                onClick={() => setShowPreview((v) => !v)}
                className="px-2 py-1.5 text-xs border rounded-lg hover:bg-gray-50"
                type="button"
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>

              <button
                onClick={async () => {
                  try {
                    if (!documentId) throw new Error("Document ID not available");
                    await documentsGeneratedAPI.openPreview(documentId, previewPage);
                  } catch (e: any) {
                    console.error(e);
                    toast.error(e?.message || "Failed to open preview");
                  }
                }}
                className="px-2 py-1.5 text-xs border rounded-lg flex items-center gap-1 hover:bg-gray-50"
                type="button"
                title="Open in new tab"
              >
                <ExternalLink size={14} /> Open
              </button>

              <button
                onClick={loadPreview}
                className="px-2 py-1.5 text-xs border rounded-lg flex items-center gap-1 hover:bg-gray-50"
                type="button"
                title="Refresh preview"
                disabled={loadingPreview}
              >
                <RefreshCw size={14} className={loadingPreview ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close" type="button">
              <X size={18} />
            </button>
          </div>

          {/* Quick status */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${buyerVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
              Buyer {buyerVerified ? "verified ✓" : "pending"}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${sellerVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
              Seller {sellerVerified ? "verified ✓" : "pending"}
            </span>

            <div className="ml-3 text-[11px] text-gray-500">
              File: <span className="font-mono text-[11px] break-all max-w-xs inline-block align-middle">
                {payload.file_name || "not available"}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Left: Signer configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Signers</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSigners(signers.map((s) => s.id))}
                    disabled={allSelected}
                    className={`px-2 py-1 text-xs border rounded ${allSelected ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"}`}
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedSigners([])}
                    disabled={selectedSigners.length === 0}
                    className={`px-2 py-1 text-xs border rounded ${selectedSigners.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"}`}
                  >
                    Deselect All
                  </button>

                  <button onClick={addCustomSigner} className="px-3 py-1.5 text-xs border rounded-lg flex items-center gap-1 hover:bg-gray-50" type="button">
                    <Plus size={14} /> Add Signer
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {signers.map((s, idx) => {
                  const hasEmail = !!s.email && isEmail(s.email);
                  const hasPhone = !!s.phone && isPhone(s.phone);
                  const hasValidContact = hasEmail || hasPhone;

                  return (
                    <div key={s.id} className="border p-3 rounded-lg bg-white">
                      <div className="flex items-start gap-3">
                        <div className="min-w-[28px]">
                          <input
                            type="checkbox"
                            checked={selectedSigners.includes(s.id)}
                            onChange={() => toggleSelectSigner(s.id)}
                            title="Select this signer to include in payload"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {/* Role select */}
                              <select
                                value={s.role}
                                onChange={(e) => {
                                  const newRole = e.target.value as PartyRole;
                                  const defaults: Record<PartyRole, string> = {
                                    Buyer: "[[SIGN_BUYER]]",
                                    Seller: "[[SIGN_SELLER]]",
                                    Custom: s.anchor_string || "",
                                  };
                                  updateSigner(s.id, {
                                    role: newRole,
                                    reason:
                                      newRole === "Buyer"
                                        ? "Please sign as Buyer"
                                        : newRole === "Seller"
                                        ? "Please sign as Seller"
                                        : "Please sign",
                                    signer_tag:
                                      newRole === "Buyer"
                                        ? "buyer"
                                        : newRole === "Seller"
                                        ? "seller"
                                        : s.signer_tag || `custom-${idx}`,
                                    anchor_string: defaults[newRole],
                                  });
                                }}
                                className="text-xs border rounded px-2 py-1"
                                title="Role"
                              >
                                <option value="Buyer">Buyer</option>
                                <option value="Seller">Seller</option>
                                <option value="Custom">Custom</option>
                              </select>

                              <div className="text-[11px] text-gray-500">Index: {s.index ?? idx}</div>
                              {s.link_sent && <div className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Link sent</div>}
                              {s.verified && <div className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded">Verified</div>}
                            </div>

                            <div className="flex items-center gap-2">
                              {s.role === "Custom" && (
                                <button
                                  onClick={() => removeSigner(s.id)}
                                  className="px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50"
                                  type="button"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inputs */}
                          <div className="mt-3 grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Name</label>
                              <input
                                value={s.name}
                                onChange={(e) => updateSigner(s.id, { name: e.target.value })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm"
                                placeholder="Enter full name"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600 flex items-center gap-1">
                                  <Mail size={12} /> Email
                                </label>
                                <input
                                  type="email"
                                  value={s.email}
                                  onChange={(e) => updateSigner(s.id, { email: e.target.value })}
                                  className="w-full px-2 py-1.5 border rounded-md text-sm"
                                  placeholder="email@example.com"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-gray-600 flex items-center gap-1">
                                  <Phone size={12} /> Phone
                                </label>
                                <input
                                  type="tel"
                                  value={s.phone}
                                  onChange={(e) => updateSigner(s.id, { phone: e.target.value })}
                                  className="w-full px-2 py-1.5 border rounded-md text-sm"
                                  placeholder="+919880012345"
                                />
                              </div>
                            </div>

                            {/* signer_tag + anchor_string */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600">Signer Tag (payload key)</label>
                                <input
                                  value={s.signer_tag || ""}
                                  onChange={(e) => updateSigner(s.id, { signer_tag: e.target.value.trim() })}
                                  className="w-full px-2 py-1.5 border rounded-md text-sm font-mono"
                                  placeholder={s.role === "Buyer" ? "buyer" : s.role === "Seller" ? "seller" : `custom-${idx}`}
                                />
                                <div className="text-[10px] text-gray-500 mt-1">Used as key in <code>sign_coordinates</code></div>
                              </div>

                              <div>
                                <label className="text-xs text-gray-600">Anchor (in PDF)</label>
                                <input
                                  value={s.anchor_string || ""}
                                  onChange={(e) => updateSigner(s.id, { anchor_string: normalizeAnchor(e.target.value) })}
                                  className="w-full px-2 py-1.5 border rounded-md text-sm font-mono"
                                  placeholder={s.role === "Buyer" ? "[[SIGN_BUYER]]" : s.role === "Seller" ? "[[SIGN_SELLER]]" : "[[SIGN_CUSTOM]]"}
                                />
                                <div className="text-[10px] text-gray-500 mt-1">
                                  Example: <code>[[SIGN_SELLER]]</code> — must exist as text in PDF.
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-[12px] flex items-center gap-3">
                            {hasEmail && <span className="text-green-600 flex items-center gap-1"><Mail size={12} /> Email ✓</span>}
                            {hasPhone && <span className="text-green-600 flex items-center gap-1"><Phone size={12} /> SMS ✓</span>}
                            {!hasValidContact && <span className="text-red-600">⚠ Add email or phone</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bulk send selected signers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => sendSignLinks()}
                  disabled={selectedSigners.length === 0 || sendingLinks}
                  className={`px-3 py-2 text-sm rounded ${selectedSigners.length === 0 ? "bg-gray-200 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                  title={selectedSigners.length === 0 ? "Select signer(s) to enable" : "Send sign links to selected signers"}
                >
                  {sendingLinks ? "Sending…" : `Send Selected (${selectedSigners.length})`}
                </button>

                <button
                  onClick={sendAllSignLinks}
                  disabled={sendingLinks || signers.length === 0}
                  className={`px-3 py-2 text-sm rounded ${signers.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 cursor-not-allowed"}`}
                  title="Send sign links to all signers"
                >
                  Send All
                </button>

                <div className="text-xs text-gray-500 ml-auto">
                  {selectedSigners.length} selected • {signers.filter((s) => s.verified).length}/{signers.length} verified
                </div>
              </div>
            </div>

            {/* Right: PDF preview + Payload viewer */}
            <div className="space-y-4">
              <div className="border rounded-xl overflow-hidden bg-gray-100 min-h-[240px]">
                {loadingPreview ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-600 p-6">
                    <RefreshCw size={18} className="animate-spin mr-2" />
                    Loading preview...
                  </div>
                ) : !pdfUrl ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-600 p-6">PDF preview not available.</div>
                ) : (
                  <iframe key={pdfUrl} src={pdfUrl} title="Document Preview" className="w-full h-[48vh] lg:h-[55vh] bg-white" style={{ border: 0 }} />
                )}
              </div>

              <div className="border rounded-lg p-3 bg-white">
                {/* Payload UI trimmed as per your latest code; keep counters */}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">
                    {signers.length} total signers • {selectedSigners.length} selected
                  </div>
                  <button
                    onClick={copyPayload}
                    className="px-3 py-1.5 text-xs border rounded flex items-center gap-1 hover:bg-gray-50"
                    type="button"
                  >
                    <CopyIcon size={14} /> Copy Payload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <ShieldCheck size={14} /> E-sign via SMS & Email (both channels)
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">
              {selectedSigners.length > 0 ? `${selectedSigners.length} signer(s) selected for sending` : "All signers selected by default"}
            </span>

            <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200" type="button">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
