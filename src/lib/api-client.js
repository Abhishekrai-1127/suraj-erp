import axios from "axios";

/**
 * Standard Client-Side API Gateway.
 * Routes all requests securely through Next.js server-side API handlers (/api/*).
 * This ensures backend host URLs, IP addresses, and sensitive infrastructure details
 * are NEVER exposed directly in client browser bundles or network calls.
 */
const API_BASE_URL = "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Bearer Authorization Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const storedToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("suraj_erp_access_token");
      // A previous failed login can leave the literal strings "null" or
      // "undefined" in storage. Never forward them as a malformed Bearer token.
      const token =
        storedToken && storedToken !== "null" && storedToken !== "undefined"
          ? storedToken
          : "";
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap standardized response envelope and normalize errors
apiClient.interceptors.response.use(
  (response) => {
    // Central ERP wraps successful responses in `{ success, data }`. Return the
    // payload itself so list services can consistently extract their array from
    // `payload.data`, while single-record services receive the record directly.
    if (response.data?.success === true && "data" in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const errorData = error?.response?.data;
    const errorMessage =
      errorData?.message ||
      errorData?.error ||
      error?.message ||
      "An unexpected server error occurred.";

    // Normalize error object for callers
    const normalizedError = {
      message: errorMessage,
      statusCode: error?.response?.status || 500,
      details: errorData,
      isNetworkError: !error?.response,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
