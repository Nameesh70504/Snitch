import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { orderApi } from '../api/orderApi'
import { clearCart } from '../../cart/state/cartSlice'
import type { OrderState, Order, OrderAddress, OrderStatus, ApiError } from '../../../types'

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrders()
      return response.data.orders
    } catch (err) {
      return rejectWithValue((err as ApiError).message || 'Failed to fetch orders')
    }
  }
)

export const placeOrder = createAsyncThunk<
  Order,
  OrderAddress,
  { rejectValue: string }
>(
  'orders/placeOrder',
  async (address, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderApi.createOrder(address)
      dispatch(clearCart())
      return response.data.order
    } catch (err) {
      const e = err as ApiError
      const msg = e.errors?.length
        ? e.errors.map((er) => er.message).join(', ')
        : e.message || 'Failed to place order'
      return rejectWithValue(msg)
    }
  }
)

export const cancelOrderAction = createAsyncThunk<string, string, { rejectValue: string }>(
  'orders/cancelOrderAction',
  async (orderId, { rejectWithValue }) => {
    try {
      await orderApi.cancelOrder(orderId)
      return orderId
    } catch (err) {
      return rejectWithValue((err as ApiError).message || 'Failed to cancel order')
    }
  }
)

export const updateOrderStatusAction = createAsyncThunk<
  { orderId: string; status: OrderStatus },
  { orderId: string; status: OrderStatus },
  { rejectValue: string }
>(
  'orders/updateOrderStatusAction',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      await orderApi.updateOrderStatus(orderId, status)
      return { orderId, status }
    } catch (err) {
      return rejectWithValue((err as ApiError).message || 'Failed to update order status')
    }
  }
)

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    clearOrderError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload || []
        state.error = null
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) ?? action.error.message ?? null
      })

    builder
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload
        state.orders.unshift(action.payload)
        state.error = null
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) ?? action.error.message ?? null
      })

    builder.addCase(cancelOrderAction.fulfilled, (state, action) => {
      const order = state.orders.find((o) => o._id === action.payload)
      if (order) order.status = 'CANCELLED'
      if (state.currentOrder?._id === action.payload) {
        state.currentOrder.status = 'CANCELLED'
      }
    })

    builder.addCase(updateOrderStatusAction.fulfilled, (state, action) => {
      const order = state.orders.find((o) => o._id === action.payload.orderId)
      if (order) order.status = action.payload.status
    })
  },
})

export const { setCurrentOrder, clearCurrentOrder, clearOrderError } = orderSlice.actions
export default orderSlice.reducer
