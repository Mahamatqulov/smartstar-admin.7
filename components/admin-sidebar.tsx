"use client"

import { useState, useEffect } from "react"
import { LayoutDashboard, FolderKanban, Users, Banknote, Tag, Settings, ChevronLeft, ChevronRight } from "lucide-react"

interface AdminSidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
}

export default function AdminSidebar({ currentPage, setCurrentPage }: AdminSidebarProps) {
  // Get collapsed state from localStorage or default to false
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar:collapsed")
      return saved === "true"
    }
    return false
  })

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", String(collapsed))
  }, [collapsed])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "projects", label: "Projects", icon: <FolderKanban className="h-5 w-5" /> },
    { id: "users", label: "Users", icon: <Users className="h-5 w-5" /> },
    { id: "funding", label: "Funding", icon: <Banknote className="h-5 w-5" /> },
    { id: "categories", label: "Categories", icon: <Tag className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  // Handle navigation and dispatch custom event
  const handleNavigation = (pageId: string) => {
    setCurrentPage(pageId)
    // Dispatch custom event for other components to listen to
    document.dispatchEvent(new CustomEvent("sidebarNavigate", { detail: pageId }))
  }

  return (
    <div
      className={`bg-gray-800 text-white h-screen transition-all duration-300 ${collapsed ? "w-20" : "w-64"} relative`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className={`font-bold text-xl ${collapsed ? "hidden" : "block"}`}>SmartStar</div>
        {collapsed && <div className="font-bold text-xl mx-auto">S</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-12 bg-gray-800 rounded-full p-1 text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center p-3 rounded-md transition-colors ${
                  currentPage === item.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                aria-current={currentPage === item.id ? "page" : undefined}
              >
                <span className="mr-3">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
