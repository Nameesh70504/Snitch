import axiosClient from '../../../api/axiosClient'
import type { Product } from '../../../types'

interface ProductsResponse {
  data: {
    products: Product[]
    totalPages: number
    currentPage: number
  }
}

interface ProductMutationResponse {
  data: {
    product: Product
  }
}

export const productApi = {
  getProducts: async (page: number = 1): Promise<ProductsResponse> => {
    return await axiosClient.get(`/products?page=${page}`) as unknown as ProductsResponse
  },

  getSellerProducts: async (page: number = 1): Promise<ProductsResponse> => {
    return await axiosClient.get(`/products/seller?page=${page}`) as unknown as ProductsResponse
  },

  createProduct: async (formData: FormData): Promise<ProductMutationResponse> => {
    return await axiosClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as unknown as ProductMutationResponse
  },

  updateProduct: async (id: string, formData: FormData): Promise<ProductMutationResponse> => {
    return await axiosClient.patch(`/products/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as unknown as ProductMutationResponse
  },

  deleteProductImage: async (productId: string, imageId: string): Promise<void> => {
    await axiosClient.delete(`/products/image/${productId}/${imageId}`)
  },

  togglePublishProduct: async (productId: string): Promise<ProductMutationResponse> => {
    return await axiosClient.patch(`/products/publish/${productId}`) as unknown as ProductMutationResponse
  },
}
