"use client"

import { Eye, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

interface Project {
  id: number
  name: string
  creator: string
  category: string
  funding: string
  progress: number
  status: string
}

interface ProjectsTableProps {
  initialProjects?: Project[]
  itemsPerPage?: number
  isLoading?: boolean
}

export default function ProjectsTable({ initialProjects, itemsPerPage = 5, isLoading = false }: ProjectsTableProps) {
  const [showMenu, setShowMenu] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [projects, setProjects] = useState<Project[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(isLoading)

  // Sample data - in a real app, this would come from an API
  const allProjects: Project[] = initialProjects || [
    {
      id: 1,
      name: "SPELL BOUND vintage witchcraft",
      creator: "Thomas Noonan",
      category: "Art Books",
      funding: "$12,450",
      progress: 76,
      status: "Active",
    },
    {
      id: 2,
      name: "Tomb of the Sun King",
      creator: "Jacquelyn Benson",
      category: "Publishing",
      funding: "$34,890",
      progress: 416,
      status: "Active",
    },
    {
      id: 3,
      name: "The Arrow and the Ivy",
      creator: "Innate Ink Publishing",
      category: "Publishing",
      funding: "$18,600",
      progress: 186,
      status: "Active",
    },
    {
      id: 4,
      name: "ALIEN RPG - Evolved Edition",
      creator: "Free League",
      category: "Games",
      funding: "$245,700",
      progress: 3580,
      status: "Active",
    },
    {
      id: 5,
      name: "LUDOS: The ancient games collection",
      creator: "Lemery Games",
      category: "Games",
      funding: "$28,480",
      progress: 142,
      status: "Pending",
    },
    // Generate more sample projects for testing pagination
    ...Array.from({ length: 20 }, (_, i) => ({
      id: i + 6,
      name: `Project ${i + 6}`,
      creator: `Creator ${i + 6}`,
      category: i % 2 === 0 ? "Games" : "Publishing",
      funding: `$${Math.floor(Math.random() * 100000)}`,
      progress: Math.floor(Math.random() * 100),
      status: i % 3 === 0 ? "Pending" : "Active",
    })),
  ]

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      const totalItems = allProjects.length
      setTotalPages(Math.ceil(totalItems / itemsPerPage))

      const start = (currentPage - 1) * itemsPerPage
      const end = start + itemsPerPage
      setProjects(allProjects.slice(start, end))
      setLoading(false)
    }, 300) // Simulate network delay
  }, [currentPage, itemsPerPage])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600"
      case "Pending":
        return "text-yellow-600"
      case "Ended":
        return "text-gray-600"
      case "Suspended":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Art Books": "bg-blue-100 text-blue-800",
      Publishing: "bg-green-100 text-green-800",
      Games: "bg-purple-100 text-purple-800",
      Design: "bg-yellow-100 text-yellow-800",
      Film: "bg-red-100 text-red-800",
    }

    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const handleViewProject = (id: number) => {
    setSelectedProject(id)
    console.log(`Viewing project ${id}`)
    // In a real app, this would navigate to the project details page
  }

  const handleEditProject = (id: number) => {
    console.log(`Editing project ${id}`)
    // In a real app, this would open an edit modal or navigate to edit page
  }

  const handleFeatureProject = (id: number) => {
    console.log(`Featuring project ${id}`)
    // In a real app, this would update the project's featured status
  }

  const handleDeleteProject = (id: number) => {
    console.log(`Deleting project ${id}`)
    // In a real app, this would show a confirmation dialog before deleting
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    setShowMenu(null) // Close any open menus when changing pages
  }

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page, current page and neighbors, and last page
      pages.push(1)

      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      if (startPage > 2) pages.push(-1) // -1 represents ellipsis

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages - 1) pages.push(-2) // -2 represents ellipsis

      pages.push(totalPages)
    }

    return pages
  }

  // Skeleton loader for table rows
  const TableSkeleton = () => (
    <>
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <tr key={`skeleton-${index}`} className="animate-pulse">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-2.5 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-8 mt-1"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
        </tr>
      ))}
    </>
  )

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funding
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableSkeleton />
            ) : (
              projects.map((project) => (
                <tr key={project.id} className={selectedProject === project.id ? "bg-blue-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.creator}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(project.category)}`}
                    >
                      {project.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.funding}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${Math.min(project.progress, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{project.progress}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusColor(project.status)}>{project.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    <div className="flex items-center">
                      <button
                        className="text-gray-600 hover:text-gray-900 flex items-center mr-2"
                        onClick={() => handleViewProject(project.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(showMenu === project.id ? null : project.id)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="More options"
                          aria-expanded={showMenu === project.id}
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {showMenu === project.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleEditProject(project.id)}
                              >
                                Edit Project
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleFeatureProject(project.id)}
                              >
                                Feature Project
                              </button>
                              <div className="border-t my-1"></div>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                Delete Project
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing{" "}
            {loading
              ? "..."
              : `${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, allProjects.length)}`}{" "}
            of {loading ? "..." : allProjects.length} projects
          </div>
          <div className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 border rounded-l text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPaginationNumbers().map((page, index) =>
              page < 0 ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-700">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
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
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 border rounded-r text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
