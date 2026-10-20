import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UiState, Toast, AuthModalView } from '../types'

const initialState: UiState = {
  isCartDrawerOpen: false,
  isAuthModalOpen: false,
  authModalView: 'login',
  mobileMenuOpen: false,
  toast: null,
}
 
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true
    },
    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false
    },
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen
    },
    openAuthModal: (state, action: PayloadAction<AuthModalView | undefined>) => {
      state.isAuthModalOpen = true
      state.authModalView = action.payload || 'login'
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false
    },
    setAuthModalView: (state, action: PayloadAction<AuthModalView>) => {
      state.authModalView = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false
    },
    showToast: (state, action: PayloadAction<Toast>) => {
      state.toast = action.payload
    },
    clearToast: (state) => {
      state.toast = null
    },
  },
})

export const {
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  openAuthModal,
  closeAuthModal,
  setAuthModalView,
  toggleMobileMenu,
  closeMobileMenu,
  showToast,
  clearToast,
} = uiSlice.actions

export default uiSlice.reducer
