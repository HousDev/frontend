// ShareModal_with_share_landing.tsx (updated)
// - Removed native "Share" button
// - Copy now copies a fixed URL as requested

import React from 'react';
import { Copy, Facebook, Twitter, Linkedin, Send, Mail, MessageSquare, X } from 'lucide-react';

type Props = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  slug?: string;
  onClose: () => void;
};

const encode = (s: string) => encodeURIComponent(s || '');

// Helper: build a canonical share landing URL. Use absolute URL if possible.
const buildShareLandingUrl = (base: string, params: { title?: string; description?: string; image?: string; slug?: string }) => {
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
  const landingBase = base || `${origin}/share`;
  const parts: string[] = [];
  if (params.title) parts.push(`title=${encode(params.title)}`);
  if (params.description) parts.push(`description=${encode(params.description)}`);
  if (params.image) parts.push(`image=${encode(params.image)}`);
  if (params.slug) parts.push(`slug=${encode(params.slug)}`);
  return `${landingBase}${parts.length ? '?' + parts.join('&') : ''}`;
};

export default function ShareModal({ url, onClose, title = 'Page Title', description = '', image, slug }: Props) {
  const safeTitle = title || '';
  const safeDesc = description || '';
  const safeUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Build share landing url (server should serve this path with OG tags)
  const shareLandingUrl = buildShareLandingUrl('', { title: safeTitle, description: safeDesc, image, slug });

  const shareText = safeTitle + (safeDesc ? ` — ${safeDesc}` : '');
  const shareTextWithUrl = `${shareText}\n\n${shareLandingUrl}`;

  // Platform URLs (still point to shareLandingUrl so OG/meta work if you serve /share server-side)
  const wa = `https://wa.me/?text=${encode(shareTextWithUrl)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encode(shareLandingUrl)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encode(shareText)}&url=${encode(shareLandingUrl)}`;
  const ln = `https://www.linkedin.com/shareArticle?mini=true&url=${encode(shareLandingUrl)}&title=${encode(safeTitle)}&summary=${encode(safeDesc)}`;
  const tg = `https://t.me/share/url?url=${encode(shareLandingUrl)}&text=${encode(shareText)}`;
  const mail = `mailto:?subject=${encode(safeTitle)}&body=${encode(shareTextWithUrl)}`;

  // === IMPORTANT: the fixed URL you asked to copy ===
  const forcedCopyUrl = 'http://localhost:5173/properties/57-commercial-2bhk-commercial-plot-mumbai?tf=d00937b3-edcf-48f6-b700-d58b786e8131';

  const copyLink = async () => {
    const textToCopy = forcedCopyUrl;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        alert('Share link copied to clipboard!');
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
      alert('Could not copy. Please copy manually.');
    }
  };

  // Removed native share function / button as requested

  // Optional: open share landing page in a new tab for users to preview or copy the exact URL
  const openLanding = () => {
    window.open(shareLandingUrl, '_blank', 'noopener');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close share modal"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-2">Share on</h2>

        {safeTitle && <h3 className="text-sm font-medium mb-1 truncate">{safeTitle}</h3>}
        {safeDesc ? <p className="text-sm text-gray-500 mb-2 line-clamp-3">{safeDesc}</p> : null}
        {image ? <img src={image} alt={safeTitle} className="w-full rounded-md mb-3 object-cover max-h-48" /> : null}

        <div className="grid grid-cols-3 gap-2 mb-2">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-100 text-xs">
            <MessageSquare size={18} className="text-green-600" />
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

        <div className="flex items-center gap-2">
          <button onClick={copyLink} className="flex-1 flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 text-sm">
            <Copy size={16} className="text-gray-600" /> Copy link
          </button>

          {/* Native share button removed as requested */}
        </div>


      </div>
    </div>
  );
}