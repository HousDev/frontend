// src/components/shared/ShareModalBlog.tsx
// Share modal for Blog pages (property-style UI)
// - Native Web Share removed (as requested)
// - "Copy link" copies a fixed canonical URL based on blog slug

import React from "react";
import {
    Copy,
    Facebook,
    Twitter,
    Linkedin,
    Send,
    Mail,
    MessageSquare,
    X, // close icon
} from "lucide-react";

type Props = {
    slug?: string;          // blog slug like "how-to-invest-smart"
    title?: string;         // blog title
    description?: string;   // short excerpt/description
    image?: string;         // featured image absolute/relative
    onClose: () => void;
    /** Optional override for forced copy URL (else we build from slug) */
    forcedCopyUrl?: string;
};

const enc = (s: string) => encodeURIComponent(s || "");

// Build a canonical /share landing URL, so server can render OG tags.
const buildShareLandingUrl = (
    base: string,
    params: { title?: string; description?: string; image?: string; slug?: string }
) => {
    const origin =
        typeof window !== "undefined" && window.location?.origin
            ? window.location.origin
            : "";
    const landingBase = base || `${origin}/share`;
    const parts: string[] = [];
    if (params.title) parts.push(`title=${enc(params.title)}`);
    if (params.description) parts.push(`description=${enc(params.description)}`);
    if (params.image) parts.push(`image=${enc(params.image)}`);
    if (params.slug) parts.push(`slug=${enc(params.slug)}`);
    return `${landingBase}${parts.length ? "?" + parts.join("&") : ""}`;
};

export default function ShareModalBlog({
    slug,
    title = "Blog",
    description = "",
    image,
    onClose,
    forcedCopyUrl,
}: Props) {
    const safeTitle = title || "";
    const safeDesc = description || "";

    // ===== 1) Build a /share landing (good for OG/meta) =====
    const shareLandingUrl = buildShareLandingUrl("", {
        title: safeTitle,
        description: safeDesc,
        image,
        slug,
    });

    // ===== 2) Fixed "Copy" URL (goes straight to public blog page) =====
    // If you pass forcedCopyUrl prop, we use it, otherwise construct with slug.
    // Example final: https://investordeal.in/blogs/my-article-slug
    const canonicalBlogUrl =
        forcedCopyUrl ||
        (slug
            ? `https://investordeal.in/blogs/${encodeURIComponent(slug)}`
            : typeof window !== "undefined"
                ? window.location.href
                : "https://investordeal.in/blogs");

    const shareText = safeTitle + (safeDesc ? ` — ${safeDesc}` : "");
    const shareTextWithUrl = `${shareText}\n\n${shareLandingUrl}`;

    // Platform links point to the /share landing, so OG/meta preview is consistent
    const wa = `https://wa.me/?text=${enc(shareTextWithUrl)}`;
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareLandingUrl)}`;
    const tw = `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(
        shareLandingUrl
    )}`;
    const ln = `https://www.linkedin.com/shareArticle?mini=true&url=${enc(
        shareLandingUrl
    )}&title=${enc(safeTitle)}&summary=${enc(safeDesc)}`;
    const tg = `https://t.me/share/url?url=${enc(shareLandingUrl)}&text=${enc(
        shareText
    )}`;
    const mail = `mailto:?subject=${enc(safeTitle)}&body=${enc(shareTextWithUrl)}`;

    // Copy the fixed canonical blog URL
    const copyLink = async () => {
        const textToCopy = canonicalBlogUrl;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const ta = document.createElement("textarea");
                ta.value = textToCopy;
                ta.style.position = "fixed";
                ta.style.left = "-9999px";
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
            alert("Share link copied to clipboard!");
        } catch (e) {
            console.error("Copy failed", e);
            alert("Could not copy. Please copy manually.");
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

                <h2 className="mb-2 text-lg font-semibold">Share on</h2>

                {safeTitle && (
                    <h3 className="mb-1 truncate text-sm font-medium">{safeTitle}</h3>
                )}
                {safeDesc ? (
                    <p className="mb-2 line-clamp-3 text-sm text-gray-500">
                        {safeDesc}
                    </p>
                ) : null}
                {image ? (
                    <img
                        src={image}
                        alt={safeTitle}
                        className="mb-3 max-h-48 w-full rounded-md object-cover"
                    />
                ) : null}

                <div className="mb-2 grid grid-cols-3 gap-2">
                    <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100"
                    >
                        <MessageSquare size={18} className="text-green-600" />
                        WhatsApp
                    </a>

                    <a
                        href={fb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100"
                    >
                        <Facebook size={18} className="text-blue-600" />
                        Facebook
                    </a>

                    <a
                        href={tw}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100"
                    >
                        <Twitter size={18} className="text-sky-500" />
                        Twitter
                    </a>

                    <a
                        href={ln}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100"
                    >
                        <Linkedin size={18} className="text-blue-700" />
                        LinkedIn
                    </a>

                    <a
                        href={tg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100"
                    >
                        <Send size={18} className="text-sky-600" />
                        Telegram
                    </a>

                    <a
                        href={mail}
                        className="flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-gray-100"
                    >
                        <Mail size={18} className="text-red-500" />
                        Email
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={copyLink}
                        className="flex flex-1 items-center gap-2 rounded-md p-2 text-sm hover:bg-gray-100"
                    >
                        <Copy size={16} className="text-gray-600" /> Copy link
                    </button>
                    {/* Native share intentionally removed */}
                </div>
            </div>
        </div>
    );
}
