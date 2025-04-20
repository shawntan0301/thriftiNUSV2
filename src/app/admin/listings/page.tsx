"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import MaxWidthWrapper from "../../_components/MaxWidthWrapper";
import ListingGrid from "../../_components/ListingGrid";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Category, Condition } from "@prisma/client";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";

export default function AdminListingsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | undefined>();
  const [condition, setCondition] = useState<Condition | undefined>();
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | undefined>();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const priceRef = useRef<HTMLDivElement | null>(null);

  const { data: filteredListings, refetch } =
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
      refetch();
    }
  }, [category, condition, priceSort, minPrice, maxPrice]);

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

  const hasActiveFilters = category || condition || priceSort || minPrice || maxPrice;
  const isPriceFiltered = minPrice || maxPrice;

  return (
    <MaxWidthWrapper>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[oklch(0.428_0.11_266.57)]">All Listings</CardTitle>
            <CardDescription>
              Manage and monitor all listings on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setTriggerSearch(true);
                        refetch();
                      }
                    }}
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={() => {
                    setTriggerSearch(true);
                    refetch();
                  }}
                >
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Select 
                  value={category || "all"} 
                  onValueChange={(value) => setCategory(value === "all" ? undefined : value as Category)}
                >
                  <SelectTrigger className="h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.values(Category).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat[0] + cat.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={condition || "all"} 
                  onValueChange={(value) => setCondition(value === "all" ? undefined : value as Condition)}
                >
                  <SelectTrigger className="h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    {Object.values(Condition).map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {cond.replace("_", " ").toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Price Filter */}
                <div className="relative" ref={priceRef}>
                  <Popover open={showPriceFilter} onOpenChange={setShowPriceFilter}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground font-normal text-sm ${
                          isPriceFiltered ? "w-[140px]" : ""
                        }`}
                      >
                        {isPriceFiltered ? (
                          `Price: $${minPrice || '0'} - $${maxPrice || '∞'}`
                        ) : (
                          "Price"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Price Range</h4>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="S$ Minimum"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                              className="h-8"
                              min="0"
                            />
                            <span>-</span>
                            <Input
                              type="number"
                              placeholder="S$ Maximum"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value)}
                              className="h-8"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="h-8"
                            onClick={() => {
                              setMinPrice("");
                              setMaxPrice("");
                              setShowPriceFilter(false);
                              setTriggerSearch(true);
                              refetch();
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            className="h-8"
                            onClick={() => {
                              setShowPriceFilter(false);
                              setTriggerSearch(true);
                              refetch();
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <Select 
                  value={priceSort || "recent"} 
                  onValueChange={(value) => setPriceSort(value === "recent" ? undefined : value as "asc" | "desc")}
                >
                  <SelectTrigger className="h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Sort: Recent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Sort: Recent</SelectItem>
                    <SelectItem value="asc">Price: Low to High</SelectItem>
                    <SelectItem value="desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    className="h-8 rounded-full px-4 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setCategory(undefined);
                      setCondition(undefined);
                      setPriceSort(undefined);
                      setMinPrice("");
                      setMaxPrice("");
                      setTriggerSearch(true);
                      refetch();
                    }}
                  >
                    Clear All Filters
                    <X className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-6">
              {/* Listings Grid */}
              {!filteredListings ? (
                <p className="text-center text-gray-600">Loading listings...</p>
              ) : filteredListings.length > 0 ? (
                <ListingGrid listings={filteredListings} />
              ) : (
                <p className="text-center text-gray-600">No listings found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MaxWidthWrapper>
  );
}