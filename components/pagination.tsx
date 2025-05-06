"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { generatePaginationNumbers } from "@/utils/virtualize"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  totalItems?: number
  itemsPerPage?: number
  showSummary?: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  totalItems,
  itemsPerPage,
  showSummary = true,
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isLoading) return
    onPageChange(page)
  }

  const paginationNumbers = generatePaginationNumbers(currentPage, totalPages)

  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex justify-between items-center">
        {showSummary && totalItems !== undefined && itemsPerPage !== undefined && (
          <div className="text-sm text-gray-500">
            Showing{" "}
            {isLoading
              ? "..."
              : `${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)}`}{" "}
            of {isLoading ? "..." : totalItems} items
          </div>
        )}
        <div className="flex items-center ml-auto">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 border rounded-l text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {paginationNumbers.map((page, index) =>
            typeof page === "string" ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-700">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className={`px-3 py-1 ${
                  currentPage === page ? "bg-gray-200 text-gray-700 font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="px-3 py-1 border rounded-r text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
