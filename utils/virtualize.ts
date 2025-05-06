/**
 * Utility function to virtualize large datasets
 * This helps render only the visible portion of a large list or table
 */
export function virtualizeData<T>(
  data: T[],
  options: {
    page: number
    itemsPerPage: number
    totalItems?: number
  },
): {
  items: T[]
  totalPages: number
  startIndex: number
  endIndex: number
  totalItems: number
} {
  const { page, itemsPerPage } = options
  const totalItems = options.totalItems || data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const startIndex = (page - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const items = data.slice(startIndex, endIndex)

  return {
    items,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
  }
}

/**
 * Generate pagination numbers with ellipsis for large page counts
 */
export function generatePaginationNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages = 5,
): (number | string)[] {
  const pages: (number | string)[] = []

  if (totalPages <= maxVisiblePages) {
    // Show all pages if there are few
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push("...")
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push("...")
    }

    // Always show last page
    pages.push(totalPages)
  }

  return pages
}

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}
