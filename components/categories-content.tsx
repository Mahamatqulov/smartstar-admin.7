"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react"
import { apiService, type Category, type Subcategory } from "@/services/api-service"
import { useNotification } from "@/contexts/notification-context"

export default function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showEditSubcategoryModal, setShowEditSubcategoryModal] = useState(false)
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false)
  const [showDeleteSubcategoryModal, setShowDeleteSubcategoryModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<{
    categoryId: string
    id: string
    name: string
  } | null>(null)
  const { showNotification } = useNotification()

  // Refs for modal handling
  const categoryModalRef = useRef<HTMLDivElement>(null)
  const subcategoryModalRef = useRef<HTMLDivElement>(null)
  const editCategoryModalRef = useRef<HTMLDivElement>(null)
  const editSubcategoryModalRef = useRef<HTMLDivElement>(null)
  const deleteCategoryModalRef = useRef<HTMLDivElement>(null)
  const deleteSubcategoryModalRef = useRef<HTMLDivElement>(null)

  // Click outside handler for dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu !== null && !(event.target as Element).closest(".category-menu")) {
        setShowMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  // Form state for category
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    featured: false,
    status: "Active",
    displayOrder: 0,
  })

  // Form state for subcategory
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    displayOrder: 0,
    parentId: "",
  })

  // Form state for edit category
  const [editCategoryFormData, setEditCategoryFormData] = useState({
    id: "",
    name: "",
    description: "",
    featured: false,
    status: "Active",
    displayOrder: 0,
  })

  // Form state for edit subcategory
  const [editSubcategoryFormData, setEditSubcategoryFormData] = useState({
    id: "",
    name: "",
    description: "",
    status: "Active",
    displayOrder: 0,
    parentId: "",
  })

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [subcategoryFormErrors, setSubcategoryFormErrors] = useState<Record<string, string>>({})
  const [editCategoryFormErrors, setEditCategoryFormErrors] = useState<Record<string, string>>({})
  const [editSubcategoryFormErrors, setEditSubcategoryFormErrors] = useState<Record<string, string>>({})

  // Add a function to validate category data
  const validateCategoryData = (data: any[]): Category[] => {
    return data.map((item) => ({
      id: item.id?.toString() || `temp-${Date.now()}`,
      name: item.name || "Unnamed Category",
      projects: item.projects || 0,
      funding: item.funding || "$0",
      successRate: item.successRate || "0%",
      featured: !!item.featured,
      status: item.status || "Active",
      description: item.description || "",
      displayOrder: item.displayOrder || 0,
      subcategories: Array.isArray(item.subcategories)
        ? item.subcategories.map((sub: any) => ({
            id: sub.id?.toString() || `temp-sub-${Date.now()}`,
            name: sub.name || "Unnamed Subcategory",
            parentId: sub.parentId || item.id?.toString(),
            projects: sub.projects || 0,
            status: sub.status || "Active",
            description: sub.description || "",
            displayOrder: sub.displayOrder || 0,
          }))
        : [],
    }))
  }

  // Update the fetchCategories function to use the validation function
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await apiService.getCategories()

      // Validate and process the data
      const processedData = Array.isArray(data) ? validateCategoryData(data) : []

      setCategories(processedData)
      setFilteredCategories(processedData)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      showNotification("error", "Failed to load categories. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories
  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter((category) => {
        // Check if category name matches
        const categoryMatches = category.name.toLowerCase().includes(searchTerm.toLowerCase())

        // Check if any subcategory name matches
        const subcategoryMatches =
          category.subcategories?.some((sub) => sub.name.toLowerCase().includes(searchTerm.toLowerCase())) || false

        return categoryMatches || subcategoryMatches
      })
      setFilteredCategories(filtered)

      // Auto-expand categories with matching subcategories
      const newExpandedState = { ...expandedCategories }
      filtered.forEach((category) => {
        if (category.subcategories?.some((sub) => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
          newExpandedState[category.id] = true
        }
      })
      setExpandedCategories(newExpandedState)
    }
  }, [searchTerm, categories])

  // Handle modal escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showModal) setShowModal(false)
        if (showSubcategoryModal) setShowSubcategoryModal(false)
        if (showEditCategoryModal) setShowEditCategoryModal(false)
        if (showEditSubcategoryModal) setShowEditSubcategoryModal(false)
        if (showDeleteCategoryModal) setShowDeleteCategoryModal(false)
        if (showDeleteSubcategoryModal) setShowDeleteSubcategoryModal(false)
      }
    }

    window.addEventListener("keydown", handleEscapeKey)
    return () => {
      window.removeEventListener("keydown", handleEscapeKey)
    }
  }, [
    showModal,
    showSubcategoryModal,
    showEditCategoryModal,
    showEditSubcategoryModal,
    showDeleteCategoryModal,
    showDeleteSubcategoryModal,
  ])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle form input changes for category
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Handle form input changes for subcategory
  const handleSubcategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setSubcategoryFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when field is edited
    if (subcategoryFormErrors[name]) {
      setSubcategoryFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Handle form input changes for edit category
  const handleEditCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setEditCategoryFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when field is edited
    if (editCategoryFormErrors[name]) {
      setEditCategoryFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Handle form input changes for edit subcategory
  const handleEditSubcategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setEditSubcategoryFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when field is edited
    if (editSubcategoryFormErrors[name]) {
      setEditSubcategoryFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Validate category form
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = "Category name is required"
    return errors
  }

  // Validate subcategory form
  const validateSubcategoryForm = () => {
    const errors: Record<string, string> = {}
    if (!subcategoryFormData.name.trim()) errors.name = "Subcategory name is required"
    if (!subcategoryFormData.parentId) errors.parentId = "Parent category is required"
    return errors
  }

  // Validate edit category form
  const validateEditCategoryForm = () => {
    const errors: Record<string, string> = {}
    if (!editCategoryFormData.name.trim()) errors.name = "Category name is required"
    return errors
  }

  // Validate edit subcategory form
  const validateEditSubcategoryForm = () => {
    const errors: Record<string, string> = {}
    if (!editSubcategoryFormData.name.trim()) errors.name = "Subcategory name is required"
    if (!editSubcategoryFormData.parentId) errors.parentId = "Parent category is required"
    return errors
  }

  // Handle category form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setIsSubmitting(true)

      // Create category using the API
      const newCategory = await apiService.createCategory({
        name: formData.name,
        description: formData.description,
        featured: formData.featured,
        status: formData.status,
        displayOrder: Number(formData.displayOrder),
        projects: 0,
        funding: "$0",
        successRate: "0%",
      })

      // Update categories list
      setCategories((prev) => [...prev, newCategory])

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        featured: false,
        status: "Active",
        displayOrder: 0,
      })
      setShowModal(false)

      // Show success notification
      showNotification("success", `Category "${newCategory.name}" created successfully!`)
    } catch (error) {
      console.error("Failed to create category:", error)
      showNotification("error", "Failed to create category. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle subcategory form submission
  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors = validateSubcategoryForm()
    if (Object.keys(errors).length > 0) {
      setSubcategoryFormErrors(errors)
      return
    }

    try {
      setIsSubmitting(true)

      // Create subcategory using the API
      const newSubcategory = await apiService.createSubcategory({
        name: subcategoryFormData.name,
        description: subcategoryFormData.description,
        parentId: subcategoryFormData.parentId,
        status: subcategoryFormData.status,
        displayOrder: Number(subcategoryFormData.displayOrder),
      })

      // Update categories list with the new subcategory
      setCategories((prev) => {
        return prev.map((category) => {
          if (category.id === subcategoryFormData.parentId) {
            return {
              ...category,
              subcategories: [...(category.subcategories || []), newSubcategory],
            }
          }
          return category
        })
      })

      // Reset form and close modal
      setSubcategoryFormData({
        name: "",
        description: "",
        status: "Active",
        displayOrder: 0,
        parentId: "",
      })
      setShowSubcategoryModal(false)

      // Show success notification
      showNotification("success", `Subcategory "${newSubcategory.name}" created successfully!`)
    } catch (error) {
      console.error("Failed to create subcategory:", error)
      showNotification("error", "Failed to create subcategory. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit category form submission
  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors = validateEditCategoryForm()
    if (Object.keys(errors).length > 0) {
      setEditCategoryFormErrors(errors)
      return
    }

    try {
      setIsSubmitting(true)

      // In a real app, this would call an API endpoint to update the category
      // For now, we'll just update the local state
      setCategories((prev) => {
        return prev.map((category) => {
          if (category.id === editCategoryFormData.id) {
            return {
              ...category,
              name: editCategoryFormData.name,
              description: editCategoryFormData.description,
              featured: editCategoryFormData.featured,
              status: editCategoryFormData.status,
              displayOrder: Number(editCategoryFormData.displayOrder),
            }
          }
          return category
        })
      })

      // Reset form and close modal
      setEditCategoryFormData({
        id: "",
        name: "",
        description: "",
        featured: false,
        status: "Active",
        displayOrder: 0,
      })
      setShowEditCategoryModal(false)

      // Show success notification
      showNotification("success", "Category updated successfully!")
    } catch (error) {
      console.error("Failed to update category:", error)
      showNotification("error", "Failed to update category. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit subcategory form submission
  const handleEditSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors = validateEditSubcategoryForm()
    if (Object.keys(errors).length > 0) {
      setEditSubcategoryFormErrors(errors)
      return
    }

    try {
      setIsSubmitting(true)

      // In a real app, this would call an API endpoint to update the subcategory
      // For now, we'll just update the local state
      setCategories((prev) => {
        return prev.map((category) => {
          if (category.id === editSubcategoryFormData.parentId) {
            return {
              ...category,
              subcategories: category.subcategories?.map((sub) => {
                if (sub.id === editSubcategoryFormData.id) {
                  return {
                    ...sub,
                    name: editSubcategoryFormData.name,
                    description: editSubcategoryFormData.description,
                    status: editSubcategoryFormData.status,
                    displayOrder: Number(editSubcategoryFormData.displayOrder),
                  }
                }
                return sub
              }),
            }
          }
          return category
        })
      })

      // Reset form and close modal
      setEditSubcategoryFormData({
        id: "",
        name: "",
        description: "",
        status: "Active",
        displayOrder: 0,
        parentId: "",
      })
      setShowEditSubcategoryModal(false)

      // Show success notification
      showNotification("success", "Subcategory updated successfully!")
    } catch (error) {
      console.error("Failed to update subcategory:", error)
      showNotification("error", "Failed to update subcategory. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle category deletion
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      setIsSubmitting(true)

      // In a real app, this would call an API endpoint to delete the category
      await apiService.deleteCategory(categoryToDelete.id)

      // Update categories list
      setCategories((prev) => prev.filter((category) => category.id !== categoryToDelete.id))

      // Close modal and reset state
      setShowDeleteCategoryModal(false)
      setCategoryToDelete(null)

      // Show success notification
      showNotification("success", `Category "${categoryToDelete.name}" deleted successfully!`)
    } catch (error) {
      console.error(`Failed to delete category ${categoryToDelete.id}:`, error)
      showNotification("error", "Failed to delete category. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle subcategory deletion
  const handleDeleteSubcategory = async () => {
    if (!subcategoryToDelete) return

    try {
      setIsSubmitting(true)

      // In a real app, this would call an API endpoint to delete the subcategory
      // For now, we'll just update the local state
      setCategories((prev) => {
        return prev.map((category) => {
          if (category.id === subcategoryToDelete.categoryId) {
            return {
              ...category,
              subcategories: category.subcategories?.filter((sub) => sub.id !== subcategoryToDelete.id) || [],
            }
          }
          return category
        })
      })

      // Close modal and reset state
      setShowDeleteSubcategoryModal(false)
      setSubcategoryToDelete(null)

      // Show success notification
      showNotification("success", `Subcategory "${subcategoryToDelete.name}" deleted successfully!`)
    } catch (error) {
      console.error(`Failed to delete subcategory ${subcategoryToDelete.id}:`, error)
      showNotification("error", "Failed to delete subcategory. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle view projects
  const handleViewProjects = (categoryName: string) => {
    // In a real app, this would navigate to a filtered projects page
    showNotification("info", `Viewing projects in category "${categoryName}"`)
  }

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditCategoryFormData({
      id: category.id,
      name: category.name,
      description: category.description || "",
      featured: category.featured,
      status: category.status,
      displayOrder: category.displayOrder || 0,
    })
    setShowEditCategoryModal(true)
  }

  // Handle edit subcategory
  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditSubcategoryFormData({
      id: subcategory.id,
      name: subcategory.name,
      description: subcategory.description || "",
      status: subcategory.status,
      displayOrder: subcategory.displayOrder || 0,
      parentId: subcategory.parentId,
    })
    setShowEditSubcategoryModal(true)
  }

  // Open delete category modal
  const openDeleteCategoryModal = (id: string, name: string) => {
    setCategoryToDelete({ id, name })
    setShowDeleteCategoryModal(true)
  }

  // Open delete subcategory modal
  const openDeleteSubcategoryModal = (categoryId: string, id: string, name: string) => {
    setSubcategoryToDelete({ categoryId, id, name })
    setShowDeleteSubcategoryModal(true)
  }

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Open subcategory modal for a specific category
  const openSubcategoryModal = (category: Category) => {
    setSelectedCategory(category)
    setSubcategoryFormData((prev) => ({
      ...prev,
      parentId: category.id,
    }))
    setShowSubcategoryModal(true)
  }

  // Handle modal backdrop click
  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (showModal) setShowModal(false)
      if (showSubcategoryModal) setShowSubcategoryModal(false)
      if (showEditCategoryModal) setShowEditCategoryModal(false)
      if (showEditSubcategoryModal) setShowEditSubcategoryModal(false)
      if (showDeleteCategoryModal) setShowDeleteCategoryModal(false)
      if (showDeleteSubcategoryModal) setShowDeleteSubcategoryModal(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Hidden":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFeaturedStatus = (featured: boolean) => {
    return featured ? (
      <span className="bg-green-100 text-green-800 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
        Yes
      </span>
    ) : (
      <span className="bg-gray-100 text-gray-800 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
        No
      </span>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search categories and subcategories"
            className="pl-9 pr-4 py-2 border rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Funding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="mr-2 focus:outline-none hover:bg-gray-100 rounded-full p-1 transition-colors"
                            aria-label={expandedCategories[category.id] ? "Collapse category" : "Expand category"}
                          >
                            {category.subcategories && category.subcategories.length > 0 ? (
                              expandedCategories[category.id] ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )
                            ) : (
                              <span className="w-4"></span>
                            )}
                          </button>
                          <div className="font-medium text-gray-900">{category.name || "Unnamed Category"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.projects || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.funding || "$0"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.successRate || "0%"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getFeaturedStatus(!!category.featured)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(category.status || "Active")}`}
                        >
                          {category.status || "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className="relative category-menu">
                          <button
                            onClick={() => setShowMenu(showMenu === Number(category.id) ? null : Number(category.id))}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                            aria-label="Category actions"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>

                          {showMenu === Number(category.id) && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border animate-in fade-in zoom-in-95 duration-100">
                              <div className="py-1">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                                  onClick={() => handleViewProjects(category.name)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Projects
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Category
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                                  onClick={() => openSubcategoryModal(category)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Subcategory
                                </button>
                                <div className="border-t my-1"></div>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                  onClick={() => openDeleteCategoryModal(category.id, category.name)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Category
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Subcategories */}
                    {expandedCategories[category.id] &&
                      category.subcategories &&
                      category.subcategories.length > 0 &&
                      category.subcategories.map((subcategory) => (
                        <tr key={subcategory.id} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center pl-6 ml-2 border-l-2 border-gray-300">
                              <div className="text-sm text-gray-700">{subcategory.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{subcategory.projects}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">-</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">-</td>
                          <td className="px-6 py-3 whitespace-nowrap">-</td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subcategory.status)}`}
                            >
                              {subcategory.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditSubcategory(subcategory)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors"
                                title="Edit Subcategory"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  openDeleteSubcategoryModal(category.id, subcategory.id, subcategory.name)
                                }
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-colors"
                                title="Delete Subcategory"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={categoryModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-medium text-gray-800">Add New Category</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  className={`w-full border ${formErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"} rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter category description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      Show as featured
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="status"
                      name="status"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                      checked={formData.status === "Active"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.checked ? "Active" : "Hidden",
                        }))
                      }
                    />
                    <label htmlFor="status" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showSubcategoryModal && selectedCategory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={subcategoryModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-medium text-gray-800">Add New Subcategory</h3>
              <button
                onClick={() => setShowSubcategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubcategorySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm bg-gray-100"
                  value={selectedCategory.name}
                  disabled
                />
                <input type="hidden" name="parentId" value={selectedCategory.id} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  name="name"
                  className={`w-full border ${subcategoryFormErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"} rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Enter subcategory name"
                  value={subcategoryFormData.name}
                  onChange={handleSubcategoryInputChange}
                />
                {subcategoryFormErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{subcategoryFormErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter subcategory description"
                  rows={3}
                  value={subcategoryFormData.description}
                  onChange={handleSubcategoryInputChange}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="subcategoryStatus"
                    name="status"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                    checked={subcategoryFormData.status === "Active"}
                    onChange={(e) =>
                      setSubcategoryFormData((prev) => ({
                        ...prev,
                        status: e.target.checked ? "Active" : "Hidden",
                      }))
                    }
                  />
                  <label htmlFor="subcategoryStatus" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                  value={subcategoryFormData.displayOrder}
                  onChange={handleSubcategoryInputChange}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubcategoryModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    "Create Subcategory"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={editCategoryModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-medium text-gray-800">Edit Category</h3>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditCategorySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  className={`w-full border ${editCategoryFormErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"} rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Enter category name"
                  value={editCategoryFormData.name}
                  onChange={handleEditCategoryInputChange}
                />
                {editCategoryFormErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{editCategoryFormErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter category description"
                  rows={4}
                  value={editCategoryFormData.description}
                  onChange={handleEditCategoryInputChange}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editFeatured"
                      name="featured"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                      checked={editCategoryFormData.featured}
                      onChange={handleEditCategoryInputChange}
                    />
                    <label htmlFor="editFeatured" className="ml-2 text-sm text-gray-700">
                      Show as featured
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editStatus"
                      name="status"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                      checked={editCategoryFormData.status === "Active"}
                      onChange={(e) =>
                        setEditCategoryFormData((prev) => ({
                          ...prev,
                          status: e.target.checked ? "Active" : "Hidden",
                        }))
                      }
                    />
                    <label htmlFor="editStatus" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                  value={editCategoryFormData.displayOrder}
                  onChange={handleEditCategoryInputChange}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {showEditSubcategoryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={editSubcategoryModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-medium text-gray-800">Edit Subcategory</h3>
              <button
                onClick={() => setShowEditSubcategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubcategorySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  name="name"
                  className={`w-full border ${editSubcategoryFormErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"} rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Enter subcategory name"
                  value={editSubcategoryFormData.name}
                  onChange={handleEditSubcategoryInputChange}
                />
                {editSubcategoryFormErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{editSubcategoryFormErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter subcategory description"
                  rows={3}
                  value={editSubcategoryFormData.description}
                  onChange={handleEditSubcategoryInputChange}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editSubcategoryStatus"
                    name="status"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                    checked={editSubcategoryFormData.status === "Active"}
                    onChange={(e) =>
                      setEditSubcategoryFormData((prev) => ({
                        ...prev,
                        status: e.target.checked ? "Active" : "Hidden",
                      }))
                    }
                  />
                  <label htmlFor="editSubcategoryStatus" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                  value={editSubcategoryFormData.displayOrder}
                  onChange={handleEditSubcategoryInputChange}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditSubcategoryModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={deleteCategoryModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Delete Category</h3>
            </div>

            <p className="mb-4 text-gray-700">
              Are you sure you want to delete the category{" "}
              <span className="font-semibold">{categoryToDelete.name}</span>? This action cannot be undone.
            </p>

            {/* Warning about subcategories */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <p>All subcategories within this category will also be deleted.</p>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteCategoryModal(false)
                  setCategoryToDelete(null)
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  "Delete Category"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subcategory Modal */}
      {showDeleteSubcategoryModal && subcategoryToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={deleteSubcategoryModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Delete Subcategory</h3>
            </div>

            <p className="mb-4 text-gray-700">
              Are you sure you want to delete the subcategory{" "}
              <span className="font-semibold">{subcategoryToDelete.name}</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteSubcategoryModal(false)
                  setSubcategoryToDelete(null)
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubcategory}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  "Delete Subcategory"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
