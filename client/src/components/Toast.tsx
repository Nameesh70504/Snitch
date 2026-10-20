import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearToast } from '../app/uiSlice'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import type { RootState, ToastType } from '../types'
import type { AppDispatch } from '../app/store'

export const Toast = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useSelector((state: RootState) => state.ui)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast())
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast, dispatch])

  if (!toast) return null

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-positive" />,
    error: <AlertCircle className="w-4 h-4 text-critical" />,
    info: <Info className="w-4 h-4 text-ink" />,
  }

  const borderStyles: Record<ToastType, string> = {
    success: 'border-positive/30 bg-surface text-ink',
    error: 'border-critical/30 bg-surface text-ink',
    info: 'border-hairline bg-surface text-ink',
  }

  const type: ToastType = toast.type || 'info'

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className={`flex items-center gap-3 px-4 py-3 border shadow-xl ${borderStyles[type]}`}>
        {icons[type]}
        <span className="text-xs uppercase tracking-eyebrow font-medium">
          {toast.message}
        </span>
        <button
          onClick={() => dispatch(clearToast())}
          className="ml-2 text-ink-muted hover:text-ink transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
