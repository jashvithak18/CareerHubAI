import axios from "axios";
import { auth } from "../firebase/firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://careerhubai.onrender.com/api",
});

// Request interceptor to automatically attach authorization tokens
api.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    
    // 1. Try to fetch current Firebase User ID Token (Student)
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        token = await currentUser.getIdToken();
      } catch (err) {
        console.error("Error fetching Firebase token:", err);
      }
    }

    // 2. Fall back to local storage admin JWT token
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("adminToken");
    }

    // Attach token if present
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
