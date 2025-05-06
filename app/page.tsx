"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin-sidebar"
import AdminHeader from "@/components/admin-header"
import DashboardContent from "@/components/dashboard-content"
import ProjectsContent from "@/components/projects-content"
import UsersContent from "@/components/users-content"
import FundingContent from "@/components/funding-content"
import CategoriesContent from "@/components/categories-content"
import SettingsContent from "@/components/settings-content"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  // Load saved page from localStorage
  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage")
    if (savedPage) {
      setCurrentPage(savedPage)
    }
  }, [])

  // Save current page to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage)
  }, [currentPage])

  // Listen for sidebar navigation events
  useEffect(() => {
    const handleSidebarNavigate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        setCurrentPage(customEvent.detail)
      }
    }

    document.addEventListener("sidebarNavigate", handleSidebarNavigate as EventListener)
    return () => {
      document.removeEventListener("sidebarNavigate", handleSidebarNavigate as EventListener)
    }
  }, [])

  // Simulate loading state when changing pages
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [currentPage])

  // If still checking authentication, show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null
  }

  // Render the appropriate content based on the selected page
  const renderContent = () => {
    if (isLoading) {
      return <LoadingPlaceholder />
    }

    switch (currentPage) {
      case "dashboard":
        return <DashboardContent />
      case "projects":
        return <ProjectsContent />
      case "users":
        return <UsersContent />
      case "funding":
        return <FundingContent />
      case "categories":
        return <CategoriesContent />
      case "settings":
        return <SettingsContent />
      default:
        return <DashboardContent />
    }
  }

  // Get the title for the current page
  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard"
      case "projects":
        return "Projects Management"
      case "users":
        return "Users Management"
      case "funding":
        return "Funding Overview"
      case "categories":
        return "Categories Management"
      case "settings":
        return "Settings"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <AdminHeader title={getPageTitle()} />

          {/* Content */}
          <main className="p-6 flex-1 overflow-auto">{renderContent()}</main>
        </div>
      </div>
    </div>
  )
}

// Loading placeholder component
function LoadingPlaceholder() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-12 bg-gray-200 rounded-t"></div>
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
