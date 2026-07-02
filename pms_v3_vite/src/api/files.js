import api from './axios'

export const getFiles = (projectId) => api.get(`/files/project/${projectId}`).then(r => r.data)
export const uploadFile = (projectId, file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/files/project/${projectId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  }).then(r => r.data)
}
export const deleteFile = (fileId) => api.delete(`/files/${fileId}`).then(r => r.data)
