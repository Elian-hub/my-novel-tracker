import axios from "axios";
import {
  clearSessionData,
  getAccessToken,
  getRefreshToken,
  logoutUser,
  setAccessToken,
} from "./localStorageService";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

let isRefreshing = false; // Flag to prevent multiple simultaneous refresh requests
let refreshSubscribers = []; // Store callbacks for pending requests

// Notify all subscribers with the new token
const onTokenRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    } catch (error) {
      console.error("Error retrieving access token:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response, // Return the response if it's successful
  async (error) => {
    const originalRequest = error.config;

    const refreshTokenUrl = "/api/auth/token/refresh";

    // Check for refresh token failure
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      originalRequest.url === refreshTokenUrl
    ) {
      isRefreshing = false;
      clearSessionData();
      window.location.href = "/";
      return Promise.reject(error);
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest?._retry
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue the request
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Refreshing token...");
        const response = await axiosInstance.post(refreshTokenUrl, {
          refreshToken: getRefreshToken(),
        });

        const newAccessToken = response?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken); // Save the new access token
          onTokenRefreshed(newAccessToken); // Notify all pending requests
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest); // Retry the original request
        } else {
          throw new Error("Failed to refresh token.");
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        isRefreshing = false;
        clearSessionData();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // Reject other errors
  }
);

export default axiosInstance;
