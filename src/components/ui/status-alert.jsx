import React from 'react'

const StatusAlert = React.forwardRef(({ className, variant = "info", icon, children, ...props }, ref) => {
  const smVariantClasses = {
    error: "sm-alert sm-alert--danger",
    warning: "sm-alert sm-alert--warning", 
    success: "sm-alert sm-alert--success",
    info: "sm-alert sm-alert--info",
    loading: "sm-alert sm-alert--info"
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
  const alertClass = smVariantClasses[variant]
  const textClass = textStyles[variant]

  return (
    <div
      ref={ref}
      className={`${alertClass} ${className || ''}`}
      {...props}
    >
      <div className="flex items-center gap-2">
        {iconClass && (
          <span className="inline-flex items-center justify-center w-5 h-5">
            <i className={`${iconClass} text-[14px] leading-none`}></i>
          </span>
        )}
        <span className={`${textClass} text-sm leading-5`}>
          {children}
        </span>
      </div>
    </div>
  )
})

StatusAlert.displayName = "StatusAlert"

export { StatusAlert }