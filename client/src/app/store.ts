import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/state/authSlice'
import productReducer from '../features/products/state/productSlice'
import cartReducer from '../features/cart/state/cartSlice'
import orderReducer from '../features/orders/state/orderSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    ui: uiReducer,
  },
  devTools: import.meta.env.DEV,
})

export type AppDispatch = typeof store.dispatch

export default store
 