import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data)
}

export const adminService = {
  getSummary: () => api.get('/admin/summary'),
  getUsers: () => api.get('/admin/users'),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, payload) => api.put(`/admin/orders/${id}/status`, payload)
}

export const analyticsService = {
  registerVisit: (payload) => api.post('/analytics/visit', payload),
  registerProductView: (id) => api.post(`/analytics/products/${id}/view`)
}

export default api
