
import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  width?: string; // optional custom width
  showHeader?: boolean; // NEW: control header visibility
  showCloseButton?: boolean; // NEW: control close button visibility
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-[95vw] sm:max-w-sm md:max-w-md lg:max-w-lg",
  showHeader = true, // Default true for backward compatibility
  showCloseButton = true, // Default true for backward compatibility
}) => {
  // prevent body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight
    };
    // lock scroll
    document.body.style.overflow = "hidden";

    // optional: avoid layout shift when scrollbar disappears
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.paddingRight;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Z-index plan (clear and adjustable):
   * overlay -> 40
   * modal container -> 50
   * modal portal (for dropdowns) -> 55
   * modal header -> 60  (header should appear ABOVE dropdown)
   * modal close button -> 65 (close button above everything if needed)
   */
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        // onClick={(e) => {
        //   if (e.target === e.currentTarget) onClose(); // Allow clicking backdrop to close
        // }}
        aria-hidden="true"
      />

      <div
        className={`relative bg-white rounded-lg shadow-xl w-full ${width} max-h-[90vh] flex flex-col z-50`}
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: 320 }}
      >
        {/* header — only show if showHeader is true */}
        {showHeader && (title || subtitle) && (
          <div className="sticky top-0 bg-gray-100 text-gray-800 z-[60] p-4 py-2 rounded-t-lg shadow-sm">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
          </div>
        )}

        {/* modal-scoped portal target */}
        <div id="modal-portal" className="absolute left-0 right-0 pointer-events-auto z-[55]" />

        <div className="p-0 overflow-y-auto flex-1 rounded-b-lg">
          {children}
        </div>

        {/* close button - only show if showCloseButton is true */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-700 hover:text-gray-500 text-xl p-1 z-[65] rounded-lg"
            aria-label="Close modal"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;