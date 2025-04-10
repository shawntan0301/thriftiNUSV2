"use client";

import { Category } from "@prisma/client";
import { useState, useEffect } from "react";

type Props = {
    value: Category | null;
    onChange: (value: Category) => void;
  };

const CategorySelector: React.FC<Props> = ({ value, onChange }) => {
    const [selected, setSelected] = useState<Category | "">("");
  
    useEffect(() => {
      setSelected(value ?? "");
    }, [value]);
  
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value as Category;
      setSelected(selectedValue);
      onChange(selectedValue);
    };

    return (
        <div className="bg-gray-50 p-4 rounded shadow">
          <label className="font-semibold text-lg text-gray-900 mb-1 block">Category</label>
          <select
            value={selected}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 p-2 rounded-lg bg-white text-lg"
          >
            <option value="" disabled>
              Select a category
            </option>
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      );

};

export default CategorySelector;
