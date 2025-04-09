"use client";

import { DealMethod } from "@prisma/client";
import { useState, useEffect } from "react";

type Props = {
  value: DealMethod | null;
  onChange: (value: DealMethod) => void;
};

const DealMethodSelector: React.FC<Props> = ({ value, onChange }) => {
  const [selected, setSelected] = useState<DealMethod | "">("");

  useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as DealMethod;
    setSelected(selectedValue);
    onChange(selectedValue);
  };

  return (
    <div className="bg-gray-50 p-4 rounded shadow">
      <label className="font-semibold text-lg text-gray-900 mb-1 block">Deal Method</label>
      <select
        value={selected}
        onChange={handleChange}
        className="mt-1 w-full border border-gray-300 p-2 rounded-lg text-lg bg-white"
      >
        <option value="" disabled>
          Select a deal method
        </option>
        {Object.values(DealMethod).map((method) => (
          <option key={method} value={method}>
            {method.charAt(0) + method.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DealMethodSelector;
