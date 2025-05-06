// Define types for our authentication
export interface LoginCredentials {
  login: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    login: string
    name: string
    role: string
  }
}

export interface DecodedToken {
  id: string
  login: string
  role: string
  iat: number
  exp: number
}

export interface AuthUser {
  id: string
  login: string
  name: string
  role: string
  token: string
}

// API URL from the provided endpoint
const API_URL = "http://91.213.99.20:4000/api"

export const AuthService = {
  // Login function
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      console.log("AuthService: Attempting to login with:", credentials.login)

      const response = await fetch(`${API_URL}/auth/staff/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        mode: "cors",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }))
        console.error("AuthService: Login failed with status:", response.status, errorData)
        throw new Error(errorData.message || `Login failed with status: ${response.status}`)
      }

      const data: LoginResponse = await response.json()
      console.log("AuthService: Login successful, received token")

      // Store token in localStorage and cookies for middleware
      this.setToken(data.token)

      // Create user object
      const authUser: AuthUser = {
        id: data.user.id,
        login: data.user.login,
        name: data.user.name || data.user.login,
        role: data.user.role,
        token: data.token,
      }

      // Store user data
      this.setUser(authUser)

      return authUser
    } catch (error) {
      console.error("AuthService: Login error details:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Unable to connect to the server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },

  // Logout function
  logout(): void {
    console.log("AuthService: Logging out user")
    this.removeToken()
    this.removeUser()

    // Also clear cookies for middleware
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  // Get current user
  getCurrentUser(): AuthUser | null {
    try {
      const userJson = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null
      if (!userJson) return null
      return JSON.parse(userJson)
    } catch (error) {
      console.error("AuthService: Error getting current user", error)
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
