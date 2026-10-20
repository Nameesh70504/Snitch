import axiosClient from '../../../api/axiosClient'
import type { CartApiResponse } from '../../../types'

interface CartMutationResponse {
  message: string
}

export const cartApi = {
  getCart: async (): Promise<CartApiResponse> => {
    return await axiosClient.get('/cart') as unknown as CartApiResponse
  },

  addToCart: async (productId: string, { size, quantity = 1 }: { size: string; quantity?: number }): Promise<CartMutationResponse> => {
    return await axiosClient.post(`/cart/${productId}`, { size, quantity }) as unknown as CartMutationResponse
  },

  removeFromCart: async (productId: string, { size, quantity = 1 }: { size: string; quantity?: number }): Promise<CartMutationResponse> => {
    return await axiosClient.delete(`/cart/${productId}`, {
      data: { size, quantity },
    }) as unknown as CartMutationResponse
  },
}
