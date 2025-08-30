import * as React from "react"

const Label = React.forwardRef(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none ${className}`.trim()}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }