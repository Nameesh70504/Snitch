import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import {
  fetchOrders,
  placeOrder,
  cancelOrderAction,
  updateOrderStatusAction,
  setCurrentOrder,
  clearOrderError,
} from '../state/orderSlice'
import type { RootState, Order, OrderAddress, OrderStatus } from '../../../types'
import type { AppDispatch } from '../../../app/store'

export const useOrders = (autoFetch = false) => {
  const dispatch = useDispatch<AppDispatch>()
  const { orders, currentOrder, isLoading, error } = useSelector(
    (state: RootState) => state.orders
  )
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (autoFetch && isAuthenticated && orders.length === 0 && !isLoading) {
      dispatch(fetchOrders())
    }
  }, [dispatch, autoFetch, isAuthenticated, orders.length, isLoading])

  const loadOrders = useCallback(() => {
    if (isAuthenticated) return dispatch(fetchOrders())
  }, [dispatch, isAuthenticated])

  const checkout = useCallback(
    async (address: OrderAddress): Promise<Order | null> => {
      const resultAction = await dispatch(placeOrder(address))
      if (placeOrder.fulfilled.match(resultAction)) return resultAction.payload
      return null
    },
    [dispatch]
  )

  const cancelOrder = useCallback(
    async (orderId: string) => {
      const resultAction = await dispatch(cancelOrderAction(orderId))
      return cancelOrderAction.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const resultAction = await dispatch(updateOrderStatusAction({ orderId, status }))
      return updateOrderStatusAction.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  const selectOrder = useCallback(
    (order: Order) => { dispatch(setCurrentOrder(order)) },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch(clearOrderError())
  }, [dispatch])

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    loadOrders,
    checkout,
    cancelOrder,
    updateStatus,
    selectOrder,
    clearError,
  }
}
