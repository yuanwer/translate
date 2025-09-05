import React, { useState, useCallback } from 'react'
import { Toast, ToastContainer } from '../components/ui/toast'
import { ToastContext } from './toastContext'

let toastId = 0

export const ToastProvider = ({ children, position = "bottom-center" }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((message, options = {}) => {
    const {
      variant = "default",
      duration = 3000,
      ...otherOptions
    } = options

    const id = ++toastId
    const toast = {
      id,
      message,
      variant,
      duration,
      ...otherOptions
    }

    setToasts(prevToasts => [...prevToasts, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  const success = useCallback((message, options = {}) => {
    return showToast(message, { variant: "success", ...options })
  }, [showToast])

  const error = useCallback((message, options = {}) => {
    return showToast(message, { variant: "error", ...options })
  }, [showToast])

  const warning = useCallback((message, options = {}) => {
    return showToast(message, { variant: "warning", ...options })
  }, [showToast])

  const info = useCallback((message, options = {}) => {
    return showToast(message, { variant: "info", ...options })
  }, [showToast])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  const contextValue = {
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll,
    toasts
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            duration={0}
            onClose={() => removeToast(toast.id)}
          >
            {toast.message}
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}