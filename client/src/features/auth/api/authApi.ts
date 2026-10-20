import axiosClient from '../../../api/axiosClient'
import type { LoginCredentials, RegisterData, AuthResponse, MeResponse } from '../../../types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return await axiosClient.post('/auth/login', credentials) as unknown as AuthResponse
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    return await axiosClient.post('/auth/register', userData) as unknown as AuthResponse
  },

  getMe: async (): Promise<MeResponse> => {
    return await axiosClient.get('/auth/me') as unknown as MeResponse
  },
}