import * as React from "react"

const Button = React.forwardRef(({ className = "", variant = "default", size = "default", ...props }, ref) => {
  let baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed"
  
  let variantClasses = ""
  if (variant === "default") {
    variantClasses = "bg-blue-600 text-white hover:bg-blue-700"
  } else if (variant === "destructive") {
    variantClasses = "bg-red-600 text-white hover:bg-red-700"
  } else if (variant === "outline") {
    variantClasses = "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  } else if (variant === "secondary") {
    variantClasses = "bg-gray-100 text-gray-900 hover:bg-gray-200"
  } else if (variant === "ghost") {
    variantClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
  }
  
  let sizeClasses = ""
  if (size === "sm") {
    sizeClasses = "text-sm px-3 py-2 h-9"
  } else if (size === "lg") {
    sizeClasses = "text-base px-8 py-3 h-11"
  } else if (size === "icon") {
    sizeClasses = "h-10 w-10 p-0"
  } else {
    sizeClasses = "text-sm px-4 py-2 h-10"
  }

  const finalClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()

  return (
    <button
      className={finalClasses}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }