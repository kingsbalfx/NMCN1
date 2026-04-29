import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true // ensure cookies are sent (HttpOnly token)
});

// Attach Authorization header from localStorage for backward compatibility.
api.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Global response handler — handle 401 centrally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
