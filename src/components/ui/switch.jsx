import * as React from "react"

const Switch = React.forwardRef(({ checked = false, onCheckedChange, disabled = false, className = "", ...props }, ref) => {
  const handleChange = (event) => {
    if (disabled) return
    const next = !checked
    onCheckedChange?.(next)
  }

  const baseClasses = `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
    checked ? 'bg-blue-600' : 'bg-gray-300'
  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`.trim()

  const knobClasses = `inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
    checked ? 'translate-x-5' : 'translate-x-1'
  }`.trim()

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


