import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => localStorage.removeItem('access_token'),
  getCurrentUser: () => api.get('/me'),
}

// Project APIs
export const projectApi = {
  create: (data) => api.post('/projects', data),
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

// Generation APIs
export const generateApi = {
  generate: (data) => api.post('/generate', data),
  regenerate: (data) => api.post('/generate/regenerate', data),
}

// Version APIs
export const versionApi = {
  list: (projectId) => api.get(`/projects/${projectId}/versions`),
  get: (projectId, versionId) => api.get(`/projects/${projectId}/versions/${versionId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/versions`, data),
  delete: (projectId, versionId) => api.delete(`/projects/${projectId}/versions/${versionId}`),
}

// Export APIs
export const exportApi = {
  export: (data) => api.post('/export', data),
}

export default api
