import * as React from "react"
import { createContext, useContext, useState } from "react"

// Tabs Context
const TabsContext = createContext({})

// Main Tabs Container
const Tabs = ({ defaultValue, value, onValueChange, orientation = "horizontal", className = "", children, ...props }) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  
  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, orientation }}>
      <div 
        className={`${orientation === 'vertical' ? 'flex' : ''} ${className}`} 
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// Tabs List Container
const TabsList = ({ variant = "default", className = "", children, ...props }) => {
  const { orientation } = useContext(TabsContext)
  
  let baseClasses = "inline-flex items-center justify-start"
  
  // Variant styles
  let variantClasses = ""
  if (variant === "default") {
    variantClasses = "bg-gray-100 p-1 rounded-lg"
  } else if (variant === "rounded") {
    variantClasses = "gap-2"
  } else if (variant === "underline") {
    variantClasses = "gap-1 px-2 border-b border-gray-200"
  } else if (variant === "pills") {
    variantClasses = "gap-1 p-1 bg-gray-50 rounded-lg"
  }

  // Orientation styles
  let orientationClasses = ""
  if (orientation === "vertical") {
    orientationClasses = "flex-col space-y-1"
  } else {
    orientationClasses = orientation === "horizontal" ? "flex-row" : ""
  }

  const finalClasses = `${baseClasses} ${variantClasses} ${orientationClasses} ${className}`.trim()

  return (
    <div 
      className={finalClasses}
      role="tablist"
      {...props}
    >
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { ...child.props, variant })
          : child
      )}
    </div>
  )
}

// Individual Tab Trigger
const TabsTrigger = ({ 
  value, 
  variant = "default",
  icon,
  disabled = false,
  className = "", 
  children, 
  ...props 
}) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isActive = selectedValue === value

  let baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer focus:outline-none"
  
  // Fixed size styles (统一默认尺寸)
  const sizeClasses = "text-sm px-4 py-2 gap-2 h-10"

  // Variant styles
  let variantClasses = ""
  let activeClasses = ""
  let hoverClasses = ""

  if (variant === "default") {
    variantClasses = "rounded-md"
    activeClasses = isActive ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
    hoverClasses = !isActive ? "hover:text-gray-800 hover:bg-gray-50" : ""
  } else if (variant === "rounded") {
    variantClasses = "rounded-full"
    activeClasses = isActive ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600"
    hoverClasses = !isActive ? "hover:bg-gray-200 hover:text-gray-800" : ""
  } else if (variant === "underline") {
    variantClasses = "relative rounded-t-md"
    activeClasses = isActive ? "text-blue-600" : "text-gray-600"
    hoverClasses = "hover:bg-gray-50 hover:text-gray-800"
  } else if (variant === "pills") {
    variantClasses = "rounded-md"
    activeClasses = isActive ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-600"
    hoverClasses = !isActive ? "hover:text-gray-800 hover:bg-white" : ""
  }

  // Disabled styles
  let disabledClasses = ""
  if (disabled) {
    disabledClasses = "opacity-50 cursor-not-allowed pointer-events-none"
    hoverClasses = ""
  }

  const finalClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${activeClasses} ${hoverClasses} ${disabledClasses} ${className}`.trim()

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={finalClasses}
      onClick={() => !disabled && onValueChange(value)}
      {...props}
    >
      {icon && <i className={`${icon} text-xs`}></i>}
      {children}
    </button>
  )
}

// Tab Content Panel
const TabsContent = ({ value, className = "", children, ...props }) => {
  const { value: selectedValue } = useContext(TabsContext)
  const isActive = selectedValue === value

  if (!isActive) return null

  return (
    <div
      className={className}
      role="tabpanel"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  )
}

// Export all components
export { Tabs, TabsList, TabsTrigger, TabsContent }

// Export default for convenience
export default {
  Root: Tabs,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent
}