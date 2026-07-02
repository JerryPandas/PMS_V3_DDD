import api from './axios'

export const getProjects = () => api.get('/projects').then(r => r.data)
export const getProjectDetail = (id) => api.get(`/projects/${id}`).then(r => r.data)
export const createProject = (payload) => api.post('/projects', payload).then(r => r.data)
export const updateProject = (id, payload) => api.put(`/projects/${id}`, payload).then(r => r.data)
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data)

export const addProjectItem = (projectId, payload) => api.post(`/projects/${projectId}/items`, payload).then(r => r.data)
export const updateProjectItem = (projectId, itemId, payload) => api.put(`/projects/${projectId}/items/${itemId}`, payload).then(r => r.data)
export const deleteProjectItem = (projectId, itemId) => api.delete(`/projects/${projectId}/items/${itemId}`).then(r => r.data)
