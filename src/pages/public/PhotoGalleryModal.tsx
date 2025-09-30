// PhotoGalleryModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface PhotoGalleryModalProps {
    images: string[];
    isOpen: boolean;
    onClose: () => void;
    initialIndex?: number;
}

const SWIPE_THRESHOLD = 48; // px

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
    images = [],
    isOpen,
    onClose,
    initialIndex = 0,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    // --- touch swipe refs (mobile) ---
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchMoved = useRef(false);

    // --- iOS-safe scroll lock values ---
    const scrollLockY = useRef<number>(0);

    // keep index updated when prop changes
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // robust body scroll lock (iOS friendly)
    useEffect(() => {
        if (!isOpen) return;

        // lock
        scrollLockY.current = window.scrollY || document.documentElement.scrollTop || 0;
        const body = document.body;
        body.style.position = "fixed";
        body.style.top = `-${scrollLockY.current}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden"; // keeps Android tidy

        return () => {
            // unlock
            const body = document.body;
            body.style.position = "";
            body.style.top = "";
            body.style.left = "";
            body.style.right = "";
            body.style.width = "";
            body.style.overflow = "";
            window.scrollTo(0, scrollLockY.current);
        };
    }, [isOpen]);

    // keyboard navigation (desktop)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentIndex]);

    const handlePrevious = () => {
        if (!images.length) return;
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsZoomed(false);
    };

    const handleNext = () => {
        if (!images.length) return;
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsZoomed(false);
    };

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index);
        setIsZoomed(false);
    };

    // --- touch handlers for swipe (horizontal only) ---
    const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
        if (!isOpen) return;
        const t = e.touches[0];
        touchStartX.current = t.clientX;
        touchStartY.current = t.clientY;
        touchMoved.current = false;
    };

    const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
        touchMoved.current = true;
    };

    const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
        if (!isOpen || touchStartX.current == null || !touchMoved.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartX.current;
        const dy = t.clientY - (touchStartY.current ?? t.clientY);

        // ignore mostly vertical swipes to avoid fighting scroll
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
            if (dx < 0) handleNext();
            else handlePrevious();
        }

        touchStartX.current = null;
        touchStartY.current = null;
        touchMoved.current = false;
    };

    if (!isOpen) return null;

    // defensive guard
    const hasImages = images && images.length > 0;
    const activeSrc = hasImages ? images[currentIndex] : "";

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black touch-none"
            style={{
                // 100dvh fixes mobile address bar issues; safe-area prevents UI getting clipped
                height: "100dvh",
                paddingTop: "calc(env(safe-area-inset-top) + 0px)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 0px)",
                // prevent iOS rubber-band scroll behind the modal
                overscrollBehavior: "contain",
            }}
            // block iOS gestures from bubbling
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center justify-between p-4 md:p-6 pointer-events-auto">
                    <div className="text-white">
                        <h2 className="text-lg md:text-xl font-bold">Property Gallery</h2>
                        <p className="text-sm text-gray-300 mt-1">
                            {hasImages ? `${currentIndex + 1} / ${images.length}` : "No images"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setIsZoomed((z) => !z)}
                            className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-sm"
                            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                        >
                            {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-sm"
                            aria-label="Close gallery"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div className="absolute inset-0 flex items-center justify-center pt-20 pb-[120px] md:pb-40 px-4">
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Image with Watermark */}
                    <div
                        className={`relative transition-transform duration-300 ${isZoomed ? "scale-150 cursor-grab active:cursor-grabbing" : "scale-100"
                            } max-w-full max-h-full`}
                        style={{
                            // ensure the scaled image stays inside
                            willChange: "transform",
                            overflow: "hidden",
                        }}
                    >
                        {hasImages ? (
                            <img
                                src={activeSrc}
                                alt={`Property photo ${currentIndex + 1}`}
                                className="max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-auto"
                                draggable={false}
                            />
                        ) : (
                            <div className="text-white/70 text-sm">No images available</div>
                        )}

                        {/* Watermark */}
                        {hasImages && (
                            <div className="absolute inset-0 pointer-events-none select-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
                                    <div className="text-white font-bold text-2xl md:text-2xl lg:text-2xl whitespace-nowrap">
                                        ResaleExpert.in
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Arrows */}
                    {hasImages && images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-2 md:left-4 p-3 md:p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-sm"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={24} className="md:w-8 md:h-8" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-2 md:right-4 p-3 md:p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-sm"
                                aria-label="Next image"
                            >
                                <ChevronRight size={24} className="md:w-8 md:h-8" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Thumbnails */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent"
                style={{
                    // keep above iOS bottom bar
                    paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
                }}
            >
                <div className="p-4 md:p-6 overflow-x-auto"
                    style={{ WebkitOverflowScrolling: "touch" }}>
                    <div className="flex gap-2 md:gap-3 justify-start md:justify-center min-w-min">
                        {hasImages &&
                            images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleThumbnailClick(index)}
                                    className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${currentIndex === index
                                            ? "ring-4 ring-blue-500 scale-110"
                                            : "ring-2 ring-white/30 hover:ring-white/60 opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover pointer-events-none"
                                        draggable={false}
                                    />
                                    {currentIndex === index && (
                                        <div className="absolute inset-0 bg-blue-500/20" />
                                    )}
                                </button>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoGalleryModal;
