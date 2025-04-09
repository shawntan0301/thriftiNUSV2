import React from "react";
import { Condition, Status } from "@prisma/client";

type ListingCardProps = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: Condition;
  status: Status;
};

const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  imageUrl,
  condition,
  status,
}) => {
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

  return (
    <div className="w-full max-w-[140px]">
      <div className="relative rounded-md overflow-hidden shadow-sm">
        {/* Image */}
        <img
          src={imageUrl ?? ""}
          alt={title}
          className="w-full h-[140px] object-cover rounded-md"
        />

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
