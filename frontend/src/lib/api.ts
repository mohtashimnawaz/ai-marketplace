import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Models
export const fetchModels = async () => {
  const { data } = await api.get('/api/models')
  return data.models
}

export const fetchModel = async (modelId: string) => {
  const { data } = await api.get(`/api/models/${modelId}`)
  return data
}

export const fetchModelsByCreator = async (creatorPubkey: string) => {
  const { data } = await api.get(`/api/models/creator/${creatorPubkey}`)
  return data.models
}

// Inference
export const runInference = async (modelId: string, inputs: any, userPubkey: string) => {
  const { data } = await api.post(`/api/inference/${modelId}`, {
    inputs,
    userPubkey,
  })
  return data
}

export const fetchInferenceHistory = async (userPubkey: string) => {
  const { data } = await api.get(`/api/inference/history/${userPubkey}`)
  return data.history
}

// Upload
export const uploadModel = async (file: File, creatorPubkey: string, storageType: string = 'ipfs') => {
  const formData = new FormData()
  formData.append('model', file)
  formData.append('creatorPubkey', creatorPubkey)
  formData.append('storageType', storageType)

  const { data } = await api.post('/api/upload/model', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export const uploadMetadata = async (metadata: any) => {
  const { data } = await api.post('/api/upload/metadata', metadata)
  return data
}

// Access
export const checkAccess = async (userPubkey: string, modelId: string) => {
  const { data } = await api.get(`/api/access/check/${userPubkey}/${modelId}`)
  return data
}

export const fetchUserAccess = async (userPubkey: string) => {
  const { data } = await api.get(`/api/access/user/${userPubkey}`)
  return data.accessRecords
}

export const generateDownloadUrl = async (modelId: string, userPubkey: string) => {
  const { data } = await api.post(`/api/access/download/${modelId}`, {
    userPubkey,
  })
  return data
}

export default api
