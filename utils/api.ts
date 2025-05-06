/**
 * API request utility function
 */

// Base API URL
const API_BASE_URL = "http://91.213.99.20:4000/api"

// Interface for API request options
interface ApiRequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  params?: Record<string, string>
}

/**
 * Makes an API request
 * @param endpoint API endpoint (can be a full URL or a path)
 * @param options Request options
 * @returns Promise with the response data
 */
export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  try {
    // Determine if the endpoint is a full URL or a path
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

    // Add query parameters if provided
    const urlWithParams = options.params
      ? `${url}${url.includes("?") ? "&" : "?"}${new URLSearchParams(options.params).toString()}`
      : url

    // Default headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: options.method || "GET",
      headers,
      credentials: "include",
    }

    // Add body if provided and method is not GET
    if (options.body && fetchOptions.method !== "GET") {
      fetchOptions.body = JSON.stringify(options.body)
    }

    // Make the request
    const response = await fetch(urlWithParams, fetchOptions)

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! Status: ${response.status}`,
      }))
      throw new Error(errorData.message || `Request failed with status: ${response.status}`)
    }

    // Parse and return the response
    const data = await response.json()
    return data as T
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

/**
 * Checks if the application is running in preview mode
 */
export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return true
  return (
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    process.env.NODE_ENV === "development"
  )
}
