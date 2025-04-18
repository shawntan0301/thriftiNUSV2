"use client";

import { Category, Condition } from "@prisma/client";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

type Props = {
  onUpdateResults: (results: any[]) => void;
};

export default function SearchAndFilters({ onUpdateResults }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | undefined>();
  const [condition, setCondition] = useState<Condition | undefined>();
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | undefined>();
  const [triggerSearch, setTriggerSearch] = useState(false);

  const { data: filteredResults, refetch, isFetching } =
    api.listings.filterSearchSortListings.useQuery(
      {
        query: triggerSearch && query.length > 0 ? query : undefined,
        category,
        condition,
        priceSort,
      },
      { enabled: true }
    );

  useEffect(() => {
    if (!triggerSearch && (category || condition || priceSort)) {
      refetch().then((res) => onUpdateResults(res.data || []));
    }
  }, [category, condition, priceSort]);

  useEffect(() => {
    if (filteredResults) onUpdateResults(filteredResults);
  }, [filteredResults]);

  return (
    <>
      {/* Search bar + button */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 5.65a7.5 7.5 0 010 10.6z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search listings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setTriggerSearch(true);
                refetch();
              }
            }}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => {
            setTriggerSearch(true);
            refetch();
          }}
          className="px-5 py-2 rounded-full bg-[#1F3B76] text-white font-semibold hover:bg-[#162b57] transition"
        >
          Search
        </button>
      </div>

      {/* filters and sort */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={category ?? ""}
          onChange={(e) =>
            setCategory(e.target.value ? (e.target.value as Category) : undefined)
          }
          className={`rounded-full px-4 py-2 text-sm border ${
            category
              ? "bg-blue-100 text-blue-900 border-blue-300"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          <option value="">All Categories</option>
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>
              {cat[0] + cat.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <select
          value={condition ?? ""}
          onChange={(e) =>
            setCondition(e.target.value ? (e.target.value as Condition) : undefined)
          }
          className={`rounded-full px-4 py-2 text-sm border ${
            condition
              ? "bg-blue-100 text-blue-900 border-blue-300"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          <option value="">All Conditions</option>
          {Object.values(Condition).map((cond) => (
            <option key={cond} value={cond}>
              {cond.replace("_", " ").toLowerCase()}
            </option>
          ))}
        </select>

        <select
          value={priceSort ?? ""}
          onChange={(e) =>
            setPriceSort(
              e.target.value ? (e.target.value as "asc" | "desc") : undefined
            )
          }
          className={`rounded-full px-4 py-2 text-sm border ${
            priceSort
              ? "bg-blue-100 text-blue-900 border-blue-300"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          <option value="">Sort: Recent</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>
    </>
  );
}
