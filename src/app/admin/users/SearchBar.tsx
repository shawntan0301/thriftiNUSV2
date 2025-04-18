"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";

interface SearchBarProps {
  defaultValue?: string;
}

export default function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(defaultValue);
  const debouncedSearch = useDebounce(search, 300);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      params.set("page", "1"); // Reset to first page when searching
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    router.push(`?${createQueryString("search", debouncedSearch)}`);
  }, [debouncedSearch, router, createQueryString]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search users..."
        className="w-full pl-8"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
} 