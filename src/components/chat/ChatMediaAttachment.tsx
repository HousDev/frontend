import React, { useState } from "react";
import {
  Paperclip,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  X,
  Download,
  Maximize2,
  ExternalLink,
  Eye,
  Film,
} from "lucide-react";
import { PropertyChatMessage } from "@/services/chatApi";
import { getImageUrl } from "@/lib/helpers";

/**
 * Format bytes into human-readable size
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if a URL or MIME is an image
 */
export function isImageFile(urlOrMime?: string): boolean {
  if (!urlOrMime) return false;
  const lower = urlOrMime.toLowerCase();
  return (
    lower.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(lower)
  );
}

/**
 * Check if a URL or MIME is a video
 */
export function isVideoFile(urlOrMime?: string): boolean {
  if (!urlOrMime) return false;
  const lower = urlOrMime.toLowerCase();
  return (
    lower.startsWith("video/") ||
    /\.(mp4|webm|mov|3gp|mkv|m4v)$/i.test(lower)
  );
}

interface ChatMediaBubbleProps {
  message: PropertyChatMessage;
  isCurrentUser: boolean;
  onOpenLightbox?: (media: { url: string; type: "image" | "video"; title?: string }) => void;
}

/**
 * Component to render media inside a chat bubble (Images, Videos, Documents)
 */
export const ChatMediaBubble: React.FC<ChatMediaBubbleProps> = ({
  message,
  isCurrentUser,
  onOpenLightbox,
}) => {
  let meta: any = message.metadata_json || {};
  if (typeof meta === "string") {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = {};
    }
  }

  const rawUrl =
    meta.file_url ||
    meta.url ||
    meta.media_url ||
    meta.file_path ||
    meta.path ||
    (typeof (message as any).file_url === "string" ? (message as any).file_url : null) ||
    null;

  const fileName = meta.file_name || (rawUrl ? rawUrl.split("/").pop() : "Attachment") || "Attachment";
  const mimeType = meta.mime_type || "";
  const isImage =
    message.message_type === "image" ||
    isImageFile(mimeType) ||
    isImageFile(fileName) ||
    isImageFile(rawUrl);
  const isVideo =
    message.message_type === "video" ||
    isVideoFile(mimeType) ||
    isVideoFile(fileName) ||
    isVideoFile(rawUrl);

  const mediaUrl = rawUrl ? getImageUrl(rawUrl) : null;
  const fileSize = meta.file_size ? formatFileSize(meta.file_size) : null;

  // Determine if message_text contains a real caption or is just a fallback label
  const isFallbackText =
    !message.message_text ||
    message.message_text === "📷 Photo" ||
    message.message_text === "🎥 Video" ||
    message.message_text.startsWith("📎 ") ||
    message.message_text === fileName;

  const captionText = !isFallbackText ? message.message_text : null;

  if (!mediaUrl && !meta.file_url && !rawUrl) {
    return <p className="whitespace-pre-wrap">{message.message_text}</p>;
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* 1. Image Preview */}
      {isImage && mediaUrl && (
        <div className="relative group overflow-hidden rounded-xl bg-slate-900/10 border border-black/5 max-w-[280px] sm:max-w-[340px]">
          <img
            src={mediaUrl}
            alt={fileName}
            className="w-full max-h-72 object-cover rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            onError={(e) => {
              const target = e.currentTarget;
              if (rawUrl && !target.dataset.fallbackApplied) {
                target.dataset.fallbackApplied = "true";
                const clean = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
                // Try direct local backend origin if proxy or relative failed
                if (typeof window !== "undefined" && window.location.hostname === "localhost") {
                  target.src = `http://localhost:3000${clean}`;
                } else {
                  target.src = `https://resaleexpert.in${clean}`;
                }
              }
            }}
            onClick={() =>
              onOpenLightbox
                ? onOpenLightbox({ url: mediaUrl, type: "image", title: captionText || fileName })
                : window.open(mediaUrl, "_blank")
            }
            loading="lazy"
          />
          <div
            onClick={() =>
              onOpenLightbox
                ? onOpenLightbox({ url: mediaUrl, type: "image", title: captionText || fileName })
                : window.open(mediaUrl, "_blank")
            }
            className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-xl"
          >
            <span className="px-3 py-1.5 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-md">
              <Eye size={13} />
              <span>View Full</span>
            </span>
          </div>
        </div>
      )}

      {/* 2. Video Player */}
      {isVideo && mediaUrl && (
        <div className="overflow-hidden rounded-xl bg-black border border-black/10 max-w-[280px] sm:max-w-[340px]">
          <video
            src={mediaUrl}
            controls
            preload="metadata"
            className="w-full max-h-72 rounded-xl bg-black"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* 3. Document / File Attachment */}
      {!isImage && !isVideo && mediaUrl && (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={fileName}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            isCurrentUser
              ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              isCurrentUser
                ? "bg-white/20 text-white"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            <FileText size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate">{fileName}</p>
            {fileSize && (
              <p className={`text-[10px] ${isCurrentUser ? "text-white/70" : "text-slate-400"}`}>
                {fileSize}
              </p>
            )}
          </div>
          <Download size={16} className="shrink-0 opacity-70 hover:opacity-100" />
        </a>
      )}

      {/* Caption Text (if provided) */}
      {captionText && (
        <p className="whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed pt-0.5">
          {captionText}
        </p>
      )}
    </div>
  );
};

/**
 * Preview bar above the input when a user selects a file before sending
 */
interface ChatAttachmentDraftPreviewProps {
  file: File | null;
  previewUrl: string | null;
  onClear: () => void;
  accentColor?: "emerald" | "orange" | "blue" | "slate";
}

export const ChatAttachmentDraftPreview: React.FC<ChatAttachmentDraftPreviewProps> = ({
  file,
  previewUrl,
  onClear,
  accentColor = "slate",
}) => {
  if (!file) return null;

  const isImg = file.type.startsWith("image/");
  const isVid = file.type.startsWith("video/");

  return (
    <div className="p-2 px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-3 min-w-0">
        {isImg && previewUrl ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-white shadow-2xs">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : isVid ? (
          <div className="w-12 h-12 rounded-lg bg-slate-800 text-cyan-400 flex flex-col items-center justify-center shrink-0 border border-slate-700 shadow-2xs">
            <Film size={20} />
            <span className="text-[8px] font-bold text-white uppercase mt-0.5">Video</span>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
            <FileText size={22} />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-800 truncate max-w-[180px] sm:max-w-[260px]">
              {file.name}
            </span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[9px] font-semibold rounded shrink-0">
              {formatFileSize(file.size)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {isImg ? "Ready to send photo" : isVid ? "Ready to send video" : "Ready to send file"} • Add optional caption below
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
        title="Remove attachment"
      >
        <X size={16} />
      </button>
    </div>
  );
};

/**
 * Fullscreen / Zoom Lightbox for viewing photos and videos in full quality
 */
interface ChatLightboxModalProps {
  media: { url: string; type: "image" | "video"; title?: string } | null;
  onClose: () => void;
}

export const ChatLightboxModal: React.FC<ChatLightboxModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {media.type === "image" ? <ImageIcon size={20} className="text-emerald-400" /> : <VideoIcon size={20} className="text-cyan-400" />}
          <span className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
            {media.title || "Media Preview"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download / Open original"
          >
            <Download size={18} />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="max-w-4xl max-h-[85vh] w-full flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {media.type === "image" ? (
          <img
            src={media.url}
            alt={media.title || "Image"}
            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <video
            src={media.url}
            controls
            autoPlay
            className="max-h-[80vh] max-w-full rounded-lg shadow-2xl bg-black"
          />
        )}
      </div>
    </div>
  );
};
