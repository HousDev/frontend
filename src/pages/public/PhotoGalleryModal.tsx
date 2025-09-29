// PhotoGalleryModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PhotoGalleryModalProps {
    images: string[];
    isOpen: boolean;
    onClose: () => void;
    initialIndex?: number;
}

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
    images,
    isOpen,
    onClose,
    initialIndex = 0
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsZoomed(false);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsZoomed(false);
    };

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index);
        setIsZoomed(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between p-4 md:p-6">
                    <div className="text-white">
                        <h2 className="text-lg md:text-xl font-bold">Property Gallery</h2>
                        <p className="text-sm text-gray-300 mt-1">
                            {currentIndex + 1} / {images.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setIsZoomed(!isZoomed)}
                            className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-sm"
                            aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
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

            {/* Main Image Container */}
            <div className="absolute inset-0 flex items-center justify-center pt-20 pb-32 md:pb-40 px-4">
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Image with Watermark */}
                    <div
                        className={`relative max-w-full max-h-full transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-move' : 'scale-100'
                            }`}
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`Property photo ${currentIndex + 1}`}
                            className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                            draggable={false}
                        />

                        {/* Watermark Overlay */}
                        <div className="absolute inset-0 pointer-events-none select-none">
                            {/* Center Watermark */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30">
                                <div className="text-white font-bold text-2xl md:text-2xl lg:text-2xl whitespace-nowrap transform rotate-[-360deg]">
                                    ResaleExpert.in
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
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

            {/* Thumbnail Strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent">
                <div className="p-4 md:p-6 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 md:gap-3 justify-start md:justify-center min-w-min">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => handleThumbnailClick(index)}
                                className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${currentIndex === index
                                        ? 'ring-4 ring-blue-500 scale-110'
                                        : 'ring-2 ring-white/30 hover:ring-white/60 opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
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
