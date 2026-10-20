import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logout,
  clearAuthError,
} from '../state/authSlice'
import type { RootState, LoginCredentials, RegisterData } from '../../../types'
import type { AppDispatch } from '../../../app/store'

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  )

  useEffect(() => {
    if (token && !user && !isLoading) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, token, user, isLoading])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const resultAction = await dispatch(loginUser(credentials))
      return loginUser.fulfilled.match(resultAction)
    },
    [dispatch]
  )
 
  const register = useCallback(
    async (userData: RegisterData) => {
      const resultAction = await dispatch(registerUser(userData))
      return registerUser.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  const signOut = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  return {
    user,
    token,
    isAuthenticated,
    isSeller: user?.role === 'seller',
    isLoading,
    error,
    login,
    register,
    signOut,
    clearError,
  }
}
