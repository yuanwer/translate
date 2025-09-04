import * as React from "react"

const Button = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => {
  // 基础尺寸与动效
  let baseClasses = "sm-btn sm-pressable sm-focus-ring text-sm"

  // 变体映射到 Smartisan 风格
  let variantClasses = ""
  if (variant === "default") {
    variantClasses = "sm-btn--primary"
  } else if (variant === "destructive") {
    variantClasses = "sm-btn--danger"
  } else if (variant === "outline") {
    variantClasses = "sm-btn--outline"
  } else if (variant === "secondary") {
    variantClasses = "sm-btn--secondary"
  } else if (variant === "ghost") {
    variantClasses = "sm-btn--ghost"
  }

  const finalClasses = `${baseClasses} ${variantClasses} ${className}`.trim()

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