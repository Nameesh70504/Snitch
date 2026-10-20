import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartApi } from '../api/cartApi'
import type { CartState, CartApiResponse, ApiError } from '../../../types'

export const fetchCart = createAsyncThunk<CartApiResponse, void, { rejectValue: string }>(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await cartApi.getCart()
    } catch (err) {
      return rejectWithValue((err as ApiError).message || 'Failed to fetch cart')
    }
  }
)

export const addToCartAction = createAsyncThunk<
  unknown,
  { productId: string; size: string; quantity: number },
  { dispatch: { (arg: ReturnType<typeof fetchCart>): unknown }; rejectValue: string }
>(
  'cart/addToCartAction',
  async ({ productId, size, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.addToCart(productId, { size, quantity })
      await dispatch(fetchCart())
      return response
    } catch (err) {
      return rejectWithValue((err as ApiError).message || 'Failed to add item to bag')
    }
  }
)

export const removeFromCartAction = createAsyncThunk<
  unknown,
  { productId: string; size: string; quantity: number },
  { dispatch: { (arg: ReturnType<typeof fetchCart>): unknown }; rejectValue: string }
>(
  'cart/removeFromCartAction',
  async ({ productId, size, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(productId, { size, quantity })
      await dispatch(fetchCart())
      return response
    } catch (err) {
      return rejectWithValue((err as ApiError).message || 'Failed to remove item from bag')
    }
  }
)

const initialState: CartState = {
  cart: null,
  items: [],
  totalPrice: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null
      state.items = []
      state.totalPrice = 0
      state.itemCount = 0
      state.error = null
    },
    clearCartError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        const cartData = action.payload?.cart
        state.cart = cartData ?? null
        state.items = cartData?.products || []
        state.totalPrice = action.payload?.totalPrice || 0
        state.itemCount = state.items.reduce((acc, item) => acc + (item.quantity || 0), 0)
        state.error = null
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? null
      })
      .addCase(addToCartAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCartAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? null
      })
      .addCase(removeFromCartAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeFromCartAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? null
      })
  },
})

export const { clearCart, clearCartError } = cartSlice.actions
export default cartSlice.reducer
