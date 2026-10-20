import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiError } from '../types'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach Bearer Token from localStorage
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config 
  },
  (error: unknown) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle errors uniformly
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data 
  },
  (error: unknown) => {
    const axiosErr = error as { response?: { status?: number; data?: { message?: string; errors?: Array<{ message: string }> } }; message?: string }
    const status = axiosErr.response?.status
    const message = axiosErr.response?.data?.message || axiosErr.message || 'An unexpected error occurred'
    
    // If unauthorized and token exists, clear invalid token
    if (status === 401) {
      localStorage.removeItem('token')
    }

    return Promise.reject({
      status,
      message,
      errors: axiosErr.response?.data?.errors,
      originalError: error,
    } satisfies ApiError)
  }
)

export default axiosClient
