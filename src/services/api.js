import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/ld+json",
    "Accept": "application/ld+json"
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* HELPER PATCH FIX */
const patchConfig = {
  headers: {
    "Content-Type": "application/merge-patch+json"
  }
}

/* 
   PÉRIODES */
export const periodeService = {
  getAll: () => api.get('/periodes/all'),
  getOne: (id) => api.get(`/periodes/${id}`),
  create: (data) => api.post('/periodes', data),
  update: (id, data) => api.patch(`/periodes/${id}`, data, patchConfig),
  delete: (id) => api.delete(`/periodes/${id}`)
}

/* MATIÈRES */
export const matiereService = {
  getAll: () => api.get('/matieres/all'),
  getOne: (id) => api.get(`/matieres/${id}`),
  create: (data) => api.post('/matieres', data),
  update: (id, data) => api.patch(`/matieres/${id}`, data, patchConfig),
  delete: (id) => api.delete(`/matieres/${id}`)
}

/* ENSEIGNANTS */
export const enseignantService = {
  getAll: () => api.get('/enseignants/all'),
  getOne: (id) => api.get(`/enseignants/${id}`),
  create: (data) => api.post('/enseignants', data),
  update: (id, data) => api.patch(`/enseignants/${id}`, data, patchConfig),
  delete: (id) => api.delete(`/enseignants/${id}`)
}

/* FILIÈRES  */
export const filiereService = {
  getAll: () => api.get('/filieres/all'),
  getOne: (id) => api.get(`/filieres/${id}`),
  create: (data) => api.post('/filieres', data),
  update: (id, data) => api.patch(`/filieres/${id}`, data, patchConfig),
  delete: (id) => api.delete(`/filieres/${id}`)
}

/* ÉTUDIANTS */
export const etudiantService = {
  getAll: () => api.get('/etudiants/all'),
  getOne: (id) => api.get(`/etudiants/${id}`),
  create: (data) => api.post('/etudiants', data),
  update: (id, data) => api.patch(`/etudiants/${id}`, data, patchConfig),
  delete: (id) => api.delete(`/etudiants/${id}`)
}

/* JUSTIFICATIONS  */
export const justificationService = {
  getAll: () => api.get('/justifications/all'),
  getOne: (id) => api.get(`/justifications/${id}`),
  create: (data) => api.post('/justifications', data),
  update: (id, data) => api.patch(`/justifications/${id}`, data, patchConfig),
  delete: (id) => api.delete(`/justifications/${id}`)
}

/* 
   PRESENCES  */
export const presenceService = {
  getAll: () => api.get('/presences/all'),
  getOne: (id) => api.get(`/presences/${id}`),

  create: (data) => api.post('/presences', data),

  // pour justifier ou modifier statut
  justifier: (id, data) =>
    api.patch(`/presences/${id}`, data, patchConfig),

  update: (id, data) =>
    api.patch(`/presences/${id}`, data, patchConfig),

  delete: (id) => api.delete(`/presences/${id}`)
}



/* 
   ENSEIGNEMENT  */
export const enseignementCreateService = {
  getAll: () => api.get('/enseignements/all'),
  getOne: (id) => api.get(`/enseignements/${id}`),

  create: (data) => api.post('/enseignements', data),

  // pour justifier ou modifier statut
  justifier: (id, data) =>
    api.patch(`/enseignements/${id}`, data, patchConfig),

  update: (id, data) =>
    api.patch(`/enseignements/${id}`, data, patchConfig),

  delete: (id) => api.delete(`/enseignements/${id}`)
}

export default api