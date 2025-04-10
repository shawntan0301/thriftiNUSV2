"use client";

import React from "react";

type Props = {
    value: number | null;
    onChange: (val: number) => void;
  };
  
  const PriceInput: React.FC<Props> = ({ value, onChange }) => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-blue-900">Price</h2>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-medium">S$</span>
          <input
            value={value ?? ""}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            type="number"
            placeholder="Price of your listing"
            className="w-full border p-2 rounded bg-white"
          />
        </div>
      </div>
    );
  };
  
export default PriceInput;