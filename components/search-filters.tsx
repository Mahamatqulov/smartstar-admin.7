"use client"

import type React from "react"

import { Search } from "lucide-react"
import { debounce } from "@/utils/virtualize"
import { useCallback, useState } from "react"

interface FilterOption {
  value: string
  label: string
}

interface SearchFiltersProps {
  onSearch: (term: string) => void
  filters?: {
    name: string
    options: FilterOption[]
    value: string
    onChange: (value: string) => void
  }[]
  searchPlaceholder?: string
  className?: string
}

export default function SearchFilters({
  onSearch,
  filters = [],
  searchPlaceholder = "Search...",
  className = "",
}: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      onSearch(term)
    }, 300),
    [onSearch],
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    debouncedSearch(term)
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow mb-6 ${className}`}>
      <div
        className={`grid grid-cols-1 ${filters.length > 0 ? `md:grid-cols-${Math.min(filters.length + 1, 4)}` : ""} gap-4`}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-9 pr-4 py-2 border rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {filters.map((filter, index) => (
          <select
            key={index}
            className="border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => filter.onChange(e.target.value)}
            value={filter.value}
            aria-label={filter.name}
          >
            <option value="">{`All ${filter.name}`}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  )
}
