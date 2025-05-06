import type { AuthUser, LoginCredentials } from "./auth-service"

// Mock authentication service for development and preview environments
export const MockAuthService = {
  // Mock login function
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    console.log("MockAuthService: Login attempt with:", credentials.login)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check credentials (very basic check for demo purposes)
    if (credentials.login === "admin" && credentials.password === "admin123") {
      const authUser: AuthUser = {
        id: "mock-user-1",
        login: "admin",
        name: "Admin User",
        role: "admin",
        token: "mock-token-xyz",
      }

      // Store user data in memory and localStorage
      this.setUser(authUser)
      this.setToken(authUser.token)

      console.log("MockAuthService: Login successful")
      return authUser
    }

    // Simulate login failure
    console.error("MockAuthService: Login failed - Invalid credentials")
    throw new Error("Invalid username or password")
  },

  // Mock logout function
  logout(): void {
    console.log("MockAuthService: Logging out user")
    this.removeToken()
    this.removeUser()
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  // Get current user
  getCurrentUser(): AuthUser | null {
    try {
      // Try to get from memory first
      const userJson = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null
      if (!userJson) return null
      return JSON.parse(userJson)
    } catch (error) {
      console.error("MockAuthService: Error getting current user", error)
      this.logout()
      return null
    }
  },

  // Get auth token
  getToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  },

  // Set auth token
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)

      // Also set cookie for middleware
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7) // 7 days expiry
      document.cookie = `auth_token=${token}; path=/; expires=${expiryDate.toUTCString()}`
    }
  },

  // Remove auth token
  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      // Clear cookie
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  },

  // Set user
  setUser(user: AuthUser): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user))
    }
  },

  // Remove user
  removeUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user")
    }
  },
}
