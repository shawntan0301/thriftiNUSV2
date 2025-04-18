"use client";

import React, { useState } from "react";

interface ImageDisplayProps {
  images: string[];
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle empty image array
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  // Get the current image URL
  const currentImageUrl = images[currentImageIndex];

  // Handlers for image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      {/* Image */}
      <img
        src={currentImageUrl}
        alt="Listing image"
        className="w-full h-full object-contain"
      />

      {/* Navigation arrows - only show if there are multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            disabled={currentImageIndex === 0}
            className={`absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center ${currentImageIndex === 0 ? 'opacity-30' : 'opacity-70 hover:opacity-100'
              }`}
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            disabled={currentImageIndex === images.length - 1}
            className={`absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center ${currentImageIndex === images.length - 1 ? 'opacity-30' : 'opacity-70 hover:opacity-100'
              }`}
          >
            ›
          </button>

          {/* Image counter */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-full">
              {currentImageIndex + 1}/{images.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageDisplay;

