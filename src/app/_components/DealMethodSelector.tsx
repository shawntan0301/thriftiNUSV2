"use client";

import { DealMethod } from "@prisma/client";

type Props = {
  selected: DealMethod[];
  onChange: (methods: DealMethod[]) => void;
};

const DealMethodSelector: React.FC<Props> = ({ selected, onChange }) => {
  const allMethods = Object.values(DealMethod);

  const handleAdd = (method: DealMethod) => {
    if (!selected.includes(method)) {
      onChange([...selected, method]);
    }
  };

  const handleRemove = (method: DealMethod) => {
    onChange(selected.filter((m) => m !== method));
  };

  return (
    <div className="p-4 rounded-xl shadow bg-gray-50">
      <label className="font-semibold text-lg text-[#1F3B76] block mb-2">
        Deal methods
      </label>

      {/* Selected tags */}
      <div className="flex gap-2 flex-wrap mb-4">
        {selected.map((method) => (
          <div
            key={method}
            className="flex items-center bg-orange-500 text-white font-semibold px-4 py-2 rounded-xl space-x-2"
          >
            <span>{method}</span>
            <button
              onClick={() => handleRemove(method)}
              className="text-gray-300 hover:text-white"
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add method buttons */}
      <div className="flex gap-2 flex-wrap">
        {allMethods
          .filter((m) => !selected.includes(m))
          .map((method) => (
            <button
              key={method}
              onClick={() => handleAdd(method)}
              className="bg-white text-gray-800 border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-100 transition"
              type="button"
            >
              {method}
            </button>
          ))}
      </div>
    </div>
  );
};

export default DealMethodSelector;
