// src/components/shared/ShareModalBlog.tsx
import React from "react";
import {
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Mail,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { toast } from "react-toastify";

type Props = {
  /** Agar aap full URL pass kar do, wahi use hoga (override). */
  url?: string;

  /** Canonical URL banane ke liye parts */
  slug?: string;            // e.g. "how-to-invest-smart"
  trackingToken?: string;   // optional e.g. "d00937b3-..."
  absoluteBase?: string;    // e.g. "https://investordeal.in" (SSR ke liye)

  title?: string;
  description?: string;
  image?: string;
  onClose: () => void;
};

const enc = (s: string) => encodeURIComponent(s || "");

const getOrigin = (fallback?: string) => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return fallback || "https://investordeal.in";
};

/** ✅ Single-source-of-truth: blog URL builder */
const buildBlogUrl = ({
  url,
  slug,
  trackingToken,
  absoluteBase,
}: Pick<Props, "url" | "slug" | "trackingToken" | "absoluteBase">) => {
  // 1) Full URL provided => use-as-is
  if (url) return url;

  // 2) Derive from origin + /blogs/<slug>
  const origin = getOrigin(absoluteBase);

  // Agar slug nahi mila, last-resort: current page ya /blogs
  let path = slug ? `/blogs/${encodeURIComponent(slug)}` : "";
  if (!path) {
    if (typeof window !== "undefined") return window.location.href;
    return origin + "/blogs";
  }

  const u = new URL(origin + path);
  if (trackingToken) u.searchParams.set("tf", trackingToken);
  return u.toString();
};

export default function ShareModalBlog(props: Props) {
  const {
    onClose,
    title = "Blog",
    description = "",
    image,
    url,
    slug,
    trackingToken,
    absoluteBase,
  } = props;

  const safeTitle = title || "";
  const safeDesc = description || "";

  // ✅ Canonical blog URL (SSOT for share + copy)
  const shareUrl = buildBlogUrl({ url, slug, trackingToken, absoluteBase });

  const shareText = safeTitle + (safeDesc ? ` — ${safeDesc}` : "");
  const shareTextWithUrl = `${shareText}\n\n${shareUrl}`;

  // ✅ Sab platforms par canonical blog URL hi jayega
  const wa = `https://wa.me/?text=${enc(shareTextWithUrl)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`;
  const tw = `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`;
  const ln = `https://www.linkedin.com/shareArticle?mini=true&url=${enc(shareUrl)}&title=${enc(safeTitle)}&summary=${enc(safeDesc)}`;
  const tg = `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareText)}`;
  const mail = `mailto:?subject=${enc(safeTitle)}&body=${enc(shareTextWithUrl)}`;

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Share link copied to clipboard!");
    } catch (e) {
      console.error("Copy failed", e);
      toast.error("Could not copy. Please copy manually.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close share modal"
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="mb-2 text-lg font-semibold">Share</h2>

        {safeTitle && (
          <h3 className="mb-1 truncate text-sm font-medium">{safeTitle}</h3>
        )}
        {safeDesc ? (
          <p className="mb-2 line-clamp-3 text-sm text-gray-500">{safeDesc}</p>
        ) : null}
        {image ? (
          <img
            src={image}
            alt={safeTitle}
            className="mb-3 max-h-48 w-full rounded-md object-cover"
          />
        ) : null}

        {/* Readonly URL preview + Copy */}
        <div className="mb-2 flex items-center gap-2">
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

        <div className="mb-2 grid grid-cols-3 gap-2">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100">
            <FaWhatsapp size={18} className="text-green-600" />
            WhatsApp
          </a>
          <a href={fb} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100">
            <Facebook size={18} className="text-blue-600" />
            Facebook
          </a>
          <a href={tw} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100">
            <Twitter size={18} className="text-sky-500" />
            Twitter
          </a>
          <a href={ln} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100">
            <Linkedin size={18} className="text-blue-700" />
            LinkedIn
          </a>
          <a href={tg} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100">
            <Send size={18} className="text-sky-600" />
            Telegram
          </a>
          <a href={mail} className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100">
            <Mail size={18} className="text-red-500" />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
