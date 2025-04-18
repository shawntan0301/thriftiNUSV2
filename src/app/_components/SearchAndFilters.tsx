"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { Category, Condition } from "@prisma/client";

type Props = {
  onUpdateResults: (results: any[]) => void;
};

export default function SearchAndFilters({ onUpdateResults }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | undefined>();
  const [condition, setCondition] = useState<Condition | undefined>();
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | undefined>();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const priceRef = useRef<HTMLDivElement | null>(null);

  const { data: filteredResults, refetch } =
    api.listings.filterSearchSortListings.useQuery(
      {
        query: triggerSearch && query.length > 0 ? query : undefined,
        category,
        condition,
        priceSort,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      },
      { enabled: true }
    );

  useEffect(() => {
    if (!triggerSearch && (category || condition || priceSort || minPrice || maxPrice)) {
      refetch().then((res) => onUpdateResults(res.data || []));
    }
  }, [category, condition, priceSort, minPrice, maxPrice]);

  useEffect(() => {
    if (filteredResults) onUpdateResults(filteredResults);
  }, [filteredResults]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
        if (showPriceFilter) {
          setShowPriceFilter(false);
          setTriggerSearch(true);
          refetch();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPriceFilter]);

  const isPriceFiltered = minPrice || maxPrice;

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 5.65a7.5 7.5 0 010 10.6z" />
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

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {/* Category */}
        <select
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value ? (e.target.value as Category) : undefined)}
          className={`cursor-pointer hover:bg-gray-100 appearance-none px-4 py-2 rounded-full text-sm border ${
            category ? "bg-blue-100 text-blue-900 border-blue-300" : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          <option value="">All Categories</option>
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>
              {cat[0] + cat.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        {/* Condition */}
        <select
          value={condition ?? ""}
          onChange={(e) => setCondition(e.target.value ? (e.target.value as Condition) : undefined)}
          className={`cursor-pointer hover:bg-gray-100 appearance-none px-4 py-2 rounded-full text-sm border ${
            condition ? "bg-blue-100 text-blue-900 border-blue-300" : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          <option value="">All Conditions</option>
          {Object.values(Condition).map((cond) => (
            <option key={cond} value={cond}>
              {cond.replace("_", " ").toLowerCase()}
            </option>
          ))}
        </select>

        {/* Price Filter */}
        <div className="relative" ref={priceRef}>
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className={`cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-full text-sm border ${
              isPriceFiltered ? "bg-blue-100 text-blue-900 border-blue-300" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Price
          </button>

          {showPriceFilter && (
            <div className="absolute z-10 mt-2 w-[320px] bg-white shadow-lg rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="S$ Minimum"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 font-semibold">-</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="S$ Maximum"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setShowPriceFilter(false);
                    setTriggerSearch(true);
                    refetch();
                  }}
                  className="text-sm px-4 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setShowPriceFilter(false);
                    setTriggerSearch(true);
                    refetch();
                  }}
                  className="text-sm px-4 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <select
          value={priceSort ?? ""}
          onChange={(e) => setPriceSort(e.target.value ? (e.target.value as "asc" | "desc") : undefined)}
          className={`cursor-pointer hover:bg-gray-100 appearance-none px-4 py-2 rounded-full text-sm border ${
            priceSort ? "bg-blue-100 text-blue-900 border-blue-300" : "bg-white text-gray-700 border-gray-300"
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
