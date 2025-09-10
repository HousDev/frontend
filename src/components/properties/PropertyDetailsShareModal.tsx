import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Copy,
  MessageCircle,
  Mail,
  Link as LinkIcon,
  QrCode,
  Share2,
  ChevronDown,
} from "lucide-react";

// Buyer passed from parent
export type Buyer = {
  name?: string;
  phone?: string; // ex: 9876543210 or +919876543210
  email?: string;
};

type LoggedInEmployee = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedProperties: any[]; // RAW objects (p._raw)
  buyer?: Buyer;
};

const PropertyDetailsShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  selectedProperties,
  buyer,
}) => {
  const [customMessage, setCustomMessage] = useState("");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const [agent, setAgent] = useState<LoggedInEmployee>({});

  if (!isOpen) return null;

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // --- Logged-in employee (from localStorage) ---
  function getLoggedInEmployee(): LoggedInEmployee {
    if (typeof window === "undefined") return {};
    const rawEmployee = localStorage.getItem("employee");
    const rawRole = localStorage.getItem("employeeRole");
    const rawUser = localStorage.getItem("user");

    let employee: any = null;
    let user: any = null;
    let role: string | undefined;

    try { employee = rawEmployee ? JSON.parse(rawEmployee) : null; } catch {}
    try { user = rawUser ? JSON.parse(rawUser) : null; } catch {}

    try {
      if (rawRole) {
        const r = JSON.parse(rawRole);
        role = r?.name || r?.role || r?._id;
      }
    } catch {
      role = rawRole || undefined;
    }

    const name =
      employee?.name ||
      employee?.employeeName ||
      [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
      user?.username;

    // email/phone fallbacks (cover both employee & user objects)
    const email = employee?.email || user?.email;
    const phone =
      employee?.phone ||
      employee?.mobile ||
      employee?.whatsapp ||
      user?.phone ||
      user?.mobile ||
      user?.whatsapp;

    return { name, email, phone, role };
  }

  useEffect(() => {
    setAgent(getLoggedInEmployee());
  }, []);

  // ---- helpers ------------------------------------------------
  const formatCurrency = (amount?: number) => {
    const n = Number(amount || 0);
    if (!n) return "—";
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  const getTitle = (p: any, idx: number) =>
    p?.title ||
    [p?.unit_type || p?.bhk, p?.property_subtype_name || p?.property_type_name, p?.society_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    `Property #${idx + 1}`;

  const getAddress = (p: any) =>
    p?.address ||
    [p?.location_name || p?.locality_name, p?.city_name || p?.city]
      .filter(Boolean)
      .join(", ");

  const getPhoto = (p: any) =>
    Array.isArray(p?.photos) && p.photos.length
      ? typeof p.photos[0] === "string"
        ? p.photos[0]
        : p.photos[0]?.url
      : "";

  const getPrice = (p: any) => p?.budget ?? p?.price ?? p?.expected_price;

  const getSellerName = (p: any) =>
    p?.seller_name || p?.owner_name || p?.contact_name || p?.seller || p?.owner || "—";

  const getSellerPhone = (p: any) =>
    p?.seller_phone || p?.owner_phone || p?.contact_phone || p?.phone || "";

  const getSellerEmail = (p: any) =>
    p?.seller_email || p?.owner_email || p?.contact_email || p?.email || "";

  const publicLinkFor = (p: any) => {
    const base = "https://resaleexpert.com/property";
    const id = p?.id ?? p?.property_id ?? "";
    const title = getTitle(p, 0);
    const slug = String(title)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return `${base}/${id}/${slug}`;
  };

  // WhatsApp needs an international number without the leading +, no spaces
  const normalizeWhatsAppNumber = (raw?: string) => {
    if (!raw) return "";
    const digits = String(raw).replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  // ---- message builder ----------------------------------------
  // NOTE: Now this uses AGENT (admin) details for Contact/Email
  const defaultMessageCore = useMemo(() => {
    if (!Array.isArray(selectedProperties) || selectedProperties.length === 0) {
      return "No properties selected.";
    }
    const agentName = agent?.name || "—";
    const agentPhone = agent?.phone || "—";
    const agentEmail = agent?.email || "—";

    const blocks = selectedProperties.map((p: any, idx: number) => {
      const title = getTitle(p, idx);
      const address = getAddress(p) || "—";
      const carpet =
        p?.carpet_area || p?.area || p?.super_builtup_area
          ? `${Number(p?.carpet_area ?? p?.area ?? p?.super_builtup_area).toLocaleString("en-IN")} sq ft`
          : "—";
      const price = getPrice(p) ? formatCurrency(getPrice(p)) : "—";
      const floor =
        p?.floor && p?.total_floors ? `${p.floor} of ${p.total_floors}` : p?.floor || "—";
      const parking =
        p?.parking_qty || p?.parking_type
          ? [p?.parking_qty, p?.parking_type].filter(Boolean).join(" ")
          : "—";
      const furnishing = p?.furnishing || p?.furnished_status || "—";
      const amns = Array.isArray(p?.amenities) ? p.amenities.slice(0, 5) : [];
      const amnLines = amns.length
        ? amns.map((a: string) => `• ${a}`).join("\n")
        : "• Premium amenities available";
      const link = publicLinkFor(p);

      return (
        `🏠 *${title}*\n` +
        `📍 *Location:* ${address}\n` +
        `🏢 *Type:* ${(p?.unit_type || p?.bhk || "—").toString().toUpperCase()} • ${carpet}\n` +
        `💰 *Price:* ${price}\n` +
        `🏗️ *Floor:* ${floor}\n` +
        `🚗 *Parking:* ${parking}\n` +
        `🛋️ *Furnishing:* ${furnishing}\n\n` +
        `✨ *Amenities:*\n${amnLines}\n\n` +
        `🔗 ${link}\n` +
        `👤 *Agent:* ${agentName}\n` +
        `📞 *Contact:* ${agentPhone}\n` +
        `📧 *Email:* ${agentEmail}`
      );
    });

    return `${blocks.join("\n\n---\n\n")}\n\n*Interested? Contact us for a site visit!*`;
  }, [selectedProperties, agent?.name, agent?.phone, agent?.email]);

  // Greeting if buyer present (unchanged)
  const defaultMessage = useMemo(() => {
    const buyerName =
      buyer?.name || (buyer as any)?.buyer_name || (buyer as any)?.client_name;
    if (!buyerName || String(buyerName).trim() === "") return defaultMessageCore;
    return `Hi ${buyerName},\n\n${defaultMessageCore}`;
  }, [buyer, defaultMessageCore]);

  const previewMessage = customMessage || defaultMessage;

  // ---- contacts aggregator (seller table remains same) --------
  const contacts = useMemo(() => {
    const list = Array.isArray(selectedProperties)
      ? selectedProperties.map((p: any) => ({
          id: p?.id ?? p?.property_id ?? Math.random(),
          sellerName: getSellerName(p),
          phone: getSellerPhone(p),
          email: getSellerEmail(p),
          link: publicLinkFor(p),
          title: getTitle(p, 0),
        }))
      : [];
    const seen = new Set<string>();
    return list.filter((c) => {
      const key = `${c.phone}|${c.email}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedProperties]);

  // ---- share handlers -----------------------------------------
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch (e) {
      console.error(e);
    }
  };

  const shareWhatsApp = () => {
    const toNumber = normalizeWhatsAppNumber(buyer?.phone);
    const base = toNumber ? `https://wa.me/${toNumber}` : `https://wa.me/`;
    const url = `${base}?text=${encodeURIComponent(previewMessage)}`;
    window.open(url, "_blank");
  };

  const shareEmail = () => {
    const subject = `Property List (${selectedProperties?.length || 0} item${
      (selectedProperties?.length || 0) === 1 ? "" : "s"
    })`;
    const to = buyer?.email ? encodeURIComponent(buyer.email) : "";
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      previewMessage
    )}`;
    window.open(url, "_blank");
  };

  const copyAllLinks = () => {
    const links = (selectedProperties || []).map(publicLinkFor).join("\n");
    copyText(links);
  };

  const openQRPage = () => {
    const html = (selectedProperties || [])
      .map((p: any) => {
        const link = publicLinkFor(p);
        const title = getTitle(p, 0);
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
        return `
          <div style="display:flex;gap:16px;align-items:center;margin:16px 0;">
            <img src="${qr}" alt="QR" width="120" height="120" />
            <div>
              <div style="font-weight:600;font-size:16px;">${title}</div>
              <div style="font-size:12px;color:#555;">${link}</div>
            </div>
          </div>
        `;
      })
      .join("");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`
        <html>
          <head><title>Property QR Codes</title></head>
          <body style="font-family:Arial, sans-serif;padding:24px;">
            <h2 style="margin-top:0;">Property QR Codes</h2>
            ${html || "<div>No properties selected.</div>"}
          </body>
        </html>
      `);
      w.document.close();
    }
  };

  const getBuyerDisplayName = () =>
    buyer?.name || (buyer as any)?.buyer_name || (buyer as any)?.client_name;

  // ---- UI ------------------------------------------------------
  const modal = (
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
          {/* header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">
                Share {selectedProperties?.length || 0} Property
                {(selectedProperties?.length || 0) === 1 ? "" : "ies"}
              </h2>

              {/* Logged-in employee pills */}
              <div className="flex items-center gap-2 text-[11px]">
                {agent.role && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">
                    Role: <b className="ml-1">{agent.role}</b>
                  </span>
                )}
                {agent.name && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                    {agent.name}
                  </span>
                )}
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 border"
                  >
                    {agent.phone}
                  </a>
                )}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 border"
                  >
                    {agent.email}
                  </a>
                )}
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* body */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {/* Recipient pill */}
            <div className="mb-4 flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                Sending to buyer{getBuyerDisplayName() ? `: ${getBuyerDisplayName()}` : ""}
              </span>
              {buyer?.phone && (
                <a href={`tel:${buyer.phone}`} className="px-2 py-1 bg-gray-50 rounded-md border text-gray-700">
                  {buyer.phone}
                </a>
              )}
              {buyer?.email && (
                <a href={`mailto:${buyer.email}`} className="px-2 py-1 bg-gray-50 rounded-md border text-gray-700">
                  {buyer.email}
                </a>
              )}
            </div>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEFT: Selected Properties */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Selected Properties</div>
                {!selectedProperties || selectedProperties.length === 0 ? (
                  <div className="text-sm text-gray-500">No properties selected.</div>
                ) : (
                  <div className="space-y-3">
                    {selectedProperties.map((p: any, i: number) => {
                      const photo = getPhoto(p);
                      const title = getTitle(p, i);
                      const address = getAddress(p);
                      const price = getPrice(p);
                      return (
                        <div key={(p?.id ?? p?.property_id ?? i).toString()} className="border rounded-xl p-3">
                          <div className="flex gap-3">
                            <div className="w-24 h-20 bg-gray-100 rounded-lg overflow-hidden flex-none">
                              {photo ? (
                                <img src={photo} alt={title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{title}</div>
                                  <div className="text-xs text-gray-600">{address || "—"}</div>
                                </div>
                                <div className="text-right text-sm font-semibold text-emerald-700">
                                  {formatCurrency(price)}
                                </div>
                              </div>
                              <div className="mt-2 text-[11px] text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                                {p?.carpet_area || p?.area || p?.super_builtup_area ? (
                                  <span>
                                    Area:{" "}
                                    <b>
                                      {Number(p?.carpet_area ?? p?.area ?? p?.super_builtup_area).toLocaleString(
                                        "en-IN"
                                      )}{" "}
                                      sq ft
                                    </b>
                                  </span>
                                ) : null}
                                {p?.floor ? (
                                  <span>
                                    Floor: <b>{p.floor}{p?.total_floors ? ` of ${p.total_floors}` : ""}</b>
                                  </span>
                                ) : null}
                                {p?.facing ? (
                                  <span>
                                    Facing: <b>{p.facing}</b>
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-2 text-[11px]">
                                <a
                                  href={publicLinkFor(p)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View public page
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: Message Preview */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Message Preview</div>
                <textarea
                  className="w-full h-[340px] border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={previewMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomMessage(defaultMessage)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    Use Default
                  </button>
                  <button
                    onClick={() => setCustomMessage("")}
                    className="px-3 py-1.5 text-xs rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => copyText(previewMessage)}
                    className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-2"
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="p-4 border-t flex items-center justify-end gap-2 relative">
            <div className="relative">
              <button
                onClick={() => setShareMenuOpen((v) => !v)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 inline-flex items-center gap-2"
              >
                <Share2 size={16} />
                Share
                <ChevronDown size={16} />
              </button>
              {shareMenuOpen && (
                <div
                  className="absolute top-[-200px] right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-10"
                  onMouseLeave={() => setShareMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setShareMenuOpen(false);
                      shareWhatsApp();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm"
                    title={buyer?.phone ? `Send to ${buyer.phone}` : "Open WhatsApp composer"}
                  >
                    <MessageCircle size={16} className="text-green-600" />
                    WhatsApp {buyer?.phone ? "(Buyer)" : ""}
                  </button>
                  <button
                    onClick={() => {
                      setShareMenuOpen(false);
                      shareEmail();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm"
                    title={buyer?.email ? `Send to ${buyer.email}` : "Open email composer"}
                  >
                    <Mail size={16} className="text-blue-600" />
                    Email {buyer?.email ? "(Buyer)" : ""}
                  </button>
                  <button
                    onClick={() => {
                      setShareMenuOpen(false);
                      copyText(previewMessage);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    <Copy size={16} />
                    Copy Message
                  </button>
                  <button
                    onClick={() => {
                      setShareMenuOpen(false);
                      copyAllLinks();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    <LinkIcon size={16} />
                    Copy All Links
                  </button>
                  <button
                    onClick={() => {
                      setShareMenuOpen(false);
                      openQRPage();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    <QrCode size={16} />
                    Open QR Page
                  </button>
                </div>
              )}
            </div>

            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // render to body to avoid parent overflow clipping
  return ReactDOM.createPortal(modal, document.body);
};

export default PropertyDetailsShareModal;
