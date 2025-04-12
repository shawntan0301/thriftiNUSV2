import React, { useState } from "react";
import { Condition, Status } from "@prisma/client";

type ListingCardProps = {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  condition: Condition;
  status: Status;
};

const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  imageUrls,
  condition,
  status,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatCondition = (value: Condition) =>
    value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const showBanner = status !== "AVAILABLE";

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "RESERVED":
        return "bg-[#F38325]"; // custom orange
      case "SOLD":
        return "bg-[#1F3B76]"; // custom deep blue
      default:
        return "";
    }
  };

  // Get the current image URL, or use the first one if no array is provided
  // This helps with backward compatibility
  const currentImageUrl = Array.isArray(imageUrls) && imageUrls.length > 0
    ? imageUrls[currentImageIndex]
    : (typeof imageUrls === 'string' ? imageUrls : "");

  // Handlers for image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (Array.isArray(imageUrls) && currentImageIndex < imageUrls.length - 1) {
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
    <div className="w-full max-w-[140px]">
      <div className="relative rounded-md overflow-hidden shadow-sm">
        {/* Image */}
        <img
          src={currentImageUrl}
          alt={title}
          className="w-full h-[140px] object-cover rounded-md"
        />

        {/* Navigation arrows - only show if there are multiple images */}
        {Array.isArray(imageUrls) && imageUrls.length > 1 && (
          <>
            <button
              onClick={prevImage}
              disabled={currentImageIndex === 0}
              className={`absolute top-1/2 left-1 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center ${currentImageIndex === 0 ? 'opacity-30' : 'opacity-70 hover:opacity-100'}`}
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              disabled={currentImageIndex === imageUrls.length - 1}
              className={`absolute top-1/2 right-1 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center ${currentImageIndex === imageUrls.length - 1 ? 'opacity-30' : 'opacity-70 hover:opacity-100'}`}
            >
              ›
            </button>

            {/* Image counter */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1}/{imageUrls.length}
              </div>
            </div>
          </>
        )}

        {/* Status Banner */}
        {showBanner && (
          <div
            className={`absolute bottom-0 left-0 w-full text-white text-xs font-semibold text-center py-1 ${getStatusStyle(
              status
            )}`}
          >
            {status}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 space-y-0.5">
        <h3 className="text-sm font-medium truncate">{title}</h3>
        <p className="text-sm font-semibold text-gray-800">S${price}</p>
        <p className="text-xs text-gray-500">{formatCondition(condition)}</p>
      </div>
    </div>
  );
};

export default ListingCard;
