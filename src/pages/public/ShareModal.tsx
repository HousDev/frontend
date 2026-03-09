// src/pages/public/ShareModal_with_share_landing.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Copy, Facebook, Twitter, Linkedin, Send, Mail, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { toast } from "react-toastify";
import propertiesAPI from "@/lib/propertiesAPI";

/* ----------------------------------------------------------------------------
   Types
---------------------------------------------------------------------------- */
type Props = {
  /** If you pass a full URL, it will be used as-is for sharing/copying */
  url?: string;

  /** If you prefer to construct from parts, provide these: */
  propertyId?: number | string; // e.g., 57
  slug?: string;                 // e.g., "57-commercial-2bhk-commercial-plot-mumbai"

  /** Tracking */
  trackingToken?: string;        // e.g., "d00937b3-edcf-48f6-b700-d58b786e8131"
  trackingParamKey?: string;     // query param key to store token under. Default: "fltcnt"
  /** If true, generate a tracking token if one isn't present via Filter Context API */
  autoCreateTrackingToken?: boolean;

  /** Optional hard-coded base (useful on SSR without window) */
  absoluteBase?: string;         // e.g., "https://resaleexpert.in"

  title?: string;
  description?: string;
  image?: string;
  onClose: () => void;
};

const DEFAULT_TRACKING_PARAM_KEY = "fltcnt";
const STORAGE_KEY = "re_filter_token";

const encode = (s: string) => encodeURIComponent(s || "");

const getOrigin = (fallback?: string) => {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return fallback || "https://resaleexpert.in";
};

const getParam = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get(key);
  } catch {
    return null;
  }
};

const setParamOnCurrentUrl = (key: string, val: string) => {
  if (typeof window === "undefined" || !key || !val) return;
  try {
    const u = new URL(window.location.href);
    u.searchParams.set(key, val);
    window.history.replaceState({}, "", u.toString());
  } catch {}
};

const readTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const persistToken = (token: string) => {
  if (typeof window === "undefined" || !token) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
    // optional also in localStorage as backup:
    localStorage.setItem(STORAGE_KEY, token);
  } catch {}
};

/** Build the final property URL that will be shared/copied */
const buildPropertyUrl = ({
  url,
  propertyId,
  slug,
  trackingToken,
  absoluteBase,
  trackingParamKey = DEFAULT_TRACKING_PARAM_KEY,
}: Pick<
  Props,
  "url" | "propertyId" | "slug" | "trackingToken" | "absoluteBase" | "trackingParamKey"
>) => {
  // 1) If caller provided a full URL, use it directly
  if (url) {
    // ensure token also present on provided URL (if token exists)
    try {
      if (trackingToken) {
        const u = new URL(url);
        u.searchParams.set(trackingParamKey, trackingToken);
        return u.toString();
      }
      return url;
    } catch {
      return url;
    }
  }

  // 2) Otherwise derive from origin + path
  const origin = getOrigin(absoluteBase);

  // Path rules:
  // - If a slug is provided (with or without "properties/"), use it.
  // - Else if only id exists, use "/properties/<id>"
  // - Else fallback to current location (best-effort) or origin.
  let path = "";
  if (slug) {
    const clean = slug.replace(/^\//, "");
    path = clean.startsWith("properties/") ? `/${clean}` : `/properties/${clean}`;
  } else if (propertyId) {
    path = `/properties/${propertyId}`;
  } else if (typeof window !== "undefined") {
    // return current URL + token if possible
    try {
      const u = new URL(window.location.href);
      if (trackingToken) u.searchParams.set(trackingParamKey, trackingToken);
      return u.toString();
    } catch {
      return window.location.href;
    }
  } else {
    return origin; // absolute fallback (SSR w/o data)
  }

  const urlObj = new URL(origin + path);
  if (trackingToken) urlObj.searchParams.set(trackingParamKey, trackingToken);

  return urlObj.toString();
};

/* ----------------------------------------------------------------------------
   ShareModal Component
---------------------------------------------------------------------------- */
export default function ShareModal(props: Props) {
  const {
    onClose,
    title = "Page Title",
    description = "",
    image,
    // URL build params
    url,
    propertyId,
    slug,
    // tracking
    trackingParamKey = DEFAULT_TRACKING_PARAM_KEY,
    trackingToken: trackingTokenProp,
    autoCreateTrackingToken = true,
    // SSR base
    absoluteBase,
  } = props;

  const [trackingToken, setTrackingToken] = useState<string | undefined>(trackingTokenProp);
  const tokenResolvedRef = useRef(false);

  // Simple tracker helper
  const track = useCallback(
    async (eventName: string, payload: Record<string, any> = {}) => {
      try {
        // if there's no propertyId, we still send a generic event with propertyId '0'
        const id = propertyId ?? "0";
        await propertiesAPI.sendPropertyEvent(
          id,
          "share", // eventType
          eventName,
          payload,
          {
            slug: slug ? String(slug) : undefined,
            filterToken: trackingToken,
            // For consistency with searchProperties (which uses filter_token),
            // we'll pass the param key in query as "filter_token". You can switch to trackingParamKey if backend expects that.
            filterParamKey: "filter_token",
          }
        );
      } catch (e) {
        // silent fail — tracking should not block UX
        // console.warn("share tracking failed", e);
      }
    },
    [propertyId, slug, trackingToken]
  );

  // Resolve tracking token on mount:
  useEffect(() => {
    if (tokenResolvedRef.current) return; // guard
    tokenResolvedRef.current = true;

    (async () => {
      // Priority: 1) prop  2) URL param  3) storage  4) create (if enabled)
      let token = trackingTokenProp || getParam(trackingParamKey) || readTokenFromStorage() || "";

      if (!token && autoCreateTrackingToken) {
        try {
          // Create a "filter context" with a minimal payload describing source
          const res = await propertiesAPI.createFilterContext({
            filters: {
              source: "share_modal",
              // you can enrich with current page context if needed
              slug: slug || null,
              propertyId: propertyId ?? null,
            },
            user_id: null,
          });
          token = res?.id || res?.data?.id || "";
        } catch {
          token = "";
        }
      }

      if (token) {
        setTrackingToken(token);
        persistToken(token);
        // Reflect in URL (current page), helpful for attribution continuity:
        setParamOnCurrentUrl(trackingParamKey, token);
      }
    })();
  }, [autoCreateTrackingToken, trackingParamKey, trackingTokenProp, propertyId, slug]);

  const safeTitle = title || "";
  const safeDesc = description || "";

  // URL we will share/copy — recomputed whenever token changes
  const shareUrl = useMemo(
    () =>
      buildPropertyUrl({
        url,
        propertyId,
        slug,
        trackingToken,
        absoluteBase,
        trackingParamKey,
      }),
    [url, propertyId, slug, trackingToken, absoluteBase, trackingParamKey]
  );

  // Prepare platform share links — each points to shareUrl
  const shareText = safeTitle + (safeDesc ? ` — ${safeDesc}` : "");
  const shareTextWithUrl = `${shareText}\n\n${shareUrl}`;

  const wa = `https://wa.me/?text=${encode(shareTextWithUrl)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encode(shareUrl)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encode(shareText)}&url=${encode(shareUrl)}`;
  const ln = `https://www.linkedin.com/shareArticle?mini=true&url=${encode(shareUrl)}&title=${encode(
    safeTitle
  )}&summary=${encode(safeDesc)}`;
  const tg = `https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(shareText)}`;
  const mail = `mailto:?subject=${encode(safeTitle)}&body=${encode(shareTextWithUrl)}`;

  const copyLink = async () => {
    const textToCopy = shareUrl;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        toast.success("Share link copied to clipboard!");
      } else {
        const input = document.createElement("textarea");
        input.value = textToCopy;
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        toast.success("Share link copied to clipboard!");
      }
      track("share_copy", { url: shareUrl });
    } catch (e) {
      console.error("Copy failed", e);
      toast.error("Could not copy. Please copy manually.");
    }
  };

  // Track modal open once the token is known (or at least attempted)
  useEffect(() => {
    track("share_open", { hasToken: Boolean(trackingToken), trackingParamKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingToken]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 !mt-0">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 relative">
        {/* Close */}
        <button
          onClick={() => {
            track("share_close");
            onClose();
          }}
          aria-label="Close share modal"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-2">Share</h2>

        {safeTitle && <h3 className="text-sm font-medium mb-1 truncate">{safeTitle}</h3>}
        {safeDesc ? <p className="text-sm text-gray-500 mb-2 line-clamp-3">{safeDesc}</p> : null}
        {image ? (
          <img src={image} alt={safeTitle} className="w-full rounded-md mb-3 object-cover max-h-48" />
        ) : null}

        {/* Readonly URL preview */}
        <div className="flex items-center gap-2 mb-2">
          <input
            value={shareUrl}
            readOnly
            className="flex-1 text-xs border rounded px-2 py-1 bg-gray-50"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={copyLink}
            className="flex items-center gap-1 px-2 py-1 text-sm border rounded hover:bg-gray-100"
          >
            <Copy size={14} /> Copy
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs"
            onClick={() => track("share_click", { platform: "whatsapp", url: shareUrl })}
          >
            <FaWhatsapp size={18} className="text-green-600" />
            WhatsApp
          </a>
          <a
            href={fb}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs"
            onClick={() => track("share_click", { platform: "facebook", url: shareUrl })}
          >
            <Facebook size={18} className="text-blue-600" />
            Facebook
          </a>
          <a
            href={tw}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs"
            onClick={() => track("share_click", { platform: "twitter", url: shareUrl })}
          >
            <Twitter size={18} className="text-sky-500" />
            Twitter
          </a>
          <a
            href={ln}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs"
            onClick={() => track("share_click", { platform: "linkedin", url: shareUrl })}
          >
            <Linkedin size={18} className="text-blue-700" />
            LinkedIn
          </a>
          <a
            href={tg}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs"
            onClick={() => track("share_click", { platform: "telegram", url: shareUrl })}
          >
            <Send size={18} className="text-sky-600" />
            Telegram
          </a>
          <a
            href={mail}
            className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs"
            onClick={() => track("share_click", { platform: "email", url: shareUrl })}
          >
            <Mail size={18} className="text-red-500" />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
