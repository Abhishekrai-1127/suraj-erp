import axios from "axios";

/**
 * Server-Side Backend API Gateway.
 * This runs exclusively on the Node.js server environment in Next.js API route handlers.
 * It keeps backend IPs, credentials, tokens, and internal endpoints completely hidden from the client browser.
 */
const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api/v1";

export const serverApiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
});

/**
 * Server helper to forward requests to Central ERP backend with authorization and query params.
 */
export async function forwardToBackend({ method, path, data = null, params = {}, headers = {} }) {
  const requestHeaders = { ...headers };

  // Forward bearer token if provided from incoming Next.js request headers
  if (headers.authorization) {
    requestHeaders.Authorization = headers.authorization;
  }

  const isBodyAllowed = method !== "GET" && method !== "HEAD";
  const hasBody = isBodyAllowed && data !== null && data !== undefined;

  const axiosConfig = {
    method,
    url: path,
    params,
    headers: requestHeaders,
  };

  if (hasBody) {
    axiosConfig.data = data;
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
  } else {
    delete requestHeaders["Content-Type"];
    delete requestHeaders["content-type"];
  }

  try {
    const response = await serverApiClient.request(axiosConfig);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || {
      success: false,
      message: error.message || "Failed to communicate with backend server.",
      isNetworkError: !error.response,
    };

    return {
      status,
      data: errorData,
      isError: true,
      isNetworkError: !error.response,
    };
  }
}
