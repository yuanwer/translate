import * as React from "react"

const Alert = React.forwardRef(({ className = "", variant = "default", children, ...props }, ref) => {
  let variantClasses = ""
  if (variant === "destructive") {
    variantClasses = "bg-red-50 border-red-200 text-red-800"
  } else {
    variantClasses = "bg-blue-50 border-blue-200 text-blue-800"
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${variantClasses} ${className}`.trim()}
      {...props}
    >
      <div className="flex items-start gap-3">
        {children}
      </div>
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`.trim()}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm leading-relaxed ${className}`.trim()}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }