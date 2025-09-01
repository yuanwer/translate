import React from 'react'

const StatusAlert = React.forwardRef(({ className, variant = "info", icon, children, ...props }, ref) => {
  const variantStyles = {
    error: "bg-red-50 border-l-4 border-red-400",
    warning: "bg-yellow-50 border-l-4 border-yellow-400", 
    success: "bg-green-50 border-l-4 border-green-400",
    info: "bg-blue-50 border-l-4 border-blue-400",
    loading: "bg-blue-50 border-l-4 border-blue-400"
  }

  const iconStyles = {
    error: "fas fa-exclamation-triangle text-red-600",
    warning: "fas fa-exclamation-triangle text-yellow-600",
    success: "fas fa-check-circle text-green-600",
    info: "fas fa-info-circle text-blue-600",
    loading: "fas fa-spinner fa-spin text-blue-600"
  }

  const textStyles = {
    error: "text-red-800",
    warning: "text-yellow-800", 
    success: "text-green-800",
    info: "text-blue-800",
    loading: "text-blue-800"
  }

  const iconClass = icon || iconStyles[variant]
  const alertClass = variantStyles[variant]
  const textClass = textStyles[variant]

  return (
    <div
      ref={ref}
      className={`${alertClass} p-3 ${className || ''}`}
      {...props}
    >
      <div className="flex items-center">
        {iconClass && <i className={`${iconClass} mr-2`}></i>}
        <span className={`${textClass} text-sm`}>
          {children}
        </span>
      </div>
    </div>
  )
})

StatusAlert.displayName = "StatusAlert"

export { StatusAlert }