import axios from "axios";
import { logoutUser } from "./localStorageService";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const refreshTokenUrl = "/api/users/token/refresh"; // Consider storing this in a config file

    // Check for refresh token failure
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      originalRequest.url === refreshTokenUrl
    ) {
      // Refresh token failed
      await logoutUser();
      window.location.href = "/"; // Redirect to login or home page
      return Promise.reject(error);
    }

    // Handle token expiration case
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {
        console.log("Attempting to refresh token...");
        const response = await axiosInstance.post(refreshTokenUrl); // Server will use cookies for refresh
        const newAccessToken = response?.data?.accessToken;

        if (newAccessToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest); // Retry original request
        } else {
          // No new token received; log out the user
          await logoutUser();
          window.location.href = "/"; // Redirect to login or home page
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        await logoutUser();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    // Return rejected promise if other errors occur
    return Promise.reject(error);
  }
);

export default axiosInstance;
