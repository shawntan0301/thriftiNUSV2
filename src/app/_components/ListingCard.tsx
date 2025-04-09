import React from "react";
import { Condition } from "@prisma/client";

type ListingCardProps = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: Condition;
};

const ListingCard: React.FC<ListingCardProps> = ({ id, title, price, imageUrl, condition }) => {
  // convert enum 
  const formatCondition = (value: Condition) =>
    value
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  return (
    <div className="w-full rounded-lg shadow-md p-2 bg-gray-100">
      <img
        src={imageUrl ?? ""}
        alt={title}
        className="w-full h-36 object-cover rounded-md"
      />
      <div className="mt-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-gray-500">${price}</p>
        <p className="text-xs text-gray-400">{formatCondition(condition)}</p>
      </div>
    </div>
  );
};

export default ListingCard;
