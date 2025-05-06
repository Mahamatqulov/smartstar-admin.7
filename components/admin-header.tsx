"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Bell, HelpCircle, User, ChevronDown, LogOut, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AdminHeaderProps {
  title: string
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const logoutModalRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle modal escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLogoutModal) {
        setShowLogoutModal(false)
      }
    }

    window.addEventListener("keydown", handleEscapeKey)
    return () => {
      window.removeEventListener("keydown", handleEscapeKey)
    }
  }, [showLogoutModal])

  // Handle logout with confirmation
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  // Handle modal backdrop click
  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowLogoutModal(false)
    }
  }

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">{title}</h1>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            className="relative p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-gray-50 border-b cursor-pointer">
                  <p className="text-sm">New project submitted for review</p>
                  <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                </div>
                <div className="p-3 hover:bg-gray-50 border-b cursor-pointer">
                  <p className="text-sm">Funding goal reached for Project X</p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
                <div className="p-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm">New user registration spike detected</p>
                  <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                </div>
              </div>
              <div className="p-2 text-center border-t">
                <button className="text-sm text-green-600 hover:text-green-800">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Help">
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-expanded={showUserMenu}
          >
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <span className="hidden md:block">{user?.name || "Admin User"}</span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border animate-in fade-in zoom-in-95 duration-100">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{user?.name || "Admin User"}</p>
                  <p className="text-xs text-gray-500">Username: {user?.login}</p>
                  <p className="text-xs text-gray-500 mt-1">Role: {user?.role || "Admin"}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</button>
                <div className="border-t my-1"></div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={logoutModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4 text-gray-800">
              <LogOut className="h-6 w-6 mr-2 text-red-600" />
              <h3 className="text-lg font-medium">Sign Out</h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="ml-auto text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-gray-700">Are you sure you want to sign out? Any unsaved changes will be lost.</p>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
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
                    Signing out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
