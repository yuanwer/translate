import * as React from "react"

const Alert = React.forwardRef(({ className = "", variant = "default", children, ...props }, ref) => {
  let variantClasses = ""
  if (variant === "destructive") {
    variantClasses = "sm-alert sm-alert--danger"
  } else {
    variantClasses = "sm-alert sm-alert--info"
  }

  // 规范第一个图标子元素的垂直居中表现
  const childArray = React.Children.toArray(children)
  if (childArray.length > 0 && React.isValidElement(childArray[0]) && childArray[0].type === 'i') {
    const first = childArray[0]
    childArray[0] = React.cloneElement(first, {
      className: `${first.props.className || ''} text-[14px] leading-none`.trim()
    })
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full ${variantClasses} ${className}`.trim()}
      {...props}
    >
      <div className="flex items-center gap-2">
        {childArray}
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
    className={`text-sm leading-5 ${className}`.trim()}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }