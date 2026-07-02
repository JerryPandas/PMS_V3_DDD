import api from './axios'

export const getPeople = () => api.get('/personnel').then(r => r.data)
export const createPerson = (payload) => api.post('/personnel', payload).then(r => r.data)
export const updatePerson = (id, payload) => api.put(`/personnel/${id}`, payload).then(r => r.data)
export const deletePerson = (id) => api.delete(`/personnel/${id}`).then(r => r.data)
