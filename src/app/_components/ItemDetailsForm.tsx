"use client";

import React from "react";

type Props = {
  title: string;
  brand: string;
  description: string;
  onTitleChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

const ItemDetailsForm: React.FC<Props> = ({
  title,
  brand,
  description,
  onTitleChange,
  onBrandChange,
  onDescriptionChange,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-blue-900">Item details</h2>
      <div className="space-y-2 mt-2">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          type="text"
          placeholder="Listing title"
          className="w-full border p-2 rounded bg-white"
        />
        <input
          value={brand}
          onChange={(e) => onBrandChange(e.target.value)}
          type="text"
          placeholder="Brand"
          className="w-full border p-2 rounded bg-white"
        />
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Description"
          className="w-full border p-2 rounded bg-white"
        />
      </div>
    </div>
  );
};

export default ItemDetailsForm;
