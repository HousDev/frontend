// ShareModal_with_share_landing.tsx
import React from 'react';
import { Copy, Facebook, Twitter, Linkedin, Send, Mail, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'react-toastify';

type Props = {
  /** If you pass a full URL, it will be used as-is for sharing/copying */
  url?: string;

  /** If you prefer to construct from parts, provide these: */
  propertyId?: number | string; // e.g., 57
  slug?: string;                 // e.g., "57-commercial-2bhk-commercial-plot-mumbai"
  trackingToken?: string;        // e.g., "d00937b3-edcf-48f6-b700-d58b786e8131"
  /** Optional hard-coded base (useful on server-side rendering without window) */
  absoluteBase?: string;         // e.g., "https://investordeal.in"

  title?: string;
  description?: string;
  image?: string;
  onClose: () => void;
};

const encode = (s: string) => encodeURIComponent(s || '');

const getOrigin = (fallback?: string) => {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return fallback || 'https://investordeal.in';
};

/** Build the final property URL that will be shared/copied */
const buildPropertyUrl = ({
  url,
  propertyId,
  slug,
  trackingToken,
  absoluteBase,
}: Pick<Props, 'url' | 'propertyId' | 'slug' | 'trackingToken' | 'absoluteBase'>) => {
  // 1) If caller provided a full URL, use it directly
  if (url) return url;

  // 2) Otherwise derive from origin + path
  const origin = getOrigin(absoluteBase);

  // Path priority:
  // - If a slug is provided and already contains id at start (your pattern), use that.
  // - Else if both id and slug exist, combine "id-slug".
  // - Else if only id exists, use "/properties/<id>"
  // - Else fallback to current location (best-effort)
  let path = '';
  if (slug) {
    // Ensure it has no leading slash
    const clean = slug.replace(/^\//, '');
    // If it already starts with "properties/", keep it; else prefix it.
    path = clean.startsWith('properties/') ? `/${clean}` : `/properties/${clean}`;
  } else if (propertyId) {
    path = `/properties/${propertyId}`;
  } else if (typeof window !== 'undefined') {
    return window.location.href;
  } else {
    return origin; // absolute fallback
  }

  const urlObj = new URL(origin + path);
  if (trackingToken) urlObj.searchParams.set('tf', trackingToken);

  return urlObj.toString();
};

export default function ShareModal(props: Props) {
  const {
    onClose,
    title = 'Page Title',
    description = '',
    image,
    // used to build the URL when `url` is not provided:
    url,
    propertyId,
    slug,
    trackingToken,
    absoluteBase,
  } = props;

  const safeTitle = title || '';
  const safeDesc = description || '';

  // ✅ This is the single source of truth for sharing/copying:
  const shareUrl = buildPropertyUrl({ url, propertyId, slug, trackingToken, absoluteBase });

  const shareText = safeTitle + (safeDesc ? ` — ${safeDesc}` : '');
  const shareTextWithUrl = `${shareText}\n\n${shareUrl}`;

  // Platform share links (all point to the *actual property URL*)
  const wa = `https://wa.me/?text=${encode(shareTextWithUrl)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encode(shareUrl)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encode(shareText)}&url=${encode(shareUrl)}`;
  const ln = `https://www.linkedin.com/shareArticle?mini=true&url=${encode(shareUrl)}&title=${encode(safeTitle)}&summary=${encode(safeDesc)}`;
  const tg = `https://t.me/share/url?url=${encode(shareUrl)}&text=${encode(shareText)}`;
  const mail = `mailto:?subject=${encode(safeTitle)}&body=${encode(shareTextWithUrl)}`;

  // Copy to clipboard uses the *actual* property URL
  const copyLink = async () => {
    const textToCopy = shareUrl;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Share link copied to clipboard!');
      } else {
        const input = document.createElement('textarea');
        input.value = textToCopy;
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('Share link copied to clipboard!');
      }
    } catch (e) {
      console.error('Copy failed', e);
      toast.error('Could not copy. Please copy manually.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 relative">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close share modal"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-2">Share</h2>

        {safeTitle && <h3 className="text-sm font-medium mb-1 truncate">{safeTitle}</h3>}
        {safeDesc ? <p className="text-sm text-gray-500 mb-2 line-clamp-3">{safeDesc}</p> : null}
        {image ? (
          <img
            src={image}
            alt={safeTitle}
            className="w-full rounded-md mb-3 object-cover max-h-48"
          />
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
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs">
            <FaWhatsapp size={18} className="text-green-600" />
            WhatsApp
          </a>
          <a href={fb} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs">
            <Facebook size={18} className="text-blue-600" />
            Facebook
          </a>
          <a href={tw} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs">
            <Twitter size={18} className="text-sky-500" />
            Twitter
          </a>
          <a href={ln} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs">
            <Linkedin size={18} className="text-blue-700" />
            LinkedIn
          </a>
          <a href={tg} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs">
            <Send size={18} className="text-sky-600" />
            Telegram
          </a>
          <a href={mail} className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs">
            <Mail size={18} className="text-red-500" />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
