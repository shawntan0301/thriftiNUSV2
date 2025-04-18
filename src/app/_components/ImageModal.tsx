"use client";

import React, { useEffect } from "react";

interface ImageModalProps {
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
    isOpen,
    images,
    currentIndex,
    onClose,
    onPrev,
    onNext,
}) => {
    // Close on escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            // Prevent scrolling when modal is open
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose, onPrev, onNext]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
            <div className="relative w-[70%] max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 bg-white bg-opacity-70 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-100 z-10 transition-all"
                    aria-label="Close"
                >
                    ✕
                </button>

                {/* Image container */}
                <div className="relative w-full aspect-square flex items-center justify-center bg-transparent">
                    <img
                        src={images[currentIndex]}
                        alt="Full size image"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={onPrev}
                            disabled={currentIndex === 0}
                            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100 hover:bg-opacity-100 cursor-pointer'
                                } transition-all`}
                            aria-label="Previous image"
                        >
                            <span className="text-2xl">‹</span>
                        </button>

                        <button
                            onClick={onNext}
                            disabled={currentIndex === images.length - 1}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center ${currentIndex === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100 hover:bg-opacity-100 cursor-pointer'
                                } transition-all`}
                            aria-label="Next image"
                        >
                            <span className="text-2xl">›</span>
                        </button>

                        {/* Image counter */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <div className="bg-white bg-opacity-70 text-gray-800 px-3 py-1 rounded-full text-sm">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageModal;