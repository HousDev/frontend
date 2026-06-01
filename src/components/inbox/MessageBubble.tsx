


import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  MapPin,
  CornerDownLeft,
  CornerUpLeft,
} from "lucide-react";
import type { WhatsAppMessage } from "../../types";
import { formatTime } from "../../lib/formatters";

const STATUS_ICONS = {
  pending: <Clock size={12} className="text-gray-400" />,
  sent: <Check size={12} className="text-[#8696a0]" />,
  delivered: <CheckCheck size={12} className="text-[#8696a0]" />,
  read: <CheckCheck size={12} className="text-[#53bdeb]" />,
  failed: <AlertCircle size={12} className="text-red-400" />,
};

interface Props {
  message: WhatsAppMessage;
  showDateSeparator: boolean;
  dateSeparatorLabel: string;
}
const getMediaUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${url}`;
};
export default function MessageBubble({
  message,
  showDateSeparator,
  dateSeparatorLabel,
}: Props) {
  const isOutbound = message.direction === "out";

  const outTail = (
    <span
      className="absolute top-0 -right-[7px] w-0 h-0"
      style={{
        borderLeft: "8px solid #d9fdd3",
        borderBottom: "8px solid transparent",
      }}
    />
  );
  const inTail = (
    <span
      className="absolute top-0 -left-[7px] w-0 h-0"
      style={{
        borderRight: "8px solid #ffffff",
        borderBottom: "8px solid transparent",
      }}
    />
  );

  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center justify-center my-3 px-2">
          <span
            className="text-[11px] text-[#54656f] font-medium px-3 py-1 rounded-full shadow-sm"
            style={{ backgroundColor: "#d1f4cc" }}
          >
            {dateSeparatorLabel}
          </span>
        </div>
      )}

      <div
        className={`flex ${isOutbound ? "justify-end" : "justify-start"} mb-1 px-2 sm:px-3 w-full`}
      >
        <div
          className={`max-w-[78%] sm:max-w-[65%] md:max-w-[55%] ${isOutbound ? "items-end" : "items-start"} flex flex-col`}
        >
          {/* ───── IMAGE (from media_type field) ───── */}
          {message.media_url &&
            (message.media_type?.startsWith("image/") ||
              message.message_type === "image") && (
              <div
                className={`rounded-[7.5px] overflow-hidden shadow-sm mb-0.5 relative ${isOutbound ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white border border-gray-100 rounded-tl-none"}`}
              >
                {isOutbound ? outTail : inTail}
                <img
                  src={message.media_url}
                  alt={message.text || message.caption || "Image"}
                  className="max-w-full max-h-64 object-cover cursor-pointer"
                  onClick={() => window.open(message.media_url, "_blank")}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {(message.text || message.caption) && (
                  <p className="text-[13.5px] px-3 py-2 text-[#111b21]">
                    {message.text || message.caption}
                  </p>
                )}
              </div>
            )}

          {/* ───── VIDEO ───── */}
          {message.media_url && message.media_type?.startsWith("video/") && (
            <div
              className={`rounded-[7.5px] overflow-hidden shadow-sm mb-0.5 relative ${isOutbound ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white border border-gray-100 rounded-tl-none"}`}
            >
              {isOutbound ? outTail : inTail}
              <video
                src={message.media_url}
                controls
                className="max-w-full max-h-64"
              />
              {(message.text || message.caption) && (
                <p className="text-[13.5px] px-3 py-2 text-[#111b21]">
                  {message.text || message.caption}
                </p>
              )}
            </div>
          )}

          {/* ───── AUDIO ───── */}
          {message.media_url && message.media_type?.startsWith("audio/") && (
            <div
              className={`px-3 py-2.5 rounded-[7.5px] shadow-sm relative ${isOutbound ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white border border-gray-100 rounded-tl-none"}`}
            >
              {isOutbound ? outTail : inTail}
              <audio src={message.media_url} controls className="max-w-full" />
            </div>
          )}

          {/* ───── DOCUMENT / PDF (from media_type field) ───── */}
{/* ───── DOCUMENT / PDF ───── */}
{/* ───── DOCUMENT / PDF ───── */}
{message.media_url &&
  (message.media_type?.startsWith("application/") ||
    message.media_type?.startsWith("text/")) &&
  (() => {
    const mt = message.media_type || "";

    const fn =
      message.file_name ||
      message.text ||
      message.caption ||
      "Document";

    const fileSizeKb = message.file_size
      ? `${Math.round(message.file_size / 1024)} kB · `
      : "";

    const fnLower = fn.toLowerCase();

    const isPdf =
      mt.includes("pdf") || fnLower.endsWith(".pdf");

    const isExcel =
      mt.includes("sheet") ||
      mt.includes("excel") ||
      fnLower.endsWith(".xlsx") ||
      fnLower.endsWith(".xls") ||
      fnLower.endsWith(".csv");

    const isWord =
      !isExcel &&
      (mt.includes("word") ||
        mt.includes("document") ||
        fnLower.endsWith(".docx") ||
        fnLower.endsWith(".doc"));

    const isPpt =
      !isExcel &&
      !isWord &&
      (mt.includes("presentation") ||
        mt.includes("powerpoint") ||
        fnLower.endsWith(".pptx"));

    const typeLabel = isPdf
      ? "PDF"
      : isExcel
      ? "XLSX"
      : isWord
      ? "DOCX"
      : isPpt
      ? "PPTX"
      : "FILE";

    const iconBg = isPdf
      ? "#E53935"
      : isExcel
      ? "#43A047"
      : isWord
      ? "#1E88E5"
      : isPpt
      ? "#FB8C00"
      : "#546E7A";

    return (
      <div
        className={`relative overflow-hidden rounded-[7.5px] shadow-sm w-full max-w-[280px] sm:max-w-[320px] ${
          isOutbound
            ? "bg-[#d9fdd3] rounded-tr-none"
            : "bg-white border border-[#e9edef] rounded-tl-none"
        }`}
      >
        {isOutbound ? outTail : inTail}

        {/* PDF PREVIEW */}
       {/* PDF PREVIEW */}
{isPdf && (
  <div
    className="w-[280px] bg-[#f0f2f5] overflow-hidden"
    style={{
      height: "130px",
    }}
  >
    <iframe
src={`${getMediaUrl(message.media_url)}#page=1&toolbar=0&navpanes=0&scrollbar=0`}      title="PDF Preview"
      scrolling="no"
      className="border-none pointer-events-none"
      style={{
        width: "700px",
        height: "1200px",
        transform: "scale(0.42)",
        transformOrigin: "top left",
      }}
    />
  </div>
)}

        {/* FILE CARD */}
        <div className="bg-[#f7f8fa] px-3 py-2">
          <div className="flex items-center justify-between gap-2">

            {/* LEFT */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {!isPdf && (
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "3px",
                    backgroundColor: iconBg,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  {isExcel
                    ? "X"
                    : isWord
                    ? "W"
                    : isPpt
                    ? "P"
                    : "F"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium text-[#111b21] leading-tight"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fn}
                </p>

                <p className="text-[11px] text-[#667781] mt-0.5">
                  {fileSizeKb}
                  {typeLabel}
                </p>
              </div>
            </div>

            {/* DOWNLOAD */}
            <a
href={getMediaUrl(message.media_url)}
              download={fn}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 text-[#667781] hover:text-[#111b21]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  })()}
          {/* ───── DOCUMENT (legacy message_type field) ───── */}
          {!message.media_url && message.message_type === "document" && (
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[7.5px] shadow-sm relative ${isOutbound ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none" : "bg-white border border-gray-100 text-[#111b21] rounded-tl-none"}`}
            >
              {isOutbound ? outTail : inTail}
              <FileText size={20} />
              <div>
                <p className="text-[13.5px] font-medium">
                  {message.caption || "Document"}
                </p>
                <p className="text-[11px] text-[#8696a0]">
                  {message.media_mime_type || "PDF"}
                </p>
              </div>
            </div>
          )}

          {/* ───── TEMPLATE ───── */}
          {message.message_type === "template" && (
            <div
              className={`px-3 py-2.5 rounded-[7.5px] shadow-sm max-w-xs relative ${isOutbound ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none" : "bg-white border border-gray-100 text-[#111b21] rounded-tl-none"}`}
            >
              {isOutbound ? outTail : inTail}
              <p className="text-[11px] font-semibold mb-1 text-[#008069]">
                Template: {message.template_name}
              </p>
              <p
                className="text-[13.5px] leading-snug"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* ───── LOCATION MESSAGE ───── */}
          {message.message_type === "location" &&
            message.text &&
            (() => {
              const coords = message.text.match(
                /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
              );
              const lat = coords?.[1];
              const lng = coords?.[2];
              const mapUrl =
                lat && lng
                  ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=300x160&markers=color:red%7C${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`
                  : null;
              const mapsLink =
                lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : null;

              return (
                <div
                  className={`rounded-[7.5px] overflow-hidden shadow-sm relative ${isOutbound
                      ? "bg-[#d9fdd3] rounded-tr-none"
                      : "bg-white border border-gray-100 rounded-tl-none"
                    }`}
                >
                  {isOutbound ? outTail : inTail}
                  {mapUrl ? (
                    <a href={mapsLink!} target="_blank" rel="noreferrer">
                      <img
                        src={mapUrl}
                        alt="Location"
                        className="w-full max-h-40 object-cover cursor-pointer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </a>
                  ) : null}

                  <a
                    href={mapsLink || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 no-underline"
                  >
                    <MapPin size={16} className="text-[#00C47A] shrink-0" />
                    <span className="text-[13.5px] text-[#008069] font-medium">
                      Location
                    </span>
                  </a>
                </div>
              );
            })()}
          {/* ───── INTERACTIVE / BUTTONS MESSAGE ───── */}
          {(message.isInteractive ||
            message.message_type === "buttons" ||
            message.message_type === "interactive") &&
            message.text && (
              <div
                className={`rounded-[7.5px] overflow-hidden shadow-sm relative max-w-[220px] ${isOutbound
                  ? "bg-[#d9fdd3] rounded-tr-none"
                  : "bg-white border border-gray-100 rounded-tl-none"
                  }`}
              >
                {isOutbound ? outTail : inTail}
                {/* Header */}
                <div className=" text-black text-[12px] font-semibold px-3 py-1.5">
                  🏠 Property Assistant
                </div>
                {/* Body */}
              <p
                className="text-[13.5px] px-3 py-2 text-[#111b21] leading-snug"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {message.text}
              </p>
                {/* Buttons */}
                {message.buttons && message.buttons.length > 0 && (
                  <div className="border-t border-gray-100">
                  {message.buttons.map((btn: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-start gap-2 px-3 py-2 text-[13px] text-[#008069] font-medium border-b border-gray-100 last:border-b-0"
                    >
                      <CornerUpLeft size={13} className="text-[#008069] shrink-0" />
                      <span>{btn.title}</span>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            )}

          {/* ───── PLAIN TEXT (only when no media) - ✅ FIXED: Shows ALL messages including bot responses ───── */}
          {!message.media_url &&
            message.message_type !== "document" &&
            message.message_type !== "template" &&
            message.message_type !== "location" &&
            message.message_type !== "buttons" &&    
            message.message_type !== "interactive" &&   // ← ADD THIS
            !message.isInteractive &&
            message.text && (
              <div
                className={`px-3 py-2 rounded-[7.5px] shadow-sm relative ${isOutbound ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none" : "bg-white border border-gray-100 text-[#111b21] rounded-tl-none"}`}
              >
                {isOutbound ? outTail : inTail}
              {/* <p
                className="text-[13.5px] leading-snug break-words"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {message.text?.replace(/\\n/g, '\n')}
              </p> */}
<p
        className="text-[13.5px] leading-snug break-words"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {message.text?.replace(/\\n/g, '\n').split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
          /^https?:\/\//.test(part) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noreferrer"
              className="text-[#027eb5] underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </p>

              
              </div>
            )}

          {/* ───── TIMESTAMP + STATUS ───── */}
          <div
            className={`flex items-center gap-1 mt-0.5 ${isOutbound ? "flex-row-reverse" : ""}`}
          >
            <span className="text-[10px] text-[#8696a0]">
              {formatTime(message.timestamp)}
            </span>
            {isOutbound && (
              <>
                {STATUS_ICONS[message.status]}
                {message.sender?.name && (
                  <span className="text-[10px] text-[#8696a0]">
                    {message.sender.name}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}