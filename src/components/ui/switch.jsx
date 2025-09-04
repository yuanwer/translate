import * as React from "react"

const Switch = React.forwardRef(({ checked = false, onCheckedChange, disabled = false, className = "", ...props }, ref) => {
  const handleChange = (event) => {
    if (disabled) return
    const next = !checked
    onCheckedChange?.(next)
  }

  const baseClasses = `sm-switch ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`.trim()

  const knobClasses = `sm-switch__knob`.trim()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={handleChange}
      className={`${baseClasses} ${className}`.trim()}
      ref={ref}
      {...props}
    >
      <span className="sr-only">toggle</span>
      <span className={knobClasses} />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }


