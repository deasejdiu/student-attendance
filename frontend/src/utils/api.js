import axios from "axios";
import dayjs from "dayjs";

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: "http://localhost:3000/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL
    });
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      baseURL: response.config.baseURL
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      baseURL: error.config?.baseURL
    });

    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Create axios instance for export service
const exportServiceAxios = axios.create({
  baseURL: "http://localhost:4500/api",
  headers: {
    "Content-Type": "application/json",
  },
});

exportServiceAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export service endpoints
const exports = {
  create: (exportData) => exportServiceAxios.post("/exports", exportData),
  getAll: () => exportServiceAxios.get("/exports"),
  getStatus: (exportId) => exportServiceAxios.get(`/exports/${exportId}`),
  download: async (downloadUrl, studentId) => {
    const response = await exportServiceAxios.post(
      downloadUrl,
      {},
      {
        responseType: "blob", // Ensure the response is treated as a blob
      }
    );

    if (!response || response.status !== 200) {
      throw new Error("Failed to download export");
    }

    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = dayjs().format("YYYY-MM-DD_HH:mm:ss");
    a.href = url;
    a.download = `attendance_${studentId}_${timestamp}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

// API request methods
const apiService = {
  // Registers endpoints
  registers: {
    getAll: () => api.get("/registers"),
    getById: (id) => api.get(`/registers/${id}`),
    create: (data) => api.post("/registers", data),
    update: (id, data) => api.put(`/registers/${id}`, data),
    delete: (id) => api.delete(`/registers/${id}`),
    getToday: () => api.get("/registers/today"),
  },

  // Users endpoints
  users: {
    login: (credentials) => api.post("/users/login", credentials),
    register: (userData) => api.post("/users/register", userData),
    getProfile: () => api.get("/users/profile"),
    getAll: () => api.get("/users"),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    search: (query) =>
      api.get(`/users/search?query=${encodeURIComponent(query)}`),
  },

  // Students endpoints
  students: {
    getAll: () => api.get("/students"),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post("/students", data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    getAttendance: (id) => api.get(`/students/${id}/attendance`),
    search: (query) =>
      api.get(`/students/search?query=${encodeURIComponent(query)}`),
  },

  // Export service endpoints
  exports,
};

export default apiService;
