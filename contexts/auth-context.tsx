"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthUser, LoginCredentials } from "@/services/auth-service"
import { AuthService } from "@/services/auth-service"
import { MockAuthService } from "@/services/mock-auth-service"
import { useRouter } from "next/navigation"
import { isPreviewMode } from "@/utils/api"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
  isPreviewMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Determine if we're in preview mode once at component mount
  const [inPreviewMode] = useState(() => isPreviewMode())

  // IMPORTANT: Always use MockAuthService in preview mode
  const authService = inPreviewMode ? MockAuthService : AuthService

  useEffect(() => {
    console.log(`Using ${inPreviewMode ? "MockAuthService" : "AuthService"} for authentication`)
  }, [inPreviewMode])

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (err) {
        console.error("Auth check error:", err)
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [authService])

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`AuthContext: Login attempt using ${inPreviewMode ? "MockAuthService" : "AuthService"}`)

      // Use the appropriate auth service based on environment
      const loggedInUser = await authService.login(credentials)

      console.log("AuthContext: Login successful")
      setUser(loggedInUser)
      router.push("/")
    } catch (err) {
      console.error("AuthContext: Login error:", err)

      let errorMessage = "Login failed. Please check your credentials and try again."
      if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    console.log("AuthContext: Logging out user")
    authService.logout()
    setUser(null)
    router.push("/login")
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isPreviewMode: inPreviewMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
