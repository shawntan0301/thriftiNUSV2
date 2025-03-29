import React from "react";

type ListingCardProps = {
  title: string;
  price: string; //testing
  imageUrl: string | null;
  condition: string | null;
};

const ListingCard: React.FC<ListingCardProps> = ({
  title,
  price,
  imageUrl,
  condition,
}) => {
  return (
    <div className="w-full rounded-lg shadow-sm border p-2 bg-gray-50">
      <img
        src={imageUrl ?? ""}
        alt={title}
        className="w-full h-36 object-cover rounded-md"
      />
      <div className="mt-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-gray-500">S${price}</p>
        <p className="text-xs text-gray-400">{condition}</p>
      </div>
    </div>
  );
};

export default ListingCard;