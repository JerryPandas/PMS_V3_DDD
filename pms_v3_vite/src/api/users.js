import api from './axios'

export const getUsers = () => api.get('/users').then(r => r.data)
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role }).then(r => r.data)
export const updateUserActive = (id, isActive) => api.put(`/users/${id}/active`, { isActive }).then(r => r.data)
