import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import {
  fetchSellerProducts,
  createProductAction,
  updateProductAction,
  togglePublishAction,
  deleteImageAction,
} from '../state/productSlice'
import type { RootState, Product } from '../../../types'
import type { AppDispatch } from '../../../app/store'

export const useSellerProducts = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    sellerItems,
    sellerTotalPages,
    sellerCurrentPage,
    isSellerLoading,
    sellerError,
  } = useSelector((state: RootState) => state.products)

  const loadSellerProducts = useCallback(
    (page = 1) => dispatch(fetchSellerProducts(page)),
    [dispatch]
  )

  const createProduct = useCallback(
    async (formData: FormData): Promise<Product | false> => {
      const resultAction = await dispatch(createProductAction(formData))
      return createProductAction.fulfilled.match(resultAction) ? resultAction.payload : false
    },
    [dispatch]
  )

  const updateProduct = useCallback(
    async (id: string, formData: FormData): Promise<Product | false> => {
      const resultAction = await dispatch(updateProductAction({ id, formData }))
      return updateProductAction.fulfilled.match(resultAction) ? resultAction.payload : false
    },
    [dispatch]
  )

  const togglePublish = useCallback(
    async (productId: string): Promise<boolean> => {
      const resultAction = await dispatch(togglePublishAction(productId))
      return togglePublishAction.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  const deleteImage = useCallback(
    async (productId: string, imageId: string): Promise<boolean> => {
      const resultAction = await dispatch(deleteImageAction({ productId, imageId }))
      return deleteImageAction.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  return {
    sellerProducts: sellerItems,
    totalPages: sellerTotalPages,
    currentPage: sellerCurrentPage,
    isLoading: isSellerLoading,
    error: sellerError,
    loadSellerProducts,
    createProduct,
    updateProduct,
    togglePublish,
    deleteImage,
  }
}
