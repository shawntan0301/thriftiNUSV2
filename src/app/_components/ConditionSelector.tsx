"use client";

import React from "react";
import { Condition } from "@prisma/client";

type Props = {
  value: Condition | null;
  onChange: (value: Condition) => void;
};

const ConditionSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-blue-900">Condition</h2>
      <div className="flex gap-2 mt-2 flex-wrap">
        {Object.values(Condition).map((condition) => {
          //  convert enum to normal
          const label = condition
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");

          return (
            <button
              key={condition}
              type="button"
              onClick={() => onChange(condition)}
              className={`px-4 py-1 rounded-full shadow-sm transition ${
                value === condition
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConditionSelector;
