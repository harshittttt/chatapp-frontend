import axios from "axios";

// Create axios instance with admin token interceptor
const adminAxios = axios.create();

// Add request interceptor to attach admin token
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("chattu-admin-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default adminAxios;
