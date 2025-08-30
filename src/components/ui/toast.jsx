import * as React from "react"

const Toast = React.forwardRef(({ 
  className = "", 
  variant = "default", 
  children, 
  onClose,
  duration = 3000,
  ...props 
}, ref) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  let variantClasses = ""
  let iconClass = ""
  
  switch (variant) {
    case "success":
      variantClasses = "bg-green-50 border-green-200 text-green-800"
      iconClass = "fas fa-check-circle text-green-500"
      break
    case "error":
      variantClasses = "bg-red-50 border-red-200 text-red-800"
      iconClass = "fas fa-exclamation-circle text-red-500"
      break
    case "warning":
      variantClasses = "bg-yellow-50 border-yellow-200 text-yellow-800"
      iconClass = "fas fa-exclamation-triangle text-yellow-500"
      break
    case "info":
      variantClasses = "bg-blue-50 border-blue-200 text-blue-800"
      iconClass = "fas fa-info-circle text-blue-500"
      break
    default:
      variantClasses = "bg-gray-50 border-gray-200 text-gray-800"
      iconClass = "fas fa-info-circle text-gray-500"
  }

  return (
    <div
      ref={ref}
      className={`
        relative w-full max-w-sm mx-auto mb-4 p-4 rounded-lg border shadow-lg
        animate-in slide-in-from-top-2 fade-in duration-300
        ${variantClasses} ${className}
      `.trim()}
      {...props}
    >
      <div className="flex items-start gap-3">
        <i className={`${iconClass} text-sm mt-0.5 flex-shrink-0`}></i>
        <div className="flex-1 text-sm leading-relaxed">
          {children}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="关闭"
        >
          <i className="fas fa-times text-xs"></i>
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