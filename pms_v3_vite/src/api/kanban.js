import api from './axios'

export const getBoards = (projectId) => api.get('/kanban/boards', { params: { projectId } }).then(r => r.data)
export const getBoard = (boardId) => api.get(`/kanban/boards/${boardId}`).then(r => r.data)
export const createBoard = (payload) => api.post('/kanban/boards', payload).then(r => r.data)
export const createColumn = (boardId, payload) => api.post(`/kanban/boards/${boardId}/columns`, payload).then(r => r.data)
export const createCard = (payload) => api.post('/kanban/cards', payload).then(r => r.data)
export const updateCard = (cardId, payload) => api.put(`/kanban/cards/${cardId}`, payload).then(r => r.data)
export const moveCard = (payload) => api.post('/kanban/cards/move', payload).then(r => r.data)
export const deleteCard = (cardId) => api.delete(`/kanban/cards/${cardId}`).then(r => r.data)
