import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../api/authApi'
import type { AuthState, LoginCredentials, RegisterData, ApiError } from '../../../types'

const savedToken = localStorage.getItem('token')

export const loginUser = createAsyncThunk<
  { token: string; user: { _id: string; name: string; email: string; role: 'user' | 'seller' } },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      return response
    } catch (err) {
      return rejectWithValue((err as ApiError).message || 'Login failed')
    }
  }
)
 
export const registerUser = createAsyncThunk<
  { token: string; user: { _id: string; name: string; email: string; role: 'user' | 'seller' } },
  RegisterData,
  { rejectValue: string }
>(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData)
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      return response
    } catch (err) {
      return rejectWithValue((err as ApiError).message || 'Registration failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk<
  { _id: string; name: string; email: string; role: 'user' | 'seller' },
  void,
  { rejectValue: string }
>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe()
      return response.user
    } catch (err) {
      localStorage.removeItem('token')
      return rejectWithValue((err as ApiError).message || 'Failed to authenticate')
    }
  }
)

const initialState: AuthState = {
  user: null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token')
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.isLoading = false
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.error = action.payload ?? null
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.error = action.payload ?? null
      })

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.token = null
        state.user = null
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
