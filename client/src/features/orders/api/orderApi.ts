import axiosClient from '../../../api/axiosClient'
import type { Order, OrderAddress } from '../../../types'

interface OrdersResponse {
  data: { orders: Order[] }
}

interface OrderResponse {
  data: { order: Order }
}

export const orderApi = {
  createOrder: async (address: OrderAddress): Promise<OrderResponse> => {
    return await axiosClient.post('/orders', { address }) as unknown as OrderResponse
  },

  getOrders: async (): Promise<OrdersResponse> => {
    return await axiosClient.get('/orders') as unknown as OrdersResponse
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    await axiosClient.patch(`/orders/${orderId}/cancel`)
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    await axiosClient.patch(`/orders/${orderId}/status`, { status })
  },
}
