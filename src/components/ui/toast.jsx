import * as React from "react"
import { useTranslation } from 'react-i18next'

const Toast = React.forwardRef(({ 
  className = "", 
  variant = "default", 
  children, 
  onClose,
  duration = 3000,
  ...props 
}, ref) => {
  const { t } = useTranslation()
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  let variantClasses = ""
  
  switch (variant) {
    case "success":
      variantClasses = "sm-toast sm-toast--success"
      break
    case "error":
      variantClasses = "sm-toast sm-toast--danger"
      break
    case "warning":
      variantClasses = "sm-toast sm-toast--warning"
      break
    case "info":
      variantClasses = "sm-toast sm-toast--info"
      break
    default:
      variantClasses = "sm-toast sm-toast--default"
  }

  return (
    <div
      ref={ref}
      className={`
        relative w-full max-w-sm mx-auto mb-3 px-7 py-2.5
        animate-in fade-in duration-200 sm-appear
        ${variantClasses} ${className}
      `.trim()}
      {...props}
    >
      <div className="relative w-full flex items-center justify-center">
        <div className="sm-toast__content text-center text-[13px] leading-6">
          {children}
        </div>
        <button
          onClick={onClose}
          className="sm-toast__close absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
          aria-label={t('common.close')}
        >
          <i className="fas fa-times text-[10px]"></i>
        </button>
      </div>
    </div>
  )
})
Toast.displayName = "Toast"

const ToastContainer = ({ children, position = "top-right" }) => {
  let positionClasses = ""
  
  switch (position) {
    case "top-left":
      positionClasses = "top-4 left-4"
      break
    case "top-center":
      positionClasses = "top-4 left-1/2 transform -translate-x-1/2"
      break
    case "top-right":
      positionClasses = "top-4 right-4"
      break
    case "bottom-left":
      positionClasses = "bottom-4 left-4"
      break
    case "bottom-center":
      positionClasses = "bottom-4 left-1/2 transform -translate-x-1/2"
      break
    case "bottom-right":
      positionClasses = "bottom-4 right-4"
      break
    default:
      positionClasses = "top-4 right-4"
  }

  return (
    <div className={`fixed ${positionClasses} z-50 pointer-events-none`}>
      <div className="pointer-events-auto space-y-2">
        {children}
      </div>
    </div>
  )
}

export { Toast, ToastContainer }