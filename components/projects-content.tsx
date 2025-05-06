"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiService, type Project } from "@/services/api-service"
import { useNotification } from "@/contexts/notification-context"
import { Search, Plus, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"

export default function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [subcategories, setSubcategories] = useState<{ value: string; label: string; parentId: string }[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subcategory_id: "",
    description: "",
    funding_goal: 0,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "active",
    user_id: "1", // Default user ID
    current_amount: 0,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(10)
  const { showNotification } = useNotification()

  // Refs for modals
  const createModalRef = useRef<HTMLDivElement>(null)
  const viewModalRef = useRef<HTMLDivElement>(null)
  const editModalRef = useRef<HTMLDivElement>(null)
  const deleteModalRef = useRef<HTMLDivElement>(null)

  // Fetch projects and categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Prepare query parameters for projects
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: limit.toString(),
      }

      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory

      const [projectsData, categoriesData] = await Promise.all([
        apiService.getProjects(params),
        apiService.getCategories(),
      ])

      setProjects(Array.isArray(projectsData) ? projectsData : [])

      // Extract categories and subcategories
      const cats = categoriesData.map((category) => ({
        value: category.id,
        label: category.name,
      }))

      setCategories(cats)

      // Collect all subcategories from all categories
      const subCats: { value: string; label: string; parentId: string }[] = []
      categoriesData.forEach((category) => {
        if (category.subcategories && category.subcategories.length > 0) {
          category.subcategories.forEach((sub) => {
            subCats.push({
              value: sub.id,
              label: `${category.name} - ${sub.name}`,
              parentId: category.id,
            })
          })
        }
      })

      setSubcategories(subCats)

      // Calculate total pages based on response (this would need to be adjusted based on actual API response)
      // For now, we'll just set a placeholder
      setTotalPages(5)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      showNotification("error", "Failed to load projects data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [showNotification, currentPage, limit, searchTerm, selectedCategory])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle click outside modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createModalRef.current && !createModalRef.current.contains(event.target as Node) && showModal) {
        setShowModal(false)
      }
      if (viewModalRef.current && !viewModalRef.current.contains(event.target as Node) && showViewModal) {
        setShowViewModal(false)
      }
      if (editModalRef.current && !editModalRef.current.contains(event.target as Node) && showEditModal) {
        setShowEditModal(false)
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node) && showDeleteModal) {
        setShowDeleteModal(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showModal, showViewModal, showEditModal, showDeleteModal])

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showModal) setShowModal(false)
        if (showViewModal) setShowViewModal(false)
        if (showEditModal) setShowEditModal(false)
        if (showDeleteModal) setShowDeleteModal(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [showModal, showViewModal, showEditModal, showDeleteModal])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.title.trim()) errors.title = "Project title is required"
    if (!formData.subcategory_id) errors.subcategory_id = "Subcategory is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (formData.funding_goal <= 0) errors.funding_goal = "Funding goal must be greater than 0"
    if (!formData.deadline) errors.deadline = "Deadline is required"
    return errors
  }

  // Handle form submission for creating a project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setIsSubmitting(true)
      const newProject = await apiService.createProject({
        title: formData.title,
        subcategory_id: formData.subcategory_id,
        description: formData.description,
        funding_goal: formData.funding_goal,
        deadline: new Date(formData.deadline).toISOString(),
        status: formData.status,
        user_id: formData.user_id,
        current_amount: formData.current_amount,
      })

      // Add the new project to the list
      setProjects((prev) => [newProject, ...prev])
      setShowModal(false)
      showNotification("success", "Project created successfully!")

      // Reset form data
      setFormData({
        title: "",
        subcategory_id: "",
        description: "",
        funding_goal: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "active",
        user_id: "1",
        current_amount: 0,
      })
    } catch (error) {
      console.error("Failed to create project:", error)
      showNotification("error", "Failed to create project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle form submission for editing a project
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setIsSubmitting(true)
      const updatedProject = await apiService.updateProject(selectedProject.id, {
        title: formData.title,
        subcategory_id: formData.subcategory_id,
        description: formData.description,
        funding_goal: formData.funding_goal,
        deadline: new Date(formData.deadline).toISOString(),
        status: formData.status,
        current_amount: formData.current_amount,
      })

      // Update the project in the list
      setProjects((prev) =>
        prev.map((project) => (project.id === selectedProject.id ? { ...project, ...updatedProject } : project)),
      )
      setShowEditModal(false)
      showNotification("success", "Project updated successfully!")
    } catch (error) {
      console.error("Failed to update project:", error)
      showNotification("error", "Failed to update project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!selectedProject) return

    try {
      setIsSubmitting(true)
      await apiService.deleteProject(selectedProject.id)

      // Remove the project from the list
      setProjects((prev) => prev.filter((project) => project.id !== selectedProject.id))
      setShowDeleteModal(false)
      showNotification("success", "Project deleted successfully!")
    } catch (error) {
      console.error("Failed to delete project:", error)
      showNotification("error", "Failed to delete project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle view project
  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setShowViewModal(true)
  }

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setFormData({
      title: project.title || "",
      subcategory_id: project.subcategory_id || "",
      description: project.description || "",
      funding_goal: project.funding_goal || 0,
      deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
      status: project.status || "active",
      user_id: project.user_id || "1",
      current_amount: project.current_amount || 0,
    })
    setShowEditModal(true)
  }

  // Handle delete project confirmation
  const handleDeleteConfirmation = (project: Project) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle category filter
  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle status filter
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Filter projects based on status (client-side filtering for status)
  const filteredProjects = projects.filter((project) => {
    return selectedStatus ? project.status === selectedStatus : true
  })

  // Get subcategory name
  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find((sub) => sub.value === subcategoryId)
    return subcategory ? subcategory.label : "Unknown"
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Project
        </button>
      </div>

      {/* Search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search projects..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryFilter}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={handleStatusFilter}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Projects table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Project
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Creator
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Funding
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Progress
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-green-500 mr-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading projects...
                  </div>
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{project.title}</div>
                        <div className="text-sm text-gray-500">
                          {project.description?.substring(0, 50)}
                          {project.description && project.description.length > 50 ? "..." : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.creator || "Unknown"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getSubcategoryName(project.subcategory_id || "")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${project.current_amount?.toLocaleString() || 0} / ${project.funding_goal?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((project.current_amount || 0) / (project.funding_goal || 1)) * 100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.min(100, Math.round(((project.current_amount || 0) / (project.funding_goal || 1)) * 100))}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === "active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : project.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900 mr-3"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteConfirmation(project)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredProjects.length}</span> projects
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div
              ref={createModalRef}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                        Create New Project
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Project Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.title ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          />
                          {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
                        </div>
                        <div>
                          <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700">
                            Subcategory
                          </label>
                          <select
                            name="subcategory_id"
                            id="subcategory_id"
                            value={formData.subcategory_id}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.subcategory_id ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          >
                            <option value="">Select a subcategory</option>
                            {subcategories.map((subcategory) => (
                              <option key={subcategory.value} value={subcategory.value}>
                                {subcategory.label}
                              </option>
                            ))}
                          </select>
                          {formErrors.subcategory_id && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.subcategory_id}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.description ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          ></textarea>
                          {formErrors.description && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="funding_goal" className="block text-sm font-medium text-gray-700">
                            Funding Goal ($)
                          </label>
                          <input
                            type="number"
                            name="funding_goal"
                            id="funding_goal"
                            min="0"
                            step="0.01"
                            value={formData.funding_goal}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.funding_goal ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          />
                          {formErrors.funding_goal && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.funding_goal}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                            Deadline
                          </label>
                          <input
                            type="date"
                            name="deadline"
                            id="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.deadline ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          />
                          {formErrors.deadline && <p className="mt-1 text-sm text-red-600">{formErrors.deadline}</p>}
                        </div>
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Project Modal */}
      {showViewModal && selectedProject && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div
              ref={viewModalRef}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Project Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Title</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedProject.title}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Category</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {getSubcategoryName(selectedProject.subcategory_id || "")}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedProject.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Funding Goal</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            ${selectedProject.funding_goal?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Current Amount</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            ${selectedProject.current_amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Status</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedProject.status}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Deadline</h4>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedProject.deadline || "")}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Progress</h4>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((selectedProject.current_amount || 0) / (selectedProject.funding_goal || 1)) * 100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {Math.min(
                            100,
                            Math.round(
                              ((selectedProject.current_amount || 0) / (selectedProject.funding_goal || 1)) * 100,
                            ),
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div
              ref={editModalRef}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <form onSubmit={handleEditSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                        Edit Project
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                            Project Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="edit-title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.title ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          />
                          {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
                        </div>
                        <div>
                          <label htmlFor="edit-subcategory_id" className="block text-sm font-medium text-gray-700">
                            Subcategory
                          </label>
                          <select
                            name="subcategory_id"
                            id="edit-subcategory_id"
                            value={formData.subcategory_id}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.subcategory_id ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          >
                            <option value="">Select a subcategory</option>
                            {subcategories.map((subcategory) => (
                              <option key={subcategory.value} value={subcategory.value}>
                                {subcategory.label}
                              </option>
                            ))}
                          </select>
                          {formErrors.subcategory_id && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.subcategory_id}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="edit-description"
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.description ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          ></textarea>
                          {formErrors.description && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="edit-funding_goal" className="block text-sm font-medium text-gray-700">
                            Funding Goal ($)
                          </label>
                          <input
                            type="number"
                            name="funding_goal"
                            id="edit-funding_goal"
                            min="0"
                            step="0.01"
                            value={formData.funding_goal}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.funding_goal ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          />
                          {formErrors.funding_goal && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.funding_goal}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="edit-current_amount" className="block text-sm font-medium text-gray-700">
                            Current Amount ($)
                          </label>
                          <input
                            type="number"
                            name="current_amount"
                            id="edit-current_amount"
                            min="0"
                            step="0.01"
                            value={formData.current_amount}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-700">
                            Deadline
                          </label>
                          <input
                            type="date"
                            name="deadline"
                            id="edit-deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full px-3 py-2 border ${
                              formErrors.deadline ? "border-red-300" : "border-gray-300"
                            } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                          />
                          {formErrors.deadline && <p className="mt-1 text-sm text-red-600">{formErrors.deadline}</p>}
                        </div>
                        <div>
                          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            name="status"
                            id="edit-status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div
              ref={deleteModalRef}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Delete Project
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the project "{selectedProject.title}"? This action cannot be
                        undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
